import {
  DBType,
  ORACLE_DASHBOARD_CONTEXT_SQL,
  ORACLE_DASHBOARD_INSTANCE_SYSMETRIC_SQL,
  ORACLE_DASHBOARD_PDB_SYSMETRIC_SQL,
  ORACLE_DASHBOARD_RESOURCE_LIMIT_SQL,
  ORACLE_DASHBOARD_SESSIONS_SQL,
  ORACLE_DASHBOARD_SYSSTAT_SQL,
  ORACLE_DASHBOARD_SYSTEM_EVENT_SQL,
  OracleRdbDashboardProvider,
  RdbDashboardTarget,
  RDSBaseDriver,
  validateResolvedRdbDashboard,
} from '../../../src';

const target: RdbDashboardTarget = {
  resourceKey: 'runtime-oracle',
  databaseName: 'FREEPDB1',
  dbType: DBType.Oracle,
};

function rdh(rows: Array<Record<string, unknown>>) {
  return { rows: rows.map((values) => ({ values })) } as any;
}

function contextRow(overrides: Record<string, unknown> = {}) {
  return {
    DATABASE_NAME: 'FREEPDB1',
    CONTAINER_NAME: 'FREEPDB1',
    CONTAINER_ID: 3,
    INSTANCE_NAME: 'FREE',
    OBSERVER_SID: '42',
    SERVER_VERSION: '23.0',
    ...overrides,
  };
}

function nativeRows(containerId = 3, interval = 6000, groupId = 18) {
  const values: Record<string, number> = {
    'User Calls Per Sec': 2,
    'Executions Per Sec': 8,
    'Database Time Per Sec': 1.5,
    'CPU Usage Per Sec': 1,
    'Logical Reads Per Sec': 20,
    'Physical Reads Per Sec': 2,
    'Physical Writes Per Sec': 1,
  };
  return Object.entries(values).map(([METRIC_NAME, VALUE]) => ({
    GROUP_ID: groupId,
    METRIC_NAME,
    VALUE,
    METRIC_UNIT: 'Per Second',
    INTSIZE_CSEC: interval,
    BEGIN_TIME: '2026-08-30T00:00:00Z',
    END_TIME: '2026-08-30T00:01:00Z',
    CON_ID: containerId,
  }));
}

function providerDriver(requestSql: jest.Mock, queryStatistics = true): RDSBaseDriver {
  return {
    requestSql,
    checkStatementStatisticsAvailability: jest.fn().mockResolvedValue({
      ok: queryStatistics,
      message: '',
    }),
  } as unknown as RDSBaseDriver;
}

function capabilityRequest(
  base = contextRow(),
  metrics = nativeRows(),
  resources: Array<Record<string, unknown>> = [
    { RESOURCE_NAME: 'sessions', CURRENT_UTILIZATION: 5, LIMIT_VALUE: '100', CON_ID: 0 },
  ],
) {
  return jest
    .fn()
    .mockResolvedValueOnce(rdh([base]))
    .mockResolvedValueOnce(rdh(metrics))
    .mockResolvedValueOnce(rdh([]))
    .mockResolvedValueOnce(rdh(resources))
    .mockResolvedValueOnce(rdh([]))
    .mockResolvedValueOnce(
      rdh([{ NAME: 'user calls', VALUE: 100, CON_ID: Number(base.CONTAINER_ID ?? 3), STARTUP_TIME: '2026-08-29T00:00:00Z' }]),
    );
}

describe('OracleRdbDashboardProvider', () => {
  it('contains only read-only, non-AWR Oracle queries', () => {
    for (const sql of [
      ORACLE_DASHBOARD_CONTEXT_SQL,
      ORACLE_DASHBOARD_INSTANCE_SYSMETRIC_SQL,
      ORACLE_DASHBOARD_PDB_SYSMETRIC_SQL,
      ORACLE_DASHBOARD_SESSIONS_SQL,
      ORACLE_DASHBOARD_RESOURCE_LIMIT_SQL,
      ORACLE_DASHBOARD_SYSTEM_EVENT_SQL,
      ORACLE_DASHBOARD_SYSSTAT_SQL,
    ]) {
      expect(sql.trim()).toMatch(/^SELECT\b/i);
      expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE|DBMS_WORKLOAD_REPOSITORY)\b/i);
      expect(sql).not.toMatch(/DBA_HIST_|ACTIVE_SESSION_HISTORY|V\$SYSMETRIC_HISTORY/i);
    }
  });

  it('resolves a PDB, uses its CON_ID and preserves the 60-second native interval', async () => {
    const provider = new OracleRdbDashboardProvider(providerDriver(capabilityRequest()));
    const capabilities = await provider.checkCapabilities(target);
    const dashboard = await provider.resolveDashboard(target, {});

    expect(capabilities.result?.variant).toBe('oracle-pdb');
    expect(capabilities.result?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sectionId: 'native-metrics',
          status: 'available',
          scope: expect.objectContaining({ kind: 'pdb' }),
        }),
        expect.objectContaining({ sectionId: 'native-history', status: 'unavailable' }),
      ]),
    );
    expect(validateResolvedRdbDashboard(dashboard.result!, provider.providerId)).toBeUndefined();
    expect(dashboard.result?.metrics.find((item) => item.id === 'user_calls')).toMatchObject({
      scope: { kind: 'pdb' },
      measurement: { kind: 'native-window', intervalSeconds: 60 },
    });
  });

  it('never labels CON_ID=0 metrics as PDB metrics and chooses the 15-second root group', async () => {
    const rootTarget = { ...target, databaseName: 'FREE', resourceKey: 'root' };
    const root = contextRow({
      DATABASE_NAME: 'FREE',
      CONTAINER_NAME: 'CDB$ROOT',
      CONTAINER_ID: 1,
    });
    const metrics = [...nativeRows(0, 6000, 2), ...nativeRows(0, 1500, 3)];
    const provider = new OracleRdbDashboardProvider(
      providerDriver(capabilityRequest(root, metrics)),
    );
    const dashboard = await provider.resolveDashboard(rootTarget, {});

    expect(dashboard.result?.variant).toBe('oracle-cdb-root');
    expect(dashboard.result?.metrics.find((item) => item.id === 'user_calls')).toMatchObject({
      scope: { kind: 'instance' },
      measurement: { kind: 'native-window', intervalSeconds: 15 },
    });
    expect(dashboard.result?.metrics.some((item) => item.scope.kind === 'pdb')).toBe(false);
  });

  it('collects native, session, wait, and resource values while preserving UNLIMITED', async () => {
    const requestSql = capabilityRequest();
    requestSql
      .mockResolvedValueOnce(rdh([{ NAME: 'user calls', VALUE: 100, CON_ID: 3, STARTUP_TIME: '2026-08-29T00:00:00Z' }]))
      .mockResolvedValueOnce(rdh(nativeRows()))
      .mockResolvedValueOnce(
        rdh([
          { OBSERVED_AT: '2026-08-30T00:01:00Z', STATUS: 'ACTIVE', WAIT_CLASS: 'User I/O', SESSION_COUNT: 2, CON_ID: 3 },
          { OBSERVED_AT: '2026-08-30T00:01:00Z', STATUS: 'INACTIVE', WAIT_CLASS: 'Idle', SESSION_COUNT: 4, CON_ID: 3 },
        ]),
      )
      .mockResolvedValueOnce(
        rdh([
          { RESOURCE_NAME: 'sessions', CURRENT_UTILIZATION: 6, LIMIT_VALUE: 'UNLIMITED', CON_ID: 0 },
          { RESOURCE_NAME: 'processes', CURRENT_UTILIZATION: 8, LIMIT_VALUE: '100', CON_ID: 0 },
        ]),
      )
      .mockResolvedValueOnce(rdh([{ WAIT_CLASS: 'User I/O', TIME_WAITED_MICRO: 2500, CON_ID: 3 }]));
    const provider = new OracleRdbDashboardProvider(providerDriver(requestSql));
    await provider.checkCapabilities(target);
    const result = await provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence: 0,
      selection: {},
      metricIds: [
        'user_calls', 'active_sessions', 'inactive_sessions', 'current_waits',
        'sessions_current', 'sessions_limit', 'processes_current', 'processes_limit',
        'completed_wait_time',
      ],
    });

    expect(result.result?.epochs[0].value).toBe('2026-08-29T00:00:00.000Z');
    expect(result.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'user_calls', value: 2 }),
        expect.objectContaining({ metricId: 'active_sessions', value: 2 }),
        expect.objectContaining({ metricId: 'inactive_sessions', value: 4 }),
        expect.objectContaining({ metricId: 'current_waits', value: 2, dimensions: { waitClass: 'User I/O' } }),
        expect.objectContaining({ metricId: 'sessions_limit', value: null, status: 'unavailable', messageCode: 'unlimited-resource' }),
        expect.objectContaining({ metricId: 'completed_wait_time', value: 2.5, dimensions: { waitClass: 'User I/O' } }),
      ]),
    );
  });

  it('falls back to V$SYSSTAT and isolates section failures without leaking errors', async () => {
    const requestSql = jest
      .fn()
      .mockResolvedValueOnce(rdh([contextRow()]))
      .mockRejectedValueOnce(new Error('native grant secret'))
      .mockRejectedValueOnce(new Error('session grant secret'))
      .mockResolvedValueOnce(rdh([]))
      .mockRejectedValueOnce(new Error('events grant secret'))
      .mockResolvedValueOnce(rdh([{ NAME: 'user calls', VALUE: 10, CON_ID: 3, STARTUP_TIME: '2026-08-29T00:00:00Z' }]))
      .mockResolvedValueOnce(rdh([{ NAME: 'user calls', VALUE: 12, CON_ID: 3, STARTUP_TIME: '2026-08-29T00:00:00Z' }]))
      .mockRejectedValueOnce(new Error('session sample secret'));
    const provider = new OracleRdbDashboardProvider(providerDriver(requestSql, false));
    const dashboard = await provider.resolveDashboard(target, {});
    const result = await provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence: 0,
      selection: {},
      metricIds: ['user_calls', 'active_sessions'],
    });

    expect(dashboard.result?.metrics.find((item) => item.id === 'user_calls')).toMatchObject({
      measurement: { kind: 'cumulative-counter' },
    });
    expect(result.result?.observations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metricId: 'user_calls', value: 12, status: 'ok' }),
        expect.objectContaining({ metricId: 'active_sessions', status: 'failed' }),
      ]),
    );
    expect(JSON.stringify({ dashboard: dashboard.result, sample: result.result })).not.toContain('secret');
  });
});
