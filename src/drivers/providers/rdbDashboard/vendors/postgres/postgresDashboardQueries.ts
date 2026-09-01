export const POSTGRES_DASHBOARD_CAPABILITIES_SQL = `
SELECT
  current_database() AS database_name,
  current_setting('server_version') AS server_version,
  current_setting('server_version_num')::integer AS server_version_num,
  current_setting('track_io_timing') = 'on' AS track_io_timing,
  pg_backend_pid() AS observer_pid,
  COALESCE(
    (SELECT rolsuper FROM pg_catalog.pg_roles WHERE rolname = current_user),
    false
  ) OR pg_has_role(current_user, 'pg_read_all_stats', 'MEMBER') AS can_read_all_stats,
  to_regclass('pg_catalog.pg_stat_io') IS NOT NULL AS has_pg_stat_io,
  to_regclass('pg_stat_statements') IS NOT NULL AS has_pg_stat_statements`;

export const POSTGRES_DASHBOARD_DATABASE_SAMPLE_SQL = `
WITH activity AS (
  SELECT
    count(*) FILTER (WHERE pid <> pg_backend_pid())::double precision AS connections,
    count(*) FILTER (
      WHERE pid <> pg_backend_pid() AND state = 'active'
    )::double precision AS active_sessions,
    count(*) FILTER (
      WHERE pid <> pg_backend_pid() AND state = 'idle in transaction'
    )::double precision AS idle_in_transaction,
    count(*) FILTER (
      WHERE pid <> pg_backend_pid() AND wait_event_type IS NOT NULL
    )::double precision AS waiting_sessions
  FROM pg_catalog.pg_stat_activity
  WHERE datname = current_database()
)
SELECT
  clock_timestamp() AS observed_at,
  d.stats_reset,
  a.connections,
  a.active_sessions,
  a.idle_in_transaction,
  a.waiting_sessions,
  d.xact_commit::double precision AS xact_commit,
  d.xact_rollback::double precision AS xact_rollback,
  d.tup_returned::double precision AS rows_returned,
  d.tup_fetched::double precision AS rows_fetched,
  d.tup_inserted::double precision AS rows_inserted,
  d.tup_updated::double precision AS rows_updated,
  d.tup_deleted::double precision AS rows_deleted,
  d.blks_read::double precision AS blocks_read,
  d.blks_hit::double precision AS blocks_hit,
  (d.blks_read + d.blks_hit)::double precision AS blocks_requested,
  d.temp_files::double precision AS temp_files,
  d.temp_bytes::double precision AS temp_bytes,
  d.deadlocks::double precision AS deadlocks,
  d.blk_read_time::double precision AS block_read_time,
  d.blk_write_time::double precision AS block_write_time
FROM pg_catalog.pg_stat_database d
CROSS JOIN activity a
WHERE d.datname = current_database()`;

export const POSTGRES_DASHBOARD_WAITS_SAMPLE_SQL = `
SELECT
  clock_timestamp() AS observed_at,
  COALESCE(wait_event_type, 'Unknown') AS wait_event_type,
  count(*)::double precision AS waiting_sessions_by_type
FROM pg_catalog.pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid()
  AND wait_event_type IS NOT NULL
GROUP BY wait_event_type
ORDER BY count(*) DESC, wait_event_type
LIMIT 20`;
