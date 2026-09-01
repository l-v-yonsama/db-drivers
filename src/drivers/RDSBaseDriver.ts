import {
  ResultSetData,
  ResultSetDataBuilder,
  equalsIgnoreCase,
  toNum,
} from '@l-v-yonsama/rdh';
import {
  needsQuoting,
  parseQuery,
  toCountRecordsQuery,
  toViewRecordsQuery,
  wrapQuote,
} from '../helpers';
import {
  DbSchema,
  DbTable,
  RdsDatabase,
  SchemaAndTableName,
} from '../resource';
import {
  ConnectionSetting,
  GeneralResult,
  PerformanceTuningAvailabilityParams,
  PerformanceTuningCallOptions,
  PerformanceTuningCapabilities,
  PerformanceTuningContext,
  PerformanceTuningContextParams,
  PerformanceTuningDiagnostic,
  RdbDashboardCallOptions,
  RdbDashboardCapabilities,
  RdbDashboardSelection,
  RdbDashboardTarget,
  RdbRawSampleBatch,
  RdbSampleRequest,
  ResolvedRdbDashboard,
  QStatement,
  QueryParams,
  SQLLang,
  StatementStatisticsParams,
  TableStatisticsContext,
  TransactionControlType,
  TransactionIsolationLevel,
  ViewRecordsParams,
} from '../types';
import {
  acceptResourceFilter,
  classifyPerformanceTuningStatement,
  isSingleSelectStatement,
  normalizePerformanceTuningContextParams,
  setRdhMetaAndStatement,
  validatePerformanceTuningContextParams,
} from '../utils';
import { BaseSQLSupportDriver } from './BaseSQLSupportDriver';
import {
  PerformanceTuningContextProvider,
  RdbDashboardProvider,
  VendorColumnStatistics,
  VendorPhysicalHealth,
  VendorTableDefinition,
  VendorTableStatistics,
  computePredicateFilterSelectivity,
  computeTableAccessFraction,
  findDominantCostPlanNode,
  RDB_DASHBOARD_CANCELLED_MESSAGE,
  RDB_DASHBOARD_UNEXPECTED_ERROR_MESSAGE,
  rdbDashboardTimeoutMessage,
  validateRdbDashboardCapabilities,
  validateResolvedRdbDashboard,
} from './providers';

export abstract class RDSBaseDriver extends BaseSQLSupportDriver<RdsDatabase> {
  // Actual-plan capture temporarily changes connection/session state on Oracle and SQL Server.
  private exclusiveSessionStateOperation: string | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  protected assertSessionStateAvailable(operation: string): void {
    if (this.exclusiveSessionStateOperation) {
      throw new Error(
        `Cannot ${operation} while ${this.exclusiveSessionStateOperation} is in progress`,
      );
    }
  }

  protected beginExclusiveSessionStateOperation(operation: string): () => void {
    this.assertSessionStateAvailable(operation);
    this.exclusiveSessionStateOperation = operation;
    let released = false;
    return (): void => {
      if (!released) {
        released = true;
        this.exclusiveSessionStateOperation = undefined;
      }
    };
  }

  protected abstract getTestSqlStatement(): string;

  getSqlLang(): SQLLang {
    return 'sql';
  }

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    if (with_connect) {
      errorReason = await this.connect();
    }
    if (!errorReason) {
      try {
        await this.requestSql({ sql: this.getTestSqlStatement() });
      } catch (e) {
        errorReason = e.message;
      }
      if (with_connect) {
        await this.disconnect();
      }
    }
    return errorReason;
  }

  async count(params: SchemaAndTableName): Promise<number | undefined> {
    const schemaName = this.isSchemaSpecificationSvailable() ? params.schema : undefined;
    const { query } = toCountRecordsQuery({
      schemaName,
      tableRes: new DbTable(params.table, null),
      idQuoteCharacter: this.getIdQuoteCharacter(),
    });
    return await this.countSql({
      sql: query,
    });
  }

  async viewRows(params: ViewRecordsParams): Promise<ResultSetData> {
    const { schemaAndName, ...others } = params;

    const query = toViewRecordsQuery({
      schemaName: schemaAndName.schema,
      tableRes: new DbTable(schemaAndName.table, null),
      idQuoteCharacter: this.getIdQuoteCharacter(),
      limitClauseStyle: this.getLimitClauseStyle(),
      ...others,
    });

    return await this.requestSql({
      sql: query,
    });
  }

  abstract useDatabase(database: string): Promise<void>;

  isSchemaSpecificationSvailable(): boolean {
    return true;
  }

  protected getRdsDatabase(): RdsDatabase | undefined {
    const db = this.getFirstDbDatabase();
    if (db instanceof RdsDatabase) {
      return db;
    }
    return undefined;
  }

  async requestSql(params: QueryParams): Promise<ResultSetData> {
    this.assertSessionStateAvailable('run a query');
    const { sql, conditions, prepare } = params;

    let qst: QStatement | undefined = undefined;
    let dbTable: DbTable | undefined = undefined;

    if (conditions?.rawQueries !== true) {
      qst = parseQuery(sql);
      dbTable = this.getDbTable(qst);
      if (qst?.ast?.type) {
        if (!params.meta) {
          params.meta = {};
        }
        params.meta.type = qst?.ast?.type;
      }
    }
    if (prepare && prepare.useDatabaseName) {
      await this.useDatabase(prepare.useDatabaseName);
    }

    const rdb = await this.requestSqlSub({
      ...params,
      dbTable,
    });

    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      useDatabase: prepare?.useDatabaseName,
      params,
      rdb,
      type: qst?.ast?.type,
      qst,
      dbTable,
      tableComment: dbTable?.comment,
    });

    return rdb.build();
  }

  async countSql(params: QueryParams): Promise<number | undefined> {
    if (params.prepare && params.prepare.useDatabaseName) {
      await this.useDatabase(params.prepare.useDatabaseName);
    }
    const rdb = await this.requestSql(params);
    if (rdb.rows.length > 0) {
      const v = rdb.rows[0].values[rdb.keys[0].name];
      return toNum(v);
    }
    return undefined;
  }
  abstract requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  async explainSql(params: QueryParams): Promise<ResultSetData> {
    this.assertSessionStateAvailable('retrieve an execution plan');
    const { sql, prepare } = params;
    const ast = parseQuery(sql);
    const dbTable = this.getDbTable(ast);

    if (prepare && prepare.useDatabaseName) {
      await this.useDatabase(prepare.useDatabaseName);
    }

    const rdb = await this.explainSqlSub({
      ...params,
      dbTable,
    });
    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      useDatabase: prepare?.useDatabaseName,
      params,
      rdb,
      type: 'explain' as any,
      qst: ast,
      dbTable,
      tableComment: dbTable?.comment,
    });

    rdb.rs.meta.compareKeys = undefined; // update

    return rdb.build();
  }

  abstract explainSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  abstract getLocks(dbName: string): Promise<ResultSetData>;
  abstract getSessions(dbName: string): Promise<ResultSetData>;
  abstract supportsGetStatementStatistics(): boolean;
  abstract checkStatementStatisticsAvailability(
    databaseName: string,
  ): Promise<GeneralResult<void>>;
  abstract getStatementStatistics(
    params: StatementStatisticsParams,
  ): Promise<ResultSetData>;

  protected getRdbDashboardProvider(): RdbDashboardProvider | undefined {
    return undefined;
  }

  supportsRdbDashboard(): boolean {
    return this.getRdbDashboardProvider() !== undefined;
  }

  async checkRdbDashboardAvailability(
    target: RdbDashboardTarget,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbDashboardCapabilities>> {
    const provider = this.getRdbDashboardProvider();
    const effectiveOptions = this.normalizeRdbDashboardCallOptions(options);
    const invalid = this.validateRdbDashboardTarget(target);
    if (!provider) {
      return { ok: false, message: 'RDB dashboard is not supported for this database.' };
    }
    if (invalid) {
      return { ok: false, message: invalid };
    }
    const result = await this.callRdbDashboardProvider(
      () => provider.checkCapabilities(target, effectiveOptions),
      effectiveOptions,
      'capability check',
    );
    if (result.ok && result.result) {
      const validationError = validateRdbDashboardCapabilities(result.result, provider.providerId);
      if (validationError) {
        return { ok: false, message: validationError };
      }
    }
    return result;
  }

  async resolveRdbDashboard(
    target: RdbDashboardTarget,
    selection: RdbDashboardSelection,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<ResolvedRdbDashboard>> {
    const provider = this.getRdbDashboardProvider();
    const effectiveOptions = this.normalizeRdbDashboardCallOptions(options);
    const invalid = this.validateRdbDashboardTarget(target);
    if (!provider) {
      return { ok: false, message: 'RDB dashboard is not supported for this database.' };
    }
    if (invalid) {
      return { ok: false, message: invalid };
    }
    if (!this.isValidRdbDashboardSelection(selection)) {
      return { ok: false, message: 'RDB dashboard selection is invalid.' };
    }
    const result = await this.callRdbDashboardProvider(
      () => provider.resolveDashboard(target, selection, effectiveOptions),
      effectiveOptions,
      'definition resolution',
    );
    if (result.ok && result.result) {
      const validationError = validateResolvedRdbDashboard(result.result, provider.providerId);
      if (validationError) {
        return { ok: false, message: validationError };
      }
    }
    return result;
  }

  async collectRdbDashboardSample(
    request: RdbSampleRequest,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbRawSampleBatch>> {
    const provider = this.getRdbDashboardProvider();
    const effectiveOptions = this.normalizeRdbDashboardCallOptions(options);
    const invalid = this.validateRdbDashboardTarget(request?.target);
    if (!provider) {
      return { ok: false, message: 'RDB dashboard is not supported for this database.' };
    }
    if (
      invalid ||
      !request?.sampleSessionId ||
      !Number.isInteger(request.definitionVersion) ||
      request.definitionVersion < 0 ||
      !Number.isInteger(request.sequence) ||
      request.sequence < 0 ||
      !this.isValidRdbDashboardSelection(request.selection) ||
      !Array.isArray(request.metricIds) ||
      request.metricIds.length === 0 ||
      request.metricIds.length > 200 ||
      request.metricIds.some((id) => typeof id !== 'string' || !id || id.length > 128) ||
      new Set(request.metricIds).size !== request.metricIds.length
    ) {
      return { ok: false, message: invalid ?? 'RDB dashboard sample request is invalid.' };
    }
    const result = await this.callRdbDashboardProvider(
      () => provider.collectSample(request, effectiveOptions),
      effectiveOptions,
      'sample collection',
    );
    if (!result.ok || !result.result) {
      return result;
    }
    const batch = result.result;
    const allowedMetrics = new Set(request.metricIds);
    if (
      batch.sampleSessionId !== request.sampleSessionId ||
      batch.definitionVersion !== request.definitionVersion ||
      batch.sequence !== request.sequence ||
      !Array.isArray(batch.observations) ||
      batch.observations.some((it) => !allowedMetrics.has(it.metricId))
    ) {
      return { ok: false, message: 'RDB dashboard provider returned a mismatched sample.' };
    }
    this.enforceRdbDashboardSampleBudget(batch, 2_000_000);
    return result;
  }

  private validateRdbDashboardTarget(target?: RdbDashboardTarget): string | undefined {
    if (!target?.resourceKey || target.resourceKey.length > 256) {
      return 'RDB dashboard resourceKey is required.';
    }
    if (!target.databaseName || target.databaseName.length > 256) {
      return 'RDB dashboard databaseName is required.';
    }
    if (target.dbType !== this.conRes.dbType) {
      return 'RDB dashboard target database type does not match this driver.';
    }
    return undefined;
  }

  private isValidRdbDashboardSelection(selection: RdbDashboardSelection): boolean {
    if (!selection || typeof selection !== 'object' || Array.isArray(selection)) {
      return false;
    }
    const entries = Object.entries(selection);
    return (
      entries.length <= 20 &&
      entries.every(
        ([key, value]) =>
          key.length > 0 && key.length <= 128 && typeof value === 'string' && value.length <= 256,
      )
    );
  }

  private normalizeRdbDashboardCallOptions(
    options?: RdbDashboardCallOptions,
  ): RdbDashboardCallOptions {
    return {
      signal: options?.signal,
      timeoutMs: Math.max(100, Math.min(options?.timeoutMs ?? 3_000, 30_000)),
    };
  }

  private async callRdbDashboardProvider<T>(
    fn: () => Promise<GeneralResult<T>>,
    options: RdbDashboardCallOptions | undefined,
    stage: string,
  ): Promise<GeneralResult<T>> {
    if (options?.signal?.aborted) {
      return { ok: false, message: RDB_DASHBOARD_CANCELLED_MESSAGE };
    }
    const timeoutMs = options?.timeoutMs ?? 3_000;
    return new Promise<GeneralResult<T>>((resolve) => {
      let settled = false;
      const settle = (value: GeneralResult<T>): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        options?.signal?.removeEventListener('abort', onAbort);
        resolve(value);
      };
      const onAbort = (): void => settle({ ok: false, message: RDB_DASHBOARD_CANCELLED_MESSAGE });
      const timer = setTimeout(
        () => settle({ ok: false, message: rdbDashboardTimeoutMessage(stage, timeoutMs) }),
        timeoutMs,
      );
      options?.signal?.addEventListener('abort', onAbort);
      Promise.resolve()
        .then(fn)
        .then((result) => {
          if (!result || typeof result.ok !== 'boolean') {
            settle({ ok: false, message: RDB_DASHBOARD_UNEXPECTED_ERROR_MESSAGE });
            return;
          }
          settle(result);
        })
        .catch((error) => {
          // SQL, bind values, hosts and credentials can be present in driver errors.
          // eslint-disable-next-line no-console
          console.error(`[rdbDashboard:${stage}] Provider failed:`, error);
          settle({ ok: false, message: RDB_DASHBOARD_UNEXPECTED_ERROR_MESSAGE });
        });
    });
  }

  private enforceRdbDashboardSampleBudget(batch: RdbRawSampleBatch, maxBytes: number): void {
    const size = (): number => Buffer.byteLength(JSON.stringify(batch), 'utf8');
    let truncated = false;
    while (batch.observations.length > 0 && size() > maxBytes) {
      batch.observations.pop();
      truncated = true;
    }
    if (truncated) {
      batch.diagnostics.push({
        sectionId: 'dashboard',
        severity: 'warning',
        code: 'payload-truncated',
        message: 'Some observations were omitted to stay within the payload limit.',
      });
    }
  }

  protected getPerformanceTuningContextProvider():
    | PerformanceTuningContextProvider
    | undefined {
    return undefined;
  }

  supportsGetPerformanceTuningContext(): boolean {
    return this.getPerformanceTuningContextProvider() !== undefined;
  }

  async checkPerformanceTuningContextAvailability(
    params: PerformanceTuningAvailabilityParams,
    options?: PerformanceTuningCallOptions,
  ): Promise<GeneralResult<PerformanceTuningCapabilities>> {
    const provider = this.getPerformanceTuningContextProvider();
    if (!provider) {
      return {
        ok: false,
        message: 'Performance tuning context is not supported for this database.',
      };
    }
    if (!params || !params.databaseName) {
      return { ok: false, message: 'databaseName is required.' };
    }
    if (options?.signal?.aborted) {
      return { ok: false, message: 'Performance tuning context collection was cancelled.' };
    }

    try {
      return await provider.checkCapabilities(params, options);
    } catch (e) {
      return this.toPerformanceTuningContextErrorResult(e, 'checkCapabilities');
    }
  }

  private toPerformanceTuningContextErrorResult<T>(
    e: unknown,
    stage: string,
  ): GeneralResult<T> {
    // eslint-disable-next-line no-console
    console.error(`[getPerformanceTuningContext:${stage}] Provider threw an unexpected error:`, e);
    return {
      ok: false,
      message:
        'Performance tuning context collection failed unexpectedly. Check the extension/driver logs for details.',
    };
  }

  private async safeCollect<T>(
    fn: () => Promise<GeneralResult<T>>,
    stage: string,
  ): Promise<GeneralResult<T>> {
    try {
      return await fn();
    } catch (e) {
      return this.toPerformanceTuningContextErrorResult<T>(e, stage);
    }
  }

  private async withDeadline<T>(
    fn: () => Promise<GeneralResult<T>>,
    deadline: { signal?: AbortSignal; timeoutMs: number },
    stage: string,
  ): Promise<GeneralResult<T>> {
    if (deadline.signal?.aborted) {
      return { ok: false, message: 'Performance tuning context collection was cancelled.' };
    }

    return new Promise<GeneralResult<T>>((resolve) => {
      let settled = false;
      const cleanup = (): void => {
        clearTimeout(timer);
        deadline.signal?.removeEventListener('abort', onAbort);
      };
      const settle = (result: GeneralResult<T>): void => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(result);
      };
      const onAbort = (): void => {
        settle({ ok: false, message: 'Performance tuning context collection was cancelled.' });
      };
      const timer = setTimeout(() => {
        settle({ ok: false, message: `${stage} timed out after ${deadline.timeoutMs}ms.` });
      }, deadline.timeoutMs);
      deadline.signal?.addEventListener('abort', onAbort);

      this.safeCollect(fn, stage).then(settle);
    });
  }

  private enforcePayloadBudget(
    context: PerformanceTuningContext,
    maxPayloadBytes: number,
  ): boolean {
    const payloadSize = (): number => Buffer.byteLength(JSON.stringify(context), 'utf8');

    if (payloadSize() <= maxPayloadBytes) {
      return false;
    }

    let truncated = false;
    while (context.tables.length > 0 && payloadSize() > maxPayloadBytes) {
      const dropped = context.tables.pop();
      if (!dropped) {
        break;
      }
      truncated = true;
      for (const section of [
        'tableDefinition',
        'tableStatistics',
        'columnStatistics',
        'physicalHealth',
      ] as const) {
        context.collection.unavailableSections.push({
          section,
          schemaName: dropped.schemaName,
          tableName: dropped.tableName,
          reason: 'Dropped to keep the result within maxPayloadBytes.',
        });
      }
    }

    if (payloadSize() > maxPayloadBytes && context.executionPlan.vendorPlan !== undefined) {
      truncated = true;
      context.executionPlan.vendorPlan = undefined;
      context.executionPlan.normalizedPlan = undefined;
      // dominantCostPlanNode.planNodeId cross-references normalizedPlan - never leave it dangling with nothing left to resolve it against.
      context.executionPlan.dominantCostPlanNode = undefined;
      context.collection.unavailableSections.push({
        section: 'executionPlan',
        reason: 'The raw and normalized plan were omitted to keep the result within maxPayloadBytes.',
      });
    }

    if (payloadSize() > maxPayloadBytes) {
      context.collection.diagnostics.push({
        code: 'COLLECTION_TRUNCATED',
        severity: 'warning',
        affectsCompleteness: true,
        scope: 'collection',
        message: `Result still exceeds maxPayloadBytes (${maxPayloadBytes} bytes) after truncation.`,
      });
    } else if (truncated) {
      context.collection.diagnostics.push({
        code: 'COLLECTION_TRUNCATED',
        severity: 'warning',
        affectsCompleteness: true,
        scope: 'collection',
        message: 'Result was truncated to satisfy maxPayloadBytes.',
      });
    }
    if (truncated) {
      context.collection.status = 'partial';
    }
    return payloadSize() > maxPayloadBytes;
  }

  async getPerformanceTuningContext(
    params: PerformanceTuningContextParams,
    options?: PerformanceTuningCallOptions,
  ): Promise<GeneralResult<PerformanceTuningContext>> {
    try {
      this.assertSessionStateAvailable('collect a performance tuning context');
    } catch {
      return {
        ok: false,
        message: 'An actual-plan capture is still restoring its session state. Retry shortly.',
      };
    }
    const provider = this.getPerformanceTuningContextProvider();
    if (!provider) {
      return {
        ok: false,
        message: 'Performance tuning context is not supported for this database.',
      };
    }

    const errors = validatePerformanceTuningContextParams(params);
    if (errors.length > 0) {
      return { ok: false, message: errors.join(' ') };
    }

    if (options?.signal?.aborted) {
      return { ok: false, message: 'Performance tuning context collection was cancelled.' };
    }

    const normalized = normalizePerformanceTuningContextParams(params);

    try {
      const planResult = await this.withDeadline(
        () =>
          provider.collectExecutionPlan(params, {
            signal: options?.signal,
            timeoutMs: normalized.plan.timeoutMs,
          }),
        { signal: options?.signal, timeoutMs: normalized.plan.timeoutMs },
        'collectExecutionPlan',
      );
      if (!planResult.ok) {
        // A plan is required to resolve tables; without one, no context is usable.
        return { ok: false, message: planResult.message || 'Failed to retrieve the execution plan.' };
      }
      const vendorPlan = planResult.result;

      const rawPlanTableMappings = vendorPlan?.planTableMappings ?? [];
      const tableAliasMap = normalized.tableAliasMap ?? {};
      const planTableMappings = rawPlanTableMappings.map((mapping) => {
        const hit = tableAliasMap[mapping.tableName.toLowerCase()];
        // 2026-08-20 fix: only apply a hit that's a genuine alias->real-name substitution (MySQL's EXPLAIN gap: mapping.tableName really is the alias text there, e.g. "o", so a hit's tableName is always a *different* string).
        if (!hit || hit.tableName.toLowerCase() === mapping.tableName.toLowerCase()) {
          return mapping;
        }
        return { ...mapping, schemaName: hit.schemaName, tableName: hit.tableName };
      });

      // Deduplicate resolved tables (a table can appear in more than one plan node, e.g. self-joins or one table with several index scans).
      const tableKeyOf = (t: { schemaName?: string; tableName: string }): string =>
        `${t.schemaName ?? ''}.${t.tableName}`;
      const resolvedTables = new Map<string, { schemaName?: string; tableName: string }>();
      for (const mapping of planTableMappings) {
        const key = tableKeyOf(mapping);
        if (!resolvedTables.has(key)) {
          resolvedTables.set(key, { schemaName: mapping.schemaName, tableName: mapping.tableName });
        }
      }
      const isSameTable = (
        a: { schemaName?: string; tableName: string },
        b: { schemaName?: string; tableName: string },
      ): boolean => {
        if (a.tableName.toLowerCase() !== b.tableName.toLowerCase()) {
          return false;
        }
        return a.schemaName && b.schemaName ? a.schemaName.toLowerCase() === b.schemaName.toLowerCase() : true;
      };
      for (const target of normalized.targetTables ?? []) {
        const alreadyResolved = [...resolvedTables.values()].some((existing) => isSameTable(existing, target));
        if (!alreadyResolved) {
          const key = tableKeyOf(target);
          resolvedTables.set(key, { schemaName: target.schemaName, tableName: target.tableName });
        }
      }

      const unavailableSections: PerformanceTuningContext['collection']['unavailableSections'] = [];
      const diagnostics: PerformanceTuningDiagnostic[] = [...(vendorPlan?.diagnostics ?? [])];

      const allResolvedTables = [...resolvedTables.values()];
      const tablesToCollect = allResolvedTables.slice(0, normalized.limits.maxTables);
      if (allResolvedTables.length > tablesToCollect.length) {
        diagnostics.push({
          code: 'COLLECTION_TRUNCATED',
          severity: 'warning',
          affectsCompleteness: true,
          scope: 'collection',
          message: `Table collection truncated to ${normalized.limits.maxTables} of ${allResolvedTables.length} resolved tables.`,
        });
      }

      const relevantColumnsByTable = new Map<string, Set<string>>();
      for (const mapping of planTableMappings) {
        const key = tableKeyOf(mapping);
        const set = relevantColumnsByTable.get(key) ?? new Set<string>();
        for (const col of [
          ...(mapping.filterColumns ?? []),
          ...(mapping.joinColumns ?? []),
          ...(mapping.groupColumns ?? []),
          ...(mapping.sortColumns ?? []),
        ]) {
          set.add(col);
        }
        relevantColumnsByTable.set(key, set);
      }

      const collectionOptions = {
        signal: options?.signal,
        limits: normalized.limits,
        timeoutMs: normalized.plan.timeoutMs,
      };
      const deadline = { signal: options?.signal, timeoutMs: normalized.plan.timeoutMs };

      const tables: PerformanceTuningContext['tables'] = await Promise.all(
        tablesToCollect.map(async ({ schemaName, tableName }) => {
          const tableTarget = { databaseName: normalized.databaseName, schemaName, tableName };
          const columnNames = [...(relevantColumnsByTable.get(tableKeyOf(tableTarget)) ?? [])];

          // Pushes into the same shared `diagnostics` array every table's callback writes into (safe: Promise.all here means concurrent async callbacks interleaved on one JS thread, not true parallelism - the same pattern `unavailableSections.push()` below already relies on).
          const pushTableDiagnostic = (
            code: 'SECTION_COLLECTION_FAILED' | 'COLLECTION_TRUNCATED',
            section: 'tableDefinition' | 'tableStatistics' | 'columnStatistics' | 'physicalHealth',
            message: string,
          ): void => {
            diagnostics.push({
              code,
              severity: 'warning',
              affectsCompleteness: true,
              scope: section,
              message,
              schemaName,
              tableName,
              section,
            });
          };

          const [definitionResult, statisticsResult, columnStatsResult, physicalHealthResult] =
            await Promise.all([
              this.withDeadline<VendorTableDefinition>(
                () => provider.collectTableDefinition(tableTarget, collectionOptions),
                deadline,
                'collectTableDefinition',
              ),
              this.withDeadline<VendorTableStatistics>(
                () => provider.collectTableStatistics(tableTarget, collectionOptions),
                deadline,
                'collectTableStatistics',
              ),
              this.withDeadline<VendorColumnStatistics[]>(
                () => provider.collectColumnStatistics({ ...tableTarget, columnNames }, collectionOptions),
                deadline,
                'collectColumnStatistics',
              ),
              this.withDeadline<VendorPhysicalHealth>(
                () => provider.collectPhysicalHealth(tableTarget, collectionOptions),
                deadline,
                'collectPhysicalHealth',
              ),
            ]);

          const unavailable = (
            section: 'tableDefinition' | 'tableStatistics' | 'columnStatistics' | 'physicalHealth',
            reason: string,
          ): void => {
            unavailableSections.push({ section, schemaName, tableName, reason });
          };

          let definition: PerformanceTuningContext['tables'][number]['definition'];
          if (definitionResult.ok && definitionResult.result) {
            definition = definitionResult.result;
            if (definitionResult.message) {
              pushTableDiagnostic('SECTION_COLLECTION_FAILED', 'tableDefinition', definitionResult.message);
            }
            const { columns, indexes } = definition;
            if (columns.length > normalized.limits.maxColumnsPerTable) {
              definition.columns = columns.slice(0, normalized.limits.maxColumnsPerTable);
              pushTableDiagnostic(
                'COLLECTION_TRUNCATED',
                'tableDefinition',
                `Columns truncated to ${normalized.limits.maxColumnsPerTable} of ${columns.length}.`,
              );
            }
            if (indexes.length > normalized.limits.maxIndexesPerTable) {
              definition.indexes = indexes.slice(0, normalized.limits.maxIndexesPerTable);
              pushTableDiagnostic(
                'COLLECTION_TRUNCATED',
                'tableDefinition',
                `Indexes truncated to ${normalized.limits.maxIndexesPerTable} of ${indexes.length}.`,
              );
            }
          } else {
            unavailable('tableDefinition', definitionResult.message || 'Table definition unavailable.');
          }

          let statistics: PerformanceTuningContext['tables'][number]['statistics'];
          if (statisticsResult.ok && statisticsResult.result) {
            statistics = { ...statisticsResult.result, columns: [] };
            if (statisticsResult.message) {
              pushTableDiagnostic('SECTION_COLLECTION_FAILED', 'tableStatistics', statisticsResult.message);
            }
          } else {
            unavailable('tableStatistics', statisticsResult.message || 'Table statistics unavailable.');
          }
          if (columnStatsResult.ok) {
            // collectColumnStatistics() and collectTableStatistics() are independent Provider calls - column stats can succeed even when table-level statistics failed.
            statistics ??= { columns: [] };
            statistics.columns = columnStatsResult.result ?? [];
            if (columnStatsResult.message) {
              pushTableDiagnostic('SECTION_COLLECTION_FAILED', 'columnStatistics', columnStatsResult.message);
            }
          } else {
            unavailable('columnStatistics', columnStatsResult.message || 'Column statistics unavailable.');
          }

          let physicalHealth: PerformanceTuningContext['tables'][number]['physicalHealth'];
          if (physicalHealthResult.ok && physicalHealthResult.result) {
            physicalHealth = { provider: this.conRes.dbType, metrics: physicalHealthResult.result.metrics };
            if (physicalHealthResult.message) {
              pushTableDiagnostic('SECTION_COLLECTION_FAILED', 'physicalHealth', physicalHealthResult.message);
            }
          } else {
            unavailable('physicalHealth', physicalHealthResult.message || 'Physical health unavailable.');
          }

          return { schemaName, tableName, definition, statistics, physicalHealth };
        }),
      );

      // The two selectivity measures are computed only after both plan mappings and table statistics are available.
      const tableStatsByKey = new Map<string, TableStatisticsContext['estimatedRowCount']>();
      for (const t of tables) {
        tableStatsByKey.set(tableKeyOf(t), t.statistics?.estimatedRowCount);
      }
      const planTableMappingsWithSelectivity = planTableMappings.map((mapping) => ({
        ...mapping,
        tableAccessFraction: computeTableAccessFraction(
          mapping.tableAccessRows,
          tableStatsByKey.get(tableKeyOf(mapping)),
        ),
        predicateFilterSelectivity: computePredicateFilterSelectivity(
          mapping.predicateFilterInputRows,
          mapping.predicateFilterOutputRows,
        ),
      }));

      // A material measured-vs-estimated row difference is useful evidence for a statistics/cardinality remedy, distinct from an index/access path recommendation.
      for (const mapping of planTableMappingsWithSelectivity) {
        const ratio = mapping.rowEstimateRatio;
        if (
          mapping.estimatedRows === undefined ||
          mapping.actualRows === undefined ||
          ratio === undefined ||
          (ratio < 10 && ratio > 0.1)
        ) {
          continue;
        }
        const candidatePredicateColumns = [
          ...(mapping.filterColumns ?? []),
          ...(mapping.joinColumns ?? []),
        ];
        diagnostics.push({
          code: 'CARDINALITY_MISESTIMATE',
          severity: 'info',
          affectsCompleteness: false,
          scope: 'executionPlan',
          message: `Actual rows (${mapping.actualRows}) differ materially from estimated rows (${mapping.estimatedRows}) for ${mapping.tableName}.`,
          schemaName: mapping.schemaName,
          tableName: mapping.tableName,
          cardinality: {
            estimatedRows: mapping.estimatedRows,
            actualRows: mapping.actualRows,
            actualToEstimatedRatio: ratio,
            candidatePredicateColumns: [...new Set(candidatePredicateColumns)],
          },
        });
      }

      // Best-effort, non-fatal: a version-fetch failure should not turn an otherwise-usable plan+table-resolution result into a hard error.
      let version: string | undefined;
      try {
        version = await this.getVersion();
      } catch {
        diagnostics.push({
          code: 'DATABASE_VERSION_UNAVAILABLE',
          severity: 'warning',
          affectsCompleteness: true,
          scope: 'collection',
          message: 'Failed to retrieve the database version.',
        });
      }

      const context: PerformanceTuningContext = {
        formatVersion: 1,
        database: {
          vendor: this.conRes.dbType,
          version,
          databaseName: normalized.databaseName,
          schemaName: normalized.schemaName,
          environment: this.conRes.environment,
        },
        statement: {
          sql: normalized.statement.sql,
          source: normalized.statement.source,
          ...classifyPerformanceTuningStatement(normalized.statement.sql),
          bindMetadata: normalized.plan.bindMetadata,
        },
        workload: normalized.statement.statistics,
        executionPlan: {
          mode: normalized.plan.mode,
          format: 'json',
          vendorPlan: vendorPlan?.raw,
          normalizedPlan: vendorPlan?.normalizedPlan,
          planningTimeMs: vendorPlan?.planningTimeMs,
          executionTimeMs: vendorPlan?.executionTimeMs,
          actualPlan: vendorPlan?.actualPlan,
          runtimeObservations: vendorPlan?.runtimeObservations,
          // Prefer a provider's measured result over the generic plan-based fallback.
          dominantCostPlanNode: vendorPlan?.dominantCostPlanNode ?? findDominantCostPlanNode(vendorPlan?.normalizedPlan),
        },
        tables,
        planTableMappings: planTableMappingsWithSelectivity,
        collection: {
          collectedAt: new Date().toISOString(),
          status:
            unavailableSections.length > 0 || diagnostics.some((d) => d.affectsCompleteness)
              ? 'partial'
              : 'complete',
          diagnostics,
          unavailableSections,
        },
      };

      const stillOverBudget = this.enforcePayloadBudget(context, normalized.limits.maxPayloadBytes);
      if (stillOverBudget) {
        // Every table and the execution plan are already gone at this point (enforcePayloadBudget()'s own last resort) - a caller relying on maxPayloadBytes as a safety ceiling must see a hard failure here, not a "success" carrying an oversized payload it asked this driver not to produce.
        return {
          ok: false,
          message: `Result exceeds maxPayloadBytes (${normalized.limits.maxPayloadBytes} bytes) even after dropping every table and the execution plan.`,
        };
      }

      return { ok: true, message: '', result: context };
    } catch (e) {
      return this.toPerformanceTuningContextErrorResult(e, 'getPerformanceTuningContext');
    }
  }

  async explainAnalyzeSql(params: QueryParams): Promise<ResultSetData> {
    this.assertSessionStateAvailable('run explain analyze');
    const { sql, prepare } = params;
    // Keep this public API subject to the same fail-closed predicate as the Performance Tuning context.
    if (!isSingleSelectStatement(sql)) {
      throw new Error('Explain analyze is limited to a single SELECT statement');
    }
    const ast = parseQuery(sql);
    const dbTable = this.getDbTable(ast);

    if (prepare && prepare.useDatabaseName) {
      await this.useDatabase(prepare.useDatabaseName);
    }
    const rdb = await this.explainAnalyzeSqlSub({
      ...params,
      dbTable,
    });
    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      useDatabase: prepare?.useDatabaseName,
      params,
      rdb,
      type: 'analyze' as any,
      qst: ast,
      dbTable,
      tableComment: dbTable?.comment,
    });
    rdb.rs.meta.compareKeys = undefined; // update

    return rdb.build();
  }

  abstract explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  private getDbTable(qst?: QStatement): DbTable | undefined {
    const db = this.getRdsDatabase();
    if (qst === undefined || qst.names === undefined || db === undefined) {
      return undefined;
    }

    if (qst.names.schemaName) {
      const schema = db.children.find((it) =>
        equalsIgnoreCase(it.name, qst.names.schemaName),
      );
      if (schema) {
        return schema.children.find((it) =>
          equalsIgnoreCase(it.name, qst.names.tableName),
        );
      }
    }

    for (const schema of db.children) {
      const table = schema.children.find((it) =>
        equalsIgnoreCase(it.name, qst.names.tableName),
      );
      if (table) {
        return table;
      }
    }

    return undefined;
  }

  protected filterSchemas(schemas: DbSchema[]): DbSchema[] {
    const { resourceFilter } = this.conRes;
    if (!resourceFilter?.schema) {
      return schemas;
    }
    return schemas.filter((it) =>
      acceptResourceFilter(it.name, resourceFilter.schema),
    );
  }

  protected filterTables(tables: DbTable[]): DbTable[] {
    const { resourceFilter } = this.conRes;
    if (!resourceFilter?.table) {
      return tables;
    }
    return tables.filter((it) =>
      acceptResourceFilter(it.name, resourceFilter.table),
    );
  }

  resetDefaultSchema(database: RdsDatabase, hint = ''): void {
    const searchNames = [];
    if (hint) {
      searchNames.push(hint);
    }
    if (this.conRes.database) {
      searchNames.push(this.conRes.database);
    }
    if (this.conRes.user) {
      searchNames.push(this.conRes.user);
    }
    searchNames.push('public');

    for (const searchName of searchNames) {
      const idx = database.children.findIndex((it) => it.name == searchName);
      if (idx >= 0) {
        database.children[idx].isDefault = true;
        const [defaultSchema] = database.children.splice(idx, 1);
        database.children.unshift(defaultSchema);
        return;
      }
    }

    if (database.children.length) {
      database.children[0].isDefault = true;
    }
  }

  supportsShowCreate(): boolean {
    return false;
  }

  quoteIdentifier(identifier: string): string {
    return needsQuoting(identifier)
      ? wrapQuote(identifier, this.getIdQuoteCharacter())
      : identifier;
  }

  /** When `supportsShowCreate()` is true and `schemaName` is given, the returned DDL must be schema-qualified (e.g. `CREATE TABLE schema.table`). */
  getTableDDL({
    tableName: _tableName,
    schemaName: _schemaName,
  }: {
    tableName: string;
    schemaName?: string;
  }): Promise<string> {
    throw new Error('Does not support Show Create statement.');
  }

  abstract begin(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
  abstract setAutoCommit(value: boolean): Promise<void>;
  abstract connectWithTest(): Promise<string>;
  abstract getVersion(): Promise<string>;
  abstract getTransactionIsolationLevel(): Promise<TransactionIsolationLevel>;
  async getMajorVersion(): Promise<number> {
    const version = await this.getVersion();
    return toNum(version.replace(/^([0-9]+)\..*$/, '$1'));
  }

  async connectSub(autoCommit = true): Promise<string> {
    let errorMessage = await this.connectWithTest();

    try {
      if (!errorMessage) {
        await this.setAutoCommit(autoCommit);
      }
    } catch (e) {
      errorMessage = e.message;
    }
    return errorMessage;
  }

  async flowTransaction<T = any>(
    f: (driver: this) => Promise<T>,
    options?: {
      transactionControlType: TransactionControlType;
    },
  ): Promise<GeneralResult<T>> {
    let ok = true;
    let message = '';
    let result: T;
    let transactionControlType = 'rollbackOnError';
    if (options) {
      transactionControlType = options.transactionControlType;
    }

    if (this.isConnected) {
      await this.disconnect();
    }

    message = await this.connect();
    if (message) {
      return {
        ok: false,
        message,
      };
    }

    try {
      await this.begin();
      result = await f(this);

      if (
        transactionControlType === 'alwaysCommit' ||
        transactionControlType === 'rollbackOnError'
      ) {
        await this.commit();
      } else if (transactionControlType === 'alwaysRollback') {
        await this.rollback();
      }
    } catch (e) {
      ok = false;
      message = e.message;
      if (transactionControlType === 'alwaysCommit') {
        await this.commit();
      } else if (
        transactionControlType === 'alwaysRollback' ||
        transactionControlType === 'rollbackOnError'
      ) {
        await this.rollback();
      }
    } finally {
      await this.disconnect();
    }
    return {
      ok,
      message,
      result,
    };
  }
}
