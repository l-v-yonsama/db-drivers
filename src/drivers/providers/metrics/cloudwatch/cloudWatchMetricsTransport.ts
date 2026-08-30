import {
  CloudWatchClient,
  GetMetricDataCommand,
  MessageData,
  MetricDataQuery,
  MetricDataResult,
} from '@aws-sdk/client-cloudwatch';
import {
  MetricSeries,
  MetricSeriesStatus,
  ResolvedMetricQuery,
} from '../../../../types';

const MAX_QUERIES_PER_REQUEST = 500;
const MAX_DATA_POINTS_PER_REQUEST = 100_800;

export type CloudWatchMetricsTransportInput = {
  queries: ResolvedMetricQuery[];
  startTime: Date;
  endTime: Date;
  periodSeconds: number;
  signal?: AbortSignal;
};

type CloudWatchSender = Pick<CloudWatchClient, 'send'>;

type SeriesAccumulator = {
  query: ResolvedMetricQuery;
  points: Map<string, number>;
  status?: MetricSeriesStatus;
  messages: Array<{ code?: string; value?: string }>;
};

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  return (
    signal?.aborted === true ||
    (error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'CanceledError'))
  );
}

function statusRank(status: MetricSeriesStatus): number {
  switch (status) {
    case 'failed':
      return 6;
    case 'forbidden':
      return 5;
    case 'unavailable':
      return 4;
    case 'partial':
      return 3;
    case 'no-data':
      return 2;
    case 'complete':
      return 1;
  }
}

function mergeStatus(
  current: MetricSeriesStatus | undefined,
  next: MetricSeriesStatus,
): MetricSeriesStatus {
  if (!current || statusRank(next) > statusRank(current)) {
    return next;
  }
  return current;
}

function mapResultStatus(result: MetricDataResult): MetricSeriesStatus {
  switch (result.StatusCode) {
    case 'PartialData':
      return 'partial';
    case 'InternalError':
      return 'failed';
    case 'Forbidden':
      return 'forbidden';
    case 'Complete':
    default:
      return (result.Timestamps?.length ?? 0) > 0 ? 'complete' : 'no-data';
  }
}

function mapRequestError(error: unknown): MetricSeriesStatus {
  const name = error instanceof Error ? error.name : '';
  if (name === 'AccessDeniedException' || name === 'ForbiddenException') {
    return 'forbidden';
  }
  if (
    name === 'ValidationException' ||
    name === 'UnknownEndpoint' ||
    name === 'NetworkingError' ||
    name === 'TimeoutError'
  ) {
    return 'unavailable';
  }
  return 'failed';
}

function sanitizedErrorMessage(error: unknown): {
  code?: string;
  value?: string;
} {
  const name = error instanceof Error ? error.name : undefined;
  return {
    code: name,
    value:
      mapRequestError(error) === 'forbidden'
        ? 'CloudWatch metrics access was denied.'
        : mapRequestError(error) === 'unavailable'
        ? 'The CloudWatch metrics endpoint is unavailable or incompatible.'
        : 'CloudWatch metrics collection failed.',
  };
}

function toMessage(message: MessageData): { code?: string; value?: string } {
  return { code: message.Code, value: message.Value };
}

function toMetricDataQuery(
  query: ResolvedMetricQuery,
  periodSeconds: number,
): MetricDataQuery {
  return {
    Id: query.id,
    Label: query.label,
    ReturnData: true,
    MetricStat: {
      Metric: {
        Namespace: query.namespace,
        MetricName: query.metricName,
        Dimensions: query.dimensions,
      },
      Period: Math.max(periodSeconds, query.nativePeriodSeconds),
      Stat: query.statistic,
    },
  };
}

export function getCloudWatchQueryBatchSize(input: {
  startTime: Date;
  endTime: Date;
  periodSeconds: number;
}): number {
  const durationSeconds = Math.max(
    0,
    Math.ceil((input.endTime.getTime() - input.startTime.getTime()) / 1000),
  );
  const pointsPerQuery = Math.max(
    1,
    Math.ceil(durationSeconds / Math.max(1, input.periodSeconds)) + 1,
  );
  return Math.max(
    1,
    Math.min(
      MAX_QUERIES_PER_REQUEST,
      Math.floor(MAX_DATA_POINTS_PER_REQUEST / pointsPerQuery),
    ),
  );
}

export class CloudWatchMetricsTransport {
  constructor(private readonly client: CloudWatchSender) {}

  async collect(
    input: CloudWatchMetricsTransportInput,
  ): Promise<MetricSeries[]> {
    const ids = new Set<string>();
    for (const query of input.queries) {
      if (ids.has(query.id)) {
        throw new Error(`Duplicate metric query id: ${query.id}`);
      }
      ids.add(query.id);
    }

    const accumulators = new Map<string, SeriesAccumulator>(
      input.queries.map((query) => [
        query.id,
        { query, points: new Map(), messages: [] },
      ]),
    );
    const batchSize = getCloudWatchQueryBatchSize(input);

    for (let offset = 0; offset < input.queries.length; offset += batchSize) {
      const batch = input.queries.slice(offset, offset + batchSize);
      try {
        let nextToken: string | undefined;
        do {
          const response = await this.client.send(
            new GetMetricDataCommand({
              MetricDataQueries: batch.map((query) =>
                toMetricDataQuery(query, input.periodSeconds),
              ),
              StartTime: input.startTime,
              EndTime: input.endTime,
              NextToken: nextToken,
              ScanBy: 'TimestampAscending',
            }),
            { abortSignal: input.signal },
          );
          nextToken = response.NextToken;
          const requestMessages = (response.Messages ?? []).map(toMessage);
          for (const query of batch) {
            accumulators.get(query.id)?.messages.push(...requestMessages);
          }
          for (const result of response.MetricDataResults ?? []) {
            if (!result.Id) continue;
            const accumulator = accumulators.get(result.Id);
            if (!accumulator) continue;
            accumulator.status = mergeStatus(
              accumulator.status,
              mapResultStatus(result),
            );
            accumulator.messages.push(
              ...(result.Messages ?? []).map(toMessage),
            );
            for (
              let index = 0;
              index < (result.Timestamps?.length ?? 0);
              index++
            ) {
              const timestamp = result.Timestamps?.[index];
              const value = result.Values?.[index];
              if (timestamp && typeof value === 'number') {
                accumulator.points.set(timestamp.toISOString(), value);
              }
            }
          }
        } while (nextToken);
      } catch (error) {
        if (isAbortError(error, input.signal)) {
          throw error;
        }
        const status = mapRequestError(error);
        const message = sanitizedErrorMessage(error);
        for (const query of batch) {
          const accumulator = accumulators.get(query.id);
          if (!accumulator) continue;
          accumulator.status = mergeStatus(accumulator.status, status);
          accumulator.messages.push(message);
        }
      }
    }

    return input.queries.map((query) => {
      const accumulator = accumulators.get(query.id)!;
      const points = [...accumulator.points.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([timestamp, value]) => ({ timestamp, value }));
      let status = accumulator.status ?? 'no-data';
      if (status === 'no-data' && points.length > 0) {
        status = 'complete';
      }
      return {
        id: query.id,
        metricName: query.metricName,
        statistic: query.statistic,
        label: query.label,
        unit: query.unit,
        dimensions: query.dimensions,
        points,
        status,
        messages: accumulator.messages,
      };
    });
  }
}
