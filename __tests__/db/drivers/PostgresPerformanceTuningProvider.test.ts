import {
  ConnectionSetting,
  computeRowEstimateRatio,
  DBType,
  extractExecutionTimeMs,
  extractPlanningTimeMs,
  extractPredicateColumns,
  parsePostgresPlan,
  PostgresDriver,
  PostgresPerformanceTuningProvider,
  resolvePlanTableMappings,
} from '../../../src';
import { init } from '../../setup/postgres';

// A realistic-shaped `EXPLAIN (FORMAT JSON) ...` root (i.e. the single element of the array Postgres returns): orders joined to customers via an index scan, with a Hash node in between that carries no Relation Name.
const explainRoot = {
  Plan: {
    'Node Type': 'Hash Join',
    'Join Type': 'Inner',
    'Hash Cond': '(orders.customer_id = customers.id)',
    'Plan Rows': 41,
    Plans: [
      {
        'Node Type': 'Seq Scan',
        'Relation Name': 'orders',
        Alias: 'orders',
        Filter: "(status = 'shipped'::text)",
        'Plan Rows': 41,
      },
      {
        'Node Type': 'Hash',
        Plans: [
          {
            'Node Type': 'Index Scan',
            'Relation Name': 'customers',
            Alias: 'c',
            'Index Name': 'customers_pkey',
            'Index Cond': '(id = orders.customer_id)',
            'Plan Rows': 1,
          },
        ],
      },
    ],
  },
  'Planning Time': 0.234,
  'Execution Time': 1.2,
};

describe('postgresPlanParser', () => {
  describe('extractPredicateColumns', () => {
    it('pulls column-like identifiers out before comparison operators', () => {
      expect(extractPredicateColumns("(status = 'shipped'::text)")).toEqual(['status']);
      expect(extractPredicateColumns('(id = orders.customer_id)')).toEqual(['id']);
    });

    it('strips a table/alias qualifier', () => {
      expect(extractPredicateColumns('orders.customer_id = 42')).toEqual(['customer_id']);
    });

    it('returns an empty array for missing/empty predicates', () => {
      expect(extractPredicateColumns(undefined)).toEqual([]);
      expect(extractPredicateColumns('')).toEqual([]);
    });
  });

  describe('resolvePlanTableMappings', () => {
    it('resolves scan nodes into table mappings, skipping nodes without a Relation Name', () => {
      const mappings = resolvePlanTableMappings(explainRoot);

      expect(mappings).toHaveLength(2);

      const orders = mappings.find((m) => m.tableName === 'orders');
      expect(orders).toMatchObject({
        tableName: 'orders',
        alias: undefined, // Alias === Relation Name, so it's redundant and dropped
        estimatedRows: 41,
        filterColumns: ['status'],
      });

      const customers = mappings.find((m) => m.tableName === 'customers');
      expect(customers).toMatchObject({
        tableName: 'customers',
        alias: 'c',
        indexName: 'customers_pkey',
        estimatedRows: 1,
        filterColumns: ['id'],
      });

      // planNodeId is assigned depth-first and must be unique per node.
      expect(new Set(mappings.map((m) => m.planNodeId)).size).toBe(2);
    });

    it('never throws on malformed/unexpected input', () => {
      expect(resolvePlanTableMappings(undefined)).toEqual([]);
      expect(resolvePlanTableMappings(null)).toEqual([]);
      expect(resolvePlanTableMappings('not an object')).toEqual([]);
      expect(resolvePlanTableMappings({})).toEqual([]);
      expect(resolvePlanTableMappings({ Plan: { Plans: 'not an array' } })).toEqual([]);
    });
  });

  describe('parsePostgresPlan', () => {
    it('builds a normalized PlanNode tree using the same n0/n1/... ids as the mappings', () => {
      const { planNode, mappings, diagnostics } = parsePostgresPlan(explainRoot);

      expect(diagnostics).toEqual([]);
      expect(planNode).toMatchObject({
        id: 'n0',
        depth: 0,
        operation: 'Hash Join',
        joinType: 'Inner',
        predicates: ['(orders.customer_id = customers.id)'],
        estimated: { rows: 41 },
      });
      expect(planNode.children).toHaveLength(2);
      const [ordersScan, hash] = planNode.children;
      expect(ordersScan).toMatchObject({
        id: 'n1',
        parentId: 'n0',
        depth: 1,
        operation: 'Seq Scan',
        relation: { tableName: 'orders', alias: 'orders' },
      });
      expect(hash).toMatchObject({ id: 'n2', parentId: 'n0', operation: 'Hash' });
      expect(hash.children[0]).toMatchObject({
        id: 'n3',
        parentId: 'n2',
        operation: 'Index Scan',
        indexName: 'customers_pkey',
        relation: { tableName: 'customers', alias: 'c' },
      });

      // Every mapping's planNodeId must resolve to an actual node in the tree.
      const nodeIds = new Set<string>();
      const collect = (n: typeof planNode): void => {
        nodeIds.add(n.id);
        n.children.forEach(collect);
      };
      collect(planNode);
      for (const mapping of mappings) {
        expect(nodeIds.has(mapping.planNodeId)).toBe(true);
      }
    });

    it('includes actual timing/rows and buffer counts from EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) output', () => {
      const { planNode, mappings } = parsePostgresPlan({
        Plan: {
          'Node Type': 'Seq Scan',
          'Relation Name': 'orders',
          Alias: 'orders',
          Filter: "(status = 'shipped'::text)",
          'Plan Rows': 41,
          'Actual Startup Time': 0.012,
          'Actual Total Time': 1.234,
          'Actual Rows': 37,
          'Actual Loops': 1,
          'Rows Removed by Filter': 63,
          'Shared Hit Blocks': 120,
          'Shared Read Blocks': 4,
          'Shared Dirtied Blocks': 0,
          'Shared Written Blocks': 0,
        },
        'Planning Time': 0.1,
        'Execution Time': 1.5,
      });

      expect(planNode).toMatchObject({
        actual: { startupMs: 0.012, totalMs: 1.234, rows: 37, loops: 1 },
        buffers: { hit: 120, read: 4, dirtied: 0, written: 0 },
      });
      expect(mappings[0]).toMatchObject({
        tableName: 'orders',
        estimatedRows: 41,
        actualRows: 37,
        rowEstimateRatio: expect.any(Number),
        tableAccessRows: expect.objectContaining({ value: 100, estimated: false }),
        predicateFilterInputRows: expect.objectContaining({ value: 100, estimated: false }),
        predicateFilterOutputRows: expect.objectContaining({ value: 37, estimated: false }),
      });
    });

    it('leaves actual/buffers/temp undefined for a plain estimate-mode node (no ANALYZE/BUFFERS keys present)', () => {
      const { planNode, mappings } = parsePostgresPlan(explainRoot);

      expect(planNode.actual).toBeUndefined();
      expect(planNode.buffers).toBeUndefined();
      expect(planNode.temp).toBeUndefined();
      expect(mappings[0].actualRows).toBeUndefined();
    });

    it('merges a Bitmap Index Scan into its Bitmap Heap Scan mapping without a false warning', () => {
      const { planNode, mappings, diagnostics } = parsePostgresPlan({
        Plan: {
          'Node Type': 'Bitmap Heap Scan',
          'Relation Name': 'orders',
          Alias: 'o',
          Filter: "(channel = 'web'::text)",
          'Plan Rows': 6,
          Plans: [
            {
              'Node Type': 'Bitmap Index Scan',
              'Index Name': 'idx_orders_created_at',
              'Index Cond': "(created_at >= '2025-12-30'::timestamp)",
              'Plan Rows': 1293,
            },
          ],
        },
      });

      expect(diagnostics).toEqual([]);
      expect(mappings).toEqual([
        expect.objectContaining({
          planNodeId: 'n0',
          tableName: 'orders',
          alias: 'o',
          indexName: 'idx_orders_created_at',
          estimatedRows: 6,
          filterColumns: ['channel', 'created_at'],
        }),
      ]);
      expect(planNode).toMatchObject({
        id: 'n0',
        operation: 'Bitmap Heap Scan',
        relation: { tableName: 'orders', alias: 'o' },
        indexName: 'idx_orders_created_at',
        estimated: { rows: 6 },
        children: [
          {
            id: 'n1',
            parentId: 'n0',
            operation: 'Bitmap Index Scan',
            relation: { tableName: 'orders', alias: 'o' },
            indexName: 'idx_orders_created_at',
            estimated: { rows: 1293 },
            children: [],
          },
        ],
      });
    });

    it('resolves every index in a BitmapAnd tree without collapsing several indexes into one name', () => {
      const { planNode, mappings, diagnostics } = parsePostgresPlan({
        Plan: {
          'Node Type': 'Bitmap Heap Scan',
          'Relation Name': 'orders',
          'Plan Rows': 4,
          Plans: [
            {
              'Node Type': 'BitmapAnd',
              Plans: [
                {
                  'Node Type': 'Bitmap Index Scan',
                  'Index Name': 'idx_orders_status',
                  'Index Cond': "(status = 'open'::text)",
                },
                {
                  'Node Type': 'Bitmap Index Scan',
                  'Index Name': 'idx_orders_created_at',
                  'Index Cond': "(created_at >= '2025-12-30'::timestamp)",
                },
              ],
            },
          ],
        },
      });

      expect(diagnostics).toEqual([]);
      expect(mappings).toEqual([
        expect.objectContaining({
          planNodeId: 'n0',
          tableName: 'orders',
          indexName: undefined,
          filterColumns: ['status', 'created_at'],
        }),
      ]);
      expect(planNode.indexName).toBeUndefined();
      expect(planNode.children[0].children).toEqual([
        expect.objectContaining({
          operation: 'Bitmap Index Scan',
          relation: expect.objectContaining({ tableName: 'orders' }),
          indexName: 'idx_orders_status',
        }),
        expect.objectContaining({
          operation: 'Bitmap Index Scan',
          relation: expect.objectContaining({ tableName: 'orders' }),
          indexName: 'idx_orders_created_at',
        }),
      ]);
    });

    it('still warns for an orphaned Bitmap Index Scan with no heap relation to inherit', () => {
      const { mappings, diagnostics } = parsePostgresPlan({
        Plan: {
          'Node Type': 'Bitmap Index Scan',
          'Index Name': 'idx_orders_created_at',
          'Plan Rows': 1293,
        },
      });

      expect(mappings).toEqual([]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'TABLE_MAPPING_FAILED',
          severity: 'warning',
          affectsCompleteness: true,
          node: { id: 'n0', operation: 'Bitmap Index Scan' },
        }),
      ]);
    });

    it('reports a Function Scan as non-table-source information, not a mapping-failure warning', () => {
      const { mappings, diagnostics } = parsePostgresPlan({
        Plan: {
          'Node Type': 'Function Scan',
          'Function Name': 'generate_series',
          'Plan Rows': 100,
        },
      });

      expect(mappings).toEqual([]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'NON_TABLE_PLAN_SOURCE',
          severity: 'info',
          affectsCompleteness: false,
          scope: 'executionPlan',
          node: { id: 'n0', operation: 'Function Scan', objectKind: 'function', objectName: 'generate_series' },
        }),
      ]);
    });

    it('classifies a Values Scan with no relation as non-table-source information', () => {
      const { mappings, diagnostics } = parsePostgresPlan({
        Plan: { 'Node Type': 'Values Scan' },
      });

      expect(mappings).toEqual([]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'NON_TABLE_PLAN_SOURCE',
          severity: 'info',
          affectsCompleteness: false,
          node: { id: 'n0', operation: 'Values Scan', objectKind: 'values', objectName: undefined },
        }),
      ]);
    });

    it('classifies a CTE Scan with no relation as non-table-source information, keeping the CTE Name', () => {
      const { mappings, diagnostics } = parsePostgresPlan({
        Plan: { 'Node Type': 'CTE Scan', 'CTE Name': 'recent_orders' },
      });

      expect(mappings).toEqual([]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'NON_TABLE_PLAN_SOURCE',
          severity: 'info',
          affectsCompleteness: false,
          node: { id: 'n0', operation: 'CTE Scan', objectKind: 'cte', objectName: 'recent_orders' },
        }),
      ]);
    });

    it('classifies a WorkTable Scan (recursive CTE) with no relation as non-table-source information', () => {
      const { mappings, diagnostics } = parsePostgresPlan({
        Plan: { 'Node Type': 'WorkTable Scan', 'CTE Name': 'search_tree' },
      });

      expect(mappings).toEqual([]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'NON_TABLE_PLAN_SOURCE',
          severity: 'info',
          affectsCompleteness: false,
          node: { id: 'n0', operation: 'WorkTable Scan', objectKind: 'workTable', objectName: 'search_tree' },
        }),
      ]);
    });

    it('classifies a Subquery Scan with no relation as non-table-source information, keeping the alias', () => {
      const { mappings, diagnostics } = parsePostgresPlan({
        Plan: { 'Node Type': 'Subquery Scan', Alias: 'unnamed_subquery' },
      });

      expect(mappings).toEqual([]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'NON_TABLE_PLAN_SOURCE',
          severity: 'info',
          affectsCompleteness: false,
          node: { id: 'n0', operation: 'Subquery Scan', objectKind: 'subquery', objectName: 'unnamed_subquery' },
        }),
      ]);
    });

    it('warns instead of silently dropping an unrecognized scan node with no relation to map', () => {
      const { mappings, diagnostics } = parsePostgresPlan({
        Plan: { 'Node Type': 'Some Future Scan', 'Plan Rows': 1 },
      });

      expect(mappings).toEqual([]);
      expect(diagnostics).toEqual([
        expect.objectContaining({
          code: 'TABLE_MAPPING_FAILED',
          severity: 'warning',
          affectsCompleteness: true,
          message: expect.stringContaining('Could not resolve a table for plan node n0 (Some Future Scan)'),
          node: { id: 'n0', operation: 'Some Future Scan' },
        }),
      ]);
    });

    it('never throws on malformed/unexpected input, still returning a usable (empty) tree', () => {
      for (const input of [undefined, null, 'not an object', {}, { Plan: { Plans: 'not an array' } }]) {
        const { planNode, mappings } = parsePostgresPlan(input);
        expect(mappings).toEqual([]);
        expect(planNode.children).toEqual([]);
      }
    });
  });

  describe('computeRowEstimateRatio', () => {
    it('only computes a ratio when both estimated and actual rows are known', () => {
      expect(computeRowEstimateRatio(41, 82)).toBe(2);
      expect(computeRowEstimateRatio(41, undefined)).toBeUndefined();
      expect(computeRowEstimateRatio(undefined, 82)).toBeUndefined();
      // A zero (or negative) estimate makes the ratio meaningless, not Infinity.
      expect(computeRowEstimateRatio(0, 82)).toBeUndefined();
    });
  });

  describe('extractPlanningTimeMs / extractExecutionTimeMs', () => {
    it('reads the top-level timing fields when present', () => {
      expect(extractPlanningTimeMs(explainRoot)).toBe(0.234);
      expect(extractExecutionTimeMs(explainRoot)).toBe(1.2);
    });

    it('returns undefined instead of throwing for missing/malformed input', () => {
      expect(extractPlanningTimeMs(undefined)).toBeUndefined();
      expect(extractPlanningTimeMs({})).toBeUndefined();
      expect(extractPlanningTimeMs({ 'Planning Time': 'not a number' })).toBeUndefined();
      // Non-string/non-number values must not reach toNum() (it would throw trying to .trim() them) - a boolean or nested object degrades to "no value", not a crash.
      expect(extractPlanningTimeMs({ 'Planning Time': true })).toBeUndefined();
      expect(extractPlanningTimeMs({ 'Planning Time': { nested: true } })).toBeUndefined();
      expect(extractPlanningTimeMs({ 'Planning Time': NaN })).toBeUndefined();
    });

    it('coerces a numeric string the same way toNum() does elsewhere in this driver', () => {
      expect(extractPlanningTimeMs({ 'Planning Time': '0.5' })).toBe(0.5);
    });
  });
});
describe('PostgresPerformanceTuningProvider', () => {
  const makeDriver = (requestSql: jest.Mock) => ({ requestSql });

  it('builds EXPLAIN (FORMAT JSON) and resolves the plan + table mappings', async () => {
    const requestSql = jest.fn().mockResolvedValue({
      rows: [{ values: { 'QUERY PLAN': [explainRoot] } }],
    });
    const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: { sql: 'SELECT * FROM orders JOIN customers ON ...', source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(requestSql).toHaveBeenCalledWith({
      sql: 'EXPLAIN (FORMAT JSON) SELECT * FROM orders JOIN customers ON ...',
      conditions: { rawQueries: true, binds: undefined },
      meta: { type: 'performanceTuningContext' },
    });
    expect(result.ok).toBe(true);
    expect(result.result!.raw).toEqual([explainRoot]);
    expect(result.result!.planningTimeMs).toBe(0.234);
    expect(result.result!.planTableMappings).toHaveLength(2);
    // The normalized PlanNode tree lines up with planTableMappings: same node count, same "n0, n1, ..." IDs, built from the same walk.
    expect(result.result!.normalizedPlan).toMatchObject({
      id: 'n0',
      operation: 'Hash Join',
      joinType: 'Inner',
      children: [
        expect.objectContaining({
          id: 'n1',
          operation: 'Seq Scan',
          relation: expect.objectContaining({ tableName: 'orders' }),
        }),
        expect.objectContaining({
          id: 'n2',
          operation: 'Hash',
          children: [expect.objectContaining({ id: 'n3', operation: 'Index Scan' })],
        }),
      ],
    });
  });

  it('reports the pg_stat_statements/pg_stat_statements_info Function Scan case as information, not warnings', async () => {
    // pg_stat_statements/pg_stat_statements_info are views backed by a set-returning function - EXPLAIN shows them as Function Scan nodes with no Relation Name once the view is expanded.
    const requestSql = jest.fn().mockResolvedValue({
      rows: [
        {
          values: {
            'QUERY PLAN': [
              {
                Plan: {
                  'Node Type': 'Hash Join',
                  'Join Type': 'Inner',
                  Plans: [
                    {
                      'Node Type': 'Function Scan',
                      'Function Name': 'pg_stat_statements_info',
                      'Plan Rows': 1,
                    },
                    {
                      'Node Type': 'Function Scan',
                      'Function Name': 'pg_stat_statements',
                      'Plan Rows': 100,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    });
    const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: { sql: 'SELECT * FROM pg_stat_statements_info, pg_stat_statements', source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    // Neither node resolves to a table mapping - there is no table here.
    expect(result.result!.planTableMappings).toEqual([]);
    expect(result.result!.diagnostics).toEqual([
      expect.objectContaining({
        code: 'NON_TABLE_PLAN_SOURCE',
        severity: 'info',
        affectsCompleteness: false,
        node: {
          id: 'n1',
          operation: 'Function Scan',
          objectKind: 'function',
          objectName: 'pg_stat_statements_info',
        },
      }),
      expect.objectContaining({
        code: 'NON_TABLE_PLAN_SOURCE',
        severity: 'info',
        affectsCompleteness: false,
        node: { id: 'n2', operation: 'Function Scan', objectKind: 'function', objectName: 'pg_stat_statements' },
      }),
    ]);
    // No diagnostic here is a warning - a caller assembling collection.status from this alone would see 'complete', not 'partial' (full end-to-end proof of that lives in PerformanceTuningContext.test.ts).
    expect(result.result!.diagnostics!.every((d) => d.severity === 'info')).toBe(true);
  });

  it('parses a JSON-string QUERY PLAN value the same way as an already-parsed one', async () => {
    const requestSql = jest.fn().mockResolvedValue({
      rows: [{ values: { 'QUERY PLAN': JSON.stringify([explainRoot]) } }],
    });
    const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: { sql: 'SELECT 1', source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings).toHaveLength(2);
  });

  it('builds EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) in analyze mode and includes actual stats', async () => {
    const analyzeExplainRoot = {
      Plan: {
        'Node Type': 'Seq Scan',
        'Relation Name': 'orders',
        Alias: 'orders',
        Filter: "(status = 'shipped'::text)",
        'Plan Rows': 41,
        'Actual Startup Time': 0.012,
        'Actual Total Time': 1.234,
        'Actual Rows': 37,
        'Actual Loops': 1,
      },
      'Planning Time': 0.1,
      'Execution Time': 1.5,
    };
    const requestSql = jest.fn().mockResolvedValue({
      rows: [{ values: { 'QUERY PLAN': [analyzeExplainRoot] } }],
    });
    const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: { sql: "SELECT * FROM orders WHERE status = 'shipped'", source: 'editor' },
        plan: { mode: 'analyze', allowExecution: true },
      },
      { timeoutMs: 5000 },
    );

    expect(requestSql).toHaveBeenCalledWith({
      sql: "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) SELECT * FROM orders WHERE status = 'shipped'",
      conditions: { rawQueries: true, binds: undefined },
      meta: { type: 'performanceTuningContext' },
    });
    expect(result.ok).toBe(true);
    expect(result.result!.executionTimeMs).toBe(1.5);
    expect(result.result!.normalizedPlan).toMatchObject({ actual: { rows: 37, loops: 1 } });
    expect(result.result!.planTableMappings?.[0]).toMatchObject({ actualRows: 37 });
  });

  it('surfaces a failed EXPLAIN with detail instead of throwing', async () => {
    const requestSql = jest.fn().mockRejectedValue(new Error('permission denied for table orders'));
    const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: { sql: 'SELECT * FROM orders', source: 'editor' },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Failed to retrieve the execution plan.');
    expect(result.message).toContain('permission denied for table orders');
  });

  const target = { databaseName: 'testdb', tableName: 'perf_orders' };
  const options = {
    limits: {
      maxTables: 8,
      maxColumnsPerTable: 40,
      maxIndexesPerTable: 20,
      maxPayloadBytes: 200_000,
    },
    timeoutMs: 5000,
  };

  // Routes each catalog query to a fixture by inspecting the SQL text - more robust than relying on collectTableDefinition's Promise.all() call order, and reads like the actual queries being simulated.
  const routedRequestSql = (rowsBySection: {
    columns?: unknown[];
    constraints?: unknown[];
    indexes?: unknown[];
    partitioning?: unknown[];
    tableStatistics?: unknown[];
    columnStatistics?: unknown[];
    physicalHealth?: unknown[];
  }) =>
    jest.fn(async (params: { sql: string; conditions?: { binds?: string[] }; meta?: unknown }) => {
      const { sql } = params;
      if (sql.includes('information_schema.columns')) {
        return { rows: (rowsBySection.columns ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM pg_constraint')) {
        return { rows: (rowsBySection.constraints ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM pg_index')) {
        return { rows: (rowsBySection.indexes ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM pg_partitioned_table')) {
        return { rows: (rowsBySection.partitioning ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('FROM pg_stats')) {
        return { rows: (rowsBySection.columnStatistics ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('n_live_tup')) {
        return { rows: (rowsBySection.physicalHealth ?? []).map((values) => ({ values })) };
      }
      if (sql.includes('reltuples')) {
        return { rows: (rowsBySection.tableStatistics ?? []).map((values) => ({ values })) };
      }
      throw new Error(`PostgresPerformanceTuningProvider.test.ts: unrouted SQL: ${sql}`);
    });

  describe('collectTableDefinition', () => {
    it('assembles columns/constraints/indexes/partitioning and renders a DDL', async () => {
      const requestSql = routedRequestSql({
        columns: [
          {
            name: 'id',
            data_type: 'integer',
            udt_name: 'int4',
            is_nullable: 'NO',
            column_default: "nextval('perf_orders_id_seq'::regclass)",
            ordinal_position: 1,
            comment: null,
          },
        ],
        constraints: [
          {
            constraint_name: 'perf_orders_pkey',
            contype: 'p',
            columns: ['id'],
            referenced_schema: null,
            referenced_table: null,
            referenced_columns: null,
            definition: 'PRIMARY KEY (id)',
          },
        ],
        indexes: [
          {
            index_name: 'perf_orders_pkey',
            is_unique: true,
            is_primary: true,
            is_valid: true,
            index_type: 'btree',
            predicate: null,
            n_key_atts: 1,
            columns: [{ position: 1, name: 'id', expression: null, desc: false }],
          },
        ],
        partitioning: [],
      });
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableDefinition(target, options);

      expect(result.ok).toBe(true);
      expect(result.result!.columns).toHaveLength(1);
      expect(result.result!.constraints).toHaveLength(1);
      expect(result.result!.indexes).toHaveLength(1);
      expect(result.result!.partitioning).toBeUndefined();
      expect(result.result!.ddl).toContain('CREATE TABLE perf_orders (');

      for (const call of requestSql.mock.calls) {
        expect(call[0].conditions.binds[0]).toBe('perf_orders');
        expect(call[0].meta).toEqual({ type: 'performanceTuningContext' });
      }
    });

    it('reports the table as not found when the columns query returns nothing', async () => {
      const requestSql = routedRequestSql({});
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableDefinition(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });

    it('still succeeds with a warning when only a secondary section fails', async () => {
      const requestSql = jest.fn(async ({ sql }: { sql: string }) => {
        if (sql.includes('information_schema.columns')) {
          return {
            rows: [
              {
                values: {
                  name: 'id',
                  data_type: 'integer',
                  is_nullable: 'NO',
                  column_default: null,
                  ordinal_position: 1,
                  comment: null,
                },
              },
            ],
          };
        }
        if (sql.includes('FROM pg_index')) {
          throw new Error('permission denied for pg_index');
        }
        return { rows: [] };
      });
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableDefinition(target, options);
      expect(result.ok).toBe(true);
      expect(result.result!.columns).toHaveLength(1);
      expect(result.result!.indexes).toEqual([]);
      expect(result.message).toContain('indexes');
      expect(result.message).toContain('permission denied for pg_index');
    });
  });

  describe('collectTableStatistics', () => {
    it('maps a single-row result', async () => {
      const requestSql = routedRequestSql({
        tableStatistics: [
          {
            estimated_row_count: 50,
            table_bytes: '8192',
            index_bytes: 65536,
            total_bytes: 73728,
            n_mod_since_analyze: 50,
            last_analyze: new Date('2026-08-16T06:51:39.276Z'),
            last_autoanalyze: null,
          },
        ],
      });
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(true);
      expect(result.result!.estimatedRowCount?.value).toBe(50);
      expect(result.result!.tableBytes?.value).toBe(8192);
    });

    it('reports not found instead of a fabricated empty statistics object', async () => {
      const requestSql = routedRequestSql({ tableStatistics: [] });
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectTableStatistics(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('was not found');
    });
  });

  describe('collectColumnStatistics', () => {
    it('builds one placeholder per requested column and maps the rows', async () => {
      const requestSql = routedRequestSql({
        columnStatistics: [
          { attname: 'status', n_distinct: 2, null_frac: 0, avg_width: 5, correlation: 0.5, reltuples: 50 },
          { attname: 'customer_id', n_distinct: -1, null_frac: 0, avg_width: 4, correlation: 1, reltuples: 50 },
        ],
      });
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics(
        { ...target, columnNames: ['status', 'customer_id'] },
        options,
      );

      expect(result.ok).toBe(true);
      expect(result.result!.map((c) => c.columnName)).toEqual(['status', 'customer_id']);

      const [call] = requestSql.mock.calls;
      expect(call[0].sql).toContain('ps.attname IN ($3, $4)');
      expect(call[0].conditions.binds).toEqual(['perf_orders', '', 'status', 'customer_id']);
    });

    it('returns an empty result without querying when no columns are requested', async () => {
      const requestSql = jest.fn();
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectColumnStatistics({ ...target, columnNames: [] }, options);
      expect(result).toEqual({ ok: true, message: '', result: [] });
      expect(requestSql).not.toHaveBeenCalled();
    });
  });

  describe('collectPhysicalHealth', () => {
    it('maps dead/live tuple counts', async () => {
      const requestSql = routedRequestSql({
        physicalHealth: [
          {
            n_live_tup: 90,
            n_dead_tup: 10,
            n_mod_since_analyze: 5,
            last_vacuum: null,
            last_autovacuum: new Date('2026-08-16T00:00:00.000Z'),
            last_analyze: null,
            last_autoanalyze: null,
          },
        ],
      });
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(true);
      const byName = Object.fromEntries(result.result!.metrics.map((m) => [m.name, m.value]));
      expect(byName.liveTuples).toBe(90);
      expect(byName.deadTuples).toBe(10);
    });

    it('wraps a rejected query into a GeneralResult instead of throwing', async () => {
      const requestSql = jest.fn().mockRejectedValue(new Error('connection reset'));
      const provider = new PostgresPerformanceTuningProvider(makeDriver(requestSql));

      const result = await provider.collectPhysicalHealth(target, options);
      expect(result.ok).toBe(false);
      expect(result.message).toContain('Failed to collect physical health');
      expect(result.message).toContain('connection reset');
    });
  });

  it('reports capability status: everything true, including analyzedExecutionPlan', async () => {
    const provider = new PostgresPerformanceTuningProvider(makeDriver(jest.fn()));
    const result = await provider.checkCapabilities({ databaseName: 'testdb' });

    expect(result.ok).toBe(true);
    expect(result.result).toEqual({
      executionPlan: { available: true, source: 'EXPLAIN (FORMAT JSON)' },
      analyzedExecutionPlan: expect.objectContaining({ available: true }),
      tableDefinition: expect.objectContaining({ available: true }),
      optimizerStatistics: expect.objectContaining({ available: true }),
      physicalHealth: expect.objectContaining({ available: true }),
    });
  });
});

// Runs the actual catalog SQL against a live PostgreSQL (the same Docker fixture __tests__/db/drivers/PostgresDriver.test.ts uses), not stubbed rows.
describe('PostgresPerformanceTuningProvider (live PostgreSQL)', () => {
  const connectOption: ConnectionSetting = {
    host: '127.0.0.1',
    port: 6002,
    user: 'testuser',
    password: 'testpass',
    database: 'testdb',
    dbType: DBType.Postgres,
    name: 'postgres-performance-tuning-test',
  };
  const target = { databaseName: 'testdb', tableName: 'perf_orders' };
  const options = {
    limits: { maxTables: 8, maxColumnsPerTable: 40, maxIndexesPerTable: 20, maxPayloadBytes: 200_000 },
    timeoutMs: 5000,
  };

  let driver: PostgresDriver;
  let provider: PostgresPerformanceTuningProvider;

  beforeAll(async () => {
    await init();
    driver = new PostgresDriver(connectOption);
    await driver.connect();
    provider = new PostgresPerformanceTuningProvider(driver);
  });

  afterAll(async () => {
    await driver?.disconnect();
  });

  it('retrieves an estimate plan and resolves perf_orders from it', async () => {
    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: {
          sql: "SELECT * FROM perf_orders WHERE status = 'shipped'",
          source: 'editor',
        },
        plan: {},
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.planTableMappings?.[0]).toMatchObject({ tableName: 'perf_orders' });
    // Postgres' own EXPLAIN JSON shape, not something this driver invented.
    expect(result.result!.raw).toMatchObject([{ Plan: expect.objectContaining({}) }]);
  });

  it('retrieves an analyze plan with real actual rows/timing for perf_orders', async () => {
    const result = await provider.collectExecutionPlan(
      {
        databaseName: 'testdb',
        statement: {
          sql: "SELECT * FROM perf_orders WHERE status = 'shipped'",
          source: 'editor',
        },
        plan: { mode: 'analyze', allowExecution: true },
      },
      { timeoutMs: 5000 },
    );

    expect(result.ok).toBe(true);
    expect(result.result!.executionTimeMs).toBeGreaterThan(0);
    expect(result.result!.planTableMappings?.[0]).toMatchObject({
      tableName: 'perf_orders',
      actualRows: expect.any(Number),
    });
    // Real ANALYZE/BUFFERS fields, not something this driver invented.
    expect(result.result!.raw).toMatchObject([
      { Plan: expect.objectContaining({ 'Actual Rows': expect.any(Number) }) },
    ]);
  });

  it('collects DDL/columns/constraints/indexes for perf_orders, including the CHECK constraint and partial/expression indexes', async () => {
    const result = await provider.collectTableDefinition(target, options);

    expect(result.ok).toBe(true);
    const def = result.result!;

    expect(def.columns.map((c) => c.columnName)).toEqual(
      expect.arrayContaining(['id', 'customer_id', 'status', 'amount']),
    );
    const idColumn = def.columns.find((c) => c.columnName === 'id')!;
    expect(idColumn.nullable).toBe(false);
    expect(idColumn.defaultExpression).toContain('nextval');

    expect(def.constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'primaryKey', columns: ['id'] }),
        expect.objectContaining({ type: 'check', checkExpression: expect.stringContaining('amount') }),
      ]),
    );

    const indexNames = def.indexes.map((i) => i.indexName);
    expect(indexNames).toEqual(
      expect.arrayContaining([
        'perf_orders_pkey',
        'idx_perf_orders_customer_status',
        'idx_perf_orders_status_partial',
        'idx_perf_orders_lower_status',
      ]),
    );
    const partial = def.indexes.find((i) => i.indexName === 'idx_perf_orders_status_partial')!;
    expect(partial.predicate).toContain('shipped');
    const expressionIndex = def.indexes.find((i) => i.indexName === 'idx_perf_orders_lower_status')!;
    expect(expressionIndex.columns[0].expression).toContain('lower');
    const compositeIndex = def.indexes.find(
      (i) => i.indexName === 'idx_perf_orders_customer_status',
    )!;
    expect(compositeIndex.columns.map((c) => c.columnName)).toEqual(['customer_id', 'status']);

    expect(def.ddl).toContain('CREATE TABLE');
    expect(def.ddl).toContain('perf_orders');
  });

  it('reports table statistics with real row counts and byte sizes', async () => {
    const result = await provider.collectTableStatistics(target, options);
    expect(result.ok).toBe(true);
    expect(result.result!.estimatedRowCount?.value).toBeGreaterThan(0);
    expect(result.result!.tableBytes?.value).toBeGreaterThan(0);
    expect(result.result!.tableBytes?.source).toBe('pg_table_size');
  });

  it('reports column statistics only for the requested columns', async () => {
    const result = await provider.collectColumnStatistics(
      { ...target, columnNames: ['status'] },
      options,
    );
    expect(result.ok).toBe(true);
    expect(result.result!.map((c) => c.columnName)).toEqual(['status']);
    // perf_orders has exactly 2 distinct status values ('new'/'shipped').
    expect(result.result![0].distinctCount?.value).toBe(2);
  });

  it('reports physical health metrics without a maintenance verdict', async () => {
    const result = await provider.collectPhysicalHealth(target, options);
    expect(result.ok).toBe(true);
    const names = result.result!.metrics.map((m) => m.name);
    expect(names).toEqual(expect.arrayContaining(['liveTuples', 'deadTuples']));
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
      databaseName: 'testdb',
      statement: {
        sql: "SELECT * FROM perf_orders WHERE status = 'shipped'",
        source: 'editor',
      },
      plan: {},
    });

    expect(result.ok).toBe(true);
    const context = result.result!;
    expect(context.tables).toHaveLength(1);
    expect(context.tables[0].tableName).toBe('perf_orders');
    expect(context.tables[0].definition?.columns.length).toBeGreaterThan(0);
    expect(context.tables[0].statistics?.estimatedRowCount?.value).toBeGreaterThan(0);
    expect(context.tables[0].physicalHealth?.metrics.length).toBeGreaterThan(0);
    expect(context.database.version).toBeDefined();
  });

  it('end-to-end via getPerformanceTuningContext() in analyze mode: executionTimeMs and actual rows are populated', async () => {
    const result = await driver.getPerformanceTuningContext({
      databaseName: 'testdb',
      statement: {
        sql: "SELECT * FROM perf_orders WHERE status = 'shipped'",
        source: 'editor',
      },
      plan: { mode: 'analyze', allowExecution: true },
    });

    expect(result.ok).toBe(true);
    const context = result.result!;
    expect(context.executionPlan.mode).toBe('analyze');
    expect(context.executionPlan.executionTimeMs).toBeGreaterThan(0);
    expect(context.tables[0].tableName).toBe('perf_orders');
  });
});
