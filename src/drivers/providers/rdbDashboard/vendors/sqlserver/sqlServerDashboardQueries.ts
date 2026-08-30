export const SQLSERVER_DASHBOARD_CAPABILITIES_SQL = `
SELECT
  DB_NAME() AS database_name,
  CAST(SERVERPROPERTY('ProductVersion') AS nvarchar(128)) AS server_version,
  CAST(SERVERPROPERTY('Edition') AS nvarchar(128)) AS edition,
  CAST(SERVERPROPERTY('EngineEdition') AS int) AS engine_edition,
  @@SPID AS observer_session_id,
  HAS_PERMS_BY_NAME(NULL, NULL, 'VIEW SERVER STATE') AS has_view_server_state,
  HAS_PERMS_BY_NAME(NULL, NULL, 'VIEW SERVER PERFORMANCE STATE') AS has_view_server_performance_state,
  HAS_PERMS_BY_NAME(DB_NAME(), 'DATABASE', 'VIEW DATABASE STATE') AS has_view_database_state`;

export const SQLSERVER_DASHBOARD_PERFORMANCE_COUNTERS_SQL = `
SELECT
  RTRIM(pc.object_name) AS object_name,
  RTRIM(pc.counter_name) AS counter_name,
  RTRIM(pc.instance_name) AS instance_name,
  CONVERT(float, pc.cntr_value) AS cntr_value,
  pc.cntr_type,
  si.sqlserver_start_time
FROM sys.dm_os_performance_counters AS pc
CROSS JOIN sys.dm_os_sys_info AS si
WHERE pc.counter_name IN (
  'User Connections',
  'Batch Requests/sec',
  'SQL Compilations/sec',
  'SQL Re-Compilations/sec',
  'Transactions/sec',
  'Buffer cache hit ratio',
  'Buffer cache hit ratio base',
  'Page life expectancy',
  'Lock Waits/sec'
)`;

export const SQLSERVER_DASHBOARD_ACTIVITY_SQL = `
SELECT
  SYSUTCDATETIME() AS observed_at,
  COALESCE(SUM(CASE WHEN r.session_id <> @@SPID THEN 1 ELSE 0 END), 0) AS active_requests,
  COALESCE(SUM(CASE WHEN r.session_id <> @@SPID AND r.blocking_session_id > 0 THEN 1 ELSE 0 END), 0) AS blocked_requests
FROM sys.dm_exec_requests AS r
WHERE r.database_id = DB_ID()`;

// Keep this list explicit and versioned with the provider. These waits represent
// background/idle workers and would otherwise dominate a top-N database view.
export const SQLSERVER_DASHBOARD_WAIT_STATS_SQL = `
SELECT
  CASE
    WHEN wait_type LIKE 'LCK[_]%' THEN 'Locks'
    WHEN wait_type LIKE 'PAGEIOLATCH[_]%' OR wait_type LIKE 'IO_COMPLETION%' THEN 'Data file I/O'
    WHEN wait_type LIKE 'WRITELOG%' THEN 'Log I/O'
    WHEN wait_type LIKE 'PAGELATCH[_]%' THEN 'Buffer latch'
    WHEN wait_type LIKE 'CXPACKET%' OR wait_type LIKE 'CXCONSUMER%' THEN 'Parallelism'
    WHEN wait_type LIKE 'ASYNC_NETWORK_IO%' THEN 'Client/network'
    WHEN wait_type LIKE 'RESOURCE_SEMAPHORE%' THEN 'Memory grant'
    ELSE 'Other'
  END AS wait_category,
  CONVERT(float, SUM(wait_time_ms)) AS wait_time_ms
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
  'BROKER_EVENTHANDLER', 'BROKER_RECEIVE_WAITFOR', 'BROKER_TASK_STOP',
  'CHECKPOINT_QUEUE', 'CLR_AUTO_EVENT', 'CLR_MANUAL_EVENT', 'DIRTY_PAGE_POLL',
  'DISPATCHER_QUEUE_SEMAPHORE', 'FT_IFTS_SCHEDULER_IDLE_WAIT', 'HADR_FILESTREAM_IOMGR_IOCOMPLETION',
  'LAZYWRITER_SLEEP', 'LOGMGR_QUEUE', 'ONDEMAND_TASK_QUEUE', 'QDS_PERSIST_TASK_MAIN_LOOP_SLEEP',
  'REQUEST_FOR_DEADLOCK_SEARCH', 'SLEEP_TASK', 'SP_SERVER_DIAGNOSTICS_SLEEP',
  'SQLTRACE_BUFFER_FLUSH', 'WAITFOR', 'XE_DISPATCHER_WAIT', 'XE_TIMER_EVENT'
)
GROUP BY CASE
  WHEN wait_type LIKE 'LCK[_]%' THEN 'Locks'
  WHEN wait_type LIKE 'PAGEIOLATCH[_]%' OR wait_type LIKE 'IO_COMPLETION%' THEN 'Data file I/O'
  WHEN wait_type LIKE 'WRITELOG%' THEN 'Log I/O'
  WHEN wait_type LIKE 'PAGELATCH[_]%' THEN 'Buffer latch'
  WHEN wait_type LIKE 'CXPACKET%' OR wait_type LIKE 'CXCONSUMER%' THEN 'Parallelism'
  WHEN wait_type LIKE 'ASYNC_NETWORK_IO%' THEN 'Client/network'
  WHEN wait_type LIKE 'RESOURCE_SEMAPHORE%' THEN 'Memory grant'
  ELSE 'Other'
END`;

export const SQLSERVER_DASHBOARD_FILE_IO_SQL = `
SELECT
  df.name AS file_name,
  CASE df.type WHEN 0 THEN 'data' WHEN 1 THEN 'log' ELSE 'other' END AS file_type,
  CONVERT(float, vfs.num_of_reads) AS file_reads,
  CONVERT(float, vfs.num_of_writes) AS file_writes,
  CONVERT(float, vfs.io_stall_read_ms) AS file_read_stall_ms,
  CONVERT(float, vfs.io_stall_write_ms) AS file_write_stall_ms
FROM sys.dm_io_virtual_file_stats(DB_ID(), NULL) AS vfs
JOIN sys.database_files AS df ON df.file_id = vfs.file_id`;

export const SQLSERVER_DASHBOARD_DATABASE_FILES_SQL = `
SELECT
  name AS file_name,
  CASE type WHEN 0 THEN 'data' WHEN 1 THEN 'log' ELSE 'other' END AS file_type,
  CONVERT(float, size) * 8192 AS file_size_bytes,
  CASE WHEN type = 0 THEN CONVERT(float, FILEPROPERTY(name, 'SpaceUsed')) * 8192 ELSE NULL END AS file_used_bytes
FROM sys.database_files`;
