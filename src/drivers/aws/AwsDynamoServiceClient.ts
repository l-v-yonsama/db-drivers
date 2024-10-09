/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DynamoDBClient,
  CreateTableCommand,
  ExecuteStatementCommand as OriginalExecuteStatementCommand,
  ExecuteStatementCommandInput as OriginalExecuteStatementCommandInput,
  ExecuteStatementCommandOutput as OriginalExecuteStatementCommandOutput,
  ListTablesCommand,
  DescribeTableCommand,
  TableDescription,
  CreateTableCommandInput,
  AttributeValue,
  ScanCommand as OriginalScanCommand,
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
  ScanParams,
} from '../../types';
import { setRdhMetaAndStatement } from '../../utils';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceClient } from './AwsServiceClient';
import { parseQuery } from '../../helpers';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export type TableDescWithExtraAttrs = TableDescription & {
  ExtraItems?: { name: string; value: AttributeValue }[];
};
export class AwsDynamoServiceClient
  extends AwsServiceClient
  implements Scannable
{
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

  async listTables(): Promise<TableDescWithExtraAttrs[]> {
    const tableNames = await this.listTableNames();
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
          }
        }
      }),
    );
    return tableList;
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { target, limit, keyword, startTime, endTime, withValue } = params;
    return null;
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
          lsi:
            table.LocalSecondaryIndexes?.map((it) => {
              return {
                IndexName: it.IndexName,
                KeySchema: it.KeySchema,
                IndexSizeBytes: it.IndexSizeBytes,
                ItemCount: it.ItemCount,
                IndexArn: it.IndexArn,
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
            let attrType = Object.keys(item.value)[0];
            if (attrType === 'L') {
              if (item.value.L.length > 0) {
                const arr = item.value.L;
                const sunAttrType = Object.keys(arr[0])[0];
                switch (sunAttrType) {
                  case 'S':
                    attrType = 'SS';
                    break;
                  case 'N':
                    attrType = 'NS';
                    break;
                  case 'B':
                    attrType = 'BS';
                    break;
                }
              }
            }
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

  async updateItem(params: UpdateCommandInput): Promise<void> {
    await this.docClient.send(new UpdateCommand(params));
  }

  async scanItems(params: ScanCommandInput): Promise<{
    Items: ScanCommandOutput['Items'];
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    CapacityUnits: number;
  }> {
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    let CapacityUnits = 0;
    if (params.ExclusiveStartKey) {
      LastEvaluatedKey = params.ExclusiveStartKey;
    }

    const Items: ScanCommandOutput['Items'] = [];
    do {
      const command = new ScanCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        ExclusiveStartKey: LastEvaluatedKey ? LastEvaluatedKey : undefined,
        ReturnConsumedCapacity: 'TOTAL',
      });

      const response = await this.client.send(command);
      LastEvaluatedKey = response.LastEvaluatedKey;
      CapacityUnits += response.ConsumedCapacity?.CapacityUnits ?? 0;
      Items.push(...response.Items);
      if (params.Limit && Items.length >= params.Limit) {
        break;
      }
    } while (LastEvaluatedKey);

    return {
      Items,
      LastEvaluatedKey,
      Count: Items.length,
      CapacityUnits,
    };
  }

  async queryItems(params: QueryCommandInput): Promise<{
    Items: QueryCommandOutput['Items'];
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    CapacityUnits: number;
  }> {
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    let CapacityUnits = 0;
    if (params.ExclusiveStartKey) {
      LastEvaluatedKey = params.ExclusiveStartKey;
    }

    const Items: QueryCommandOutput['Items'] = [];
    do {
      const command = new QueryCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        ExclusiveStartKey: LastEvaluatedKey ? LastEvaluatedKey : undefined,
        ReturnConsumedCapacity: 'TOTAL',
      });

      const response = await this.client.send(command);
      LastEvaluatedKey = response.LastEvaluatedKey;
      CapacityUnits += response.ConsumedCapacity?.CapacityUnits ?? 0;
      Items.push(...response.Items);
      if (params.Limit && Items.length >= params.Limit) {
        break;
      }
    } while (LastEvaluatedKey);

    return {
      Items,
      LastEvaluatedKey,
      Count: Items.length,
      CapacityUnits,
    };
  }

  async executeStatement(params: ExecuteStatementCommandInput): Promise<{
    Items: QueryCommandOutput['Items'];
    NextToken?: string;
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    CapacityUnits: number;
    extra: {
      allAttributeNames: string[];
    };
  }> {
    this.interrupted = false;
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    let NextToken = params.NextToken;
    let CapacityUnits = 0;
    const allAttributeNames = new Set<string>();

    const Items: QueryCommandOutput['Items'] = [];
    do {
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }
      const command = new ExecuteStatementCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        NextToken,
        ReturnConsumedCapacity: 'TOTAL',
      });

      const response = await this.client.send(command);
      LastEvaluatedKey = response.LastEvaluatedKey;
      NextToken = response.NextToken;
      CapacityUnits += response.ConsumedCapacity?.CapacityUnits ?? 0;
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

    return {
      Items,
      LastEvaluatedKey,
      NextToken,
      Count: Items.length,
      CapacityUnits,
      extra: {
        allAttributeNames: [...allAttributeNames],
      },
    };
  }

  async executeStatementAtClient(
    params: OriginalExecuteStatementCommandInput,
  ): Promise<{
    Items: OriginalExecuteStatementCommandOutput['Items'];
    NextToken?: string;
    LastEvaluatedKey: Record<string, NativeAttributeValue>;
    Count: number;
    CapacityUnits: number;
    extra: {
      allAttributeTypes: Map<string, GeneralColumnType>;
    };
  }> {
    this.interrupted = false;
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    let NextToken = params.NextToken;
    let CapacityUnits = 0;
    const allAttributeTypes = new Map<string, GeneralColumnType>();

    const Items: OriginalExecuteStatementCommandOutput['Items'] = [];
    do {
      if (this.interrupted) {
        this.interrupted = false;
        throw new Error('INTERRUPT');
      }
      const command = new OriginalExecuteStatementCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        NextToken,
        ReturnConsumedCapacity: 'TOTAL',
      });

      const response = await this.client.send(command);
      LastEvaluatedKey = response.LastEvaluatedKey;
      NextToken = response.NextToken;
      CapacityUnits += response.ConsumedCapacity?.CapacityUnits ?? 0;
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

    return {
      Items,
      LastEvaluatedKey,
      NextToken,
      Count: Items.length,
      CapacityUnits,
      extra: {
        allAttributeTypes,
      },
    };
  }

  async requestPartiql(params: QueryParams): Promise<ResultSetData> {
    const { sql, conditions } = params;
    let rdb: ResultSetDataBuilder | undefined = undefined;
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
      input.Parameters = binds;
    }
    const {
      CapacityUnits: capacityUnits,
      Count,
      Items,
      extra: { allAttributeTypes },
    } = await this.executeStatementAtClient(input);

    const elapsedTimeMilli = new Date().getTime() - startTime;

    if (Count === 0) {
      const rdb = ResultSetDataBuilder.createEmpty({
        noRecordsReason: qst?.ast?.type === 'select' ? 'No records.' : '',
      });
      rdb.setSummary({
        elapsedTimeMilli,
        selectedRows: 0,
        capacityUnits,
      });
      setRdhMetaAndStatement({
        connectionName: this.conRes.name,
        params,
        rdb,
        type: qst?.ast?.type,
        qst,
        dbTable,
      });
      return rdb.build();
    }
    const record = Items[0];
    const keys = Object.keys(record).map((it) => {
      const col = dbTable?.getChildByName(it);
      const type = col?.attrType
        ? parseDynamoAttrType(col.attrType)
        : allAttributeTypes.get(it);
      let comment = '';
      if (col?.pk) {
        comment = '(pk)';
      }
      if (col?.sk) {
        comment = '(sk)';
      }
      return createRdhKey({
        name: it,
        type,
        required: col?.pk || col?.sk,
        comment,
      });
    });
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

    rdb = new ResultSetDataBuilder(keys);
    Items.forEach((item) => {
      rdb.addRow(unmarshall(item));
    });

    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      params,
      rdb,
      type: qst?.ast?.type,
      qst,
      dbTable,
    });

    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
      capacityUnits,
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
    const colType = parseDynamoAttrType(attrName);
    if (colType !== GeneralColumnType.ARRAY) {
      return colType;
    }
    // ARRAY
    const array = attr[attrName];
    if (array.length === 0) {
      return GeneralColumnType.ARRAY;
    }
    const first = array[0];
    const firstAttrName = Object.keys(first)[0];
    switch (firstAttrName) {
      case 'S':
        return GeneralColumnType.STRING_ARRAY;
      case 'N':
        return GeneralColumnType.NUMERIC_ARRAY;
      case 'B':
        return GeneralColumnType.BINARY_ARRAY;
    }
    return GeneralColumnType.ARRAY;
  }
}
