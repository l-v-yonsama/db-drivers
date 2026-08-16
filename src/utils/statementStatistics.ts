import {
  StatementStatisticsParams,
  StatementStatisticsSortKey,
} from '../types';

export const DEFAULT_STATEMENT_STATISTICS_LIMIT = 100;
export const MAX_STATEMENT_STATISTICS_LIMIT = 1000;

export type NormalizedStatementStatisticsParams = {
  databaseName: string;
  sortBy: StatementStatisticsSortKey;
  limit: number;
  minimumAverageElapsedTimeMs: number;
};

export function normalizeStatementStatisticsParams(
  params: StatementStatisticsParams,
): NormalizedStatementStatisticsParams {
  const requestedLimit = Number(params.limit);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(
        MAX_STATEMENT_STATISTICS_LIMIT,
        Math.max(1, Math.floor(requestedLimit)),
      )
    : DEFAULT_STATEMENT_STATISTICS_LIMIT;

  const requestedMinimum = Number(params.minimumAverageElapsedTimeMs);
  const minimumAverageElapsedTimeMs = Number.isFinite(requestedMinimum)
    ? Math.max(0, requestedMinimum)
    : 0;

  return {
    databaseName: params.databaseName,
    sortBy:
      params.sortBy ?? StatementStatisticsSortKey.TotalElapsedTime,
    limit,
    minimumAverageElapsedTimeMs,
  };
}

export function getStatementStatisticsOrderByColumn(
  sortBy: StatementStatisticsSortKey,
): string {
  switch (sortBy) {
    case StatementStatisticsSortKey.AverageElapsedTime:
      return 'average_elapsed_time_ms';
    case StatementStatisticsSortKey.MaxElapsedTime:
      return 'max_elapsed_time_ms';
    case StatementStatisticsSortKey.ExecutionCount:
      return 'execution_count';
    case StatementStatisticsSortKey.TotalElapsedTime:
    default:
      return 'total_elapsed_time_ms';
  }
}

