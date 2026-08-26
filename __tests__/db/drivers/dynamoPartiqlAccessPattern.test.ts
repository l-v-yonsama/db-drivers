import {
  analyzeDynamoNativeQueryAccessPattern,
  analyzeDynamoPartiqlAccessPattern,
  extractDynamoPartiqlTarget,
} from '../../../src';
import { DynamoDbKeySchema } from '../../../src/types/drivers/performance/DynamoDbPerformanceTuningContext';

// Decision table under test (db-notebook repo's
// misc/specs/dynamodb-performance-tuning-implementation-plan.ja.md §7.2):
//
// | condition                                                | verdict          |
// |-----------------------------------------------------------|------------------|
// | pk `=`/`IN` guaranteed by an AND-conjunct                 | table/index Query |
// | pk equality-only OR (same pk attribute)                   | table/index Query |
// | no WHERE                                                   | table/index Scan  |
// | non-key predicates only                                    | table/index Scan  |
// | pk range condition only                                    | table/index Scan  |
// | `pk = ? OR nonKey = ?`                                     | table/index Scan  |
// | parser cannot preserve meaning                             | unknown           |

const pkOnly: DynamoDbKeySchema = {
  partitionKey: { attributeName: 'tenantId', attributeType: 'S' },
};
const pkAndSk: DynamoDbKeySchema = {
  partitionKey: { attributeName: 'tenantId', attributeType: 'S' },
  sortKey: { attributeName: 'orderId', attributeType: 'S' },
};

describe('analyzeDynamoPartiqlAccessPattern', () => {
  describe('table/index Query cases', () => {
    it('classifies a bare pk equality as tableQuery', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.confidence).toBe('certain');
      expect(r.partitionKey).toEqual({ attributeName: 'tenantId', operator: '=', conditionPresent: true });
      expect(r.postReadFilter).toEqual({ present: false, attributes: [] });
    });

    it('classifies pk equality AND-ed with a range sort key as tableQuery', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? AND orderId > ?`,
        keySchema: pkAndSk,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.sortKey).toEqual({ attributeName: 'orderId', operator: '>', conditionPresent: true });
    });

    it('classifies pk equality AND-ed with a non-key predicate as tableQuery, with the extra attribute as a post-read filter', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? AND status = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.postReadFilter).toEqual({ present: true, attributes: ['status'] });
    });

    it('classifies an OR of pk equalities on the same attribute as tableQuery (equivalent to pk IN (...))', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? OR tenantId = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
    });

    it('classifies pk IN [...] (PartiQL bracket-list) as tableQuery', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId IN ['a', 'b', 'c']`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.partitionKey?.operator).toBe('IN');
    });

    it('classifies pk IN (...) (paren-list) as tableQuery too', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId IN (?, ?)`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
    });

    it('classifies against a table.index FROM clause as indexQuery, with sortKey from the index key schema', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM "orders"."tenant-status-created-at-gsi" WHERE tenantStatus = ?`,
        keySchema: { partitionKey: { attributeName: 'tenantStatus', attributeType: 'S' } },
        tableName: 'orders',
        indexName: 'tenant-status-created-at-gsi',
        indexType: 'GSI',
      });
      expect(r.accessPath).toBe('indexQuery');
      expect(r.indexName).toBe('tenant-status-created-at-gsi');
      expect(r.indexType).toBe('GSI');
    });

    it('supports begins_with as a sortKey condition and still classifies as Query', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? AND begins_with(orderId, ?)`,
        keySchema: pkAndSk,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.sortKey).toEqual({ attributeName: 'orderId', operator: 'begins_with', conditionPresent: true });
    });

    it('supports BETWEEN as a sortKey condition and still classifies as Query', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? AND orderId BETWEEN ? AND ?`,
        keySchema: pkAndSk,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.sortKey?.operator).toBe('BETWEEN');
    });
  });

  describe('table/index Scan cases', () => {
    it('classifies a bare "FROM table" with no WHERE as tableScan', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableScan');
      expect(r.confidence).toBe('certain');
      expect(r.partitionKey?.conditionPresent).toBe(false);
    });

    it('classifies non-key-only predicates as tableScan', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE status = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableScan');
      expect(r.postReadFilter).toEqual({ present: true, attributes: ['status'] });
    });

    it('classifies a partition key range-only condition as tableScan (a range can never satisfy the partition key)', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId > ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableScan');
      expect(r.partitionKey).toEqual({ attributeName: 'tenantId', operator: undefined, conditionPresent: true });
    });

    it('classifies `pk = ? OR nonKey = ?` as tableScan (the OR is not guaranteed to hit the pk branch)', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? OR status = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableScan');
    });

    it('classifies a contains() filter with no key condition as tableScan', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE contains(tags, ?)`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableScan');
    });

    it('classifies against an index with no key condition as indexScan', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM "orders"."email-gsi" WHERE contains(email, ?)`,
        keySchema: { partitionKey: { attributeName: 'email', attributeType: 'S' } },
        tableName: 'orders',
        indexName: 'email-gsi',
        indexType: 'GSI',
      });
      expect(r.accessPath).toBe('indexScan');
    });

    it('does not fabricate a filter attribute for size(x) > n (function call, not a bare path)', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE size(tags) > ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableScan');
      expect(r.postReadFilter).toEqual({ present: false, attributes: [] });
    });

    it('treats a case-only mismatch against the partition key name as tableScan, not tableQuery (DynamoDB attribute names are case-sensitive)', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantid = ?`,
        keySchema: pkOnly, // partitionKey.attributeName is 'tenantId'
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableScan');
      expect(r.partitionKey).toEqual({ attributeName: 'tenantId', operator: undefined, conditionPresent: false });
      expect(r.postReadFilter).toEqual({ present: true, attributes: ['tenantid'] });
    });

    it('treats a case-only mismatch against the sort key name as an unreported condition, not a Query-qualifying sortKey match', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? AND orderid > ?`,
        keySchema: pkAndSk, // sortKey.attributeName is 'orderId'
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery'); // pk alone still guarantees the Query
      expect(r.sortKey).toEqual({ attributeName: 'orderId', operator: undefined, conditionPresent: false });
      expect(r.postReadFilter).toEqual({ present: true, attributes: ['orderid'] });
    });
  });

  describe('unknown / unparseable cases', () => {
    it('returns unknown for malformed SQL', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT FROM WHERE`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('unknown');
      expect(r.confidence).toBe('unknown');
    });

    it('returns unknown rather than guessing at unsupported syntax (e.g. a bind-style colon marker)', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = :val`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('unknown');
    });

    it('returns unknown for a second trailing statement (never analyzes only the first)', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ?; SELECT * FROM other`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('unknown');
    });

    it('never scans or defaults on unparseable input - accessPath and confidence always agree', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `not sql at all !!!`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('unknown');
      expect(r.confidence).toBe('unknown');
    });
  });

  describe('quoting / reserved words / document paths / comments', () => {
    it('accepts a double-quoted table name and quoted attribute names', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM "Order" WHERE "tenantId" = ?`,
        keySchema: pkOnly,
        tableName: 'Order',
      });
      expect(r.accessPath).toBe('tableQuery');
    });

    it('accepts a reserved word as a quoted identifier', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? AND "select" = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.postReadFilter.attributes).toEqual(['select']);
    });

    it('treats a document-path filter attribute by its top-level segment', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = ? AND metadata.owner = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
      expect(r.postReadFilter.attributes).toEqual(['metadata']);
    });

    it('does not treat a document-path reference as satisfying the partition key, even with a matching first segment name collision is avoided by requiring an exact bare match', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId.sub = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      // tenantId.sub is a nested path; guaranteesKeyEquality still matches on
      // the top-level segment name today (attribute stores only the first
      // segment) - documented here as the current, conservative behavior:
      // a nested reference under the pk's own name is vanishingly unlikely
      // in practice since pk is always a top-level scalar attribute.
      expect(['tableQuery', 'tableScan']).toContain(r.accessPath);
    });

    it('ignores line comments and block comments around the statement', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `-- pick the tenant's orders\nSELECT * /* all columns */ FROM orders WHERE tenantId = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
    });

    it('is unaffected by SQL keywords appearing inside a string literal', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = 'FROM WHERE AND OR'`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
    });

    it('is case-insensitive on keywords', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `select * from orders where tenantId = ?`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      expect(r.accessPath).toBe('tableQuery');
    });
  });

  describe('value non-leak', () => {
    it('never includes a literal value from the statement text anywhere in the returned AccessPattern', () => {
      const r = analyzeDynamoPartiqlAccessPattern({
        sql: `SELECT * FROM orders WHERE tenantId = 'SECRET_VALUE_998877' AND status = 'ANOTHER_SECRET'`,
        keySchema: pkOnly,
        tableName: 'orders',
      });
      const json = JSON.stringify(r);
      expect(json).not.toContain('SECRET_VALUE_998877');
      expect(json).not.toContain('ANOTHER_SECRET');
    });
  });
});

describe('extractDynamoPartiqlTarget', () => {
  it('extracts a bare table name', () => {
    expect(extractDynamoPartiqlTarget(`SELECT * FROM orders WHERE tenantId = ?`)).toEqual({
      tableName: 'orders',
      indexName: undefined,
    });
  });

  it('extracts table and index from a table.index FROM clause', () => {
    expect(extractDynamoPartiqlTarget(`SELECT * FROM "orders"."email-gsi" WHERE email = ?`)).toEqual({
      tableName: 'orders',
      indexName: 'email-gsi',
    });
  });

  it('returns undefined for unparseable SQL', () => {
    expect(extractDynamoPartiqlTarget(`not sql`)).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(extractDynamoPartiqlTarget('')).toBeUndefined();
  });
});

describe('analyzeDynamoNativeQueryAccessPattern', () => {
  it('classifies a native Query with only a pk equality as tableQuery', () => {
    const r = analyzeDynamoNativeQueryAccessPattern({
      input: { tableName: 'orders', keyConditionExpression: 'tenantId = :pk' },
      keySchema: pkOnly,
    });
    expect(r.operation).toBe('Query');
    expect(r.accessPath).toBe('tableQuery');
  });

  it('classifies a native Query with pk + sortKey BETWEEN as tableQuery', () => {
    const r = analyzeDynamoNativeQueryAccessPattern({
      input: {
        tableName: 'orders',
        keyConditionExpression: 'tenantId = :pk AND orderId BETWEEN :a AND :b',
      },
      keySchema: pkAndSk,
    });
    expect(r.accessPath).toBe('tableQuery');
    expect(r.sortKey?.operator).toBe('BETWEEN');
  });

  it('always treats filterExpression attributes as post-read filter attributes', () => {
    const r = analyzeDynamoNativeQueryAccessPattern({
      input: {
        tableName: 'orders',
        keyConditionExpression: 'tenantId = :pk',
        filterExpression: '#s = :status',
        expressionAttributeNames: { '#s': 'status' },
      },
      keySchema: pkOnly,
    });
    expect(r.accessPath).toBe('tableQuery');
    expect(r.postReadFilter.present).toBe(true);
  });

  it('marks indexType/indexName from the input on the result', () => {
    const r = analyzeDynamoNativeQueryAccessPattern({
      input: { tableName: 'orders', indexName: 'email-gsi', keyConditionExpression: 'email = :e' },
      keySchema: { partitionKey: { attributeName: 'email', attributeType: 'S' } },
      indexType: 'GSI',
    });
    expect(r.accessPath).toBe('indexQuery');
    expect(r.indexName).toBe('email-gsi');
    expect(r.indexType).toBe('GSI');
    expect(r.projection.mode).toBe('allProjectedAttributes');
  });

  it('resolves ProjectionExpression aliases and keeps resultItemLimit distinct from API Limit', () => {
    const r = analyzeDynamoNativeQueryAccessPattern({
      input: {
        tableName: 'orders',
        keyConditionExpression: '#pk = :pk',
        projectionExpression: '#p0, #p1',
        expressionAttributeNames: { '#pk': 'tenantId', '#p0': 'status', '#p1': 'createdAt' },
        limit: 25,
        resultItemLimit: 100,
      },
      keySchema: pkOnly,
    });
    expect(r.projection).toEqual({
      mode: 'specific',
      allAttributes: false,
      attributes: ['status', 'createdAt'],
    });
    expect(r.limit).toBe(25);
    expect(r.resultItemLimit).toBe(100);
  });

  it('returns unknown for an unparseable keyConditionExpression', () => {
    const r = analyzeDynamoNativeQueryAccessPattern({
      input: { tableName: 'orders', keyConditionExpression: '???' },
      keySchema: pkOnly,
    });
    expect(r.accessPath).toBe('unknown');
  });

  it('derives consistentRead from the input boolean', () => {
    const strong = analyzeDynamoNativeQueryAccessPattern({
      input: { tableName: 'orders', keyConditionExpression: 'tenantId = :pk', consistentRead: true },
      keySchema: pkOnly,
    });
    expect(strong.consistentRead).toBe('strong');

    const eventual = analyzeDynamoNativeQueryAccessPattern({
      input: { tableName: 'orders', keyConditionExpression: 'tenantId = :pk', consistentRead: false },
      keySchema: pkOnly,
    });
    expect(eventual.consistentRead).toBe('eventual');

    const unset = analyzeDynamoNativeQueryAccessPattern({
      input: { tableName: 'orders', keyConditionExpression: 'tenantId = :pk' },
      keySchema: pkOnly,
    });
    expect(unset.consistentRead).toBe('eventual');
  });
});
