import {
  DEFAULT_RDB_SAMPLE_POLICY,
  RdbDashboardCapabilities,
  RdbDashboardScope,
  RdbDashboardTarget,
  ResolvedRdbDashboard,
  ResolvedRdbMetric,
} from '../../../../../types/drivers/rdbDashboard';

export const SQLITE_RDB_DASHBOARD_PROVIDER_ID = 'rdb.sqlite.database';

export const sqliteFileScope = (databaseName: string): RdbDashboardScope => ({
  kind: 'attached-database',
  label: `SQLite database ${databaseName}`,
});

const connectionScope: RdbDashboardScope = {
  kind: 'observer-connection',
  label: 'SQLite observer connection',
};

export function sqliteDashboardMetrics(databaseName: string): ResolvedRdbMetric[] {
  const fileScope = sqliteFileScope(databaseName);
  const databaseDimension = [{ key: 'database', label: 'Attached database' }];
  return [
    { id: 'attached_database_count', label: 'Attached databases', unit: 'count', scope: connectionScope, measurement: { kind: 'snapshot' } },
    { id: 'page_count', label: 'Pages', unit: 'pages', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension },
    { id: 'page_size', label: 'Page size', unit: 'bytes', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension },
    { id: 'database_size_bytes', label: 'Logical database size', unit: 'bytes', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension },
    { id: 'free_pages', label: 'Reusable free pages', unit: 'pages', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension, caveat: 'Reusable pages are not the same as filesystem fragmentation.' },
    { id: 'reusable_bytes', label: 'Reusable free space', unit: 'bytes', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension, caveat: 'Reusable pages are already part of the logical database size.' },
    { id: 'data_version', label: 'External change marker', unit: 'version', scope: connectionScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension, caveat: 'data_version changes only when another connection commits to the same database.' },
    { id: 'external_change_detected', label: 'External change detected', unit: 'boolean', scope: connectionScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension },
    { id: 'wal_file_bytes', label: 'WAL file size', unit: 'bytes', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: databaseDimension },
    { id: 'foreign_keys_enabled', label: 'Foreign keys enabled', unit: 'boolean', scope: connectionScope, measurement: { kind: 'snapshot' } },
    { id: 'journal_mode', label: 'Journal mode', unit: 'state', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: [...databaseDimension, { key: 'mode', label: 'Mode' }] },
    { id: 'synchronous_mode', label: 'Synchronous mode', unit: 'state', scope: connectionScope, measurement: { kind: 'snapshot' }, dimensions: [...databaseDimension, { key: 'mode', label: 'Mode' }] },
    { id: 'auto_vacuum_mode', label: 'Auto-vacuum mode', unit: 'state', scope: fileScope, measurement: { kind: 'snapshot' }, dimensions: [...databaseDimension, { key: 'mode', label: 'Mode' }] },
  ];
}

export function resolveSqliteDashboard(
  target: RdbDashboardTarget,
  capabilities: RdbDashboardCapabilities,
): ResolvedRdbDashboard {
  const fileScope = sqliteFileScope(target.databaseName);
  return {
    providerId: SQLITE_RDB_DASHBOARD_PROVIDER_ID,
    variant: capabilities.variant,
    definitionVersion: 1,
    target: {
      resourceKey: target.resourceKey,
      displayName: target.databaseName,
      sourceLabel: `SQLite ${capabilities.serverVersion}`,
      scope: fileScope,
    },
    serverVersion: capabilities.serverVersion,
    samplePolicy: {
      ...DEFAULT_RDB_SAMPLE_POLICY,
      defaultIntervalMs: 30_000,
      allowedIntervalMs: [10_000, 30_000, 60_000],
    },
    metrics: sqliteDashboardMetrics(target.databaseName),
    tabs: [
      {
        id: 'overview',
        title: 'Overview',
        timeMode: 'snapshot',
        selectors: [],
        panels: [
          {
            id: 'storage-summary',
            title: 'Database size and reusable pages',
            purpose: 'capacity',
            scope: fileScope,
            visualization: 'stat-grid',
            metricIds: ['database_size_bytes', 'reusable_bytes', 'attached_database_count'],
            caveat: 'Reusable pages are free inside the database file; they do not necessarily reduce its filesystem size.',
            sectionCapabilityId: 'storage',
          },
          {
            id: 'external-change',
            title: 'External commit change marker',
            purpose: 'lifecycle',
            scope: connectionScope,
            visualization: 'line',
            metricIds: ['data_version', 'external_change_detected'],
            caveat: 'The marker is compared on the same observer connection and changes only for commits made by another connection.',
            sectionCapabilityId: 'change-marker',
          },
        ],
      },
      {
        id: 'storage-configuration',
        title: 'Storage and configuration',
        timeMode: 'snapshot',
        selectors: [],
        panels: [
          {
            id: 'page-allocation',
            title: 'Page allocation',
            purpose: 'capacity',
            scope: fileScope,
            visualization: 'stat-grid',
            metricIds: ['page_count', 'page_size', 'free_pages', 'database_size_bytes', 'reusable_bytes'],
            sectionCapabilityId: 'storage',
          },
          {
            id: 'configuration',
            title: 'Connection and file configuration',
            purpose: 'configuration',
            scope: connectionScope,
            visualization: 'stat-grid',
            metricIds: ['foreign_keys_enabled', 'journal_mode', 'synchronous_mode', 'auto_vacuum_mode'],
            caveat: 'State series use 1 as the current indicator; the effective mode is shown in the series label.',
            sectionCapabilityId: 'configuration',
          },
          {
            id: 'wal-file',
            title: 'WAL file',
            purpose: 'capacity',
            scope: fileScope,
            visualization: 'stat-grid',
            metricIds: ['wal_file_bytes'],
            caveat: 'Only the non-destructive filesystem size is read. No checkpoint is executed.',
            sectionCapabilityId: 'wal-state',
          },
        ],
      },
    ],
    capabilities: capabilities.sections,
    notices: [
      {
        id: 'snapshot-profile',
        severity: 'info',
        title: 'SQLite snapshot profile',
        message: 'SQLite does not expose server-wide sessions, waits, or workload counters. This dashboard shows file and connection snapshots.',
      },
      {
        id: 'non-destructive-observer',
        severity: 'info',
        title: 'Non-destructive collection',
        message: 'The observer is read-only. It does not run WAL checkpoints, quick_check, integrity_check, or VACUUM.',
      },
    ],
  };
}
