/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  PutItemCommandInput,
  PutItemCommand,
  DescribeTableCommand,
  DynamoDBClientConfig,
  TableDescription,
  CreateTableCommandInput,
  GetItemCommand,
  GetItemCommandInput,
  DeleteItemCommand,
  DeleteItemCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  AttributeValue,
  UpdateItemInput,
} from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommand,
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
  PutCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
  UpdateCommand,
  UpdateCommandInput,
  paginateQuery,
  paginateScan,
} from '@aws-sdk/lib-dynamodb';
import {
  createRdhKey,
  equalsIgnoreCase,
  FileAnnotation,
  GeneralColumnType,
  RdhRowMeta,
  ResultSetData,
  ResultSetDataBuilder,
  toNum,
} from '@l-v-yonsama/rdh';
import { plural } from 'pluralize';
import {
  AwsDatabase,
  DbDynamoTable,
  DbDynamoTableColumn,
  DbKey,
  DbS3Bucket,
  DbS3Owner,
  DbTable,
  S3KeyParams,
} from '../../resource';
import {
  AwsServiceType,
  ConnectionSetting,
  QStatement,
  QueryParams,
  ScanParams,
} from '../../types';
import {
  parseContentType,
  prettyFileSize,
  setRdhMetaAndStatement,
} from '../../utils';
import { ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceClient } from './AwsServiceClient';
import { parseQuery } from '../../helpers';

export class AwsDynamoServiceClient
  extends AwsServiceClient
  implements Scannable
{
  client: DynamoDBClient;
  docClient: DynamoDBDocumentClient;
  awsDatabase: AwsDatabase;

  constructor(conRes: ConnectionSetting, config: ClientConfigType) {
    super(conRes, config);
  }

  async connectSub(): Promise<string> {
    // const config: DynamoDBClientConfig = {
    //   ...this.config,
    // };
    this.client = new DynamoDBClient(this.config);
    this.docClient = DynamoDBDocumentClient.from(this.client);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.client) {
      await this.listTableNames(1);
    }
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

  async listTables(): Promise<TableDescription[]> {
    const tableNames = await this.listTableNames();
    const tableList: TableDescription[] = [];
    await Promise.all(
      tableNames.map(async (TableName) => {
        const res = await this.client.send(
          new DescribeTableCommand({
            TableName,
          }),
        );
        if (res.Table) {
          tableList.push(res.Table);
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
      console.log('tables=', tables);

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
        table.AttributeDefinitions?.forEach((attr) => {
          const pk = table.KeySchema?.some(
            (it) =>
              it.AttributeName === attr.AttributeName && it.KeyType === 'HASH',
          );
          const sk = table.KeySchema?.some(
            (it) =>
              it.AttributeName === attr.AttributeName && it.KeyType === 'RANGE',
          );
          dynamoTable.addChild(
            new DbDynamoTableColumn(
              attr.AttributeName,
              attr.AttributeType,
              pk,
              sk,
            ),
          );
        });
        dbDatabase.addChild(dynamoTable);
      }
      dbDatabase.comment = `${tables.length} ${plural('table')}`;
    } catch (e) {
      console.error(e);
      // reject(e);
    }
    this.awsDatabase = dbDatabase;
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
      console.log(response.ConsumedCapacity);
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
  }> {
    let LastEvaluatedKey: Record<string, NativeAttributeValue> | undefined =
      undefined;
    let NextToken = params.NextToken;
    let CapacityUnits = 0;

    const Items: QueryCommandOutput['Items'] = [];
    do {
      const command = new ExecuteStatementCommand({
        ...params,
        Limit: params.Limit ? params.Limit - Items.length : undefined,
        NextToken,
        ReturnConsumedCapacity: 'TOTAL',
      });

      const response = await this.client.send(command);
      console.log(
        'res',
        response.Items.length,
        response.NextToken,
        response.LastEvaluatedKey,
        response.ConsumedCapacity,
      );
      LastEvaluatedKey = response.LastEvaluatedKey;
      NextToken = response.NextToken;
      CapacityUnits += response.ConsumedCapacity?.CapacityUnits ?? 0;
      Items.push(...response.Items);
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
    };
  }

  async requestPartiql(params: QueryParams): Promise<ResultSetData> {
    const { sql, conditions } = params;
    let rdb: ResultSetDataBuilder | undefined = undefined;
    let qst: QStatement | undefined = undefined;
    let dbTable: DbDynamoTable | undefined = undefined;

    if (conditions?.rawQueries !== true) {
      qst = parseQuery(sql);
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
    const {
      CapacityUnits: capacityUnits,
      Count,
      Items,
      LastEvaluatedKey,
      NextToken,
    } = await this.executeStatement({
      Statement,
      Parameters: binds,
      Limit,
    });

    const elapsedTimeMilli = new Date().getTime() - startTime;

    if (Count === 0) {
      const rdb = ResultSetDataBuilder.createEmpty({
        message: 'No records.',
      });
      rdb.setSummary({
        elapsedTimeMilli,
        selectedRows: 0,
        capacityUnits,
      });
      return rdb.build();
    }
    const records = Items[0];
    rdb = new ResultSetDataBuilder(
      Object.keys(records).map((it) => {
        const col = dbTable?.getChildByName(it);
        return createRdhKey({
          name: it,
          type: this.parseColumnType(col?.attrType),
          required: col?.pk || col?.sk,
        });
      }),
    );
    Items.forEach((item) => {
      rdb.addRow(item);
    });

    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      params,
      rdb,
      type: qst?.ast?.type,
      qst,
      dbTable,
    });

    rdb.resetKeyTypeByRows();
    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
      capacityUnits,
    });
    return rdb.build();
  }

  private parseColumnType(typeString: string): GeneralColumnType {
    if (typeString == null || typeString === '') {
      return GeneralColumnType.UNKNOWN;
    }
    if ('S' === typeString) {
      return GeneralColumnType.TEXT;
    } else if ('N' === typeString) {
      return GeneralColumnType.NUMERIC;
    } else if ('B' === typeString) {
      return GeneralColumnType.BINARY;
    } else if (
      'SS' === typeString ||
      'NS' === typeString ||
      'BS' === typeString
    ) {
      return GeneralColumnType.SET;
    } else if ('M' === typeString) {
      return GeneralColumnType.JSON;
    } else if ('L' === typeString) {
      return GeneralColumnType.ARRAY;
    } else if ('NULL' === typeString) {
      return GeneralColumnType.UNKNOWN;
    } else if ('BOOL' === typeString) {
      return GeneralColumnType.BOOLEAN;
    }
    return GeneralColumnType.UNKNOWN;
  }

  private getDbTable(qst?: QStatement): DbDynamoTable | undefined {
    const db = this.awsDatabase;
    if (qst === undefined || qst.names === undefined || db === undefined) {
      return undefined;
    }

    return db.getChildByName(qst.names.tableName, false) as DbDynamoTable;
  }

  protected async closeSub(): Promise<void> {
    this.docClient.destroy();
    this.client.destroy();
  }

  protected getServiceName(): string {
    return 'DynamoDB';
  }
}
