import type { PlanTableMapping } from '../../../src';
import {
  parseMysqlActualPlanText,
  resolveDominantCostFromMysqlActualPlanText,
  resolveMysqlActualPlanTableStats,
} from '../../../src';

// Verbatim from scripts/performance-lab/aiResults/2nd-0821-with-analyze/
// mysql/slow-01-missing-composite-index.dbn's "Actual execution plan
// (EXPLAIN ANALYZE)" section - the real regression case that motivated
// this whole file (see mysqlActualPlanTextParser.ts's own header comment
// and summary.md's "追加検証(2nd-0821)"). 7 lines - 2 more than the
// corresponding JSON estimate-plan's 5 nodes, confirming the positional-
// alignment approach was correctly rejected.
const SLOW_01_ACTUAL_PLAN_TEXT = `-> Sort: revenue DESC  (actual time=99.9..99.9 rows=1 loops=1)
    -> Table scan on <temporary>  (actual time=99.8..99.8 rows=1 loops=1)
        -> Aggregate using temporary table  (actual time=99.8..99.8 rows=1 loops=1)
            -> Nested loop inner join  (cost=7652 rows=3255) (actual time=7.55..99.5 rows=150 loops=1)
                -> Filter: ((performance_lab.o.tenant_id = 42) and (performance_lab.o.created_at >= TIMESTAMP'2025-01-01 00:00:00') and (performance_lab.o.created_at < TIMESTAMP'2026-01-01 00:00:00'))  (cost=4579 rows=3255) (actual time=7.47..98.5 rows=150 loops=1)
                    -> Index lookup on o using idx_orders_status (status='PENDING')  (cost=4579 rows=65098) (actual time=7.4..97 rows=32100 loops=1)
                -> Single-row index lookup on c using PRIMARY (id=performance_lab.o.customer_id)  (cost=0.844 rows=1) (actual time=0.00635..0.00637 rows=1 loops=150)`;

// planTableMappings as the corresponding EXPLAIN FORMAT=JSON pass would
// have resolved them for the same query (table alias "o"/"c" as
// table_name, per mysqlPlanParser.ts's own documented alias behavior).
const SLOW_01_PLAN_TABLE_MAPPINGS: PlanTableMapping[] = [
  { planNodeId: 'n3', tableName: 'o', indexName: 'idx_orders_status', estimatedRows: 3254 },
  { planNodeId: 'n4', tableName: 'c', indexName: 'PRIMARY', estimatedRows: 3254 },
];

describe('parseMysqlActualPlanText', () => {
  it('parses indent into depth (4 spaces per level) and extracts cost/actual-time/rows/loops', () => {
    const lines = parseMysqlActualPlanText(SLOW_01_ACTUAL_PLAN_TEXT);
    expect(lines).toHaveLength(7);
    expect(lines[0]).toMatchObject({ depth: 0, text: 'Sort: revenue DESC', actualTotalMs: 99.9, actualRows: 1, actualLoops: 1 });
    expect(lines[3]).toMatchObject({
      depth: 3,
      text: 'Nested loop inner join',
      estCost: 7652,
      estRows: 3255,
      actualStartMs: 7.55,
      actualTotalMs: 99.5,
      actualRows: 150,
      actualLoops: 1,
    });
  });

  it('tolerates a line with no (cost=...) annotation (only some lines carry one)', () => {
    const lines = parseMysqlActualPlanText('-> Sort: revenue DESC  (actual time=99.9..99.9 rows=1 loops=1)');
    expect(lines[0].estCost).toBeUndefined();
    expect(lines[0].actualTotalMs).toBe(99.9);
  });

  it('classifies each of the table-access phrases and extracts {alias, indexName}', () => {
    const lines = parseMysqlActualPlanText(SLOW_01_ACTUAL_PLAN_TEXT);
    const indexLookup = lines.find((l) => l.text.startsWith('Index lookup on'));
    expect(indexLookup).toMatchObject({ kind: 'tableAccess', alias: 'o', indexName: 'idx_orders_status' });

    const singleRow = lines.find((l) => l.text.startsWith('Single-row index lookup on'));
    expect(singleRow).toMatchObject({ kind: 'tableAccess', alias: 'c', indexName: 'PRIMARY' });

    const coveringLines = parseMysqlActualPlanText(
      '-> Covering index lookup on p using idx_products_category (category=1)  (actual time=1..2 rows=3 loops=1)',
    );
    expect(coveringLines[0]).toMatchObject({ kind: 'tableAccess', alias: 'p', indexName: 'idx_products_category' });

    const rangeLines = parseMysqlActualPlanText(
      '-> Index range scan on o using idx_orders_created_at  (actual time=1..2 rows=3 loops=1)',
    );
    expect(rangeLines[0]).toMatchObject({ kind: 'tableAccess', alias: 'o', indexName: 'idx_orders_created_at' });

    const plainScanLines = parseMysqlActualPlanText('-> Index scan on t using PRIMARY  (actual time=1..2 rows=3 loops=1)');
    expect(plainScanLines[0]).toMatchObject({ kind: 'tableAccess', alias: 't', indexName: 'PRIMARY' });

    const tableScanLines = parseMysqlActualPlanText('-> Table scan on t  (actual time=1..2 rows=3 loops=1)');
    expect(tableScanLines[0]).toMatchObject({ kind: 'tableAccess', alias: 't', indexName: undefined });
  });

  it('classifies a synthetic "Table scan on <temporary>" as other, not a resolvable tableAccess', () => {
    const lines = parseMysqlActualPlanText(SLOW_01_ACTUAL_PLAN_TEXT);
    const tempScan = lines.find((l) => l.text === 'Table scan on <temporary>');
    expect(tempScan?.kind).toBe('other');
    expect(tempScan?.alias).toBeUndefined();
  });

  it('classifies generic operation phrases without affecting the shape of timing data', () => {
    const lines = parseMysqlActualPlanText(SLOW_01_ACTUAL_PLAN_TEXT);
    expect(lines.find((l) => l.text === 'Sort: revenue DESC')?.kind).toBe('sort');
    expect(lines.find((l) => l.text.startsWith('Aggregate using'))?.kind).toBe('aggregate');
    expect(lines.find((l) => l.text === 'Nested loop inner join')?.kind).toBe('join');
    expect(lines.find((l) => l.text.startsWith('Filter:'))?.kind).toBe('filter');
  });

  it('degrades an unrecognized operation phrase to kind:"other" without throwing', () => {
    const lines = parseMysqlActualPlanText('-> Some future MySQL operation nobody has seen yet  (actual time=1..2 rows=3 loops=1)');
    expect(lines).toHaveLength(1);
    expect(lines[0].kind).toBe('other');
  });

  it('skips lines that do not look like a "-> ..." tree line at all, without throwing', () => {
    const lines = parseMysqlActualPlanText('not a tree line\n\n-> Sort: x  (actual time=1..2 rows=1 loops=1)');
    expect(lines).toHaveLength(1);
  });
});

describe('resolveDominantCostFromMysqlActualPlanText', () => {
  it('identifies the real regression case correctly: the low-selectivity index lookup, not the Filter/Aggregate/Sort ancestors above it', () => {
    const result = resolveDominantCostFromMysqlActualPlanText(SLOW_01_ACTUAL_PLAN_TEXT, SLOW_01_PLAN_TABLE_MAPPINGS);
    // By hand: "Index lookup on o using idx_orders_status" has inclusive
    // 97ms (leaf, loops=1) - by far the largest exclusive contributor once
    // every ancestor's own exclusive cost is computed (Filter's exclusive
    // is only 98.5-97=1.5ms once its child is subtracted, NestedLoop's is
    // ~0.04ms, etc.) - see planNodeMath.ts's computeExclusiveCost().
    expect(result).toEqual({ planNodeId: 'n3', metric: 'actual', exclusiveValue: 97 });
  });

  it('returns undefined when no tableAccess line resolves against planTableMappings', () => {
    const result = resolveDominantCostFromMysqlActualPlanText(SLOW_01_ACTUAL_PLAN_TEXT, [
      { planNodeId: 'n9', tableName: 'unrelated_table' },
    ]);
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty/unparseable input', () => {
    expect(resolveDominantCostFromMysqlActualPlanText('', SLOW_01_PLAN_TABLE_MAPPINGS)).toBeUndefined();
    expect(resolveDominantCostFromMysqlActualPlanText('not a tree at all', SLOW_01_PLAN_TABLE_MAPPINGS)).toBeUndefined();
  });

  it('tie-breaks on indexName when multiple mappings share the same table alias', () => {
    const text = '-> Index lookup on o using idx_a  (actual time=1..50 rows=100 loops=1)';
    const mappings: PlanTableMapping[] = [
      { planNodeId: 'wrong', tableName: 'o', indexName: 'idx_b' },
      { planNodeId: 'right', tableName: 'o', indexName: 'idx_a' },
    ];
    const result = resolveDominantCostFromMysqlActualPlanText(text, mappings);
    expect(result?.planNodeId).toBe('right');
  });
});

// 2026-08-21 follow-up (found while manually verifying the feature in the
// Extension Development Host): dominantCostPlanNode resolution alone never
// fed real actualRows back into planTableMappings, so the rendered plan
// table's "Actual rows"/"Est./actual ratio" columns stayed blank even after
// a fully successful EXPLAIN ANALYZE.
describe('resolveMysqlActualPlanTableStats', () => {
  it('backfills actualRowsByPlanNodeId for every resolvable tableAccess line, not just the dominant one', () => {
    const { actualRowsByPlanNodeId } = resolveMysqlActualPlanTableStats(
      SLOW_01_ACTUAL_PLAN_TEXT,
      SLOW_01_PLAN_TABLE_MAPPINGS,
    );
    // "Index lookup on o using idx_orders_status ... rows=32100" and
    // "Single-row index lookup on c using PRIMARY ... rows=1", verbatim
    // from the real sample.
    expect(actualRowsByPlanNodeId.get('n3')).toBe(32100);
    expect(actualRowsByPlanNodeId.get('n4')).toBe(1);
  });

  it('returns the same dominantCostPlanNode as the thin wrapper (single parse/walk shared between both)', () => {
    const stats = resolveMysqlActualPlanTableStats(SLOW_01_ACTUAL_PLAN_TEXT, SLOW_01_PLAN_TABLE_MAPPINGS);
    const wrapperResult = resolveDominantCostFromMysqlActualPlanText(SLOW_01_ACTUAL_PLAN_TEXT, SLOW_01_PLAN_TABLE_MAPPINGS);
    expect(stats.dominantCostPlanNode).toEqual(wrapperResult);
  });

  it('returns an empty map, not a throw, when nothing resolves', () => {
    const stats = resolveMysqlActualPlanTableStats(SLOW_01_ACTUAL_PLAN_TEXT, [
      { planNodeId: 'n9', tableName: 'unrelated_table' },
    ]);
    expect(stats.actualRowsByPlanNodeId.size).toBe(0);
    expect(stats.dominantCostPlanNode).toBeUndefined();
  });
});
