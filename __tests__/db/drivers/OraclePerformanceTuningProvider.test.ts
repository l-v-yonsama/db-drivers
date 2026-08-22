import {
  ConnectionSetting,
  DBType,
  extractOraclePredicateColumns,
  findUnresolvedIndexOnlyAccessKeys,
  OracleDriver,
  OraclePerformanceTuningProvider,
  parseOraclePlan,
} from '../../../src';
import { init } from '../../setup/oracle';

describe('extractOraclePredicateColumns', () => {
  it('pulls the bare column name out of a double-quote-qualified predicate', () => {
    expect(extractOraclePredicateColumns(`"O"."STATUS"='shipped'`)).toEqual(['STATUS']);
  });

  it('ignores the right-hand side of a join predicate (only the side before the operator counts)', () => {
    expect(extractOraclePredicateColumns(`"O"."CUSTOMER_ID"="D"."DEPTNO"`)).toEqual(['CUSTOMER_ID']);
  });

  it('returns an empty array for missing/empty/unqualified predicates', () => {
    expect(extractOraclePredicateColumns(undefined)).toEqual([]);
    expect(extractOraclePredicateColumns('')).toEqual([]);
    expect(extractOraclePredicateColumns('status = 1')).toEqual([]);
  });
});

describe('parseOraclePlan', () => {
  const row = (overrides: Record<string, unknown>): Record<string, unknown> => ({
    ID: 0,
    PARENT_ID: null,
    DEPTH: 0,
    OPERATION: 'SELECT STATEMENT',
    OPTIONS: null,
    OBJECT_OWNER: null,
    OBJECT_NAME: null,
    OBJECT_ALIAS: null,
    OBJECT_TYPE: null,
    COST: null,
    CARDINALITY: null,
    BYTES: null,
    ACCESS_PREDICATES: null,
    FILTER_PREDICATES: null,
    ...overrides,
  });

  it('merges a TABLE ACCESS row with its single INDEX child into one table mapping', () => {
    const rows = [
      row({ ID: 0, PARENT_ID: null, OPERATION: 'SELECT STATEMENT', COST: 2, CARDINALITY: 25, BYTES: 375 }),
      row({
        ID: 1,
        PARENT_ID: 0,
        DEPTH: 1,
        OPERATION: 'TABLE ACCESS',
        OPTIONS: 'BY INDEX ROWID BATCHED',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'PERF_ORDERS',
        OBJECT_ALIAS: '"PERF_ORDERS"@"SEL$1"',
        OBJECT_TYPE: 'TABLE',
        COST: 2,
        CARDINALITY: 25,
        BYTES: 375,
      }),
      row({
        ID: 2,
        PARENT_ID: 1,
        DEPTH: 2,
        OPERATION: 'INDEX',
        OPTIONS: 'RANGE SCAN',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'IDX_PERF_ORDERS_STATUS',
        OBJECT_ALIAS: '"PERF_ORDERS"@"SEL$1"',
        OBJECT_TYPE: 'INDEX',
        COST: 1,
        CARDINALITY: 25,
        ACCESS_PREDICATES: `"STATUS"='shipped'`,
      }),
    ];

    const { planNode, mappings, diagnostics } = parseOraclePlan(rows);
    expect(diagnostics).toEqual([]);
    expect(mappings).toEqual([
      expect.objectContaining({
        tableName: 'PERF_ORDERS',
        schemaName: 'TESTUSER',
        alias: undefined, // no explicit alias in the query - OBJECT_ALIAS == table name
        indexName: 'IDX_PERF_ORDERS_STATUS',
        estimatedRows: 25,
        filterColumns: ['STATUS'],
      }),
    ]);
    // Only one mapping - the INDEX child is not double-counted as its own
    // separate table access.
    expect(mappings).toHaveLength(1);

    const tableNode = planNode.children[0];
    expect(tableNode.operation).toBe('TABLE ACCESS BY INDEX ROWID BATCHED');
    expect(tableNode.relation).toEqual({ schemaName: 'TESTUSER', tableName: 'PERF_ORDERS', alias: undefined });
    // The index child still appears as its own node in the tree.
    expect(tableNode.children).toHaveLength(1);
    expect(tableNode.children[0].operation).toBe('INDEX RANGE SCAN');
    expect(tableNode.children[0].indexName).toBe('IDX_PERF_ORDERS_STATUS');
  });

  it('resolves a bare index-only access node via the supplied resolutions map, carrying the alias', () => {
    const rows = [
      row({ ID: 0, PARENT_ID: null, OPERATION: 'SELECT STATEMENT' }),
      row({ ID: 1, PARENT_ID: 0, DEPTH: 1, OPERATION: 'SORT', OPTIONS: 'GROUP BY NOSORT' }),
      row({
        ID: 2,
        PARENT_ID: 1,
        DEPTH: 2,
        OPERATION: 'INDEX',
        OPTIONS: 'RANGE SCAN',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'IDX_PERF_ORDERS_STATUS',
        OBJECT_ALIAS: '"O"@"SEL$1"',
        OBJECT_TYPE: 'INDEX',
        CARDINALITY: 25,
        ACCESS_PREDICATES: `"O"."STATUS"='shipped'`,
      }),
    ];

    const withoutResolution = parseOraclePlan(rows);
    expect(withoutResolution.mappings).toEqual([]);
    // node id may vary by tree position - just assert content:
    expect(withoutResolution.diagnostics).toEqual([
      expect.objectContaining({
        code: 'TABLE_MAPPING_FAILED',
        severity: 'warning',
        affectsCompleteness: true,
        message: expect.stringContaining('Could not resolve a table for plan node'),
        node: expect.objectContaining({ objectKind: 'index', objectName: 'IDX_PERF_ORDERS_STATUS' }),
        // owner is kept as technical detail (§4.4) even though it never
        // resolved to a real table.
        schemaName: 'TESTUSER',
      }),
    ]);
    expect(withoutResolution.diagnostics[0].message).toContain('IDX_PERF_ORDERS_STATUS');

    const resolutions = new Map([
      ['TESTUSER.IDX_PERF_ORDERS_STATUS', { schemaName: 'TESTUSER', tableName: 'PERF_ORDERS' }],
    ]);
    const resolved = parseOraclePlan(rows, resolutions);
    expect(resolved.diagnostics).toEqual([]);
    expect(resolved.mappings).toEqual([
      expect.objectContaining({
        tableName: 'PERF_ORDERS',
        schemaName: 'TESTUSER',
        alias: 'O',
        indexName: 'IDX_PERF_ORDERS_STATUS',
        filterColumns: ['STATUS'],
      }),
    ]);
  });

  it('resolves an aliased join (TABLE ACCESS FULL + a plain INDEX child) into two table mappings', () => {
    const rows = [
      row({ ID: 0, PARENT_ID: null, OPERATION: 'SELECT STATEMENT' }),
      row({ ID: 1, PARENT_ID: 0, DEPTH: 1, OPERATION: 'NESTED LOOPS' }),
      row({
        ID: 2,
        PARENT_ID: 1,
        DEPTH: 2,
        OPERATION: 'TABLE ACCESS',
        OPTIONS: 'FULL',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'DEPT',
        OBJECT_ALIAS: '"D"@"SEL$1"',
        OBJECT_TYPE: 'TABLE',
        CARDINALITY: 3,
      }),
      row({
        ID: 3,
        PARENT_ID: 1,
        DEPTH: 2,
        OPERATION: 'INDEX',
        OPTIONS: 'RANGE SCAN',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'IDX_PERF_ORDERS_CUSTOMER_STATUS',
        OBJECT_ALIAS: '"O"@"SEL$1"',
        OBJECT_TYPE: 'INDEX',
        CARDINALITY: 3,
        ACCESS_PREDICATES: `"O"."CUSTOMER_ID"="D"."DEPTNO" AND "O"."STATUS"='shipped'`,
      }),
    ];

    const resolutions = new Map([
      ['TESTUSER.IDX_PERF_ORDERS_CUSTOMER_STATUS', { schemaName: 'TESTUSER', tableName: 'PERF_ORDERS' }],
    ]);
    const { mappings } = parseOraclePlan(rows, resolutions);
    expect(mappings.map((m) => m.tableName)).toEqual(['DEPT', 'PERF_ORDERS']);
    expect(mappings.find((m) => m.tableName === 'DEPT')?.alias).toBe('D');
    const orders = mappings.find((m) => m.tableName === 'PERF_ORDERS')!;
    expect(orders.alias).toBe('O');
    expect(orders.filterColumns).toEqual(['CUSTOMER_ID', 'STATUS']);
  });

  it('never throws on malformed/unexpected input, still returning a usable (empty) tree', () => {
    for (const input of [undefined, null, 'not an array', [], [{}]] as unknown[][]) {
      const { planNode, mappings } = parseOraclePlan(input);
      expect(mappings).toEqual([]);
      expect(planNode.children).toEqual([]);
    }
  });
});

describe('findUnresolvedIndexOnlyAccessKeys', () => {
  it('finds an INDEX row with no TABLE ACCESS parent, and skips one that has one', () => {
    const rows = [
      { ID: 0, PARENT_ID: null, OBJECT_TYPE: null },
      { ID: 1, PARENT_ID: 0, OBJECT_TYPE: 'TABLE', OBJECT_OWNER: 'TESTUSER', OBJECT_NAME: 'PERF_ORDERS' },
      { ID: 2, PARENT_ID: 1, OBJECT_TYPE: 'INDEX', OBJECT_OWNER: 'TESTUSER', OBJECT_NAME: 'IDX_A' },
      { ID: 3, PARENT_ID: 0, OBJECT_TYPE: 'INDEX', OBJECT_OWNER: 'TESTUSER', OBJECT_NAME: 'IDX_B' },
    ];
    expect(findUnresolvedIndexOnlyAccessKeys(rows)).toEqual([{ owner: 'TESTUSER', indexName: 'IDX_B' }]);
  });

  it('dedups repeated (owner, indexName) pairs', () => {
    const rows = [
      { ID: 0, PARENT_ID: null },
      { ID: 1, PARENT_ID: 0, OBJECT_TYPE: 'INDEX', OBJECT_OWNER: 'TESTUSER', OBJECT_NAME: 'IDX_A' },
      { ID: 2, PARENT_ID: 0, OBJECT_TYPE: 'INDEX', OBJECT_OWNER: 'TESTUSER', OBJECT_NAME: 'IDX_A' },
    ];
    expect(findUnresolvedIndexOnlyAccessKeys(rows)).toEqual([{ owner: 'TESTUSER', indexName: 'IDX_A' }]);
  });

  it('never throws on malformed input', () => {
    expect(findUnresolvedIndexOnlyAccessKeys(undefined as unknown as unknown[])).toEqual([]);
    expect(findUnresolvedIndexOnlyAccessKeys([{}])).toEqual([]);
  });
});

describe('OraclePerformanceTuningProvider', () => {
  const makeDriver = (
    requestSql: jest.Mock,
    collectPerformanceTuningPlanRows: jest.Mock = jest.fn(),
    getTableDDL: jest.Mock = jest.fn(),
    getCurrentSchema: jest.Mock = jest.fn().mockResolvedValue('TESTUSER'),
    collectPerformanceTuningActualPlan: jest.Mock = jest.fn(),
  ) => ({
    requestSql,
    collectPerformanceTuningPlanRows,
    collectPerformanceTuningActualPlan,
    getTableDDL,
    getCurrentSchema,
  });

  it('runs EXPLAIN PLAN via the dedicated driver method and resolves the plan + table mappings', async () => {
    const planRows = [
      { ID: 0, PARENT_ID: null, OPERATION: 'SELECT STATEMENT', CARDINALITY: 25 },
      {
        ID: 1,
        PARENT_ID: 0,
        OPERATION: 'TABLE ACCESS',
        OPTIONS: 'FULL',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'PERF_ORDERS',
        OBJECT_ALIAS: '"PERF_ORDERS"@"SEL$1"',
        OBJECT_TYPE: 'TABLE',
        CARDINALITY: 25,
        FILTER_PREDICATES: `"STATUS"='shipped'`,
      },
    ];
    const collectPerformanceTuningPlanRows = jest
      .fn()
      .mockResolvedValue({ rows: planRows.map((values) => ({ values })) });
    const provider = new OraclePerformanceTuningProvider(
      makeDriver(jest.fn(), collectPerformanceTuningPlanRows),
    );

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'FREEPDB1',
        statement: { sql: "SELECT * FROM perf_orders WHERE status = 'shipped'", source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(collectPerformanceTuningPlanRows).toHaveBeenCalledWith({
      sql: "SELECT * FROM perf_orders WHERE status = 'shipped'",
      conditions: { rawQueries: true, binds: undefined },
      meta: { type: 'performanceTuningContext' },
    });
    expect(result.ok).toBe(true);
    expect(result.result!.raw).toEqual(planRows);
    expect(result.result!.planTableMappings).toHaveLength(1);
    expect(result.result!.normalizedPlan).toMatchObject({ operation: 'SELECT STATEMENT' });
  });

  it('collects a native actual-plan artifact in analyze mode after resolving the estimate plan', async () => {
    const collectPerformanceTuningPlanRows = jest.fn().mockResolvedValue({ rows: [] });
    const collectPerformanceTuningActualPlan = jest.fn().mockResolvedValue({
      source: 'DBMS_XPLAN.DISPLAY_CURSOR ALLSTATS LAST', format: 'text', content: 'Plan hash value: 1',
    });
    const provider = new OraclePerformanceTuningProvider(
      makeDriver(jest.fn(), collectPerformanceTuningPlanRows, undefined, undefined, collectPerformanceTuningActualPlan),
    );

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'FREEPDB1',
        statement: { sql: 'SELECT 1 FROM DUAL', source: 'editor' },
        plan: { mode: 'analyze', allowExecution: true },
      },
      { timeoutMs: 5000 },
    );
    expect(result.ok).toBe(true);
    expect(result.result!.actualPlan).toEqual({
      source: 'DBMS_XPLAN.DISPLAY_CURSOR ALLSTATS LAST', format: 'text', content: 'Plan hash value: 1',
    });
    expect(collectPerformanceTuningActualPlan).toHaveBeenCalledWith(
      expect.objectContaining({ sql: 'SELECT 1 FROM DUAL' }),
      { timeoutMs: 5000 },
    );
  });

  it('backfills a uniquely resolved table mapping with ALLSTATS LAST runtime rows and filter evidence', async () => {
    const planRows = [
      { ID: 0, PARENT_ID: null, OPERATION: 'SELECT STATEMENT' },
      {
        ID: 1,
        PARENT_ID: 0,
        OPERATION: 'TABLE ACCESS',
        OPTIONS: 'FULL',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'PERF_ORDERS',
        OBJECT_ALIAS: '"O"@"SEL$1"',
        OBJECT_TYPE: 'TABLE',
        CARDINALITY: 25,
      },
    ];
    const actualPlanText = `| Id  | Operation                               | Name              | Starts | E-Rows | A-Rows |
|   0 | SELECT STATEMENT                        |                   |      1 |        |      5 |
|*  5 |  TABLE ACCESS BY INDEX ROWID BATCHED    | PERF_ORDERS       |      1 |     25 |      5 |
|*  6 |   INDEX RANGE SCAN                      | IDX_PERF_STATUS   |      1 |    100 |    100 |

Predicate Information (identified by operation id):
   5 - filter(("O"."TENANT_ID"=42))`;
    const collectPerformanceTuningPlanRows = jest
      .fn()
      .mockResolvedValue({ rows: planRows.map((values) => ({ values })) });
    const collectPerformanceTuningActualPlan = jest.fn().mockResolvedValue({
      source: 'DBMS_XPLAN.DISPLAY_CURSOR ALLSTATS LAST',
      format: 'text',
      content: actualPlanText,
    });
    const provider = new OraclePerformanceTuningProvider(
      makeDriver(jest.fn(), collectPerformanceTuningPlanRows, undefined, undefined, collectPerformanceTuningActualPlan),
    );

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'FREEPDB1',
        statement: { sql: 'SELECT * FROM perf_orders WHERE tenant_id = 42', source: 'editor' },
        plan: { mode: 'analyze', allowExecution: true },
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings[0]).toMatchObject({
      tableName: 'PERF_ORDERS',
      indexName: 'IDX_PERF_STATUS',
      actualRows: 5,
      rowEstimateRatio: 0.2,
      tableAccessRows: expect.objectContaining({ value: 100, estimated: false }),
      predicateFilterInputRows: expect.objectContaining({ value: 100, estimated: false }),
      predicateFilterOutputRows: expect.objectContaining({ value: 5, estimated: false }),
    });
  });

  it('surfaces a failed EXPLAIN PLAN with detail instead of throwing', async () => {
    const collectPerformanceTuningPlanRows = jest
      .fn()
      .mockRejectedValue(new Error('ORA-00942: table or view does not exist'));
    const provider = new OraclePerformanceTuningProvider(
      makeDriver(jest.fn(), collectPerformanceTuningPlanRows),
    );

    const result = await provider.collectExecutionPlan(
      { databaseName: 'FREEPDB1', statement: { sql: 'SELECT * FROM orders', source: 'editor' }, plan: {} },
      { timeoutMs: 5000 },
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Failed to retrieve the execution plan.');
    expect(result.message).toContain('ORA-00942');
  });

  it('resolves an index-only-access node by querying ALL_INDEXES for its real table', async () => {
    const planRows = [
      { ID: 0, PARENT_ID: null, OPERATION: 'SELECT STATEMENT' },
      {
        ID: 1,
        PARENT_ID: 0,
        OPERATION: 'INDEX',
        OPTIONS: 'RANGE SCAN',
        OBJECT_OWNER: 'TESTUSER',
        OBJECT_NAME: 'IDX_PERF_ORDERS_STATUS',
        OBJECT_ALIAS: '"PERF_ORDERS"@"SEL$1"',
        OBJECT_TYPE: 'INDEX',
        CARDINALITY: 25,
      },
    ];
    const collectPerformanceTuningPlanRows = jest
      .fn()
      .mockResolvedValue({ rows: planRows.map((values) => ({ values })) });
    const requestSql = jest.fn().mockResolvedValue({
      rows: [
        {
          values: { INDEX_NAME: 'IDX_PERF_ORDERS_STATUS', TABLE_NAME: 'PERF_ORDERS', TABLE_OWNER: 'TESTUSER' },
        },
      ],
    });
    const provider = new OraclePerformanceTuningProvider(
      makeDriver(requestSql, collectPerformanceTuningPlanRows),
    );

    const result = await provider.collectExecutionPlan(
      { databaseName: 'FREEPDB1', statement: { sql: 'SELECT status FROM perf_orders', source: 'editor' }, plan: {} },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings).toEqual([
      expect.objectContaining({ tableName: 'PERF_ORDERS', schemaName: 'TESTUSER' }),
    ]);
    expect(requestSql).toHaveBeenCalledWith(
      expect.objectContaining({ conditions: { rawQueries: true, binds: ['TESTUSER', 'IDX_PERF_ORDERS_STATUS'] } }),
    );
  });

  const target = { databaseName: 'FREEPDB1', schemaName: 'TESTUSER', tableName: 'PERF_ORDERS' };
  const options = {
    limits: { maxTables: 8, maxColumnsPerTable: 40, maxIndexesPerTable: 20, maxPayloadBytes: 200_000 },
    timeoutMs: 5000,
  };

  const routedRequestSql = (rowsBySection: {
    columns?: unknown[];
    constraints?: unknown[];
    checkConstraints?: unknown[];
    indexes?: unknown[];
    tableSize?: unknown[];
    modifications?: unknown[];
    columnStatistics?: unknown[];
    physicalHealth?: unknown[];
  }) =>
    jest.fn(async (params: { sql: string; conditions?: { binds?: string[] }; meta?: unknown }) => {
      const { sql } = params;
      if (sql.includes('FROM ALL_TAB_COLUMNS col')) {
        return { rows: (rowsBySection.columns ?? []).map((values) => ({ values })) };
      }
      if (sql.includes("CONSTRAINT_TYPE = 'C'")) {
        return { rows: (rowsBySection.checkConstraints ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM ALL_CONSTRAINTS ac')) {
        return { rows: (rowsBySection.constraints ?? []).map((values) => ({ values })) };
      }
      // Checked before the general "FROM ALL_INDEXES i" test below - Oracle's
      // TABLE_SIZE_SQL has an ALL_INDEXES i subquery of its own
      // (`... FROM ALL_INDEXES i WHERE i.OWNER = t.OWNER ...`) whose text
      // would otherwise also match that check.
      if (sql.includes('FROM ALL_TABLES t')) {
        return { rows: (rowsBySection.tableSize ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM ALL_INDEXES i')) {
        return { rows: (rowsBySection.indexes ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM ALL_TAB_MODIFICATIONS')) {
        return { rows: (rowsBySection.modifications ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM ALL_TAB_COL_STATISTICS')) {
        return { rows: (rowsBySection.columnStatistics ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM ALL_TABLES WHERE')) {
        return { rows: (rowsBySection.physicalHealth ?? []).map((values) => ({ values })) };
      }
      throw new Error(`OraclePerformanceTuningProvider.test.ts: unrouted SQL: ${sql}`);
    });

  describe('collectTableDefinition', () => {
    it('assembles columns/constraints/indexes, reuses getTableDDL(), and marks the PK index primary', async () => {
      const requestSql = routedRequestSql({
        columns: [{ NAME: 'ID', DATA_TYPE: 'NUMBER', NULLABLE: 'N', ORDINAL_POSITION: 1 }],
        constraints: [{ CONSTRAINT_NAME: 'SYS_C1', CONSTRAINT_TYPE: 'P', COLUMN_NAME: 'ID', POSITION: 1 }],
        indexes: [
          {
            INDEX_NAME: 'SYS_C1',
            UNIQUENESS: 'UNIQUE',
            INDEX_TYPE: 'NORMAL',
            COLUMN_NAME: 'ID',
            COLUMN_POSITION: 1,
            DESCEND: 'ASC',
          },
        ],
      });
      const getTableDDL = jest.fn().mockResolvedValue('CREATE TABLE "PERF_ORDERS" (...)');
      const provider = new OraclePerformanceTuningProvider(
        makeDriver(requestSql, jest.fn(), getTableDDL),
      );

      const result = await provider.collectTableDefinition(target, options);

      expect(result.ok).toBe(true);
      expect(result.result!.columns).toHaveLength(1);
      expect(result.result!.constraints).toHaveLength(1);
      expect(result.result!.indexes).toEqual([expect.objectContaining({ indexName: 'SYS_C1', primary: true })]);
      expect(result.result!.ddl).toBe('CREATE TABLE "PERF_ORDERS" (...)');
      expect(getTableDDL).toHaveBeenCalledWith({ tableName: 'PERF_ORDERS', schemaName: 'TESTUSER' });

      for (const call of requestSql.mock.calls) {
        expect(call[0].conditions.binds[1]).toBe('PERF_ORDERS');
        expect(call[0].meta).toEqual({ type: 'performanceTuningContext' });
      }
    });

    it('falls back to getCurrentSchema() when target.schemaName is not set', async () => {
      const requestSql = routedRequestSql({
        columns: [{ NAME: 'ID', DATA_TYPE: 'NUMBER', NULLABLE: 'N', ORDINAL_POSITION: 1 }],
      });
      const getCurrentSchema = jest.fn().mockResolvedValue('TESTADMIN');
      const provider = new OraclePerformanceTuningProvider(
        makeDriver(requestSql, jest.fn(), jest.fn(), getCurrentSchema),
      );

      await provider.collectTableDefinition({ ...target, schemaName: undefined }, options);
      expect(getCurrentSchema).toHaveBeenCalled();
      expect(requestSql.mock.calls[0][0].conditions.binds[0]).toBe('TESTADMIN');
    });

    it('reports the table as not found when the columns query returns nothing', async () => {
      const requestSql = routedRequestSql({});
      const provider = new OraclePerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableDefinition(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });

    it('still succeeds with a warning when getTableDDL() fails', async () => {
      const requestSql = routedRequestSql({
        columns: [{ NAME: 'ID', DATA_TYPE: 'NUMBER', NULLABLE: 'N', ORDINAL_POSITION: 1 }],
      });
      const getTableDDL = jest.fn().mockRejectedValue(new Error('ORA-01031: insufficient privileges'));
      const provider = new OraclePerformanceTuningProvider(
        makeDriver(requestSql, jest.fn(), getTableDDL),
      );

      const result = await provider.collectTableDefinition(target, options);
      expect(result.ok).toBe(true);
      expect(result.result!.ddl).toBeUndefined();
      expect(result.message).toContain('ddl');
      expect(result.message).toContain('insufficient privileges');
    });
  });

  describe('collectTableStatistics', () => {
    it('maps a single-row result, combining size + modifications', async () => {
      const requestSql = routedRequestSql({
        tableSize: [{ NUM_ROWS: 50, BLOCKS: 5, LAST_ANALYZED: new Date(), BLOCK_SIZE: 8192, INDEX_BLOCKS: 10 }],
        modifications: [{ INSERTS: 1, UPDATES: 0, DELETES: 0 }],
      });
      const provider = new OraclePerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(true);
      expect(result.result!.estimatedRowCount?.value).toBe(50);
      expect(result.result!.modificationsSinceAnalyze?.value).toBe(1);
    });

    it('reports not found instead of a fabricated empty statistics object', async () => {
      const requestSql = routedRequestSql({ tableSize: [] });
      const provider = new OraclePerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });
  });

  describe('collectColumnStatistics', () => {
    it('maps requested columns from ALL_TAB_COL_STATISTICS, honestly-empty for an unstatted column', async () => {
      const requestSql = routedRequestSql({
        columnStatistics: [
          { COLUMN_NAME: 'STATUS', NUM_DISTINCT: 2, NUM_NULLS: 0, SAMPLE_SIZE: 50, TABLE_NUM_ROWS: 50 },
        ],
      });
      const provider = new OraclePerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics(
        { ...target, columnNames: ['STATUS', 'AMOUNT'] },
        options,
      );

      expect(result.ok).toBe(true);
      expect(result.result!.map((c) => c.columnName)).toEqual(['STATUS', 'AMOUNT']);
      expect(result.result![0].distinctCount?.value).toBe(2);
      expect(result.result![1].distinctCount).toBeUndefined();
    });

    it('returns an empty result without querying when no columns are requested', async () => {
      const requestSql = jest.fn();
      const provider = new OraclePerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics({ ...target, columnNames: [] }, options);
      expect(result).toEqual({ ok: true, message: '', result: [] });
      expect(requestSql).not.toHaveBeenCalled();
    });
  });

  describe('collectPhysicalHealth', () => {
    it('maps chainedRowCount/lastUpdatedAt', async () => {
      const requestSql = routedRequestSql({
        physicalHealth: [{ CHAIN_CNT: 0, LAST_ANALYZED: new Date() }],
      });
      const provider = new OraclePerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(true);
      const byName = Object.fromEntries(result.result!.metrics.map((m) => [m.name, m.value]));
      expect(byName.chainedRowCount).toBe(0);
    });

    it('wraps a rejected query into a GeneralResult instead of throwing', async () => {
      const requestSql = jest.fn().mockRejectedValue(new Error('connection reset'));
      const provider = new OraclePerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('Failed to collect physical health');
    });
  });

  it('reports capability status including analyzedExecutionPlan', async () => {
    const provider = new OraclePerformanceTuningProvider(makeDriver(jest.fn()));
    const result = await provider.checkCapabilities({ databaseName: 'FREEPDB1' });

    expect(result.ok).toBe(true);
    expect(result.result).toEqual({
      executionPlan: { available: true, source: 'EXPLAIN PLAN / PLAN_TABLE' },
      analyzedExecutionPlan: expect.objectContaining({ available: true }),
      tableDefinition: expect.objectContaining({ available: true }),
      optimizerStatistics: expect.objectContaining({ available: true }),
      physicalHealth: expect.objectContaining({ available: true }),
    });
  });
});

// Runs the actual catalog SQL against a live Oracle (the same Docker
// fixture __tests__/db/drivers/OracleDriver.test.ts uses), not stubbed
// rows - same rationale as the other three vendors' live suites.
describe('OraclePerformanceTuningProvider (live Oracle)', () => {
  const connectOption: ConnectionSetting = {
    host: 'localhost',
    port: 6012,
    user: 'testuser',
    password: 'testpass',
    database: 'FREEPDB1',
    dbType: DBType.Oracle,
    name: 'oracle-performance-tuning-test',
  };
  const target = { databaseName: 'FREEPDB1', schemaName: 'TESTUSER', tableName: 'PERF_ORDERS' };
  const options = {
    limits: { maxTables: 8, maxColumnsPerTable: 40, maxIndexesPerTable: 20, maxPayloadBytes: 200_000 },
    timeoutMs: 5000,
  };

  let driver: OracleDriver;
  let provider: OraclePerformanceTuningProvider;

  beforeAll(async () => {
    await init();
    driver = new OracleDriver(connectOption);
    await driver.connect();
    provider = new OraclePerformanceTuningProvider(driver);
  });

  afterAll(async () => {
    await driver?.disconnect();
  });

  it('retrieves an estimate plan and resolves perf_orders (real name, not an alias) from an aliased query', async () => {
    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'FREEPDB1',
        statement: { sql: "SELECT o.status FROM perf_orders o WHERE o.status = 'shipped'", source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings?.[0]).toMatchObject({ tableName: 'PERF_ORDERS', alias: 'O' });
    expect(Array.isArray(result.result!.raw)).toBe(true);
  });

  it('collects DDL/columns/constraints/indexes for perf_orders, including the CHECK constraint and function-based index', async () => {
    const result = await provider.collectTableDefinition(target, options);

    expect(result.ok).toBe(true);
    const def = result.result!;

    expect(def.columns.map((c) => c.columnName)).toEqual(
      expect.arrayContaining(['ID', 'CUSTOMER_ID', 'STATUS', 'AMOUNT']),
    );
    const idColumn = def.columns.find((c) => c.columnName === 'ID')!;
    expect(idColumn.nullable).toBe(false);

    expect(def.constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'primaryKey', columns: ['ID'] }),
        expect.objectContaining({ type: 'check', checkExpression: expect.stringMatching(/amount/i) }),
      ]),
    );
    // The auto-generated NOT NULL checks must not leak through.
    expect(def.constraints.some((c) => c.checkExpression?.includes('IS NOT NULL'))).toBe(false);

    const indexNames = def.indexes.map((i) => i.indexName);
    expect(indexNames).toEqual(
      expect.arrayContaining([
        'IDX_PERF_ORDERS_CUSTOMER_STATUS',
        'IDX_PERF_ORDERS_LOWER_STATUS',
        'UQ_PERF_ORDERS_ID_STATUS',
      ]),
    );
    const functional = def.indexes.find((i) => i.indexName === 'IDX_PERF_ORDERS_LOWER_STATUS')!;
    expect(functional.columns[0].expression?.toUpperCase()).toContain('LOWER');
    const primaryIndex = def.indexes.find((i) => i.primary)!;
    expect(primaryIndex).toBeDefined();

    expect(def.ddl).toContain('CREATE TABLE');
    expect(def.ddl).toContain('PERF_ORDERS');
  });

  it('reports table statistics with real row counts and byte sizes', async () => {
    const result = await provider.collectTableStatistics(target, options);
    expect(result.ok).toBe(true);
    expect(result.result!.estimatedRowCount?.value).toBeGreaterThan(0);
    expect(result.result!.tableBytes?.value).toBeGreaterThan(0);
  });

  it('reports column statistics only for the requested columns', async () => {
    const result = await provider.collectColumnStatistics({ ...target, columnNames: ['STATUS'] }, options);
    expect(result.ok).toBe(true);
    expect(result.result!.map((c) => c.columnName)).toEqual(['STATUS']);
    // perf_orders has exactly 2 distinct status values ('new'/'shipped').
    expect(result.result![0].distinctCount?.value).toBe(2);
    // status is NOT NULL - divided by the real table row count (not
    // SAMPLE_SIZE), this must be exactly 0, never a value above 1.
    expect(result.result![0].nullFraction?.value).toBe(0);
  });

  it('reports physical health metrics without a maintenance verdict', async () => {
    const result = await provider.collectPhysicalHealth(target, options);
    expect(result.ok).toBe(true);
    expect(result.result!.metrics.map((m) => m.name)).toEqual(expect.arrayContaining(['chainedRowCount']));
  });

  it('reports a table that does not exist as not found, not a thrown error', async () => {
    const result = await provider.collectTableDefinition(
      { ...target, tableName: 'NO_SUCH_TABLE_XYZ' },
      options,
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('was not found');
  });

  it('end-to-end via getPerformanceTuningContext(): a complete, schema-valid context', async () => {
    const result = await driver.getPerformanceTuningContext({
      databaseName: 'FREEPDB1',
      statement: { sql: "SELECT * FROM perf_orders WHERE status = 'shipped'", source: 'editor' },
      plan: {},
    });

    expect(result.ok).toBe(true);
    const context = result.result!;
    expect(context.tables).toHaveLength(1);
    expect(context.tables[0].tableName).toBe('PERF_ORDERS');
    expect(context.tables[0].definition?.columns.length).toBeGreaterThan(0);
    expect(context.tables[0].statistics?.estimatedRowCount?.value).toBeGreaterThan(0);
    expect(context.database.version).toBeDefined();
    expect(context.collection.status).toBe('complete');
  });

  it('resolves an aliased join across two tables, including an index-only-access side, without any targetTables hint', async () => {
    const result = await driver.getPerformanceTuningContext({
      databaseName: 'FREEPDB1',
      statement: {
        sql: `SELECT o.status, d.dname FROM perf_orders o JOIN dept d ON o.customer_id = d.deptno WHERE o.status = 'shipped'`,
        source: 'editor',
      },
      plan: {},
    });
    expect(result.ok).toBe(true);
    const tableNames = result.result!.tables.map((t) => t.tableName).sort();
    expect(tableNames).toEqual(['DEPT', 'PERF_ORDERS']);
    for (const table of result.result!.tables) {
      expect(table.definition?.columns.length).toBeGreaterThan(0);
    }
  });
});
