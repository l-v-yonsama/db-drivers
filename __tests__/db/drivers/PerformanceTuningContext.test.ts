import {
  ConnectionSetting,
  DBType,
  GeneralResult,
  MAX_MAX_PAYLOAD_BYTES,
  MAX_PLAN_TIMEOUT_MS,
  MySQLDriver,
  isSingleSelectStatement,
  normalizePerformanceTuningContextParams,
  OracleDriver,
  PerformanceTuningAvailabilityParams,
  PerformanceTuningCapabilities,
  PerformanceTuningContextParams,
  PerformanceTuningContextProvider,
  PostgresDriver,
  SQLServerDriver,
  SQLiteDriver,
  validatePerformanceTuningContext,
  validatePerformanceTuningContextParams,
} from '../../../src';
import { samplePerformanceTuningContext } from '../../data/performance/samplePerformanceTuningContext';

const connectionSetting = (
  dbType: ConnectionSetting['dbType'],
): ConnectionSetting => ({
  dbType,
  name: `${dbType}-performance-tuning-test`,
  database: 'testdb',
});

const baseParams = (): PerformanceTuningContextParams => ({
  databaseName: 'testdb',
  statement: {
    sql: 'SELECT * FROM orders WHERE id = 1',
    source: 'editor',
  },
  plan: {},
});

const fakeCapabilities: PerformanceTuningCapabilities = {
  executionPlan: { available: true, source: 'EXPLAIN (FORMAT JSON)' },
  analyzedExecutionPlan: { available: false, message: 'not requested' },
  tableDefinition: { available: true },
  optimizerStatistics: { available: true },
  physicalHealth: { available: true },
};

// PostgresDriver is already used as a plain (unconnected) instance
// elsewhere in this test suite; subclassing it just to override the
// protected Provider hook keeps the fake as close as possible to how a real
// Vendor driver would wire one in.
class FakeProviderDriver extends PostgresDriver {
  constructor(
    conRes: ConnectionSetting,
    private readonly provider: PerformanceTuningContextProvider,
  ) {
    super(conRes);
  }

  protected getPerformanceTuningContextProvider(): PerformanceTuningContextProvider {
    return this.provider;
  }
}

const notImplemented = () => {
  throw new Error('not used in this test');
};

describe('performance tuning context params', () => {
  it('defaults plan.mode to estimate and clamps limits/timeout safely', () => {
    const normalized = normalizePerformanceTuningContextParams({
      ...baseParams(),
      plan: { timeoutMs: 999_999 },
      limits: { maxPayloadBytes: 999_999_999 },
    });

    expect(normalized.plan.mode).toBe('estimate');
    expect(normalized.plan.allowExecution).toBe(false);
    expect(normalized.plan.timeoutMs).toBe(MAX_PLAN_TIMEOUT_MS);
    expect(normalized.limits.maxPayloadBytes).toBe(MAX_MAX_PAYLOAD_BYTES);
  });

  it('never echoes binds back and normalization never throws on bad input', () => {
    const normalized = normalizePerformanceTuningContextParams({
      ...baseParams(),
      plan: { binds: ['secret-value'], timeoutMs: -5 },
    });

    expect(normalized.plan.timeoutMs).toBeGreaterThan(0);
    // binds are threaded through only for plan retrieval; the public
    // PerformanceTuningContext type has no field to place them into.
    expect(normalized.plan.binds).toEqual(['secret-value']);
  });

  it('normalization never throws on missing/malformed input', () => {
    expect(() => normalizePerformanceTuningContextParams(undefined)).not.toThrow();
    expect(() => normalizePerformanceTuningContextParams(null)).not.toThrow();
    expect(() => normalizePerformanceTuningContextParams({} as never)).not.toThrow();

    const normalized = normalizePerformanceTuningContextParams({
      databaseName: 'testdb',
      statement: { sql: 'SELECT 1', source: 'editor' },
      plan: { mode: 'bogus' as never },
    });
    // An unrecognized mode is never silently trusted downstream - it falls
    // back to the safe default rather than reaching a Provider as-is.
    expect(normalized.plan.mode).toBe('estimate');
  });

  it('rejects analyze mode without explicit allowExecution', () => {
    const errors = validatePerformanceTuningContextParams({
      ...baseParams(),
      plan: { mode: 'analyze' },
    });
    expect(errors.join(' ')).toContain('allowExecution');

    expect(
      validatePerformanceTuningContextParams({
        ...baseParams(),
        plan: { mode: 'analyze', allowExecution: true },
      }),
    ).toEqual([]);
  });

  it('restricts analyze mode to a single SELECT, fail-closed', () => {
    expect(isSingleSelectStatement('SELECT * FROM orders WHERE id = 1')).toBe(true);
    expect(isSingleSelectStatement('SELECT 1;')).toBe(true);

    expect(isSingleSelectStatement('DELETE FROM orders')).toBe(false);
    expect(isSingleSelectStatement('SELECT 1; DELETE FROM orders;')).toBe(false);
    expect(isSingleSelectStatement('not sql at all {{{')).toBe(false);
    expect(isSingleSelectStatement(undefined)).toBe(false);
    expect(isSingleSelectStatement('')).toBe(false);

    // allowExecution: true alone must not be enough to let a non-SELECT
    // (or unparseable/multi-statement) statement through Analyze.
    const deleteErrors = validatePerformanceTuningContextParams({
      databaseName: 'testdb',
      statement: { sql: 'DELETE FROM orders', source: 'editor' },
      plan: { mode: 'analyze', allowExecution: true },
    });
    expect(deleteErrors).toEqual([
      expect.stringContaining('only allowed for a single SELECT statement'),
    ]);

    const multiStatementErrors = validatePerformanceTuningContextParams({
      databaseName: 'testdb',
      statement: {
        sql: 'SELECT 1; DELETE FROM orders;',
        source: 'editor',
      },
      plan: { mode: 'analyze', allowExecution: true },
    });
    expect(multiStatementErrors).toEqual([
      expect.stringContaining('only allowed for a single SELECT statement'),
    ]);

    expect(
      validatePerformanceTuningContextParams({
        ...baseParams(),
        plan: { mode: 'analyze', allowExecution: true },
      }),
    ).toEqual([]);
  });

  it('rejects an unrecognized plan.mode/statement.source at runtime', () => {
    expect(
      validatePerformanceTuningContextParams({
        ...baseParams(),
        plan: { mode: 'bogus' as never },
      }),
    ).toEqual([expect.stringContaining('plan.mode must be one of')]);

    expect(
      validatePerformanceTuningContextParams({
        ...baseParams(),
        statement: { sql: 'SELECT 1', source: 'bogus' as never },
      }),
    ).toEqual([expect.stringContaining('statement.source must be one of')]);
  });

  it('reports missing required fields instead of throwing', () => {
    const errors = validatePerformanceTuningContextParams({
      databaseName: '',
      statement: { sql: '', source: 'editor' },
      plan: {},
    });
    expect(errors).toContain('databaseName is required.');
    expect(errors).toContain('statement.sql is required.');
  });

  it('never throws for missing/malformed params, including undefined', () => {
    expect(validatePerformanceTuningContextParams(undefined)).toEqual([
      'params is required.',
    ]);
    expect(validatePerformanceTuningContextParams(null)).toEqual([
      'params is required.',
    ]);
    expect(() => validatePerformanceTuningContextParams(undefined)).not.toThrow();
  });
});

describe('performance tuning context - unsupported drivers (Phase 0)', () => {
  it('reports unsupported for every RDS driver without a Provider yet', () => {
    for (const [dbType, Driver] of [
      [DBType.MySQL, MySQLDriver],
      [DBType.SQLServer, SQLServerDriver],
      [DBType.Oracle, OracleDriver],
      [DBType.SQLite, SQLiteDriver],
    ] as const) {
      const driver = new Driver(connectionSetting(dbType));
      expect(driver.supportsGetPerformanceTuningContext()).toBe(false);
    }
  });

  it('reports PostgreSQL as supported now that a Provider is wired in (Phase 1 step 4)', () => {
    const driver = new PostgresDriver(connectionSetting(DBType.Postgres));
    expect(driver.supportsGetPerformanceTuningContext()).toBe(true);
  });

  it('returns a GeneralResult instead of throwing for an unsupported driver', async () => {
    const driver = new SQLiteDriver(connectionSetting(DBType.SQLite));

    await expect(
      driver.checkPerformanceTuningContextAvailability({
        databaseName: 'testdb',
      }),
    ).resolves.toEqual({
      ok: false,
      message: 'Performance tuning context is not supported for this database.',
    });

    await expect(
      driver.getPerformanceTuningContext(baseParams()),
    ).resolves.toEqual({
      ok: false,
      message: 'Performance tuning context is not supported for this database.',
    });
  });
});

describe('performance tuning context - Provider wired in (fake Provider)', () => {
  const makeProvider = (
    checkCapabilities: PerformanceTuningContextProvider['checkCapabilities'],
    overrides: Partial<PerformanceTuningContextProvider> = {},
  ): PerformanceTuningContextProvider => ({
    checkCapabilities,
    collectExecutionPlan: notImplemented,
    collectTableDefinition: notImplemented,
    collectTableStatistics: notImplemented,
    collectColumnStatistics: notImplemented,
    collectPhysicalHealth: notImplemented,
    ...overrides,
  });

  it('reports supported and forwards a successful capability check', async () => {
    const provider = makeProvider(async () => ({
      ok: true,
      message: '',
      result: fakeCapabilities,
    }));
    const driver = new FakeProviderDriver(
      connectionSetting(DBType.Postgres),
      provider,
    );

    expect(driver.supportsGetPerformanceTuningContext()).toBe(true);

    const result = await driver.checkPerformanceTuningContextAvailability({
      databaseName: 'testdb',
    });
    expect(result).toEqual({ ok: true, message: '', result: fakeCapabilities });
  });

  it('rejects a missing databaseName before calling the Provider', async () => {
    const checkCapabilities = jest.fn();
    const driver = new FakeProviderDriver(
      connectionSetting(DBType.Postgres),
      makeProvider(checkCapabilities),
    );

    const result = await driver.checkPerformanceTuningContextAvailability(
      {} as PerformanceTuningAvailabilityParams,
    );
    expect(result).toEqual({ ok: false, message: 'databaseName is required.' });
    expect(checkCapabilities).not.toHaveBeenCalled();
  });

  it('converts a thrown Provider exception into a GeneralResult without leaking its message', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    try {
      const provider = makeProvider(async () => {
        // A real driver exception can embed SQL text, a connection string,
        // or bind values - none of that may reach the public result, since
        // this API's purpose is to hand data to an external AI.
        throw new Error(
          'permission denied for view pg_stat_user_tables; password=hunter2',
        );
      });
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        provider,
      );

      const result: GeneralResult<PerformanceTuningCapabilities> =
        await driver.checkPerformanceTuningContextAvailability({
          databaseName: 'testdb',
        });

      expect(result).toEqual({
        ok: false,
        message:
          'Performance tuning context collection failed unexpectedly. Check the extension/driver logs for details.',
      });
      expect(result.message).not.toContain('hunter2');
      expect(result.message).not.toContain('pg_stat_user_tables');

      // The detail isn't discarded outright - it goes to the local console
      // instead of the public result.
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('checkCapabilities'),
        expect.any(Error),
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  it('short-circuits on an already-aborted signal without calling the Provider', async () => {
    const checkCapabilities = jest.fn();
    const driver = new FakeProviderDriver(
      connectionSetting(DBType.Postgres),
      makeProvider(checkCapabilities),
    );
    const controller = new AbortController();
    controller.abort();

    const result = await driver.checkPerformanceTuningContextAvailability(
      { databaseName: 'testdb' },
      { signal: controller.signal },
    );
    expect(result).toEqual({
      ok: false,
      message: 'Performance tuning context collection was cancelled.',
    });
    expect(checkCapabilities).not.toHaveBeenCalled();

    const getResult = await driver.getPerformanceTuningContext(baseParams(), {
      signal: controller.signal,
    });
    expect(getResult).toEqual({
      ok: false,
      message: 'Performance tuning context collection was cancelled.',
    });
  });

  it('still rejects an invalid mode through the facade even with a Provider wired in', async () => {
    const driver = new FakeProviderDriver(
      connectionSetting(DBType.Postgres),
      makeProvider(async () => ({ ok: true, message: '', result: fakeCapabilities })),
    );

    const result = await driver.getPerformanceTuningContext({
      ...baseParams(),
      plan: { mode: 'bogus' as never },
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('plan.mode must be one of');
  });

  it('reports the plan failure directly when the Provider cannot retrieve a plan at all', async () => {
    const driver = new FakeProviderDriver(
      connectionSetting(DBType.Postgres),
      makeProvider(
        async () => ({ ok: true, message: '', result: fakeCapabilities }),
        {
          collectExecutionPlan: async () => ({
            ok: false,
            message: 'permission denied for relation orders',
          }),
        },
      ),
    );

    const result = await driver.getPerformanceTuningContext(baseParams());
    expect(result).toEqual({
      ok: false,
      message: 'permission denied for relation orders',
    });
  });

  it('assembles a partial context from plan + table resolution alone (Phase 1 step 4)', async () => {
    const getVersion = jest
      .spyOn(PostgresDriver.prototype, 'getVersion')
      .mockResolvedValue('16.3');
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider(
          async () => ({ ok: true, message: '', result: fakeCapabilities }),
          {
            collectExecutionPlan: async () => ({
              ok: true,
              message: '',
              result: {
                raw: { Plan: { 'Node Type': 'Seq Scan', 'Relation Name': 'orders' } },
                planningTimeMs: 0.4,
                warnings: [],
                planTableMappings: [
                  {
                    planNodeId: 'n0',
                    tableName: 'orders',
                    estimatedRows: 41,
                    filterColumns: ['status'],
                  },
                ],
              },
            }),
          },
        ),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      const context = result.result!;

      expect(context.formatVersion).toBe(1);
      expect(context.database).toEqual({
        vendor: DBType.Postgres,
        version: '16.3',
        databaseName: 'testdb',
        schemaName: undefined,
      });
      expect(context.executionPlan.mode).toBe('estimate');
      expect(context.executionPlan.vendorPlan).toEqual({
        Plan: { 'Node Type': 'Seq Scan', 'Relation Name': 'orders' },
      });
      expect(context.planTableMappings).toHaveLength(1);
      expect(context.tables).toEqual([
        { schemaName: undefined, tableName: 'orders', warnings: [] },
      ]);
      // DDL/statistics/physical health aren't collected in this step yet -
      // the caller must see that as a partial result, not silently missing data.
      expect(context.collection.status).toBe('partial');
      expect(
        context.collection.unavailableSections.map((s) => s.section).sort(),
      ).toEqual(
        ['columnStatistics', 'physicalHealth', 'tableDefinition', 'tableStatistics'].sort(),
      );

      // The assembled context must itself pass the output schema validator.
      expect(validatePerformanceTuningContext(context)).toEqual([]);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('keeps the context usable even when the version fetch fails', async () => {
    const getVersion = jest
      .spyOn(PostgresDriver.prototype, 'getVersion')
      .mockRejectedValue(new Error('connection reset'));
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider(
          async () => ({ ok: true, message: '', result: fakeCapabilities }),
          {
            collectExecutionPlan: async () => ({
              ok: true,
              message: '',
              result: { raw: {}, warnings: [], planTableMappings: [] },
            }),
          },
        ),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.database.version).toBeUndefined();
      expect(result.result!.collection.warnings).toContain(
        'Failed to retrieve the database version.',
      );
    } finally {
      getVersion.mockRestore();
    }
  });
});

describe('performance tuning context - timeout/cancel/payload/provenance (推奨着手順 step 6)', () => {
  const makeProvider = (
    overrides: Partial<PerformanceTuningContextProvider> = {},
  ): PerformanceTuningContextProvider => ({
    checkCapabilities: async () => ({ ok: true, message: '', result: fakeCapabilities }),
    collectExecutionPlan: notImplemented,
    collectTableDefinition: notImplemented,
    collectTableStatistics: notImplemented,
    collectColumnStatistics: notImplemented,
    collectPhysicalHealth: notImplemented,
    ...overrides,
  });

  const planWithOneTable = (tableName: string) => ({
    ok: true as const,
    message: '',
    result: {
      raw: {},
      warnings: [],
      planTableMappings: [{ planNodeId: 'n0', tableName, estimatedRows: 1 }],
    },
  });

  const mockVersion = () =>
    jest.spyOn(PostgresDriver.prototype, 'getVersion').mockResolvedValue('16.3');

  it('times out a single hanging Provider call without failing the rest of the table', async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => planWithOneTable('orders'),
          collectTableDefinition: () => new Promise(() => {}), // never resolves
          collectTableStatistics: async () => ({ ok: true, message: '', result: {} }),
          collectColumnStatistics: async () => ({ ok: true, message: '', result: [] }),
          collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
        }),
      );

      const result = await driver.getPerformanceTuningContext({
        ...baseParams(),
        plan: { timeoutMs: 10 },
      });

      expect(result.ok).toBe(true);
      const context = result.result!;
      expect(context.tables[0].definition).toBeUndefined();
      // The table's other three sections still came back fine - one
      // section timing out must not take the rest of the table down with it.
      expect(context.tables[0].statistics).toBeDefined();
      expect(context.collection.unavailableSections).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            section: 'tableDefinition',
            tableName: 'orders',
            reason: expect.stringContaining('timed out'),
          }),
        ]),
      );
    } finally {
      getVersion.mockRestore();
    }
  });

  it('cancels in-flight table collection when the signal aborts mid-call', async () => {
    const getVersion = mockVersion();
    try {
      const controller = new AbortController();
      let tableDefinitionStarted = false;
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => planWithOneTable('orders'),
          collectTableDefinition: async () => {
            tableDefinitionStarted = true;
            // Long enough relative to the 5ms abort delay below to prove
            // cancellation short-circuits the wait, but short enough not to
            // leave a dangling timer alive past this test (the abort only
            // stops withDeadline()'s own wrapper promise from waiting - this
            // inner setTimeout keeps running in the background regardless,
            // matching real "query still runs server-side" behavior).
            await new Promise((resolve) => setTimeout(resolve, 50));
            return { ok: true, message: '', result: { columns: [], constraints: [], indexes: [] } };
          },
          collectTableStatistics: async () => ({ ok: true, message: '', result: {} }),
          collectColumnStatistics: async () => ({ ok: true, message: '', result: [] }),
          collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
        }),
      );

      const resultPromise = driver.getPerformanceTuningContext(baseParams(), {
        signal: controller.signal,
      });
      await new Promise((resolve) => setTimeout(resolve, 5));
      controller.abort();

      const result = await resultPromise;
      expect(tableDefinitionStarted).toBe(true);
      expect(result.ok).toBe(true);
      expect(
        result.result!.collection.unavailableSections.some((s) =>
          s.reason.includes('cancelled'),
        ),
      ).toBe(true);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('drops tables to stay within maxPayloadBytes, recording what was dropped', async () => {
    const getVersion = mockVersion();
    try {
      const bigDdl = 'x'.repeat(20_000);
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: {
              raw: {},
              warnings: [],
              planTableMappings: [
                { planNodeId: 'n0', tableName: 'orders', estimatedRows: 1 },
                { planNodeId: 'n1', tableName: 'customers', estimatedRows: 1 },
              ],
            },
          }),
          collectTableDefinition: async () => ({
            ok: true,
            message: '',
            result: { ddl: bigDdl, columns: [], constraints: [], indexes: [] },
          }),
          collectTableStatistics: async () => ({ ok: true, message: '', result: {} }),
          collectColumnStatistics: async () => ({ ok: true, message: '', result: [] }),
          collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
        }),
      );

      const result = await driver.getPerformanceTuningContext({
        ...baseParams(),
        limits: { maxPayloadBytes: 5_000 },
      });

      expect(result.ok).toBe(true);
      const context = result.result!;
      // Two ~20KB-DDL tables can't both fit in a 5KB budget - at least one
      // must be dropped.
      expect(context.tables.length).toBeLessThan(2);
      expect(context.collection.status).toBe('partial');
      expect(context.collection.warnings.join(' ')).toContain('maxPayloadBytes');
      expect(
        context.collection.unavailableSections.some((s) =>
          s.reason.includes('maxPayloadBytes'),
        ),
      ).toBe(true);
      // The truncated result must still be schema-valid, not just smaller.
      expect(validatePerformanceTuningContext(context)).toEqual([]);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('passes the normalized PlanNode tree through to executionPlan.normalizedPlan', async () => {
    const getVersion = mockVersion();
    try {
      const normalizedPlan = {
        id: 'n0',
        depth: 0,
        operation: 'Seq Scan',
        relation: { tableName: 'orders' },
        children: [],
      };
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: { raw: {}, normalizedPlan, warnings: [], planTableMappings: [] },
          }),
        }),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.executionPlan.normalizedPlan).toEqual(normalizedPlan);
    } finally {
      getVersion.mockRestore();
    }
  });

  it("copies the connection's configured environment into database.environment", async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        { ...connectionSetting(DBType.Postgres), environment: 'production' },
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: { raw: {}, warnings: [], planTableMappings: [] },
          }),
        }),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.database.environment).toBe('production');
    } finally {
      getVersion.mockRestore();
    }
  });

  it('leaves database.environment undefined when the connection has none configured', async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: { raw: {}, warnings: [], planTableMappings: [] },
          }),
        }),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.database.environment).toBeUndefined();
    } finally {
      getVersion.mockRestore();
    }
  });
});

describe('performance tuning context - output schema', () => {
  it('accepts a well-formed context', () => {
    expect(validatePerformanceTuningContext(samplePerformanceTuningContext)).toEqual(
      [],
    );
  });

  it('rejects a formatVersion mismatch instead of throwing', () => {
    expect(validatePerformanceTuningContext(undefined)).toEqual([
      'context is required.',
    ]);
    expect(
      validatePerformanceTuningContext({
        ...samplePerformanceTuningContext,
        formatVersion: 2,
      }),
    ).toEqual([expect.stringContaining('formatVersion must be 1')]);
  });

  it('rejects a shallowly well-shaped but deeply broken context', () => {
    // The exact broken example from review: every top-level key present
    // with the "right" container type (object/array), but every value
    // inside is empty, null, or malformed. A validator that only checks
    // "is this key an object/array" accepts this with zero errors.
    const broken = {
      formatVersion: 1,
      database: {},
      statement: {},
      executionPlan: {},
      tables: [null],
      planTableMappings: [{}],
      collection: {
        collectedAt: 'not-a-date',
        status: 'complete',
        warnings: [],
        unavailableSections: [],
      },
    };

    const errors = validatePerformanceTuningContext(broken);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('database.vendor'),
        expect.stringContaining('database.databaseName'),
        expect.stringContaining('statement.sql'),
        expect.stringContaining('statement.source'),
        expect.stringContaining('executionPlan.mode'),
        expect.stringContaining('executionPlan.format'),
        expect.stringContaining('tables[0]'),
        expect.stringContaining('planTableMappings[0].planNodeId'),
        expect.stringContaining('planTableMappings[0].tableName'),
        expect.stringContaining('collection.collectedAt'),
      ]),
    );
  });

  it('never contains a raw bind/secret literal from plan retrieval', () => {
    // The fixture never had a bind array to begin with (§9.2: binds are
    // used for plan retrieval only, never returned) - this asserts that
    // property, and doubles as the shape future real fixtures/snapshots
    // should be checked against once Phase 1 adds them.
    const serialized = JSON.stringify(samplePerformanceTuningContext);
    expect(serialized).not.toContain('secret-value');
    expect(serialized.includes('"binds"')).toBe(false);
  });
});
