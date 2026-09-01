import {
  ConnectionSetting,
  DBType,
  GeneralResult,
  RdbDashboardProvider,
  RdbDashboardTarget,
  RdbRawSampleBatch,
  ResolvedRdbDashboard,
  SQLiteDriver,
} from '../../../src';

const setting: ConnectionSetting = {
  dbType: DBType.SQLite,
  name: 'test',
  database: ':memory:',
};
const target: RdbDashboardTarget = {
  resourceKey: 'runtime-1',
  databaseName: 'main',
  dbType: DBType.SQLite,
};

function success<T>(result: T): GeneralResult<T> {
  return { ok: true, message: '', result };
}

function dashboard(providerId = 'rdb.test'): ResolvedRdbDashboard {
  return {
    providerId,
    variant: 'test',
    definitionVersion: 1,
    target: {
      resourceKey: target.resourceKey,
      displayName: 'main',
      sourceLabel: 'SQLite',
      scope: { kind: 'database', label: 'Database main' },
    },
    serverVersion: 'test',
    samplePolicy: {
      defaultIntervalMs: 10_000,
      allowedIntervalMs: [10_000],
      maxPointsPerSeries: 10,
      maxVisibleSeriesPerPanel: 10,
      defaultTopN: 5,
      maxPayloadBytes: 100_000,
      queryTimeoutMs: 3_000,
      hiddenDisconnectDelayMs: 30_000,
    },
    metrics: [
      {
        id: 'size',
        label: 'Size',
        unit: 'bytes',
        scope: { kind: 'database', label: 'Database main' },
        measurement: { kind: 'snapshot' },
      },
    ],
    capabilities: [
      {
        sectionId: 'storage',
        status: 'available',
        scope: { kind: 'database', label: 'Database main' },
      },
    ],
    tabs: [
      {
        id: 'overview',
        title: 'Overview',
        timeMode: 'snapshot',
        selectors: [],
        panels: [
          {
            id: 'storage',
            title: 'Storage',
            purpose: 'capacity',
            scope: { kind: 'database', label: 'Database main' },
            visualization: 'stat-grid',
            metricIds: ['size'],
            sectionCapabilityId: 'storage',
          },
        ],
      },
    ],
    notices: [],
  };
}

function sample(): RdbRawSampleBatch {
  return {
    sampleSessionId: 'sample-1',
    definitionVersion: 1,
    sequence: 0,
    collectionStartedAt: '2026-08-30T00:00:00.000Z',
    collectionEndedAt: '2026-08-30T00:00:00.001Z',
    epochs: [],
    observations: [
      {
        metricId: 'size',
        observedAt: '2026-08-30T00:00:00.000Z',
        value: 1,
        status: 'ok',
      },
    ],
    diagnostics: [],
  };
}

class TestDriver extends SQLiteDriver {
  constructor(private readonly provider: RdbDashboardProvider) {
    super(setting);
  }

  protected getRdbDashboardProvider(): RdbDashboardProvider | undefined {
    return this.provider;
  }
}

function provider(overrides: Partial<RdbDashboardProvider> = {}): RdbDashboardProvider {
  return {
    providerId: 'rdb.test',
    checkCapabilities: async () =>
      success({
        providerId: 'rdb.test',
        variant: 'test',
        serverVersion: 'test',
        sections: [],
      }),
    resolveDashboard: async () => success(dashboard()),
    collectSample: async () => success(sample()),
    ...overrides,
  };
}

describe('RDSBaseDriver RDB dashboard facade', () => {
  it('validates provider identity and resolved references', async () => {
    const driver = new TestDriver(
      provider({
        resolveDashboard: async () => success(dashboard('rdb.wrong')),
      }),
    );
    await expect(driver.resolveRdbDashboard(target, {})).resolves.toMatchObject({
      ok: false,
      message: expect.stringContaining('provider identity'),
    });
  });

  it('sanitizes unexpected provider errors', async () => {
    const driver = new TestDriver(
      provider({
        checkCapabilities: async () => {
          throw new Error('postgres://user:secret@example.test SQL SELECT secret');
        },
      }),
    );
    const result = await driver.checkRdbDashboardAvailability(target);
    expect(result).toEqual({
      ok: false,
      message:
        'RDB dashboard collection failed unexpectedly. Check the extension/driver logs for details.',
    });
    expect(result.message).not.toContain('secret');
  });

  it('supports caller-facing cancellation and rejects mismatched samples', async () => {
    const controller = new AbortController();
    controller.abort();
    const driver = new TestDriver(provider());
    await expect(
      driver.checkRdbDashboardAvailability(target, { signal: controller.signal }),
    ).resolves.toMatchObject({ ok: false, message: 'RDB dashboard request was cancelled.' });

    const mismatched = sample();
    mismatched.sequence = 99;
    const badDriver = new TestDriver(provider({ collectSample: async () => success(mismatched) }));
    await expect(
      badDriver.collectRdbDashboardSample({
        target,
        sampleSessionId: 'sample-1',
        definitionVersion: 1,
        sequence: 0,
        selection: {},
        metricIds: ['size'],
      }),
    ).resolves.toMatchObject({ ok: false, message: expect.stringContaining('mismatched') });
  });

  it('clamps and enforces the caller-facing provider deadline', async () => {
    let receivedTimeout: number | undefined;
    const driver = new TestDriver(
      provider({
        checkCapabilities: async (_target, options) => {
          receivedTimeout = options?.timeoutMs;
          return new Promise(() => undefined);
        },
      }),
    );
    await expect(
      driver.checkRdbDashboardAvailability(target, { timeoutMs: 1 }),
    ).resolves.toEqual({
      ok: false,
      message: 'RDB dashboard capability check timed out after 100ms.',
    });
    expect(receivedTimeout).toBe(100);
  });
});
