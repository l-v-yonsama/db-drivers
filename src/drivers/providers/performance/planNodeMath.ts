// Pure, vendor-neutral plan-node math shared by every vendor's plan parser
// (postgresPlanParser.ts, mysqlPlanParser.ts, ...). Lives in its own file
// rather than one vendor's parser module so a Provider for a different
// vendor doesn't have to import from a file named after another vendor.

import type {
  DominantCostPlanNodeRef,
  MetricValue,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import type { PlanNode } from '../../../types/drivers/performance/PlanNode';

// Only meaningful once both figures exist. PostgreSQL supplies both from its
// normalized ANALYZE JSON; MySQL and Oracle resolve compatible runtime rows
// from their separate actual-plan artifacts. The computation itself remains
// vendor- and mode-independent. `estimatedRows <= 0` is excluded too - a zero-row estimate
// makes the ratio either undefined (0/0) or meaningless (n/0 -> Infinity),
// neither of which is a fact worth handing to an AI.
export function computeRowEstimateRatio(
  estimatedRows: number | undefined,
  actualRows: number | undefined,
): number | undefined {
  if (estimatedRows === undefined || actualRows === undefined || estimatedRows <= 0) {
    return undefined;
  }
  return actualRows / estimatedRows;
}

// Generic "self cost" walk shared by findDominantCostPlanNode() below and
// mysqlActualPlanTextParser.ts's resolveDominantCostFromMysqlActualPlanText()
// (2026-08-21 follow-up, summary.md's Full Context improvement item 5) - one
// recursive algorithm, reused over two different node shapes (PlanNode's
// `children: PlanNode[]` tree, and the MySQL actual-text parser's own small
// depth-reconstructed tree) via the accessor callbacks, rather than writing
// the same recursion twice.
//
// Every vendor's plan cost/time figure is *inclusive* (cumulative over the
// whole subtree) by construction - Postgres's "Total Cost", MySQL's
// `cost_info.prefix_cost`, Oracle's PLAN_TABLE.COST, SQL Server's
// TotalSubtreeCost are all documented as subtree-inclusive - so picking the
// node with the max *inclusive* value would trivially always return the
// plan root. "Exclusive" (self) cost - inclusive value minus the sum of
// this node's children's own inclusive values - is what actually identifies
// *where* cost concentrates, which is what summary.md's MySQL slow-01
// regression finding calls for (the AI needs the single most expensive
// step, not merely "the deepest number").
//
// A node with no usable inclusiveValue of its own falls back to the sum of
// its children's values (degrades gracefully rather than breaking the
// walk); exclusive cost is clamped to >= 0 defensively (vendor rounding can
// make children sum to slightly more than the parent's own reported
// value) - this makes an unexpected input fail safe (silently picks a
// less-ideal node) rather than fail loud, acceptable since this is advisory
// data for an AI prompt, never used for an automated decision.
export function computeExclusiveCost<T>(
  node: T,
  getInclusiveValue: (n: T) => number | undefined,
  getChildren: (n: T) => T[],
  onExclusive: (n: T, exclusive: number) => void,
): number {
  const children = getChildren(node);
  const childInclusiveTotal = children.reduce(
    (sum, child) => sum + computeExclusiveCost(child, getInclusiveValue, getChildren, onExclusive),
    0,
  );
  const inclusive = getInclusiveValue(node) ?? childInclusiveTotal;
  const exclusive = Math.max(0, inclusive - childInclusiveTotal);
  onExclusive(node, exclusive);
  return inclusive;
}

// See DominantCostPlanNodeRef (PerformanceTuningContext.ts) for the
// rationale. Metric selection: prefer `actual.totalMs` (multiplied by
// `actual.loops ?? 1` - Postgres's "Actual Total Time" is a *per-loop
// average*, not a total; multiplying by loops is required to get a node's
// real total-time contribution when it sits on the inner side of a nested
// loop) when *any* node in the tree has it, else fall back to
// `estimated.totalCost` for every node. Today only Postgres ever populates
// PlanNode.actual directly. MySQL resolves its separate actualPlanText into
// a vendor-specific dominant node; Oracle and SQL Server now capture actual
// plan artifacts too, but those text/XML artifacts are not yet normalized
// and matched to their estimated-plan nodes. Therefore this generic walk
// still uses estimated.totalCost for Oracle/SQL Server, with no
// vendor-specific code inside it.
export function findDominantCostPlanNode(root: PlanNode | undefined): DominantCostPlanNodeRef | undefined {
  if (!root) {
    return undefined;
  }

  const anyActualTotalMs = (node: PlanNode): boolean =>
    node.actual?.totalMs !== undefined || node.children.some(anyActualTotalMs);
  const metric: 'actual' | 'estimated' = anyActualTotalMs(root) ? 'actual' : 'estimated';

  const getInclusiveValue = (node: PlanNode): number | undefined =>
    metric === 'actual'
      ? node.actual?.totalMs !== undefined
        ? node.actual.totalMs * (node.actual.loops ?? 1)
        : undefined
      : node.estimated?.totalCost;

  let best: { planNodeId: string; exclusiveValue: number } | undefined;
  computeExclusiveCost(
    root,
    getInclusiveValue,
    (node) => node.children,
    (node, exclusive) => {
      if (exclusive > 0 && (!best || exclusive > best.exclusiveValue)) {
        best = { planNodeId: node.id, exclusiveValue: exclusive };
      }
    },
  );

  return best ? { planNodeId: best.planNodeId, metric, exclusiveValue: best.exclusiveValue } : undefined;
}

// These two ratios must not be collapsed into a single vaguely named
// "selectivity". A table-access candidate set and the pass rate of a local
// Filter answer different questions and require different evidence.
export function computeTableAccessFraction(
  tableAccessRows: MetricValue<number> | undefined,
  tableEstimatedRowCount: MetricValue<number> | undefined,
): MetricValue<number> | undefined {
  if (!tableAccessRows || !tableEstimatedRowCount || tableEstimatedRowCount.value <= 0) {
    return undefined;
  }
  return {
    value: Math.min(1, tableAccessRows.value / tableEstimatedRowCount.value),
    estimated: tableAccessRows.estimated || tableEstimatedRowCount.estimated,
    source: `${tableAccessRows.source} / ${tableEstimatedRowCount.source}`,
  };
}

export function computePredicateFilterSelectivity(
  inputRows: MetricValue<number> | undefined,
  outputRows: MetricValue<number> | undefined,
): MetricValue<number> | undefined {
  if (!inputRows || !outputRows || inputRows.value <= 0) {
    return undefined;
  }
  return {
    value: Math.min(1, outputRows.value / inputRows.value),
    estimated: inputRows.estimated || outputRows.estimated,
    source: `${outputRows.source} / ${inputRows.source}`,
  };
}
