import {
  DerivedSeriesSpec,
  MetricSeries,
  MetricSeriesStatus,
  ResolvedMetricPanel,
} from '../../../../types';
import { alignSeriesByTimestamp } from './alignSeriesByTimestamp';

function derivedValue(
  operation: DerivedSeriesSpec['operation'],
  values: readonly number[],
): number | null {
  if (values.length === 0) return null;
  switch (operation) {
    case 'sum':
      return values.reduce((sum, value) => sum + value, 0);
    case 'difference':
      return values
        .slice(1)
        .reduce((result, value) => result - value, values[0]);
    case 'ratio':
      return values.length === 2 && values[1] !== 0
        ? values[0] / values[1]
        : null;
    case 'percent':
      return values.length === 2 && values[1] !== 0
        ? (values[0] / values[1]) * 100
        : null;
  }
}

function derivedStatus(
  inputs: readonly MetricSeries[],
  hasNumericPoint: boolean,
): MetricSeriesStatus {
  if (inputs.length === 0) return 'unavailable';
  const statuses = inputs.map((input) => input.status);
  const severe = statuses.filter((status) =>
    ['failed', 'forbidden', 'unavailable'].includes(status),
  );
  if (severe.length === inputs.length) {
    if (severe.includes('failed')) return 'failed';
    if (severe.includes('forbidden')) return 'forbidden';
    return 'unavailable';
  }
  if (
    severe.length > 0 ||
    statuses.includes('partial') ||
    (statuses.includes('no-data') &&
      statuses.some((status) => status !== 'no-data'))
  ) {
    return 'partial';
  }
  return hasNumericPoint ? 'complete' : 'no-data';
}

function uniqueMessages(
  inputs: readonly MetricSeries[],
): Array<{ code?: string; value?: string }> {
  const seen = new Set<string>();
  const messages: Array<{ code?: string; value?: string }> = [];
  for (const input of inputs) {
    for (const message of input.messages) {
      const key = JSON.stringify([message.code ?? '', message.value ?? '']);
      if (seen.has(key)) continue;
      seen.add(key);
      messages.push(message);
    }
  }
  return messages;
}

/**
 * Aligns raw data before deriving values. Missing inputs remain null and are
 * never zero-filled. Input-only queries are removed after derivation.
 */
export function deriveMetricPanelSeries(
  rawSeries: readonly MetricSeries[],
  panel: ResolvedMetricPanel,
): MetricSeries[] {
  const aligned = alignSeriesByTimestamp(rawSeries);
  const byId = new Map(aligned.map((series) => [series.id, series]));
  const visibleQueryIds = new Set(
    panel.queries
      .filter((query) => query.visible !== false)
      .map((query) => query.id),
  );
  const visible = aligned.filter((series) => visibleQueryIds.has(series.id));
  const derived = (panel.derive ?? []).map((spec): MetricSeries => {
    const inputs = spec.inputSeriesIds.flatMap((id) => {
      const series = byId.get(id);
      return series ? [series] : [];
    });
    const timestamps = aligned[0]?.points.map((point) => point.timestamp) ?? [];
    const points = timestamps.map((timestamp, index) => {
      const values = inputs.map((input) => input.points[index]?.value);
      return {
        timestamp,
        value:
          inputs.length === spec.inputSeriesIds.length &&
          values.every((value): value is number => typeof value === 'number')
            ? derivedValue(spec.operation, values)
            : null,
      };
    });
    const hasNumericPoint = points.some(
      (point) => typeof point.value === 'number',
    );
    return {
      id: spec.id,
      metricName: `derived:${spec.operation}`,
      statistic: spec.operation,
      label: spec.label,
      unit: spec.unit,
      dimensions: [],
      points,
      status: derivedStatus(inputs, hasNumericPoint),
      messages: uniqueMessages(inputs),
    };
  });
  return [...visible, ...derived];
}
