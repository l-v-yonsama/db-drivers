import {
  DEFAULT_RDB_SAMPLE_POLICY,
  RdbDashboardCapabilities,
  RdbDashboardScope,
  RdbDashboardTarget,
  ResolvedRdbDashboard,
  ResolvedRdbMetric,
} from '../../../../../types/drivers/rdbDashboard';

export const MYSQL_RDB_DASHBOARD_PROVIDER_ID = 'rdb.mysql.database';

const instanceScope = (variant: string): RdbDashboardScope => ({
  kind: 'instance',
  label: `${variant.startsWith('mariadb-') ? 'MariaDB' : 'MySQL'} instance`,
});

const databaseScope = (databaseName: string): RdbDashboardScope => ({
  kind: 'database',
  label: `Database ${databaseName}`,
});

export function mysqlDashboardMetrics(
  databaseName: string,
  variant: string,
): ResolvedRdbMetric[] {
  const globalScope = instanceScope(variant);
  const selectedDatabaseScope = databaseScope(databaseName);
  const counter = (id: string, label: string, unit: string): ResolvedRdbMetric => ({
    id,
    label,
    unit,
    scope: globalScope,
    measurement: {
      kind: 'cumulative-counter',
      epochKey: 'mysql-server-uptime',
      presentation: 'rate',
    },
    selfObservation: 'included',
  });
  return [
    {
      id: 'threads_connected',
      label: 'Connected threads',
      unit: 'count',
      scope: globalScope,
      measurement: { kind: 'gauge' },
    },
    {
      id: 'threads_running',
      label: 'Running threads',
      unit: 'count',
      scope: globalScope,
      measurement: { kind: 'gauge' },
    },
    counter('questions', 'Statements', 'statements/s'),
    counter('com_commit', 'Explicit COMMIT commands', 'commands/s'),
    counter('com_rollback', 'Explicit ROLLBACK commands', 'commands/s'),
    counter('bytes_received', 'Bytes received', 'bytes/s'),
    counter('bytes_sent', 'Bytes sent', 'bytes/s'),
    counter('slow_queries', 'Slow queries', 'queries/s'),
    counter('innodb_buffer_pool_read_requests', 'Logical reads', 'reads/s'),
    counter('innodb_buffer_pool_reads', 'Physical reads', 'reads/s'),
    {
      id: 'innodb_buffer_pool_hit_ratio',
      label: 'Buffer pool hit ratio',
      unit: 'percent',
      scope: globalScope,
      measurement: {
        kind: 'derived',
        formula: {
          kind: 'one-minus-ratio',
          numeratorId: 'innodb_buffer_pool_reads',
          denominatorId: 'innodb_buffer_pool_read_requests',
          scale: 100,
        },
      },
      caveat: 'Calculated from interval deltas. No logical reads in an interval is shown as unavailable.',
    },
    {
      id: 'innodb_buffer_pool_pages_dirty',
      label: 'Dirty buffer pages',
      unit: 'pages',
      scope: globalScope,
      measurement: { kind: 'gauge' },
    },
    {
      id: 'innodb_buffer_pool_pages_free',
      label: 'Free buffer pages',
      unit: 'pages',
      scope: globalScope,
      measurement: { kind: 'gauge' },
    },
    {
      id: 'innodb_row_lock_current_waits',
      label: 'Current row lock waits',
      unit: 'count',
      scope: globalScope,
      measurement: { kind: 'gauge' },
    },
    counter('innodb_row_lock_waits', 'Row lock waits', 'waits/s'),
    counter('innodb_row_lock_time', 'Row lock wait time', 'ms/s'),
    counter('created_tmp_tables', 'Temporary tables', 'tables/s'),
    counter('created_tmp_disk_tables', 'Disk temporary tables', 'tables/s'),
    {
      id: 'tmp_disk_table_ratio',
      label: 'Disk temporary table ratio',
      unit: 'percent',
      scope: globalScope,
      measurement: {
        kind: 'derived',
        formula: {
          kind: 'ratio',
          numeratorId: 'created_tmp_disk_tables',
          denominatorId: 'created_tmp_tables',
          scale: 100,
        },
      },
      selfObservation: 'included',
      caveat: 'Collector statements can affect temporary-table counters; use this as an interval indicator.',
    },
    {
      id: 'database_size_bytes',
      label: 'Database logical size',
      unit: 'bytes',
      scope: selectedDatabaseScope,
      measurement: { kind: 'snapshot' },
    },
  ];
}

export function resolveMysqlDashboard(
  target: RdbDashboardTarget,
  capabilities: RdbDashboardCapabilities,
): ResolvedRdbDashboard {
  const globalScope = instanceScope(capabilities.variant);
  const selectedDatabaseScope = databaseScope(target.databaseName);
  const panels = [
    {
      id: 'connections',
      title: 'Connections and activity',
      purpose: 'workload' as const,
      scope: globalScope,
      visualization: 'line' as const,
      metricIds: ['threads_connected', 'threads_running'],
      sectionCapabilityId: 'global-status',
      drilldownActions: [
        { id: 'sessions', label: 'Open sessions', kind: 'open-sessions' as const, enabled: true },
        { id: 'locks', label: 'Open locks', kind: 'open-locks' as const, enabled: true },
      ],
    },
    {
      id: 'statements',
      title: 'Statements and transactions',
      purpose: 'workload' as const,
      scope: globalScope,
      visualization: 'line' as const,
      metricIds: ['questions', 'com_commit', 'com_rollback', 'slow_queries'],
      caveat: 'COMMIT and ROLLBACK count explicit commands, not every transaction completion.',
      sectionCapabilityId: 'global-status',
      drilldownActions: [
        {
          id: 'query-statistics',
          label: 'Open query statistics',
          kind: 'open-query-statistics' as const,
          enabled:
            capabilities.sections.find((it) => it.sectionId === 'query-statistics')?.status ===
            'available',
          unavailableReason: 'Performance Schema statement digests are unavailable.',
        },
      ],
    },
    {
      id: 'network',
      title: 'Network throughput',
      purpose: 'workload' as const,
      scope: globalScope,
      visualization: 'line' as const,
      metricIds: ['bytes_received', 'bytes_sent'],
      sectionCapabilityId: 'global-status',
    },
    {
      id: 'buffer-pool',
      title: 'InnoDB buffer pool',
      purpose: 'health' as const,
      scope: globalScope,
      visualization: 'line' as const,
      metricIds: [
        'innodb_buffer_pool_read_requests',
        'innodb_buffer_pool_reads',
        'innodb_buffer_pool_hit_ratio',
        'innodb_buffer_pool_pages_dirty',
        'innodb_buffer_pool_pages_free',
      ],
      sectionCapabilityId: 'innodb-status',
    },
    {
      id: 'row-locks',
      title: 'InnoDB row lock waits',
      purpose: 'health' as const,
      scope: globalScope,
      visualization: 'line' as const,
      metricIds: [
        'innodb_row_lock_current_waits',
        'innodb_row_lock_waits',
        'innodb_row_lock_time',
      ],
      sectionCapabilityId: 'innodb-status',
      drilldownActions: [
        { id: 'locks', label: 'Open locks', kind: 'open-locks' as const, enabled: true },
      ],
    },
    {
      id: 'temporary-tables',
      title: 'Temporary tables',
      purpose: 'health' as const,
      scope: globalScope,
      visualization: 'line' as const,
      metricIds: ['created_tmp_tables', 'created_tmp_disk_tables', 'tmp_disk_table_ratio'],
      caveat: 'Collector activity can affect these instance-wide counters.',
      sectionCapabilityId: 'global-status',
    },
    {
      id: 'database-size',
      title: 'Database size',
      purpose: 'capacity' as const,
      scope: selectedDatabaseScope,
      visualization: 'stat-grid' as const,
      metricIds: ['database_size_bytes'],
      sectionCapabilityId: 'database-size',
    },
  ];

  return {
    providerId: MYSQL_RDB_DASHBOARD_PROVIDER_ID,
    variant: capabilities.variant,
    definitionVersion: 1,
    target: {
      resourceKey: target.resourceKey,
      displayName: target.databaseName,
      sourceLabel: `${capabilities.variant.startsWith('mariadb-') ? 'MariaDB' : 'MySQL'} ${capabilities.serverVersion}`,
      scope: selectedDatabaseScope,
    },
    serverVersion: capabilities.serverVersion,
    samplePolicy: DEFAULT_RDB_SAMPLE_POLICY,
    metrics: mysqlDashboardMetrics(target.databaseName, capabilities.variant),
    tabs: [
      {
        id: 'overview',
        title: 'Overview',
        timeMode: 'sampling-session',
        selectors: [],
        panels: [panels[0], panels[6]],
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
        panels: [panels[4]],
      },
      {
        id: 'io',
        title: 'I/O and cache',
        timeMode: 'sampling-session',
        selectors: [],
        panels: [panels[3], panels[5]],
      },
    ],
    capabilities: capabilities.sections,
    notices: [
      {
        id: 'instance-scope',
        severity: 'info',
        title: 'Instance-wide statistics',
        message:
          'Most MySQL status variables include every database and client on this server. Only database size is scoped to the selected database.',
      },
      {
        id: 'self-observation',
        severity: 'info',
        title: 'Observer contribution',
        message:
          'The dedicated observer connection and its status queries can contribute to global counters, especially in an otherwise idle server.',
      },
    ],
  };
}
