import {
  MetricEndpoint,
  MetricPrerequisiteResult,
  MetricResourceSnapshot,
  MetricServiceAdapter,
  MetricViewSelection,
  ResolveMetricTargetInput,
  ResolvedMetricDashboard,
  ResolvedMetricPanel,
  ResolvedMetricQuery,
  ResolvedMetricTarget,
  ResourceType,
} from '../../../../../types';
import { CloudWatchMetricsAvailability } from '../../cloudwatch';
import {
  overviewResources,
  overviewSeriesLimitSelector,
  resolveOverviewSeriesLimit,
  resolveOverviewTarget,
} from '../overview/overviewMetricAdapterUtils';

const PROVIDER_ID = 'aws.s3.overview';
const NAMESPACE = 'AWS/S3';
const DISCOVERY_CONCURRENCY = 10;

type S3OverviewResource = MetricResourceSnapshot & {
  endpoint: MetricEndpoint;
  storageTypes: string[];
};

export type S3OverviewMetricServiceAdapterOptions = {
  getAvailability(endpoint: MetricEndpoint): CloudWatchMetricsAvailability;
};

async function mapWithConcurrency<T, U>(
  values: readonly T[],
  concurrency: number,
  task: (value: T, index: number) => Promise<U>,
): Promise<U[]> {
  const result = new Array<U>(values.length);
  let nextIndex = 0;
  const worker = async (): Promise<void> => {
    for (;;) {
      const index = nextIndex++;
      if (index >= values.length) return;
      result[index] = await task(values[index], index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () =>
      worker(),
    ),
  );
  return result;
}

function resourceRegion(
  resource: MetricResourceSnapshot,
  input: ResolveMetricTargetInput,
): string | undefined {
  // A custom endpoint is one logical deployment; bucket metadata from a real AWS ListBuckets response must not redirect requests away from it.
  if (input.endpoint) return input.region;
  const region = resource.attributes?.region;
  return typeof region === 'string' && region ? region : undefined;
}

export class S3OverviewMetricServiceAdapter implements MetricServiceAdapter {
  readonly providerId = PROVIDER_ID;

  constructor(
    private readonly options: S3OverviewMetricServiceAdapterOptions,
  ) {}

  async resolveTarget(
    input: ResolveMetricTargetInput,
  ): Promise<ResolvedMetricTarget> {
    const base = resolveOverviewTarget({
      source: input,
      providerId: this.providerId,
      namespace: NAMESPACE,
      resourceType: ResourceType.Bucket,
      serviceLabel: 'S3',
    });
    const candidates = overviewResources(base);
    const resolved = await mapWithConcurrency(
      candidates,
      DISCOVERY_CONCURRENCY,
      async (resource): Promise<S3OverviewResource | undefined> => {
        const region = resourceRegion(resource, input);
        if (!region) return undefined;
        const endpoint: MetricEndpoint = {
          region,
          endpoint: input.endpoint,
          scope: 'regional',
        };
        try {
          const storageTypes = await this.options
            .getAvailability(endpoint)
            .discoverDimensionValues({
              namespace: NAMESPACE,
              metricName: 'BucketSizeBytes',
              matchingDimensions: [
                { Name: 'BucketName', Value: resource.displayName },
              ],
              dimensionName: 'StorageType',
              signal: input.signal,
            });
          return storageTypes.length > 0
            ? { ...resource, endpoint, storageTypes }
            : undefined;
        } catch (error) {
          if (input.signal?.aborted) throw error;
          return undefined;
        }
      },
    );
    const resources = resolved.filter(
      (resource): resource is S3OverviewResource => resource !== undefined,
    );
    return {
      ...base,
      identity: {
        ...base.identity,
        scopeLabel: 'S3 buckets across resolved bucket regions',
      },
      attributes: {
        ...base.attributes,
        resources,
        evaluatedResourceCount: candidates.length,
        unavailableResourceCount: candidates.length - resources.length,
      },
    };
  }

  async resolveDashboard(
    target: ResolvedMetricTarget,
    selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard> {
    const resources = overviewResources(
      target,
    ) as readonly S3OverviewResource[];
    const display = resolveOverviewSeriesLimit(selection, resources.length);
    const queries: ResolvedMetricQuery[] = [];
    const derive: NonNullable<ResolvedMetricPanel['derive']> = [];
    resources.forEach((resource, resourceIndex) => {
      const inputSeriesIds = resource.storageTypes.map(
        (storageType, storageTypeIndex) => {
          const id = `bucket_${resourceIndex}_storage_${storageTypeIndex}`;
          queries.push({
            id,
            namespace: NAMESPACE,
            metricName: 'BucketSizeBytes',
            statistic: 'Average',
            label: `${resource.displayName} / ${storageType}`,
            unit: 'bytes',
            nativePeriodSeconds: 86_400,
            dimensions: [
              { Name: 'BucketName', Value: resource.displayName },
              { Name: 'StorageType', Value: storageType },
            ],
            endpoint: resource.endpoint,
            visible: false,
          });
          return id;
        },
      );
      derive.push({
        id: `bucket_${resourceIndex}_total`,
        label: resource.displayName,
        unit: 'bytes',
        operation: 'sum',
        inputSeriesIds,
      });
    });
    const unavailableCount = Number(
      target.attributes.unavailableResourceCount ?? 0,
    );
    const evaluatedCount = Number(
      target.attributes.evaluatedResourceCount ?? resources.length,
    );
    const totalCount = Number(
      target.attributes.totalResourceCount ?? evaluatedCount,
    );
    const capCaveat =
      totalCount > evaluatedCount
        ? ` The first ${evaluatedCount} bucket names are evaluated out of ${totalCount}; narrow the connection resource filter for a different set.`
        : '';
    const discoveryCaveat =
      unavailableCount > 0
        ? ` ${unavailableCount} bucket(s) were excluded because their region or recent BucketSizeBytes storage types could not be resolved.`
        : '';
    const panel: ResolvedMetricPanel = {
      id: 'bucket-size-comparison',
      title: 'Daily bucket size comparison',
      purpose: 'capacity',
      visualization: 'bar',
      emission: 'default',
      scope: { kind: 'dimension-group', label: 'S3 buckets' },
      cost: {
        publication: 'included',
        read: 'get-metric-data',
        note: `${queries.length} storage-class CloudWatch series are read for ${resources.length} evaluated buckets.`,
      },
      queries,
      derive,
      seriesDisplay: { limit: display.limit, orderBy: 'latest-desc' },
      emptyHint:
        'S3 publishes storage metrics once per day. New or empty buckets can have no recently discoverable BucketSizeBytes series.',
      caveat: `Ranking is calculated after ${queries.length} CloudWatch series are queried for ${resources.length} buckets; the toolbar shows the actual per-refresh read count.${capCaveat} Each bucket total sums every BucketSizeBytes StorageType currently published for that bucket, including metadata overhead and staging storage; missing inputs remain gaps.${discoveryCaveat}`,
    };
    return {
      providerId: this.providerId,
      variant: target.variant,
      target: target.identity,
      tabs: [
        {
          id: 'overview',
          title: 'Bucket comparison',
          defaultRange: '30d',
          autoRefreshAllowed: false,
          selectors: [
            overviewSeriesLimitSelector(
              display.value,
              resources.length,
              queries.length,
            ),
          ],
          panels: [panel],
        },
      ],
      prerequisites: {},
    };
  }

  async probePrerequisites(
    _target: ResolvedMetricTarget,
    _panel: ResolvedMetricPanel,
  ): Promise<MetricPrerequisiteResult> {
    return { status: 'configured' };
  }
}
