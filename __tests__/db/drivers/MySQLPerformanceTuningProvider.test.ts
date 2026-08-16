import {
  ConnectionSetting,
  DBType,
  extractMysqlPredicateColumns,
  MySQLDriver,
  MySQLPerformanceTuningProvider,
  parseMysqlPlan,
} from '../../../src';
import { init } from '../../setup/mysql';

describe('extractMysqlPredicateColumns', () => {
  it('pulls the bare column name out of a backtick-qualified predicate', () => {
    expect(
      extractMysqlPredicateColumns("(`test-db`.`perf_orders`.`status` = 'shipped')"),
    ).toEqual(['status']);
  });

  it('returns an empty array for missing/empty/unqualified predicates', () => {
    expect(extractMysqlPredicateColumns(undefined)).toEqual([]);
    expect(extractMysqlPredicateColumns('')).toEqual([]);
    // No backticks at all - this heuristic is MySQL-attached_condition-
    // specific (always backtick-quoted), unlike Postgres's plain-identifier one.
    expect(extractMysqlPredicateColumns('status = 1')).toEqual([]);
  });
});

describe('parseMysqlPlan', () => {
  it('resolves a single table scan with a WHERE-pushed filter', () => {
    const { planNode, mappings, warnings } = parseMysqlPlan({
      query_block: {
        select_id: 1,
        cost_info: { query_cost: '5.25' },
        table: {
          table_name: 'perf_orders',
          access_type: 'ALL',
          rows_examined_per_scan: 50,
          rows_produced_per_join: 10,
          attached_condition: "(`test-db`.`perf_orders`.`status` = 'shipped')",
          cost_info: { prefix_cost: '5.25' },
        },
      },
    });

    expect(warnings).toEqual([]);
    expect(mappings).toEqual([
      expect.objectContaining({
        planNodeId: 'n0',
        tableName: 'perf_orders',
        estimatedRows: 10,
        filterColumns: ['status'],
      }),
    ]);
    expect(planNode).toMatchObject({
      id: 'n0',
      operation: 'ALL',
      relation: { tableName: 'perf_orders' },
      predicates: ["(`test-db`.`perf_orders`.`status` = 'shipped')"],
      estimated: { rows: 10, totalCost: 5.25 },
    });
  });

  it('resolves a nested_loop join into a synthetic parent with one child per table', () => {
    const { planNode, mappings } = parseMysqlPlan({
      query_block: {
        select_id: 1,
        nested_loop: [
          {
            table: {
              table_name: 'c',
              access_type: 'index',
              used_key_parts: ['customer_no'],
              rows_produced_per_join: 5,
            },
          },
          {
            table: {
              table_name: 'o',
              access_type: 'ref',
              key: 'idx_perf_orders_customer_status',
              used_key_parts: ['customer_id', 'status'],
              ref: ['test-db.c.customer_no', 'const'],
              rows_produced_per_join: 25,
            },
          },
        ],
      },
    });

    expect(planNode.operation).toBe('Nested Loop');
    expect(planNode.children).toHaveLength(2);
    expect(planNode.children.map((c) => c.relation?.tableName)).toEqual(['c', 'o']);
    expect(mappings.map((m) => m.tableName)).toEqual(['c', 'o']);
    const oMapping = mappings.find((m) => m.tableName === 'o')!;
    expect(oMapping.indexName).toBe('idx_perf_orders_customer_status');
    expect(oMapping.filterColumns).toEqual(['customer_id', 'status']);
  });

  it('surfaces GROUP BY/ORDER BY temp-table and filesort as node warnings, not verdicts', () => {
    const { planNode } = parseMysqlPlan({
      query_block: {
        select_id: 1,
        ordering_operation: {
          using_filesort: false,
          grouping_operation: {
            using_temporary_table: true,
            using_filesort: true,
            table: { table_name: 'perf_orders', access_type: 'index', rows_produced_per_join: 50 },
          },
        },
      },
    });

    expect(planNode.operation).toBe('Order By');
    const groupBy = planNode.children[0];
    expect(groupBy.operation).toBe('Group By');
    expect(groupBy.warnings).toEqual(['Uses a temporary table.', 'Uses filesort.']);
  });

  it('does not resolve a derived table placeholder as a real table, but still walks its subquery', () => {
    const { planNode, mappings, warnings } = parseMysqlPlan({
      query_block: {
        select_id: 1,
        table: {
          table_name: '<derived2>',
          access_type: 'ALL',
          materialized_from_subquery: {
            using_temporary_table: true,
            query_block: {
              select_id: 2,
              table: { table_name: 'perf_orders', access_type: 'index', rows_produced_per_join: 50 },
            },
          },
        },
      },
    });

    expect(mappings.map((m) => m.tableName)).toEqual(['perf_orders']);
    expect(warnings).toEqual([
      expect.stringContaining('Could not resolve a table for plan node n0 (<derived2>)'),
    ]);
    expect(planNode.relation).toBeUndefined();
    expect(planNode.children[0].operation).toBe('Materialized Subquery');
  });

  it('never throws on malformed/unexpected input, still returning a usable (empty) tree', () => {
    for (const input of [undefined, null, 'not an object', {}, { query_block: {} }]) {
      const { planNode, mappings } = parseMysqlPlan(input);
      expect(mappings).toEqual([]);
      expect(planNode.children).toEqual([]);
    }
  });
});

describe('MySQLPerformanceTuningProvider', () => {
  const makeDriver = (requestSql: jest.Mock, getTableDDL: jest.Mock = jest.fn()) => ({
    requestSql,
    getTableDDL,
  });

  it('builds EXPLAIN FORMAT=JSON and resolves the plan + table mappings', async () => {
    const explainRoot = {
      query_block: {
        select_id: 1,
        table: { table_name: 'perf_orders', access_type: 'ALL', rows_produced_per_join: 10 },
      },
    };
    const requestSql = jest.fn().mockResolvedValue({
      rows: [{ values: { EXPLAIN: JSON.stringify(explainRoot) } }],
    });
    const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'test-db',
        statement: { sql: "SELECT * FROM perf_orders WHERE status = 'shipped'", source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(requestSql).toHaveBeenCalledWith({
      sql: "EXPLAIN FORMAT=JSON SELECT * FROM perf_orders WHERE status = 'shipped'",
      conditions: { rawQueries: true, binds: undefined },
      meta: { type: 'performanceTuningContext' },
    });
    expect(result.ok).toBe(true);
    expect(result.result!.raw).toEqual(explainRoot);
    expect(result.result!.planTableMappings).toHaveLength(1);
    expect(result.result!.normalizedPlan).toMatchObject({ id: 'n0', operation: 'ALL' });
  });

  it('accepts an already-parsed-object EXPLAIN value the same way as a JSON string', async () => {
    const explainRoot = { query_block: { select_id: 1, table: { table_name: 't', access_type: 'ALL' } } };
    const requestSql = jest.fn().mockResolvedValue({ rows: [{ values: { EXPLAIN: explainRoot } }] });
    const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      { databaseName: 'test-db', statement: { sql: 'SELECT 1', source: 'editor' }, plan: {} },
      { timeoutMs: 5000 },
    );
    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings).toHaveLength(1);
  });

  it('rejects analyze mode without querying the database at all', async () => {
    const requestSql = jest.fn();
    const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'test-db',
        statement: { sql: 'SELECT 1', source: 'editor' },
        plan: { mode: 'analyze', allowExecution: true },
      },
      { timeoutMs: 5000 },
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Analyze mode is not implemented yet');
    expect(requestSql).not.toHaveBeenCalled();
  });

  it('surfaces a failed EXPLAIN with detail instead of throwing', async () => {
    const requestSql = jest.fn().mockRejectedValue(new Error("Table 'test-db.orders' doesn't exist"));
    const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      { databaseName: 'test-db', statement: { sql: 'SELECT * FROM orders', source: 'editor' }, plan: {} },
      { timeoutMs: 5000 },
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Failed to retrieve the execution plan.');
    expect(result.message).toContain("doesn't exist");
  });

  const target = { databaseName: 'test-db', tableName: 'perf_orders' };
  const options = {
    limits: { maxTables: 8, maxColumnsPerTable: 40, maxIndexesPerTable: 20, maxPayloadBytes: 200_000 },
    timeoutMs: 5000,
  };

  const routedRequestSql = (rowsBySection: {
    columns?: unknown[];
    constraints?: unknown[];
    checkConstraints?: unknown[];
    indexes?: unknown[];
    tableStatistics?: unknown[];
    cardinality?: unknown[];
    histogram?: unknown[];
  }) =>
    jest.fn(async (params: { sql: string; conditions?: { binds?: string[] }; meta?: unknown }) => {
      const { sql } = params;
      if (sql.includes('information_schema.COLUMNS')) {
        return { rows: (rowsBySection.columns ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM information_schema.CHECK_CONSTRAINTS')) {
        return { rows: (rowsBySection.checkConstraints ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM information_schema.TABLE_CONSTRAINTS')) {
        return { rows: (rowsBySection.constraints ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM information_schema.STATISTICS') && sql.includes('SEQ_IN_INDEX = 1')) {
        return { rows: (rowsBySection.cardinality ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM information_schema.STATISTICS')) {
        return { rows: (rowsBySection.indexes ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM information_schema.COLUMN_STATISTICS')) {
        return { rows: (rowsBySection.histogram ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM information_schema.TABLES')) {
        return { rows: (rowsBySection.tableStatistics ?? []).map((values) => ({ values })) };
      }
      throw new Error(`MySQLPerformanceTuningProvider.test.ts: unrouted SQL: ${sql}`);
    });

  describe('collectTableDefinition', () => {
    it('assembles columns/constraints/indexes and reuses getTableDDL() for the ddl text', async () => {
      const requestSql = routedRequestSql({
        columns: [
          { name: 'id', data_type: 'int', column_type: 'int', is_nullable: 'NO', column_default: null, ordinal_position: 1, comment: '' },
        ],
        constraints: [
          { constraint_name: 'PRIMARY', constraint_type: 'PRIMARY KEY', column_name: 'id', ordinal_position: 1 },
        ],
        indexes: [
          { index_name: 'PRIMARY', non_unique: 0, seq_in_index: 1, column_name: 'id', expression: null, collation: 'A', index_type: 'BTREE' },
        ],
      });
      const getTableDDL = jest.fn().mockResolvedValue('CREATE TABLE `perf_orders` (...)');
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql, getTableDDL));

      const result = await provider.collectTableDefinition(target, options);

      expect(result.ok).toBe(true);
      expect(result.result!.columns).toHaveLength(1);
      expect(result.result!.constraints).toHaveLength(1);
      expect(result.result!.indexes).toHaveLength(1);
      expect(result.result!.ddl).toBe('CREATE TABLE `perf_orders` (...)');
      // schemaName falls back to databaseName ('test-db') rather than being
      // left undefined - see collectDdl()'s comment on why this must never
      // rely on getTableDDL()'s own "current database" default.
      expect(getTableDDL).toHaveBeenCalledWith({ tableName: 'perf_orders', schemaName: 'test-db' });

      // Every catalog query is scoped to exactly this one table (§9.3), and
      // tagged as internal collection (§6.3).
      for (const call of requestSql.mock.calls) {
        expect(call[0].conditions.binds[1]).toBe('perf_orders');
        expect(call[0].meta).toEqual({ type: 'performanceTuningContext' });
      }
    });

    it('reports the table as not found when the columns query returns nothing', async () => {
      const requestSql = routedRequestSql({});
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableDefinition(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });

    it('still succeeds with a warning when getTableDDL() fails', async () => {
      const requestSql = routedRequestSql({
        columns: [{ name: 'id', data_type: 'int', column_type: 'int', is_nullable: 'NO', ordinal_position: 1 }],
      });
      const getTableDDL = jest.fn().mockRejectedValue(new Error('access denied'));
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql, getTableDDL));

      const result = await provider.collectTableDefinition(target, options);
      expect(result.ok).toBe(true);
      expect(result.result!.ddl).toBeUndefined();
      expect(result.message).toContain('ddl');
      expect(result.message).toContain('access denied');
    });
  });

  describe('collectTableStatistics', () => {
    it('maps a single-row result and sums DATA_LENGTH + INDEX_LENGTH', async () => {
      const requestSql = routedRequestSql({
        tableStatistics: [{ table_rows: 50, data_length: 16384, index_length: 49152, data_free: 0, update_time: null }],
      });
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(true);
      expect(result.result!.estimatedRowCount?.value).toBe(50);
      expect(result.result!.totalBytes?.value).toBe(65536);
    });

    it('reports not found instead of a fabricated empty statistics object', async () => {
      const requestSql = routedRequestSql({ tableStatistics: [] });
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });
  });

  describe('collectColumnStatistics', () => {
    it('builds one IN(...) placeholder per requested column and combines cardinality + histogram', async () => {
      const requestSql = routedRequestSql({
        cardinality: [{ column_name: 'status', cardinality: 2 }],
        histogram: [
          {
            column_name: 'status',
            histogram: { 'null-values': 0, 'histogram-type': 'singleton', buckets: [[1], [2]] },
          },
        ],
      });
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics(
        { ...target, columnNames: ['status', 'customer_id'] },
        options,
      );

      expect(result.ok).toBe(true);
      expect(result.result!.map((c) => c.columnName)).toEqual(['status', 'customer_id']);
      expect(result.result![0].distinctCount?.value).toBe(2);
      expect(result.result![0].nullFraction?.value).toBe(0);
      expect(result.result![1].distinctCount).toBeUndefined();

      const [cardinalityCall] = requestSql.mock.calls;
      expect(cardinalityCall[0].sql).toContain('COLUMN_NAME IN (?, ?)');
      expect(cardinalityCall[0].conditions.binds).toEqual(['test-db', 'perf_orders', 'status', 'customer_id']);
    });

    it('returns an empty result without querying when no columns are requested', async () => {
      const requestSql = jest.fn();
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics({ ...target, columnNames: [] }, options);
      expect(result).toEqual({ ok: true, message: '', result: [] });
      expect(requestSql).not.toHaveBeenCalled();
    });
  });

  describe('collectPhysicalHealth', () => {
    it('maps dataFreeBytes/lastUpdatedAt', async () => {
      const requestSql = routedRequestSql({
        tableStatistics: [{ data_free: 4096, update_time: new Date('2026-08-16T00:00:00.000Z') }],
      });
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(true);
      const byName = Object.fromEntries(result.result!.metrics.map((m) => [m.name, m.value]));
      expect(byName.dataFreeBytes).toBe(4096);
    });

    it('wraps a rejected query into a GeneralResult instead of throwing', async () => {
      const requestSql = jest.fn().mockRejectedValue(new Error('connection reset'));
      const provider = new MySQLPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('Failed to collect physical health');
    });
  });

  it('reports capability status: everything true except analyzedExecutionPlan', async () => {
    const provider = new MySQLPerformanceTuningProvider(makeDriver(jest.fn()));
    const result = await provider.checkCapabilities({ databaseName: 'test-db' });

    expect(result.ok).toBe(true);
    expect(result.result).toEqual({
      executionPlan: { available: true, source: 'EXPLAIN FORMAT=JSON' },
      analyzedExecutionPlan: expect.objectContaining({ available: false }),
      tableDefinition: expect.objectContaining({ available: true }),
      optimizerStatistics: expect.objectContaining({ available: true }),
      physicalHealth: expect.objectContaining({ available: true }),
    });
  });
});

// Runs the actual catalog SQL against a live MySQL (the same Docker fixture
// __tests__/db/drivers/MySQLDriver.test.ts uses), not stubbed rows - same
// rationale as PostgresPerformanceTuningProvider.test.ts's live suite.
describe('MySQLPerformanceTuningProvider (live MySQL)', () => {
  const connectOption: ConnectionSetting = {
    host: '127.0.0.1',
    port: 6001,
    user: 'testuser',
    password: 'testpass',
    database: 'test-db',
    dbType: DBType.MySQL,
    name: 'mysql-performance-tuning-test',
  };
  const target = { databaseName: 'test-db', tableName: 'perf_orders' };
  const options = {
    limits: { maxTables: 8, maxColumnsPerTable: 40, maxIndexesPerTable: 20, maxPayloadBytes: 200_000 },
    timeoutMs: 5000,
  };

  let driver: MySQLDriver;
  let provider: MySQLPerformanceTuningProvider;

  beforeAll(async () => {
    await init();
    driver = new MySQLDriver(connectOption);
    await driver.connect();
    provider = new MySQLPerformanceTuningProvider(driver);
  });

  afterAll(async () => {
    await driver?.disconnect();
  });

  it('retrieves an estimate plan and resolves perf_orders from it', async () => {
    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'test-db',
        statement: { sql: "SELECT * FROM perf_orders WHERE status = 'shipped'", source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings?.[0]).toMatchObject({ tableName: 'perf_orders' });
    expect(result.result!.raw).toMatchObject({ query_block: expect.objectContaining({}) });
  });

  it('collects DDL/columns/constraints/indexes for perf_orders, including the CHECK constraint and functional index', async () => {
    const result = await provider.collectTableDefinition(target, options);

    expect(result.ok).toBe(true);
    const def = result.result!;

    expect(def.columns.map((c) => c.columnName)).toEqual(
      expect.arrayContaining(['id', 'customer_id', 'status', 'amount']),
    );
    const idColumn = def.columns.find((c) => c.columnName === 'id')!;
    expect(idColumn.nullable).toBe(false);

    expect(def.constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'primaryKey', columns: ['id'] }),
        expect.objectContaining({ type: 'check', checkExpression: expect.stringContaining('amount') }),
      ]),
    );

    const indexNames = def.indexes.map((i) => i.indexName);
    expect(indexNames).toEqual(
      expect.arrayContaining([
        'PRIMARY',
        'idx_perf_orders_customer_status',
        'idx_perf_orders_lower_status',
        'uq_perf_orders_id_status',
      ]),
    );
    const functional = def.indexes.find((i) => i.indexName === 'idx_perf_orders_lower_status')!;
    expect(functional.columns[0].expression).toContain('lower');
    const composite = def.indexes.find((i) => i.indexName === 'idx_perf_orders_customer_status')!;
    expect(composite.columns.map((c) => c.columnName)).toEqual(['customer_id', 'status']);

    expect(def.ddl).toContain('CREATE TABLE');
    expect(def.ddl).toContain('perf_orders');
  });

  it('reports table statistics with real row counts and byte sizes', async () => {
    const result = await provider.collectTableStatistics(target, options);
    expect(result.ok).toBe(true);
    expect(result.result!.estimatedRowCount?.value).toBeGreaterThan(0);
    expect(result.result!.tableBytes?.value).toBeGreaterThan(0);
  });

  it('reports column statistics only for the requested columns, using CARDINALITY and the histogram', async () => {
    const result = await provider.collectColumnStatistics({ ...target, columnNames: ['status'] }, options);
    expect(result.ok).toBe(true);
    expect(result.result!.map((c) => c.columnName)).toEqual(['status']);
    // perf_orders has exactly 2 distinct status values ('new'/'shipped').
    expect(result.result![0].distinctCount?.value).toBe(2);
    expect(result.result![0].histogramType?.value).toBe('singleton');
  });

  it('reports physical health metrics without a maintenance verdict', async () => {
    const result = await provider.collectPhysicalHealth(target, options);
    expect(result.ok).toBe(true);
    expect(result.result!.metrics.map((m) => m.name)).toEqual(expect.arrayContaining(['dataFreeBytes']));
  });

  it('reports a table that does not exist as not found, not a thrown error', async () => {
    const result = await provider.collectTableDefinition(
      { ...target, tableName: 'no_such_table_xyz' },
      options,
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('was not found');
  });

  it('end-to-end via getPerformanceTuningContext(): a complete, schema-valid partial-or-complete context', async () => {
    const result = await driver.getPerformanceTuningContext({
      databaseName: 'test-db',
      statement: { sql: "SELECT * FROM perf_orders WHERE status = 'shipped'", source: 'editor' },
      plan: {},
    });

    expect(result.ok).toBe(true);
    const context = result.result!;
    expect(context.tables).toHaveLength(1);
    expect(context.tables[0].tableName).toBe('perf_orders');
    expect(context.tables[0].definition?.columns.length).toBeGreaterThan(0);
    expect(context.tables[0].statistics?.estimatedRowCount?.value).toBeGreaterThan(0);
    expect(context.database.version).toBeDefined();
  });

  it("resolves an aliased table via targetTables, MySQL's own EXPLAIN JSON not exposing the real name", async () => {
    // Without targetTables: the plan only knows the alias "o", which does
    // not exist as a real table - the section fails as "not found" (an
    // honest degradation, not a crash).
    const withoutHint = await driver.getPerformanceTuningContext({
      databaseName: 'test-db',
      statement: { sql: "SELECT o.status FROM perf_orders o WHERE o.status = 'shipped'", source: 'editor' },
      plan: {},
    });
    expect(withoutHint.ok).toBe(true);
    expect(withoutHint.result!.tables[0].tableName).toBe('o');
    expect(withoutHint.result!.tables[0].definition).toBeUndefined();

    // With the explicit hint: the real table gets collected as normal.
    const withHint = await driver.getPerformanceTuningContext({
      databaseName: 'test-db',
      statement: { sql: "SELECT o.status FROM perf_orders o WHERE o.status = 'shipped'", source: 'editor' },
      plan: {},
      targetTables: [{ tableName: 'perf_orders' }],
    });
    expect(withHint.ok).toBe(true);
    const tableNames = withHint.result!.tables.map((t) => t.tableName);
    expect(tableNames).toContain('perf_orders');
    const realTable = withHint.result!.tables.find((t) => t.tableName === 'perf_orders')!;
    expect(realTable.definition?.columns.length).toBeGreaterThan(0);
  });
});
