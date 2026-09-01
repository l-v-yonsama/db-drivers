import {
  DEFAULT_RDB_SAMPLE_POLICY,
  RdbDashboardCapabilities,
  RdbDashboardScope,
  RdbDashboardTarget,
  ResolvedRdbDashboard,
  ResolvedRdbMetric,
} from '../../../../../types/drivers/rdbDashboard';

export const POSTGRES_RDB_DASHBOARD_PROVIDER_ID = 'rdb.postgres.database';

const databaseScope = (databaseName: string): RdbDashboardScope => ({
  kind: 'database',
  label: `Database ${databaseName}`,
});

export function postgresDashboardMetrics(databaseName: string): ResolvedRdbMetric[] {
  const scope = databaseScope(databaseName);
  const counter = (id: string, label: string, unit: string): ResolvedRdbMetric => ({
    id,
    label,
    unit,
    scope,
    measurement: {
      kind: 'cumulative-counter',
      epochKey: 'pg-stat-database',
      presentation: 'rate',
    },
    selfObservation: 'included',
  });
  return [
    { id: 'connections', label: 'Connections', unit: 'count', scope, measurement: { kind: 'gauge' } },
    { id: 'active_sessions', label: 'Active', unit: 'count', scope, measurement: { kind: 'gauge' } },
    {
      id: 'idle_in_transaction',
      label: 'Idle in transaction',
      unit: 'count',
      scope,
      measurement: { kind: 'gauge' },
    },
    {
      id: 'waiting_sessions',
      label: 'Waiting',
      unit: 'count',
      scope,
      measurement: { kind: 'gauge' },
    },
    {
      id: 'waiting_sessions_by_type',
      label: 'Waiting sessions',
      unit: 'count',
      scope,
      measurement: { kind: 'gauge' },
      dimensions: [{ key: 'waitEventType', label: 'Wait event type' }],
    },
    counter('xact_commit', 'Commits', 'transactions/s'),
    counter('xact_rollback', 'Rollbacks', 'transactions/s'),
    counter('rows_returned', 'Rows returned', 'rows/s'),
    counter('rows_fetched', 'Rows fetched', 'rows/s'),
    counter('rows_inserted', 'Rows inserted', 'rows/s'),
    counter('rows_updated', 'Rows updated', 'rows/s'),
    counter('rows_deleted', 'Rows deleted', 'rows/s'),
    counter('blocks_read', 'Blocks read', 'blocks/s'),
    counter('blocks_hit', 'Buffer hits', 'blocks/s'),
    counter('blocks_requested', 'Buffer accesses', 'blocks/s'),
    {
      id: 'cache_hit_ratio',
      label: 'Shared buffer hit ratio',
      unit: 'percent',
      scope,
      measurement: {
        kind: 'derived',
        formula: {
          kind: 'one-minus-ratio',
          numeratorId: 'blocks_read',
          denominatorId: 'blocks_requested',
          scale: 100,
        },
      },
      caveat: 'This is the PostgreSQL shared-buffer hit ratio and does not include the OS cache.',
    },
    counter('temp_files', 'Temporary files', 'files/s'),
    counter('temp_bytes', 'Temporary bytes', 'bytes/s'),
    counter('deadlocks', 'Deadlocks', 'deadlocks/s'),
    counter('block_read_time', 'Block read time', 'ms/s'),
    counter('block_write_time', 'Block write time', 'ms/s'),
  ];
}

export function resolvePostgresDashboard(
  target: RdbDashboardTarget,
  capabilities: RdbDashboardCapabilities,
): ResolvedRdbDashboard {
  const scope = databaseScope(target.databaseName);
  const ioTimingAvailable =
    capabilities.sections.find((it) => it.sectionId === 'io-timing')?.status === 'available';
  const panels = [
    {
      id: 'connections',
      title: 'Connections and activity',
      purpose: 'workload' as const,
      scope,
      visualization: 'line' as const,
      metricIds: ['connections', 'active_sessions', 'idle_in_transaction', 'waiting_sessions'],
      sectionCapabilityId: 'activity',
      drilldownActions: [
        { id: 'sessions', label: 'Open sessions', kind: 'open-sessions' as const, enabled: true },
        { id: 'locks', label: 'Open locks', kind: 'open-locks' as const, enabled: true },
      ],
    },
    {
      id: 'transactions',
      title: 'Transactions',
      purpose: 'workload' as const,
      scope,
      visualization: 'line' as const,
      metricIds: ['xact_commit', 'xact_rollback'],
      sectionCapabilityId: 'database-statistics',
    },
    {
      id: 'rows',
      title: 'Rows processed',
      purpose: 'workload' as const,
      scope,
      visualization: 'line' as const,
      metricIds: ['rows_returned', 'rows_fetched', 'rows_inserted', 'rows_updated', 'rows_deleted'],
      sectionCapabilityId: 'database-statistics',
    },
    {
      id: 'cache-io',
      title: 'Shared buffers and I/O',
      purpose: 'health' as const,
      scope,
      visualization: 'line' as const,
      metricIds: [
        'blocks_read',
        'blocks_hit',
        'cache_hit_ratio',
        ...(ioTimingAvailable ? ['block_read_time', 'block_write_time'] : []),
      ],
      caveat: 'Cache hit covers PostgreSQL shared buffers only; the operating system cache is not included.',
      sectionCapabilityId: 'database-statistics',
    },
    {
      id: 'temporary-and-deadlocks',
      title: 'Temporary work and deadlocks',
      purpose: 'health' as const,
      scope,
      visualization: 'line' as const,
      metricIds: ['temp_files', 'temp_bytes', 'deadlocks'],
      sectionCapabilityId: 'database-statistics',
    },
    {
      id: 'waits',
      title: 'Current waits by type',
      purpose: 'health' as const,
      scope,
      visualization: 'bar' as const,
      metricIds: ['waiting_sessions_by_type'],
      topN: 10,
      sectionCapabilityId: 'activity',
      drilldownActions: [
        { id: 'locks', label: 'Open locks', kind: 'open-locks' as const, enabled: true },
      ],
    },
  ];
  return {
    providerId: POSTGRES_RDB_DASHBOARD_PROVIDER_ID,
    variant: capabilities.variant,
    definitionVersion: 1,
    target: {
      resourceKey: target.resourceKey,
      displayName: target.databaseName,
      sourceLabel: `PostgreSQL ${capabilities.serverVersion}`,
      scope,
    },
    serverVersion: capabilities.serverVersion,
    samplePolicy: DEFAULT_RDB_SAMPLE_POLICY,
    metrics: postgresDashboardMetrics(target.databaseName),
    tabs: [
      {
        id: 'overview',
        title: 'Overview',
        timeMode: 'sampling-session',
        selectors: [],
        panels: [panels[0]],
      },
      {
        id: 'workload',
        title: 'Workload',
        timeMode: 'sampling-session',
        selectors: [],
        panels: [panels[1], panels[2]],
      },
      {
        id: 'waits',
        title: 'Waits and locks',
        timeMode: 'sampling-session',
        selectors: [],
        panels: [panels[5]],
      },
      {
        id: 'io',
        title: 'I/O and cache',
        timeMode: 'sampling-session',
        selectors: [],
        panels: [panels[3], panels[4]],
      },
    ],
    capabilities: capabilities.sections,
    notices: [
      {
        id: 'sampling-history',
        severity: 'info',
        title: 'On-demand database statistics',
        message:
          'History starts when this dashboard is opened. Values can include activity from other clients.',
      },
      {
        id: 'self-observation',
        severity: 'info',
        title: 'Observer session',
        message:
          'The observer PID is excluded from current-session counts. Its global counter impact cannot always be removed.',
      },
    ],
  };
}
