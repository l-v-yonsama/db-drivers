import {
  DBType,
  RdbDashboardTarget,
  RDSBaseDriver,
  SQLSERVER_DASHBOARD_ACTIVITY_SQL,
  SQLSERVER_DASHBOARD_CAPABILITIES_SQL,
  SQLSERVER_DASHBOARD_DATABASE_FILES_SQL,
  SQLSERVER_DASHBOARD_FILE_IO_SQL,
  SQLSERVER_DASHBOARD_PERFORMANCE_COUNTERS_SQL,
  SQLSERVER_DASHBOARD_WAIT_STATS_SQL,
  SQLServerRdbDashboardProvider,
  validateResolvedRdbDashboard,
} from '../../../src';

const target: RdbDashboardTarget = {
  resourceKey: 'runtime-sqlserver',
  databaseName: 'app',
  dbType: DBType.SQLServer,
};

function rdh(rows: Array<Record<string, unknown>>) {
  return { rows: rows.map((values) => ({ values })) } as any;
}

function baseRow(overrides: Record<string, unknown> = {}) {
  return {
    database_name: 'app',
    server_version: '16.0.1000.6',
    edition: 'Developer Edition',
    engine_edition: 3,
    observer_session_id: 51,
    has_view_server_state: 1,
    has_view_server_performance_state: 1,
    has_view_database_state: 1,
    ...overrides,
  };
}

function providerDriver(requestSql: jest.Mock, queryStore = true): RDSBaseDriver {
  return {
    requestSql,
    checkStatementStatisticsAvailability: jest.fn().mockResolvedValue({
      ok: queryStore,
      message: queryStore ? '' : 'fixture detail',
    }),
  } as unknown as RDSBaseDriver;
}

function successfulCapabilityRequest(base = baseRow()) {
  return jest
    .fn()
    .mockResolvedValueOnce(rdh([base]))
    .mockResolvedValueOnce(rdh([]))
    .mockResolvedValueOnce(rdh([{ active_requests: 0, blocked_requests: 0 }]))
    .mockResolvedValueOnce(rdh([]))
    .mockResolvedValueOnce(rdh([]))
    .mockResolvedValueOnce(rdh([]));
}

describe('SQLServerRdbDashboardProvider', () => {
  it('uses read-only static SQL Server catalog queries', () => {
    for (const sql of [
      SQLSERVER_DASHBOARD_CAPABILITIES_SQL,
      SQLSERVER_DASHBOARD_PERFORMANCE_COUNTERS_SQL,
      SQLSERVER_DASHBOARD_ACTIVITY_SQL,
      SQLSERVER_DASHBOARD_WAIT_STATS_SQL,
      SQLSERVER_DASHBOARD_FILE_IO_SQL,
      SQLSERVER_DASHBOARD_DATABASE_FILES_SQL,
    ]) {
      expect(sql.trim()).toMatch(/^SELECT\b/i);
      expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE|DBCC)\b/i);
    }
  });

  it('resolves Azure SQL Database and keeps independent probe failures partial', async () => {
    const requestSql = jest
      .fn()
      .mockResolvedValueOnce(
        rdh([
          baseRow({
            engine_edition: 5,
            has_view_server_state: 0,
            has_view_server_performance_state: 0,
          }),
        ]),
      )
      .mockRejectedValueOnce(new Error('performance permission secret'))
      .mockResolvedValueOnce(rdh([{ active_requests: 1, blocked_requests: 0 }]))
      .mockRejectedValueOnce(new Error('wait permission secret'))
      .mockRejectedValueOnce(new Error('file io permission secret'))
      .mockResolvedValueOnce(rdh([{ file_name: 'app', file_type: 'data' }]));
    const provider = new SQLServerRdbDashboardProvider(providerDriver(requestSql, false));
    const result = await provider.checkCapabilities(target);

    expect(result.ok).toBe(true);
    expect(result.result?.variant).toBe('azure-sql-database');
    expect(result.result?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sectionId: 'performance-counters', status: 'unavailable' }),
        expect.objectContaining({ sectionId: 'current-activity', status: 'partial' }),
        expect.objectContaining({ sectionId: 'database-files', status: 'available' }),
        expect.objectContaining({ sectionId: 'query-statistics', status: 'unavailable' }),
      ]),
    );
    expect(JSON.stringify(result.result)).not.toContain('secret');
  });

  it('builds a valid dashboard with server and database scopes', async () => {
    const provider = new SQLServerRdbDashboardProvider(
      providerDriver(
        successfulCapabilityRequest(
          baseRow({
            server_version: '15.0.2000.5',
            has_view_server_state: 1,
            has_view_server_performance_state: 0,
          }),
        ),
      ),
    );
    const result = await provider.resolveDashboard(target, {});

    expect(result.ok).toBe(true);
    expect(validateResolvedRdbDashboard(result.result!, provider.providerId)).toBeUndefined();
    expect(result.result?.metrics.find((metric) => metric.id === 'batch_requests')).toMatchObject({
      scope: { kind: 'instance' },
      measurement: { kind: 'cumulative-counter', epochKey: 'sqlserver-start-time' },
    });
    expect(result.result?.metrics.find((metric) => metric.id === 'file_read_latency')).toMatchObject({
      scope: { kind: 'database' },
      measurement: { kind: 'derived', formula: { kind: 'average' } },
    });
  });

  it('honors cntr_type, database instances, file dimensions, and the server epoch', async () => {
    const requestSql = jest
      .fn()
      .mockResolvedValueOnce(
        rdh([
          { counter_name: 'User Connections', instance_name: '', cntr_value: 7, cntr_type: 65792, sqlserver_start_time: '2026-08-30T00:00:00Z' },
          { counter_name: 'Batch Requests/sec', instance_name: '', cntr_value: 1000, cntr_type: 272696576, sqlserver_start_time: '2026-08-30T00:00:00Z' },
          { counter_name: 'Transactions/sec', instance_name: 'other', cntr_value: 999, cntr_type: 272696576, sqlserver_start_time: '2026-08-30T00:00:00Z' },
          { counter_name: 'Transactions/sec', instance_name: 'app', cntr_value: 40, cntr_type: 272696576, sqlserver_start_time: '2026-08-30T00:00:00Z' },
          { counter_name: 'Page life expectancy', instance_name: '0', cntr_value: 300, cntr_type: 999, sqlserver_start_time: '2026-08-30T00:00:00Z' },
        ]),
      )
      .mockResolvedValueOnce(
        rdh([
          { file_name: 'app', file_type: 'data', file_reads: 10, file_writes: 4, file_read_stall: 30, file_write_stall: 8 },
        ]),
      );
    const provider = new SQLServerRdbDashboardProvider(providerDriver(requestSql));
    const result = await provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence: 0,
      selection: {},
      metricIds: ['user_connections', 'batch_requests', 'transactions', 'page_life_expectancy', 'file_reads', 'file_read_stall'],
    });

    expect(result.result?.epochs[0].value).toBe('2026-08-30T00:00:00.000Z');
    expect(result.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'user_connections', value: 7 }),
        expect.objectContaining({ metricId: 'batch_requests', value: 1000 }),
        expect.objectContaining({ metricId: 'transactions', value: 40 }),
        expect.objectContaining({ metricId: 'page_life_expectancy', status: 'unavailable' }),
        expect.objectContaining({ metricId: 'file_reads', value: 10, dimensions: { fileName: 'app', fileType: 'data' } }),
      ]),
    );
    expect(result.result?.observations).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ metricId: 'transactions', value: 999 })]),
    );
    expect(result.result?.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'unsupported-counter-type' })]),
    );
  });

  it('preserves database file snapshots when server DMV collection fails', async () => {
    const requestSql = jest
      .fn()
      .mockRejectedValueOnce(new Error('server secret'))
      .mockResolvedValueOnce(
        rdh([{ file_name: 'app', file_type: 'data', file_size_bytes: 8192, file_used_bytes: 4096 }]),
      );
    const provider = new SQLServerRdbDashboardProvider(providerDriver(requestSql));
    const result = await provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence: 0,
      selection: {},
      metricIds: ['batch_requests', 'file_size_bytes', 'file_used_bytes'],
    });

    expect(result.ok).toBe(true);
    expect(result.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'batch_requests', status: 'failed' }),
        expect.objectContaining({ metricId: 'file_size_bytes', value: 8192, status: 'ok' }),
        expect.objectContaining({ metricId: 'file_used_bytes', value: 4096, status: 'ok' }),
      ]),
    );
    expect(JSON.stringify(result.result)).not.toContain('secret');
  });
});
