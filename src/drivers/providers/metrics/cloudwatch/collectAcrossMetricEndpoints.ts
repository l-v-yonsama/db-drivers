import {
  MetricEndpoint,
  MetricSeries,
  ResolvedMetricPanel,
} from '../../../../types';
import { deriveMetricPanelSeries } from './deriveMetricSeries';
import {
  CloudWatchMetricPanelsResult,
  CloudWatchMetricsCollector,
  CollectCloudWatchMetricPanelsInput,
  CollectedCloudWatchMetricPanel,
} from './CloudWatchMetricsCollector';

type CollectorResolver = (
  endpoint: MetricEndpoint,
) => CloudWatchMetricsCollector;

function endpointKey(endpoint: MetricEndpoint): string {
  return JSON.stringify([
    endpoint.scope,
    endpoint.region,
    endpoint.endpoint ?? '',
  ]);
}

function seriesScore(
  series: MetricSeries,
  orderBy: NonNullable<ResolvedMetricPanel['seriesDisplay']>['orderBy'],
): number {
  const values = series.points
    .map((point) => point.value)
    .filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return Number.NEGATIVE_INFINITY;
  switch (orderBy) {
    case 'latest-desc':
      return values[values.length - 1];
    case 'maximum-desc':
      return Math.max(...values);
    case 'sum-desc':
      return values.reduce((sum, value) => sum + value, 0);
  }
}

export function limitMetricSeriesForDisplay(
  series: readonly MetricSeries[],
  display: ResolvedMetricPanel['seriesDisplay'],
): MetricSeries[] {
  if (!display || display.limit >= series.length) return [...series];
  return [...series]
    .sort((left, right) => {
      const score =
        seriesScore(right, display.orderBy) -
        seriesScore(left, display.orderBy);
      return score || left.label.localeCompare(right.label);
    })
    .slice(0, Math.max(0, display.limit));
}

/**
 * Collects a resolved dashboard even when individual queries use different
 * regional CloudWatch endpoints. Results with the same panel id are merged
 * before the declarative display limit is applied.
 */
export async function collectAcrossMetricEndpoints(
  resolveCollector: CollectorResolver,
  defaultEndpoint: MetricEndpoint,
  input: CollectCloudWatchMetricPanelsInput,
): Promise<CloudWatchMetricPanelsResult> {
  const endTime = input.endTime ?? new Date();
  const groups = new Map<
    string,
    { endpoint: MetricEndpoint; panels: Map<string, ResolvedMetricPanel> }
  >();

  for (const panel of input.panels) {
    for (const query of panel.queries) {
      const endpoint = query.endpoint ?? defaultEndpoint;
      const key = endpointKey(endpoint);
      let group = groups.get(key);
      if (!group) {
        group = { endpoint, panels: new Map() };
        groups.set(key, group);
      }
      const groupedPanel = group.panels.get(panel.id);
      if (groupedPanel) {
        groupedPanel.queries.push(query);
      } else {
        group.panels.set(panel.id, { ...panel, queries: [query] });
      }
    }
  }

  if (groups.size === 0) {
    const result = await resolveCollector(defaultEndpoint).collectPanels({
      ...input,
      endTime,
    });
    return {
      ...result,
      panels: result.panels.map((panel, index) => {
        const definition = input.panels[index];
        return {
          ...panel,
          series: definition
            ? limitMetricSeriesForDisplay(
                deriveMetricPanelSeries(panel.series, definition),
                definition.seriesDisplay,
              )
            : panel.series,
        };
      }),
    };
  }

  const results = await Promise.all(
    [...groups.values()].map(({ endpoint, panels }) =>
      resolveCollector(endpoint).collectPanels({
        ...input,
        panels: [...panels.values()],
        endTime,
      }),
    ),
  );
  const merged = new Map<string, CollectedCloudWatchMetricPanel>(
    input.panels.map((panel) => [
      panel.id,
      { panelId: panel.id, periodSeconds: 1, series: [] },
    ]),
  );
  for (const result of results) {
    for (const panel of result.panels) {
      const target = merged.get(panel.panelId);
      if (!target) continue;
      target.periodSeconds = Math.max(
        target.periodSeconds,
        panel.periodSeconds,
      );
      target.series.push(...panel.series);
    }
  }

  const panels = input.panels.map((definition) => {
    const panel = merged.get(definition.id)!;
    return {
      ...panel,
      series: limitMetricSeriesForDisplay(
        deriveMetricPanelSeries(panel.series, definition),
        definition.seriesDisplay,
      ),
    };
  });
  return {
    startTime: results[0].startTime,
    endTime: results[0].endTime,
    periodSeconds: Math.max(1, ...panels.map((panel) => panel.periodSeconds)),
    panels,
  };
}
