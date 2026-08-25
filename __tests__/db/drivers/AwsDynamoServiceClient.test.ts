import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand as DocumentScanCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  AwsDatabase,
  AwsDriver,
  AwsDynamoServiceClient,
  AwsServiceType,
  ConnectionSetting,
  DbDynamoTable,
  DbDynamoTableColumn,
} from '../../../src';

describe('AwsDynamoServiceClient scan pagination', () => {
  it('scanItemsAtClient paginates up to the item limit and converts the result to RDH', async () => {
    const table = new DbDynamoTable('Orders', { lsi: [], gsi: [] } as never);
    table.addChild(new DbDynamoTableColumn('id', 'N', true, false));
    const database = new AwsDatabase('DynamoDB', AwsServiceType.DynamoDB);
    database.addChild(table);

    const awsDriver = {
      getDbDatabases: () => [database],
    } as unknown as AwsDriver;
    const client = new AwsDynamoServiceClient(
      { name: 'aws-connection' } as ConnectionSetting,
      {
        credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test',
        },
      },
      awsDriver,
    );

    const lastKey = { id: { N: '2' } };
    const send = jest
      .fn()
      .mockResolvedValueOnce({
        Items: [
          { id: { N: '1' }, status: { S: 'new' } },
          { id: { N: '2' }, status: { S: 'paid' } },
        ],
        Count: 2,
        ScannedCount: 2,
        LastEvaluatedKey: lastKey,
        $metadata: { attempts: 1 },
      })
      .mockResolvedValueOnce({
        Items: [{ id: { N: '3' }, status: { S: 'shipped' } }],
        Count: 1,
        ScannedCount: 1,
        LastEvaluatedKey: { id: { N: '3' } },
        $metadata: { attempts: 1 },
      });
    client.client = { send } as unknown as DynamoDBClient;

    const rs = await client.scanItemsAtClient({
      TableName: 'Orders',
      Limit: 3,
    });

    expect(rs.rows.map((row) => row.values)).toEqual([
      { id: 1, status: 'new' },
      { id: 2, status: 'paid' },
      { id: 3, status: 'shipped' },
    ]);
    expect(rs.summary.selectedRows).toBe(3);
    expect(rs.summary.scannedRows).toBe(3);
    expect(rs.summary.hasMoreRows).toBe(true);
    expect(rs.meta.tableName).toBe('Orders');

    const firstCommand = send.mock.calls[0][0] as ScanCommand;
    const secondCommand = send.mock.calls[1][0] as ScanCommand;
    expect(firstCommand.input).toMatchObject({ TableName: 'Orders', Limit: 3 });
    expect(secondCommand.input).toMatchObject({
      TableName: 'Orders',
      Limit: 1,
      ExclusiveStartKey: lastKey,
    });
  });

  it('scanItems uses the same pagination behavior with DocumentClient values', async () => {
    const client = new AwsDynamoServiceClient(
      { name: 'aws-connection' } as ConnectionSetting,
      {
        credentials: {
          accessKeyId: 'test',
          secretAccessKey: 'test',
        },
      },
      {} as AwsDriver,
    );

    const lastKey = { id: 2 };
    const send = jest
      .fn()
      .mockResolvedValueOnce({
        Items: [
          { id: 1, status: 'new' },
          { id: 2, status: 'paid' },
        ],
        Count: 2,
        ScannedCount: 2,
        LastEvaluatedKey: lastKey,
        $metadata: { attempts: 1 },
      })
      .mockResolvedValueOnce({
        Items: [{ id: 3, status: 'shipped' }],
        Count: 1,
        ScannedCount: 1,
        LastEvaluatedKey: { id: 3 },
        $metadata: { attempts: 1 },
      });
    client.docClient = { send } as unknown as DynamoDBDocumentClient;

    const result = await client.scanItems({
      TableName: 'Orders',
      Limit: 3,
    });

    expect(result.Items).toEqual([
      { id: 1, status: 'new' },
      { id: 2, status: 'paid' },
      { id: 3, status: 'shipped' },
    ]);
    expect(result.Count).toBe(3);
    expect(result.LastEvaluatedKey).toEqual({ id: 3 });
    expect(result.meta).toMatchObject({
      requestCount: 2,
      scannedCount: 3,
      reportedCount: 3,
      hasMorePages: true,
    });

    const firstCommand = send.mock.calls[0][0] as DocumentScanCommand;
    const secondCommand = send.mock.calls[1][0] as DocumentScanCommand;
    expect(firstCommand.input).toMatchObject({ TableName: 'Orders', Limit: 3 });
    expect(secondCommand.input).toMatchObject({
      TableName: 'Orders',
      Limit: 1,
      ExclusiveStartKey: lastKey,
    });
  });
});
