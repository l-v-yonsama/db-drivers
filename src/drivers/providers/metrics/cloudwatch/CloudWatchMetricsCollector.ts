import {
  MetricSeries,
  MetricTimeRange,
  ResolvedMetricPanel,
} from '../../../../types';
import { alignSeriesByTimestamp } from './alignSeriesByTimestamp';
import {
  CloudWatchMetricsTransport,
  CloudWatchMetricsTransportInput,
} from './cloudWatchMetricsTransport';
import { resolveMetricPeriodSeconds } from './metricPeriod';

const RANGE_MILLISECONDS: Record<MetricTimeRange, number> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '3h': 3 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '15d': 15 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export type CollectCloudWatchMetricPanelsInput = {
  panels: readonly ResolvedMetricPanel[];
  range: MetricTimeRange;
  endTime?: Date;
  signal?: AbortSignal;
};

export type CollectedCloudWatchMetricPanel = {
  panelId: string;
  periodSeconds: number;
  series: MetricSeries[];
};

export type CloudWatchMetricPanelsResult = {
  startTime: string;
  endTime: string;
  periodSeconds: number;
  panels: CollectedCloudWatchMetricPanel[];
};

/**
 * Collects already-resolved metric panels. Service-specific metric names,
 * dimensions, prerequisites, and selectors remain adapter responsibilities.
 */
export class CloudWatchMetricsCollector {
  constructor(private readonly transport: CloudWatchMetricsTransport) {}

  async collectPanels(
    input: CollectCloudWatchMetricPanelsInput,
  ): Promise<CloudWatchMetricPanelsResult> {
    const endTime = input.endTime ?? new Date();
    const startTime = new Date(
      endTime.getTime() - RANGE_MILLISECONDS[input.range],
    );

    const panels = await Promise.all(
      input.panels.map(
        async (panel): Promise<CollectedCloudWatchMetricPanel> => {
          const periodSeconds = resolveMetricPeriodSeconds(
            input.range,
            panel.queries.map((query) => query.nativePeriodSeconds),
          );
          const transportInput: CloudWatchMetricsTransportInput = {
            queries: panel.queries,
            startTime,
            endTime,
            periodSeconds,
            signal: input.signal,
          };
          const series =
            panel.queries.length === 0
              ? []
              : alignSeriesByTimestamp(
                  await this.transport.collect(transportInput),
                );
          return { panelId: panel.id, periodSeconds, series };
        },
      ),
    );

    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      periodSeconds: Math.max(1, ...panels.map((panel) => panel.periodSeconds)),
      panels,
    };
  }
}
