import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';

// Small, shared diagnostic-building helpers used by more than one vendor's
// plan parser/Provider - kept here rather than hand-copied at every call
// site, same rationale as this directory's existing planNodeMath.ts /
// vendorRowCoercion.ts (cross-vendor reuse once the exact same shape shows
// up in more than one vendor's file).

// The whole plan came back but no vendor plan parser could make sense of
// its root shape at all - used both by each parser's own last-resort branch
// (the root object doesn't look like a plan) and by each Provider's
// collectExecutionPlan() catch block (the parser itself threw, which none
// of the four parsers are expected to do - every access inside them is
// guarded - but this is a deliberate final backstop, not a gap in error
// handling). `scope: 'executionPlan'` and `affectsCompleteness: true`
// throughout: with no plan at all to work from, nothing plan-derived
// (table/index/predicate resolution) can be trusted as complete.
export function planUnresolvedDiagnostic(): PerformanceTuningDiagnostic {
  return {
    code: 'TABLE_MAPPING_FAILED',
    severity: 'warning',
    affectsCompleteness: true,
    scope: 'executionPlan',
    message: 'Failed to resolve tables from the execution plan.',
  };
}
