import { PlanTableMapping } from '../../../types/drivers/performance/PerformanceTuningContext';
import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { planUnresolvedDiagnostic } from './performanceTuningDiagnosticHelpers';
import { computeRowEstimateRatio } from './planNodeMath';
import { asNumber, asRecord, asString } from './vendorRowCoercion';

// Parses the object PostgreSQL's `EXPLAIN (FORMAT JSON)` returns (already
// JSON.parse()'d by the caller). Everything here is defensive/best-effort:
// the input is DB output we don't control the exact shape of across
// versions, so every access is guarded and nothing throws - a plan we can't
// fully make sense of should degrade to "fewer mappings", never fail the
// whole collection. The asXxx() value coercers themselves live in
// vendorRowCoercion.ts, shared with postgresCatalogMapper.ts.
//
// `planNodeId` values (and `PlanNode.id`) are assigned depth-first ("n0",
// "n1", ...) in plan visitation order, by the same single walk in
// parsePostgresPlan() below - the common PlanNode tree and the
// PlanTableMapping[] list are built together so their IDs can never drift
// apart from each other (§10 Phase 2: "plan node と table/index/column
// statistics の mapping を作る").
//
// A scan node with no `Relation Name` is either (a) reading from something
// that was never going to be a physical table - a set-returning function, a
// VALUES list, a CTE, a recursive CTE's work table, a subquery - in which
// case table DDL/statistics genuinely do not apply and this is reported as
// `NON_TABLE_PLAN_SOURCE` information, (b) a Bitmap Index Scan whose table
// identity belongs to its Bitmap Heap Scan ancestor, or (c) a real
// table-mapping gap this driver doesn't understand yet, reported as a
// `TABLE_MAPPING_FAILED` warning. See misc/design/performance-tuning-context-
// implementation-plan.ja.md §4.4 for the rationale.

const PREDICATE_KEYS = [
  'Filter',
  'Index Cond',
  'Hash Cond',
  'Merge Cond',
  'Join Filter',
  'Recheck Cond',
] as const;

// Best-effort column extraction from a predicate string, e.g.
// "(customer_id = 42)" -> ["customer_id"], "orders.status = 'shipped'" ->
// ["status"]. This is a heuristic, not a SQL expression parser: it looks
// for identifier-like tokens immediately before a comparison operator. Good
// enough for pointing an AI at "these columns showed up in a predicate on
// this node"; not a source of truth for query semantics.
const COLUMN_BEFORE_OPERATOR =
  /([a-zA-Z_][a-zA-Z0-9_.]*)\s*(?:=|<>|!=|<=|>=|<|>|~~?|!~~?|\bIN\b|\bLIKE\b|\bILIKE\b)/gi;

export function extractPredicateColumns(predicate: string | undefined): string[] {
  if (!predicate) {
    return [];
  }
  const columns = new Set<string>();
  for (const match of predicate.matchAll(COLUMN_BEFORE_OPERATOR)) {
    const raw = match[1];
    if (!raw) {
      continue;
    }
    // Drop a table/alias qualifier: "orders.customer_id" -> "customer_id".
    const column = raw.includes('.') ? raw.split('.').pop() : raw;
    if (column) {
      columns.add(column);
    }
  }
  return [...columns];
}

export function extractPlanningTimeMs(explainRoot: unknown): number | undefined {
  return asNumber(asRecord(explainRoot)?.['Planning Time']);
}

export function extractExecutionTimeMs(explainRoot: unknown): number | undefined {
  return asNumber(asRecord(explainRoot)?.['Execution Time']);
}

const hasAnyKey = (node: Record<string, unknown>, keys: readonly string[]): boolean =>
  keys.some((key) => node[key] !== undefined);

// Every `...Scan` node type Postgres can produce with no `Relation Name`
// that is still a fully-understood, non-table plan source - not an
// exhaustive list of every Postgres node type, only the ones this driver has
// confirmed never carry a `Relation Name` (§4.4). `nameKeys` are tried in
// order; the first key present on the raw node becomes `node.objectName`.
const NON_TABLE_SCAN_OPERATIONS: Record<
  string,
  { objectKind: NonNullable<PerformanceTuningDiagnostic['node']>['objectKind']; nameKeys: string[] }
> = {
  'Function Scan': { objectKind: 'function', nameKeys: ['Function Name'] },
  'Values Scan': { objectKind: 'values', nameKeys: ['Alias'] },
  'CTE Scan': { objectKind: 'cte', nameKeys: ['CTE Name', 'Alias'] },
  'WorkTable Scan': { objectKind: 'workTable', nameKeys: ['CTE Name', 'Alias'] },
  'Subquery Scan': { objectKind: 'subquery', nameKeys: ['Alias'] },
};

// Bitmap Index Scan nodes carry `Index Name` but no `Relation Name`; the
// latter lives on their Bitmap Heap Scan ancestor. BitmapAnd/BitmapOr may
// sit between the two. Only walk through that bitmap-specific subtree so an
// unrelated descendant scan can never be attributed to the heap table.
function collectBitmapIndexScans(rawChildren: unknown): Record<string, unknown>[] {
  if (!Array.isArray(rawChildren)) {
    return [];
  }

  const scans: Record<string, unknown>[] = [];
  for (const childValue of rawChildren) {
    const child = asRecord(childValue);
    if (!child) {
      continue;
    }
    const operation = asString(child['Node Type']);
    if (operation === 'Bitmap Index Scan') {
      scans.push(child);
    } else if (operation === 'BitmapAnd' || operation === 'BitmapOr') {
      scans.push(...collectBitmapIndexScans(child['Plans']));
    }
  }
  return scans;
}

export type ParsedPostgresPlan = {
  planNode: PlanNode;
  mappings: PlanTableMapping[];
  // Structured diagnostics produced while walking the plan (implementation
  // plan §4.4 / §10 Phase 2) - a non-table scan source
  // (information) or a genuine table-mapping gap (warning). Surfaced
  // explicitly instead of the node silently vanishing from
  // planTableMappings with no trace.
  diagnostics: PerformanceTuningDiagnostic[];
};

// `explainRoot` is expected to be the single element of the array
// `EXPLAIN (FORMAT JSON) ...` returns (i.e. `{ Plan: {...}, "Planning
// Time": ... }`), not the array itself. Walks the plan tree once, building
// the common PlanNode tree and PlanTableMapping[] together so both use the
// exact same depth-first "n0, n1, ..." node IDs.
export function parsePostgresPlan(explainRoot: unknown): ParsedPostgresPlan {
  const mappings: PlanTableMapping[] = [];
  const diagnostics: PerformanceTuningDiagnostic[] = [];
  let counter = 0;

  const visit = (
    nodeValue: unknown,
    parentId: string | undefined,
    depth: number,
    bitmapRelation?: NonNullable<PlanNode['relation']>,
  ): PlanNode | undefined => {
    const node = asRecord(nodeValue);
    if (!node) {
      return undefined;
    }
    const id = `n${counter++}`;
    const operation = asString(node['Node Type']) ?? 'Unknown';
    const tableName = asString(node['Relation Name']);
    const schemaName = asString(node['Schema']); // only present under EXPLAIN VERBOSE, which this driver doesn't request yet
    const aliasValue = asString(node['Alias']);
    const indexName = asString(node['Index Name']);

    const ownRelation: PlanNode['relation'] = tableName
      ? { schemaName, tableName, alias: aliasValue }
      : undefined;
    const inheritedBitmapRelation = operation === 'Bitmap Index Scan' ? bitmapRelation : undefined;
    const relation = ownRelation ?? inheritedBitmapRelation;

    const bitmapIndexScans = operation === 'Bitmap Heap Scan' ? collectBitmapIndexScans(node['Plans']) : [];
    // PlanTableMapping has a singular indexName. Merge it only when the
    // bitmap tree selects exactly one index; BitmapAnd/BitmapOr with several
    // indexes stays faithfully represented by the normalized child nodes.
    const mergedBitmapIndexName =
      bitmapIndexScans.length === 1 ? asString(bitmapIndexScans[0]['Index Name']) : undefined;

    const predicates: string[] = [];
    const filterColumns = new Set<string>();
    for (const key of PREDICATE_KEYS) {
      const predicate = asString(node[key]);
      if (predicate) {
        predicates.push(predicate);
        for (const column of extractPredicateColumns(predicate)) {
          filterColumns.add(column);
        }
      }
    }

    // Include child Index Cond columns in the heap table's flat mapping so
    // column-statistics collection does not depend on Postgres also
    // repeating them in Recheck Cond. Keep the normalized predicates on
    // their original nodes.
    const mappingFilterColumns = new Set(filterColumns);
    for (const bitmapIndexScan of bitmapIndexScans) {
      for (const key of PREDICATE_KEYS) {
        const predicate = asString(bitmapIndexScan[key]);
        for (const column of extractPredicateColumns(predicate)) {
          mappingFilterColumns.add(column);
        }
      }
    }

    if (tableName) {
      const alias = aliasValue && aliasValue !== tableName ? aliasValue : undefined;
      const estimatedRows = asNumber(node['Plan Rows']);
      const actualRows = asNumber(node['Actual Rows']);
      const rowsRemovedByFilter = asNumber(node['Rows Removed by Filter']);
      const hasLocalFilter = asString(node['Filter']) !== undefined;
      // PostgreSQL reports Actual Rows and Rows Removed by Filter per loop.
      // Keep that per-execution basis: multiplying nested-loop rescans by
      // loops could exceed the physical table cardinality and would make a
      // table fraction misleading. When a local Filter is present and its
      // removals are known, the sum is exactly the candidate set that
      // reached that Filter; otherwise Actual Rows is only an access-set
      // measure for an unfiltered table node.
      const tableAccessRows = actualRows !== undefined
        ? {
            value: actualRows + (hasLocalFilter && rowsRemovedByFilter !== undefined ? rowsRemovedByFilter : 0),
            estimated: false,
            source:
              hasLocalFilter && rowsRemovedByFilter !== undefined
                ? 'PostgreSQL EXPLAIN ANALYZE Actual Rows + Rows Removed by Filter (per loop)'
                : 'PostgreSQL EXPLAIN ANALYZE Actual Rows (per loop)',
          }
        : undefined;
      const predicateFilterInputRows =
        hasLocalFilter && actualRows !== undefined && rowsRemovedByFilter !== undefined
          ? {
              value: actualRows + rowsRemovedByFilter,
              estimated: false,
              source: 'PostgreSQL EXPLAIN ANALYZE Actual Rows + Rows Removed by Filter (per loop)',
            }
          : undefined;
      const predicateFilterOutputRows = predicateFilterInputRows
        ? {
            value: actualRows!,
            estimated: false,
            source: 'PostgreSQL EXPLAIN ANALYZE Actual Rows (per loop)',
          }
        : undefined;
      mappings.push({
        planNodeId: id,
        schemaName,
        tableName,
        alias,
        indexName: indexName ?? mergedBitmapIndexName,
        estimatedRows,
        actualRows,
        tableAccessRows,
        predicateFilterInputRows,
        predicateFilterOutputRows,
        rowEstimateRatio: computeRowEstimateRatio(estimatedRows, actualRows),
        filterColumns: mappingFilterColumns.size > 0 ? [...mappingFilterColumns] : undefined,
      });
    } else {
      const nonTableScan = NON_TABLE_SCAN_OPERATIONS[operation];
      if (nonTableScan) {
        // A known non-table scan source (Function/Values/CTE/WorkTable/
        // Subquery Scan) - fully understood, not a mapping failure: table
        // DDL/statistics were never going to apply to this node. Reported
        // as information, not a warning (§4.4).
        const objectName = nonTableScan.nameKeys.map((key) => asString(node[key])).find((v) => v !== undefined);
        diagnostics.push({
          code: 'NON_TABLE_PLAN_SOURCE',
          severity: 'info',
          affectsCompleteness: false,
          scope: 'executionPlan',
          message: `Plan node ${id} (${operation}) reads from a non-table source; table definitions and statistics do not apply to it.`,
          node: { id, operation, objectKind: nonTableScan.objectKind, objectName },
        });
      } else if (operation === 'Bitmap Index Scan' && inheritedBitmapRelation) {
        // This is the index half of a resolved Bitmap Heap Scan access. The
        // heap mapping already represents the physical table access, so do
        // not add a duplicate mapping or a false completeness warning.
      } else if (operation.endsWith('Scan')) {
        // A scan-family node with no relation that isn't one of the known
        // non-table sources above - an actual table-mapping gap (a future/
        // unrecognized Postgres node type, most likely), not a "nothing to
        // map" situation - called out as a warning rather than the node
        // just disappearing from planTableMappings.
        diagnostics.push({
          code: 'TABLE_MAPPING_FAILED',
          severity: 'warning',
          affectsCompleteness: true,
          scope: 'executionPlan',
          message: `Could not resolve a table for plan node ${id} (${operation}).`,
          node: { id, operation },
        });
      }
    }

    const children: PlanNode[] = [];
    const rawChildren = node['Plans'];
    const childBitmapRelation =
      operation === 'Bitmap Heap Scan' && ownRelation
        ? ownRelation
        : operation === 'BitmapAnd' || operation === 'BitmapOr'
          ? bitmapRelation
          : undefined;
    if (Array.isArray(rawChildren)) {
      for (const child of rawChildren) {
        const childNode = visit(child, id, depth + 1, childBitmapRelation);
        if (childNode) {
          children.push(childNode);
        }
      }
    }

    const planNode: PlanNode = {
      id,
      parentId,
      depth,
      operation,
      relation,
      indexName: indexName ?? mergedBitmapIndexName,
      joinType: asString(node['Join Type']),
      predicates: predicates.length > 0 ? predicates : undefined,
      // Startup/Total Cost, Plan Rows and Plan Width are part of every
      // EXPLAIN (FORMAT JSON) node unconditionally, unlike actual/buffers/
      // temp below (which only appear under ANALYZE / BUFFERS).
      estimated: {
        startupCost: asNumber(node['Startup Cost']),
        totalCost: asNumber(node['Total Cost']),
        rows: asNumber(node['Plan Rows']),
        width: asNumber(node['Plan Width']),
      },
      actual: hasAnyKey(node, ['Actual Startup Time', 'Actual Total Time', 'Actual Rows', 'Actual Loops'])
        ? {
            startupMs: asNumber(node['Actual Startup Time']),
            totalMs: asNumber(node['Actual Total Time']),
            rows: asNumber(node['Actual Rows']),
            loops: asNumber(node['Actual Loops']),
          }
        : undefined,
      buffers: hasAnyKey(node, [
        'Shared Hit Blocks',
        'Shared Read Blocks',
        'Shared Dirtied Blocks',
        'Shared Written Blocks',
      ])
        ? {
            hit: asNumber(node['Shared Hit Blocks']),
            read: asNumber(node['Shared Read Blocks']),
            dirtied: asNumber(node['Shared Dirtied Blocks']),
            written: asNumber(node['Shared Written Blocks']),
          }
        : undefined,
      temp: hasAnyKey(node, ['Temp Read Blocks', 'Temp Written Blocks'])
        ? {
            read: asNumber(node['Temp Read Blocks']),
            written: asNumber(node['Temp Written Blocks']),
          }
        : undefined,
      children,
    };
    return planNode;
  };

  const planNode = visit(asRecord(explainRoot)?.['Plan'], undefined, 0);

  return {
    // A completely unparseable root still returns a valid (if empty)
    // PlanNode rather than undefined - normalizedPlan is typed as always
    // present once a plan was retrieved at all (§5.2), so "we got EXPLAIN
    // output back but couldn't make sense of its Plan key" is still an
    // (empty, warned-about) tree, not a hole in the context shape.
    planNode: planNode ?? { id: 'n0', depth: 0, operation: 'Unknown', children: [] },
    mappings,
    diagnostics: planNode ? diagnostics : [...diagnostics, planUnresolvedDiagnostic()],
  };
}

// Thin, behavior-preserving wrapper kept for existing callers/tests that
// only need the table mappings - parsePostgresPlan() is the single walk
// both this and the normalized PlanNode tree are built from.
export function resolvePlanTableMappings(explainRoot: unknown): PlanTableMapping[] {
  return parsePostgresPlan(explainRoot).mappings;
}
