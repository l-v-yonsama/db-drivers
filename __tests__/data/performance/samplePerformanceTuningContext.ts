import { PerformanceTuningContext } from '../../../src';

// A hand-built, fully-typed example of getPerformanceTuningContext()'s
// output, standing in for the PostgreSQL fixture that Phase 1 will replace
// with real EXPLAIN/catalog output (§10 Phase 0 "PostgreSQL / MySQL / SQL
// Server / Oracle の plan・統計 fixture"). Until then this is what proves:
//   - the type surface actually nests together into one coherent object,
//   - validatePerformanceTuningContext() accepts a well-formed context,
//   - nothing in a well-formed context looks like a raw bind/secret value.
// Deliberately contains a query with a literal already removed, and no
// bind array anywhere - PerformanceTuningContext has no field to hold binds
// in the first place (§9.2: binds are used for plan retrieval only and are
// never part of the return value).
export const samplePerformanceTuningContext: PerformanceTuningContext = {
  formatVersion: 1,

  database: {
    vendor: 'postgresql',
    version: '16.3',
    databaseName: 'appdb',
    schemaName: 'public',
    environment: 'staging',
  },

  statement: {
    sql: 'SELECT * FROM orders WHERE customer_id = ? AND status = ?',
    source: 'statementStatistics',
  },

  workload: {
    statementId: '1234567890',
    executionCount: 4820,
    totalElapsedTimeMs: 963_120,
    averageElapsedTimeMs: 199.8,
    minElapsedTimeMs: 12.1,
    maxElapsedTimeMs: 5400.3,
    rowsProcessed: 41,
    logicalReads: 88_204,
    physicalReads: 512,
    lastExecutedAt: '2026-08-16T09:12:00.000Z',
    source: 'pg_stat_statements',
  },

  executionPlan: {
    mode: 'estimate',
    format: 'json',
    vendorPlan: { Plan: { 'Node Type': 'Seq Scan', 'Relation Name': 'orders' } },
    normalizedPlan: {
      id: 'n1',
      depth: 0,
      operation: 'Seq Scan',
      relation: { schemaName: 'public', tableName: 'orders', alias: 'orders' },
      predicates: ['customer_id = $1', 'status = $2'],
      estimated: { startupCost: 0, totalCost: 48210, rows: 41, width: 96 },
      children: [],
    },
    planningTimeMs: 0.4,
    warnings: [],
  },

  tables: [
    {
      schemaName: 'public',
      tableName: 'orders',
      definition: {
        ddl: 'CREATE TABLE public.orders (id bigint PRIMARY KEY, customer_id bigint NOT NULL, status text NOT NULL)',
        columns: [
          { columnName: 'id', dataType: 'bigint', nullable: false, ordinalPosition: 1 },
          { columnName: 'customer_id', dataType: 'bigint', nullable: false, ordinalPosition: 2 },
          { columnName: 'status', dataType: 'text', nullable: false, ordinalPosition: 3 },
        ],
        constraints: [
          { constraintName: 'orders_pkey', type: 'primaryKey', columns: ['id'] },
        ],
        indexes: [
          {
            indexName: 'orders_pkey',
            unique: true,
            primary: true,
            columns: [{ columnName: 'id', direction: 'asc' }],
            visible: true,
            enabled: true,
            indexType: 'btree',
          },
        ],
      },
      statistics: {
        estimatedRowCount: {
          value: 1_204_800,
          estimated: true,
          source: 'pg_stat_user_tables.n_live_tup',
        },
        tableBytes: {
          value: 314_572_800,
          estimated: false,
          source: 'pg_table_size',
          unit: 'bytes',
        },
        statisticsUpdatedAt: {
          value: '2026-08-15T02:00:00.000Z',
          estimated: false,
          source: 'pg_stat_user_tables.last_analyze',
        },
        columns: [
          {
            columnName: 'customer_id',
            distinctCount: {
              value: 98_400,
              estimated: true,
              source: 'pg_stats.n_distinct',
            },
            nullFraction: {
              value: 0,
              estimated: true,
              source: 'pg_stats.null_frac',
            },
          },
        ],
      },
      physicalHealth: {
        provider: 'postgresql',
        metrics: [
          {
            name: 'deadTuples',
            value: 812,
            unit: 'rows',
            estimated: true,
            description: 'pg_stat_user_tables.n_dead_tup',
          },
        ],
      },
      warnings: [],
    },
  ],

  planTableMappings: [
    {
      planNodeId: 'n1',
      schemaName: 'public',
      tableName: 'orders',
      alias: 'orders',
      estimatedRows: 41,
      filterColumns: ['customer_id', 'status'],
    },
  ],

  collection: {
    collectedAt: '2026-08-16T09:15:00.000Z',
    status: 'complete',
    warnings: [],
    unavailableSections: [],
  },
};
