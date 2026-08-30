import {
  deriveMetricPanelSeries,
  MetricSeries,
  ResolvedMetricPanel,
} from '../../../src';

const timestamp1 = '2026-08-28T00:00:00.000Z';
const timestamp2 = '2026-08-29T00:00:00.000Z';

function series(
  id: string,
  values: Array<{ timestamp: string; value: number }>,
  status: MetricSeries['status'] = 'complete',
): MetricSeries {
  return {
    id,
    metricName: 'BucketSizeBytes',
    statistic: 'Average',
    label: id,
    unit: 'bytes',
    dimensions: [],
    points: values,
    status,
    messages: status === 'failed' ? [{ code: 'InternalError' }] : [],
  };
}

function panel(): ResolvedMetricPanel {
  return {
    id: 'bucket-size',
    title: 'Bucket size',
    purpose: 'capacity',
    visualization: 'bar',
    emission: 'default',
    scope: { kind: 'dimension-group', label: 'Buckets' },
    cost: { publication: 'included', read: 'get-metric-data' },
    queries: ['standard', 'glacier'].map((id) => ({
      id,
      namespace: 'AWS/S3',
      metricName: 'BucketSizeBytes',
      statistic: 'Average',
      label: id,
      unit: 'bytes',
      nativePeriodSeconds: 86_400,
      dimensions: [],
      visible: false,
    })),
    derive: [
      {
        id: 'total',
        label: 'bucket-a',
        unit: 'bytes',
        operation: 'sum',
        inputSeriesIds: ['standard', 'glacier'],
      },
    ],
  };
}

describe('deriveMetricPanelSeries', () => {
  it('sums observed zeros but leaves any missing input as null', () => {
    const result = deriveMetricPanelSeries(
      [
        series('standard', [
          { timestamp: timestamp1, value: 1 },
          { timestamp: timestamp2, value: 0 },
        ]),
        series('glacier', [{ timestamp: timestamp2, value: 0 }]),
      ],
      panel(),
    );

    expect(result).toHaveLength(1);
    expect(result[0].points).toEqual([
      { timestamp: timestamp1, value: null },
      { timestamp: timestamp2, value: 0 },
    ]);
  });

  it('marks a derived series partial when one input query failed', () => {
    const result = deriveMetricPanelSeries(
      [
        series('standard', [{ timestamp: timestamp1, value: 5 }]),
        series('glacier', [], 'failed'),
      ],
      panel(),
    );

    expect(result[0]).toMatchObject({
      status: 'partial',
      points: [{ timestamp: timestamp1, value: null }],
      messages: [{ code: 'InternalError' }],
    });
  });
});
