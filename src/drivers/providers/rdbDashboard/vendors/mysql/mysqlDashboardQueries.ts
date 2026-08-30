const MYSQL_STATUS_VARIABLES = [
  'Uptime',
  'Threads_connected',
  'Threads_running',
  'Questions',
  'Com_commit',
  'Com_rollback',
  'Bytes_received',
  'Bytes_sent',
  'Slow_queries',
  'Innodb_buffer_pool_read_requests',
  'Innodb_buffer_pool_reads',
  'Innodb_buffer_pool_pages_dirty',
  'Innodb_buffer_pool_pages_free',
  'Innodb_row_lock_current_waits',
  'Innodb_row_lock_waits',
  'Innodb_row_lock_time',
  'Created_tmp_tables',
  'Created_tmp_disk_tables',
] as const;

export const MYSQL_DASHBOARD_CAPABILITIES_SQL = `
SELECT
  DATABASE() AS database_name,
  VERSION() AS server_version,
  @@version_comment AS version_comment,
  @@performance_schema AS performance_schema_enabled,
  CONNECTION_ID() AS observer_connection_id`;

export const MYSQL_DASHBOARD_GLOBAL_STATUS_SQL = `SHOW GLOBAL STATUS WHERE Variable_name IN (${MYSQL_STATUS_VARIABLES.map(
  (name) => `'${name}'`,
).join(', ')})`;

export const MYSQL_DASHBOARD_DATABASE_SIZE_SQL = `
SELECT COALESCE(SUM(DATA_LENGTH + INDEX_LENGTH), 0) AS database_size_bytes
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = ?`;

export const MYSQL_DASHBOARD_QUERY_STATISTICS_PROBE_SQL = `
SELECT DIGEST
FROM performance_schema.events_statements_summary_by_digest
WHERE FALSE`;

export const MYSQL_DASHBOARD_STATUS_VARIABLE_NAMES = MYSQL_STATUS_VARIABLES;
