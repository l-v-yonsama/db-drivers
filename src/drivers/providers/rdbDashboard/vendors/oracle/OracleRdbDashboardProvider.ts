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
  OracleDashboardContext,
  oracleConnectionScope,
  ORACLE_RDB_DASHBOARD_PROVIDER_ID,
  resolveOracleDashboard,
} from './oracleDashboardCatalog';
import {
  ORACLE_DASHBOARD_CONTEXT_SQL,
  ORACLE_DASHBOARD_INSTANCE_SYSMETRIC_SQL,
  ORACLE_DASHBOARD_PDB_SYSMETRIC_SQL,
  ORACLE_DASHBOARD_RESOURCE_LIMIT_SQL,
  ORACLE_DASHBOARD_SESSIONS_SQL,
  ORACLE_DASHBOARD_SYSSTAT_SQL,
  ORACLE_DASHBOARD_SYSTEM_EVENT_SQL,
} from './oracleDashboardQueries';

type Row = Record<string, unknown>;

const NATIVE_NAME_TO_METRIC: Readonly<Record<string, string>> = {
  'user calls per sec': 'user_calls',
  'executions per sec': 'executions',
  'database time per sec': 'database_time',
  'cpu usage per sec': 'cpu_usage',
  'logical reads per sec': 'logical_reads',
  'physical reads per sec': 'physical_reads',
  'physical writes per sec': 'physical_writes',
};

const SYSSTAT_NAME_TO_METRIC: Readonly<Record<string, string>> = {
  'user calls': 'user_calls',
  'execute count': 'executions',
  'session logical reads': 'logical_reads',
  'physical reads': 'physical_reads',
  'physical writes': 'physical_writes',
};

const SAMPLED_METRIC_IDS = [
  'user_calls',
  'executions',
  'database_time',
  'cpu_usage',
  'logical_reads',
  'physical_reads',
  'physical_writes',
] as const;

const SESSION_METRIC_IDS = ['active_sessions', 'inactive_sessions', 'current_waits'] as const;
const RESOURCE_METRIC_IDS = [
  'sessions_current',
  'sessions_limit',
  'processes_current',
  'processes_limit',
] as const;

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

function iso(value: unknown, fallback = new Date().toISOString()): string {
  const date = value instanceof Date ? value : new Date(String(value ?? ''));
  return Number.isFinite(date.getTime()) ? date.toISOString() : fallback;
}

function contextVariant(containerId: number): string {
  if (containerId > 1) return 'oracle-pdb';
  if (containerId === 1) return 'oracle-cdb-root';
  return 'oracle-non-cdb';
}

export class OracleRdbDashboardProvider implements RdbDashboardProvider {
  readonly providerId = ORACLE_RDB_DASHBOARD_PROVIDER_ID;
  private capabilitiesByResourceKey = new Map<string, RdbDashboardCapabilities>();
  private contextByResourceKey = new Map<string, OracleDashboardContext>();
  private nativeGroupByResourceKey = new Map<string, number>();
  private epochByResourceKey = new Map<string, string>();

  constructor(private readonly driver: RDSBaseDriver) {}

  async checkCapabilities(
    target: RdbDashboardTarget,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbDashboardCapabilities>> {
    try {
      const base = await this.driver.requestSql({
        sql: ORACLE_DASHBOARD_CONTEXT_SQL,
        conditions: { rawQueries: true },
      });
      const row = base.rows[0]?.values as Row | undefined;
      if (!row || String(rowValue(row, 'DATABASE_NAME')).toUpperCase() !== target.databaseName.toUpperCase()) {
        return {
          ok: false,
          message: 'The observer connection is not connected to the requested Oracle database or PDB.',
        };
      }
      const containerId = numberOrNull(rowValue(row, 'CONTAINER_ID')) ?? 0;
      const nativeSql =
        containerId > 1
          ? ORACLE_DASHBOARD_PDB_SYSMETRIC_SQL
          : ORACLE_DASHBOARD_INSTANCE_SYSMETRIC_SQL;
      let nativeRows: Row[] = [];
      let nativeProbeFailed = false;
      try {
        const result = await this.driver.requestSql({
          sql: nativeSql,
          conditions: { rawQueries: true },
        });
        nativeRows = result.rows.map((item) => item.values as Row);
      } catch (error) {
        nativeProbeFailed = true;
        // eslint-disable-next-line no-console
        console.error('[OracleRdbDashboardProvider:nativeMetricsProbe]', error);
      }

      const selectedNativeRows = this.selectNativeRows(nativeRows, containerId);
      const nativeMetricNames = new Set(
        selectedNativeRows.map((item) => String(rowValue(item, 'METRIC_NAME')).toLowerCase()),
      );
      const nativeMetricsAvailable = selectedNativeRows.length > 0;
      const interval =
        numberOrNull(rowValue(selectedNativeRows[0] ?? {}, 'INTSIZE_CSEC')) ?? 6000;
      const nativeIntervalSeconds = Math.max(1, Math.round(interval / 100));
      const nativeGroup = numberOrNull(rowValue(selectedNativeRows[0] ?? {}, 'GROUP_ID'));
      if (nativeGroup !== null) this.nativeGroupByResourceKey.set(target.resourceKey, nativeGroup);

      const context: OracleDashboardContext = {
        containerId,
        containerName: String(rowValue(row, 'CONTAINER_NAME') ?? target.databaseName),
        instanceName: String(rowValue(row, 'INSTANCE_NAME') ?? 'unknown'),
        nativeMetricsAvailable,
        nativeIntervalSeconds,
      };
      const connectionScope = oracleConnectionScope(context);
      const instanceScope = { kind: 'instance', label: `Oracle instance ${context.instanceName}` };

      const probe = async (
        sectionId: string,
        sql: string,
        scope: { kind: string; label: string },
        requireRows = false,
      ): Promise<RdbDashboardSectionCapability> => {
        try {
          const result = await this.driver.requestSql({ sql, conditions: { rawQueries: true } });
          if (requireRows && result.rows.length === 0) {
            return {
              sectionId,
              status: 'unavailable',
              scope,
              reasonCode: 'no-visible-rows',
              message: `${sectionId} returned no rows in the current Oracle container.`,
            };
          }
          return { sectionId, status: 'available', scope };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`[OracleRdbDashboardProvider:${sectionId}Probe]`, error);
          return {
            sectionId,
            status: 'unavailable',
            scope,
            reasonCode: 'dynamic-performance-view-unavailable',
            message: `${sectionId} is unavailable with the current Oracle grants.`,
            requiredPermissions: ['SELECT_CATALOG_ROLE or an explicit SELECT grant on the required V$ view'],
          };
        }
      };

      const [sessions, resourceLimits, systemEvents, systemStatistics] = await Promise.all([
        probe('sessions', ORACLE_DASHBOARD_SESSIONS_SQL, connectionScope),
        probe('resource-limits', ORACLE_DASHBOARD_RESOURCE_LIMIT_SQL, instanceScope, true),
        probe(
          'system-events',
          ORACLE_DASHBOARD_SYSTEM_EVENT_SQL,
          containerId > 1 ? connectionScope : instanceScope,
        ),
        probe(
          'system-statistics',
          ORACLE_DASHBOARD_SYSSTAT_SQL,
          containerId > 1 ? connectionScope : instanceScope,
          true,
        ),
      ]);

      let queryStatisticsAvailable = false;
      try {
        queryStatisticsAvailable = (
          await this.driver.checkStatementStatisticsAvailability(target.databaseName)
        ).ok;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[OracleRdbDashboardProvider:queryStatisticsProbe]', error);
      }

      const nativeStatus = nativeMetricsAvailable
        ? nativeMetricNames.size === Object.keys(NATIVE_NAME_TO_METRIC).length
          ? 'available'
          : 'partial'
        : 'unavailable';
      const capabilities: RdbDashboardCapabilities = {
        providerId: this.providerId,
        variant: contextVariant(containerId),
        serverVersion: String(rowValue(row, 'SERVER_VERSION') ?? ''),
        observerIdentity: String(rowValue(row, 'OBSERVER_SID') ?? ''),
        sections: [
          {
            sectionId: 'native-metrics',
            status: nativeStatus,
            scope: containerId > 1 ? connectionScope : instanceScope,
            ...(nativeStatus !== 'available'
              ? {
                  reasonCode: nativeProbeFailed
                    ? 'dynamic-performance-view-unavailable'
                    : 'native-metrics-missing',
                  message: nativeProbeFailed
                    ? 'Oracle native metrics are unavailable with the current grants.'
                    : 'Oracle returned no complete native metric group; V$SYSSTAT fallback is used.',
                }
              : {}),
          },
          sessions,
          resourceLimits,
          systemEvents,
          systemStatistics,
          {
            sectionId: 'native-history',
            status: 'unavailable',
            scope: containerId > 1 ? connectionScope : instanceScope,
            reasonCode: 'license-safe-baseline',
            message: 'V$SYSMETRIC_HISTORY is intentionally not queried by the initial license-safe implementation.',
          },
          {
            sectionId: 'query-statistics',
            status: queryStatisticsAvailable ? 'available' : 'unavailable',
            scope: connectionScope,
            ...(!queryStatisticsAvailable
              ? {
                  reasonCode: 'v-sqlstats-unavailable',
                  message: 'V$SQLSTATS is unavailable with the current Oracle grants.',
                  requiredPermissions: ['SELECT on V$SQLSTATS'],
                }
              : {}),
          },
        ],
      };
      this.contextByResourceKey.set(target.resourceKey, context);
      this.capabilitiesByResourceKey.set(target.resourceKey, capabilities);
      return ok(capabilities);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[OracleRdbDashboardProvider:checkCapabilities]', error);
      return { ok: false, message: 'Oracle dashboard capabilities could not be checked.' };
    }
  }

  async resolveDashboard(
    target: RdbDashboardTarget,
    _selection: RdbDashboardSelection,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<ResolvedRdbDashboard>> {
    let capabilities = this.capabilitiesByResourceKey.get(target.resourceKey);
    let context = this.contextByResourceKey.get(target.resourceKey);
    if (!capabilities || !context) {
      const checked = await this.checkCapabilities(target, options);
      if (!checked.ok || !checked.result) return { ok: false, message: checked.message };
      capabilities = checked.result;
      context = this.contextByResourceKey.get(target.resourceKey);
    }
    if (!context) return { ok: false, message: 'Oracle dashboard context was not resolved.' };
    return ok(resolveOracleDashboard(target, capabilities, context));
  }

  async collectSample(
    request: RdbSampleRequest,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbRawSampleBatch>> {
    const context = this.contextByResourceKey.get(request.target.resourceKey);
    if (!context) {
      return { ok: false, message: 'Oracle dashboard capabilities must be checked before sampling.' };
    }
    const collectionStartedAt = new Date().toISOString();
    const requested = new Set(request.metricIds);
    const observations: RdbRawObservation[] = [];
    const diagnostics: RdbSampleDiagnostic[] = [];
    let epoch = this.epochByResourceKey.get(request.target.resourceKey) ?? 'unknown';

    const sampledRequested = SAMPLED_METRIC_IDS.some((id) => requested.has(id));
    const epochRequired = sampledRequested || requested.has('completed_wait_time');
    let sysstatRows: Row[] = [];
    if (epochRequired) {
      try {
        const result = await this.driver.requestSql({
          sql: ORACLE_DASHBOARD_SYSSTAT_SQL,
          conditions: { rawQueries: true },
        });
        sysstatRows = result.rows.map((item) => item.values as Row);
        const startup = iso(rowValue(sysstatRows[0] ?? {}, 'STARTUP_TIME'), '');
        if (startup) {
          epoch = startup;
          this.epochByResourceKey.set(request.target.resourceKey, startup);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[OracleRdbDashboardProvider:systemStatisticsSample]', error);
        diagnostics.push({ sectionId: 'system-statistics', severity: 'warning', code: 'system-statistics-failed', message: 'Oracle system statistics could not be collected.' });
      }
    }

    if (sampledRequested) {
      if (context.nativeMetricsAvailable) {
        await this.collectNativeMetrics(request, context, requested, observations, diagnostics);
      } else {
        this.appendSysstatMetrics(context, sysstatRows, requested, observations);
      }
      this.appendMissing(SAMPLED_METRIC_IDS, requested, observations, 'metric-row-unavailable');
    }

    if (SESSION_METRIC_IDS.some((id) => requested.has(id))) {
      try {
        const result = await this.driver.requestSql({
          sql: ORACLE_DASHBOARD_SESSIONS_SQL,
          conditions: { rawQueries: true },
        });
        const rows = result.rows.map((item) => item.values as Row);
        const observedAt = iso(rowValue(rows[0] ?? {}, 'OBSERVED_AT'));
        let active = 0;
        let inactive = 0;
        for (const row of rows) {
          const count = numberOrNull(rowValue(row, 'SESSION_COUNT')) ?? 0;
          const status = String(rowValue(row, 'STATUS') ?? '').toUpperCase();
          if (status === 'ACTIVE') active += count;
          else inactive += count;
          const waitClass = String(rowValue(row, 'WAIT_CLASS') ?? 'Other');
          if (requested.has('current_waits') && status === 'ACTIVE' && waitClass !== 'Idle' && waitClass !== 'CPU') {
            observations.push({ metricId: 'current_waits', observedAt, value: count, dimensions: { waitClass }, status: 'ok' });
          }
        }
        if (requested.has('active_sessions')) observations.push({ metricId: 'active_sessions', observedAt, value: active, status: 'ok' });
        if (requested.has('inactive_sessions')) observations.push({ metricId: 'inactive_sessions', observedAt, value: inactive, status: 'ok' });
        if (requested.has('current_waits') && !observations.some((item) => item.metricId === 'current_waits')) {
          observations.push({ metricId: 'current_waits', observedAt, value: 0, dimensions: { waitClass: 'None' }, status: 'ok' });
        }
      } catch (error) {
        this.failSection('sessions', SESSION_METRIC_IDS, requested, observations, diagnostics, error);
      }
    }

    if (RESOURCE_METRIC_IDS.some((id) => requested.has(id))) {
      try {
        const result = await this.driver.requestSql({
          sql: ORACLE_DASHBOARD_RESOURCE_LIMIT_SQL,
          conditions: { rawQueries: true },
        });
        const observedAt = new Date().toISOString();
        for (const item of result.rows) {
          const row = item.values as Row;
          const resourceName = String(rowValue(row, 'RESOURCE_NAME') ?? '').toLowerCase();
          if (resourceName !== 'sessions' && resourceName !== 'processes') continue;
          const currentId = `${resourceName}_current`;
          const limitId = `${resourceName}_limit`;
          if (requested.has(currentId)) observations.push({ metricId: currentId, observedAt, value: numberOrNull(rowValue(row, 'CURRENT_UTILIZATION')), status: 'ok' });
          if (requested.has(limitId)) {
            const limit = numberOrNull(rowValue(row, 'LIMIT_VALUE'));
            observations.push({ metricId: limitId, observedAt, value: limit, status: limit === null ? 'unavailable' : 'ok', ...(limit === null ? { messageCode: 'unlimited-resource' } : {}) });
          }
        }
        this.appendMissing(RESOURCE_METRIC_IDS, requested, observations, 'resource-limit-unavailable');
      } catch (error) {
        this.failSection('resource-limits', RESOURCE_METRIC_IDS, requested, observations, diagnostics, error);
      }
    }

    if (requested.has('completed_wait_time')) {
      try {
        const result = await this.driver.requestSql({
          sql: ORACLE_DASHBOARD_SYSTEM_EVENT_SQL,
          conditions: { rawQueries: true },
        });
        const observedAt = new Date().toISOString();
        for (const item of result.rows) {
          const row = item.values as Row;
          const rowConId = numberOrNull(rowValue(row, 'CON_ID')) ?? 0;
          if (context.containerId > 1 ? rowConId !== context.containerId : rowConId !== 0) continue;
          const micros = numberOrNull(rowValue(row, 'TIME_WAITED_MICRO'));
          observations.push({ metricId: 'completed_wait_time', observedAt, value: micros === null ? null : micros / 1000, dimensions: { waitClass: String(rowValue(row, 'WAIT_CLASS') ?? 'Other') }, status: micros === null ? 'unavailable' : 'ok' });
        }
        this.appendMissing(['completed_wait_time'], requested, observations, 'wait-statistics-unavailable');
      } catch (error) {
        this.failSection('system-events', ['completed_wait_time'], requested, observations, diagnostics, error);
      }
    }

    return ok({
      sampleSessionId: request.sampleSessionId,
      definitionVersion: request.definitionVersion,
      sequence: request.sequence,
      collectionStartedAt,
      collectionEndedAt: new Date().toISOString(),
      epochs: [{ key: 'oracle-instance-startup', value: epoch, reasonLabel: 'Oracle instance startup or dynamic statistic reset' }],
      observations,
      diagnostics,
    });
  }

  private async collectNativeMetrics(
    request: RdbSampleRequest,
    context: OracleDashboardContext,
    requested: ReadonlySet<string>,
    observations: RdbRawObservation[],
    diagnostics: RdbSampleDiagnostic[],
  ): Promise<void> {
    try {
      const sql = context.containerId > 1 ? ORACLE_DASHBOARD_PDB_SYSMETRIC_SQL : ORACLE_DASHBOARD_INSTANCE_SYSMETRIC_SQL;
      const result = await this.driver.requestSql({ sql, conditions: { rawQueries: true } });
      const rows = this.selectNativeRows(
        result.rows.map((item) => item.values as Row),
        context.containerId,
        this.nativeGroupByResourceKey.get(request.target.resourceKey),
      );
      for (const row of rows) {
        const metricId = NATIVE_NAME_TO_METRIC[String(rowValue(row, 'METRIC_NAME') ?? '').toLowerCase()];
        if (!metricId || !requested.has(metricId)) continue;
        const value = numberOrNull(rowValue(row, 'VALUE'));
        observations.push({ metricId, observedAt: iso(rowValue(row, 'END_TIME')), value, status: value === null ? 'unavailable' : 'ok' });
      }
    } catch (error) {
      this.failSection('native-metrics', SAMPLED_METRIC_IDS, requested, observations, diagnostics, error);
    }
  }

  private appendSysstatMetrics(
    context: OracleDashboardContext,
    rows: Row[],
    requested: ReadonlySet<string>,
    observations: RdbRawObservation[],
  ): void {
    const observedAt = new Date().toISOString();
    for (const row of rows) {
      const rowConId = numberOrNull(rowValue(row, 'CON_ID')) ?? 0;
      if (context.containerId > 1 ? rowConId !== context.containerId : rowConId !== 0) continue;
      const metricId = SYSSTAT_NAME_TO_METRIC[String(rowValue(row, 'NAME') ?? '').toLowerCase()];
      if (!metricId || !requested.has(metricId)) continue;
      const value = numberOrNull(rowValue(row, 'VALUE'));
      observations.push({ metricId, observedAt, value, status: value === null ? 'unavailable' : 'ok' });
    }
  }

  private selectNativeRows(rows: Row[], containerId: number, groupId?: number): Row[] {
    const scoped = rows.filter((row) => {
      const rowConId = numberOrNull(rowValue(row, 'CON_ID')) ?? 0;
      return containerId > 1 ? rowConId === containerId : rowConId === 0;
    });
    const selectedGroup =
      groupId ??
      numberOrNull(
        rowValue(
          [...scoped].sort(
            (left, right) =>
              (numberOrNull(rowValue(left, 'INTSIZE_CSEC')) ?? Number.MAX_SAFE_INTEGER) -
              (numberOrNull(rowValue(right, 'INTSIZE_CSEC')) ?? Number.MAX_SAFE_INTEGER),
          )[0] ?? {},
          'GROUP_ID',
        ),
      );
    return selectedGroup === null
      ? []
      : scoped.filter((row) => numberOrNull(rowValue(row, 'GROUP_ID')) === selectedGroup);
  }

  private appendMissing(
    metricIds: readonly string[],
    requested: ReadonlySet<string>,
    observations: RdbRawObservation[],
    messageCode: string,
  ): void {
    const observedAt = new Date().toISOString();
    for (const metricId of metricIds) {
      if (requested.has(metricId) && !observations.some((item) => item.metricId === metricId)) {
        observations.push({ metricId, observedAt, value: null, status: 'unavailable', messageCode });
      }
    }
  }

  private failSection(
    sectionId: string,
    metricIds: readonly string[],
    requested: ReadonlySet<string>,
    observations: RdbRawObservation[],
    diagnostics: RdbSampleDiagnostic[],
    error: unknown,
  ): void {
    // eslint-disable-next-line no-console
    console.error(`[OracleRdbDashboardProvider:${sectionId}Sample]`, error);
    diagnostics.push({ sectionId, severity: 'warning', code: `${sectionId}-failed`, message: `Oracle ${sectionId} metrics could not be collected.` });
    const observedAt = new Date().toISOString();
    for (const metricId of metricIds) {
      if (requested.has(metricId)) observations.push({ metricId, observedAt, value: null, status: 'failed' });
    }
  }
}
