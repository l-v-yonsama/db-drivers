import { GeneralColumnType } from '@l-v-yonsama/rdh';
import {
  DbColumn,
  DBType,
  DbSchema,
  DbTable,
  estimateBindParameters,
  RdsDatabase,
} from '../../src';

describe('estimateBindParameters', () => {
  describe('marker detection', () => {
    it.each([
      [DBType.MySQL, 'a = ? AND b = ?', ['?', '?']],
      [DBType.Postgres, 'a = $2 OR b = $1', ['$1', '$2']],
      [DBType.Oracle, 'a = :B1 AND b = :B2', [':B1', ':B2']],
      [DBType.SQLServer, 'a = @tenantId AND b = @status', ['@tenantId', '@status']],
    ] as const)('estimates markers for %s', (dbType, sql, expectedMarkers) => {
      const result = estimateBindParameters({ dbType, sql });

      expect(result.map((it) => it.marker)).toEqual(expectedMarkers);
      expect(result.every((it) => it.estimatedType === GeneralColumnType.UNKNOWN)).toBe(true);
      expect(result.map((it) => it.position)).toEqual(expectedMarkers.map((_, idx) => idx + 1));
    });

    it('does not count a MySQL `?` inside a single-quoted string', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: "SELECT '?' AS literal, name FROM t WHERE id = ?",
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a single-quoted string with an escaped quote', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: "SELECT 'it''s ?' AS literal, name FROM t WHERE id = ?",
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a line comment', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT * FROM t -- what about ?\nWHERE id = ?',
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a `#` line comment (MySQL only)', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT * FROM t # skip ?\nWHERE id = ?',
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a block comment', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT * FROM t /* skip ? here */ WHERE id = ?',
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a double-quoted identifier', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT "col?name" FROM t WHERE id = ?',
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a double-quoted identifier with an escaped quote', () => {
      const result = estimateBindParameters({
        dbType: DBType.Postgres,
        sql: 'SELECT "col""$1""name" FROM t WHERE id = $1',
      });
      expect(result.map((it) => it.marker)).toEqual(['$1']);
    });

    it('does not count a marker inside a MySQL backtick identifier', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT `col?name` FROM t WHERE id = ?',
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a MySQL backtick identifier with an escaped backtick', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT `col``?``name` FROM t WHERE id = ?',
      });
      expect(result.map((it) => it.marker)).toEqual(['?']);
    });

    it('does not count a marker inside a SQL Server bracket identifier', () => {
      const result = estimateBindParameters({
        dbType: DBType.SQLServer,
        sql: 'SELECT [col@name] FROM t WHERE id = @1',
      });
      expect(result.map((it) => it.marker)).toEqual(['@1']);
    });

    it('does not count a marker inside a SQL Server bracket identifier with an escaped closing bracket', () => {
      const result = estimateBindParameters({
        dbType: DBType.SQLServer,
        sql: 'SELECT [col]]@name] FROM t WHERE id = @1',
      });
      expect(result.map((it) => it.marker)).toEqual(['@1']);
    });

    it('skips multiple line and block comments while retaining markers after each comment', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: [
          'SELECT * FROM t',
          '-- first comment ?',
          'WHERE a = ?',
          '/* multi-line',
          'comment ? */',
          '  AND b = ?',
          '# MySQL comment ?',
          '  AND c = ?',
        ].join('\n'),
      });
      expect(result.map((it) => it.marker)).toEqual(['?', '?', '?']);
      expect(result.map((it) => it.location.line)).toEqual([3, 6, 8]);
    });

    it('does not treat a PostgreSQL dollar-quoted string as numbered bind markers', () => {
      const result = estimateBindParameters({
        dbType: DBType.Postgres,
        sql: 'SELECT $tag$ text containing $1 and $2 $tag$, $$ also $3 $$ WHERE id = $2',
      });
      expect(result.map((it) => it.marker)).toEqual(['$2']);
    });

    it('does not treat PostgreSQL casts around a real marker as additional markers', () => {
      const result = estimateBindParameters({
        dbType: DBType.Postgres,
        sql: 'SELECT value::text, value :: "text", value::jsonb FROM t WHERE id = $1::bigint',
      });
      expect(result.map((it) => it.marker)).toEqual(['$1']);
    });

    it('does not treat PostgreSQL `::` cast as a marker', () => {
      const result = estimateBindParameters({
        dbType: DBType.Postgres,
        sql: 'SELECT a::text FROM t WHERE id = $1',
      });
      expect(result.map((it) => it.marker)).toEqual(['$1']);
    });

    it('does not treat Oracle `:=` assignment as a marker', () => {
      const result = estimateBindParameters({
        dbType: DBType.Oracle,
        sql: 'BEGIN v_x := 1; END; SELECT * FROM t WHERE id = :1',
      });
      expect(result.map((it) => it.marker)).toEqual([':1']);
    });

    it('does not treat Oracle assignment as a marker when real named binds follow it', () => {
      const result = estimateBindParameters({
        dbType: DBType.Oracle,
        sql: 'BEGIN v_x := 1; END; SELECT * FROM t WHERE id = :B1 AND state = :B2',
      });
      expect(result.map((it) => it.marker)).toEqual([':B1', ':B2']);
    });

    it('does not treat SQL Server `@@` system variables as a marker', () => {
      const result = estimateBindParameters({
        dbType: DBType.SQLServer,
        sql: 'SELECT @@ROWCOUNT FROM t WHERE id = @1',
      });
      expect(result.map((it) => it.marker)).toEqual(['@1']);
    });

    it('skips several SQL Server system variables but keeps named and numbered binds', () => {
      const result = estimateBindParameters({
        dbType: DBType.SQLServer,
        sql: 'SELECT @@SPID, @@IDENTITY, @@GLOBAL_ID FROM t WHERE id = @1 AND state = @state',
      });
      expect(result.map((it) => it.marker)).toEqual(['@1', '@state']);
    });

    it('orders named Oracle markers by first occurrence and dedupes repeats', () => {
      const result = estimateBindParameters({
        dbType: DBType.Oracle,
        sql: 'a = :name AND b = :other AND c = :name',
      });
      expect(result.map((it) => it.marker)).toEqual([':name', ':other']);
    });

    it('sorts numeric markers ahead of named markers for Oracle/SQL Server', () => {
      const result = estimateBindParameters({
        dbType: DBType.SQLServer,
        sql: 'a = @name AND b = @2 AND c = @1',
      });
      expect(result.map((it) => it.marker)).toEqual(['@1', '@2', '@name']);
    });

    it('never throws on unparseable SQL and returns whatever markers it can find', () => {
      expect(() =>
        estimateBindParameters({ dbType: DBType.MySQL, sql: 'not really !!! sql ?? ( ? ' }),
      ).not.toThrow();
    });

    it('returns an empty array for empty SQL', () => {
      expect(estimateBindParameters({ dbType: DBType.MySQL, sql: '' })).toEqual([]);
      expect(estimateBindParameters({ dbType: DBType.MySQL, sql: '   ' })).toEqual([]);
    });

    it('returns an empty array when there are no markers', () => {
      expect(
        estimateBindParameters({ dbType: DBType.MySQL, sql: 'SELECT * FROM t' }),
      ).toEqual([]);
    });
  });

  describe('location', () => {
    it('reports 1-based line/column for a single-line SQL', () => {
      const result = estimateBindParameters({ dbType: DBType.MySQL, sql: 'a = ?' });
      expect(result[0].location).toEqual({ line: 1, column: 5 });
    });

    it('reports the correct line for a marker on a later line', () => {
      const sql = 'SELECT *\nFROM t\nWHERE a = ?\n  AND b = ?';
      const result = estimateBindParameters({ dbType: DBType.MySQL, sql });
      expect(result.map((it) => it.location)).toEqual([
        { line: 3, column: 11 },
        { line: 4, column: 11 },
      ]);
    });

    it('reports the first occurrence for a deduped repeated marker', () => {
      const sql = 'a = $1\nOR b = $1';
      const result = estimateBindParameters({ dbType: DBType.Postgres, sql });
      expect(result).toHaveLength(1);
      expect(result[0].location).toEqual({ line: 1, column: 5 });
    });
  });

  describe('column metadata resolution', () => {
    function buildPerformanceLabDatabase(): RdsDatabase {
      const db = new RdsDatabase('perf-lab');
      const schema = new DbSchema('performance_lab');

      const orders = new DbTable('orders', 'TABLE');
      orders.addChild(new DbColumn('tenant_id', GeneralColumnType.INTEGER, { nullable: false }));
      orders.addChild(new DbColumn('status', GeneralColumnType.VARCHAR, { nullable: false }));
      orders.addChild(new DbColumn('created_at', GeneralColumnType.TIMESTAMP, { nullable: false }));
      orders.addChild(new DbColumn('customer_id', GeneralColumnType.INTEGER, { nullable: false }));
      schema.addChild(orders);

      const customers = new DbTable('customers', 'TABLE');
      customers.addChild(new DbColumn('id', GeneralColumnType.INTEGER, { key: 'PRI', nullable: false }));
      customers.addChild(new DbColumn('status', GeneralColumnType.VARCHAR, { nullable: false }));
      schema.addChild(customers);

      db.addChild(schema);
      return db;
    }

    it('resolves a fully-qualified schema.table.column reference', () => {
      const sql = 'SELECT * FROM performance_lab.orders o WHERE performance_lab.orders.tenant_id = ?';
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql,
        databaseResource: buildPerformanceLabDatabase(),
      });
      expect(result).toEqual([
        expect.objectContaining({
          estimatedColumn: 'performance_lab.orders.tenant_id',
          estimatedType: GeneralColumnType.INTEGER,
        }),
      ]);
    });

    it('resolves alias.column via a simple FROM/JOIN alias map', () => {
      const sql = `SELECT *
FROM performance_lab.orders o
JOIN performance_lab.customers c ON c.id = o.customer_id
WHERE o.tenant_id = ?
  AND o.status = ?
  AND o.created_at >= ?
  AND o.created_at <= ?`;
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql,
        databaseResource: buildPerformanceLabDatabase(),
      });

      expect(result.map((it) => [it.estimatedColumn, it.estimatedType])).toEqual([
        ['performance_lab.orders.tenant_id', GeneralColumnType.INTEGER],
        ['performance_lab.orders.status', GeneralColumnType.VARCHAR],
        ['performance_lab.orders.created_at', GeneralColumnType.TIMESTAMP],
        ['performance_lab.orders.created_at', GeneralColumnType.TIMESTAMP],
      ]);
    });

    it('resolves an unqualified column only when it is unique among referenced tables', () => {
      const sql = `SELECT *
FROM performance_lab.orders o
JOIN performance_lab.customers c ON c.id = o.customer_id
WHERE tenant_id = ?`;
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql,
        databaseResource: buildPerformanceLabDatabase(),
      });
      expect(result[0].estimatedColumn).toBe('performance_lab.orders.tenant_id');
    });

    it('leaves an unqualified column unresolved when it exists in multiple referenced tables', () => {
      const sql = `SELECT *
FROM performance_lab.orders o
JOIN performance_lab.customers c ON c.id = o.customer_id
WHERE status = ?`;
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql,
        databaseResource: buildPerformanceLabDatabase(),
      });
      expect(result[0].estimatedColumn).toBeUndefined();
      expect(result[0].estimatedType).toBe(GeneralColumnType.UNKNOWN);
    });

    it('leaves a column not present in the Resource tree unresolved', () => {
      const sql = 'SELECT * FROM performance_lab.orders o WHERE o.not_a_real_column = ?';
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql,
        databaseResource: buildPerformanceLabDatabase(),
      });
      expect(result[0].estimatedColumn).toBeUndefined();
      expect(result[0].estimatedType).toBe(GeneralColumnType.UNKNOWN);
    });

    it('does not guess a type from a function call or CAST around the placeholder', () => {
      const sql = `SELECT ROUND(SUM(o.total_amount), ?), COALESCE(?, o.status), CAST(? AS INTEGER)
FROM performance_lab.orders o`;
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql,
        databaseResource: buildPerformanceLabDatabase(),
      });
      expect(result).toHaveLength(3);
      expect(result.every((it) => it.estimatedColumn === undefined)).toBe(true);
      expect(result.every((it) => it.estimatedType === GeneralColumnType.UNKNOWN)).toBe(true);
    });

    it('does not mutate the Resource tree it was given', () => {
      const db = buildPerformanceLabDatabase();
      const before = JSON.stringify(db);
      estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT * FROM performance_lab.orders o WHERE o.tenant_id = ?',
        databaseResource: db,
      });
      expect(JSON.stringify(db)).toBe(before);
    });

    it('leaves everything unresolved when no databaseResource is given', () => {
      const result = estimateBindParameters({
        dbType: DBType.MySQL,
        sql: 'SELECT * FROM performance_lab.orders o WHERE o.tenant_id = ?',
      });
      expect(result[0].estimatedColumn).toBeUndefined();
      expect(result[0].estimatedType).toBe(GeneralColumnType.UNKNOWN);
    });
  });
});
