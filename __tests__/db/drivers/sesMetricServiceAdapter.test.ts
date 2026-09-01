import {
  AwsDatabase,
  AwsServiceType,
  DbSESIdentity,
  fromJson,
  SesMetricServiceAdapter,
} from '../../../src';

function createAdapter(discoverMetricNames = jest.fn().mockResolvedValue([])) {
  return {
    adapter: new SesMetricServiceAdapter({
      getAvailability: () => ({ discoverMetricNames } as never),
    }),
    discoverMetricNames,
  };
}

describe('SES dashboard capability', () => {
  it('is available only on the SES account-region service node', () => {
    const ses = new AwsDatabase('SES', AwsServiceType.SES);
    const s3 = new AwsDatabase('S3', AwsServiceType.S3);
    const identity = new DbSESIdentity('sender@example.com', {
      identityType: 'EmailAddress',
      verificationStatus: 'Success',
    });

    expect(ses.capabilities?.dashboards).toEqual([
      {
        dashboardId: 'aws-cloudwatch-metrics',
        providerId: 'aws.ses.account-region',
      },
    ]);
    expect(fromJson(JSON.parse(ses.toJsonStringify())).capabilities).toEqual(
      ses.capabilities,
    );
    expect(s3.capabilities?.dashboards).toEqual([
      {
        dashboardId: 'aws-cloudwatch-metrics-overview',
        providerId: 'aws.s3.overview',
      },
    ]);
    expect(identity.capabilities).toBeUndefined();
  });
});

describe('SesMetricServiceAdapter', () => {
  it('requires a region and resolves an explicit account-region scope', async () => {
    const { adapter } = createAdapter();

    await expect(
      adapter.resolveTarget({
        resourceKey: 'runtime-key',
        displayName: 'SES',
      }),
    ).rejects.toThrow('region is unavailable');

    await expect(
      adapter.resolveTarget({
        resourceKey: 'runtime-key',
        displayName: 'SES',
        region: 'ap-northeast-1',
      }),
    ).resolves.toMatchObject({
      providerId: 'aws.ses.account-region',
      variant: 'account-region',
      endpoint: { region: 'ap-northeast-1', scope: 'regional' },
      identity: {
        displayName: 'SES account',
        scopeLabel: 'SES account in ap-northeast-1',
      },
    });
  });

  it('uses direct dimensionless reputation metrics and AWS warning thresholds', async () => {
    const { adapter } = createAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'SES',
      region: 'us-east-1',
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const panels = dashboard.tabs[0].panels;
    const reputation = panels.find((panel) => panel.id === 'reputation')!;

    expect(dashboard.tabs[0]).toMatchObject({
      id: 'overview',
      defaultRange: '3d',
      autoRefreshAllowed: true,
    });
    expect(panels.every((panel) => panel.scope.kind === 'account-region')).toBe(
      true,
    );
    expect(reputation.derive).toBeUndefined();
    expect(reputation.queries).toEqual([
      expect.objectContaining({
        metricName: 'Reputation.BounceRate',
        statistic: 'Average',
        unit: 'percent',
        dimensions: [],
      }),
      expect.objectContaining({
        metricName: 'Reputation.ComplaintRate',
        statistic: 'Average',
        unit: 'percent',
        dimensions: [],
      }),
    ]);
    expect(reputation.thresholds).toEqual([
      { value: 0.05, label: 'Bounce rate 5%', severity: 'warn' },
      { value: 0.001, label: 'Complaint rate 0.1%', severity: 'warn' },
    ]);
  });

  it('adds only recently observed dimensionless optional event metrics', async () => {
    const discoverMetricNames = jest
      .fn()
      .mockResolvedValue(['Click', 'Open', 'Send', 'TaggedOnly']);
    const { adapter } = createAdapter(discoverMetricNames);
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'SES',
      region: 'eu-west-1',
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const optional = dashboard.tabs[0].panels.find(
      (panel) => panel.id === 'observed-events',
    )!;

    expect(discoverMetricNames).toHaveBeenCalledWith({
      namespace: 'AWS/SES',
      matchingDimensions: [],
      exactDimensions: true,
      signal: undefined,
    });
    expect(optional.queries.map((query) => query.metricName)).toEqual([
      'Open',
      'Click',
    ]);
    expect(optional.collapsedByDefault).toBe(true);
  });

  it('keeps the required dashboard when optional metric discovery is unavailable', async () => {
    const { adapter } = createAdapter(
      jest.fn().mockRejectedValue(new Error('ListMetrics denied')),
    );
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'SES',
      region: 'ap-southeast-2',
    });
    const dashboard = await adapter.resolveDashboard(target, {});

    expect(
      dashboard.tabs[0].panels.find((panel) => panel.id === 'observed-events'),
    ).toBeUndefined();
    expect(
      dashboard.tabs[0].panels
        .flatMap((panel) => panel.queries)
        .map((query) => query.metricName),
    ).toEqual(
      expect.arrayContaining([
        'Send',
        'Delivery',
        'Bounce',
        'Complaint',
        'Reject',
        'DeliveryDelay',
        'Reputation.BounceRate',
        'Reputation.ComplaintRate',
      ]),
    );
  });
});
