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
  QStatement,
  QueryParams,
  SQLLang,
  StatementStatisticsParams,
  TransactionControlType,
  TransactionIsolationLevel,
  ViewRecordsParams,
} from '../types';
import {
  acceptResourceFilter,
  normalizePerformanceTuningContextParams,
  setRdhMetaAndStatement,
  validatePerformanceTuningContextParams,
} from '../utils';
import { BaseSQLSupportDriver } from './BaseSQLSupportDriver';
import {
  PerformanceTuningContextProvider,
  VendorColumnStatistics,
  VendorPhysicalHealth,
  VendorTableDefinition,
  VendorTableStatistics,
} from './providers';

export abstract class RDSBaseDriver extends BaseSQLSupportDriver<RdsDatabase> {
  constructor(conRes: ConnectionSetting) {
    super(conRes);
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

  // Vendor Drivers that implement performance tuning context collection
  // override this hook to return their PerformanceTuningContextProvider.
  // Leaving it undefined (the default for every RDS driver until its Phase
  // lands) makes supports/check/get below report "not supported" for free,
  // so adding a vendor here never requires touching every other driver.
  // See misc/design/performance-tuning-context-implementation-plan.ja.md §6.
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

    // Expected setup/permission gaps must come back as GeneralResult
    // (§4.3), but a Provider is arbitrary vendor code and can still throw
    // (a bug, a connection drop mid-probe, ...). Catch here at the public
    // API boundary rather than letting it reject past this method.
    try {
      return await provider.checkCapabilities(params, options);
    } catch (e) {
      return this.toPerformanceTuningContextErrorResult(e, 'checkCapabilities');
    }
  }

  // Converts an unexpected Provider exception into a GeneralResult instead
  // of letting it reject across the public API boundary (§4.3: "予期しない
  // 例外も公開メソッド境界で GeneralResult へ変換し、秘密情報を含む接続エラー
  // 全文は返さない"). Unlike e.g. PostgresDriver.checkStatementStatisticsAvailability()
  // (which appends `e.message` to its GeneralResult), the public message here
  // is a fixed string - a DB driver exception can carry SQL text, a
  // connection string, or a bind value, and this API's whole purpose is to
  // hand data to an external AI, not just render it in a local UI. The
  // detail goes to the local console only.
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

  // Wraps a single Provider call so it can never reject or throw past this
  // point - covers both an async Provider method's rejected promise *and*
  // a non-async/misbehaving one that throws synchronously the moment it's
  // called (a bare `.catch()` on the call site only catches the former;
  // the synchronous case throws before `.catch()` is ever attached). Used
  // per section/table (§6.3) rather than relying on the outer try/catch,
  // which would otherwise discard every other section/table's already-collected
  // result over one Provider bug.
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

  // Bounds a single Provider call by both a timeout and a cancellation
  // signal (§6.3: "timeout と cancel signal を全収集処理へ伝搬する"), on top
  // of safeCollect()'s throw/rejection safety. This races the call against a
  // timer and an `abort` listener: whichever settles first wins. A Provider
  // is not required to implement real server-side query cancellation for
  // this to work - the caller of getPerformanceTuningContext() always gets a
  // bounded, cancellable result regardless, even though the underlying
  // vendor query may keep running server-side in the background until it
  // finishes or the connection itself is torn down. A Provider that *can*
  // cancel its own in-flight query (future work, vendor-specific) should use
  // options.signal/timeoutMs itself for that; this wrapper's guarantee is
  // about the caller-facing contract, not about stopping DB-side work.
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

  // Truncates an already-assembled context to fit `maxPayloadBytes` (§4.1:
  // "上限値は Driver 側の安全な最大値で clamp し、切り詰めた場合は warning を
  // 返す"; §6.3: "table 数、列数、index 数、payload bytes に上限を設ける").
  // table/column/index counts are already clamped per-table before this
  // runs; this is the final backstop for whatever still doesn't fit (a
  // large DDL, a very deep plan, ...). Drops whole tables from the end
  // first - each drop is recorded as an unavailableSections entry, never
  // silently discarded - and only as a last resort (every table already
  // dropped and still over budget) omits the raw/normalized plan, since
  // that is usually the single largest remaining blob. Mutates `context` in
  // place; returns nothing.
  private enforcePayloadBudget(
    context: PerformanceTuningContext,
    maxPayloadBytes: number,
  ): void {
    const payloadSize = (): number => Buffer.byteLength(JSON.stringify(context), 'utf8');

    if (payloadSize() <= maxPayloadBytes) {
      return;
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
      context.collection.unavailableSections.push({
        section: 'executionPlan',
        reason: 'The raw and normalized plan were omitted to keep the result within maxPayloadBytes.',
      });
    }

    if (payloadSize() > maxPayloadBytes) {
      context.collection.warnings.push(
        `Result still exceeds maxPayloadBytes (${maxPayloadBytes} bytes) after truncation.`,
      );
    } else if (truncated) {
      context.collection.warnings.push('Result was truncated to satisfy maxPayloadBytes.');
    }
    if (truncated) {
      context.collection.status = 'partial';
    }
  }

  // Orchestration (validate -> capability -> plan -> target resolution ->
  // table sections -> normalize -> validate schema, per §6.1).
  async getPerformanceTuningContext(
    params: PerformanceTuningContextParams,
    options?: PerformanceTuningCallOptions,
  ): Promise<GeneralResult<PerformanceTuningContext>> {
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
        // Plan retrieval is the one section this Phase 1 slice cannot do
        // without: with no plan, there is nothing to resolve tables from,
        // so unlike a missing DDL/statistics section this is not "partial",
        // it's "no usable context at all".
        return { ok: false, message: planResult.message || 'Failed to retrieve the execution plan.' };
      }
      const vendorPlan = planResult.result;
      const planTableMappings = vendorPlan?.planTableMappings ?? [];

      // Deduplicate resolved tables (a table can appear in more than one
      // plan node, e.g. self-joins or one table with several index scans).
      const tableKeyOf = (t: { schemaName?: string; tableName: string }): string =>
        `${t.schemaName ?? ''}.${t.tableName}`;
      const resolvedTables = new Map<string, { schemaName?: string; tableName: string }>();
      for (const mapping of planTableMappings) {
        const key = tableKeyOf(mapping);
        if (!resolvedTables.has(key)) {
          resolvedTables.set(key, { schemaName: mapping.schemaName, tableName: mapping.tableName });
        }
      }
      // Union in any explicit caller-supplied targets (§4.1: "targetTables
      // は plan / parser から対象を完全に解決できない場合の明示的な補助入力
      // とする") - additive, never a replacement for what the plan itself
      // resolved. This is the sanctioned workaround for a real, vendor-
      // specific gap: MySQL's EXPLAIN FORMAT=JSON reports an aliased
      // table's *alias* as `table_name`, with no field carrying the real
      // table name, so an aliased FROM/JOIN table cannot always be resolved
      // from the plan alone (see mysqlPlanParser.ts's module doc comment).
      for (const target of normalized.targetTables ?? []) {
        const key = tableKeyOf(target);
        if (!resolvedTables.has(key)) {
          resolvedTables.set(key, { schemaName: target.schemaName, tableName: target.tableName });
        }
      }

      const unavailableSections: PerformanceTuningContext['collection']['unavailableSections'] = [];
      const collectionWarnings: string[] = [...(vendorPlan?.warnings ?? [])];

      // Clamp to the safe maximum (§4.1: "上限値は Driver 側の安全な最大値で
      // clamp し、切り詰めた場合は warning を返す") - a plan touching more
      // tables than that still resolves them all for planTableMappings
      // above, but only the first maxTables get DDL/statistics/physical
      // health collected.
      const allResolvedTables = [...resolvedTables.values()];
      const tablesToCollect = allResolvedTables.slice(0, normalized.limits.maxTables);
      if (allResolvedTables.length > tablesToCollect.length) {
        collectionWarnings.push(
          `Table collection truncated to ${normalized.limits.maxTables} of ${allResolvedTables.length} resolved tables.`,
        );
      }

      // Columns to fetch statistics for: whatever the plan actually showed
      // interest in (predicate/join/group/sort columns), not every column
      // in the table (§5.4: "列統計は plan predicate、join、group、sort に
      // 登場する列を優先する").
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
          const tableWarnings: string[] = [];

          // Each call is bounded and caught individually (not just the outer
          // try/catch) so a Provider bug, timeout, or mid-flight cancellation
          // on one section/table can never discard every other section/
          // table's already-collected result (§6.3: "1 table の失敗で他
          // table の結果を破棄しない"; "timeout と cancel signal を全収集処理
          // へ伝搬する").
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
              tableWarnings.push(definitionResult.message);
            }
            const { columns, indexes } = definition;
            if (columns.length > normalized.limits.maxColumnsPerTable) {
              definition.columns = columns.slice(0, normalized.limits.maxColumnsPerTable);
              tableWarnings.push(
                `Columns truncated to ${normalized.limits.maxColumnsPerTable} of ${columns.length}.`,
              );
            }
            if (indexes.length > normalized.limits.maxIndexesPerTable) {
              definition.indexes = indexes.slice(0, normalized.limits.maxIndexesPerTable);
              tableWarnings.push(
                `Indexes truncated to ${normalized.limits.maxIndexesPerTable} of ${indexes.length}.`,
              );
            }
          } else {
            unavailable('tableDefinition', definitionResult.message || 'Table definition unavailable.');
          }

          let statistics: PerformanceTuningContext['tables'][number]['statistics'];
          if (statisticsResult.ok && statisticsResult.result) {
            statistics = { ...statisticsResult.result, columns: [] };
          } else {
            unavailable('tableStatistics', statisticsResult.message || 'Table statistics unavailable.');
          }
          if (statistics) {
            if (columnStatsResult.ok) {
              statistics.columns = columnStatsResult.result ?? [];
            } else {
              unavailable(
                'columnStatistics',
                columnStatsResult.message || 'Column statistics unavailable.',
              );
            }
          } else if (!columnStatsResult.ok) {
            unavailable('columnStatistics', columnStatsResult.message || 'Column statistics unavailable.');
          }

          let physicalHealth: PerformanceTuningContext['tables'][number]['physicalHealth'];
          if (physicalHealthResult.ok && physicalHealthResult.result) {
            physicalHealth = { provider: this.conRes.dbType, metrics: physicalHealthResult.result.metrics };
          } else {
            unavailable('physicalHealth', physicalHealthResult.message || 'Physical health unavailable.');
          }

          return { schemaName, tableName, definition, statistics, physicalHealth, warnings: tableWarnings };
        }),
      );

      // Best-effort, non-fatal: a version-fetch failure should not turn an
      // otherwise-usable plan+table-resolution result into a hard error.
      let version: string | undefined;
      try {
        version = await this.getVersion();
      } catch {
        collectionWarnings.push('Failed to retrieve the database version.');
      }

      const context: PerformanceTuningContext = {
        formatVersion: 1,
        database: {
          vendor: this.conRes.dbType,
          version,
          databaseName: normalized.databaseName,
          schemaName: normalized.schemaName,
          // §3 "含めるもの": Environment. Read straight from the connection
          // setting the caller already configured (dev/staging/production,
          // ...) rather than re-deriving it - `undefined` when the caller
          // never set one, never guessed.
          environment: this.conRes.environment,
        },
        statement: {
          sql: normalized.statement.sql,
          source: normalized.statement.source,
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
          warnings: vendorPlan?.warnings ?? [],
        },
        tables,
        planTableMappings,
        collection: {
          collectedAt: new Date().toISOString(),
          status:
            unavailableSections.length > 0 || collectionWarnings.length > 0 ? 'partial' : 'complete',
          warnings: collectionWarnings,
          unavailableSections,
        },
      };

      this.enforcePayloadBudget(context, normalized.limits.maxPayloadBytes);

      return { ok: true, message: '', result: context };
    } catch (e) {
      return this.toPerformanceTuningContextErrorResult(e, 'getPerformanceTuningContext');
    }
  }

  async explainAnalyzeSql(params: QueryParams): Promise<ResultSetData> {
    const { sql, prepare } = params;
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

  /**
   * When `supportsShowCreate()` is true and `schemaName` is given, the
   * returned DDL must be schema-qualified (e.g. `CREATE TABLE schema.table`).
   * Engines whose native DDL output is never schema-qualified (e.g. MySQL's
   * `SHOW CREATE TABLE`) must qualify it themselves before returning.
   */
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
