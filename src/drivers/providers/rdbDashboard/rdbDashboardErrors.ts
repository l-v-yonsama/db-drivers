export const RDB_DASHBOARD_CANCELLED_MESSAGE = 'RDB dashboard request was cancelled.';
export const RDB_DASHBOARD_UNEXPECTED_ERROR_MESSAGE =
  'RDB dashboard collection failed unexpectedly. Check the extension/driver logs for details.';

export function rdbDashboardTimeoutMessage(stage: string, timeoutMs: number): string {
  return `RDB dashboard ${stage} timed out after ${timeoutMs}ms.`;
}
