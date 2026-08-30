import { MetricTimeRange } from '../../../../types';

const RANGE_PERIOD_SECONDS: Record<MetricTimeRange, number> = {
  '15m': 60,
  '1h': 60,
  '3h': 60,
  '12h': 300,
  '3d': 900,
  '15d': 3600,
  '30d': 86_400,
};

export function resolveMetricPeriodSeconds(
  range: MetricTimeRange,
  nativePeriods: readonly number[],
): number {
  return Math.max(RANGE_PERIOD_SECONDS[range], ...nativePeriods, 1);
}
