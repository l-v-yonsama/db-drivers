import {
  CloudWatchLogsMetricServiceAdapter,
  DbLogGroup,
  fromJson,
} from '../../../src';

describe('CloudWatch Logs dashboard capability', () => {
  it('round-trips on a log group resource', () => {
    const logGroup = new DbLogGroup('/aws/lambda/orders', {
      storedBytes: 42,
    });

    expect(logGroup.capabilities?.dashboards).toEqual([
      {
        dashboardId: 'aws-cloudwatch-metrics',
        providerId: 'aws.logs.log-group',
      },
    ]);
    expect(
      fromJson(JSON.parse(logGroup.toJsonStringify())).capabilities,
    ).toEqual(logGroup.capabilities);
  });
});

describe('CloudWatchLogsMetricServiceAdapter', () => {
  it('resolves log-group metrics with the exact resource dimension', async () => {
    const adapter = new CloudWatchLogsMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: '/aws/lambda/orders',
      region: 'ap-northeast-1',
      endpoint: 'http://127.0.0.1:4566',
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const panels = dashboard.tabs[0].panels;
    const queries = panels.flatMap((panel) => panel.queries);

    expect(target.endpoint).toEqual({
      region: 'ap-northeast-1',
      endpoint: 'http://127.0.0.1:4566',
      scope: 'regional',
    });
    expect(target.identity.scopeLabel).toBe('Log group /aws/lambda/orders');
    expect(queries.map((item) => item.metricName)).toEqual([
      'IncomingLogEvents',
      'IncomingBytes',
      'ForwardedLogEvents',
      'DeliveryErrors',
    ]);
    expect(queries.every((item) => item.namespace === 'AWS/Logs')).toBe(true);
    expect(
      queries.every(
        (item) =>
          item.dimensions.length === 1 &&
          item.dimensions[0].Name === 'LogGroupName' &&
          item.dimensions[0].Value === '/aws/lambda/orders',
      ),
    ).toBe(true);
    expect(
      panels.find((panel) => panel.id === 'subscription-delivery')
        ?.collapsedByDefault,
    ).toBe(true);
  });
});
