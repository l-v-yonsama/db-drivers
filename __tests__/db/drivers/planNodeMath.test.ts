import type { PlanNode } from '../../../src';
import {
  computeExclusiveCost,
  computePredicateFilterSelectivity,
  computeRowEstimateRatio,
  computeTableAccessFraction,
  findDominantCostPlanNode,
} from '../../../src';

// Minimal PlanNode fixture builder - only the fields each test actually
// needs are set, `children` always required (matches the real type).
function node(overrides: Partial<PlanNode> & { id: string }): PlanNode {
  return {
    depth: 0,
    operation: 'test',
    children: [],
    ...overrides,
  };
}

describe('computeRowEstimateRatio', () => {
  it('divides actual by estimated when both are present', () => {
    expect(computeRowEstimateRatio(100, 250)).toBe(2.5);
  });

  it('returns undefined when either side is missing', () => {
    expect(computeRowEstimateRatio(undefined, 250)).toBeUndefined();
    expect(computeRowEstimateRatio(100, undefined)).toBeUndefined();
  });

  it('returns undefined for a zero/negative estimate (would be 0/0 or a meaningless ratio)', () => {
    expect(computeRowEstimateRatio(0, 100)).toBeUndefined();
    expect(computeRowEstimateRatio(-5, 100)).toBeUndefined();
  });
});

describe('findDominantCostPlanNode', () => {
  it('returns undefined for an undefined root', () => {
    expect(findDominantCostPlanNode(undefined)).toBeUndefined();
  });

  it('returns undefined when no node in the tree has any cost/time data', () => {
    const root = node({ id: 'n0', children: [node({ id: 'n1' })] });
    expect(findDominantCostPlanNode(root)).toBeUndefined();
  });

  it('picks the deep leaf with the highest EXCLUSIVE estimated cost, not the root (which always has the highest inclusive cost)', () => {
    // n0 (totalCost=100) -> n1 (totalCost=90) -> n2 (totalCost=85, leaf)
    // n0's own exclusive cost is only 100-90=10; n1's is 90-85=5; n2's
    // (leaf, no children) is its full inclusive value, 85 - the true
    // bottleneck, even though n0's cost is nominally "the highest number in
    // the plan" as an inclusive/cumulative figure.
    const leaf = node({ id: 'n2', depth: 2, estimated: { totalCost: 85 } });
    const mid = node({ id: 'n1', depth: 1, estimated: { totalCost: 90 }, children: [leaf] });
    const root = node({ id: 'n0', depth: 0, estimated: { totalCost: 100 }, children: [mid] });

    expect(findDominantCostPlanNode(root)).toEqual({ planNodeId: 'n2', metric: 'estimated', exclusiveValue: 85 });
  });

  it('prefers actual.totalMs over estimated.totalCost when any node in the tree has actual data', () => {
    const leaf = node({ id: 'n1', depth: 1, estimated: { totalCost: 999 }, actual: { totalMs: 5 } });
    const root = node({
      id: 'n0',
      depth: 0,
      estimated: { totalCost: 1000 },
      actual: { totalMs: 50 },
      children: [leaf],
    });

    const result = findDominantCostPlanNode(root);
    expect(result?.metric).toBe('actual');
    // root exclusive = 50 - 5 = 45 (dominant); leaf exclusive = 5.
    expect(result).toEqual({ planNodeId: 'n0', metric: 'actual', exclusiveValue: 45 });
  });

  it('multiplies actual.totalMs by actual.loops (Postgres reports a per-loop average, not a total)', () => {
    // A leaf executed 150 times at ~0.01ms/loop (typical inner-side-of-a-
    // nested-loop index lookup) ends up with more real total-time
    // contribution than a once-executed 1ms sibling once loops are
    // accounted for.
    const cheapButLooped = node({ id: 'n1', depth: 1, actual: { totalMs: 0.01, loops: 150 } });
    const expensiveOnce = node({ id: 'n2', depth: 1, actual: { totalMs: 1, loops: 1 } });
    const root = node({ id: 'n0', depth: 0, actual: { totalMs: 2.5, loops: 1 }, children: [cheapButLooped, expensiveOnce] });

    const result = findDominantCostPlanNode(root);
    // cheapButLooped inclusive = 0.01*150 = 1.5; expensiveOnce inclusive = 1.
    expect(result?.planNodeId).toBe('n1');
    expect(result?.exclusiveValue).toBeCloseTo(1.5);
  });

  it('clamps a negative exclusive cost to 0 rather than crashing or picking a nonsensical winner (children summing to more than the parent reports - real-world vendor rounding)', () => {
    const child1 = node({ id: 'n1', depth: 1, estimated: { totalCost: 60 } });
    const child2 = node({ id: 'n2', depth: 1, estimated: { totalCost: 60 } });
    // Root's own reported cost (100) is less than its children's sum (120) -
    // a rounding artifact that should never happen in theory but is not
    // something this function should trust blindly.
    const root = node({ id: 'n0', depth: 0, estimated: { totalCost: 100 }, children: [child1, child2] });

    const result = findDominantCostPlanNode(root);
    // Both children have exclusive cost 60 (leaves); root's own exclusive
    // is clamped to 0, not a negative number - so a child wins, and nothing
    // throws.
    expect(result?.exclusiveValue).toBe(60);
    expect(['n1', 'n2']).toContain(result?.planNodeId);
  });
});

describe('computeExclusiveCost', () => {
  it('falls back to the sum of children when a node has no inclusive value of its own', () => {
    const leaf = node({ id: 'n1', estimated: { totalCost: 42 } });
    const root = node({ id: 'n0', children: [leaf] });
    const exclusives: Record<string, number> = {};
    const inclusive = computeExclusiveCost(
      root,
      (n) => n.estimated?.totalCost,
      (n) => n.children,
      (n, exclusive) => {
        exclusives[n.id] = exclusive;
      },
    );
    expect(inclusive).toBe(42);
    expect(exclusives).toEqual({ n1: 42, n0: 0 });
  });
});

describe('separated selectivity metrics', () => {
  it('computes table-access fraction only from an explicit access-row basis', () => {
    const result = computeTableAccessFraction(
      { value: 600, estimated: false, source: 'actual access rows' },
      { value: 300000, estimated: false, source: 'pg_class.reltuples' },
    );
    expect(result).toEqual({
      value: 0.002,
      estimated: false,
      source: 'actual access rows / pg_class.reltuples',
    });
  });

  it('computes predicate pass rate only from explicit Filter input/output', () => {
    expect(
      computePredicateFilterSelectivity(
        { value: 600, estimated: false, source: 'filter input' },
        { value: 150, estimated: false, source: 'filter output' },
      ),
    ).toEqual({ value: 0.25, estimated: false, source: 'filter output / filter input' });
  });

  it('leaves a metric absent when its required evidence is missing or invalid', () => {
    expect(computeTableAccessFraction(undefined, undefined)).toBeUndefined();
    expect(
      computeTableAccessFraction(
        { value: 10, estimated: false, source: 'x' },
        { value: 0, estimated: false, source: 'x' },
      ),
    ).toBeUndefined();
    expect(computePredicateFilterSelectivity(undefined, { value: 1, estimated: false, source: 'x' })).toBeUndefined();
    expect(
      computePredicateFilterSelectivity(
        { value: 0, estimated: false, source: 'x' },
        { value: 1, estimated: false, source: 'x' },
      ),
    ).toBeUndefined();
  });

  it('propagates estimated provenance and clamps impossible ratios', () => {
    const result = computeTableAccessFraction(
      { value: 500000, estimated: false, source: 'actual access' },
      { value: 300000, estimated: true, source: 'information_schema.TABLES.TABLE_ROWS' },
    );
    expect(result?.value).toBe(1);
    expect(result?.estimated).toBe(true);
  });
});
