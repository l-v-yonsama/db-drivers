import {
  CloudWatchClient,
  GetMetricDataCommand,
  MetricDataQuery,
} from '@aws-sdk/client-cloudwatch';
import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  DynamoDbCloudWatchContext,
  DynamoDbCloudWatchSeries,
} from '../../../types/drivers/performance/DynamoDbPerformanceTuningContext';

// DynamoDB metrics are table/GSI/operation scoped; LSIs share the table scope.

const NAMESPACE = 'AWS/DynamoDB';
const DEFAULT_LOOKBACK_MINUTES = 60;
const MAX_LOOKBACK_MINUTES = 1440;
const DEFAULT_PERIOD_SECONDS = 60;
const MIN_PERIOD_SECONDS = 60;
const MAX_PERIOD_SECONDS = 3600;

const TABLE_OR_GSI_THROTTLE_METRICS = [
  'ReadThrottleEvents',
  'ReadKeyRangeThroughputThrottleEvents',
  'ReadProvisionedThroughputThrottleEvents',
  'ReadAccountLimitThrottleEvents',
  'ReadMaxOnDemandThroughputThrottleEvents',
] as const;

// ReturnedBytes applies to Streams GetRecords, not these read operations.
const OPERATION_SUM_METRICS = [
  'ThrottledRequests',
  'SystemErrors',
  'ReturnedItemCount',
] as const;
const LATENCY_PERCENTILES = ['p50', 'p90', 'p99'] as const;

export type DynamoDbCloudWatchMetricsInput = {
  tableName: string;
  indexName?: string;
  indexType?: 'LSI' | 'GSI';
  operation: 'Query' | 'Scan' | 'ExecuteStatement';
  billingMode: 'PROVISIONED' | 'PAY_PER_REQUEST' | 'unknown';
  hasOnDemandMaxLimit: boolean;
  lookbackMinutes?: number;
  periodSeconds?: number;
  // Injectable for deterministic collection windows.
  now?: Date;
  signal?: AbortSignal;
};

type SeriesSpec = {
  id: string;
  metricName: string;
  statistic: string;
  scope: 'table' | 'gsi' | 'operation';
  indexName?: string;
  operation?: 'Query' | 'Scan' | 'ExecuteStatement';
  dimensions: Array<{ Name: string; Value: string }>;
};

function clamp(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function tableScopeDimensions(
  tableName: string,
): Array<{ Name: string; Value: string }> {
  return [{ Name: 'TableName', Value: tableName }];
}

function gsiScopeDimensions(
  tableName: string,
  indexName: string,
): Array<{ Name: string; Value: string }> {
  return [
    { Name: 'TableName', Value: tableName },
    { Name: 'GlobalSecondaryIndexName', Value: indexName },
  ];
}

// PartiQL SELECT metrics require both the operation and verb dimensions.
function operationScopeDimensions(
  tableName: string,
  operation: 'Query' | 'Scan' | 'ExecuteStatement',
): Array<{ Name: string; Value: string }> {
  const dims = [
    { Name: 'TableName', Value: tableName },
    { Name: 'Operation', Value: operation },
  ];
  if (operation === 'ExecuteStatement') {
    dims.push({ Name: 'Verb', Value: 'PartiQLSelect' });
  }
  return dims;
}

function buildSeriesSpecs(input: DynamoDbCloudWatchMetricsInput): SeriesSpec[] {
  const specs: SeriesSpec[] = [];
  let idCounter = 0;
  const nextId = (): string => `m${idCounter++}`;

  const addCapacityScope = (
    scope: 'table' | 'gsi',
    dimensions: Array<{ Name: string; Value: string }>,
    indexName: string | undefined,
  ): void => {
    specs.push({
      id: nextId(),
      metricName: 'ConsumedReadCapacityUnits',
      statistic: 'Sum',
      scope,
      indexName,
      dimensions,
    });
    if (input.billingMode === 'PROVISIONED') {
      specs.push({
        id: nextId(),
        metricName: 'ProvisionedReadCapacityUnits',
        statistic: 'Average',
        scope,
        indexName,
        dimensions,
      });
    }
    if (input.hasOnDemandMaxLimit) {
      specs.push({
        id: nextId(),
        metricName: 'OnDemandMaxReadRequestUnits',
        statistic: 'Average',
        scope,
        indexName,
        dimensions,
      });
    }
    for (const metricName of TABLE_OR_GSI_THROTTLE_METRICS) {
      specs.push({
        id: nextId(),
        metricName,
        statistic: 'Sum',
        scope,
        indexName,
        dimensions,
      });
    }
  };

  addCapacityScope('table', tableScopeDimensions(input.tableName), undefined);
  if (input.indexName && input.indexType === 'GSI') {
    addCapacityScope(
      'gsi',
      gsiScopeDimensions(input.tableName, input.indexName),
      input.indexName,
    );
  }

  const opDimensions = operationScopeDimensions(
    input.tableName,
    input.operation,
  );
  for (const statistic of LATENCY_PERCENTILES) {
    specs.push({
      id: nextId(),
      metricName: 'SuccessfulRequestLatency',
      statistic,
      scope: 'operation',
      operation: input.operation,
      dimensions: opDimensions,
    });
  }
  for (const metricName of OPERATION_SUM_METRICS) {
    specs.push({
      id: nextId(),
      metricName,
      statistic: 'Sum',
      scope: 'operation',
      operation: input.operation,
      dimensions: opDimensions,
    });
  }

  return specs;
}

function toMetricDataQuery(
  spec: SeriesSpec,
  periodSeconds: number,
): MetricDataQuery {
  return {
    Id: spec.id,
    MetricStat: {
      Metric: {
        Namespace: NAMESPACE,
        MetricName: spec.metricName,
        Dimensions: spec.dimensions,
      },
      Period: periodSeconds,
      Stat: spec.statistic,
    },
    ReturnData: true,
  };
}

// Avoid exposing credential, endpoint, or request details from SDK errors.
function describeCloudWatchError(e: unknown): string {
  const name = e instanceof Error ? e.name : undefined;
  switch (name) {
    case 'AccessDeniedException':
      return 'CloudWatch metrics are unavailable: the connection is not authorized for cloudwatch:GetMetricData.';
    case 'ThrottlingException':
      return 'CloudWatch metrics collection was throttled.';
    default:
      return 'CloudWatch metrics collection failed.';
  }
}

export class DynamoDbCloudWatchMetricsCollector {
  constructor(private readonly client: CloudWatchClient) {}

  async collect(
    input: DynamoDbCloudWatchMetricsInput,
  ): Promise<GeneralResult<DynamoDbCloudWatchContext>> {
    const periodSeconds = clamp(
      input.periodSeconds,
      DEFAULT_PERIOD_SECONDS,
      MIN_PERIOD_SECONDS,
      MAX_PERIOD_SECONDS,
    );
    const lookbackMinutes = clamp(
      input.lookbackMinutes,
      DEFAULT_LOOKBACK_MINUTES,
      1,
      MAX_LOOKBACK_MINUTES,
    );
    const endTime = input.now ?? new Date();
    const startTime = new Date(endTime.getTime() - lookbackMinutes * 60_000);

    const specs = buildSeriesSpecs(input);

    try {
      const resultsById = new Map<
        string,
        { timestamps: Date[]; values: number[] }
      >();
      let nextToken: string | undefined;
      do {
        const response = await this.client.send(
          new GetMetricDataCommand({
            MetricDataQueries: specs.map((spec) =>
              toMetricDataQuery(spec, periodSeconds),
            ),
            StartTime: startTime,
            EndTime: endTime,
            NextToken: nextToken,
            ScanBy: 'TimestampAscending',
          }),
          { abortSignal: input.signal },
        );
        nextToken = response.NextToken;
        for (const result of response.MetricDataResults ?? []) {
          if (!result.Id) continue;
          const existing = resultsById.get(result.Id) ?? {
            timestamps: [],
            values: [],
          };
          existing.timestamps.push(...(result.Timestamps ?? []));
          existing.values.push(...(result.Values ?? []));
          resultsById.set(result.Id, existing);
        }
      } while (nextToken);

      const series: DynamoDbCloudWatchSeries[] = specs.map((spec) => {
        const raw = resultsById.get(spec.id);
        // Keep output stable even if the API or a mock ignores ScanBy.
        const pairs = (raw?.timestamps ?? [])
          .map((t, i) => ({ t, v: raw!.values[i] }))
          .sort((a, b) => a.t.getTime() - b.t.getTime());

        return {
          metricName: spec.metricName,
          statistic: spec.statistic,
          scope: spec.scope,
          indexName: spec.indexName,
          operation: spec.operation,
          timestamps: pairs.map((p) => p.t.toISOString()),
          values: pairs.map((p) => p.v),
          // No datapoints means missing data, not measured zero activity.
          noData: pairs.length === 0,
          source: 'AWS/DynamoDB',
        };
      });

      return {
        ok: true,
        message: '',
        result: {
          window: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            periodSeconds,
          },
          series,
        },
      };
    } catch (e) {
      return { ok: false, message: describeCloudWatchError(e) };
    }
  }
}
