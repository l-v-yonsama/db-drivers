import { PlanTableMapping } from '../../../types/drivers/performance/PerformanceTuningContext';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
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

// Only meaningful once both figures exist - `actualRows` currently never
// does (it only comes from `EXPLAIN ANALYZE`, and `mode: 'analyze'` isn't
// implemented for any vendor yet), but the computation itself is vendor-
// and mode-independent, so it's written and tested now rather than left as
// a TODO for whichever step adds Analyze (§10 Phase 2: "estimated / actual
// rows が両方ある場合だけ row estimate ratio を計算する"). `estimatedRows <= 0`
// is excluded too - a zero-row estimate makes the ratio either undefined
// (0/0) or meaningless (n/0 -> Infinity), neither of which is a fact worth
// handing to an AI.
export function computeRowEstimateRatio(
  estimatedRows: number | undefined,
  actualRows: number | undefined,
): number | undefined {
  if (estimatedRows === undefined || actualRows === undefined || estimatedRows <= 0) {
    return undefined;
  }
  return actualRows / estimatedRows;
}

const hasAnyKey = (node: Record<string, unknown>, keys: readonly string[]): boolean =>
  keys.some((key) => node[key] !== undefined);

export type ParsedPostgresPlan = {
  planNode: PlanNode;
  mappings: PlanTableMapping[];
  // "mapping 不能" cases (§10 Phase 2) - currently just scan-family nodes
  // with no relation to point at (Function/Values/CTE/WorkTable/Subquery
  // Scan, ...). Surfaced explicitly instead of the node silently vanishing
  // from planTableMappings with no trace.
  warnings: string[];
};

// `explainRoot` is expected to be the single element of the array
// `EXPLAIN (FORMAT JSON) ...` returns (i.e. `{ Plan: {...}, "Planning
// Time": ... }`), not the array itself. Walks the plan tree once, building
// the common PlanNode tree and PlanTableMapping[] together so both use the
// exact same depth-first "n0, n1, ..." node IDs.
export function parsePostgresPlan(explainRoot: unknown): ParsedPostgresPlan {
  const mappings: PlanTableMapping[] = [];
  const warnings: string[] = [];
  let counter = 0;

  const visit = (nodeValue: unknown, parentId: string | undefined, depth: number): PlanNode | undefined => {
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

    if (tableName) {
      const alias = aliasValue && aliasValue !== tableName ? aliasValue : undefined;
      const estimatedRows = asNumber(node['Plan Rows']);
      const actualRows = asNumber(node['Actual Rows']);
      mappings.push({
        planNodeId: id,
        schemaName,
        tableName,
        alias,
        indexName,
        estimatedRows,
        actualRows,
        rowEstimateRatio: computeRowEstimateRatio(estimatedRows, actualRows),
        filterColumns: filterColumns.size > 0 ? [...filterColumns] : undefined,
      });
    } else if (operation.endsWith('Scan')) {
      // A scan-family node with no relation (Function/Values/CTE/WorkTable/
      // Subquery Scan, ...) reads from something other than a physical
      // table, so there is no table/index/statistics context to attach to
      // it - called out explicitly rather than the node just disappearing.
      warnings.push(`Could not resolve a table for plan node ${id} (${operation}).`);
    }

    const children: PlanNode[] = [];
    const rawChildren = node['Plans'];
    if (Array.isArray(rawChildren)) {
      for (const child of rawChildren) {
        const childNode = visit(child, id, depth + 1);
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
      relation: tableName ? { schemaName, tableName, alias: aliasValue } : undefined,
      indexName,
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
    warnings: planNode ? warnings : [...warnings, 'Failed to resolve tables from the execution plan.'],
  };
}

// Thin, behavior-preserving wrapper kept for existing callers/tests that
// only need the table mappings - parsePostgresPlan() is the single walk
// both this and the normalized PlanNode tree are built from.
export function resolvePlanTableMappings(explainRoot: unknown): PlanTableMapping[] {
  return parsePostgresPlan(explainRoot).mappings;
}
