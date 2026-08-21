import type {
  DominantCostPlanNodeRef,
  PlanTableMapping,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import { isSyntheticTableName } from './mysqlPlanParser';
import { computeExclusiveCost } from './planNodeMath';

// Resolves ExecutionPlanContext.dominantCostPlanNode (2026-08-21 follow-up,
// summary.md's Full Context improvement item 5) from MySQL's real EXPLAIN
// ANALYZE tree-text output (`actualPlanText`) - the only place MySQL's real
// per-node timing exists (mysqlPlanParser.ts's `normalizedPlan` only ever
// carries `estimated`, never `actual` - see that file's own doc comment).
//
// Deliberately does NOT try to positionally align actualPlanText's parsed
// lines against normalizedPlan's own pre-order node sequence - checked
// against a real sample (scripts/performance-lab/aiResults/2nd-0821-with-
// analyze/mysql/slow-01-missing-composite-index.dbn) and rejected: the
// JSON estimate-plan for that query has 5 nodes, but the real tree-text has
// 7 lines for the *same* query (it additionally materializes a "Table scan
// on <temporary>" step for the GROUP BY's temp table, and a separate
// "Filter:" step distinct from the index-lookup step) - a genuine
// structural mismatch that a positional zip would silently misattribute on
// any query with a temp table or an extra filter step, which is common.
//
// Semantic resolution avoids this entirely: MySQL's JSON `table_name` is
// already documented (mysqlPlanParser.ts's own header comment) to be the
// query's table *alias* when one is used - the exact same token that
// appears in tree-text lines like "Index lookup on o using
// idx_orders_status" - so a tree-text line can be resolved directly against
// PlanTableMapping.tableName/.indexName (both already populated, keyed by
// table identity, not tree position), with no need to reconcile the two
// trees' shapes at all.
//
// Same "defensive/best-effort, unstructured DB output, nothing throws"
// philosophy as mysqlPlanParser.ts: an unparseable line, an unrecognized
// operation phrase, or a line that can't be resolved against
// planTableMappings never throws - it just doesn't contribute a candidate.

export type MysqlActualPlanOperationKind =
  | 'tableAccess'
  | 'join'
  | 'filter'
  | 'sort'
  | 'aggregate'
  | 'materialize'
  | 'limit'
  | 'other';

export type MysqlActualPlanLine = {
  depth: number;
  text: string;
  kind: MysqlActualPlanOperationKind;
  alias?: string;
  indexName?: string;
  estCost?: number;
  estRows?: number;
  actualStartMs?: number;
  actualTotalMs?: number;
  actualRows?: number;
  actualLoops?: number;
};

type MysqlActualPlanNode = MysqlActualPlanLine & { children: MysqlActualPlanNode[] };

// One line looks like (4-space indent per depth level, confirmed against
// real MySQL 8.0 EXPLAIN ANALYZE output):
//   "            -> Nested loop inner join  (cost=7652 rows=3255) (actual time=7.55..99.5 rows=150 loops=1)"
// `text` is matched non-greedily so the two optional trailing annotation
// groups (both anchored to the end via `$`) claim as much of the line as
// they can - this is what lets `text` correctly exclude the annotations
// even though `text` itself may contain its own parens (e.g.
// "Filter: ((...))" or "Index lookup on o using idx_orders_status
// (status='PENDING')"). Plain numbered groups, not named ones - this
// package targets es6 (tsconfig.json), which predates JS named capture
// groups; group indices are given names via LINE_GROUP below instead.
const LINE_PATTERN =
  /^( *)-> (.+?)(?: +\(cost=([\d.]+) rows=(\d+)\))?(?: +\(actual time=([\d.]+)\.\.([\d.]+) rows=(\d+) loops=(\d+)\))? *$/;
const LINE_GROUP = {
  indent: 1,
  text: 2,
  cost: 3,
  estRows: 4,
  startMs: 5,
  totalMs: 6,
  actualRows: 7,
  loops: 8,
} as const;

// Table-access phrases - the only ones that matter for planNodeId
// resolution, each captures {alias, indexName?}. Order doesn't affect
// correctness (every prefix below is textually distinct from every other),
// listed roughly most- to least-specific for readability.
const TABLE_ACCESS_PATTERNS: Array<{ pattern: RegExp; hasIndex: boolean }> = [
  { pattern: /^Covering index lookup on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Single-row index lookup on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Index range scan on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Index scan on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Index lookup on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Table scan on (\S+)/i, hasIndex: false },
];

// Everything else MySQL's tree-text vocabulary commonly emits - classified
// only for readability/potential future use (a PLAN_OBSERVATION-equivalent
// diagnostic derived from tree-text, say). The cost/dominant-node math
// itself only needs `depth` + timing, not operation semantics, so an
// unrecognized line still safely falls back to 'other' and still
// participates correctly in the tree/cost walk.
const OTHER_OPERATION_PATTERNS: Array<{ pattern: RegExp; kind: MysqlActualPlanOperationKind }> = [
  { pattern: /^Filter:/i, kind: 'filter' },
  { pattern: /^Sort:/i, kind: 'sort' },
  { pattern: /^Group aggregate/i, kind: 'aggregate' },
  { pattern: /^Aggregate\b/i, kind: 'aggregate' },
  { pattern: /^Nested loop\b/i, kind: 'join' },
  { pattern: /^(Inner|Left|Right|Antijoin|Semijoin) hash join/i, kind: 'join' },
  { pattern: /^Materialize/i, kind: 'materialize' },
  { pattern: /^Limit:/i, kind: 'limit' },
  { pattern: /^Remove duplicates/i, kind: 'other' },
  { pattern: /^Stream results/i, kind: 'other' },
  { pattern: /^(Zero rows|Impossible WHERE|No matching rows)/i, kind: 'other' },
];

function classifyLine(text: string): Pick<MysqlActualPlanLine, 'kind' | 'alias' | 'indexName'> {
  for (const { pattern, hasIndex } of TABLE_ACCESS_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      const alias = match[1];
      if (alias && !isSyntheticTableName(alias)) {
        return { kind: 'tableAccess', alias, indexName: hasIndex ? match[2] : undefined };
      }
      // A synthetic placeholder (e.g. "Table scan on <temporary>") - not a
      // real table, never resolvable against planTableMappings, so this
      // falls through to 'other' rather than being reported as a
      // tableAccess candidate that can never match anything.
      return { kind: 'other' };
    }
  }
  for (const { pattern, kind } of OTHER_OPERATION_PATTERNS) {
    if (pattern.test(text)) {
      return { kind };
    }
  }
  return { kind: 'other' };
}

// Exported for direct unit testing of the line-parsing shape in isolation
// from the tree-reconstruction/resolution logic below.
export function parseMysqlActualPlanText(text: string): MysqlActualPlanLine[] {
  const lines: MysqlActualPlanLine[] = [];
  for (const rawLine of text.split('\n')) {
    if (!rawLine.trim()) {
      continue;
    }
    const match = LINE_PATTERN.exec(rawLine);
    if (!match) {
      // Doesn't look like a "-> ..." tree line at all (a stray blank line,
      // a trailing summary line some MySQL versions append, ...) - skipped
      // defensively, never throws, matching every other plan parser in
      // this codebase.
      continue;
    }
    const indent = match[LINE_GROUP.indent] ?? '';
    const text = (match[LINE_GROUP.text] ?? '').trim();
    const depth = Math.floor(indent.length / 4);
    const { kind, alias, indexName } = classifyLine(text);
    const num = (i: number): number | undefined => (match[i] !== undefined ? Number(match[i]) : undefined);
    lines.push({
      depth,
      text,
      kind,
      alias,
      indexName,
      estCost: num(LINE_GROUP.cost),
      estRows: num(LINE_GROUP.estRows),
      actualStartMs: num(LINE_GROUP.startMs),
      actualTotalMs: num(LINE_GROUP.totalMs),
      actualRows: num(LINE_GROUP.actualRows),
      actualLoops: num(LINE_GROUP.loops),
    });
  }
  return lines;
}

// Standard indentation-tree reconstruction from a flat, pre-order,
// depth-tagged line list: pop the stack while its top is at the same depth
// or deeper than the new line (i.e. not an ancestor of it), attach the new
// line as a child of whatever remains (or as a new root if the stack is
// empty), then push it. MySQL's tree-text normally has exactly one root
// line (depth 0), but this tolerates more than one defensively rather than
// assuming it.
function buildTree(lines: MysqlActualPlanLine[]): MysqlActualPlanNode[] {
  const roots: MysqlActualPlanNode[] = [];
  const stack: MysqlActualPlanNode[] = [];
  for (const line of lines) {
    const node: MysqlActualPlanNode = { ...line, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
    stack.push(node);
  }
  return roots;
}

const eqIgnoreCase = (a: string | undefined, b: string | undefined): boolean =>
  a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase();

// Resolves one tableAccess line's {alias, indexName} against
// planTableMappings the same way for every caller in this file - by table
// name (MySQL's JSON table_name IS the alias when one is used, per
// mysqlPlanParser.ts's own doc comment), tie-broken by indexName when more
// than one mapping shares that alias (rare - e.g. would need a self-join
// reusing the same alias, which SQL itself does not allow, but handled
// defensively rather than assumed impossible).
function resolveMapping(
  line: Pick<MysqlActualPlanLine, 'alias' | 'indexName'>,
  planTableMappings: PlanTableMapping[],
): PlanTableMapping | undefined {
  const aliasMatches = planTableMappings.filter((m) => eqIgnoreCase(m.tableName, line.alias));
  return aliasMatches.length <= 1
    ? aliasMatches[0]
    : (aliasMatches.find((m) => eqIgnoreCase(m.indexName, line.indexName)) ?? aliasMatches[0]);
}

export type MysqlActualPlanTableStats = {
  dominantCostPlanNode?: DominantCostPlanNodeRef;
  // planNodeId -> the real row count EXPLAIN ANALYZE measured for that
  // table access - every tableAccess line that resolves against
  // planTableMappings contributes an entry here, not just the dominant one
  // (2026-08-21 follow-up: this was the gap left by the first pass -
  // dominantCostPlanNode resolution alone never fed real actualRows back
  // into planTableMappings, so the "Actual rows"/"Est./actual ratio"
  // columns stayed blank for MySQL even with a successful, fully-parsed
  // EXPLAIN ANALYZE).
  actualRowsByPlanNodeId: Map<string, number>;
};

// Single walk of actualPlanText that both resolvers below are built on -
// parses once, builds the exclusive-cost tree once, resolves every
// tableAccess line against planTableMappings once. Exported (not just the
// two thin wrappers below) so a caller needing both figures - as
// MySQLPerformanceTuningProvider.collectExecutionPlan() does - doesn't
// parse/walk the same text twice.
export function resolveMysqlActualPlanTableStats(
  actualPlanText: string,
  planTableMappings: PlanTableMapping[],
): MysqlActualPlanTableStats {
  const roots = buildTree(parseMysqlActualPlanText(actualPlanText));

  const candidates: Array<{ line: MysqlActualPlanNode; exclusiveValue: number }> = [];
  const actualRowsByPlanNodeId = new Map<string, number>();
  const getInclusiveValue = (n: MysqlActualPlanNode): number | undefined =>
    // Same "actual time is a per-loop average" reasoning as
    // planNodeMath.ts's findDominantCostPlanNode() - multiply by loops to
    // get this node's real total-time contribution.
    n.actualTotalMs !== undefined ? n.actualTotalMs * (n.actualLoops ?? 1) : undefined;
  const getChildren = (n: MysqlActualPlanNode): MysqlActualPlanNode[] => n.children;

  for (const root of roots) {
    computeExclusiveCost(root, getInclusiveValue, getChildren, (node, exclusiveValue) => {
      if (node.kind !== 'tableAccess' || !node.alias) {
        return;
      }
      candidates.push({ line: node, exclusiveValue });
      if (node.actualRows === undefined) {
        return;
      }
      const match = resolveMapping(node, planTableMappings);
      if (match) {
        actualRowsByPlanNodeId.set(match.planNodeId, node.actualRows);
      }
    });
  }
  candidates.sort((a, b) => b.exclusiveValue - a.exclusiveValue);

  let dominantCostPlanNode: DominantCostPlanNodeRef | undefined;
  for (const candidate of candidates) {
    const match = resolveMapping(candidate.line, planTableMappings);
    if (match) {
      dominantCostPlanNode = { planNodeId: match.planNodeId, metric: 'actual', exclusiveValue: candidate.exclusiveValue };
      break;
    }
  }

  return { dominantCostPlanNode, actualRowsByPlanNodeId };
}

export function resolveDominantCostFromMysqlActualPlanText(
  actualPlanText: string,
  planTableMappings: PlanTableMapping[],
): DominantCostPlanNodeRef | undefined {
  return resolveMysqlActualPlanTableStats(actualPlanText, planTableMappings).dominantCostPlanNode;
}
