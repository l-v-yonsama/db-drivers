export const StatementStatisticsSortKey = {
  TotalElapsedTime: 'totalElapsedTime',
  AverageElapsedTime: 'averageElapsedTime',
  MaxElapsedTime: 'maxElapsedTime',
  ExecutionCount: 'executionCount',
} as const;

export type StatementStatisticsSortKey =
  (typeof StatementStatisticsSortKey)[keyof typeof StatementStatisticsSortKey];

export type StatementStatisticsParams = {
  databaseName: string;
  sortBy?: StatementStatisticsSortKey;
  limit?: number;
  minimumAverageElapsedTimeMs?: number;
};

