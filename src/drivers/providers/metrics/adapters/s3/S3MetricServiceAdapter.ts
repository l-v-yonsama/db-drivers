import {
  HeadBucketCommand,
  HeadBucketCommandOutput,
  ListBucketMetricsConfigurationsCommand,
  MetricsConfiguration,
  MetricsFilter,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  MetricEndpoint,
  MetricDimension,
  MetricPrerequisiteResult,
  MetricServiceAdapter,
  MetricViewSelection,
  ResolveMetricTargetInput,
  ResolvedMetricDashboard,
  ResolvedMetricPanel,
  ResolvedMetricQuery,
  ResolvedMetricTarget,
} from '../../../../../types';
import { CloudWatchMetricsAvailability } from '../../cloudwatch';

const PROVIDER_ID = 'aws.s3.bucket';
const NAMESPACE = 'AWS/S3';
const REQUEST_PREREQUISITE_KEY = 's3-request-metrics';
const REQUEST_VERIFICATION_KEY = 's3-request-metrics-verification';
export const S3_REQUEST_FILTER_SELECTOR_ID = 's3-request-filter';

const STORAGE_COST = {
  publication: 'included' as const,
  read: 'get-metric-data' as const,
  note: 'Daily S3 storage metric publication is included; CloudWatch API read charges are separate.',
};
const REQUEST_COST = {
  publication: 'service-option' as const,
  read: 'get-metric-data' as const,
  note: 'S3 request metric publication and CloudWatch API reads can incur charges.',
};
const FALLBACK_STORAGE_TYPES = [
  'StandardStorage',
  'StandardIAStorage',
  'OneZoneIAStorage',
  'IntelligentTieringFAStorage',
  'GlacierInstantRetrievalStorage',
  'GlacierStorage',
  'DeepArchiveStorage',
  'ReducedRedundancyStorage',
] as const;

type S3Sender = Pick<S3Client, 'send'>;

export type S3MetricServiceAdapterOptions = {
  getS3Client(endpoint: MetricEndpoint): S3Sender;
  getAvailability(endpoint: MetricEndpoint): CloudWatchMetricsAvailability;
};

type S3MetricFilter = {
  id: string;
  description: string;
};

type RequestMetricResolution = {
  configurations: S3MetricFilter[];
  prerequisite: MetricPrerequisiteResult;
  verification?: MetricPrerequisiteResult;
};

function isAccessDenied(error: unknown): boolean {
  const name = error instanceof Error ? error.name : '';
  return [
    'AccessDenied',
    'AccessDeniedException',
    'Forbidden',
    'ForbiddenException',
  ].includes(name);
}

function bucketRegionFromError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const response = (error as { $response?: { headers?: unknown } }).$response;
  const headers = response?.headers;
  if (!headers || typeof headers !== 'object') return undefined;
  const record = headers as Record<string, unknown>;
  const value = record['x-amz-bucket-region'] ?? record['X-Amz-Bucket-Region'];
  return typeof value === 'string' && value ? value : undefined;
}

function describeTag(tag: { Key?: string; Value?: string }): string {
  return `${tag.Key ?? '?'}=${tag.Value ?? '?'}`;
}

function describeFilter(filter: MetricsFilter | undefined): string {
  if (!filter) return 'Entire bucket';
  if ('Prefix' in filter && filter.Prefix !== undefined) {
    return `Prefix: ${filter.Prefix}`;
  }
  if ('Tag' in filter && filter.Tag) {
    return `Tag: ${describeTag(filter.Tag)}`;
  }
  if ('AccessPointArn' in filter && filter.AccessPointArn) {
    return `Access point: ${filter.AccessPointArn}`;
  }
  if ('And' in filter && filter.And) {
    return [
      filter.And.Prefix !== undefined
        ? `Prefix: ${filter.And.Prefix}`
        : undefined,
      ...(filter.And.Tags ?? []).map((tag) => `Tag: ${describeTag(tag)}`),
      filter.And.AccessPointArn
        ? `Access point: ${filter.And.AccessPointArn}`
        : undefined,
    ]
      .filter((item): item is string => item !== undefined)
      .join(' AND ');
  }
  return 'Configured filter';
}

function toFilters(
  configurations: readonly MetricsConfiguration[],
): S3MetricFilter[] {
  const seen = new Set<string>();
  return configurations.flatMap((configuration) => {
    const id = configuration.Id;
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ id, description: describeFilter(configuration.Filter) }];
  });
}

function storageTypeLabel(storageType: string): string {
  return storageType
    .replace(/Storage$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/IA/g, 'IA');
}

function query(input: {
  id: string;
  metricName: string;
  statistic: ResolvedMetricQuery['statistic'];
  label: string;
  unit: ResolvedMetricQuery['unit'];
  nativePeriodSeconds: number;
  dimensions: ResolvedMetricQuery['dimensions'];
}): ResolvedMetricQuery {
  return {
    ...input,
    namespace: NAMESPACE,
  };
}

function storagePanels(
  bucketName: string,
  storageTypes: readonly string[],
): ResolvedMetricPanel[] {
  return [
    {
      id: 'bucket-size',
      title: 'Bucket size by storage type',
      purpose: 'capacity',
      visualization: 'line',
      emission: 'default',
      scope: { kind: 'dimension-group', label: `Bucket ${bucketName}` },
      cost: STORAGE_COST,
      queries: storageTypes.map((storageType, index) =>
        query({
          id: `bucket_size_${index}`,
          metricName: 'BucketSizeBytes',
          statistic: 'Average',
          label: storageTypeLabel(storageType),
          unit: 'bytes',
          nativePeriodSeconds: 86_400,
          dimensions: [
            { Name: 'BucketName', Value: bucketName },
            { Name: 'StorageType', Value: storageType },
          ],
        }),
      ),
      emptyHint:
        'S3 publishes storage metrics once per day. A newly created bucket can take time to produce its first datapoint.',
    },
    {
      id: 'object-count',
      title: 'Object count',
      purpose: 'capacity',
      visualization: 'line',
      emission: 'default',
      scope: { kind: 'resource', label: `Bucket ${bucketName}` },
      cost: STORAGE_COST,
      queries: [
        query({
          id: 'number_of_objects',
          metricName: 'NumberOfObjects',
          statistic: 'Average',
          label: 'Objects',
          unit: 'count',
          nativePeriodSeconds: 86_400,
          dimensions: [
            { Name: 'BucketName', Value: bucketName },
            { Name: 'StorageType', Value: 'AllStorageTypes' },
          ],
        }),
      ],
      caveat:
        'The daily count includes current and noncurrent objects, delete markers, and incomplete multipart upload parts.',
    },
  ];
}

function requestDimensions(
  bucketName: string,
  filterId: string,
): MetricDimension[] {
  return [
    { Name: 'BucketName', Value: bucketName },
    { Name: 'FilterId', Value: filterId },
  ];
}

function requestPanels(
  bucketName: string,
  selectedFilter: S3MetricFilter | undefined,
  includeVerificationPanel: boolean,
): ResolvedMetricPanel[] {
  const filterId = selectedFilter?.id;
  const dimensions = filterId ? requestDimensions(bucketName, filterId) : [];
  const metric = (
    id: string,
    metricName: string,
    statistic: ResolvedMetricQuery['statistic'],
    label: string,
    unit: ResolvedMetricQuery['unit'],
  ): ResolvedMetricQuery[] =>
    filterId
      ? [
          query({
            id,
            metricName,
            statistic,
            label,
            unit,
            nativePeriodSeconds: 60,
            dimensions,
          }),
        ]
      : [];
  const scopeLabel = selectedFilter
    ? `${bucketName} / ${selectedFilter.id}`
    : `Bucket ${bucketName}`;
  const panels: ResolvedMetricPanel[] = [
    {
      id: 'request-counts',
      title: 'Requests by operation',
      purpose: 'workload',
      visualization: 'line',
      emission: 'opt-in',
      scope: { kind: 'configured-filter', label: scopeLabel },
      cost: REQUEST_COST,
      queries: [
        ...metric('get_requests', 'GetRequests', 'Sum', 'GET', 'count'),
        ...metric('put_requests', 'PutRequests', 'Sum', 'PUT', 'count'),
        ...metric(
          'delete_requests',
          'DeleteRequests',
          'Sum',
          'DELETE',
          'count',
        ),
        ...metric('list_requests', 'ListRequests', 'Sum', 'LIST', 'count'),
      ],
      prerequisiteKey: REQUEST_PREREQUISITE_KEY,
      emptyHint:
        'Request metrics are best effort. No datapoints does not prove that no requests occurred.',
      caveat:
        'Values apply only to the selected metrics configuration. Overlapping filters are not combined.',
    },
    {
      id: 'request-errors',
      title: 'Request errors',
      purpose: 'health',
      visualization: 'line',
      emission: 'opt-in',
      scope: { kind: 'configured-filter', label: scopeLabel },
      cost: REQUEST_COST,
      queries: [
        ...metric('errors_4xx', '4xxErrors', 'Sum', '4xx errors', 'count'),
        ...metric('errors_5xx', '5xxErrors', 'Sum', '5xx errors', 'count'),
      ],
      prerequisiteKey: REQUEST_PREREQUISITE_KEY,
    },
    {
      id: 'request-latency',
      title: 'Request latency',
      purpose: 'health',
      visualization: 'line',
      emission: 'opt-in',
      scope: { kind: 'configured-filter', label: scopeLabel },
      cost: REQUEST_COST,
      queries: [
        ...metric(
          'first_byte_average',
          'FirstByteLatency',
          'Average',
          'First byte average',
          'milliseconds',
        ),
        ...metric(
          'first_byte_p90',
          'FirstByteLatency',
          'p90',
          'First byte p90',
          'milliseconds',
        ),
        ...metric(
          'total_latency_average',
          'TotalRequestLatency',
          'Average',
          'Total average',
          'milliseconds',
        ),
        ...metric(
          'total_latency_p90',
          'TotalRequestLatency',
          'p90',
          'Total p90',
          'milliseconds',
        ),
      ],
      prerequisiteKey: REQUEST_PREREQUISITE_KEY,
    },
    {
      id: 'request-bytes',
      title: 'Transferred bytes',
      purpose: 'workload',
      visualization: 'line',
      emission: 'opt-in',
      scope: { kind: 'configured-filter', label: scopeLabel },
      cost: REQUEST_COST,
      queries: [
        ...metric(
          'bytes_downloaded',
          'BytesDownloaded',
          'Sum',
          'Downloaded',
          'bytes',
        ),
        ...metric(
          'bytes_uploaded',
          'BytesUploaded',
          'Sum',
          'Uploaded',
          'bytes',
        ),
      ],
      prerequisiteKey: REQUEST_PREREQUISITE_KEY,
    },
  ];
  if (includeVerificationPanel) {
    panels.unshift({
      id: 'request-configuration-verification',
      title: 'Request metrics configuration',
      purpose: 'configuration',
      visualization: 'line',
      emission: 'opt-in',
      scope: { kind: 'configured-filter', label: scopeLabel },
      cost: REQUEST_COST,
      queries: [],
      prerequisiteKey: REQUEST_VERIFICATION_KEY,
    });
  }
  return panels;
}

export class S3MetricServiceAdapter implements MetricServiceAdapter {
  readonly providerId = PROVIDER_ID;

  constructor(private readonly options: S3MetricServiceAdapterOptions) {}

  private async resolveBucketRegion(
    input: ResolveMetricTargetInput,
  ): Promise<string> {
    const attributeRegion = input.attributes?.region;
    if (typeof attributeRegion === 'string' && attributeRegion) {
      return attributeRegion;
    }
    if (!input.region) {
      throw new Error('S3 bucket region is unavailable.');
    }
    const discoveryEndpoint: MetricEndpoint = {
      region: input.region,
      endpoint: input.endpoint,
      scope: 'regional',
    };
    try {
      const output = (await this.options
        .getS3Client(discoveryEndpoint)
        .send(new HeadBucketCommand({ Bucket: input.displayName }), {
          abortSignal: input.signal,
        })) as HeadBucketCommandOutput;
      if (output.BucketRegion) return output.BucketRegion;
    } catch (error) {
      const responseRegion = bucketRegionFromError(error);
      if (responseRegion) return responseRegion;
      throw new Error(
        'S3 bucket region could not be resolved with HeadBucket.',
      );
    }
    throw new Error('S3 bucket region could not be resolved with HeadBucket.');
  }

  private async discoverDimensionValues(
    endpoint: MetricEndpoint,
    bucketName: string,
    metricName: string,
    dimensionName: string,
    signal?: AbortSignal,
  ): Promise<string[]> {
    try {
      return await this.options
        .getAvailability(endpoint)
        .discoverDimensionValues({
          namespace: NAMESPACE,
          metricName,
          matchingDimensions: [{ Name: 'BucketName', Value: bucketName }],
          dimensionName,
          signal,
        });
    } catch (error) {
      if (signal?.aborted) throw error;
      return [];
    }
  }

  private async resolveRequestMetrics(
    endpoint: MetricEndpoint,
    bucketName: string,
    signal?: AbortSignal,
  ): Promise<RequestMetricResolution> {
    try {
      const configurations: MetricsConfiguration[] = [];
      let continuationToken: string | undefined;
      do {
        const output = await this.options.getS3Client(endpoint).send(
          new ListBucketMetricsConfigurationsCommand({
            Bucket: bucketName,
            ContinuationToken: continuationToken,
          }),
          { abortSignal: signal },
        );
        configurations.push(...(output.MetricsConfigurationList ?? []));
        continuationToken = output.NextContinuationToken;
      } while (continuationToken);
      const filters = toFilters(configurations);
      return filters.length > 0
        ? { configurations: filters, prerequisite: { status: 'configured' } }
        : {
            configurations: [],
            prerequisite: {
              status: 'not-configured',
              enablement: {
                title: 'S3 request metrics are not enabled',
                steps: [
                  'Create an S3 metrics configuration for the whole bucket or the prefix, tag, or access point you want to inspect.',
                ],
                documentationUrl:
                  'https://docs.aws.amazon.com/AmazonS3/latest/userguide/configure-request-metrics-bucket.html',
                costNotice:
                  'S3 request metric publication and CloudWatch API reads can incur charges.',
              },
            },
          };
    } catch (error) {
      if (signal?.aborted) throw error;
      const observedFilterIds = await this.discoverDimensionValues(
        endpoint,
        bucketName,
        'AllRequests',
        'FilterId',
        signal,
      );
      const unknown: MetricPrerequisiteResult = {
        status: 'unknown',
        requiredPermissions: ['s3:GetMetricsConfiguration'],
        message: isAccessDenied(error)
          ? 'S3 metrics configurations could not be listed because access was denied.'
          : 'S3 metrics configurations could not be verified.',
      };
      return observedFilterIds.length > 0
        ? {
            configurations: observedFilterIds.map((id) => ({
              id,
              description: 'Recently observed CloudWatch metric',
            })),
            prerequisite: { status: 'configured' },
            verification: unknown,
          }
        : { configurations: [], prerequisite: unknown };
    }
  }

  async resolveTarget(
    input: ResolveMetricTargetInput,
  ): Promise<ResolvedMetricTarget> {
    const region = await this.resolveBucketRegion(input);
    const endpoint: MetricEndpoint = {
      region,
      endpoint: input.endpoint,
      scope: 'regional',
    };
    const [observedStorageTypes, requestMetrics] = await Promise.all([
      this.discoverDimensionValues(
        endpoint,
        input.displayName,
        'BucketSizeBytes',
        'StorageType',
        input.signal,
      ),
      this.resolveRequestMetrics(endpoint, input.displayName, input.signal),
    ]);
    return {
      providerId: this.providerId,
      variant: 'bucket',
      endpoint,
      defaultNamespace: NAMESPACE,
      identity: {
        resourceKey: input.resourceKey,
        displayName: input.displayName,
        scopeLabel: `Bucket ${input.displayName}`,
        dimensionIdentity: input.displayName,
      },
      attributes: {
        bucketName: input.displayName,
        storageTypes:
          observedStorageTypes.length > 0
            ? observedStorageTypes
            : [...FALLBACK_STORAGE_TYPES],
        requestMetricConfigurations: requestMetrics.configurations,
        requestMetricPrerequisite: requestMetrics.prerequisite,
        requestMetricVerification: requestMetrics.verification,
      },
    };
  }

  async resolveDashboard(
    target: ResolvedMetricTarget,
    selection: MetricViewSelection,
  ): Promise<ResolvedMetricDashboard> {
    if (target.providerId !== this.providerId) {
      throw new Error(
        `S3 adapter cannot resolve providerId: ${target.providerId}`,
      );
    }
    const bucketName = String(target.attributes.bucketName);
    const storageTypes = target.attributes.storageTypes as string[];
    const configurations = target.attributes
      .requestMetricConfigurations as S3MetricFilter[];
    const selectedId = selection[S3_REQUEST_FILTER_SELECTOR_ID];
    const selectedFilter =
      configurations.find((item) => item.id === selectedId) ??
      configurations[0];
    const requestPrerequisite = target.attributes
      .requestMetricPrerequisite as MetricPrerequisiteResult;
    const verification = target.attributes.requestMetricVerification as
      | MetricPrerequisiteResult
      | undefined;
    return {
      providerId: this.providerId,
      variant: target.variant,
      target: target.identity,
      tabs: [
        {
          id: 'storage',
          title: 'Storage (daily)',
          defaultRange: '30d',
          autoRefreshAllowed: false,
          selectors: [],
          panels: storagePanels(bucketName, storageTypes),
        },
        {
          id: 'requests',
          title: 'Requests',
          defaultRange: '1h',
          autoRefreshAllowed: true,
          selectors:
            configurations.length > 0
              ? [
                  {
                    id: S3_REQUEST_FILTER_SELECTOR_ID,
                    label: 'Metrics configuration',
                    value: selectedFilter.id,
                    options: configurations.map((item) => ({
                      value: item.id,
                      label: item.id,
                      description: item.description,
                    })),
                  },
                ]
              : [],
          panels: requestPanels(
            bucketName,
            selectedFilter,
            verification?.status === 'unknown',
          ),
        },
      ],
      prerequisites: {
        [REQUEST_PREREQUISITE_KEY]: requestPrerequisite,
        ...(verification ? { [REQUEST_VERIFICATION_KEY]: verification } : {}),
      },
    };
  }

  async probePrerequisites(
    target: ResolvedMetricTarget,
    panel: ResolvedMetricPanel,
  ): Promise<MetricPrerequisiteResult> {
    if (panel.prerequisiteKey === REQUEST_VERIFICATION_KEY) {
      return (
        (target.attributes
          .requestMetricVerification as MetricPrerequisiteResult) ?? {
          status: 'configured',
        }
      );
    }
    if (panel.prerequisiteKey === REQUEST_PREREQUISITE_KEY) {
      return target.attributes
        .requestMetricPrerequisite as MetricPrerequisiteResult;
    }
    return { status: 'configured' };
  }
}
