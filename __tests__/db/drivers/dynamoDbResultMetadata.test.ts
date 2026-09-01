import { DbDynamoTable, DbDynamoTableColumn } from '../../../src/resource';
import {
  compareDynamoDbResultKeys,
  describeDynamoDbResultKey,
  getDynamoDbResultKeyNames,
  resolveDynamoDbAccessPath,
} from '../../../src/drivers/aws/dynamoDbResultMetadata';

const createTable = (): DbDynamoTable => {
  const table = new DbDynamoTable('orders', {
    lsi: [
      {
        IndexName: 'amount-lsi',
        KeySchema: [
          { AttributeName: 'tenantId', KeyType: 'HASH' },
          { AttributeName: 'totalAmount', KeyType: 'RANGE' },
        ],
      },
    ],
    gsi: [
      {
        IndexName: 'status-gsi',
        KeySchema: [
          { AttributeName: 'tenantStatus', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
      },
    ],
  });
  table.addChild(new DbDynamoTableColumn('tenantId', 'S', true, false));
  table.addChild(new DbDynamoTableColumn('orderId', 'S', false, true));
  table.addChild(new DbDynamoTableColumn('tenantStatus', 'S', false, false));
  table.addChild(new DbDynamoTableColumn('createdAt', 'S', false, false));
  table.addChild(new DbDynamoTableColumn('totalAmount', 'N', false, false));
  return table;
};

describe('DynamoDB result metadata', () => {
  const table = createTable();

  it('resolves table, LSI, GSI, and metadata-unknown index access paths', () => {
    expect(resolveDynamoDbAccessPath(table, undefined)).toEqual({
      type: 'table',
    });
    expect(resolveDynamoDbAccessPath(table, 'amount-lsi')).toEqual({
      type: 'index',
      indexName: 'amount-lsi',
      indexType: 'LSI',
    });
    expect(resolveDynamoDbAccessPath(table, 'status-gsi')).toEqual({
      type: 'index',
      indexName: 'status-gsi',
      indexType: 'GSI',
    });
    expect(resolveDynamoDbAccessPath(table, 'custom-index')).toEqual({
      type: 'index',
      indexName: 'custom-index',
    });
  });

  it('keeps the compact legacy comments for a table access', () => {
    expect(describeDynamoDbResultKey(table, undefined, 'tenantId')).toEqual({
      comment: '(pk)',
      required: true,
    });
    expect(describeDynamoDbResultKey(table, undefined, 'orderId')).toEqual({
      comment: '(sk)',
      required: true,
    });
  });

  it('distinguishes stable table keys from GSI access keys', () => {
    expect(describeDynamoDbResultKey(table, 'status-gsi', 'tenantId')).toEqual({
      comment: '(table pk)',
      required: true,
    });
    expect(describeDynamoDbResultKey(table, 'status-gsi', 'orderId')).toEqual({
      comment: '(table sk)',
      required: true,
    });
    expect(
      describeDynamoDbResultKey(table, 'status-gsi', 'tenantStatus'),
    ).toEqual({ comment: '(access pk)', required: true });
    expect(describeDynamoDbResultKey(table, 'status-gsi', 'createdAt')).toEqual(
      { comment: '(access sk)', required: true },
    );
  });

  it('shows the shared LSI/table partition-key roles together', () => {
    expect(describeDynamoDbResultKey(table, 'amount-lsi', 'tenantId')).toEqual({
      comment: '(table pk, access pk)',
      required: true,
    });
    expect(
      describeDynamoDbResultKey(table, 'amount-lsi', 'totalAmount'),
    ).toEqual({ comment: '(access sk)', required: true });
  });

  it('orders table identity keys before distinct access keys', () => {
    expect(getDynamoDbResultKeyNames(table, 'status-gsi')).toEqual([
      'tenantId',
      'orderId',
      'tenantStatus',
      'createdAt',
    ]);
    expect(
      ['createdAt', 'note', 'tenantStatus', 'orderId', 'tenantId'].sort(
        (a, b) => compareDynamoDbResultKeys(table, 'status-gsi', a, b),
      ),
    ).toEqual(['tenantId', 'orderId', 'tenantStatus', 'createdAt', 'note']);
  });
});
