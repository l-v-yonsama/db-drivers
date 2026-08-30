import { RDSBaseDriver } from '../../../../RDSBaseDriver';
import { GeneralResult } from '../../../../../types/drivers/GeneralResult';
import {
  RdbDashboardCallOptions,
  RdbDashboardCapabilities,
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
  dashboardBoolean as bool,
  dashboardNumberOrNull as numberOrNull,
  dashboardRowValue as rowValue,
  dashboardSuccess as ok,
} from '../../rdbDashboardValueUtils';
import {
  MYSQL_RDB_DASHBOARD_PROVIDER_ID,
  resolveMysqlDashboard,
} from './mysqlDashboardCatalog';
import {
  MYSQL_DASHBOARD_CAPABILITIES_SQL,
  MYSQL_DASHBOARD_DATABASE_SIZE_SQL,
  MYSQL_DASHBOARD_GLOBAL_STATUS_SQL,
  MYSQL_DASHBOARD_QUERY_STATISTICS_PROBE_SQL,
} from './mysqlDashboardQueries';

type Row = Record<string, unknown>;

const STATUS_TO_METRIC: Readonly<Record<string, string>> = {
  threads_connected: 'threads_connected',
  threads_running: 'threads_running',
  questions: 'questions',
  com_commit: 'com_commit',
  com_rollback: 'com_rollback',
  bytes_received: 'bytes_received',
  bytes_sent: 'bytes_sent',
  slow_queries: 'slow_queries',
  innodb_buffer_pool_read_requests: 'innodb_buffer_pool_read_requests',
  innodb_buffer_pool_reads: 'innodb_buffer_pool_reads',
  innodb_buffer_pool_pages_dirty: 'innodb_buffer_pool_pages_dirty',
  innodb_buffer_pool_pages_free: 'innodb_buffer_pool_pages_free',
  innodb_row_lock_current_waits: 'innodb_row_lock_current_waits',
  innodb_row_lock_waits: 'innodb_row_lock_waits',
  innodb_row_lock_time: 'innodb_row_lock_time',
  created_tmp_tables: 'created_tmp_tables',
  created_tmp_disk_tables: 'created_tmp_disk_tables',
};

const INNODB_STATUS_NAMES = new Set(
  Object.keys(STATUS_TO_METRIC).filter((name) => name.startsWith('innodb_')),
);

function statusMap(rows: Array<{ values: Row }>): Map<string, number | null> {
  const values = new Map<string, number | null>();
  for (const item of rows) {
    const name = String(rowValue(item.values, 'Variable_name', 'variable_name') ?? '').toLowerCase();
    if (name) values.set(name, numberOrNull(rowValue(item.values, 'Value', 'value')));
  }
  return values;
}

export class MySQLRdbDashboardProvider implements RdbDashboardProvider {
  readonly providerId = MYSQL_RDB_DASHBOARD_PROVIDER_ID;
  private capabilitiesByResourceKey = new Map<string, RdbDashboardCapabilities>();
  private epochByResourceKey = new Map<string, { uptime: number; generation: number }>();
  private databaseSizeByResourceKey = new Map<string, number>();

  constructor(private readonly driver: RDSBaseDriver) {}

  async checkCapabilities(
    target: RdbDashboardTarget,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbDashboardCapabilities>> {
    try {
      const capabilityResult = await this.driver.requestSql({
        sql: MYSQL_DASHBOARD_CAPABILITIES_SQL,
        conditions: { rawQueries: true },
      });
      const row = capabilityResult.rows[0]?.values as Row | undefined;
      if (!row || String(rowValue(row, 'database_name') ?? '') !== target.databaseName) {
        return {
          ok: false,
          message: 'The observer connection is not connected to the requested MySQL database.',
        };
      }

      const globalStatusResult = await this.driver.requestSql({
        sql: MYSQL_DASHBOARD_GLOBAL_STATUS_SQL,
        conditions: { rawQueries: true },
      });
      const statuses = statusMap(globalStatusResult.rows as Array<{ values: Row }>);
      const performanceSchema = bool(rowValue(row, 'performance_schema_enabled'));
      let queryStatisticsAvailable = false;
      if (performanceSchema) {
        try {
          await this.driver.requestSql({
            sql: MYSQL_DASHBOARD_QUERY_STATISTICS_PROBE_SQL,
            conditions: { rawQueries: true },
          });
          queryStatisticsAvailable = true;
        } catch (error) {
          // The dashboard remains useful through SHOW GLOBAL STATUS. Do not
          // turn a digest permission/consumer issue into a total failure.
          // eslint-disable-next-line no-console
          console.error('[MySQLRdbDashboardProvider:queryStatisticsProbe]', error);
        }
      }
      const versionComment = String(rowValue(row, 'version_comment') ?? '');
      const product = /mariadb/i.test(`${rowValue(row, 'server_version')} ${versionComment}`)
        ? 'MariaDB'
        : 'MySQL';
      const version = String(rowValue(row, 'server_version'));
      const majorVersion = version.match(/^\d+(?:\.\d+)?/)?.[0] ?? version;
      const hasInnoDbStatus = [...statuses.keys()].some((name) => INNODB_STATUS_NAMES.has(name));
      const instanceScope = { kind: 'instance', label: `${product} instance` };
      const capabilities: RdbDashboardCapabilities = {
        providerId: this.providerId,
        variant: `${product.toLowerCase()}-${majorVersion}`,
        serverVersion: version,
        observerIdentity: String(rowValue(row, 'observer_connection_id')),
        sections: [
          { sectionId: 'global-status', status: 'available', scope: instanceScope },
          {
            sectionId: 'innodb-status',
            status: hasInnoDbStatus ? 'available' : 'unavailable',
            scope: instanceScope,
            ...(!hasInnoDbStatus
              ? {
                  reasonCode: 'innodb-status-unavailable',
                  message: 'InnoDB status variables are unavailable on this server.',
                }
              : {}),
          },
          {
            sectionId: 'performance-schema',
            status: performanceSchema ? 'available' : 'unavailable',
            scope: instanceScope,
            ...(!performanceSchema
              ? {
                  reasonCode: 'performance-schema-disabled',
                  message:
                    'Performance Schema is disabled. Global status metrics remain available.',
                }
              : {}),
          },
          {
            sectionId: 'query-statistics',
            status: queryStatisticsAvailable ? 'available' : 'unavailable',
            scope: { kind: 'database', label: `Database ${target.databaseName}` },
            ...(!queryStatisticsAvailable
              ? {
                  reasonCode: performanceSchema
                    ? 'statement-digests-unavailable'
                    : 'performance-schema-disabled',
                  message: performanceSchema
                    ? 'Performance Schema statement digests are not readable or enabled.'
                    : 'Query statistics require Performance Schema statement digests.',
                }
              : {}),
          },
          {
            sectionId: 'database-size',
            status: 'available',
            scope: { kind: 'database', label: `Database ${target.databaseName}` },
          },
        ],
      };
      this.capabilitiesByResourceKey.set(target.resourceKey, capabilities);
      return ok(capabilities);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[MySQLRdbDashboardProvider:checkCapabilities]', error);
      return { ok: false, message: 'MySQL dashboard capabilities could not be checked.' };
    }
  }

  async resolveDashboard(
    target: RdbDashboardTarget,
    _selection: RdbDashboardSelection,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<ResolvedRdbDashboard>> {
    let capabilities = this.capabilitiesByResourceKey.get(target.resourceKey);
    if (!capabilities) {
      const result = await this.checkCapabilities(target, options);
      if (!result.ok || !result.result) return { ok: false, message: result.message };
      capabilities = result.result;
    }
    return ok(resolveMysqlDashboard(target, capabilities));
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
    let uptime: number | null = null;

    try {
      const result = await this.driver.requestSql({
        sql: MYSQL_DASHBOARD_GLOBAL_STATUS_SQL,
        conditions: { rawQueries: true },
      });
      observedAt = new Date().toISOString();
      const statuses = statusMap(result.rows as Array<{ values: Row }>);
      uptime = statuses.get('uptime') ?? null;
      for (const [statusName, metricId] of Object.entries(STATUS_TO_METRIC)) {
        if (!requested.has(metricId)) continue;
        const value = statuses.get(statusName);
        observations.push({
          metricId,
          observedAt,
          value: value ?? null,
          status: value === undefined ? 'unavailable' : 'ok',
          ...(value === undefined ? { messageCode: 'status-variable-unavailable' } : {}),
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[MySQLRdbDashboardProvider:globalStatusSample]', error);
      diagnostics.push({
        sectionId: 'global-status',
        severity: 'error',
        code: 'global-status-failed',
        message: 'MySQL global status metrics could not be collected.',
      });
      for (const metricId of Object.values(STATUS_TO_METRIC)) {
        if (requested.has(metricId)) {
          observations.push({ metricId, observedAt, value: null, status: 'failed' });
        }
      }
    }

    if (requested.has('database_size_bytes')) {
      let size = this.databaseSizeByResourceKey.get(request.target.resourceKey);
      if (size === undefined) {
        try {
          const result = await this.driver.requestSql({
            sql: MYSQL_DASHBOARD_DATABASE_SIZE_SQL,
            conditions: { binds: [request.target.databaseName], rawQueries: true },
          });
          size = numberOrNull(result.rows[0]?.values.database_size_bytes) ?? undefined;
          if (size !== undefined) this.databaseSizeByResourceKey.set(request.target.resourceKey, size);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[MySQLRdbDashboardProvider:databaseSizeSample]', error);
          diagnostics.push({
            sectionId: 'database-size',
            severity: 'warning',
            code: 'database-size-failed',
            message: 'The selected database size could not be collected.',
          });
        }
      }
      observations.push({
        metricId: 'database_size_bytes',
        observedAt,
        value: size ?? null,
        status: size === undefined ? 'failed' : 'ok',
      });
    }

    const epoch = this.resolveEpoch(request.target.resourceKey, uptime);
    return ok({
      sampleSessionId: request.sampleSessionId,
      definitionVersion: request.definitionVersion,
      sequence: request.sequence,
      collectionStartedAt,
      collectionEndedAt: new Date().toISOString(),
      epochs: [
        {
          key: 'mysql-server-uptime',
          value: epoch,
          reasonLabel: 'MySQL server restart or global status reset',
        },
      ],
      observations,
      diagnostics,
    });
  }

  private resolveEpoch(resourceKey: string, uptime: number | null): string {
    const previous = this.epochByResourceKey.get(resourceKey);
    if (!previous) {
      const first = { uptime: uptime ?? -1, generation: 0 };
      this.epochByResourceKey.set(resourceKey, first);
      return `server-generation-${first.generation}`;
    }
    const generation = uptime !== null && previous.uptime >= 0 && uptime < previous.uptime
      ? previous.generation + 1
      : previous.generation;
    this.epochByResourceKey.set(resourceKey, { uptime: uptime ?? previous.uptime, generation });
    return `server-generation-${generation}`;
  }
}
