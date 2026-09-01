import {
  DBType,
  MYSQL_DASHBOARD_CAPABILITIES_SQL,
  MYSQL_DASHBOARD_DATABASE_SIZE_SQL,
  MYSQL_DASHBOARD_GLOBAL_STATUS_SQL,
  MYSQL_DASHBOARD_QUERY_STATISTICS_PROBE_SQL,
  MySQLRdbDashboardProvider,
  RdbDashboardTarget,
  RDSBaseDriver,
  validateResolvedRdbDashboard,
} from '../../../src';

const target: RdbDashboardTarget = {
  resourceKey: 'runtime-mysql',
  databaseName: 'app',
  dbType: DBType.MySQL,
};

function rdh(rows: Array<Record<string, unknown>>) {
  return { rows: rows.map((values) => ({ values })) } as any;
}

function capabilityRow(overrides: Record<string, unknown> = {}) {
  return {
    database_name: 'app',
    server_version: '8.4.2',
    version_comment: 'MySQL Community Server - GPL',
    performance_schema_enabled: 1,
    observer_connection_id: 41,
    ...overrides,
  };
}

function statusRows(overrides: Record<string, unknown> = {}) {
  const values: Record<string, unknown> = {
    Uptime: 100,
    Threads_connected: 3,
    Threads_running: 1,
    Questions: 200,
    Com_commit: 10,
    Com_rollback: 2,
    Bytes_received: 1000,
    Bytes_sent: 2000,
    Slow_queries: 1,
    Innodb_buffer_pool_read_requests: 100,
    Innodb_buffer_pool_reads: 5,
    Innodb_buffer_pool_pages_dirty: 2,
    Innodb_buffer_pool_pages_free: 10,
    Innodb_row_lock_current_waits: 0,
    Innodb_row_lock_waits: 4,
    Innodb_row_lock_time: 20,
    Created_tmp_tables: 8,
    Created_tmp_disk_tables: 2,
    ...overrides,
  };
  return Object.entries(values).map(([Variable_name, Value]) => ({ Variable_name, Value }));
}

describe('MySQLRdbDashboardProvider', () => {
  it('uses read-only static MySQL catalog queries', () => {
    expect(MYSQL_DASHBOARD_CAPABILITIES_SQL.trim()).toMatch(/^SELECT\b/i);
    expect(MYSQL_DASHBOARD_GLOBAL_STATUS_SQL.trim()).toMatch(/^SHOW GLOBAL STATUS\b/i);
    expect(MYSQL_DASHBOARD_DATABASE_SIZE_SQL.trim()).toMatch(/^SELECT\b/i);
    for (const sql of [
      MYSQL_DASHBOARD_CAPABILITIES_SQL,
      MYSQL_DASHBOARD_GLOBAL_STATUS_SQL,
      MYSQL_DASHBOARD_DATABASE_SIZE_SQL,
      MYSQL_DASHBOARD_QUERY_STATISTICS_PROBE_SQL,
    ]) {
      expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE|FLUSH)\b/i);
    }
  });

  it('keeps global status available when Performance Schema is disabled', async () => {
    const requestSql = jest
      .fn()
      .mockResolvedValueOnce(rdh([capabilityRow({ performance_schema_enabled: 0 })]))
      .mockResolvedValueOnce(rdh(statusRows()));
    const provider = new MySQLRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const result = await provider.checkCapabilities(target);

    expect(result.ok).toBe(true);
    expect(result.result?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sectionId: 'global-status', status: 'available' }),
        expect.objectContaining({ sectionId: 'performance-schema', status: 'unavailable' }),
        expect.objectContaining({ sectionId: 'query-statistics', status: 'unavailable' }),
      ]),
    );
  });

  it('builds a valid instance-scoped dashboard and marks self-observation', async () => {
    const requestSql = jest
      .fn()
      .mockResolvedValueOnce(rdh([capabilityRow()]))
      .mockResolvedValueOnce(rdh(statusRows()))
      .mockResolvedValueOnce(rdh([]));
    const provider = new MySQLRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const result = await provider.resolveDashboard(target, {});

    expect(result.ok).toBe(true);
    expect(validateResolvedRdbDashboard(result.result!, provider.providerId)).toBeUndefined();
    expect(result.result?.metrics.find((metric) => metric.id === 'questions')).toMatchObject({
      scope: { kind: 'instance' },
      measurement: { kind: 'cumulative-counter', epochKey: 'mysql-server-uptime' },
      selfObservation: 'included',
    });
    expect(result.result?.metrics.find((metric) => metric.id === 'database_size_bytes')).toMatchObject(
      { scope: { kind: 'database' }, measurement: { kind: 'snapshot' } },
    );
  });

  it('collects status values, caches database size, and changes epoch only when uptime decreases', async () => {
    const requestSql = jest
      .fn()
      .mockResolvedValueOnce(rdh(statusRows({ Uptime: 100 })))
      .mockResolvedValueOnce(rdh([{ database_size_bytes: '4096' }]))
      .mockResolvedValueOnce(rdh(statusRows({ Uptime: 110, Questions: 240 })))
      .mockResolvedValueOnce(rdh(statusRows({ Uptime: 5, Questions: 3 })));
    const provider = new MySQLRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const sample = (sequence: number) =>
      provider.collectSample({
        target,
        sampleSessionId: 'sample',
        definitionVersion: 1,
        sequence,
        selection: {},
        metricIds: ['threads_connected', 'questions', 'database_size_bytes'],
      });

    const first = await sample(0);
    const second = await sample(1);
    const restarted = await sample(2);

    expect(first.result?.epochs[0].value).toBe('server-generation-0');
    expect(second.result?.epochs[0].value).toBe('server-generation-0');
    expect(restarted.result?.epochs[0].value).toBe('server-generation-1');
    expect(first.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'threads_connected', value: 3 }),
        expect.objectContaining({ metricId: 'questions', value: 200 }),
        expect.objectContaining({ metricId: 'database_size_bytes', value: 4096 }),
      ]),
    );
    expect(requestSql.mock.calls.filter(([arg]) => arg.sql === MYSQL_DASHBOARD_DATABASE_SIZE_SQL)).toHaveLength(1);
  });

  it('preserves database size when global status collection fails without leaking details', async () => {
    const requestSql = jest
      .fn()
      .mockRejectedValueOnce(new Error('access denied SQL secret'))
      .mockResolvedValueOnce(rdh([{ database_size_bytes: 2048 }]));
    const provider = new MySQLRdbDashboardProvider({ requestSql } as unknown as RDSBaseDriver);
    const result = await provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence: 0,
      selection: {},
      metricIds: ['questions', 'database_size_bytes'],
    });

    expect(result.ok).toBe(true);
    expect(result.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'questions', status: 'failed' }),
        expect.objectContaining({ metricId: 'database_size_bytes', value: 2048, status: 'ok' }),
      ]),
    );
    expect(JSON.stringify(result.result)).not.toContain('secret');
  });
});
