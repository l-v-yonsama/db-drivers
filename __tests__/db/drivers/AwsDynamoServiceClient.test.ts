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
    expect(rs.summary.dynamoDb?.apiOperation).toBe('Scan');
    expect(rs.summary.dynamoDb?.returnedItemCount).toBe(3);
    expect(rs.summary.dynamoDb?.evaluatedItemCount).toBe(3);
    expect(rs.summary.dynamoDb?.continuationTokenPresent).toBe(true);
    // Capacity breakdown lives only under summary.dynamoDb - never
    // duplicated into rs.meta.dynamoDb (query panel history/performance
    // plan §5.4/§12.3).
    expect(rs.meta.dynamoDb).toBeUndefined();
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

describe('AwsDynamoServiceClient complete-result observed reads', () => {
  function createClient(): AwsDynamoServiceClient {
    return new AwsDynamoServiceClient(
      { name: 'aws-connection' } as ConnectionSetting,
      { credentials: { accessKeyId: 'test', secretAccessKey: 'test' } },
      {} as AwsDriver,
    );
  }

  it('follows native Query continuation keys and aggregates metadata only', async () => {
    const client = createClient();
    const lastKey = { tenantId: { S: 'T#1' }, orderId: { S: 'O#100' } };
    const send = jest.fn()
      .mockResolvedValueOnce({
        Count: 13,
        ScannedCount: 100,
        LastEvaluatedKey: lastKey,
        ConsumedCapacity: { TableName: 'orders', CapacityUnits: 11.5 },
        $metadata: { attempts: 2 },
      })
      .mockResolvedValueOnce({
        Count: 4,
        ScannedCount: 20,
        ConsumedCapacity: { TableName: 'orders', CapacityUnits: 2.5 },
        $metadata: { attempts: 1 },
      });
    client.client = { send } as unknown as DynamoDBClient;

    const result = await client.observeNativeQueryReadComplete({
      input: { TableName: 'orders', KeyConditionExpression: 'tenantId = :pk' },
      maxPages: 10,
      maxEvaluatedItems: 1000,
    });

    expect(result).toMatchObject({
      returnedItemCount: 17,
      scannedItemCount: 120,
      hasMorePages: false,
      requestCount: 2,
      retryCount: 1,
      capacityBreakdown: { capacityUnits: 14 },
    });
    expect(send.mock.calls[1][0].input).toMatchObject({
      ExclusiveStartKey: lastKey,
      Limit: 100,
      ReturnConsumedCapacity: 'INDEXES',
    });
  });

  it('stops PartiQL at the page safety limit and preserves incomplete coverage', async () => {
    const client = createClient();
    const send = jest.fn()
      .mockResolvedValueOnce({
        Items: [{ id: { S: '1' } }],
        NextToken: 'next-1',
        $metadata: { attempts: 1 },
      })
      .mockResolvedValueOnce({
        Items: [{ id: { S: '2' } }],
        NextToken: 'next-2',
        $metadata: { attempts: 1 },
      });
    client.client = { send } as unknown as DynamoDBClient;

    const result = await client.observePartiqlReadComplete({
      statement: "SELECT * FROM orders WHERE tenantId = 'T#1'",
      maxPages: 2,
    });

    expect(result).toMatchObject({
      returnedItemCount: 2,
      hasMorePages: true,
      requestCount: 2,
      retryCount: 0,
    });
    expect(send.mock.calls[1][0].input).toMatchObject({
      NextToken: 'next-1',
      Limit: 100,
      ReturnConsumedCapacity: 'INDEXES',
    });
  });
});
