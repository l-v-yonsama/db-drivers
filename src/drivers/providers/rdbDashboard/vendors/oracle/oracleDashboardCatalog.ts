import {
  DEFAULT_RDB_SAMPLE_POLICY,
  RdbDashboardCapabilities,
  RdbDashboardScope,
  RdbDashboardTarget,
  RdbMeasurementDescriptor,
  ResolvedRdbDashboard,
  ResolvedRdbMetric,
} from '../../../../../types/drivers/rdbDashboard';

export const ORACLE_RDB_DASHBOARD_PROVIDER_ID = 'rdb.oracle.database';

export type OracleDashboardContext = {
  containerId: number;
  containerName: string;
  instanceName: string;
  nativeMetricsAvailable: boolean;
  nativeIntervalSeconds: number;
};

export function oracleConnectionScope(context: OracleDashboardContext): RdbDashboardScope {
  if (context.containerId > 1) {
    return { kind: 'pdb', label: `PDB ${context.containerName}` };
  }
  if (context.containerId === 1) {
    return { kind: 'container', label: `CDB root ${context.containerName}` };
  }
  return { kind: 'database', label: `Database ${context.containerName}` };
}

const instanceScope = (instanceName: string): RdbDashboardScope => ({
  kind: 'instance',
  label: `Oracle instance ${instanceName}`,
});

export function oracleDashboardMetrics(context: OracleDashboardContext): ResolvedRdbMetric[] {
  const connection = oracleConnectionScope(context);
  const instance = instanceScope(context.instanceName);
  const nativeScope = context.containerId > 1 ? connection : instance;
  const sampledMeasurement = (): RdbMeasurementDescriptor =>
    context.nativeMetricsAvailable
      ? { kind: 'native-window', intervalSeconds: context.nativeIntervalSeconds }
      : { kind: 'cumulative-counter', epochKey: 'oracle-instance-startup', presentation: 'rate' };
  const sampled = (id: string, label: string, unit: string): ResolvedRdbMetric => ({
    id,
    label,
    unit,
    scope: nativeScope,
    measurement: sampledMeasurement(),
    selfObservation: 'included',
  });
  const resource = (id: string, label: string): ResolvedRdbMetric => ({
    id,
    label,
    unit: 'count',
    scope: instance,
    measurement: { kind: 'gauge' },
  });
  return [
    { id: 'active_sessions', label: 'Active user sessions', unit: 'count', scope: connection, measurement: { kind: 'gauge' }, selfObservation: 'excluded' },
    { id: 'inactive_sessions', label: 'Inactive user sessions', unit: 'count', scope: connection, measurement: { kind: 'gauge' }, selfObservation: 'excluded' },
    { id: 'current_waits', label: 'Current waits by class', unit: 'sessions', scope: connection, measurement: { kind: 'gauge' }, dimensions: [{ key: 'waitClass', label: 'Wait class' }], selfObservation: 'excluded' },
    sampled('user_calls', 'User calls', 'calls/s'),
    sampled('executions', 'Executions', 'executes/s'),
    sampled('database_time', 'Database time', 'centiseconds/s'),
    sampled('cpu_usage', 'CPU usage', 'centiseconds/s'),
    sampled('logical_reads', 'Logical reads', 'reads/s'),
    sampled('physical_reads', 'Physical reads', 'reads/s'),
    sampled('physical_writes', 'Physical writes', 'writes/s'),
    {
      id: 'completed_wait_time',
      label: 'Completed wait time',
      unit: 'ms/s',
      scope: context.containerId > 1 ? connection : instance,
      measurement: { kind: 'cumulative-counter', epochKey: 'oracle-instance-startup', presentation: 'rate' },
      dimensions: [{ key: 'waitClass', label: 'Wait class' }],
      selfObservation: 'included',
    },
    resource('sessions_current', 'Sessions current'),
    resource('sessions_limit', 'Sessions limit'),
    resource('processes_current', 'Processes current'),
    resource('processes_limit', 'Processes limit'),
    {
      id: 'sessions_utilization', label: 'Sessions utilization', unit: 'percent', scope: instance,
      measurement: { kind: 'derived', formula: { kind: 'raw-ratio', numeratorId: 'sessions_current', denominatorId: 'sessions_limit', scale: 100 } },
      caveat: 'Unavailable when Oracle reports LIMIT_VALUE as UNLIMITED.',
    },
    {
      id: 'processes_utilization', label: 'Processes utilization', unit: 'percent', scope: instance,
      measurement: { kind: 'derived', formula: { kind: 'raw-ratio', numeratorId: 'processes_current', denominatorId: 'processes_limit', scale: 100 } },
      caveat: 'Unavailable when Oracle reports LIMIT_VALUE as UNLIMITED.',
    },
  ];
}

export function resolveOracleDashboard(
  target: RdbDashboardTarget,
  capabilities: RdbDashboardCapabilities,
  context: OracleDashboardContext,
): ResolvedRdbDashboard {
  const connection = oracleConnectionScope(context);
  const instance = instanceScope(context.instanceName);
  const statisticsSection = context.nativeMetricsAvailable ? 'native-metrics' : 'system-statistics';
  const panels = [
    { id: 'sessions', title: 'User sessions', purpose: 'workload' as const, scope: connection, visualization: 'line' as const, metricIds: ['active_sessions', 'inactive_sessions'], sectionCapabilityId: 'sessions', drilldownActions: [{ id: 'sessions', label: 'Open sessions', kind: 'open-sessions' as const, enabled: true }, { id: 'locks', label: 'Open locks', kind: 'open-locks' as const, enabled: true }] },
    { id: 'calls', title: 'Calls and executions', purpose: 'workload' as const, scope: context.containerId > 1 ? connection : instance, visualization: 'line' as const, metricIds: ['user_calls', 'executions'], sectionCapabilityId: statisticsSection, drilldownActions: [{ id: 'query-statistics', label: 'Open query statistics', kind: 'open-query-statistics' as const, enabled: capabilities.sections.find((item) => item.sectionId === 'query-statistics')?.status === 'available', unavailableReason: 'V$SQLSTATS is unavailable.' }] },
    { id: 'db-time', title: 'Database and CPU time', purpose: 'health' as const, scope: context.containerId > 1 ? connection : instance, visualization: 'line' as const, metricIds: ['database_time', 'cpu_usage'], sectionCapabilityId: 'native-metrics' },
    { id: 'io', title: 'Logical and physical I/O', purpose: 'health' as const, scope: context.containerId > 1 ? connection : instance, visualization: 'line' as const, metricIds: ['logical_reads', 'physical_reads', 'physical_writes'], sectionCapabilityId: statisticsSection },
    { id: 'current-waits', title: 'Current waits by class', purpose: 'health' as const, scope: connection, visualization: 'bar' as const, metricIds: ['current_waits'], topN: 10, sectionCapabilityId: 'sessions' },
    { id: 'completed-waits', title: 'Completed wait time by class', purpose: 'health' as const, scope: context.containerId > 1 ? connection : instance, visualization: 'bar' as const, metricIds: ['completed_wait_time'], topN: 10, sectionCapabilityId: 'system-events' },
    { id: 'resource-limits', title: 'Instance resource limits', purpose: 'capacity' as const, scope: instance, visualization: 'stat-grid' as const, metricIds: ['sessions_current', 'sessions_limit', 'sessions_utilization', 'processes_current', 'processes_limit', 'processes_utilization'], sectionCapabilityId: 'resource-limits' },
  ];
  return {
    providerId: ORACLE_RDB_DASHBOARD_PROVIDER_ID,
    variant: capabilities.variant,
    definitionVersion: 1,
    target: { resourceKey: target.resourceKey, displayName: target.databaseName, sourceLabel: `Oracle ${capabilities.serverVersion}`, scope: connection },
    serverVersion: capabilities.serverVersion,
    samplePolicy: DEFAULT_RDB_SAMPLE_POLICY,
    metrics: oracleDashboardMetrics(context),
    tabs: [
      { id: 'overview', title: 'Overview', timeMode: 'sampling-session', selectors: [], panels: [panels[0], panels[6]] },
      { id: 'workload', title: 'Workload', timeMode: 'sampling-session', selectors: [], panels: [panels[1], panels[2]] },
      { id: 'waits', title: 'Waits and locks', timeMode: 'sampling-session', selectors: [], panels: [panels[4], panels[5]] },
      { id: 'io', title: 'I/O', timeMode: 'sampling-session', selectors: [], panels: [panels[3]] },
    ],
    capabilities: capabilities.sections,
    notices: [
      { id: 'scope', severity: 'info', title: 'Oracle container scope', message: `Connected to ${connection.label}. CON_ID=0 statistics are never labeled as PDB statistics.` },
      { id: 'native-window', severity: 'info', title: 'Oracle native metric interval', message: context.nativeMetricsAvailable ? `Rates come from Oracle's ${context.nativeIntervalSeconds}-second metric window.` : 'Native metrics are unavailable; cumulative V$SYSSTAT counters are sampled instead.' },
      { id: 'license-safe', severity: 'info', title: 'License-safe baseline', message: 'This dashboard does not query AWR, ASH, ADDM, DBA_HIST_* or V$SYSMETRIC_HISTORY.' },
      { id: 'self-observation', severity: 'info', title: 'Observer session', message: 'The observer SID is excluded from current session counts. Its effect on shared counters cannot always be removed.' },
    ],
  };
}
