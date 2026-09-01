import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';


export function planUnresolvedDiagnostic(): PerformanceTuningDiagnostic {
  return {
    code: 'TABLE_MAPPING_FAILED',
    severity: 'warning',
    affectsCompleteness: true,
    scope: 'executionPlan',
    message: 'Failed to resolve tables from the execution plan.',
  };
}
