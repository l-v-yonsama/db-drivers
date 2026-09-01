import {
  DEFAULT_RDB_SAMPLE_POLICY,
  RdbDashboardCapabilities,
  RdbDashboardScope,
  RdbDashboardTarget,
  ResolvedRdbDashboard,
  ResolvedRdbMetric,
} from '../../../../../types/drivers/rdbDashboard';

export const SQLSERVER_RDB_DASHBOARD_PROVIDER_ID = 'rdb.sqlserver.database';

const serverScope = (variant: string): RdbDashboardScope => ({
  kind: variant === 'azure-sql-database' ? 'database-server' : 'instance',
  label: variant === 'azure-sql-database' ? 'Azure SQL logical database scope' : 'SQL Server instance',
});

const databaseScope = (databaseName: string): RdbDashboardScope => ({
  kind: 'database',
  label: `Database ${databaseName}`,
});

export function sqlServerDashboardMetrics(
  databaseName: string,
  variant: string,
): ResolvedRdbMetric[] {
  const global = serverScope(variant);
  const database = databaseScope(databaseName);
  const serverCounter = (id: string, label: string, unit: string): ResolvedRdbMetric => ({
    id,
    label,
    unit,
    scope: global,
    measurement: { kind: 'cumulative-counter', epochKey: 'sqlserver-start-time', presentation: 'rate' },
    selfObservation: 'included',
  });
  const databaseCounter = (id: string, label: string, unit: string): ResolvedRdbMetric => ({
    id,
    label,
    unit,
    scope: database,
    measurement: { kind: 'cumulative-counter', epochKey: 'sqlserver-start-time', presentation: 'rate' },
    selfObservation: 'included',
  });
  const fileCounter = (id: string, label: string, unit: string): ResolvedRdbMetric => ({
    ...databaseCounter(id, label, unit),
    dimensions: [{ key: 'fileName', label: 'File' }, { key: 'fileType', label: 'File type' }],
  });
  return [
    { id: 'user_connections', label: 'User connections', unit: 'count', scope: global, measurement: { kind: 'gauge' } },
    { id: 'active_requests', label: 'Active requests', unit: 'count', scope: database, measurement: { kind: 'gauge' }, selfObservation: 'excluded' },
    { id: 'blocked_requests', label: 'Blocked requests', unit: 'count', scope: database, measurement: { kind: 'gauge' }, selfObservation: 'excluded' },
    serverCounter('batch_requests', 'Batch requests', 'batches/s'),
    serverCounter('sql_compilations', 'SQL compilations', 'compilations/s'),
    serverCounter('sql_recompilations', 'SQL recompilations', 'recompilations/s'),
    databaseCounter('transactions', 'Transactions', 'transactions/s'),
    {
      id: 'buffer_cache_hits', label: 'Buffer cache ratio numerator', unit: 'count', scope: global,
      measurement: { kind: 'gauge' }, selfObservation: 'included',
    },
    {
      id: 'buffer_cache_lookups', label: 'Buffer cache ratio base', unit: 'count', scope: global,
      measurement: { kind: 'gauge' }, selfObservation: 'included',
    },
    {
      id: 'buffer_cache_hit_ratio', label: 'Buffer cache hit ratio', unit: 'percent', scope: global,
      measurement: { kind: 'derived', formula: { kind: 'raw-ratio', numeratorId: 'buffer_cache_hits', denominatorId: 'buffer_cache_lookups', scale: 100 } },
      caveat: 'Calculated from the paired PERF_RAW_FRACTION numerator and PERF_RAW_BASE in the same sample.',
    },
    {
      id: 'page_life_expectancy', label: 'Page life expectancy', unit: 'seconds', scope: global,
      measurement: { kind: 'gauge' }, dimensions: [{ key: 'instanceName', label: 'NUMA node / instance' }],
      caveat: 'Interpret per NUMA node and workload; no fixed universal threshold is applied.',
    },
    {
      ...serverCounter('lock_waits', 'Lock waits', 'waits/s'),
      caveat: 'The SQLServer:Locks _Total counter is server-wide; use blocked requests for the selected database scope.',
    },
    {
      id: 'wait_time', label: 'Wait time by category', unit: 'ms/s', scope: global,
      measurement: { kind: 'cumulative-counter', epochKey: 'sqlserver-start-time', presentation: 'rate' },
      dimensions: [{ key: 'waitCategory', label: 'Wait category' }], selfObservation: 'included',
    },
    fileCounter('file_reads', 'File reads', 'reads/s'),
    fileCounter('file_writes', 'File writes', 'writes/s'),
    fileCounter('file_read_stall', 'Read stall', 'ms/s'),
    fileCounter('file_write_stall', 'Write stall', 'ms/s'),
    {
      id: 'file_read_latency', label: 'Read latency', unit: 'ms/read', scope: database,
      measurement: { kind: 'derived', formula: { kind: 'average', totalId: 'file_read_stall', countId: 'file_reads', scale: 1 } },
      dimensions: [{ key: 'fileName', label: 'File' }, { key: 'fileType', label: 'File type' }],
      caveat: 'An interval with no read operations is unavailable, not zero.',
    },
    {
      id: 'file_write_latency', label: 'Write latency', unit: 'ms/write', scope: database,
      measurement: { kind: 'derived', formula: { kind: 'average', totalId: 'file_write_stall', countId: 'file_writes', scale: 1 } },
      dimensions: [{ key: 'fileName', label: 'File' }, { key: 'fileType', label: 'File type' }],
      caveat: 'An interval with no write operations is unavailable, not zero.',
    },
    {
      id: 'file_size_bytes', label: 'Allocated file size', unit: 'bytes', scope: database,
      measurement: { kind: 'snapshot' }, dimensions: [{ key: 'fileName', label: 'File' }, { key: 'fileType', label: 'File type' }],
    },
    {
      id: 'file_used_bytes', label: 'Used data-file space', unit: 'bytes', scope: database,
      measurement: { kind: 'snapshot' }, dimensions: [{ key: 'fileName', label: 'File' }, { key: 'fileType', label: 'File type' }],
      caveat: 'FILEPROPERTY SpaceUsed is available for data files; log used space is not represented here.',
    },
  ];
}

export function resolveSqlServerDashboard(
  target: RdbDashboardTarget,
  capabilities: RdbDashboardCapabilities,
): ResolvedRdbDashboard {
  const global = serverScope(capabilities.variant);
  const database = databaseScope(target.databaseName);
  const sectionAvailable = (id: string): boolean =>
    capabilities.sections.find((it) => it.sectionId === id)?.status !== 'unavailable';
  const panels = [
    { id: 'connections', title: 'Connections and activity', purpose: 'workload' as const, scope: database, visualization: 'line' as const, metricIds: [...(sectionAvailable('performance-counters') ? ['user_connections'] : []), 'active_requests', 'blocked_requests'], sectionCapabilityId: 'current-activity', drilldownActions: [{ id: 'sessions', label: 'Open sessions', kind: 'open-sessions' as const, enabled: true }, { id: 'locks', label: 'Open locks', kind: 'open-locks' as const, enabled: true }] },
    { id: 'workload', title: 'Batch and transaction activity', purpose: 'workload' as const, scope: global, visualization: 'line' as const, metricIds: ['batch_requests', 'sql_compilations', 'sql_recompilations', 'transactions'], sectionCapabilityId: 'performance-counters' },
    { id: 'buffer-cache', title: 'Buffer cache', purpose: 'health' as const, scope: global, visualization: 'line' as const, metricIds: ['buffer_cache_hit_ratio', 'page_life_expectancy'], sectionCapabilityId: 'performance-counters' },
    { id: 'locks', title: 'Locks and blocking', purpose: 'health' as const, scope: global, visualization: 'line' as const, metricIds: ['blocked_requests', 'lock_waits'], caveat: 'Blocked requests are scoped to the selected database; Lock waits is the server-wide _Total counter.', sectionCapabilityId: 'current-activity', drilldownActions: [{ id: 'locks', label: 'Open locks', kind: 'open-locks' as const, enabled: true }] },
    { id: 'waits', title: 'Top wait categories', purpose: 'health' as const, scope: global, visualization: 'bar' as const, metricIds: ['wait_time'], topN: 10, sectionCapabilityId: 'wait-statistics' },
    { id: 'file-io', title: 'Database file I/O', purpose: 'health' as const, scope: database, visualization: 'line' as const, metricIds: ['file_reads', 'file_writes', 'file_read_latency', 'file_write_latency'], sectionCapabilityId: 'file-io' },
    { id: 'file-capacity', title: 'Database files', purpose: 'capacity' as const, scope: database, visualization: 'stat-grid' as const, metricIds: ['file_size_bytes', 'file_used_bytes'], sectionCapabilityId: 'database-files' },
  ];
  return {
    providerId: SQLSERVER_RDB_DASHBOARD_PROVIDER_ID,
    variant: capabilities.variant,
    definitionVersion: 1,
    target: { resourceKey: target.resourceKey, displayName: target.databaseName, sourceLabel: `${capabilities.variant === 'azure-sql-database' ? 'Azure SQL Database' : 'SQL Server'} ${capabilities.serverVersion}`, scope: database },
    serverVersion: capabilities.serverVersion,
    samplePolicy: DEFAULT_RDB_SAMPLE_POLICY,
    metrics: sqlServerDashboardMetrics(target.databaseName, capabilities.variant),
    tabs: [
      { id: 'overview', title: 'Overview', timeMode: 'sampling-session', selectors: [], panels: [panels[0], panels[6]] },
      { id: 'workload', title: 'Workload', timeMode: 'sampling-session', selectors: [], panels: [panels[1]] },
      { id: 'waits', title: 'Waits and locks', timeMode: 'sampling-session', selectors: [], panels: [panels[3], panels[4]] },
      { id: 'io', title: 'I/O and cache', timeMode: 'sampling-session', selectors: [], panels: [panels[2], panels[5]] },
    ],
    capabilities: capabilities.sections,
    notices: [
      { id: 'sampling-history', severity: 'info', title: 'On-demand DMV statistics', message: 'History starts when this dashboard is opened. Server-scoped values can include activity from other databases and clients.' },
      { id: 'permissions', severity: 'info', title: 'SQL Server DMV permissions', message: 'SQL Server 2022 commonly requires VIEW SERVER PERFORMANCE STATE; earlier versions commonly require VIEW SERVER STATE. Sections remain available independently.' },
      { id: 'self-observation', severity: 'info', title: 'Observer session', message: 'The observer session is excluded from current request counts. Its contribution to server counters cannot always be removed.' },
    ],
  };
}
