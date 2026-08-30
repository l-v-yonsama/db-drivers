import { RDSBaseDriver } from '../../../../RDSBaseDriver';
import { GeneralResult } from '../../../../../types/drivers/GeneralResult';
import {
  RdbDashboardCallOptions,
  RdbDashboardCapabilities,
  RdbDashboardSectionCapability,
  RdbDashboardSelection,
  RdbDashboardTarget,
  RdbRawObservation,
  RdbRawSampleBatch,
  RdbSampleDiagnostic,
  RdbSampleRequest,
  ResolvedRdbDashboard,
} from '../../../../../types/drivers/rdbDashboard';
import { RdbDashboardProvider } from '../../RdbDashboardProvider';
import {
  resolveSqlServerDashboard,
  SQLSERVER_RDB_DASHBOARD_PROVIDER_ID,
} from './sqlServerDashboardCatalog';
import {
  SQLSERVER_DASHBOARD_ACTIVITY_SQL,
  SQLSERVER_DASHBOARD_CAPABILITIES_SQL,
  SQLSERVER_DASHBOARD_DATABASE_FILES_SQL,
  SQLSERVER_DASHBOARD_FILE_IO_SQL,
  SQLSERVER_DASHBOARD_PERFORMANCE_COUNTERS_SQL,
  SQLSERVER_DASHBOARD_WAIT_STATS_SQL,
} from './sqlServerDashboardQueries';

type Row = Record<string, unknown>;
type ProbeId = 'performance-counters' | 'current-activity' | 'wait-statistics' | 'file-io' | 'database-files';

const PERF_COUNTER_TO_METRIC: Readonly<Record<string, string>> = {
  'user connections': 'user_connections',
  'batch requests/sec': 'batch_requests',
  'sql compilations/sec': 'sql_compilations',
  'sql re-compilations/sec': 'sql_recompilations',
  'transactions/sec': 'transactions',
  'buffer cache hit ratio': 'buffer_cache_hits',
  'buffer cache hit ratio base': 'buffer_cache_lookups',
  'page life expectancy': 'page_life_expectancy',
  'lock waits/sec': 'lock_waits',
};

const PERFORMANCE_METRIC_IDS = Object.values(PERF_COUNTER_TO_METRIC);
const ACTIVITY_METRIC_IDS = ['active_requests', 'blocked_requests'] as const;
const FILE_IO_METRIC_IDS = ['file_reads', 'file_writes', 'file_read_stall', 'file_write_stall'] as const;
const DATABASE_FILE_METRIC_IDS = ['file_size_bytes', 'file_used_bytes'] as const;
const RATE_COUNTER_TYPES = new Set([272696320, 272696576]);
const GAUGE_COUNTER_TYPES = new Set([65792]);

function ok<T>(result: T): GeneralResult<T> {
  return { ok: true, message: '', result };
}

function rowValue(row: Row, ...names: string[]): unknown {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(row, name)) return row[name];
  }
  const lowered = new Map(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
  for (const name of names) {
    if (lowered.has(name.toLowerCase())) return lowered.get(name.toLowerCase());
  }
  return undefined;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function bool(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function iso(value: unknown): string | undefined {
  const date = value instanceof Date ? value : new Date(String(value ?? ''));
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function variantFor(engineEdition: number | null): string {
  switch (engineEdition) {
    case 5:
      return 'azure-sql-database';
    case 8:
      return 'azure-sql-managed-instance';
    default:
      return 'sqlserver';
  }
}

export class SQLServerRdbDashboardProvider implements RdbDashboardProvider {
  readonly providerId = SQLSERVER_RDB_DASHBOARD_PROVIDER_ID;
  private capabilitiesByResourceKey = new Map<string, RdbDashboardCapabilities>();
  private epochByResourceKey = new Map<string, string>();

  constructor(private readonly driver: RDSBaseDriver) {}

  async checkCapabilities(
    target: RdbDashboardTarget,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbDashboardCapabilities>> {
    try {
      const base = await this.driver.requestSql({
        sql: SQLSERVER_DASHBOARD_CAPABILITIES_SQL,
        conditions: { rawQueries: true },
      });
      const row = base.rows[0]?.values as Row | undefined;
      if (!row || String(rowValue(row, 'database_name')) !== target.databaseName) {
        return { ok: false, message: 'The observer connection is not connected to the requested SQL Server database.' };
      }

      const variant = variantFor(numberOrNull(rowValue(row, 'engine_edition')));
      const databaseScope = { kind: 'database', label: `Database ${target.databaseName}` };
      const serverScope = {
        kind: variant === 'azure-sql-database' ? 'database-server' : 'instance',
        label: variant === 'azure-sql-database' ? 'Azure SQL logical database scope' : 'SQL Server instance',
      };
      const hasServerVisibility =
        bool(rowValue(row, 'has_view_server_state')) ||
        bool(rowValue(row, 'has_view_server_performance_state'));

      const probeResults = new Map<ProbeId, boolean>();
      const probes: Array<[ProbeId, string]> = [
        ['performance-counters', SQLSERVER_DASHBOARD_PERFORMANCE_COUNTERS_SQL],
        ['current-activity', SQLSERVER_DASHBOARD_ACTIVITY_SQL],
        ['wait-statistics', SQLSERVER_DASHBOARD_WAIT_STATS_SQL],
        ['file-io', SQLSERVER_DASHBOARD_FILE_IO_SQL],
        ['database-files', SQLSERVER_DASHBOARD_DATABASE_FILES_SQL],
      ];
      for (const [id, sql] of probes) {
        try {
          await this.driver.requestSql({ sql, conditions: { rawQueries: true } });
          probeResults.set(id, true);
        } catch (error) {
          probeResults.set(id, false);
          // Probe failures are section-local and details stay in the driver log.
          // eslint-disable-next-line no-console
          console.error(`[SQLServerRdbDashboardProvider:${id}Probe]`, error);
        }
      }
      let queryStatisticsAvailable = false;
      try {
        queryStatisticsAvailable = (
          await this.driver.checkStatementStatisticsAvailability(target.databaseName)
        ).ok;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[SQLServerRdbDashboardProvider:queryStatisticsProbe]', error);
      }

      const section = (
        sectionId: ProbeId,
        scope: { kind: string; label: string },
        requiredPermissions?: string[],
      ): RdbDashboardSectionCapability => {
        const available = probeResults.get(sectionId) === true;
        return {
          sectionId,
          status:
            sectionId === 'current-activity' && available && !hasServerVisibility
              ? 'partial'
              : available
                ? 'available'
                : 'unavailable',
          scope,
          ...(!available
            ? {
                reasonCode: 'dmv-unavailable',
                message: `${sectionId} is unavailable with the current edition or permissions.`,
                ...(requiredPermissions ? { requiredPermissions } : {}),
              }
            : sectionId === 'current-activity' && !hasServerVisibility
              ? {
                  reasonCode: 'limited-session-visibility',
                  message: 'Current request counts can be limited to sessions visible to this login.',
                  requiredPermissions: ['VIEW SERVER STATE or VIEW SERVER PERFORMANCE STATE'],
                }
              : {}),
        };
      };

      const serverPermission = ['VIEW SERVER STATE (SQL Server 2019 or earlier) or VIEW SERVER PERFORMANCE STATE (SQL Server 2022+)'];
      const capabilities: RdbDashboardCapabilities = {
        providerId: this.providerId,
        variant,
        serverVersion: String(rowValue(row, 'server_version') ?? ''),
        observerIdentity: String(rowValue(row, 'observer_session_id') ?? ''),
        sections: [
          section('performance-counters', serverScope, serverPermission),
          section('current-activity', databaseScope, serverPermission),
          section('wait-statistics', serverScope, serverPermission),
          section('file-io', databaseScope, serverPermission),
          section('database-files', databaseScope),
          {
            sectionId: 'query-statistics',
            status: queryStatisticsAvailable ? 'available' : 'unavailable',
            scope: databaseScope,
            ...(!queryStatisticsAvailable
              ? {
                  reasonCode: 'query-store-unavailable',
                  message:
                    'Query Store is disabled or unavailable with the current database permissions.',
                  requiredPermissions: [
                    'VIEW DATABASE STATE or VIEW DATABASE PERFORMANCE STATE (SQL Server 2022+)',
                  ],
                }
              : {
                  message:
                    'Query statistics are provided by the existing SQL Server Query Store integration.',
                }),
          },
        ],
      };
      this.capabilitiesByResourceKey.set(target.resourceKey, capabilities);
      return ok(capabilities);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[SQLServerRdbDashboardProvider:checkCapabilities]', error);
      return { ok: false, message: 'SQL Server dashboard capabilities could not be checked.' };
    }
  }

  async resolveDashboard(
    target: RdbDashboardTarget,
    _selection: RdbDashboardSelection,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<ResolvedRdbDashboard>> {
    let capabilities = this.capabilitiesByResourceKey.get(target.resourceKey);
    if (!capabilities) {
      const checked = await this.checkCapabilities(target, options);
      if (!checked.ok || !checked.result) return { ok: false, message: checked.message };
      capabilities = checked.result;
    }
    return ok(resolveSqlServerDashboard(target, capabilities));
  }

  async collectSample(
    request: RdbSampleRequest,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbRawSampleBatch>> {
    const collectionStartedAt = new Date().toISOString();
    const requested = new Set(request.metricIds);
    const observations: RdbRawObservation[] = [];
    const diagnostics: RdbSampleDiagnostic[] = [];
    let observedAt = collectionStartedAt;
    let epoch = this.epochByResourceKey.get(request.target.resourceKey) ?? 'unknown';

    await this.collectGroup(
      'performance-counters',
      SQLSERVER_DASHBOARD_PERFORMANCE_COUNTERS_SQL,
      PERFORMANCE_METRIC_IDS,
      requested,
      observations,
      diagnostics,
      (rows) => {
        observedAt = new Date().toISOString();
        const startTime = iso(rowValue(rows[0] ?? {}, 'sqlserver_start_time'));
        if (startTime) {
          epoch = startTime;
          this.epochByResourceKey.set(request.target.resourceKey, startTime);
        }
        for (const row of rows) this.appendPerformanceCounter(row, request.target.databaseName, requested, observations, diagnostics, observedAt);
      },
    );

    await this.collectGroup(
      'current-activity', SQLSERVER_DASHBOARD_ACTIVITY_SQL, ACTIVITY_METRIC_IDS,
      requested, observations, diagnostics,
      (rows) => {
        const row = rows[0];
        if (!row) return;
        observedAt = iso(rowValue(row, 'observed_at')) ?? new Date().toISOString();
        for (const metricId of ACTIVITY_METRIC_IDS) {
          if (requested.has(metricId)) observations.push({ metricId, observedAt, value: numberOrNull(rowValue(row, metricId)), status: 'ok' });
        }
      },
    );

    await this.collectGroup(
      'wait-statistics', SQLSERVER_DASHBOARD_WAIT_STATS_SQL, ['wait_time'],
      requested, observations, diagnostics,
      (rows) => {
        observedAt = new Date().toISOString();
        for (const row of rows) {
          observations.push({ metricId: 'wait_time', observedAt, value: numberOrNull(rowValue(row, 'wait_time_ms')), dimensions: { waitCategory: String(rowValue(row, 'wait_category') ?? 'Other') }, status: 'ok' });
        }
      },
    );

    await this.collectGroup(
      'file-io', SQLSERVER_DASHBOARD_FILE_IO_SQL, FILE_IO_METRIC_IDS,
      requested, observations, diagnostics,
      (rows) => {
        observedAt = new Date().toISOString();
        for (const row of rows) {
          const dimensions = { fileName: String(rowValue(row, 'file_name') ?? ''), fileType: String(rowValue(row, 'file_type') ?? 'other') };
          for (const metricId of FILE_IO_METRIC_IDS) {
            if (requested.has(metricId)) observations.push({ metricId, observedAt, value: numberOrNull(rowValue(row, metricId)), dimensions, status: 'ok' });
          }
        }
      },
    );

    await this.collectGroup(
      'database-files', SQLSERVER_DASHBOARD_DATABASE_FILES_SQL, DATABASE_FILE_METRIC_IDS,
      requested, observations, diagnostics,
      (rows) => {
        observedAt = new Date().toISOString();
        for (const row of rows) {
          const dimensions = { fileName: String(rowValue(row, 'file_name') ?? ''), fileType: String(rowValue(row, 'file_type') ?? 'other') };
          for (const metricId of DATABASE_FILE_METRIC_IDS) {
            if (requested.has(metricId)) {
              const value = numberOrNull(rowValue(row, metricId));
              observations.push({
                metricId,
                observedAt,
                value,
                dimensions,
                status: value === null ? 'unavailable' : 'ok',
              });
            }
          }
        }
      },
    );

    return ok({
      sampleSessionId: request.sampleSessionId,
      definitionVersion: request.definitionVersion,
      sequence: request.sequence,
      collectionStartedAt,
      collectionEndedAt: new Date().toISOString(),
      epochs: [{ key: 'sqlserver-start-time', value: epoch, reasonLabel: 'SQL Server service restart or DMV counter reset' }],
      observations,
      diagnostics,
    });
  }

  private appendPerformanceCounter(
    row: Row,
    databaseName: string,
    requested: ReadonlySet<string>,
    observations: RdbRawObservation[],
    diagnostics: RdbSampleDiagnostic[],
    observedAt: string,
  ): void {
    const counterName = String(rowValue(row, 'counter_name') ?? '').trim().toLowerCase();
    const metricId = PERF_COUNTER_TO_METRIC[counterName];
    if (!metricId || !requested.has(metricId)) return;
    const instanceName = String(rowValue(row, 'instance_name') ?? '').trim();
    if (metricId === 'transactions' && instanceName.toLowerCase() !== databaseName.toLowerCase()) return;
    if (metricId === 'lock_waits' && instanceName !== '_Total') return;
    const cntrType = numberOrNull(rowValue(row, 'cntr_type'));
    const expectedGauge = metricId === 'user_connections' || metricId === 'page_life_expectancy';
    const expectedFraction = metricId === 'buffer_cache_hits';
    const expectedBase = metricId === 'buffer_cache_lookups';
    const supported =
      cntrType !== null &&
      (expectedGauge
        ? GAUGE_COUNTER_TYPES.has(cntrType)
        : expectedFraction
          ? cntrType === 537003264
          : expectedBase
            ? cntrType === 1073939712
            : RATE_COUNTER_TYPES.has(cntrType));
    if (!supported) {
      observations.push({ metricId, observedAt, value: null, status: 'unavailable', messageCode: 'unsupported-counter-type' });
      if (!diagnostics.some((it) => it.code === 'unsupported-counter-type')) diagnostics.push({ sectionId: 'performance-counters', severity: 'warning', code: 'unsupported-counter-type', message: 'A SQL Server performance counter used an unsupported cntr_type and was not interpreted.' });
      return;
    }
    observations.push({
      metricId,
      observedAt,
      value: numberOrNull(rowValue(row, 'cntr_value')),
      ...(metricId === 'page_life_expectancy' ? { dimensions: { instanceName: instanceName || 'default' } } : {}),
      status: 'ok',
    });
  }

  private async collectGroup(
    sectionId: ProbeId,
    sql: string,
    metricIds: readonly string[],
    requested: ReadonlySet<string>,
    observations: RdbRawObservation[],
    diagnostics: RdbSampleDiagnostic[],
    append: (rows: Row[]) => void,
  ): Promise<void> {
    const selected = metricIds.filter((id) => requested.has(id));
    if (selected.length === 0) return;
    try {
      const result = await this.driver.requestSql({ sql, conditions: { rawQueries: true } });
      const before = new Map(
        selected.map((metricId) => [
          metricId,
          observations.filter((item) => item.metricId === metricId).length,
        ]),
      );
      append(result.rows.map((item) => item.values as Row));
      const at = new Date().toISOString();
      for (const metricId of selected) {
        const count = observations.filter((item) => item.metricId === metricId).length;
        if (count === before.get(metricId)) {
          observations.push({
            metricId,
            observedAt: at,
            value: null,
            status: 'unavailable',
            messageCode: 'metric-row-unavailable',
          });
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[SQLServerRdbDashboardProvider:${sectionId}Sample]`, error);
      diagnostics.push({ sectionId, severity: 'warning', code: `${sectionId}-failed`, message: `SQL Server ${sectionId} metrics could not be collected.` });
      const at = new Date().toISOString();
      for (const metricId of selected) observations.push({ metricId, observedAt: at, value: null, status: 'failed' });
    }
  }
}
