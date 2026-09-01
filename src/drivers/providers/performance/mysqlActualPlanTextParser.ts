import type {
  DominantCostPlanNodeRef,
  PlanTableMapping,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import { isSyntheticTableName } from './mysqlPlanParser';
import { computeExclusiveCost } from './planNodeMath';


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

// One line looks like (4-space indent per depth level, confirmed against real MySQL 8.0 EXPLAIN ANALYZE output):
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

// Table-access phrases - the only ones that matter for planNodeId resolution, each captures {alias, indexName?}.
const TABLE_ACCESS_PATTERNS: Array<{ pattern: RegExp; hasIndex: boolean }> = [
  { pattern: /^Covering index lookup on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Covering index scan on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Single-row index lookup on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Index range scan on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Index scan on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Index lookup on (\S+) using (\S+)/i, hasIndex: true },
  { pattern: /^Table scan on (\S+)/i, hasIndex: false },
];

// Everything else MySQL's tree-text vocabulary commonly emits - classified only for readability/potential future use (a PLAN_OBSERVATION-equivalent diagnostic derived from tree-text, say).
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
      // A synthetic placeholder (e.g. "Table scan on <temporary>") - not a real table, never resolvable against planTableMappings, so this falls through to 'other' rather than being reported as a tableAccess candidate that can never match anything.
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

// Exported for direct unit testing of the line-parsing shape in isolation from the tree-reconstruction/resolution logic below.
export function parseMysqlActualPlanText(text: string): MysqlActualPlanLine[] {
  const lines: MysqlActualPlanLine[] = [];
  for (const rawLine of text.split('\n')) {
    if (!rawLine.trim()) {
      continue;
    }
    const match = LINE_PATTERN.exec(rawLine);
    if (!match) {
      // Doesn't look like a "-> ..." tree line at all (a stray blank line, a trailing summary line some MySQL versions append, ...) - skipped defensively, never throws, matching every other plan parser in this codebase.
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
  actualRowsByPlanNodeId: Map<string, number>;
  predicateFilterRowsByPlanNodeId: Map<string, { inputRows: number; outputRows: number }>;
};

// Single walk of actualPlanText that both resolvers below are built on - parses once, builds the exclusive-cost tree once, resolves every tableAccess line against planTableMappings once.
export function resolveMysqlActualPlanTableStats(
  actualPlanText: string,
  planTableMappings: PlanTableMapping[],
): MysqlActualPlanTableStats {
  const roots = buildTree(parseMysqlActualPlanText(actualPlanText));

  const candidates: Array<{ line: MysqlActualPlanNode; exclusiveValue: number }> = [];
  const actualRowsByPlanNodeId = new Map<string, number>();
  const predicateFilterRowsByPlanNodeId = new Map<string, { inputRows: number; outputRows: number }>();
  const getInclusiveValue = (n: MysqlActualPlanNode): number | undefined =>
    // Same "actual time is a per-loop average" reasoning as planNodeMath.ts's findDominantCostPlanNode() - multiply by loops to get this node's real total-time contribution.
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

  // A MySQL Filter line is safely attributable only when its subtree has one resolvable physical table access.
  const tableAccessesBelow = (node: MysqlActualPlanNode): MysqlActualPlanNode[] => {
    const own = node.kind === 'tableAccess' && node.alias ? [node] : [];
    const descendants: MysqlActualPlanNode[] = [];
    node.children.forEach((child) => descendants.push(...tableAccessesBelow(child)));
    return own.concat(descendants);
  };
  const visitFilters = (node: MysqlActualPlanNode): void => {
    if (node.kind === 'filter' && node.actualRows !== undefined) {
      const accesses = tableAccessesBelow(node);
      const resolved = accesses
        .filter((access) => access.actualRows !== undefined)
        .map((access) => ({ access, mapping: resolveMapping(access, planTableMappings) }))
        .filter((item): item is { access: MysqlActualPlanNode; mapping: PlanTableMapping } => item.mapping !== undefined);
      if (resolved.length === 1) {
        predicateFilterRowsByPlanNodeId.set(resolved[0].mapping.planNodeId, {
          inputRows: resolved[0].access.actualRows!,
          outputRows: node.actualRows,
        });
      }
    }
    node.children.forEach(visitFilters);
  };
  roots.forEach(visitFilters);
  candidates.sort((a, b) => b.exclusiveValue - a.exclusiveValue);

  let dominantCostPlanNode: DominantCostPlanNodeRef | undefined;
  for (const candidate of candidates) {
    const match = resolveMapping(candidate.line, planTableMappings);
    if (match) {
      dominantCostPlanNode = { planNodeId: match.planNodeId, metric: 'actual', exclusiveValue: candidate.exclusiveValue };
      break;
    }
  }

  return {
    dominantCostPlanNode,
    actualRowsByPlanNodeId,
    predicateFilterRowsByPlanNodeId,
  };
}

export function resolveDominantCostFromMysqlActualPlanText(
  actualPlanText: string,
  planTableMappings: PlanTableMapping[],
): DominantCostPlanNodeRef | undefined {
  return resolveMysqlActualPlanTableStats(actualPlanText, planTableMappings).dominantCostPlanNode;
}
