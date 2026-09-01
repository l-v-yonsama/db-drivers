import { MetricSeries } from '../../../../types';

export function alignSeriesByTimestamp(
  series: readonly MetricSeries[],
): MetricSeries[] {
  const timestamps = [
    ...new Set(
      series.flatMap((item) => item.points.map((point) => point.timestamp)),
    ),
  ].sort((left, right) => left.localeCompare(right));

  return series.map((item) => {
    const points = new Map(
      item.points.map((point) => [point.timestamp, point.value] as const),
    );
    return {
      ...item,
      points: timestamps.map((timestamp) => ({
        timestamp,
        value: points.has(timestamp) ? points.get(timestamp)! : null,
      })),
    };
  });
}
