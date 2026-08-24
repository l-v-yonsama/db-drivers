import { CloudWatchClient, GetMetricDataCommand, MetricDataQuery } from '@aws-sdk/client-cloudwatch';
import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  DynamoDbCloudWatchContext,
  DynamoDbCloudWatchSeries,
} from '../../../types/drivers/performance/DynamoDbPerformanceTuningContext';

// See db-notebook repo's
// misc/specs/dynamodb-performance-tuning-implementation-plan.ja.md §7.3.
// Deliberately its own client/module, separate from AwsCloudwatchServiceClient
// (which only ever talks to CloudWatch Logs, not Metrics) - this is the
// first use of @aws-sdk/client-cloudwatch in this package.
//
// Every metric this file requests is either table/GSI-scoped or
// operation-scoped (§7.3's table); LSI never gets its own CloudWatch
// dimension at all - AWS reports LSI throughput under the base table's
// capacity metrics, since an LSI always shares the table's provisioned
// throughput.

const NAMESPACE = 'AWS/DynamoDB';
const DEFAULT_LOOKBACK_MINUTES = 60;
const MAX_LOOKBACK_MINUTES = 1440; // 24h - a generous cap, not specified exactly by the design doc
const DEFAULT_PERIOD_SECONDS = 60;
const MIN_PERIOD_SECONDS = 60;
const MAX_PERIOD_SECONDS = 3600;

// CloudWatch metric names this file reads, exactly as AWS publishes them
// (see "DynamoDB metrics and dimensions" in the design doc's §20 references).
const TABLE_OR_GSI_THROTTLE_METRICS = [
  'ReadThrottleEvents',
  'ReadKeyRangeThroughputThrottleEvents',
  'ReadProvisionedThroughputThrottleEvents',
  'ReadAccountLimitThrottleEvents',
  'ReadMaxOnDemandThroughputThrottleEvents',
] as const;

const OPERATION_SUM_METRICS = ['ThrottledRequests', 'SystemErrors', 'ReturnedItemCount', 'ReturnedBytes'] as const;
const LATENCY_PERCENTILES = ['p50', 'p90', 'p99'] as const;

export type DynamoDbCloudWatchMetricsInput = {
  tableName: string;
  // Only meaningful together with indexType: 'GSI' - an LSI never gets its
  // own gsi-scoped query block (see the module comment above).
  indexName?: string;
  indexType?: 'LSI' | 'GSI';
  operation: 'Query' | 'Scan' | 'ExecuteStatement';
  billingMode: 'PROVISIONED' | 'PAY_PER_REQUEST' | 'unknown';
  hasOnDemandMaxLimit: boolean;
  lookbackMinutes?: number;
  periodSeconds?: number;
  // Collection start time, injected so tests get deterministic windows
  // instead of depending on wall-clock `Date.now()`.
  now?: Date;
  signal?: AbortSignal;
};

type SeriesSpec = {
  id: string;
  metricName: string;
  // Same string is both the CloudWatch Stat sent to the API and the
  // series.statistic reported back - GetMetricData's `Stat` field already
  // accepts 'Sum'/'Average'/... and 'p50'/'p90'/'p99' interchangeably, so
  // there is nothing to translate between "send" and "display" forms.
  statistic: string;
  scope: 'table' | 'gsi' | 'operation';
  indexName?: string;
  operation?: 'Query' | 'Scan' | 'ExecuteStatement';
  dimensions: Array<{ Name: string; Value: string }>;
};

function clamp(value: number | undefined, fallback: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function tableScopeDimensions(tableName: string): Array<{ Name: string; Value: string }> {
  return [{ Name: 'TableName', Value: tableName }];
}

function gsiScopeDimensions(tableName: string, indexName: string): Array<{ Name: string; Value: string }> {
  return [
    { Name: 'TableName', Value: tableName },
    { Name: 'GlobalSecondaryIndexName', Value: indexName },
  ];
}

// PartiQL's operation dimension is Operation=ExecuteStatement plus a
// separate Verb=PartiQLSelect dimension on the same metric - both required
// together, per the design doc's §7.3 table.
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
    specs.push({ id: nextId(), metricName: 'ConsumedReadCapacityUnits', statistic: 'Sum', scope, indexName, dimensions });
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
      specs.push({ id: nextId(), metricName, statistic: 'Sum', scope, indexName, dimensions });
    }
  };

  addCapacityScope('table', tableScopeDimensions(input.tableName), undefined);
  if (input.indexName && input.indexType === 'GSI') {
    addCapacityScope('gsi', gsiScopeDimensions(input.tableName, input.indexName), input.indexName);
  }

  const opDimensions = operationScopeDimensions(input.tableName, input.operation);
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

function toMetricDataQuery(spec: SeriesSpec, periodSeconds: number): MetricDataQuery {
  return {
    Id: spec.id,
    MetricStat: {
      Metric: { Namespace: NAMESPACE, MetricName: spec.metricName, Dimensions: spec.dimensions },
      Period: periodSeconds,
      Stat: spec.statistic,
    },
    ReturnData: true,
  };
}

// Public API boundary error handling (§9): never surface credential,
// endpoint, or request-body detail from an AWS SDK exception.
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

  async collect(input: DynamoDbCloudWatchMetricsInput): Promise<GeneralResult<DynamoDbCloudWatchContext>> {
    const periodSeconds = clamp(input.periodSeconds, DEFAULT_PERIOD_SECONDS, MIN_PERIOD_SECONDS, MAX_PERIOD_SECONDS);
    const lookbackMinutes = clamp(input.lookbackMinutes, DEFAULT_LOOKBACK_MINUTES, 1, MAX_LOOKBACK_MINUTES);
    const endTime = input.now ?? new Date();
    const startTime = new Date(endTime.getTime() - lookbackMinutes * 60_000);

    const specs = buildSeriesSpecs(input);

    try {
      const resultsById = new Map<string, { timestamps: Date[]; values: number[] }>();
      let nextToken: string | undefined;
      do {
        const response = await this.client.send(
          new GetMetricDataCommand({
            MetricDataQueries: specs.map((spec) => toMetricDataQuery(spec, periodSeconds)),
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
          const existing = resultsById.get(result.Id) ?? { timestamps: [], values: [] };
          existing.timestamps.push(...(result.Timestamps ?? []));
          existing.values.push(...(result.Values ?? []));
          resultsById.set(result.Id, existing);
        }
      } while (nextToken);

      const series: DynamoDbCloudWatchSeries[] = specs.map((spec) => {
        const raw = resultsById.get(spec.id);
        // Defensive sort even though ScanBy: 'TimestampAscending' is
        // requested - the Context validator (§6.5) requires ascending
        // order unconditionally, and this is cheap insurance against any
        // API/mock quirk rather than trusting the request parameter alone.
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
          // A response with zero datapoints is not the same fact as "0
          // activity" (§7.3) - callers must check this before reading
          // `values` as zeros.
          noData: pairs.length === 0,
          source: 'AWS/DynamoDB',
        };
      });

      return {
        ok: true,
        message: '',
        result: {
          window: { startTime: startTime.toISOString(), endTime: endTime.toISOString(), periodSeconds },
          series,
        },
      };
    } catch (e) {
      return { ok: false, message: describeCloudWatchError(e) };
    }
  }
}
