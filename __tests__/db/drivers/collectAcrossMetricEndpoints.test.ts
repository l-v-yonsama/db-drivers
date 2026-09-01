import {
  CloudWatchMetricsCollector,
  MetricEndpoint,
  MetricSeries,
  ResolvedMetricPanel,
  collectAcrossMetricEndpoints,
} from '../../../src';

function series(id: string, label: string, value: number): MetricSeries {
  return {
    id,
    metricName: 'Metric',
    statistic: 'Maximum',
    label,
    unit: 'count',
    dimensions: [],
    points: [{ timestamp: '2026-08-29T00:00:00.000Z', value }],
    status: 'complete',
    messages: [],
  };
}

describe('collectAcrossMetricEndpoints', () => {
  it('groups query endpoints, merges one panel, and keeps only the ranked display series', async () => {
    const east: MetricEndpoint = { region: 'us-east-1', scope: 'regional' };
    const west: MetricEndpoint = { region: 'us-west-2', scope: 'regional' };
    const calls: string[] = [];
    const resolveCollector = (
      endpoint: MetricEndpoint,
    ): CloudWatchMetricsCollector =>
      ({
        collectPanels: jest.fn(async (input) => {
          calls.push(endpoint.region);
          return {
            startTime: '2026-08-28T23:00:00.000Z',
            endTime: '2026-08-29T00:00:00.000Z',
            periodSeconds: 60,
            panels: input.panels.map((panel) => ({
              panelId: panel.id,
              periodSeconds: 60,
              series: panel.queries.map((query) =>
                series(
                  query.id,
                  query.label,
                  query.endpoint?.region === 'us-west-2' ? 9 : 1,
                ),
              ),
            })),
          };
        }),
      } as unknown as CloudWatchMetricsCollector);
    const panel: ResolvedMetricPanel = {
      id: 'comparison',
      title: 'Comparison',
      purpose: 'health',
      visualization: 'bar',
      emission: 'default',
      scope: { kind: 'dimension-group', label: 'Resources' },
      cost: { publication: 'included', read: 'get-metric-data' },
      queries: [
        {
          id: 'east',
          namespace: 'AWS/Test',
          metricName: 'Metric',
          statistic: 'Maximum',
          label: 'East',
          unit: 'count',
          nativePeriodSeconds: 60,
          dimensions: [],
          endpoint: east,
        },
        {
          id: 'west',
          namespace: 'AWS/Test',
          metricName: 'Metric',
          statistic: 'Maximum',
          label: 'West',
          unit: 'count',
          nativePeriodSeconds: 60,
          dimensions: [],
          endpoint: west,
        },
      ],
      seriesDisplay: { limit: 1, orderBy: 'maximum-desc' },
    };

    const result = await collectAcrossMetricEndpoints(resolveCollector, east, {
      panels: [panel],
      range: '1h',
    });

    expect(calls.sort()).toEqual(['us-east-1', 'us-west-2']);
    expect(result.panels[0].series.map((item) => item.label)).toEqual(['West']);
  });

  it('derives a cross-endpoint sum only after inputs are merged', async () => {
    const east: MetricEndpoint = { region: 'us-east-1', scope: 'regional' };
    const west: MetricEndpoint = { region: 'us-west-2', scope: 'regional' };
    const resolveCollector = (
      endpoint: MetricEndpoint,
    ): CloudWatchMetricsCollector =>
      ({
        collectPanels: jest.fn(async (input) => ({
          startTime: '2026-08-28T00:00:00.000Z',
          endTime: '2026-08-29T00:00:00.000Z',
          periodSeconds: 86_400,
          panels: input.panels.map((panel) => ({
            panelId: panel.id,
            periodSeconds: 86_400,
            series: panel.queries.map((query) =>
              series(
                query.id,
                query.label,
                endpoint.region === 'us-east-1' ? 2 : 3,
              ),
            ),
          })),
        })),
      } as unknown as CloudWatchMetricsCollector);
    const panel: ResolvedMetricPanel = {
      id: 'derived',
      title: 'Derived',
      purpose: 'capacity',
      visualization: 'bar',
      emission: 'default',
      scope: { kind: 'dimension-group', label: 'Resources' },
      cost: { publication: 'included', read: 'get-metric-data' },
      queries: [
        {
          id: 'east_input',
          namespace: 'AWS/Test',
          metricName: 'Metric',
          statistic: 'Average',
          label: 'East input',
          unit: 'bytes',
          nativePeriodSeconds: 86_400,
          dimensions: [],
          endpoint: east,
          visible: false,
        },
        {
          id: 'west_input',
          namespace: 'AWS/Test',
          metricName: 'Metric',
          statistic: 'Average',
          label: 'West input',
          unit: 'bytes',
          nativePeriodSeconds: 86_400,
          dimensions: [],
          endpoint: west,
          visible: false,
        },
      ],
      derive: [
        {
          id: 'total',
          label: 'Total',
          unit: 'bytes',
          operation: 'sum',
          inputSeriesIds: ['east_input', 'west_input'],
        },
      ],
    };

    const result = await collectAcrossMetricEndpoints(resolveCollector, east, {
      panels: [panel],
      range: '30d',
    });

    expect(result.panels[0].series).toHaveLength(1);
    expect(result.panels[0].series[0]).toMatchObject({
      id: 'total',
      label: 'Total',
      points: [{ value: 5 }],
    });
  });
});
