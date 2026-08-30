import {
  HeadBucketCommand,
  ListBucketMetricsConfigurationsCommand,
} from '@aws-sdk/client-s3';
import {
  DbS3Bucket,
  fromJson,
  S3MetricServiceAdapter,
  S3_REQUEST_FILTER_SELECTOR_ID,
  type DiscoverCloudWatchDimensionValuesInput,
} from '../../../src';

type TestOptions = {
  send?: jest.Mock;
  discover?: jest.Mock;
};

function createAdapter(options: TestOptions = {}): {
  adapter: S3MetricServiceAdapter;
  send: jest.Mock;
  discover: jest.Mock;
} {
  const send =
    options.send ??
    jest.fn(async (command: unknown) => {
      if (command instanceof HeadBucketCommand) {
        return { BucketRegion: 'ap-northeast-1' };
      }
      if (command instanceof ListBucketMetricsConfigurationsCommand) {
        return { MetricsConfigurationList: [] };
      }
      throw new Error('Unexpected S3 command');
    });
  const discover = options.discover ?? jest.fn().mockResolvedValue([]);
  const adapter = new S3MetricServiceAdapter({
    getS3Client: () => ({ send } as never),
    getAvailability: () => ({ discoverDimensionValues: discover } as never),
  });
  return { adapter, send, discover };
}

describe('S3 dashboard capability', () => {
  it('stores the listed region and round-trips the dashboard capability', () => {
    const bucket = new DbS3Bucket(
      'orders',
      new Date('2026-08-01T00:00:00.000Z'),
      'us-west-2',
    );

    expect(bucket.attr.region).toBe('us-west-2');
    expect(bucket.capabilities?.dashboards).toEqual([
      {
        dashboardId: 'aws-cloudwatch-metrics',
        providerId: 'aws.s3.bucket',
      },
    ]);
    expect(fromJson(JSON.parse(bucket.toJsonStringify())).capabilities).toEqual(
      bucket.capabilities,
    );
  });
});

describe('S3MetricServiceAdapter region resolution', () => {
  it('uses the bucket region attribute without calling HeadBucket', async () => {
    const { adapter, send } = createAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { region: 'us-west-2' },
    });

    expect(target.endpoint.region).toBe('us-west-2');
    expect(
      send.mock.calls.some(([command]) => command instanceof HeadBucketCommand),
    ).toBe(false);
  });

  it('uses HeadBucket when the list response did not include a region', async () => {
    const { adapter, send } = createAdapter({
      send: jest.fn(async (command: unknown) => {
        if (command instanceof HeadBucketCommand) {
          return { BucketRegion: 'eu-west-1' };
        }
        return { MetricsConfigurationList: [] };
      }),
    });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
    });

    expect(target.endpoint.region).toBe('eu-west-1');
    expect(send.mock.calls[0][0]).toBeInstanceOf(HeadBucketCommand);
  });

  it('accepts the response-header region from a redirected HeadBucket', async () => {
    const redirect = Object.assign(new Error('redirect'), {
      $response: { headers: { 'x-amz-bucket-region': 'us-east-1' } },
    });
    const { adapter } = createAdapter({
      send: jest.fn(async (command: unknown) => {
        if (command instanceof HeadBucketCommand) throw redirect;
        return { MetricsConfigurationList: [] };
      }),
    });

    await expect(
      adapter.resolveTarget({
        resourceKey: 'runtime-key',
        displayName: 'orders',
        region: 'ap-northeast-1',
      }),
    ).resolves.toMatchObject({ endpoint: { region: 'us-east-1' } });
  });

  it('stops instead of guessing when HeadBucket cannot resolve a region', async () => {
    const { adapter } = createAdapter({
      send: jest.fn(async (command: unknown) => {
        if (command instanceof HeadBucketCommand) {
          throw new Error('network failure');
        }
        return {};
      }),
    });

    await expect(
      adapter.resolveTarget({
        resourceKey: 'runtime-key',
        displayName: 'orders',
        region: 'ap-northeast-1',
      }),
    ).rejects.toThrow('could not be resolved');
  });
});

describe('S3MetricServiceAdapter dashboard resolution', () => {
  it('keeps daily storage separate and treats zero request configurations as not configured', async () => {
    const { adapter, discover } = createAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { region: 'ap-northeast-1' },
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const storage = dashboard.tabs.find((tab) => tab.id === 'storage')!;
    const requests = dashboard.tabs.find((tab) => tab.id === 'requests')!;

    expect(storage.defaultRange).toBe('30d');
    expect(storage.autoRefreshAllowed).toBe(false);
    expect(
      storage.panels
        .flatMap((panel) => panel.queries)
        .every((query) => query.nativePeriodSeconds === 86_400),
    ).toBe(true);
    expect(
      storage.panels[0].queries.map(
        (query) =>
          query.dimensions.find((item) => item.Name === 'StorageType')?.Value,
      ),
    ).toContain('StandardStorage');
    expect(requests.defaultRange).toBe('1h');
    expect(requests.selectors).toEqual([]);
    expect(requests.panels.every((panel) => panel.queries.length === 0)).toBe(
      true,
    );
    expect(dashboard.prerequisites['s3-request-metrics'].status).toBe(
      'not-configured',
    );
    expect(discover).toHaveBeenCalledTimes(1);
  });

  it('uses observed storage types but does not require ListMetrics to prove request configuration', async () => {
    const send = jest.fn(async (command: unknown) => {
      if (command instanceof ListBucketMetricsConfigurationsCommand) {
        return {
          MetricsConfigurationList: [
            { Id: 'all-requests', Filter: { Prefix: 'incoming/' } },
          ],
        };
      }
      throw new Error('Unexpected command');
    });
    const discover = jest.fn(
      async (input: DiscoverCloudWatchDimensionValuesInput) =>
        input.dimensionName === 'StorageType'
          ? ['GlacierStorage', 'StandardStorage']
          : [],
    );
    const { adapter } = createAdapter({ send, discover });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { region: 'ap-northeast-1' },
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const storage = dashboard.tabs[0];
    const requests = dashboard.tabs[1];

    expect(storage.panels[0].queries).toHaveLength(2);
    expect(dashboard.prerequisites['s3-request-metrics'].status).toBe(
      'configured',
    );
    expect(requests.selectors[0]).toMatchObject({
      id: S3_REQUEST_FILTER_SELECTOR_ID,
      value: 'all-requests',
      options: [
        {
          value: 'all-requests',
          label: 'all-requests',
          description: 'Prefix: incoming/',
        },
      ],
    });
    expect(
      requests.panels
        .flatMap((panel) => panel.queries)
        .every((query) =>
          query.dimensions.some(
            (dimension) =>
              dimension.Name === 'FilterId' &&
              dimension.Value === 'all-requests',
          ),
        ),
    ).toBe(true);
  });

  it('paginates configurations and re-resolves an exact selected FilterId without combining filters', async () => {
    const send = jest.fn(async (command: unknown) => {
      if (!(command instanceof ListBucketMetricsConfigurationsCommand)) {
        throw new Error('Unexpected command');
      }
      return command.input.ContinuationToken
        ? {
            MetricsConfigurationList: [
              {
                Id: 'tagged',
                Filter: { Tag: { Key: 'team', Value: 'payments' } },
              },
            ],
          }
        : {
            MetricsConfigurationList: [
              { Id: 'prefix', Filter: { Prefix: 'incoming/' } },
            ],
            NextContinuationToken: 'next',
          };
    });
    const { adapter } = createAdapter({ send });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { region: 'ap-northeast-1' },
    });
    const dashboard = await adapter.resolveDashboard(target, {
      [S3_REQUEST_FILTER_SELECTOR_ID]: 'tagged',
    });
    const requestTab = dashboard.tabs[1];

    expect(requestTab.selectors[0].options).toHaveLength(2);
    expect(requestTab.selectors[0].value).toBe('tagged');
    expect(
      requestTab.panels
        .flatMap((panel) => panel.queries)
        .every(
          (query) =>
            query.dimensions.find((item) => item.Name === 'FilterId')?.Value ===
            'tagged',
        ),
    ).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('continues from observed FilterIds after configuration access denial and exposes verification uncertainty', async () => {
    const denied = Object.assign(new Error('denied'), {
      name: 'AccessDenied',
    });
    const discover = jest.fn(
      async (input: DiscoverCloudWatchDimensionValuesInput) =>
        input.dimensionName === 'FilterId' ? ['observed-filter'] : [],
    );
    const { adapter } = createAdapter({
      send: jest.fn().mockRejectedValue(denied),
      discover,
    });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { region: 'ap-northeast-1' },
    });
    const dashboard = await adapter.resolveDashboard(target, {});

    expect(dashboard.prerequisites['s3-request-metrics'].status).toBe(
      'configured',
    );
    expect(
      dashboard.prerequisites['s3-request-metrics-verification'].status,
    ).toBe('unknown');
    expect(dashboard.tabs[1].selectors[0].value).toBe('observed-filter');
    expect(dashboard.tabs[1].panels[0].id).toBe(
      'request-configuration-verification',
    );
  });

  it('reports unknown rather than not-configured when configuration access is denied and nothing is observed', async () => {
    const denied = Object.assign(new Error('denied'), {
      name: 'AccessDenied',
    });
    const { adapter } = createAdapter({
      send: jest.fn().mockRejectedValue(denied),
    });
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { region: 'ap-northeast-1' },
    });
    const dashboard = await adapter.resolveDashboard(target, {});

    expect(dashboard.prerequisites['s3-request-metrics']).toMatchObject({
      status: 'unknown',
      requiredPermissions: ['s3:GetMetricsConfiguration'],
    });
  });
});
