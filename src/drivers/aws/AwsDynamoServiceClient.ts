/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DynamoDBClient,
  CreateTableCommand,
  ExecuteStatementCommand as OriginalExecuteStatementCommand,
  ExecuteStatementCommandInput as OriginalExecuteStatementCommandInput,
  ExecuteStatementCommandOutput as OriginalExecuteStatementCommandOutput,
  QueryCommand as OriginalQueryCommand,
  QueryCommandInput as OriginalQueryCommandInput,
  QueryCommandOutput as OriginalQueryCommandOutput,
  ListTablesCommand,
  DescribeTableCommand,
  TableDescription,
  CreateTableCommandInput,
  AttributeValue,
  ScanCommand as OriginalScanCommand,
  ScanCommandInput as OriginalScanCommandInput,
  ScanCommandOutput as OriginalScanCommandOutput,
  DescribeTimeToLiveCommand,
  TimeToLiveDescription,
  DescribeContributorInsightsCommand,
  ContributorInsightsStatus,
  ContributorInsightsMode,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DeleteCommandInput,
  DynamoDBDocumentClient,
  ExecuteStatementCommand,
  ExecuteStatementCommandInput,
  GetCommand,
  GetCommandInput,
  NativeAttributeValue,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import {
  createRdhKey,
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
  toNum,
} from '@l-v-yonsama/rdh';
import { plural } from 'pluralize';
import {
  AwsDatabase,
  DbDynamoTable,
  DbDynamoTableColumn,
} from '../../resource';
import {
  AwsServiceType,
  ConnectionSetting,
  parseDynamoAttrType,
  QStatement,
  QueryParams,
  TTLDesc,
} from '../../types';
import { setRdhMetaAndStatement } from '../../utils';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { AwsServiceClient } from './AwsServiceClient';
import { parseQuery } from '../../helpers';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';
import {
  aggregateConsumedCapacity,
  DynamoDbExecutionMeta,
  DynamoDbExecutionMetaTracker,
} from '../providers/performance/dynamoDbCapacity';
import { DynamoDbCapacityBreakdown } from '../../types/drivers/performance/DynamoDbPerformanceTuningContext';
import { buildDynamoDbRdhSummaryInfo } from './dynamoDbRdhSummary';

export type QueryItemsAtClientInputParams = OriginalQueryCommandInput;
export type ScanItemsAtClientInputParams = OriginalScanCommandInput;

type ScanPage<TItem, TKey> = {
  Items?: TItem[];
  LastEvaluatedKey?: TKey;
  Count?: number;
  ScannedCount?: number;
  ConsumedCapacity?: OriginalScanCommandOutput['ConsumedCapacity'];
  $metadata?: OriginalScanCommandOutput['$metadata'];
};

type CollectScanItemsParams<TItem, TKey> = {
  limit?: number;
  exclusiveStartKey?: TKey;
  fetchPage: (
    remainingLimit: number | undefined,
    exclusiveStartKey: TKey | undefined,
  ) => Promise<ScanPage<TItem, TKey> | undefined>;
};

export type TableDescWithExtraAttrs = TableDescription & {
  ExtraItems?: { name: string; value: AttributeValue }[];
  ttl?: TTLDesc;
};

// §7.4's hard cap on Run Observed Read - both the default and the ceiling a
// caller's own maxEvaluatedItems is clamped to. Not configurable past this
// from any caller.
export const DYNAMODB_OBSERVED_READ_MAX_ITEMS = 100;

export type DynamoDbObservedReadResult = {
  returnedItemCount: number;
  // Only ever set for a native Query observation - PartiQL's
  // ExecuteStatement response has no ScannedCount field (never estimated).
  scannedItemCount?: number;
  hasMorePages: boolean;
  capacityBreakdown?: DynamoDbCapacityBreakdown;
  clientElapsedTimeMs: number;
  requestCount: 1;
  retryCount: number;
};

// Races `promise` against a plain timer so a caller-specified timeoutMs is
// enforced regardless of whether the underlying SDK request handler honors
// a per-call request-timeout option. Does not abort the underlying request
// itself - callers that also pass an AbortSignal get that cancellation
// semantics separately, from the SDK's own abortSignal support.
function withTimeout<T>(promise: Promise<T>, timeoutMs: number | undefined): Promise<T> {
  if (!timeoutMs) return promise;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Run Observed Read timed out.')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
export class AwsDynamoServiceClient extends AwsServiceClient {
  client: DynamoDBClient;
  docClient: DynamoDBDocumentClient;
  private interrupted = false;

  constructor(
    conRes: ConnectionSetting,
    config: ClientConfigType,
    awsDriver: AwsDriver,
  ) {
    super(conRes, config, awsDriver);
  }

  async connectSub(): Promise<string> {
    // const config: DynamoDBClientConfig = {
    //   ...this.config,
    // };
    this.client = new DynamoDBClient(this.config);
    this.docClient = DynamoDBDocumentClient.from(this.client);
    this.interrupted = false;
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.client) {
      await this.listTableNames(1);
    }
  }

  async kill(): Promise<string> {
    this.interrupted = true;
    return '';
  }

  async listTableNames(limit?: number): Promise<string[]> {
    let lastEvaluatedTableName: string | undefined = undefined;

    const tableNames: string[] = [];
    do {
      const command = new ListTablesCommand({
        ExclusiveStartTableName: lastEvaluatedTableName,
        Limit: Math.min(100, limit ?? 1),
      });

      const response = await this.client.send(command);
      lastEvaluatedTableName = response.LastEvaluatedTableName;
      // console.log(response);
      tableNames.push(...response.TableNames);
      if (limit && tableNames.length >= limit) {
        break;
      }
    } while (lastEvaluatedTableName);
    return tableNames;
  }

  async count(tableName: string): Promise<number | undefined> {
    const res = await this.client.send(
      new DescribeTableCommand({
        TableName: tableName,
      }),
    );
    return res.Table.ItemCount;
  }

  // Standalone Describe* helpers for the DynamoDB performance tuning
  // static collection sequence (§7.1 steps 4/6) - deliberately separate
  // from listTables()'s own inline DescribeTable/DescribeTimeToLive calls
  // (used for the resource-tree/schema-load path) rather than a shared
  // refactor, so neither path can regress the other. None of these read
  // item data.

  async describeTable(tableName: string): Promise<TableDescription | undefined> {
    const res = await this.client.send(new DescribeTableCommand({ TableName: tableName }));
    return res.Table;
  }

  async describeTimeToLive(tableName: string): Promise<TimeToLiveDescription | undefined> {
    const res = await this.client.send(new DescribeTimeToLiveCommand({ TableName: tableName }));
    return res.TimeToLiveDescription;
  }

  // Contributor Insights is only ever enabled per-table or per-GSI, never
  // per-LSI (AWS API constraint - omit indexName for the table itself). A
  // table/index with it never enabled still responds successfully with
  // ContributorInsightsStatus: 'DISABLED', not an exception - that is the
  // common case, not a collection failure. v1 only ever reads this status/
  // mode summary, never a key report (§4's "Contributor Insights の key 値
  // は機微情報になり得る").
  async describeContributorInsights(
    tableName: string,
    indexName?: string,
  ): Promise<{ status?: ContributorInsightsStatus; mode?: ContributorInsightsMode }> {
    const res = await this.client.send(
      new DescribeContributorInsightsCommand({ TableName: tableName, IndexName: indexName }),
    );
    return { status: res.ContributorInsightsStatus, mode: res.ContributorInsightsMode };
  }

  async listTables(): Promise<TableDescWithExtraAttrs[]> {
    let tableNames = await this.listTableNames();
    tableNames = tableNames.filter((it) => this.acceptResource(it));
    const tableList: TableDescWithExtraAttrs[] = [];
    await Promise.all(
      tableNames.map(async (TableName) => {
        const res = await this.client.send(
          new DescribeTableCommand({
            TableName,
          }),
        );
        if (res.Table) {
          const tableDef: TableDescWithExtraAttrs = res.Table;
          tableList.push(tableDef);
          if (res.Table?.TableStatus === 'ACTIVE') {
            const res2 = await this.client.send(
              new OriginalScanCommand({
                TableName,
                Limit: 1,
              }),
            );
            if (res2.Items?.length > 0) {
              const item0 = res2.Items[0];
              tableDef.ExtraItems = Object.keys(item0).map((name) => ({
                name,
                value: item0[name],
              }));
            }
            const res3 = await this.client.send(
              new DescribeTimeToLiveCommand({
                TableName,
              }),
            );
            if (
              res3.TimeToLiveDescription &&
              res3.TimeToLiveDescription.TimeToLiveStatus
            ) {
              const { TimeToLiveStatus, AttributeName } =
                res3.TimeToLiveDescription;
              tableDef.ttl = {
                TimeToLiveStatus,
                AttributeName,
              };
            }
          }
        }
      }),
    );
    return tableList;
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }

    const dbDatabase = new AwsDatabase('DynamoDB', AwsServiceType.DynamoDB);

    try {
      const tables = await this.listTables();

      for (const table of tables) {
        const dynamoTable = new DbDynamoTable(table.TableName, {
          CreationDateTime: table.CreationDateTime,
          TableStatus: table.TableStatus,
          ReadCapacityUnits: table.ProvisionedThroughput?.ReadCapacityUnits,
          WriteCapacityUnits: table.ProvisionedThroughput?.WriteCapacityUnits,
          TableSizeBytes: table.TableSizeBytes,
          ItemCount: table.ItemCount,
          TableArn: table.TableArn,
          BillingMode: table.BillingModeSummary?.BillingMode,
          OnDemandMaxReadRequestUnits: table.OnDemandThroughput?.MaxReadRequestUnits,
          OnDemandMaxWriteRequestUnits: table.OnDemandThroughput?.MaxWriteRequestUnits,
          ttl: table.ttl,
          lsi:
            table.LocalSecondaryIndexes?.map((it) => {
              return {
                IndexName: it.IndexName,
                KeySchema: it.KeySchema,
                IndexSizeBytes: it.IndexSizeBytes,
                ItemCount: it.ItemCount,
                IndexArn: it.IndexArn,
                Projection: it.Projection,
              };
            }) ?? [],
          gsi:
            table.GlobalSecondaryIndexes?.map((it) => {
              return {
                IndexName: it.IndexName,
                KeySchema: it.KeySchema,
                IndexStatus: it.IndexStatus,
                IndexSizeBytes: it.IndexSizeBytes,
                ItemCount: it.ItemCount,
                IndexArn: it.IndexArn,
                Projection: it.Projection,
                ReadCapacityUnits: it.ProvisionedThroughput?.ReadCapacityUnits,
                WriteCapacityUnits: it.ProvisionedThroughput?.WriteCapacityUnits,
                OnDemandMaxReadRequestUnits: it.OnDemandThroughput?.MaxReadRequestUnits,
                OnDemandMaxWriteRequestUnits: it.OnDemandThroughput?.MaxWriteRequestUnits,
              };
            }) ?? [],
        });
        const cols =
          table.AttributeDefinitions?.map((attr) => {
            const pk = table.KeySchema?.some(
              (it) =>
                it.AttributeName === attr.AttributeName &&
                it.KeyType === 'HASH',
            );
            const sk = table.KeySchema?.some(
              (it) =>
                it.AttributeName === attr.AttributeName &&
                it.KeyType === 'RANGE',
            );
            return new DbDynamoTableColumn(
              attr.AttributeName,
              attr.AttributeType,
              pk,
              sk,
            );
          }) ?? [];
        cols
          .sort((a, b) => {
            const n = (it): number => (it.pk ? -2 : it.sk ? -1 : 0);
            const an = n(a);
            const bn = n(b);
            if (an < bn) {
              return -1;
            }
            if (an > bn) {
              return 1;
            }

            return a.name.localeCompare(b.name);
          })
          .forEach((it) => dynamoTable.addChild(it));
        table.ExtraItems?.forEach((item) => {
          if (!dynamoTable.getChildByName(item.name)) {
            const attrType = Object.keys(item.value)[0];
            dynamoTable.addChild(
              new DbDynamoTableColumn(item.name, attrType, false, false),
            );
          }
        });
        dbDatabase.addChild(dynamoTable);
      }
      dbDatabase.comment = `${tables.length} ${plural('table')}`;
    } catch (e) {
      console.error(e);
      // reject(e);
    }
    return dbDatabase;
  }

  async createTable(params: CreateTableCommandInput): Promise<void> {
    await this.client.send(new CreateTableCommand(params));
  }

  async putItem(params: PutCommandInput): Promise<void> {
    await this.docClient.send(new PutCommand(params));
  }

  async getItem(
    params: GetCommandInput,
  ): Promise<Record<string, AttributeValue>> {
    const { Item } = await this.docClient.send(new GetCommand(params));
    return Item;
  }

  async deleteItem(params: DeleteCommandInput): Promise<void> {
    await this.docClient.send(new DeleteCommand(params));
  }

  async updateItem(
    params: Omit<UpdateCommandInput, 'ReturnConsumedCapacity'>,
  ): Promise<{
    Attributes?: Record<string, AttributeValue>;
    CapacityUnits?: number;
  }> {
    const { Attributes, ConsumedCapacity } = await this.docClient.send(
      new UpdateCommand({
        ...params,
        ReturnConsumedCapacity: 'TOTAL',
      }),
    );
    return {
      Attributes,
      CapacityUnits: ConsumedCapacity?.CapacityUnits,
    };
  }

  private async collectScanItems<TItem, TKey>({
    limit,
    exclusiveStartKey,
    fetchPage,
  }: CollectScanItemsParams<TItem, TKey>): Promise<{
    items: TItem[];
    lastEvaluatedKey?: TKey;
    meta: DynamoDbExecutionMeta;
  }> {
    let lastEvaluatedKey = exclusiveStartKey;
    const items: TItem[] = [];
    const tracker = new DynamoDbExecutionMetaTracker();

    do {
      const remainingLimit = limit ? limit - items.length : undefined;
      const response = await fetchPage(remainingLimit, lastEvaluatedKey);
      if (!response) {
        break;
      }

      tracker.recordResponse(response, { trackNativeCounts: true });
      lastEvaluatedKey = response.LastEvaluatedKey;
      items.push(...(response.Items ?? []));
      if (limit && items.length >= limit) {
        break;
      }
    } while (lastEvaluatedKey);

    return {
      items,
      lastEvaluatedKey,
      meta: tracker.build(!!lastEvaluatedKey),
    };
  }

  async scanItems(params: ScanCommandInput): Promise<{
    Items: ScanCommandOutput['Items'];
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    // undefined iff no response ever reported ConsumedCapacity (Capacity
    // untracked/untracked-mode requests) - distinct from an explicit 0 -
    // see dynamoDbCapacity.ts's DynamoDbExecutionMetaTracker, the single
    // source of truth this is now sourced from (design doc §7.2).
    CapacityUnits: number | undefined;
    meta: DynamoDbExecutionMeta;
  }> {
    const { items, lastEvaluatedKey, meta } = await this.collectScanItems<
      Record<string, NativeAttributeValue>,
      Record<string, NativeAttributeValue>
    >({
      limit: params.Limit,
      exclusiveStartKey: params.ExclusiveStartKey,
      fetchPage: async (remainingLimit, exclusiveStartKey) => {
        return await this.docClient.send(
          new ScanCommand({
            ...params,
            Limit: remainingLimit,
            ExclusiveStartKey: exclusiveStartKey,
            // INDEXES is a strict superset of TOTAL's response (same
            // CapacityUnits/ReadCapacityUnits/WriteCapacityUnits fields, plus a
            // per-table/per-index breakdown) at no extra cost - see
            // dynamoDbCapacity.ts's DynamoDbExecutionMetaTracker, which is what
            // actually makes use of the added breakdown.
            ReturnConsumedCapacity: 'INDEXES',
          }),
        );
      },
    });

    return {
      Items: items,
      LastEvaluatedKey: lastEvaluatedKey,
      Count: items.length,
      CapacityUnits: meta.capacityBreakdown?.capacityUnits,
      meta,
    };
  }

  async queryItems(params: QueryCommandInput): Promise<{
    Items: QueryCommandOutput['Items'];
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    // See scanItems() above: undefined iff Capacity was never reported.
    CapacityUnits: number | undefined;
    meta: DynamoDbExecutionMeta;
  }> {
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    if (params.ExclusiveStartKey) {
      LastEvaluatedKey = params.ExclusiveStartKey;
    }

    const Items: QueryCommandOutput['Items'] = [];
    const tracker = new DynamoDbExecutionMetaTracker();
    do {
      const command = new QueryCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        ExclusiveStartKey: LastEvaluatedKey ? LastEvaluatedKey : undefined,
        ReturnConsumedCapacity: 'INDEXES',
      });

      const response = await this.docClient.send(command);
      tracker.recordResponse(response, { trackNativeCounts: true });
      LastEvaluatedKey = response.LastEvaluatedKey;
      Items.push(...response.Items);
      if (params.Limit && Items.length >= params.Limit) {
        break;
      }
    } while (LastEvaluatedKey);

    const meta = tracker.build(!!LastEvaluatedKey);
    return {
      Items,
      LastEvaluatedKey,
      Count: Items.length,
      CapacityUnits: meta.capacityBreakdown?.capacityUnits,
      meta,
    };
  }

  async queryItemsAtClient(
    params: OriginalQueryCommandInput,
  ): Promise<ResultSetData> {
    const { TableName, IndexName } = params;

    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    const qst: QStatement = {
      ast: { type: 'select' },
      names: { tableName: TableName },
    };
    const dbTable = this.getDbTable(qst);

    const Items: OriginalQueryCommandOutput['Items'] = [];

    const allAttributeTypes = new Map<string, GeneralColumnType>();
    const startTime = new Date().getTime();
    const tracker = new DynamoDbExecutionMetaTracker();
    do {
      const command = new OriginalQueryCommand({
        ...params,
        TableName,
        IndexName,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        ExclusiveStartKey: LastEvaluatedKey ? LastEvaluatedKey : undefined,
        ReturnConsumedCapacity: 'INDEXES',
      });

      try {
        const response = await this.client.send(command);
        tracker.recordResponse(response, { trackNativeCounts: true });
        LastEvaluatedKey = response.LastEvaluatedKey;
        Items.push(...response.Items);
        response.Items.forEach((item) => {
          Object.keys(item)
            .filter((it) => !allAttributeTypes.has(it))
            .forEach((it) => {
              const colType = this.parseDynamoAttrTypeByNameAndItem(it, item);
              allAttributeTypes.set(it, colType);
            });
        });
        if (Items.length >= params.Limit) {
          break;
        }
      } catch (e) {
        if (e.name === 'ResourceNotFoundException') {
          // create empty ResultSetData
          break;
        }
        // re-throw
        throw e;
      }
    } while (LastEvaluatedKey);
    const elapsedTimeMilli = new Date().getTime() - startTime;

    const rs = this.itemsToResultSetData({
      Count: Items.length,
      Items,
      params: {
        sql: '',
        conditions: {},
        meta: {
          type: 'select',
          tableName: TableName,
        },
      },
      qst,
      elapsedTimeMilli,
      dbTable,
      allAttributeTypes,
      meta: tracker.build(!!LastEvaluatedKey),
    });
    rs.meta.queryInput = JSON.stringify(params, null, 2);
    return rs;
  }

  async scanItemsAtClient(
    params: OriginalScanCommandInput,
  ): Promise<ResultSetData> {
    const { TableName } = params;
    const qst: QStatement = {
      ast: { type: 'select' },
      names: { tableName: TableName },
    };
    const dbTable = this.getDbTable(qst);
    const startTime = new Date().getTime();
    const { items: Items, meta } = await this.collectScanItems<
      Record<string, AttributeValue>,
      Record<string, AttributeValue>
    >({
      limit: params.Limit,
      exclusiveStartKey: params.ExclusiveStartKey,
      fetchPage: async (remainingLimit, exclusiveStartKey) => {
        try {
          return await this.client.send(
            new OriginalScanCommand({
              ...params,
              TableName,
              Limit: remainingLimit,
              ExclusiveStartKey: exclusiveStartKey,
              ReturnConsumedCapacity: 'INDEXES',
            }),
          );
        } catch (e) {
          if (e.name === 'ResourceNotFoundException') {
            return undefined;
          }
          throw e;
        }
      },
    });

    const allAttributeTypes = new Map<string, GeneralColumnType>();
    Items.forEach((item) => {
      Object.keys(item)
        .filter((it) => !allAttributeTypes.has(it))
        .forEach((it) => {
          const colType = this.parseDynamoAttrTypeByNameAndItem(it, item);
          allAttributeTypes.set(it, colType);
        });
    });

    const elapsedTimeMilli = new Date().getTime() - startTime;
    const rs = this.itemsToResultSetData({
      Count: Items.length,
      Items,
      params: {
        sql: '',
        conditions: {},
        meta: {
          type: 'select',
          tableName: TableName,
        },
      },
      qst,
      elapsedTimeMilli,
      dbTable,
      allAttributeTypes,
      meta,
    });
    rs.meta.queryInput = JSON.stringify(params, null, 2);
    return rs;
  }

  async executeStatementAtDocClient(
    params: Omit<ExecuteStatementCommandInput, 'ReturnConsumedCapacity'>,
  ): Promise<{
    Items: QueryCommandOutput['Items'];
    NextToken?: string;
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    // See scanItems() above: undefined iff Capacity was never reported.
    CapacityUnits: number | undefined;
    extra: {
      allAttributeNames: string[];
    };
    meta: DynamoDbExecutionMeta;
  }> {
    this.interrupted = false;
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    let NextToken = params.NextToken;
    const allAttributeNames = new Set<string>();

    const Items: QueryCommandOutput['Items'] = [];
    const tracker = new DynamoDbExecutionMetaTracker();
    do {
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }
      const command = new ExecuteStatementCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        NextToken,
        ReturnConsumedCapacity: 'INDEXES',
      });

      const response = await this.docClient.send(command);
      // PartiQL's ExecuteStatement response has no Count/ScannedCount field
      // at all (an AWS API fact, not a collection gap) - trackNativeCounts
      // is omitted here deliberately, never inferred from Items.length.
      tracker.recordResponse(response);
      LastEvaluatedKey = response.LastEvaluatedKey;
      NextToken = response.NextToken;
      Items.push(...response.Items);
      response.Items.forEach((item) => {
        Object.keys(item)
          .filter((it) => !allAttributeNames.has(it))
          .forEach((it) => {
            allAttributeNames.add(it);
          });
      });
      if (params.Limit && Items.length >= params.Limit) {
        break;
      }
    } while (LastEvaluatedKey || NextToken);

    const meta = tracker.build(!!(LastEvaluatedKey || NextToken));
    return {
      Items,
      LastEvaluatedKey,
      NextToken,
      Count: Items.length,
      CapacityUnits: meta.capacityBreakdown?.capacityUnits,
      extra: {
        allAttributeNames: [...allAttributeNames],
      },
      meta,
    };
  }

  async executeStatementAtClient(
    params: OriginalExecuteStatementCommandInput,
  ): Promise<{
    Items: OriginalExecuteStatementCommandOutput['Items'];
    NextToken?: string;
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    // See scanItems() above: undefined iff Capacity was never reported.
    CapacityUnits: number | undefined;
    extra: {
      allAttributeTypes: Map<string, GeneralColumnType>;
    };
    meta: DynamoDbExecutionMeta;
  }> {
    this.interrupted = false;
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    let NextToken = params.NextToken;
    const allAttributeTypes = new Map<string, GeneralColumnType>();

    const Items: OriginalExecuteStatementCommandOutput['Items'] = [];
    const tracker = new DynamoDbExecutionMetaTracker();
    do {
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }

      const command = new OriginalExecuteStatementCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        NextToken,
        ReturnConsumedCapacity: 'INDEXES',
      });

      const response = await this.client.send(command);
      // Same rule as executeStatementAtDocClient above: PartiQL responses
      // never carry Count/ScannedCount, so trackNativeCounts is not used.
      tracker.recordResponse(response);
      LastEvaluatedKey = response.LastEvaluatedKey;
      NextToken = response.NextToken;
      Items.push(...response.Items);
      response.Items.forEach((item) => {
        Object.keys(item)
          .filter((it) => !allAttributeTypes.has(it))
          .forEach((it) => {
            const colType = this.parseDynamoAttrTypeByNameAndItem(it, item);
            allAttributeTypes.set(it, colType);
          });
      });
      if (params.Limit && Items.length >= params.Limit) {
        break;
      }
    } while (LastEvaluatedKey || NextToken);

    const meta = tracker.build(!!(LastEvaluatedKey || NextToken));
    return {
      Items,
      LastEvaluatedKey,
      NextToken,
      Count: Items.length,
      CapacityUnits: meta.capacityBreakdown?.capacityUnits,
      extra: {
        allAttributeTypes,
      },
      meta,
    };
  }

  async requestPartiql(params: QueryParams): Promise<ResultSetData> {
    const { sql, conditions } = params;
    const rdb: ResultSetDataBuilder | undefined = undefined;
    let qst: QStatement | undefined = undefined;
    let dbTable: DbDynamoTable | undefined = undefined;

    if (conditions?.rawQueries !== true) {
      qst = parseQuery(sql);
      if (
        qst &&
        qst.ast?.type === 'select' &&
        qst.names &&
        qst.names.schemaName
      ) {
        // for table.index
        qst.names.indexName = qst.names.tableName;
        qst.names.tableName = qst.names.schemaName;
        qst.names.schemaName = undefined;
      }
      dbTable = this.getDbTable(qst);
      if (qst?.ast?.type) {
        if (!params.meta) {
          params.meta = {};
        }
        params.meta.type = qst?.ast?.type;
      }
    }

    let Statement = sql;
    let Limit: number | undefined = undefined;
    if (
      qst?.ast?.type === 'select' &&
      sql.toLocaleLowerCase().indexOf('limit')
    ) {
      const r = sql.match(/\bLIMIT\s+(\d+)/i);
      if (r && r.length >= 2) {
        Limit = toNum(r[1]);
        Statement = sql.replace(/\bLIMIT\s+\d+/i, '');
      }
    }
    const binds = conditions?.binds ?? [];
    const startTime = new Date().getTime();
    const input: ExecuteStatementCommandInput = {
      Statement,
      Limit,
    };

    // 1 validation error detected: Value '[]' at 'parameters' failed to satisfy constraint: Member must have length greater than or equal to 1
    if (binds && binds.length > 0) {
      input.Parameters = marshall(binds);
      // console.log('input.Parameters=', input.Parameters);
    }

    const {
      Count,
      Items,
      extra: { allAttributeTypes },
      meta,
    } = await this.executeStatementAtClient(input);

    const elapsedTimeMilli = new Date().getTime() - startTime;

    return this.itemsToResultSetData({
      Count,
      Items,
      params,
      qst,
      elapsedTimeMilli,
      dbTable,
      allAttributeTypes,
      meta,
    });
  }

  // ---------------------------------------------------------------------
  // Run Observed Read (§7.4) - a single, explicitly-confirmed, capacity-
  // consuming read used only by the DynamoDB performance tuning feature.
  // Both methods below share every constraint in the design doc's list:
  // exactly one API response (never a pagination loop), the caller's own
  // ExclusiveStartKey/NextToken is always discarded (this always observes
  // the *first* page), maxEvaluatedItems is clamped to
  // DYNAMODB_OBSERVED_READ_MAX_ITEMS, ReturnConsumedCapacity: 'INDEXES',
  // and the return type never carries Item bodies, bind values, or
  // LastEvaluatedKey/NextToken - only counts/capacity/timing metadata a
  // Context is allowed to keep.
  // ---------------------------------------------------------------------

  async observeNativeQueryRead(params: {
    input: OriginalQueryCommandInput;
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResult> {
    const limit = Math.min(params.maxEvaluatedItems ?? DYNAMODB_OBSERVED_READ_MAX_ITEMS, DYNAMODB_OBSERVED_READ_MAX_ITEMS);
    const startTime = Date.now();
    const command = new OriginalQueryCommand({
      ...params.input,
      Limit: limit,
      ExclusiveStartKey: undefined,
      ReturnConsumedCapacity: 'INDEXES',
    });
    const response = await withTimeout(
      this.client.send(command, { abortSignal: params.signal }),
      params.timeoutMs,
    );
    return {
      returnedItemCount: response.Count ?? response.Items?.length ?? 0,
      scannedItemCount: response.ScannedCount,
      hasMorePages: !!response.LastEvaluatedKey,
      capacityBreakdown: aggregateConsumedCapacity([response.ConsumedCapacity]),
      clientElapsedTimeMs: Date.now() - startTime,
      requestCount: 1,
      retryCount: Math.max(0, (response.$metadata?.attempts ?? 1) - 1),
    };
  }

  async observePartiqlRead(params: {
    statement: string;
    parameters?: unknown[];
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResult> {
    // Defense in depth: the Provider is the primary gate on
    // observationEligibility/write-statement rejection (§7.1/§7.4), but
    // this is the last line of code before capacity is actually consumed -
    // never trust a caller's classification alone for that.
    const qst = parseQuery(params.statement);
    if (!qst || qst.ast?.type !== 'select') {
      throw new Error('Run Observed Read only supports a single SELECT statement.');
    }

    const limit = Math.min(params.maxEvaluatedItems ?? DYNAMODB_OBSERVED_READ_MAX_ITEMS, DYNAMODB_OBSERVED_READ_MAX_ITEMS);
    const startTime = Date.now();
    const input: OriginalExecuteStatementCommandInput = {
      Statement: params.statement,
      Limit: limit,
      ReturnConsumedCapacity: 'INDEXES',
    };
    if (params.parameters && params.parameters.length > 0) {
      input.Parameters = marshall(params.parameters);
    }
    const response = await withTimeout(
      this.client.send(new OriginalExecuteStatementCommand(input), { abortSignal: params.signal }),
      params.timeoutMs,
    );
    return {
      returnedItemCount: response.Items?.length ?? 0,
      scannedItemCount: undefined,
      hasMorePages: !!(response.LastEvaluatedKey || response.NextToken),
      capacityBreakdown: aggregateConsumedCapacity([response.ConsumedCapacity]),
      clientElapsedTimeMs: Date.now() - startTime,
      requestCount: 1,
      retryCount: Math.max(0, (response.$metadata?.attempts ?? 1) - 1),
    };
  }

  // Classifies a PartiQL statement's leading keyword without depending on
  // parseQuery()/qst - qst is unavailable both when the caller opts out of
  // parsing (conditions.rawQueries === true, e.g. an RDB-shared performance-
  // tuning caller reusing QueryParams.conditions) and when parsing itself
  // fails, and in neither case may a write be silently misclassified as a
  // SELECT (design doc review 2026-08-25, round 2 - round 1's fix only
  // covered the "operation stays undefined" symptom, not this cause of it).
  private static classifyPartiqlOperationFromText(
    sql: string,
  ): 'select' | 'insert' | 'update' | 'delete' | undefined {
    // Strips both comment styles the repo's own query parser treats as
    // comments (`--` line comments and `/* ... */` block comments,
    // interleaved in any order) before looking at the leading keyword - a
    // raw DML statement opening with a block comment must classify the
    // same as one with no comment at all (2026-08-25 review, round 3).
    const withoutLeadingComments = sql.replace(
      /^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/))*\s*/,
      '',
    );
    const m = withoutLeadingComments.match(/^(select|insert|update|delete)\b/i);
    return m ? (m[1].toLowerCase() as 'select' | 'insert' | 'update' | 'delete') : undefined;
  }

  private itemsToResultSetData({
    Count,
    Items,
    params,
    qst,
    elapsedTimeMilli,
    dbTable,
    allAttributeTypes,
    meta,
  }: {
    Count: number;
    Items?: Record<string, AttributeValue>[];
    params: QueryParams;
    qst: QStatement;
    elapsedTimeMilli: number;
    dbTable: DbDynamoTable;
    allAttributeTypes: Map<string, GeneralColumnType>;
    // Optional: absent for callers that don't (yet) track it. Feeds
    // RdhSummary's additive DynamoDB fields (rdh Phase 1) so SQL History
    // retains scanned/request/retry/capacity-breakdown evidence per §7.5 -
    // see AwsDynamoServiceClient.ts's callers of this method. Capacity
    // (undefined vs. explicit 0) is sourced exclusively from
    // meta.capacityBreakdown - see design doc §7.2 - never from a
    // caller-passed capacityUnits, so there is exactly one place that
    // decides "never reported" vs. "reported as 0".
    meta?: DynamoDbExecutionMeta;
  }): ResultSetData {
    let rdb: ResultSetDataBuilder | undefined = undefined;

    const record = Count === 0 ? {} : Items[0];
    const pkAndSk = dbTable?.getPkAndSkByIndex(qst?.names?.indexName);

    const createRdhKeyFromName = (name: string): RdhKey => {
      const col = dbTable?.getChildByName(name);
      const type = col?.attrType
        ? parseDynamoAttrType(col.attrType)
        : allAttributeTypes.get(name);
      let comment = '';
      let required = false;
      if (col?.name === pkAndSk?.pk) {
        comment = '(pk)';
        required = true;
      }
      if (col?.name === pkAndSk?.sk) {
        comment = '(sk)';
        required = true;
      }
      return createRdhKey({
        name,
        type,
        required,
        comment,
      });
    };

    const keys = Object.keys(record).map((it) => createRdhKeyFromName(it));

    for (const [attrName, colType] of allAttributeTypes) {
      if (!keys.map((key) => key.name).includes(attrName)) {
        keys.push(
          createRdhKey({
            name: attrName,
            type: colType,
          }),
        );
      }
    }

    if (
      qst?.ast?.type === 'select' &&
      qst?.ast?.columns &&
      qst?.ast?.columns.length === 1
    ) {
      const { expr } = qst.ast.columns[0];
      if (expr.type === 'ref' && expr.name === '*') {
        if (Count === 0 && keys.length === 0) {
          if (pkAndSk?.pk) {
            keys.push(createRdhKeyFromName(pkAndSk?.pk));
          }
          if (pkAndSk?.sk) {
            keys.push(createRdhKeyFromName(pkAndSk?.sk));
          }
        }

        keys.sort((a, b) => {
          const n = (it): number =>
            it.name === pkAndSk?.pk ? -2 : it.name === pkAndSk?.sk ? -1 : 0;
          const an = n(a);
          const bn = n(b);
          if (an < bn) {
            return -1;
          }
          if (an > bn) {
            return 1;
          }

          return a.name.localeCompare(b.name);
        });
      }
    }

    rdb = new ResultSetDataBuilder(keys);
    Items.forEach((item) => {
      const values = unmarshall(item);
      Object.entries(values).forEach(([key, value]) => {
        const attrType = Object.keys(item[key])[0];
        if (attrType === 'SS' || attrType === 'NS' || attrType === 'BS') {
          if (value instanceof Set) {
            values[key] = Array.from(value);
          }
        }
      });
      rdb.addRow(values);
    });

    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      params,
      rdb,
      type: qst?.ast?.type,
      qst,
      dbTable,
    });

    // Built once and fed to both the DynamoDB-specific info formatter and
    // setSummary()'s structured fields (design doc §7.3), so the display
    // text and the structured RdhSummary fields can never disagree.
    //
    // qst is unavailable both for conditions.rawQueries===true and for a
    // parse failure; either way the statement's actual type is still
    // determined from the raw text rather than left undefined, so a raw
    // INSERT/UPDATE/DELETE is not misclassified as a SELECT (design doc
    // review 2026-08-25, round 2).
    const operation =
      qst?.ast?.type ??
      AwsDynamoServiceClient.classifyPartiqlOperationFromText(params.sql);
    // Only a *known* write statement suppresses selectedRows - an
    // operation that still couldn't be determined at all (an unrecognized
    // leading keyword) must not be silently folded into "write": that case
    // is also the only one that can actually report rows, so it keeps the
    // select-style structured fields (2026-08-25 review).
    const isKnownWrite =
      operation === 'insert' || operation === 'update' || operation === 'delete';
    const selectedRows = isKnownWrite ? undefined : rdb.rs.rows.length;
    // DynamoDB's PartiQL response never reports an affected-item count for
    // INSERT/UPDATE/DELETE, so this stays undefined rather than being
    // guessed at (e.g. defaulted to 1) - see design doc review 2026-08-25.
    const affectedRows: number | undefined = undefined;
    const scannedRows = meta?.scannedCount;
    const requestCount = meta?.requestCount;
    const retryCount = meta?.retryCount;
    const capacityUnits = meta?.capacityBreakdown?.capacityUnits;
    const readCapacityUnits = meta?.capacityBreakdown?.readCapacityUnits;
    const writeCapacityUnits = meta?.capacityBreakdown?.writeCapacityUnits;
    const hasMoreRows = meta?.hasMorePages;

    rdb.setSummary({
      info: buildDynamoDbRdhSummaryInfo({
        operation,
        elapsedTimeMilli,
        selectedRows,
        affectedRows,
        scannedRows,
        requestCount,
        retryCount,
        capacityUnits,
        readCapacityUnits,
        writeCapacityUnits,
        hasMoreRows,
      }),
      elapsedTimeMilli,
      selectedRows,
      affectedRows,
      capacityUnits,
      scannedRows,
      requestCount,
      retryCount,
      readCapacityUnits,
      writeCapacityUnits,
      hasMoreRows,
    });
    if (meta?.capacityBreakdown) {
      // Per-table/per-index Capacity is AWS-specific and does not belong in
      // rdh's own RdhSummary type (design doc §11.1) - RdhMeta's open index
      // signature is where a driver stashes vendor-specific detail like
      // this without requiring an rdh change.
      rdb.rs.meta.dynamoDb = { consumedCapacity: meta.capacityBreakdown };
    }
    return rdb.build();
  }

  private getDbTable(qst?: QStatement): DbDynamoTable | undefined {
    const db = this.awsDriver
      .getDbDatabases()
      ?.find(
        (it) =>
          it instanceof AwsDatabase &&
          it.serviceType === AwsServiceType.DynamoDB,
      );
    if (db === undefined) {
      return undefined;
    }

    if (qst === undefined || qst.names === undefined || db === undefined) {
      return undefined;
    }
    const tables = db.findChildren<DbDynamoTable>({
      resourceType: 'DynamoTable',
      keyword: qst.names.tableName,
      recursively: false,
    });
    return tables?.find((it) => it.name === qst.names.tableName);
  }

  protected async closeSub(): Promise<void> {
    this.docClient.destroy();
    this.client.destroy();
    this.interrupted = false;
  }

  protected getServiceName(): string {
    return 'DynamoDB';
  }

  private parseDynamoAttrTypeByNameAndItem(
    name: string,
    item: Record<string, AttributeValue>,
  ): GeneralColumnType {
    const attr = item[name];
    const attrName = Object.keys(attr)[0];
    return parseDynamoAttrType(attrName);
  }
}
