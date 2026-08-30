import { GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import {
  alignSeriesByTimestamp,
  CloudWatchMetricsTransport,
  getCloudWatchQueryBatchSize,
  ResolvedMetricQuery,
} from '../../../src';

function metricQuery(id: string): ResolvedMetricQuery {
  return {
    id,
    namespace: 'AWS/SQS',
    metricName: 'NumberOfMessagesSent',
    statistic: 'Sum',
    label: id,
    unit: 'count',
    nativePeriodSeconds: 60,
    dimensions: [{ Name: 'QueueName', Value: 'orders' }],
  };
}

const startTime = new Date('2026-08-29T00:00:00.000Z');
const endTime = new Date('2026-08-29T01:00:00.000Z');

describe('CloudWatchMetricsTransport', () => {
  it('splits more than 500 queries into independent requests', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => ({
      MetricDataResults: command.input.MetricDataQueries?.map((query) => ({
        Id: query.Id,
        StatusCode: 'Complete' as const,
        Timestamps: [],
        Values: [],
      })),
    }));
    const transport = new CloudWatchMetricsTransport({ send } as never);

    const result = await transport.collect({
      queries: Array.from({ length: 501 }, (_, index) =>
        metricQuery(`m${index}`),
      ),
      startTime,
      endTime,
      periodSeconds: 60,
    });

    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].input.MetricDataQueries).toHaveLength(500);
    expect(send.mock.calls[1][0].input.MetricDataQueries).toHaveLength(1);
    expect(result).toHaveLength(501);
    expect(result.every((series) => series.status === 'no-data')).toBe(true);
  });

  it('reduces batch size to stay under the 100,800 datapoint limit', () => {
    expect(
      getCloudWatchQueryBatchSize({
        startTime: new Date('2026-07-30T00:00:00.000Z'),
        endTime: new Date('2026-08-29T00:00:00.000Z'),
        periodSeconds: 60,
      }),
    ).toBe(2);
  });

  it('follows NextToken, preserves response messages, and sorts points', async () => {
    const send = jest
      .fn()
      .mockResolvedValueOnce({
        NextToken: 'next',
        Messages: [{ Code: 'BatchMessage', Value: 'first page' }],
        MetricDataResults: [
          {
            Id: 'm0',
            StatusCode: 'PartialData',
            Timestamps: [new Date('2026-08-29T00:02:00.000Z')],
            Values: [2],
            Messages: [{ Code: 'Partial', Value: 'more data may follow' }],
          },
        ],
      })
      .mockResolvedValueOnce({
        MetricDataResults: [
          {
            Id: 'm0',
            StatusCode: 'Complete',
            Timestamps: [new Date('2026-08-29T00:01:00.000Z')],
            Values: [1],
          },
        ],
      });
    const transport = new CloudWatchMetricsTransport({ send } as never);

    const [series] = await transport.collect({
      queries: [metricQuery('m0')],
      startTime,
      endTime,
      periodSeconds: 60,
    });

    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1][0].input.NextToken).toBe('next');
    expect(series.status).toBe('partial');
    expect(series.points).toEqual([
      { timestamp: '2026-08-29T00:01:00.000Z', value: 1 },
      { timestamp: '2026-08-29T00:02:00.000Z', value: 2 },
    ]);
    expect(series.messages).toEqual(
      expect.arrayContaining([
        { code: 'BatchMessage', value: 'first page' },
        { code: 'Partial', value: 'more data may follow' },
      ]),
    );
  });

  it('maps access denial without exposing the SDK error message', async () => {
    const error = new Error('credential and endpoint details');
    error.name = 'AccessDeniedException';
    const send = jest.fn(async () => {
      throw error;
    });
    const transport = new CloudWatchMetricsTransport({ send } as never);

    const [series] = await transport.collect({
      queries: [metricQuery('m0')],
      startTime,
      endTime,
      periodSeconds: 60,
    });

    expect(series.status).toBe('forbidden');
    expect(JSON.stringify(series.messages)).not.toContain('credential');
    expect(JSON.stringify(series.messages)).not.toContain('endpoint details');
  });

  it('rejects duplicate query ids before calling CloudWatch', async () => {
    const send = jest.fn();
    const transport = new CloudWatchMetricsTransport({ send } as never);

    await expect(
      transport.collect({
        queries: [metricQuery('m0'), metricQuery('m0')],
        startTime,
        endTime,
        periodSeconds: 60,
      }),
    ).rejects.toThrow('Duplicate metric query id');
    expect(send).not.toHaveBeenCalled();
  });
});

describe('alignSeriesByTimestamp', () => {
  it('outer-joins timestamps and fills missing points with null, not zero', () => {
    const [left, right] = alignSeriesByTimestamp([
      {
        id: 'left',
        metricName: 'Left',
        statistic: 'Sum',
        label: 'Left',
        unit: 'count',
        dimensions: [],
        status: 'complete',
        messages: [],
        points: [{ timestamp: '2026-08-29T00:00:00.000Z', value: 0 }],
      },
      {
        id: 'right',
        metricName: 'Right',
        statistic: 'Sum',
        label: 'Right',
        unit: 'count',
        dimensions: [],
        status: 'complete',
        messages: [],
        points: [{ timestamp: '2026-08-29T00:01:00.000Z', value: 4 }],
      },
    ]);

    expect(left.points).toEqual([
      { timestamp: '2026-08-29T00:00:00.000Z', value: 0 },
      { timestamp: '2026-08-29T00:01:00.000Z', value: null },
    ]);
    expect(right.points).toEqual([
      { timestamp: '2026-08-29T00:00:00.000Z', value: null },
      { timestamp: '2026-08-29T00:01:00.000Z', value: 4 },
    ]);
  });
});
