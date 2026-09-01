import {
  DBType,
  POSTGRES_DASHBOARD_CAPABILITIES_SQL,
  POSTGRES_DASHBOARD_DATABASE_SAMPLE_SQL,
  POSTGRES_DASHBOARD_WAITS_SAMPLE_SQL,
  PostgresRdbDashboardProvider,
  RdbDashboardTarget,
  RDSBaseDriver,
  validateResolvedRdbDashboard,
} from '../../../src';

const target: RdbDashboardTarget = {
  resourceKey: 'runtime-postgres',
  databaseName: 'app',
  dbType: DBType.Postgres,
};

function rdh(rows: Array<Record<string, unknown>>) {
  return { rows: rows.map((values) => ({ values })) } as any;
}

function capabilityRow(overrides: Record<string, unknown> = {}) {
  return {
    database_name: 'app',
    server_version: '16.4',
    server_version_num: 160004,
    track_io_timing: true,
    observer_pid: 123,
    can_read_all_stats: true,
    has_pg_stat_io: true,
    has_pg_stat_statements: true,
    ...overrides,
  };
}

describe('PostgresRdbDashboardProvider', () => {
  it('uses read-only static PostgreSQL catalog queries', () => {
    for (const sql of [
      POSTGRES_DASHBOARD_CAPABILITIES_SQL,
      POSTGRES_DASHBOARD_DATABASE_SAMPLE_SQL,
      POSTGRES_DASHBOARD_WAITS_SAMPLE_SQL,
    ]) {
      expect(sql.trim()).toMatch(/^(SELECT|WITH)\b/i);
      expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE|VACUUM|ANALYZE|CHECKPOINT)\b/i);
    }
  });

  it('resolves partial visibility and track_io_timing as section capabilities', async () => {
    const requestSql = jest.fn().mockResolvedValue(
      rdh([capabilityRow({ can_read_all_stats: false, track_io_timing: false })]),
    );
    const provider = new PostgresRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const result = await provider.checkCapabilities(target);

    expect(result.ok).toBe(true);
    expect(result.result?.observerIdentity).toBe('123');
    expect(result.result?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sectionId: 'activity', status: 'partial' }),
        expect.objectContaining({ sectionId: 'io-timing', status: 'unavailable' }),
      ]),
    );
  });

  it('builds a provider-valid dashboard without exposing SQL', async () => {
    const requestSql = jest.fn().mockResolvedValue(rdh([capabilityRow()]));
    const provider = new PostgresRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const result = await provider.resolveDashboard(target, {});

    expect(result.ok).toBe(true);
    expect(validateResolvedRdbDashboard(result.result!, provider.providerId)).toBeUndefined();
    expect(JSON.stringify(result.result)).not.toContain('pg_stat_activity');
    expect(result.result?.metrics.find((metric) => metric.id === 'xact_commit')).toMatchObject({
      scope: { kind: 'database' },
      measurement: { kind: 'cumulative-counter', epochKey: 'pg-stat-database' },
      selfObservation: 'included',
    });
  });

  it('collects database counters, excludes the observer in SQL, and preserves wait dimensions', async () => {
    const requestSql = jest
      .fn()
      .mockResolvedValueOnce(
        rdh([
          {
            observed_at: new Date('2026-08-30T00:00:00.000Z'),
            stats_reset: new Date('2026-08-29T00:00:00.000Z'),
            connections: 4,
            active_sessions: 2,
            xact_commit: '100',
            blocks_read: '5',
            blocks_requested: '50',
          },
        ]),
      )
      .mockResolvedValueOnce(
        rdh([
          {
            observed_at: new Date('2026-08-30T00:00:00.000Z'),
            wait_event_type: 'Lock',
            waiting_sessions_by_type: 2,
          },
        ]),
      );
    const provider = new PostgresRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const result = await provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence: 0,
      selection: {},
      metricIds: ['connections', 'xact_commit', 'waiting_sessions_by_type'],
    });

    expect(result.ok).toBe(true);
    expect(requestSql.mock.calls[0][0].sql).toContain('pid <> pg_backend_pid()');
    expect(result.result?.epochs[0]).toMatchObject({
      key: 'pg-stat-database',
      value: '2026-08-29T00:00:00.000Z',
    });
    expect(result.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'connections', value: 4 }),
        expect.objectContaining({ metricId: 'xact_commit', value: 100 }),
        expect.objectContaining({
          metricId: 'waiting_sessions_by_type',
          value: 2,
          dimensions: { waitEventType: 'Lock' },
        }),
      ]),
    );
  });

  it('keeps wait results when the database statistics section fails', async () => {
    const requestSql = jest
      .fn()
      .mockRejectedValueOnce(new Error('permission denied SQL secret'))
      .mockResolvedValueOnce(
        rdh([
          {
            observed_at: '2026-08-30T00:00:00.000Z',
            wait_event_type: 'IO',
            waiting_sessions_by_type: 1,
          },
        ]),
      );
    const provider = new PostgresRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const result = await provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence: 0,
      selection: {},
      metricIds: ['xact_commit', 'waiting_sessions_by_type'],
    });

    expect(result.ok).toBe(true);
    expect(result.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'xact_commit', status: 'failed' }),
        expect.objectContaining({ metricId: 'waiting_sessions_by_type', status: 'ok' }),
      ]),
    );
    expect(JSON.stringify(result.result)).not.toContain('secret');
  });
});
