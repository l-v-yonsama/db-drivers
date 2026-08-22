import type { PlanTableMapping } from '../../../src';
import { extractOracleRuntimeObservations, resolveOracleActualPlanTableStats } from '../../../src';

// Captured from the supplied Oracle 23c ALLSTATS LAST context. Its EXPLAIN
// PLAN had full scans, while execution used index access, proving a parser
// must resolve by relation rather than by PLAN_TABLE/DBMS_XPLAN row ID.
const ACTUAL_PLAN = `Plan hash value: 3751868445

--------------------------------------------------------------------------------------------------------------------------------------------------
| Id  | Operation                               | Name              | Starts | E-Rows | A-Rows |   A-Time   | Buffers |  OMem |  1Mem | Used-Mem |
--------------------------------------------------------------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT                        |                   |      1 |        |      1 |00:00:00.10 |   11502 |       |       |          |
|   3 |    NESTED LOOPS                         |                   |      1 |     49 |    150 |00:00:00.10 |   11502 |       |       |          |
|*  5 |      TABLE ACCESS BY INDEX ROWID BATCHED| ORDERS            |      1 |     49 |    150 |00:00:00.09 |   11200 |       |       |          |
|*  6 |       INDEX RANGE SCAN                  | IDX_ORDERS_STATUS |      1 |  32100 |  32100 |00:00:00.01 |      88 |       |       |          |
|*  7 |      INDEX UNIQUE SCAN                  | SYS_C0010598      |    150 |      1 |    150 |00:00:00.01 |     152 |       |       |          |
|   8 |     TABLE ACCESS BY INDEX ROWID         | CUSTOMERS         |    150 |      1 |    150 |00:00:00.01 |     150 |       |       |          |
--------------------------------------------------------------------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------

   5 - filter(("O"."TENANT_ID"=42 AND "O"."CREATED_AT">=TO_DATE(' 2025-01-01 00:00:00', 'syyyy-mm-dd hh24:mi:ss')))
   6 - access("O"."STATUS"=:1)
   7 - access("C"."ID"="O"."CUSTOMER_ID")`;

const MAPPINGS: PlanTableMapping[] = [
  { planNodeId: 'n4', schemaName: 'PERFLAB', tableName: 'ORDERS', alias: 'O', estimatedRows: 151 },
  { planNodeId: 'n5', schemaName: 'PERFLAB', tableName: 'CUSTOMERS', alias: 'C', estimatedRows: 30000 },
];

describe('resolveOracleActualPlanTableStats', () => {
  it('resolves a unique table access and normalizes A-Rows by Starts', () => {
    const stats = resolveOracleActualPlanTableStats(ACTUAL_PLAN, MAPPINGS);

    expect(stats.get('n4')).toEqual({
      actualRows: 150,
      tableAccessRows: 32100,
      predicateFilterInputRows: 32100,
      predicateFilterOutputRows: 150,
      indexName: 'IDX_ORDERS_STATUS',
    });
    // A-Rows is cumulative for this nested-loop inner operation: compare
    // 150 / 150 starts = 1 against the optimizer's per-start E-Rows=30000.
    expect(stats.get('n5')).toEqual({ actualRows: 1, tableAccessRows: 1, indexName: undefined });
  });

  it('does not guess when the estimated plan has a self-join-like duplicate table mapping', () => {
    const stats = resolveOracleActualPlanTableStats(ACTUAL_PLAN, [
      ...MAPPINGS,
      { planNodeId: 'n9', schemaName: 'PERFLAB', tableName: 'ORDERS', alias: 'O2', estimatedRows: 151 },
    ]);

    expect(stats.has('n4')).toBe(false);
    expect(stats.has('n9')).toBe(false);
    expect(stats.get('n5')?.actualRows).toBe(1);
  });

  it('does not infer filter selectivity when DISPLAY_CURSOR has no local filter entry', () => {
    const stats = resolveOracleActualPlanTableStats(ACTUAL_PLAN, MAPPINGS);
    expect(stats.get('n5')?.predicateFilterInputRows).toBeUndefined();
    expect(stats.get('n5')?.predicateFilterOutputRows).toBeUndefined();
  });

  it('keeps a compact dominant runtime operation without inventing a plan-node match', () => {
    expect(extractOracleRuntimeObservations(ACTUAL_PLAN)).toEqual([
      expect.objectContaining({
        kind: 'runtimeOperation',
        operation: 'TABLE ACCESS BY INDEX ROWID BATCHED',
        tableName: 'ORDERS',
        metrics: expect.objectContaining({ actualRows: 150, buffers: 11200, elapsedMs: 90 }),
      }),
    ]);
  });
});
