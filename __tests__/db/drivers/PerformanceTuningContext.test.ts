import {
  ConnectionSetting,
  DBType,
  GeneralResult,
  MAX_MAX_PAYLOAD_BYTES,
  MAX_PLAN_TIMEOUT_MS,
  MySQLDriver,
  classifyPerformanceTuningStatement,
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

// PostgresDriver is already used as a plain (unconnected) instance elsewhere in this test suite; subclassing it just to override the protected Provider hook keeps the fake as close as possible to how a real Vendor driver would wire one in.
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
    // binds are threaded through only for plan retrieval; the public PerformanceTuningContext type has no field to place them into.
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
    // An unrecognized mode is never silently trusted downstream - it falls back to the safe default rather than reaching a Provider as-is.
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

    // allowExecution: true alone must not be enough to let a non-SELECT (or unparseable/multi-statement) statement through Analyze.
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

  it('classifies DML so clients can consistently disable Analyze', () => {
    expect(classifyPerformanceTuningStatement('UPDATE orders SET status = 1')).toEqual({
      kind: 'update',
      analyzeEligibility: {
        allowed: false,
        reason: 'Explain Analyze is limited to a single SELECT statement.',
      },
    });
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

describe('performance tuning context - unsupported drivers', () => {
  it('reports unsupported for every RDS driver without a Provider yet', () => {
    const driver = new SQLiteDriver(connectionSetting(DBType.SQLite));
    expect(driver.supportsGetPerformanceTuningContext()).toBe(false);
  });

  it('reports PostgreSQL/MySQL/SQLServer/Oracle as supported now that a Provider is wired in (推奨着手順 step 4/8)', () => {
    expect(
      new PostgresDriver(connectionSetting(DBType.Postgres)).supportsGetPerformanceTuningContext(),
    ).toBe(true);
    expect(
      new MySQLDriver(connectionSetting(DBType.MySQL)).supportsGetPerformanceTuningContext(),
    ).toBe(true);
    expect(
      new SQLServerDriver(connectionSetting(DBType.SQLServer)).supportsGetPerformanceTuningContext(),
    ).toBe(true);
    expect(
      new OracleDriver(connectionSetting(DBType.Oracle)).supportsGetPerformanceTuningContext(),
    ).toBe(true);
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
        // A real driver exception can embed SQL text, a connection string, or bind values - none of that may reach the public result, since this API's purpose is to hand data to an external AI.
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

      // The detail isn't discarded outright - it goes to the local console instead of the public result.
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

  it('assembles a partial context from plan and table resolution alone', async () => {
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
                diagnostics: [],
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
        { schemaName: undefined, tableName: 'orders' },
      ]);
      // DDL/statistics/physical health aren't collected in this step yet - the caller must see that as a partial result, not silently missing data.
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

  it('resolves a plan-reported alias tableName via tableAliasMap before using it anywhere', async () => {
    // Mirrors MySQL's EXPLAIN FORMAT=JSON gap: the plan only ever knows the aliases "o"/"c", never the real table names.
    const getVersion = jest
      .spyOn(PostgresDriver.prototype, 'getVersion')
      .mockResolvedValue('16.3');
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.MySQL),
        makeProvider(
          async () => ({ ok: true, message: '', result: fakeCapabilities }),
          {
            collectExecutionPlan: async () => ({
              ok: true,
              message: '',
              result: {
                raw: {},
                diagnostics: [],
                planTableMappings: [
                  { planNodeId: 'n0', tableName: 'o', estimatedRows: 41, filterColumns: ['status'] },
                  { planNodeId: 'n1', tableName: 'c', estimatedRows: 41 },
                ],
              },
            }),
          },
        ),
      );

      const params: PerformanceTuningContextParams = {
        ...baseParams(),
        tableAliasMap: {
          o: { schemaName: 'performance_lab', tableName: 'orders' },
          c: { schemaName: 'performance_lab', tableName: 'customers' },
        },
      };

      const result = await driver.getPerformanceTuningContext(params);
      expect(result.ok).toBe(true);
      const context = result.result!;

      // Output planTableMappings is resolved too - plan node <-> tables[] linkage must stay intact under the real names.
      expect(
        context.planTableMappings.map((m) => ({ tableName: m.tableName, schemaName: m.schemaName })),
      ).toEqual([
        { tableName: 'orders', schemaName: 'performance_lab' },
        { tableName: 'customers', schemaName: 'performance_lab' },
      ]);

      // No "o"/"c" ghost entries alongside the resolved ones.
      expect(context.tables.map((t) => ({ tableName: t.tableName, schemaName: t.schemaName }))).toEqual([
        { tableName: 'orders', schemaName: 'performance_lab' },
        { tableName: 'customers', schemaName: 'performance_lab' },
      ]);
      expect(
        context.collection.unavailableSections.some((s) => s.tableName === 'o' || s.tableName === 'c'),
      ).toBe(false);

      expect(validatePerformanceTuningContext(context)).toEqual([]);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('leaves a plan-reported tableName unchanged when tableAliasMap has no matching entry (default/back-compat)', async () => {
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
                raw: {},
                diagnostics: [],
                planTableMappings: [
                  { planNodeId: 'n0', tableName: 'orders', estimatedRows: 41 },
                ],
              },
            }),
          },
        ),
      );

      // No tableAliasMap at all - exactly today's call shape.
      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.tables.map((t) => t.tableName)).toEqual(['orders']);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('dedupes a tableAliasMap-resolved table against the same table added via targetTables', async () => {
    const getVersion = jest
      .spyOn(PostgresDriver.prototype, 'getVersion')
      .mockResolvedValue('16.3');
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.MySQL),
        makeProvider(
          async () => ({ ok: true, message: '', result: fakeCapabilities }),
          {
            collectExecutionPlan: async () => ({
              ok: true,
              message: '',
              result: {
                raw: {},
                diagnostics: [],
                planTableMappings: [{ planNodeId: 'n0', tableName: 'o', estimatedRows: 41 }],
              },
            }),
          },
        ),
      );

      const params: PerformanceTuningContextParams = {
        ...baseParams(),
        tableAliasMap: { o: { schemaName: 'performance_lab', tableName: 'orders' } },
        targetTables: [{ schemaName: 'performance_lab', tableName: 'orders' }],
      };

      const result = await driver.getPerformanceTuningContext(params);
      expect(result.ok).toBe(true);
      expect(result.result!.tables).toHaveLength(1);
      expect(result.result!.tables[0]).toEqual(
        expect.objectContaining({ schemaName: 'performance_lab', tableName: 'orders' }),
      );
    } finally {
      getVersion.mockRestore();
    }
  });

  it('does not add a duplicate, differently-cased entry when targetTables coincidentally matches an already-resolved table (Oracle live repro)', async () => {
    const getVersion = jest
      .spyOn(PostgresDriver.prototype, 'getVersion')
      .mockResolvedValue('16.3');
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Oracle),
        makeProvider(
          async () => ({ ok: true, message: '', result: fakeCapabilities }),
          {
            collectExecutionPlan: async () => ({
              ok: true,
              message: '',
              result: {
                raw: {},
                diagnostics: [],
                planTableMappings: [
                  { planNodeId: 'n0', schemaName: 'PERFLAB', tableName: 'ORDERS', estimatedRows: 499 },
                ],
              },
            }),
          },
        ),
      );

      const params: PerformanceTuningContextParams = {
        ...baseParams(),
        // No tableAliasMap here - this is specifically the targetTables-only dedup path, distinct from the tableAliasMap guard above.
        targetTables: [{ schemaName: undefined, tableName: 'orders' }],
      };

      const result = await driver.getPerformanceTuningContext(params);
      expect(result.ok).toBe(true);
      // Exactly one table - not two (the real "PERFLAB.ORDERS" plus a bogus lowercase, schema-less "orders" ghost entry).
      expect(result.result!.tables.map((t) => ({ schemaName: t.schemaName, tableName: t.tableName }))).toEqual([
        { schemaName: 'PERFLAB', tableName: 'ORDERS' },
      ]);
      expect(
        result.result!.collection.unavailableSections.some((s) => s.tableName === 'orders'),
      ).toBe(false);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('leaves an already-correct plan-resolved tableName/schemaName unchanged when tableAliasMap only has a coincidental bare-name match (Oracle)', async () => {
    // Oracle's plan already resolves the real, correctly-cased, schema-qualified name ("ORDERS"/"PERFLAB" - Oracle folds unquoted identifiers to uppercase).
    const getVersion = jest
      .spyOn(PostgresDriver.prototype, 'getVersion')
      .mockResolvedValue('16.3');
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Oracle),
        makeProvider(
          async () => ({ ok: true, message: '', result: fakeCapabilities }),
          {
            collectExecutionPlan: async () => ({
              ok: true,
              message: '',
              result: {
                raw: {},
                diagnostics: [],
                planTableMappings: [
                  { planNodeId: 'n0', schemaName: 'PERFLAB', tableName: 'ORDERS', estimatedRows: 499 },
                ],
              },
            }),
          },
        ),
      );

      const params: PerformanceTuningContextParams = {
        ...baseParams(),
        tableAliasMap: {
          o: { tableName: 'orders' },
          orders: { tableName: 'orders' },
        },
      };

      const result = await driver.getPerformanceTuningContext(params);
      expect(result.ok).toBe(true);
      const context = result.result!;

      expect(
        context.planTableMappings.map((m) => ({ tableName: m.tableName, schemaName: m.schemaName })),
      ).toEqual([{ tableName: 'ORDERS', schemaName: 'PERFLAB' }]);
      expect(context.tables.map((t) => ({ tableName: t.tableName, schemaName: t.schemaName }))).toEqual([
        { tableName: 'ORDERS', schemaName: 'PERFLAB' },
      ]);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('does not mark the result partial when the only diagnostics are informational', async () => {
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
                raw: {},
                diagnostics: [
                  {
                    code: 'NON_TABLE_PLAN_SOURCE',
                    severity: 'info',
                    affectsCompleteness: false,
                    scope: 'executionPlan',
                    message: 'Plan node n0 (Function Scan) reads from a non-table source.',
                    node: {
                      id: 'n0',
                      operation: 'Function Scan',
                      objectKind: 'function',
                      objectName: 'pg_stat_statements',
                    },
                  },
                ],
                // No resolved tables at all - keeps this test isolated to the diagnostics-only question, not table collection.
                planTableMappings: [],
              },
            }),
          },
        ),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      const context = result.result!;
      expect(context.tables).toEqual([]);
      expect(context.collection.unavailableSections).toEqual([]);
      expect(context.collection.diagnostics).toHaveLength(1);
      expect(context.collection.diagnostics[0].severity).toBe('info');
      expect(context.collection.status).toBe('complete');
      expect(validatePerformanceTuningContext(context)).toEqual([]);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('marks the result partial when a diagnostic has affectsCompleteness: true, even with no unavailableSections', async () => {
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
                raw: {},
                diagnostics: [
                  {
                    code: 'TABLE_MAPPING_FAILED',
                    severity: 'warning',
                    affectsCompleteness: true,
                    scope: 'executionPlan',
                    message: 'Could not resolve a table for plan node n0.',
                    node: { id: 'n0', operation: 'Some Future Scan' },
                  },
                ],
                planTableMappings: [],
              },
            }),
          },
        ),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      const context = result.result!;
      expect(context.collection.unavailableSections).toEqual([]);
      expect(context.collection.status).toBe('partial');
    } finally {
      getVersion.mockRestore();
    }
  });

  it('does not mark the result partial for a warning diagnostic explicitly marked affectsCompleteness: false', async () => {
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
                raw: {},
                diagnostics: [
                  {
                    code: 'PLAN_OBSERVATION',
                    severity: 'warning',
                    affectsCompleteness: false,
                    scope: 'executionPlan',
                    message: 'A warning-severity observation that this driver does not treat as incomplete.',
                    node: { id: 'n0', operation: 'Seq Scan' },
                  },
                ],
                planTableMappings: [],
              },
            }),
          },
        ),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      const context = result.result!;
      expect(context.collection.unavailableSections).toEqual([]);
      expect(context.collection.status).toBe('complete');
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
              result: { raw: {}, diagnostics: [], planTableMappings: [] },
            }),
          },
        ),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.database.version).toBeUndefined();
      expect(result.result!.collection.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'DATABASE_VERSION_UNAVAILABLE',
            severity: 'warning',
            affectsCompleteness: true,
            message: 'Failed to retrieve the database version.',
          }),
        ]),
      );
    } finally {
      getVersion.mockRestore();
    }
  });

  it('keeps successfully-collected column statistics even when table statistics fails', async () => {
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
                raw: {},
                diagnostics: [],
                planTableMappings: [{ planNodeId: 'n0', tableName: 'orders', estimatedRows: 1 }],
              },
            }),
            collectTableDefinition: async () => ({
              ok: true,
              message: '',
              result: { columns: [], constraints: [], indexes: [] },
            }),
            // collectTableStatistics()/collectColumnStatistics() are independent Provider calls - one failing must not discard the other's already-fetched result.
            collectTableStatistics: async () => ({
              ok: false,
              message: 'permission denied for pg_stat_user_tables',
            }),
            collectColumnStatistics: async () => ({
              ok: true,
              message: '',
              result: [{ columnName: 'status', distinctCount: { value: 2, estimated: true, source: 'x' } }],
            }),
            collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
          },
        ),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      const table = result.result!.tables[0];
      // The failed table-level statistics leaves no estimatedRowCount/etc., but the successful column statistics must still be present, not silently dropped just because `statistics` had nowhere to attach.
      expect(table.statistics).toBeDefined();
      expect(table.statistics!.estimatedRowCount).toBeUndefined();
      expect(table.statistics!.columns).toEqual([
        expect.objectContaining({ columnName: 'status', distinctCount: expect.objectContaining({ value: 2 }) }),
      ]);
      expect(
        result.result!.collection.unavailableSections.map((s) => s.section),
      ).toEqual(['tableStatistics']);
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
      diagnostics: [],
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
      // The table's other three sections still came back fine - one section timing out must not take the rest of the table down with it.
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
              diagnostics: [],
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
      // Two ~20KB-DDL tables can't both fit in a 5KB budget - at least one must be dropped.
      expect(context.tables.length).toBeLessThan(2);
      expect(context.collection.status).toBe('partial');
      expect(
        context.collection.diagnostics.some(
          (d) => d.code === 'COLLECTION_TRUNCATED' && d.message.includes('maxPayloadBytes'),
        ),
      ).toBe(true);
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

  // executionPlan.dominantCostPlanNode
  it("passes a Provider-supplied dominantCostPlanNode through untouched, rather than overriding it with the generic normalizedPlan-based fallback", async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: {
              raw: {},
              normalizedPlan: { id: 'n0', depth: 0, operation: 'Seq Scan', estimated: { totalCost: 999 }, children: [] },
              // A vendor Provider (MySQL) resolving this itself from real actual plan, deliberately different from what the generic estimated-cost fallback below would compute from normalizedPlan (totalCost: 999) - proves the Provider's own answer wins.
              dominantCostPlanNode: { planNodeId: 'n0', metric: 'actual' as const, exclusiveValue: 12.5 },
              diagnostics: [],
              planTableMappings: [{ planNodeId: 'n0', tableName: 'orders', estimatedRows: 1 }],
            },
          }),
          collectTableDefinition: async () => ({ ok: true, message: '', result: { columns: [], constraints: [], indexes: [] } }),
          collectTableStatistics: async () => ({ ok: true, message: '', result: {} }),
          collectColumnStatistics: async () => ({ ok: true, message: '', result: [] }),
          collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
        }),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.executionPlan.dominantCostPlanNode).toEqual({
        planNodeId: 'n0',
        metric: 'actual',
        exclusiveValue: 12.5,
      });
    } finally {
      getVersion.mockRestore();
    }
  });

  it('falls back to computing dominantCostPlanNode from normalizedPlan when the Provider does not supply one', async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: {
              raw: {},
              normalizedPlan: {
                id: 'n0',
                depth: 0,
                operation: 'Seq Scan',
                estimated: { totalCost: 42 },
                children: [],
              },
              // No dominantCostPlanNode from this Provider (e.g. Postgres, whose real actual data - when present - already lives on normalizedPlan itself, not resolved separately).
              diagnostics: [],
              planTableMappings: [{ planNodeId: 'n0', tableName: 'orders', estimatedRows: 1 }],
            },
          }),
          collectTableDefinition: async () => ({ ok: true, message: '', result: { columns: [], constraints: [], indexes: [] } }),
          collectTableStatistics: async () => ({ ok: true, message: '', result: {} }),
          collectColumnStatistics: async () => ({ ok: true, message: '', result: [] }),
          collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
        }),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.executionPlan.dominantCostPlanNode).toEqual({
        planNodeId: 'n0',
        metric: 'estimated',
        exclusiveValue: 42,
      });
    } finally {
      getVersion.mockRestore();
    }
  });

  it('clears dominantCostPlanNode when the plan itself is dropped to stay within maxPayloadBytes (its planNodeId would otherwise dangle with nothing to resolve against)', async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: {
              // Oversized on its own - no tables to drop first (empty planTableMappings), so this must hit the plan-drop branch of enforcePayloadBudget() directly.
              raw: { pad: 'x'.repeat(20_000) },
              normalizedPlan: { id: 'n0', depth: 0, operation: 'Seq Scan', estimated: { totalCost: 100 }, children: [] },
              diagnostics: [],
              planTableMappings: [],
            },
          }),
        }),
      );

      const result = await driver.getPerformanceTuningContext({
        ...baseParams(),
        limits: { maxPayloadBytes: 5_000 },
      });

      expect(result.ok).toBe(true);
      const context = result.result!;
      expect(context.executionPlan.normalizedPlan).toBeUndefined();
      expect(context.executionPlan.dominantCostPlanNode).toBeUndefined();
      expect(validatePerformanceTuningContext(context)).toEqual([]);
    } finally {
      getVersion.mockRestore();
    }
  });

  it('keeps table-access fraction and predicate-filter pass rate separate', async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => ({
            ok: true,
            message: '',
            result: {
              raw: {},
              diagnostics: [],
              planTableMappings: [
                {
                  planNodeId: 'n0', tableName: 'orders', estimatedRows: 32400, actualRows: 150,
                  tableAccessRows: { value: 600, estimated: false, source: 'test access input' },
                  predicateFilterInputRows: { value: 600, estimated: false, source: 'test filter input' },
                  predicateFilterOutputRows: { value: 150, estimated: false, source: 'test filter output' },
                },
              ],
            },
          }),
          collectTableDefinition: async () => ({ ok: true, message: '', result: { columns: [], constraints: [], indexes: [] } }),
          collectTableStatistics: async () => ({
            ok: true,
            message: '',
            result: { estimatedRowCount: { value: 300000, estimated: true, source: 'pg_class.reltuples' } },
          }),
          collectColumnStatistics: async () => ({ ok: true, message: '', result: [] }),
          collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
        }),
      );

      const result = await driver.getPerformanceTuningContext(baseParams());
      expect(result.ok).toBe(true);
      expect(result.result!.planTableMappings[0].tableAccessFraction).toEqual({
        value: 0.002,
        estimated: true,
        source: 'test access input / pg_class.reltuples',
      });
      expect(result.result!.planTableMappings[0].predicateFilterSelectivity).toEqual({
        value: 0.25,
        estimated: false,
        source: 'test filter output / test filter input',
      });
    } finally {
      getVersion.mockRestore();
    }
  });

  it('fails outright when even the fully-truncated skeleton still exceeds maxPayloadBytes', async () => {
    const getVersion = mockVersion();
    try {
      const driver = new FakeProviderDriver(
        connectionSetting(DBType.Postgres),
        makeProvider({
          collectExecutionPlan: async () => planWithOneTable('orders'),
          collectTableDefinition: async () => ({
            ok: true,
            message: '',
            result: { columns: [], constraints: [], indexes: [] },
          }),
          collectTableStatistics: async () => ({ ok: true, message: '', result: {} }),
          collectColumnStatistics: async () => ({ ok: true, message: '', result: [] }),
          collectPhysicalHealth: async () => ({ ok: true, message: '', result: { metrics: [] } }),
        }),
      );

      // 1 byte (the clamp's own floor) is unsatisfiable by any real context, even one with every table/plan already dropped - this must surface as a hard failure, not a "success" carrying an over-budget payload.
      const result = await driver.getPerformanceTuningContext({
        ...baseParams(),
        limits: { maxPayloadBytes: 1 },
      });

      expect(result.ok).toBe(false);
      expect(result.message).toContain('maxPayloadBytes');
      expect(result.result).toBeUndefined();
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
            result: { raw: {}, normalizedPlan, diagnostics: [], planTableMappings: [] },
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
            result: { raw: {}, diagnostics: [], planTableMappings: [] },
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
            result: { raw: {}, diagnostics: [], planTableMappings: [] },
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
    // The exact broken example from review: every top-level key present with the "right" container type (object/array), but every value inside is empty, null, or malformed.
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
        // A malformed diagnostic (right container type, wrong/missing fields inside) must be caught the same way a malformed table or planTableMappings entry already is above.
        diagnostics: [{}],
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
        expect.stringContaining('collection.diagnostics[0].code'),
        expect.stringContaining('collection.diagnostics[0].severity'),
        expect.stringContaining('collection.diagnostics[0].scope'),
        expect.stringContaining('collection.diagnostics[0].message'),
      ]),
    );
  });

  it('rejects an info diagnostic with affectsCompleteness: true (review finding)', () => {
    const broken = {
      ...samplePerformanceTuningContext,
      collection: {
        ...samplePerformanceTuningContext.collection,
        diagnostics: [
          {
            code: 'NON_TABLE_PLAN_SOURCE',
            severity: 'info',
            affectsCompleteness: true,
            scope: 'executionPlan',
            message: 'x',
          },
        ],
      },
    };

    expect(validatePerformanceTuningContext(broken)).toEqual([
      expect.stringContaining("collection.diagnostics[0].affectsCompleteness must be false when severity is 'info'"),
    ]);
  });

  it("rejects a diagnostic whose severity does not match its code's fixed severity", () => {
    const broken = {
      ...samplePerformanceTuningContext,
      collection: {
        ...samplePerformanceTuningContext.collection,
        diagnostics: [
          {
            code: 'NON_TABLE_PLAN_SOURCE', // always 'info'
            severity: 'warning',
            affectsCompleteness: true,
            scope: 'executionPlan',
            message: 'x',
          },
        ],
      },
    };

    expect(validatePerformanceTuningContext(broken)).toEqual([
      expect.stringContaining("collection.diagnostics[0].severity must be 'info' for code 'NON_TABLE_PLAN_SOURCE'"),
    ]);
  });

  it('never contains a raw bind/secret literal from plan retrieval', () => {
    const serialized = JSON.stringify(samplePerformanceTuningContext);
    expect(serialized).not.toContain('secret-value');
    expect(serialized.includes('"binds"')).toBe(false);
  });
});
