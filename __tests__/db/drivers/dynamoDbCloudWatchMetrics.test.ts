import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { DynamoDbCloudWatchMetricsCollector } from '../../../src';

// Mocks @aws-sdk/client-cloudwatch's send() directly - per the design doc's
// §15.3, LocalStack's CloudWatch/DynamoDB metric compatibility is not
// trusted for this area at all; these mock-based unit tests are the
// authoritative coverage for dimension/stat/period/no-data behavior.

type FakeSend = jest.Mock;

function fakeClient(send: FakeSend): CloudWatchClient {
  return { send } as unknown as CloudWatchClient;
}

function emptyResponse(ids: string[]): { MetricDataResults: Array<{ Id: string; Timestamps: Date[]; Values: number[] }> } {
  return { MetricDataResults: ids.map((Id) => ({ Id, Timestamps: [], Values: [] })) };
}

describe('DynamoDbCloudWatchMetricsCollector', () => {
  const now = new Date('2026-08-24T12:00:00.000Z');

  it('requests a ConsumedReadCapacityUnits + provisioned + 5 throttle series for a PROVISIONED table scope', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const result = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PROVISIONED',
      hasOnDemandMaxLimit: false,
      now,
    });

    expect(result.ok).toBe(true);
    const sentQueries = send.mock.calls[0][0].input.MetricDataQueries;
    const tableScopeQueries = sentQueries.filter(
      (q: any) => q.MetricStat.Metric.Dimensions.length === 1 && q.MetricStat.Metric.Dimensions[0].Name === 'TableName',
    );
    // ConsumedReadCapacityUnits + ProvisionedReadCapacityUnits + 5 throttle metrics = 7
    expect(tableScopeQueries).toHaveLength(7);
    expect(tableScopeQueries.map((q: any) => q.MetricStat.Metric.MetricName)).toEqual(
      expect.arrayContaining([
        'ConsumedReadCapacityUnits',
        'ProvisionedReadCapacityUnits',
        'ReadThrottleEvents',
        'ReadKeyRangeThroughputThrottleEvents',
        'ReadProvisionedThroughputThrottleEvents',
        'ReadAccountLimitThrottleEvents',
        'ReadMaxOnDemandThroughputThrottleEvents',
      ]),
    );
  });

  it('omits ProvisionedReadCapacityUnits for PAY_PER_REQUEST billing, and adds OnDemandMaxReadRequestUnits only when hasOnDemandMaxLimit', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: true,
      now,
    });

    const sentNames = send.mock.calls[0][0].input.MetricDataQueries.map((q: any) => q.MetricStat.Metric.MetricName);
    expect(sentNames).not.toContain('ProvisionedReadCapacityUnits');
    expect(sentNames).toContain('OnDemandMaxReadRequestUnits');
  });

  it('adds a GSI-scoped query block only for indexType GSI, never for LSI', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    await collector.collect({
      tableName: 'orders',
      indexName: 'email-gsi',
      indexType: 'GSI',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    const gsiQueries = send.mock.calls[0][0].input.MetricDataQueries.filter((q: any) =>
      q.MetricStat.Metric.Dimensions.some((d: any) => d.Name === 'GlobalSecondaryIndexName'),
    );
    expect(gsiQueries.length).toBeGreaterThan(0);
    expect(gsiQueries[0].MetricStat.Metric.Dimensions).toContainEqual({
      Name: 'GlobalSecondaryIndexName',
      Value: 'email-gsi',
    });

    send.mockClear();
    await collector.collect({
      tableName: 'orders',
      indexName: 'lsi1',
      indexType: 'LSI',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    const noGsiQueries = send.mock.calls[0][0].input.MetricDataQueries.filter((q: any) =>
      q.MetricStat.Metric.Dimensions.some((d: any) => d.Name === 'GlobalSecondaryIndexName'),
    );
    expect(noGsiQueries).toHaveLength(0);
  });

  it('uses Operation=ExecuteStatement + Verb=PartiQLSelect for PartiQL, and just Operation for native Query/Scan', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    await collector.collect({
      tableName: 'orders',
      operation: 'ExecuteStatement',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    const partiqlOpQuery = send.mock.calls[0][0].input.MetricDataQueries.find(
      (q: any) => q.MetricStat.Metric.MetricName === 'SuccessfulRequestLatency',
    );
    expect(partiqlOpQuery.MetricStat.Metric.Dimensions).toContainEqual({ Name: 'Operation', Value: 'ExecuteStatement' });
    expect(partiqlOpQuery.MetricStat.Metric.Dimensions).toContainEqual({ Name: 'Verb', Value: 'PartiQLSelect' });

    send.mockClear();
    await collector.collect({
      tableName: 'orders',
      operation: 'Scan',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    const scanOpQuery = send.mock.calls[0][0].input.MetricDataQueries.find(
      (q: any) => q.MetricStat.Metric.MetricName === 'SuccessfulRequestLatency',
    );
    expect(scanOpQuery.MetricStat.Metric.Dimensions).toContainEqual({ Name: 'Operation', Value: 'Scan' });
    expect(scanOpQuery.MetricStat.Metric.Dimensions.some((d: any) => d.Name === 'Verb')).toBe(false);
  });

  it('requests all three latency percentiles as separate queries', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    const latencyStats = send.mock.calls[0][0].input.MetricDataQueries.filter(
      (q: any) => q.MetricStat.Metric.MetricName === 'SuccessfulRequestLatency',
    ).map((q: any) => q.MetricStat.Stat);
    expect(latencyStats.sort()).toEqual(['p50', 'p90', 'p99']);
  });

  it('marks a series with zero datapoints as noData: true with empty arrays, not as zero activity', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const result = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    expect(result.ok).toBe(true);
    for (const series of result.result!.series) {
      expect(series.noData).toBe(true);
      expect(series.values).toEqual([]);
      expect(series.timestamps).toEqual([]);
    }
  });

  it('sorts timestamps/values ascending even when the API returns them descending', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => ({
      MetricDataResults: command.input.MetricDataQueries!.map((q) => ({
        Id: q.Id!,
        Timestamps: [new Date('2026-08-24T11:59:00Z'), new Date('2026-08-24T11:58:00Z'), new Date('2026-08-24T12:00:00Z')],
        Values: [20, 10, 30],
      })),
    }));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const result = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    const series = result.result!.series[0];
    expect(series.noData).toBe(false);
    expect(series.timestamps).toEqual(['2026-08-24T11:58:00.000Z', '2026-08-24T11:59:00.000Z', '2026-08-24T12:00:00.000Z']);
    expect(series.values).toEqual([10, 20, 30]);
  });

  it('honors lookbackMinutes/periodSeconds and reports the resulting window', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const result = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      lookbackMinutes: 30,
      periodSeconds: 300,
      now,
    });
    expect(result.result!.window).toEqual({
      startTime: '2026-08-24T11:30:00.000Z',
      endTime: '2026-08-24T12:00:00.000Z',
      periodSeconds: 300,
    });
    const firstQuery = send.mock.calls[0][0].input.MetricDataQueries[0];
    expect(firstQuery.MetricStat.Period).toBe(300);
  });

  it('defaults to a 60-minute/60-second window when not specified, and clamps out-of-range values', async () => {
    const send = jest.fn(async (command: GetMetricDataCommand) => emptyResponse(command.input.MetricDataQueries!.map((q) => q.Id!)));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const defaulted = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    expect(defaulted.result!.window).toEqual({
      startTime: '2026-08-24T11:00:00.000Z',
      endTime: '2026-08-24T12:00:00.000Z',
      periodSeconds: 60,
    });

    const clamped = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      lookbackMinutes: -5,
      periodSeconds: 10,
      now,
    });
    expect(clamped.result!.window.periodSeconds).toBe(60);
    expect(clamped.result!.window.startTime).toBe('2026-08-24T11:59:00.000Z'); // 1 minute lookback (min clamp)
  });

  it('follows a NextToken and merges paginated results for the same series id', async () => {
    const send = jest
      .fn()
      .mockImplementationOnce(async (command: GetMetricDataCommand) => ({
        MetricDataResults: command.input.MetricDataQueries!.map((q) => ({
          Id: q.Id!,
          Timestamps: [new Date('2026-08-24T11:58:00Z')],
          Values: [1],
        })),
        NextToken: 'page2',
      }))
      .mockImplementationOnce(async (command: GetMetricDataCommand) => ({
        MetricDataResults: command.input.MetricDataQueries!.map((q) => ({
          Id: q.Id!,
          Timestamps: [new Date('2026-08-24T11:59:00Z')],
          Values: [2],
        })),
      }));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const result = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    expect(send).toHaveBeenCalledTimes(2);
    expect(result.result!.series[0].values).toEqual([1, 2]);
  });

  it('returns a safe, generic message on AccessDeniedException without leaking exception detail', async () => {
    const err = Object.assign(new Error('User: arn:aws:iam::123456789012:user/secret-user is not authorized'), {
      name: 'AccessDeniedException',
    });
    const send = jest.fn().mockRejectedValue(err);
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const result = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    expect(result.ok).toBe(false);
    expect(result.message).not.toContain('123456789012');
    expect(result.message).not.toContain('secret-user');
  });

  it('returns ok:false with a generic message for an unrecognized exception', async () => {
    const send = jest.fn().mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:443'));
    const collector = new DynamoDbCloudWatchMetricsCollector(fakeClient(send));

    const result = await collector.collect({
      tableName: 'orders',
      operation: 'Query',
      billingMode: 'PAY_PER_REQUEST',
      hasOnDemandMaxLimit: false,
      now,
    });
    expect(result.ok).toBe(false);
    expect(result.message).not.toContain('ECONNREFUSED');
  });
});
