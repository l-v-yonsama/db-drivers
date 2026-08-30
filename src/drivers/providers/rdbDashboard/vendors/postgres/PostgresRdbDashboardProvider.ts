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
  POSTGRES_RDB_DASHBOARD_PROVIDER_ID,
  resolvePostgresDashboard,
} from './postgresDashboardCatalog';
import {
  POSTGRES_DASHBOARD_CAPABILITIES_SQL,
  POSTGRES_DASHBOARD_DATABASE_SAMPLE_SQL,
  POSTGRES_DASHBOARD_WAITS_SAMPLE_SQL,
} from './postgresDashboardQueries';

type Row = Record<string, unknown>;

const DATABASE_METRIC_IDS = [
  'connections',
  'active_sessions',
  'idle_in_transaction',
  'waiting_sessions',
  'xact_commit',
  'xact_rollback',
  'rows_returned',
  'rows_fetched',
  'rows_inserted',
  'rows_updated',
  'rows_deleted',
  'blocks_read',
  'blocks_hit',
  'blocks_requested',
  'temp_files',
  'temp_bytes',
  'deadlocks',
  'block_read_time',
  'block_write_time',
] as const;

function bool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function iso(value: unknown, fallback = new Date().toISOString()): string {
  const date = value instanceof Date ? value : new Date(String(value ?? ''));
  return Number.isFinite(date.getTime()) ? date.toISOString() : fallback;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ok<T>(result: T): GeneralResult<T> {
  return { ok: true, message: '', result };
}

export class PostgresRdbDashboardProvider implements RdbDashboardProvider {
  readonly providerId = POSTGRES_RDB_DASHBOARD_PROVIDER_ID;
  private capabilitiesByResourceKey = new Map<string, RdbDashboardCapabilities>();

  constructor(private readonly driver: RDSBaseDriver) {}

  async checkCapabilities(
    target: RdbDashboardTarget,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbDashboardCapabilities>> {
    try {
      const result = await this.driver.requestSql({
        sql: POSTGRES_DASHBOARD_CAPABILITIES_SQL,
        conditions: { rawQueries: true },
      });
      const row = result.rows[0]?.values as Row | undefined;
      if (!row || String(row.database_name) !== target.databaseName) {
        return {
          ok: false,
          message: 'The observer connection is not connected to the requested PostgreSQL database.',
        };
      }
      const canReadAllStats = bool(row.can_read_all_stats);
      const trackIoTiming = bool(row.track_io_timing);
      const capabilities: RdbDashboardCapabilities = {
        providerId: this.providerId,
        variant: `postgres-${Math.floor(Number(row.server_version_num) / 10_000)}`,
        serverVersion: String(row.server_version),
        observerIdentity: String(row.observer_pid),
        sections: [
          {
            sectionId: 'database-statistics',
            status: 'available',
            scope: { kind: 'database', label: `Database ${target.databaseName}` },
          },
          {
            sectionId: 'activity',
            status: canReadAllStats ? 'available' : 'partial',
            scope: { kind: 'database', label: `Database ${target.databaseName}` },
            ...(!canReadAllStats
              ? {
                  reasonCode: 'limited-statistics-visibility',
                  message:
                    'Session details can be limited to the current user. Counts may not represent every session.',
                  requiredPermissions: ['pg_read_all_stats'],
                }
              : {}),
          },
          {
            sectionId: 'io-timing',
            status: trackIoTiming ? 'available' : 'unavailable',
            scope: { kind: 'database', label: `Database ${target.databaseName}` },
            ...(!trackIoTiming
              ? {
                  reasonCode: 'track-io-timing-disabled',
                  message: 'track_io_timing is disabled, so block read/write time is not measured.',
                }
              : {}),
          },
          {
            sectionId: 'pg-stat-io',
            status: bool(row.has_pg_stat_io) ? 'available' : 'unavailable',
            scope: { kind: 'cluster', label: 'PostgreSQL cluster' },
            ...(!bool(row.has_pg_stat_io)
              ? {
                  reasonCode: 'version-not-supported',
                  message: 'pg_stat_io requires PostgreSQL 16 or later.',
                }
              : {}),
          },
          {
            sectionId: 'query-statistics',
            status: bool(row.has_pg_stat_statements) ? 'available' : 'unavailable',
            scope: { kind: 'database', label: `Database ${target.databaseName}` },
            ...(!bool(row.has_pg_stat_statements)
              ? {
                  reasonCode: 'extension-not-installed',
                  message: 'pg_stat_statements is not available in this database.',
                }
              : {}),
          },
        ],
      };
      this.capabilitiesByResourceKey.set(target.resourceKey, capabilities);
      return ok(capabilities);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[PostgresRdbDashboardProvider:checkCapabilities]', error);
      return {
        ok: false,
        message: 'PostgreSQL dashboard capabilities could not be checked.',
      };
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
    return ok(resolvePostgresDashboard(target, capabilities));
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
    let statsReset = 'not-reset';

    try {
      const result = await this.driver.requestSql({
        sql: POSTGRES_DASHBOARD_DATABASE_SAMPLE_SQL,
        conditions: { rawQueries: true },
      });
      const row = result.rows[0]?.values as Row | undefined;
      if (!row) {
        return { ok: false, message: 'PostgreSQL returned no database statistics row.' };
      }
      observedAt = iso(row.observed_at, collectionStartedAt);
      statsReset = row.stats_reset ? iso(row.stats_reset, String(row.stats_reset)) : 'not-reset';
      for (const metricId of DATABASE_METRIC_IDS) {
        if (!requested.has(metricId)) continue;
        observations.push({
          metricId,
          observedAt,
          value: numberOrNull(row[metricId]),
          status: 'ok',
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[PostgresRdbDashboardProvider:databaseSample]', error);
      diagnostics.push({
        sectionId: 'database-statistics',
        severity: 'error',
        code: 'database-statistics-failed',
        message: 'PostgreSQL database statistics could not be collected.',
      });
      for (const metricId of DATABASE_METRIC_IDS) {
        if (requested.has(metricId)) {
          observations.push({ metricId, observedAt, value: null, status: 'failed' });
        }
      }
    }

    if (requested.has('waiting_sessions_by_type')) {
      try {
        const result = await this.driver.requestSql({
          sql: POSTGRES_DASHBOARD_WAITS_SAMPLE_SQL,
          conditions: { rawQueries: true },
        });
        for (const item of result.rows) {
          const row = item.values as Row;
          observations.push({
            metricId: 'waiting_sessions_by_type',
            observedAt: iso(row.observed_at, observedAt),
            value: numberOrNull(row.waiting_sessions_by_type),
            dimensions: { waitEventType: String(row.wait_event_type) },
            status: 'ok',
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[PostgresRdbDashboardProvider:waitSample]', error);
        diagnostics.push({
          sectionId: 'activity',
          severity: 'warning',
          code: 'wait-statistics-failed',
          message: 'Current PostgreSQL wait statistics could not be collected.',
        });
        observations.push({
          metricId: 'waiting_sessions_by_type',
          observedAt,
          value: null,
          status: 'failed',
        });
      }
    }

    return ok({
      sampleSessionId: request.sampleSessionId,
      definitionVersion: request.definitionVersion,
      sequence: request.sequence,
      collectionStartedAt,
      collectionEndedAt: new Date().toISOString(),
      epochs: [
        {
          key: 'pg-stat-database',
          value: statsReset,
          reasonLabel: 'pg_stat_database statistics reset',
        },
      ],
      observations,
      diagnostics,
    });
  }
}
