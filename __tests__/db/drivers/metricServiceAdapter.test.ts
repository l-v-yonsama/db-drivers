import {
  DbSQSQueue,
  fromJson,
  MetricServiceAdapterRegistry,
  SqsMetricServiceAdapter,
  validateDashboardLaunchCapabilities,
} from '../../../src';

describe('dashboard launch capability', () => {
  it('adds a serializable CloudWatch dashboard capability to SQS queues', () => {
    const queue = new DbSQSQueue('orders.fifo', 'https://example/orders.fifo', {
      FifoQueue: true,
    });

    expect(queue.capabilities?.dashboards).toEqual([
      {
        dashboardId: 'aws-cloudwatch-metrics',
        providerId: 'aws.sqs.queue',
        variant: 'fifo',
      },
    ]);
    const serialized = queue.toJsonStringify();
    expect(serialized).not.toContain('resourceKey');
    expect(fromJson(JSON.parse(serialized)).capabilities).toEqual(
      queue.capabilities,
    );
    expect(() =>
      validateDashboardLaunchCapabilities(queue.capabilities),
    ).not.toThrow();
  });

  it('rejects duplicate dashboard families on one resource', () => {
    expect(() =>
      validateDashboardLaunchCapabilities({
        dashboards: [
          { dashboardId: 'metrics', providerId: 'provider.one' },
          { dashboardId: 'metrics', providerId: 'provider.two' },
        ],
      }),
    ).toThrow('Duplicate dashboardId');
  });
});

describe('MetricServiceAdapterRegistry', () => {
  it('resolves an adapter and rejects providerId duplicates', () => {
    const adapter = new SqsMetricServiceAdapter();
    const registry = new MetricServiceAdapterRegistry([adapter]);

    expect(registry.require('aws.sqs.queue')).toBe(adapter);
    expect(registry.resolve('aws.unknown')).toBeUndefined();
    expect(() => registry.register(new SqsMetricServiceAdapter())).toThrow(
      'Duplicate metric service providerId',
    );
  });
});

describe('SqsMetricServiceAdapter', () => {
  it('resolves a standard queue without FIFO-only metrics', async () => {
    const adapter = new SqsMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { FifoQueue: false, isDlq: false },
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const queries = dashboard.tabs.flatMap((tab) =>
      tab.panels.flatMap((panel) => panel.queries),
    );

    expect(target.endpoint).toEqual({
      region: 'ap-northeast-1',
      endpoint: undefined,
      scope: 'regional',
    });
    expect(dashboard.target.resourceKey).toBe('runtime-key');
    expect(queries.every((query) => query.namespace === 'AWS/SQS')).toBe(true);
    expect(
      queries.every((query) =>
        query.dimensions.some(
          (dimension) =>
            dimension.Name === 'QueueName' && dimension.Value === 'orders',
        ),
      ),
    ).toBe(true);
    expect(queries.map((query) => query.metricName)).not.toContain(
      'ApproximateNumberOfGroupsWithInflightMessages',
    );
  });

  it('adds FIFO-only metrics and preserves custom endpoint policy', async () => {
    const adapter = new SqsMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders.fifo',
      region: 'us-east-1',
      endpoint: 'http://127.0.0.1:4566',
      attributes: { FifoQueue: true, isDlq: true },
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const panels = dashboard.tabs[0].panels;
    const queries = panels.flatMap((panel) => panel.queries);

    expect(target.endpoint.endpoint).toBe('http://127.0.0.1:4566');
    expect(target.variant).toBe('fifo');
    expect(queries.map((query) => query.metricName)).toContain(
      'ApproximateNumberOfGroupsWithInflightMessages',
    );
    expect(panels[0].caveat).toContain('redrive');
    expect(
      queries.every((query) =>
        query.dimensions.some(
          (dimension) =>
            dimension.Name === 'QueueName' && dimension.Value === 'orders.fifo',
        ),
      ),
    ).toBe(true);
  });
});
