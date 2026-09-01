// Pure, vendor-neutral plan-node math shared by every vendor's plan parser (postgresPlanParser.ts, mysqlPlanParser.ts, ...).

import type {
  DominantCostPlanNodeRef,
  MetricValue,
  PlanTableMapping,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import type { PlanNode } from '../../../types/drivers/performance/PlanNode';

// Only meaningful once both figures exist.
export function computeRowEstimateRatio(
  estimatedRows: number | undefined,
  actualRows: number | undefined,
): number | undefined {
  if (estimatedRows === undefined || actualRows === undefined || estimatedRows <= 0) {
    return undefined;
  }
  return actualRows / estimatedRows;
}

// Runtime artifacts are vendor-specific, but once a parser has conservatively matched one to a plan mapping, enriching that mapping follows the same provenance rules for every vendor.
export type ActualPlanTableStat = {
  actualRows?: number;
  tableAccessRows?: number;
  predicateFilterInputRows?: number;
  predicateFilterOutputRows?: number;
  indexName?: string;
};

export type ActualPlanMetricSources = {
  tableAccessRows: string;
  predicateFilterInputRows: string;
  predicateFilterOutputRows: string;
};

function actualMetric(value: number | undefined, source: string): MetricValue<number> | undefined {
  return value === undefined ? undefined : { value, estimated: false, source };
}

export function applyActualPlanTableStats(
  mappings: PlanTableMapping[],
  statsByPlanNodeId: ReadonlyMap<string, ActualPlanTableStat>,
  sources: ActualPlanMetricSources,
): PlanTableMapping[] {
  if (statsByPlanNodeId.size === 0) {
    return mappings;
  }
  return mappings.map((mapping) => {
    const stats = statsByPlanNodeId.get(mapping.planNodeId);
    if (!stats) {
      return mapping;
    }
    return {
      ...mapping,
      indexName: stats.indexName ?? mapping.indexName,
      actualRows: stats.actualRows,
      rowEstimateRatio: computeRowEstimateRatio(mapping.estimatedRows, stats.actualRows),
      tableAccessRows: actualMetric(stats.tableAccessRows, sources.tableAccessRows),
      predicateFilterInputRows: actualMetric(stats.predicateFilterInputRows, sources.predicateFilterInputRows),
      predicateFilterOutputRows: actualMetric(stats.predicateFilterOutputRows, sources.predicateFilterOutputRows),
    };
  });
}

// Generic "self cost" walk shared by findDominantCostPlanNode() and mysqlActualPlanTextParser.ts.
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

// See DominantCostPlanNodeRef (PerformanceTuningContext.ts) for the rationale.
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

// These two ratios must not be collapsed into a single vaguely named "selectivity".
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
