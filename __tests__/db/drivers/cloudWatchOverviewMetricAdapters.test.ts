import {
  DynamoDbOverviewMetricServiceAdapter,
  MetricResourceSnapshot,
  OVERVIEW_SERIES_LIMIT_SELECTOR_ID,
  ResourceType,
  S3OverviewMetricServiceAdapter,
  SqsOverviewMetricServiceAdapter,
} from '../../../src';

describe('CloudWatch service overview adapters', () => {
  it('builds an SQS comparison that reports every queried series but displays the top 20', async () => {
    const adapter = new SqsOverviewMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'SQS',
      region: 'ap-northeast-1',
      resources: Array.from({ length: 25 }, (_, index) => ({
        resourceType: ResourceType.Queue,
        displayName: `queue-${String(index).padStart(2, '0')}`,
      })),
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const tab = dashboard.tabs[0];

    expect(tab.panels[0].queries).toHaveLength(25);
    expect(tab.panels[0].seriesDisplay).toEqual({
      limit: 20,
      orderBy: 'maximum-desc',
    });
    expect(tab.selectors[0]).toMatchObject({
      id: OVERVIEW_SERIES_LIMIT_SELECTOR_ID,
      value: '20',
    });
    expect(tab.selectors[0].options[1].label).toContain('25 series queried');
  });

  it('caps candidates deterministically and lets DynamoDB rank read and write independently', async () => {
    const adapter = new DynamoDbOverviewMetricServiceAdapter();
    const resources: MetricResourceSnapshot[] = Array.from(
      { length: 105 },
      (_, index) => ({
        resourceType: ResourceType.DynamoTable,
        displayName: `table-${String(104 - index).padStart(3, '0')}`,
      }),
    );
    resources.push({
      resourceType: ResourceType.Queue,
      displayName: 'not-a-table',
    });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'DynamoDB',
      region: 'us-east-1',
      resources,
    });
    const dashboard = await adapter.resolveDashboard(target, {
      [OVERVIEW_SERIES_LIMIT_SELECTOR_ID]: '10',
    });

    expect(dashboard.tabs[0].panels).toHaveLength(2);
    expect(dashboard.tabs[0].panels[0].queries).toHaveLength(100);
    expect(dashboard.tabs[0].panels[0].queries[0].label).toBe('table-000');
    expect(dashboard.tabs[0].panels[1].seriesDisplay).toEqual({
      limit: 10,
      orderBy: 'sum-desc',
    });
    expect(dashboard.tabs[0].panels[0].caveat).toContain(
      'first 100 resource names are evaluated out of 105',
    );
  });

  it('discovers every S3 storage type in each bucket region and builds daily derived totals', async () => {
    const calls: Array<{ region: string; bucket: string }> = [];
    const adapter = new S3OverviewMetricServiceAdapter({
      getAvailability: (endpoint) =>
        ({
          discoverDimensionValues: jest.fn(async (input) => {
            const bucket = input.matchingDimensions[0].Value;
            calls.push({ region: endpoint.region, bucket });
            return bucket === 'bucket-east'
              ? ['GlacierObjectOverhead', 'GlacierStorage']
              : ['StandardStorage'];
          }),
        } as any),
    });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'S3',
      region: 'ap-northeast-1',
      resources: [
        {
          resourceType: ResourceType.Bucket,
          displayName: 'bucket-west',
          attributes: { region: 'us-west-2' },
        },
        {
          resourceType: ResourceType.Bucket,
          displayName: 'bucket-east',
          attributes: { region: 'us-east-1' },
        },
        {
          resourceType: ResourceType.Bucket,
          displayName: 'bucket-no-region',
        },
      ],
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const tab = dashboard.tabs[0];
    const panel = tab.panels[0];

    expect(calls).toEqual([
      { region: 'us-east-1', bucket: 'bucket-east' },
      { region: 'us-west-2', bucket: 'bucket-west' },
    ]);
    expect(panel.queries).toHaveLength(3);
    expect(panel.queries.map((query) => query.endpoint?.region)).toEqual([
      'us-east-1',
      'us-east-1',
      'us-west-2',
    ]);
    expect(panel.queries.every((query) => query.visible === false)).toBe(true);
    expect(panel.derive).toHaveLength(2);
    expect(tab).toMatchObject({
      defaultRange: '30d',
      autoRefreshAllowed: false,
    });
    expect(tab.selectors[0].options[1].label).toContain(
      '3 API series / 2 resources',
    );
    expect(panel.caveat).toContain('1 bucket(s) were excluded');
  });

  it('keeps a custom S3 endpoint in the connection region', async () => {
    const regions: string[] = [];
    const adapter = new S3OverviewMetricServiceAdapter({
      getAvailability: (endpoint) => {
        regions.push(endpoint.region);
        return {
          discoverDimensionValues: jest.fn(async () => ['StandardStorage']),
        } as any;
      },
    });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'S3',
      region: 'ap-northeast-1',
      endpoint: 'http://127.0.0.1:4566',
      resources: [
        {
          resourceType: ResourceType.Bucket,
          displayName: 'bucket-with-aws-region',
          attributes: { region: 'us-west-2' },
        },
      ],
    });
    const dashboard = await adapter.resolveDashboard(target, {});

    expect(regions).toEqual(['ap-northeast-1']);
    expect(dashboard.tabs[0].panels[0].queries[0].endpoint).toEqual({
      region: 'ap-northeast-1',
      endpoint: 'http://127.0.0.1:4566',
      scope: 'regional',
    });
  });
});
