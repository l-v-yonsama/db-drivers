import { CloudWatchMetricsCollector, ResolvedMetricPanel } from '../../../src';

function panel(id: string): ResolvedMetricPanel {
  return {
    id,
    title: id,
    purpose: 'workload',
    visualization: 'line',
    emission: 'default',
    scope: { kind: 'resource', label: 'orders' },
    cost: { publication: 'included', read: 'get-metric-data' },
    queries: [
      {
        id: 'same-query-id',
        namespace: 'AWS/SQS',
        metricName: 'NumberOfMessagesSent',
        statistic: 'Sum',
        label: id,
        unit: 'count',
        nativePeriodSeconds: 60,
        dimensions: [{ Name: 'QueueName', Value: 'orders' }],
      },
    ],
  };
}

describe('CloudWatchMetricsCollector', () => {
  it('collects panels independently, aligns each panel, and resolves the range period', async () => {
    const collect = jest.fn(async (input) => [
      {
        id: input.queries[0].id,
        metricName: input.queries[0].metricName,
        statistic: input.queries[0].statistic,
        label: input.queries[0].label,
        unit: input.queries[0].unit,
        dimensions: input.queries[0].dimensions,
        status: 'complete' as const,
        messages: [],
        points: [{ timestamp: '2026-08-29T00:00:00.000Z', value: 0 }],
      },
    ]);
    const collector = new CloudWatchMetricsCollector({ collect } as never);

    const result = await collector.collectPanels({
      panels: [panel('first'), panel('second')],
      range: '3d',
      endTime: new Date('2026-08-29T00:00:00.000Z'),
    });

    expect(collect).toHaveBeenCalledTimes(2);
    expect(result.periodSeconds).toBe(900);
    expect(result.startTime).toBe('2026-08-26T00:00:00.000Z');
    expect(result.panels.map((item) => item.panelId)).toEqual([
      'first',
      'second',
    ]);
  });
});
