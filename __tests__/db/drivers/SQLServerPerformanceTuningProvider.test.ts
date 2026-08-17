import {
  ConnectionSetting,
  DBType,
  extractSqlServerPredicateColumns,
  parseSqlServerPlan,
  SQLServerDriver,
  SQLServerPerformanceTuningProvider,
} from '../../../src';
import { init } from '../../setup/mssql';

describe('extractSqlServerPredicateColumns', () => {
  it('pulls the bare column name out of a bracket-qualified predicate', () => {
    expect(
      extractSqlServerPredicateColumns("[testdb].[perf].[perf_orders].[status]='shipped'"),
    ).toEqual(['status']);
  });

  it('ignores the right-hand side of a SEEK predicate (only the side before the operator counts)', () => {
    expect(
      extractSqlServerPredicateColumns(
        '[o].[customer_id]=[testdb].[testdb].[DEPT].[DEPTNO] as [d].[DEPTNO]',
      ),
    ).toEqual(['customer_id']);
  });

  it('returns an empty array for missing/empty/unqualified predicates', () => {
    expect(extractSqlServerPredicateColumns(undefined)).toEqual([]);
    expect(extractSqlServerPredicateColumns('')).toEqual([]);
    expect(extractSqlServerPredicateColumns('status = 1')).toEqual([]);
  });
});

describe('parseSqlServerPlan', () => {
  const row = (overrides: Record<string, unknown>): Record<string, unknown> => ({
    StmtText: '',
    StmtId: 1,
    NodeId: 1,
    Parent: 0,
    PhysicalOp: null,
    LogicalOp: null,
    Argument: null,
    DefinedValues: null,
    EstimateRows: null,
    EstimateIO: null,
    EstimateCPU: null,
    AvgRowSize: null,
    TotalSubtreeCost: null,
    OutputList: null,
    Warnings: null,
    Type: 'PLAN_ROW',
    Parallel: false,
    EstimateExecutions: null,
    ...overrides,
  });

  it('resolves a single Clustered Index Scan with a WHERE-pushed filter, and the real table name (not an alias)', () => {
    const rows = [
      row({ NodeId: 1, Parent: 0, Type: 'SELECT', EstimateRows: 10, TotalSubtreeCost: 0.0033 }),
      row({
        NodeId: 2,
        Parent: 1,
        PhysicalOp: 'Clustered Index Scan',
        LogicalOp: 'Clustered Index Scan',
        Argument:
          "OBJECT:([testdb].[perf].[perf_orders].[PK__perf_ord__1]), WHERE:([testdb].[perf].[perf_orders].[status]='shipped')",
        EstimateRows: 10,
        AvgRowSize: 31,
        TotalSubtreeCost: 0.0033,
      }),
    ];

    const { planNode, mappings, diagnostics } = parseSqlServerPlan(rows);
    expect(diagnostics).toEqual([]);
    expect(planNode.operation).toBe('SELECT');
    expect(planNode.children).toHaveLength(1);
    const scan = planNode.children[0];
    expect(scan.operation).toBe('Clustered Index Scan');
    expect(scan.relation).toEqual({ schemaName: 'perf', tableName: 'perf_orders', alias: undefined });
    expect(scan.indexName).toBe('PK__perf_ord__1');
    expect(scan.predicates).toEqual(["[testdb].[perf].[perf_orders].[status]='shipped'"]);
    expect(mappings).toEqual([
      expect.objectContaining({
        schemaName: 'perf',
        tableName: 'perf_orders',
        indexName: 'PK__perf_ord__1',
        estimatedRows: 10,
        filterColumns: ['status'],
      }),
    ]);
  });

  it('resolves an aliased Nested Loops join into a two-child tree, alias carried alongside the real table name', () => {
    const rows = [
      row({ NodeId: 1, Parent: 0, Type: 'SELECT', EstimateRows: 1 }),
      row({
        NodeId: 2,
        Parent: 1,
        PhysicalOp: 'Nested Loops',
        LogicalOp: 'Inner Join',
        Argument: 'OUTER REFERENCES:([d].[DEPTNO])',
      }),
      row({
        NodeId: 3,
        Parent: 2,
        PhysicalOp: 'Clustered Index Scan',
        LogicalOp: 'Clustered Index Scan',
        Argument: 'OBJECT:([testdb].[testdb].[DEPT].[PK__DEPT__1] AS [d])',
      }),
      row({
        NodeId: 4,
        Parent: 2,
        PhysicalOp: 'Index Seek',
        LogicalOp: 'Index Seek',
        Argument:
          "OBJECT:([testdb].[perf].[perf_orders].[idx_perf_orders_customer_status] AS [o]), SEEK:([o].[customer_id]=[testdb].[testdb].[DEPT].[DEPTNO] as [d].[DEPTNO] AND [o].[status]='shipped') ORDERED FORWARD",
      }),
    ];

    const { planNode, mappings } = parseSqlServerPlan(rows);
    const join = planNode.children[0];
    expect(join.operation).toBe('Nested Loops');
    expect(join.joinType).toBe('Inner Join');
    expect(join.children).toHaveLength(2);
    expect(join.children.map((c) => c.relation?.alias)).toEqual(['d', 'o']);
    expect(join.children.map((c) => c.relation?.tableName)).toEqual(['DEPT', 'perf_orders']);

    const oMapping = mappings.find((m) => m.alias === 'o')!;
    expect(oMapping.tableName).toBe('perf_orders');
    expect(oMapping.indexName).toBe('idx_perf_orders_customer_status');
    expect(oMapping.filterColumns).toEqual(['customer_id', 'status']);
  });

  it('surfaces LogicalOp as joinType only for an actual join operator, not e.g. Aggregate', () => {
    const rows = [
      row({ NodeId: 1, Parent: 0, Type: 'SELECT' }),
      row({ NodeId: 2, Parent: 1, PhysicalOp: 'Stream Aggregate', LogicalOp: 'Aggregate' }),
    ];
    const { planNode } = parseSqlServerPlan(rows);
    expect(planNode.children[0].joinType).toBeUndefined();
  });

  it('surfaces the native Warnings column as PLAN_OBSERVATION information, not a warning', () => {
    // SQL Server's own "NO STATS" text is a fact the optimizer reported
    // about this node, not a driver-side collection gap (§8 Step 1
    // inventory) - it must not silently disappear (it used to only live on
    // PlanNode.warnings, invisible to collection.status) nor turn the
    // result 'partial' on its own.
    const rows = [
      row({ NodeId: 1, Parent: 0, Type: 'SELECT' }),
      row({
        NodeId: 2,
        Parent: 1,
        PhysicalOp: 'Table Scan',
        Warnings: 'NO STATS: ([testdb].[perf].[heap_table].[a])',
      }),
    ];
    const { planNode, diagnostics } = parseSqlServerPlan(rows);
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'PLAN_OBSERVATION',
        severity: 'info',
        affectsCompleteness: false,
        message: 'NO STATS: ([testdb].[perf].[heap_table].[a])',
        node: { id: planNode.children[0].id, operation: 'Table Scan' },
      }),
    ]);
  });

  it('warns instead of silently dropping a node whose OBJECT:(...) clause could not be parsed', () => {
    // An OBJECT:(...) clause is present (so this is clearly meant to be a
    // table access) but has fewer than the 3 segments this parser expects
    // ([database].[schema].[table], optionally + [index]) - an honest
    // degrade to a warning, never a guessed table (§4.3).
    const rows = [
      row({ NodeId: 1, Parent: 0, Type: 'SELECT' }),
      row({
        NodeId: 2,
        Parent: 1,
        PhysicalOp: 'Table Scan',
        Argument: 'OBJECT:([testdb].[perf])',
      }),
    ];
    const { planNode, mappings, diagnostics } = parseSqlServerPlan(rows);
    expect(mappings).toEqual([]);
    // §4.3: a short excerpt of the Argument that failed to parse is kept as
    // technical detail, not just the fact that resolution failed.
    expect(diagnostics[0].message).toContain('OBJECT:([testdb].[perf])');
    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: 'TABLE_MAPPING_FAILED',
        severity: 'warning',
        affectsCompleteness: true,
        message: expect.stringContaining(`Could not resolve a table for plan node ${planNode.children[0].id}`),
        node: { id: planNode.children[0].id, operation: 'Table Scan' },
      }),
    ]);
  });

  it('reconstructs the tree from NodeId/Parent even when NodeId values are non-contiguous', () => {
    const rows = [
      row({ NodeId: 1, Parent: 0, Type: 'UPDATE' }),
      row({ NodeId: 5, Parent: 1, PhysicalOp: 'Clustered Index Update' }),
      row({ NodeId: 10, Parent: 5, PhysicalOp: 'Compute Scalar' }),
    ];
    const { planNode } = parseSqlServerPlan(rows);
    expect(planNode.children[0].children[0].operation).toBe('Compute Scalar');
  });

  it('never throws on malformed/unexpected input, still returning a usable (empty) tree', () => {
    for (const input of [undefined, null, 'not an array', [], [{}], [{ NodeId: 'x' }]] as unknown[][]) {
      const { planNode, mappings } = parseSqlServerPlan(input);
      expect(mappings).toEqual([]);
      expect(planNode.children).toEqual([]);
    }
  });
});

describe('SQLServerPerformanceTuningProvider', () => {
  const makeDriver = (
    requestSql: jest.Mock,
    collectPerformanceTuningShowplan: jest.Mock = jest.fn(),
  ) => ({
    requestSql,
    collectPerformanceTuningShowplan,
  });

  it('runs SHOWPLAN via the dedicated driver method and resolves the plan + table mappings', async () => {
    const showplanRows = [
      { StmtId: 1, NodeId: 1, Parent: 0, Type: 'SELECT', EstimateRows: 10 },
      {
        StmtId: 1,
        NodeId: 2,
        Parent: 1,
        PhysicalOp: 'Clustered Index Scan',
        Argument: "OBJECT:([testdb].[perf].[perf_orders].[PK__1]), WHERE:([testdb].[perf].[perf_orders].[status]='shipped')",
        EstimateRows: 10,
      },
    ];
    const collectPerformanceTuningShowplan = jest
      .fn()
      .mockResolvedValue({ rows: showplanRows.map((values) => ({ values })) });
    const provider = new SQLServerPerformanceTuningProvider(
      makeDriver(jest.fn(), collectPerformanceTuningShowplan),
    );

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: { sql: "SELECT * FROM perf.perf_orders WHERE status = 'shipped'", source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(collectPerformanceTuningShowplan).toHaveBeenCalledWith({
      sql: "SELECT * FROM perf.perf_orders WHERE status = 'shipped'",
      conditions: { rawQueries: true, binds: undefined },
      meta: { type: 'performanceTuningContext' },
    });
    expect(result.ok).toBe(true);
    expect(result.result!.raw).toEqual(showplanRows);
    expect(result.result!.planTableMappings).toHaveLength(1);
    expect(result.result!.normalizedPlan).toMatchObject({ operation: 'SELECT' });
  });

  it('rejects analyze mode without querying the database at all', async () => {
    const collectPerformanceTuningShowplan = jest.fn();
    const provider = new SQLServerPerformanceTuningProvider(
      makeDriver(jest.fn(), collectPerformanceTuningShowplan),
    );

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: { sql: 'SELECT 1', source: 'editor' },
        plan: { mode: 'analyze', allowExecution: true },
      },
      { timeoutMs: 5000 },
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Analyze mode is not implemented yet');
    expect(collectPerformanceTuningShowplan).not.toHaveBeenCalled();
  });

  it('surfaces a failed SHOWPLAN with detail instead of throwing', async () => {
    const collectPerformanceTuningShowplan = jest
      .fn()
      .mockRejectedValue(new Error("Invalid object name 'orders'."));
    const provider = new SQLServerPerformanceTuningProvider(
      makeDriver(jest.fn(), collectPerformanceTuningShowplan),
    );

    const result = await provider.collectExecutionPlan(
      { databaseName: 'testdb', statement: { sql: 'SELECT * FROM orders', source: 'editor' }, plan: {} },
      { timeoutMs: 5000 },
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Failed to retrieve the execution plan.');
    expect(result.message).toContain('Invalid object name');
  });

  const target = { databaseName: 'testdb', schemaName: 'testdb', tableName: 'perf_orders' };
  const options = {
    limits: { maxTables: 8, maxColumnsPerTable: 40, maxIndexesPerTable: 20, maxPayloadBytes: 200_000 },
    timeoutMs: 5000,
  };

  const routedRequestSql = (rowsBySection: {
    columns?: unknown[];
    constraints?: unknown[];
    foreignKeys?: unknown[];
    checkConstraints?: unknown[];
    indexes?: unknown[];
    tableSize?: unknown[];
    stats?: unknown[];
    physicalHealth?: unknown[];
    statsLookup?: unknown[];
    histogram?: unknown[];
    statsProperties?: unknown[];
  }) =>
    jest.fn(async (params: { sql: string; conditions?: { binds?: string[] }; meta?: unknown }) => {
      const { sql } = params;
      if (sql.includes('FROM sys.columns c')) {
        return { rows: (rowsBySection.columns ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM sys.key_constraints kc')) {
        return { rows: (rowsBySection.constraints ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM sys.foreign_keys fk')) {
        return { rows: (rowsBySection.foreignKeys ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM sys.check_constraints cc')) {
        return { rows: (rowsBySection.checkConstraints ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM sys.indexes i')) {
        return { rows: (rowsBySection.indexes ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('sys.allocation_units a')) {
        return { rows: (rowsBySection.tableSize ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('CROSS APPLY sys.dm_db_stats_properties')) {
        return { rows: (rowsBySection.stats ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('sys.dm_db_index_physical_stats')) {
        return { rows: (rowsBySection.physicalHealth ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM sys.stats_columns sc')) {
        return { rows: (rowsBySection.statsLookup ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('sys.dm_db_stats_histogram')) {
        return { rows: (rowsBySection.histogram ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM sys.dm_db_stats_properties')) {
        return { rows: (rowsBySection.statsProperties ?? []).map((values) => ({ values })) };
      }
      throw new Error(`SQLServerPerformanceTuningProvider.test.ts: unrouted SQL: ${sql}`);
    });

  describe('collectTableDefinition', () => {
    it('assembles columns/constraints/indexes and renders its own DDL (no SHOW CREATE TABLE equivalent)', async () => {
      const requestSql = routedRequestSql({
        columns: [
          { name: 'id', data_type: 'int', column_type: 'int', is_nullable: false, ordinal_position: 1 },
        ],
        constraints: [
          { constraint_name: 'PK__perf_orders', constraint_type: 'PRIMARY KEY', column_name: 'id', ordinal_position: 1 },
        ],
        indexes: [
          {
            index_name: 'PK__perf_orders',
            is_unique: true,
            is_primary: true,
            index_type: 'CLUSTERED',
            predicate: null,
            seq_in_index: 1,
            is_included: false,
            is_descending: false,
            column_id: 1,
            column_name: 'id',
          },
        ],
      });
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableDefinition(target, options);

      expect(result.ok).toBe(true);
      expect(result.result!.columns).toHaveLength(1);
      expect(result.result!.constraints).toHaveLength(1);
      expect(result.result!.indexes).toHaveLength(1);
      expect(result.result!.ddl).toContain('CREATE TABLE');

      // Every catalog query is scoped to exactly this one table (§9.3), and
      // tagged as internal collection (§6.3).
      for (const call of requestSql.mock.calls) {
        expect(call[0].conditions.binds[1]).toBe('perf_orders');
        expect(call[0].meta).toEqual({ type: 'performanceTuningContext' });
      }
    });

    it('reports the table as not found when the columns query returns nothing', async () => {
      const requestSql = routedRequestSql({});
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableDefinition(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });
  });

  describe('collectTableStatistics', () => {
    it('maps a single-row result, coercing string-typed SUM() results', async () => {
      const requestSql = routedRequestSql({
        tableSize: [{ row_count: '50', table_bytes: '16384', index_bytes: '49152', total_bytes: '65536' }],
        stats: [{ last_updated: new Date('2026-08-16T00:00:00.000Z'), modification_counter: '0' }],
      });
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(true);
      expect(result.result!.estimatedRowCount?.value).toBe(50);
      expect(result.result!.totalBytes?.value).toBe(65536);
    });

    it('reports not found instead of a fabricated empty statistics object', async () => {
      const requestSql = routedRequestSql({ tableSize: [] });
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });
  });

  describe('collectColumnStatistics', () => {
    it('resolves the leading-column statistics object per column, then reads its histogram', async () => {
      const requestSql = routedRequestSql({
        statsLookup: [{ column_name: 'status', stats_id: 2, column_count: 1 }],
        histogram: [
          { step_number: 1, equal_rows: 40, distinct_range_rows: '0' },
          { step_number: 2, equal_rows: 10, distinct_range_rows: '0' },
        ],
        statsProperties: [{ last_updated: new Date('2026-08-16T00:00:00.000Z'), modification_counter: '0' }],
      });
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics(
        { ...target, columnNames: ['status', 'amount'] },
        options,
      );

      expect(result.ok).toBe(true);
      expect(result.result!.map((c) => c.columnName)).toEqual(['status', 'amount']);
      expect(result.result![0].distinctCount?.value).toBe(2);
      // 'amount' has no statistics object leading with it - honest empty shape.
      expect(result.result![1].distinctCount).toBeUndefined();
    });

    it('returns an empty result without querying when no columns are requested', async () => {
      const requestSql = jest.fn();
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics({ ...target, columnNames: [] }, options);
      expect(result).toEqual({ ok: true, message: '', result: [] });
      expect(requestSql).not.toHaveBeenCalled();
    });
  });

  describe('collectPhysicalHealth', () => {
    it('maps avgFragmentationPercent/pageCount/lastUpdatedAt', async () => {
      const requestSql = routedRequestSql({
        physicalHealth: [{ avg_fragmentation_in_percent: 0, page_count: '1' }],
        stats: [{ last_updated: new Date('2026-08-16T00:00:00.000Z'), modification_counter: '0' }],
      });
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(true);
      const byName = Object.fromEntries(result.result!.metrics.map((m) => [m.name, m.value]));
      expect(byName.avgFragmentationPercent).toBe(0);
      expect(byName.pageCount).toBe(1);
    });

    it('wraps a rejected query into a GeneralResult instead of throwing', async () => {
      const requestSql = jest.fn().mockRejectedValue(new Error('connection reset'));
      const provider = new SQLServerPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('Failed to collect physical health');
    });
  });

  it('reports capability status: everything true except analyzedExecutionPlan', async () => {
    const provider = new SQLServerPerformanceTuningProvider(makeDriver(jest.fn()));
    const result = await provider.checkCapabilities({ databaseName: 'testdb' });

    expect(result.ok).toBe(true);
    expect(result.result).toEqual({
      executionPlan: { available: true, source: 'SET SHOWPLAN_ALL ON' },
      analyzedExecutionPlan: expect.objectContaining({ available: false }),
      tableDefinition: expect.objectContaining({ available: true }),
      optimizerStatistics: expect.objectContaining({ available: true }),
      physicalHealth: expect.objectContaining({ available: true }),
    });
  });
});

// Runs the actual catalog SQL against a live SQL Server (the same Docker
// fixture __tests__/db/drivers/SQLServerDriver.test.ts uses), not stubbed
// rows - same rationale as the Postgres/MySQL Providers' live suites.
describe('SQLServerPerformanceTuningProvider (live SQL Server)', () => {
  const connectOption: ConnectionSetting = {
    host: '127.0.0.1',
    port: 6433,
    user: 'testuser',
    password: 'Pass123zxcv!',
    database: 'testdb',
    dbType: DBType.SQLServer,
    name: 'mssql-performance-tuning-test',
    sqlServer: { encrypt: false },
  };
  const target = { databaseName: 'testdb', schemaName: 'testdb', tableName: 'perf_orders' };
  const options = {
    limits: { maxTables: 8, maxColumnsPerTable: 40, maxIndexesPerTable: 20, maxPayloadBytes: 200_000 },
    timeoutMs: 5000,
  };

  let driver: SQLServerDriver;
  let provider: SQLServerPerformanceTuningProvider;

  beforeAll(async () => {
    await init();
    driver = new SQLServerDriver(connectOption);
    await driver.connect();
    provider = new SQLServerPerformanceTuningProvider(driver);
  });

  afterAll(async () => {
    await driver?.disconnect();
  });

  it('retrieves an estimate plan and resolves perf_orders (real name, not an alias) from it', async () => {
    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: {
          sql: "SELECT o.status FROM testdb.perf_orders o WHERE o.status = 'shipped'",
          source: 'editor',
        },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings?.[0]).toMatchObject({
      tableName: 'perf_orders',
      alias: 'o',
    });
    expect(Array.isArray(result.result!.raw)).toBe(true);
  });

  it('collects DDL/columns/constraints/indexes for perf_orders, including the CHECK constraint and filtered index', async () => {
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
        'idx_perf_orders_customer_status',
        'idx_perf_orders_status',
        'idx_perf_orders_status_filtered',
        'uq_perf_orders_id_status',
      ]),
    );
    const filtered = def.indexes.find((i) => i.indexName === 'idx_perf_orders_status_filtered')!;
    expect(filtered.predicate).toContain('shipped');
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

  it('reports column statistics only for the requested columns, derived from the histogram', async () => {
    const result = await provider.collectColumnStatistics({ ...target, columnNames: ['status'] }, options);
    expect(result.ok).toBe(true);
    expect(result.result!.map((c) => c.columnName)).toEqual(['status']);
    // perf_orders has exactly 2 distinct status values ('new'/'shipped').
    expect(result.result![0].distinctCount?.value).toBe(2);
    expect(result.result![0].histogramType?.value).toBe('MaxDiff');
  });

  it('reports physical health metrics without a maintenance verdict', async () => {
    const result = await provider.collectPhysicalHealth(target, options);
    expect(result.ok).toBe(true);
    expect(result.result!.metrics.map((m) => m.name)).toEqual(
      expect.arrayContaining(['avgFragmentationPercent', 'pageCount']),
    );
  });

  it('reports a table that does not exist as not found, not a thrown error', async () => {
    const result = await provider.collectTableDefinition(
      { ...target, tableName: 'no_such_table_xyz' },
      options,
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('was not found');
  });

  it('end-to-end via getPerformanceTuningContext(): a complete, schema-valid context', async () => {
    const result = await driver.getPerformanceTuningContext({
      databaseName: 'testdb',
      statement: { sql: "SELECT * FROM testdb.perf_orders WHERE status = 'shipped'", source: 'editor' },
      plan: {},
    });

    expect(result.ok).toBe(true);
    const context = result.result!;
    expect(context.tables).toHaveLength(1);
    expect(context.tables[0].tableName).toBe('perf_orders');
    expect(context.tables[0].definition?.columns.length).toBeGreaterThan(0);
    expect(context.tables[0].statistics?.estimatedRowCount?.value).toBeGreaterThan(0);
    expect(context.database.version).toBeDefined();
    expect(context.collection.status).toBe('complete');
  });

  it("resolves an aliased table straight from the plan - SQL Server's SHOWPLAN always carries the real table name", async () => {
    const result = await driver.getPerformanceTuningContext({
      databaseName: 'testdb',
      statement: {
        sql: "SELECT o.status FROM testdb.perf_orders o WHERE o.status = 'shipped'",
        source: 'editor',
      },
      plan: {},
    });
    expect(result.ok).toBe(true);
    // Unlike MySQL, no targetTables hint is needed here at all.
    const tableNames = result.result!.tables.map((t) => t.tableName);
    expect(tableNames).toEqual(['perf_orders']);
    expect(result.result!.tables[0].definition?.columns.length).toBeGreaterThan(0);
  });
});
