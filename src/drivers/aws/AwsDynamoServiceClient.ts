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
  RdhDynamoDbSummary,
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

// Hard safety cap for a single observed read.
export const DYNAMODB_OBSERVED_READ_MAX_ITEMS = 100;

export type DynamoDbObservedReadResult = {
  returnedItemCount: number;
  // Native Query only; ExecuteStatement has no ScannedCount field.
  scannedItemCount?: number;
  hasMorePages: boolean;
  capacityBreakdown?: DynamoDbCapacityBreakdown;
  clientElapsedTimeMs: number;
  requestCount: number;
  retryCount: number;
};

export const DYNAMODB_COMPLETE_READ_MAX_PAGES = 10;
export const DYNAMODB_COMPLETE_READ_MAX_EVALUATED_ITEMS = 1000;
export const DYNAMODB_COMPLETE_READ_TIMEOUT_MS = 30_000;

// Enforce a caller timeout independently of SDK AbortSignal cancellation.
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number | undefined,
): Promise<T> {
  if (!timeoutMs) return promise;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Run Observed Read timed out.')),
      timeoutMs,
    );
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

  // Metadata helpers never read item data.

  async describeTable(
    tableName: string,
  ): Promise<TableDescription | undefined> {
    const res = await this.client.send(
      new DescribeTableCommand({ TableName: tableName }),
    );
    return res.Table;
  }

  async describeTimeToLive(
    tableName: string,
  ): Promise<TimeToLiveDescription | undefined> {
    const res = await this.client.send(
      new DescribeTimeToLiveCommand({ TableName: tableName }),
    );
    return res.TimeToLiveDescription;
  }

  // Contributor Insights status applies to tables and GSIs; key reports are never read.
  async describeContributorInsights(
    tableName: string,
    indexName?: string,
  ): Promise<{
    status?: ContributorInsightsStatus;
    mode?: ContributorInsightsMode;
  }> {
    const res = await this.client.send(
      new DescribeContributorInsightsCommand({
        TableName: tableName,
        IndexName: indexName,
      }),
    );
    return {
      status: res.ContributorInsightsStatus,
      mode: res.ContributorInsightsMode,
    };
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
          OnDemandMaxReadRequestUnits:
            table.OnDemandThroughput?.MaxReadRequestUnits,
          OnDemandMaxWriteRequestUnits:
            table.OnDemandThroughput?.MaxWriteRequestUnits,
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
                WriteCapacityUnits:
                  it.ProvisionedThroughput?.WriteCapacityUnits,
                OnDemandMaxReadRequestUnits:
                  it.OnDemandThroughput?.MaxReadRequestUnits,
                OnDemandMaxWriteRequestUnits:
                  it.OnDemandThroughput?.MaxWriteRequestUnits,
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
    // Undefined means no response reported capacity; it is distinct from zero.
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
            // INDEXES includes total and per-table/index capacity evidence.
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
    const { items, lastEvaluatedKey, meta } = await this.collectScanItems<
      Record<string, NativeAttributeValue>,
      Record<string, NativeAttributeValue>
    >({
      limit: params.Limit,
      exclusiveStartKey: params.ExclusiveStartKey,
      fetchPage: (remainingLimit, exclusiveStartKey) =>
        this.docClient.send(
          new QueryCommand({
            ...params,
            Limit: remainingLimit,
            ExclusiveStartKey: exclusiveStartKey,
            ReturnConsumedCapacity: 'INDEXES',
          }),
        ),
    });
    return {
      Items: items,
      LastEvaluatedKey: lastEvaluatedKey,
      Count: items.length,
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
          break;
        }
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
      apiOperation: 'Query',
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
      apiOperation: 'Scan',
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
      // PartiQL responses do not expose native Count/ScannedCount evidence.
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
      // PartiQL responses do not expose native Count/ScannedCount evidence.
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
      apiOperation: 'ExecuteStatement',
    });
  }

  // Observed reads return telemetry only and never expose item bodies or pagination keys.

  async observeNativeQueryRead(params: {
    input: OriginalQueryCommandInput;
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResult> {
    const limit = Math.min(
      params.maxEvaluatedItems ?? DYNAMODB_OBSERVED_READ_MAX_ITEMS,
      DYNAMODB_OBSERVED_READ_MAX_ITEMS,
    );
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
    // Recheck SELECT immediately before issuing the capacity-consuming request.
    const qst = parseQuery(params.statement);
    if (!qst || qst.ast?.type !== 'select') {
      throw new Error(
        'Run Observed Read only supports a single SELECT statement.',
      );
    }

    const limit = Math.min(
      params.maxEvaluatedItems ?? DYNAMODB_OBSERVED_READ_MAX_ITEMS,
      DYNAMODB_OBSERVED_READ_MAX_ITEMS,
    );
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
      this.client.send(new OriginalExecuteStatementCommand(input), {
        abortSignal: params.signal,
      }),
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

  async observeNativeQueryReadComplete(params: {
    input: OriginalQueryCommandInput;
    maxPages?: number;
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResult> {
    const maxPages = Math.min(
      params.maxPages ?? DYNAMODB_COMPLETE_READ_MAX_PAGES,
      DYNAMODB_COMPLETE_READ_MAX_PAGES,
    );
    const maxEvaluatedItems = Math.min(
      params.maxEvaluatedItems ?? DYNAMODB_COMPLETE_READ_MAX_EVALUATED_ITEMS,
      DYNAMODB_COMPLETE_READ_MAX_EVALUATED_ITEMS,
    );
    const timeoutMs = Math.min(
      params.timeoutMs ?? DYNAMODB_COMPLETE_READ_TIMEOUT_MS,
      DYNAMODB_COMPLETE_READ_TIMEOUT_MS,
    );
    const startedAt = Date.now();
    let exclusiveStartKey: OriginalQueryCommandInput['ExclusiveStartKey'];
    let returnedItemCount = 0;
    let scannedItemCount = 0;
    let pageCount = 0;
    let hasMorePages = false;
    const tracker = new DynamoDbExecutionMetaTracker();

    do {
      const remainingItems = maxEvaluatedItems - scannedItemCount;
      if (remainingItems <= 0 || pageCount >= maxPages) break;
      const response = await withTimeout(
        this.client.send(
          new OriginalQueryCommand({
            ...params.input,
            Limit: Math.min(DYNAMODB_OBSERVED_READ_MAX_ITEMS, remainingItems),
            ExclusiveStartKey: exclusiveStartKey,
            ReturnConsumedCapacity: 'INDEXES',
          }),
          { abortSignal: params.signal },
        ),
        Math.max(1, timeoutMs - (Date.now() - startedAt)),
      );
      tracker.recordResponse(response, { trackNativeCounts: true });
      pageCount += 1;
      returnedItemCount += response.Count ?? response.Items?.length ?? 0;
      scannedItemCount +=
        response.ScannedCount ?? response.Count ?? response.Items?.length ?? 0;
      exclusiveStartKey = response.LastEvaluatedKey;
      hasMorePages = !!exclusiveStartKey;
    } while (hasMorePages);

    const meta = tracker.build(hasMorePages);
    return {
      returnedItemCount,
      scannedItemCount,
      hasMorePages,
      capacityBreakdown: meta.capacityBreakdown,
      clientElapsedTimeMs: Date.now() - startedAt,
      requestCount: meta.requestCount,
      retryCount: meta.retryCount,
    };
  }

  async observePartiqlReadComplete(params: {
    statement: string;
    parameters?: unknown[];
    maxPages?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): Promise<DynamoDbObservedReadResult> {
    const qst = parseQuery(params.statement);
    if (!qst || qst.ast?.type !== 'select') {
      throw new Error(
        'Complete-result Benchmark only supports a single SELECT statement.',
      );
    }
    const maxPages = Math.min(
      params.maxPages ?? DYNAMODB_COMPLETE_READ_MAX_PAGES,
      DYNAMODB_COMPLETE_READ_MAX_PAGES,
    );
    const timeoutMs = Math.min(
      params.timeoutMs ?? DYNAMODB_COMPLETE_READ_TIMEOUT_MS,
      DYNAMODB_COMPLETE_READ_TIMEOUT_MS,
    );
    const startedAt = Date.now();
    let nextToken: string | undefined;
    let returnedItemCount = 0;
    let pageCount = 0;
    let hasMorePages = false;
    const tracker = new DynamoDbExecutionMetaTracker();

    do {
      if (pageCount >= maxPages) break;
      const input: OriginalExecuteStatementCommandInput = {
        Statement: params.statement,
        Limit: DYNAMODB_OBSERVED_READ_MAX_ITEMS,
        NextToken: nextToken,
        ReturnConsumedCapacity: 'INDEXES',
      };
      if (params.parameters && params.parameters.length > 0)
        input.Parameters = marshall(params.parameters);
      const response = await withTimeout(
        this.client.send(new OriginalExecuteStatementCommand(input), {
          abortSignal: params.signal,
        }),
        Math.max(1, timeoutMs - (Date.now() - startedAt)),
      );
      tracker.recordResponse(response);
      pageCount += 1;
      returnedItemCount += response.Items?.length ?? 0;
      nextToken = response.NextToken;
      hasMorePages = !!(response.NextToken || response.LastEvaluatedKey);
      if (!nextToken && hasMorePages) break;
    } while (hasMorePages);

    const meta = tracker.build(hasMorePages);
    return {
      returnedItemCount,
      scannedItemCount: undefined,
      hasMorePages,
      capacityBreakdown: meta.capacityBreakdown,
      clientElapsedTimeMs: Date.now() - startedAt,
      requestCount: meta.requestCount,
      retryCount: meta.retryCount,
    };
  }

  // Classifies raw PartiQL when the full parser is unavailable or intentionally skipped.
  private static classifyPartiqlOperationFromText(
    sql: string,
  ): 'select' | 'insert' | 'update' | 'delete' | undefined {
    // Ignore leading line and block comments before reading the operation.
    const withoutLeadingComments = sql.replace(
      /^(\s*(?:--[^\n]*\n|\/\*[\s\S]*?\*\/))*\s*/,
      '',
    );
    const m = withoutLeadingComments.match(/^(select|insert|update|delete)\b/i);
    return m
      ? (m[1].toLowerCase() as 'select' | 'insert' | 'update' | 'delete')
      : undefined;
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
    apiOperation,
  }: {
    Count: number;
    Items?: Record<string, AttributeValue>[];
    params: QueryParams;
    qst: QStatement;
    elapsedTimeMilli: number;
    dbTable: DbDynamoTable;
    allAttributeTypes: Map<string, GeneralColumnType>;
    // Optional execution evidence; missing values remain distinct from zero.
    meta?: DynamoDbExecutionMeta;
    // The AWS API operation is distinct from the PartiQL read/write classification.
    apiOperation: RdhDynamoDbSummary['apiOperation'];
  }): ResultSetData {
    const materializedItems = Items ?? [];
    const record = Count === 0 ? {} : materializedItems[0] ?? {};
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
    const keyNames = new Set(keys.map((key) => key.name));

    for (const [attrName, colType] of allAttributeTypes) {
      if (!keyNames.has(attrName)) {
        keys.push(
          createRdhKey({
            name: attrName,
            type: colType,
          }),
        );
        keyNames.add(attrName);
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

    const rdb = new ResultSetDataBuilder(keys);
    materializedItems.forEach((item) => {
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

    // Fall back to the raw statement when parsing was skipped or failed.
    const operation =
      qst?.ast?.type ??
      AwsDynamoServiceClient.classifyPartiqlOperationFromText(params.sql);
    // Only a known write suppresses returned-row evidence.
    const isKnownWrite =
      operation === 'insert' ||
      operation === 'update' ||
      operation === 'delete';
    const selectedRows = isKnownWrite ? undefined : rdb.rs.rows.length;
    // PartiQL writes do not report an affected-item count.
    const affectedRows: number | undefined = undefined;
    const capacityUnits = meta?.capacityBreakdown?.capacityUnits;

    // Surface disagreement between native response counts and materialized rows.
    if (
      meta?.reportedCount !== undefined &&
      selectedRows !== undefined &&
      meta.reportedCount !== selectedRows
    ) {
      console.warn(
        `[AwsDynamoServiceClient] DynamoDB-reported Count (${
          meta.reportedCount
        }) does not match the number of items materialized into ResultSetData (${selectedRows}) for table "${
          dbTable?.name ?? params.meta?.tableName ?? 'unknown'
        }".`,
      );
    }

    // RdhSummary.dynamoDb is the sole structured execution-evidence store.
    const dynamoDb: RdhDynamoDbSummary | undefined = meta
      ? {
          apiOperation,
          returnedItemCount: selectedRows,
          evaluatedItemCount: meta.scannedCount,
          successfulResponseCount: meta.requestCount,
          sdkRetryCount: meta.retryCount,
          continuationTokenPresent: meta.hasMorePages,
          consumedCapacity: meta.capacityBreakdown
            ? {
                totalCapacityUnits: meta.capacityBreakdown.capacityUnits,
                totalReadCapacityUnits:
                  meta.capacityBreakdown.readCapacityUnits,
                totalWriteCapacityUnits:
                  meta.capacityBreakdown.writeCapacityUnits,
                table: meta.capacityBreakdown.table,
                localSecondaryIndexes:
                  meta.capacityBreakdown.localSecondaryIndexes,
                globalSecondaryIndexes:
                  meta.capacityBreakdown.globalSecondaryIndexes,
              }
            : undefined,
        }
      : undefined;

    rdb.setSummary({
      info: buildDynamoDbRdhSummaryInfo({
        operation,
        elapsedTimeMilli,
        selectedRows,
        affectedRows,
        scannedRows: meta?.scannedCount,
        requestCount: meta?.requestCount,
        retryCount: meta?.retryCount,
        capacityUnits,
        readCapacityUnits: meta?.capacityBreakdown?.readCapacityUnits,
        writeCapacityUnits: meta?.capacityBreakdown?.writeCapacityUnits,
        hasMoreRows: meta?.hasMorePages,
      }),
      elapsedTimeMilli,
      selectedRows,
      affectedRows,
      capacityUnits,
      dynamoDb,
    });
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
