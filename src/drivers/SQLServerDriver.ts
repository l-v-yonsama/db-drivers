import {
  createRdhKey,
  GeneralColumnType,
  parseColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
  toNum,
} from '@l-v-yonsama/rdh';
import { EnumValues } from 'enum-values';
import {
  config,
  connect,
  ConnectionPool,
  Request,
  Transaction,
  ISOLATION_LEVEL,
} from 'mssql';

import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import {
  ConnectionSetting,
  ActualPlanArtifact,
  GeneralResult,
  LimitClauseStyle,
  QueryParams,
  ResultColumn,
  SQLServerAuthenticationType,
  SQLServerColumnType,
  StatementStatisticsParams,
  TransactionIsolationLevel,
} from '../types';
import { RDSBaseDriver } from './RDSBaseDriver';
import {
  PerformanceTuningContextProvider,
  RdbDashboardProvider,
  SQLServerPerformanceTuningProvider,
  SQLServerRdbDashboardProvider,
} from './providers';
import { QuoteChar } from '../helpers';
import {
  getStatementStatisticsOrderByColumn,
  isSingleSelectStatement,
  normalizeStatementStatisticsParams,
} from '../utils';

const EXPLAIN_COLUMNS: RdhKey[] = [
  createRdhKey({
    name: 'StmtText',
    type: GeneralColumnType.TEXT,
    align: 'left',
    width: 300,
  }),
  createRdhKey({ name: 'PhysicalOp', type: GeneralColumnType.TEXT, width: 20 }),
  createRdhKey({
    name: 'LogicalOp',
    type: GeneralColumnType.TEXT,
    width: 20,
  }),
  createRdhKey({
    name: 'Argument',
    type: GeneralColumnType.TEXT,
    width: 20,
  }),
  createRdhKey({
    name: 'DefinedValues',
    type: GeneralColumnType.TEXT,
    width: 20,
  }),
  createRdhKey({
    name: 'EstimateRows',
    type: GeneralColumnType.INTEGER,
    width: 40,
  }),
  createRdhKey({
    name: 'EstimateIO',
    type: GeneralColumnType.REAL,
    width: 40,
  }),
  createRdhKey({
    name: 'EstimateCPU',
    type: GeneralColumnType.REAL,
    width: 40,
  }),
  createRdhKey({
    name: 'AvgRowSize',
    type: GeneralColumnType.INTEGER,
    width: 40,
  }),
  createRdhKey({
    name: 'TotalSubtreeCost',
    type: GeneralColumnType.REAL,
    width: 40,
  }),
  createRdhKey({
    name: 'OutputList',
    type: GeneralColumnType.UNKNOWN,
    width: 20,
  }),
  createRdhKey({
    name: 'Warnings',
    type: GeneralColumnType.TEXT,
    width: 40,
  }),
  createRdhKey({
    name: 'Type',
    type: GeneralColumnType.TEXT,
    width: 40,
  }),
  createRdhKey({
    name: 'Parallel',
    type: GeneralColumnType.BOOLEAN,
    width: 40,
  }),
  createRdhKey({
    name: 'EstimateExecutions',
    type: GeneralColumnType.INTEGER,
    width: 40,
  }),
];

export class SQLServerDriver extends RDSBaseDriver {
  private con: ConnectionPool | undefined;
  private req: Request | undefined;
  private tran: Transaction | undefined;
  private rdbDashboardProvider?: RdbDashboardProvider;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  protected getRdbDashboardProvider(): RdbDashboardProvider {
    if (!this.rdbDashboardProvider) {
      this.rdbDashboardProvider = new SQLServerRdbDashboardProvider(this);
    }
    return this.rdbDashboardProvider;
  }

  async begin(): Promise<void> {
    this.assertSessionStateAvailable('begin a transaction');
    this.tran = this.con.transaction();
    const { transactionIsolationLevel } = this.conRes;
    if (transactionIsolationLevel) {
      switch (transactionIsolationLevel) {
        case 'READ UNCOMMITTED':
          await this.tran.begin(ISOLATION_LEVEL.READ_UNCOMMITTED);
          break;
        case 'READ COMMITTED':
          await this.tran.begin(ISOLATION_LEVEL.READ_COMMITTED);
          break;
        case 'REPEATABLE READ':
          await this.tran.begin(ISOLATION_LEVEL.REPEATABLE_READ);
          break;
        case 'SERIALIZABLE':
          await this.tran.begin(ISOLATION_LEVEL.SERIALIZABLE);
          break;
        default:
          await this.tran.begin();
          break;
      }
    } else {
      await this.tran.begin();
    }
    if (this.conRes.lockWaitTimeoutMs) {
      await this.setLockWaitTimeout(this.conRes.lockWaitTimeoutMs);
    }
  }

  async commit(): Promise<void> {
    this.assertSessionStateAvailable('commit a transaction');
    try {
      if (this.tran) {
        await this.tran?.commit();
      }
    } finally {
      this.tran = undefined;
    }
  }

  async rollback(): Promise<void> {
    this.assertSessionStateAvailable('roll back a transaction');
    try {
      if (this.tran) {
        await this.tran?.rollback();
      }
    } finally {
      this.tran = undefined;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setAutoCommit(value: boolean): Promise<void> {
    // do nothing.
  }

  async getLockWaitTimeout(): Promise<number> {
    const sql = `SELECT @@LOCK_TIMEOUT AS lock_timeout`;
    const rdb = await this.requestSqlSub({ sql, dbTable: undefined });
    return toNum(rdb.rs.rows[0].values.lock_timeout);
  }

  private async setLockWaitTimeout(ms: number): Promise<void> {
    const req = this.con.request();
    await req.batch(`SET LOCK_TIMEOUT ${ms}`);
  }

  async getTransactionIsolationLevel(): Promise<TransactionIsolationLevel> {
    const sql = `SELECT CASE transaction_isolation_level 
    WHEN 0 THEN 'UNSPECIFIED' 
    WHEN 1 THEN 'READ UNCOMMITTED' 
    WHEN 2 THEN 'READ COMMITTED' 
    WHEN 3 THEN 'REPEATABLE READ' 
    WHEN 4 THEN 'SERIALIZABLE' 
    WHEN 5 THEN 'SNAPSHOT' END AS transaction_isolation 
FROM sys.dm_exec_sessions WHERE session_id = @@SPID`;
    const rdb = await this.requestSqlSub({ sql, dbTable: undefined });
    if (rdb.rs.rows.length && rdb.rs.rows[0].values['transaction_isolation']) {
      const s = rdb.rs.rows[0].values['transaction_isolation'] as string;
      return s.toUpperCase().replace('-', ' ') as TransactionIsolationLevel;
    }
    throw new Error('Missing transaction_isolation');
  }

  async useDatabase(database: string): Promise<void> {
    this.assertSessionStateAvailable('change the database');
    const sql = `USE [${database.replace(/\]/g, ']]')}]`;
    await this.requestSqlSub({ sql, dbTable: undefined });
  }

  fieldInfo2Key(
    fieldInfo: ResultColumn,
    useTableColumnType: boolean,
    table?: DbTable,
  ): RdhKey {
    const mssqlColumnTypename = EnumValues.getNameFromValue(
      SQLServerColumnType,
      SQLServerColumnType.parseByFieldInfo(fieldInfo),
    );

    const tableColumn = table?.children?.find(
      (it) => it.name === fieldInfo.name,
    );

    const key = createRdhKey({
      name: fieldInfo.name,
      type: parseColumnType(mssqlColumnTypename),
      comment: tableColumn?.comment ?? '',
      required: tableColumn?.nullable === false,
    });

    // Correspondence to ENUM type returned as text type
    if (useTableColumnType && tableColumn) {
      key.type = tableColumn.colType;
    }

    return key;
  }

  async connectWithTest(): Promise<string> {
    let errorMessage = '';
    this.con = await this.createConnection();
    try {
      errorMessage = await this.test();
    } catch (e) {
      errorMessage = e.message;
    }
    try {
      // if (this.conRes.timezone) { // e.g. SET TIME ZONE '+00:00'
      if (this.conRes.lockWaitTimeoutMs) {
        await this.setLockWaitTimeout(this.conRes.lockWaitTimeoutMs);
      }
    } catch (e) {
      errorMessage = e.message;
    }
    return errorMessage;
  }

  /**
   * Terminate (kill) a specific session.
   * If sesssionOrPid is not specified, cancel the running request.
   * @param sesssionOrPid
   */
  async kill(sesssionOrPid?: number): Promise<string> {
    let message = '';
    if (sesssionOrPid) {
      if (typeof sesssionOrPid !== 'number') {
        return 'Invalid session id';
      }
      const authenticationType =
        this.conRes.sqlServer?.authenticationType ??
        SQLServerAuthenticationType.default;

      let extraCon: ConnectionPool;

      try {
        if (
          authenticationType === SQLServerAuthenticationType.useConnectString
        ) {
          extraCon = await connect(this.conRes.sqlServer?.connectString ?? '');
        } else {
          const options = this.createConnectOptions();
          extraCon = await connect(options);
        }
        const req = extraCon.request();
        // Incorrect syntax near '@1'.

        await req.query(`KILL ${sesssionOrPid}`);
      } catch (e) {
        message = e.message;
      } finally {
        if (extraCon) {
          await extraCon.close();
        }
      }
    } else {
      try {
        if (!this.con && !this.req) {
          return message;
        }
        if (this.req) {
          this.req.cancel();
        }
      } catch (e) {
        message = e.message;
      } finally {
        this.req = undefined;
      }
      try {
        await this.rollback();
      } catch (e) {
        message = e.message;
      }
    }

    return message;
  }

  protected getTestSqlStatement(): string {
    return "SELECT name as test_result FROM sys.databases WHERE name='master'";
  }

  async requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    this.assertSessionStateAvailable('run a query');
    const { sql, conditions, dbTable, meta } = params;
    let rdb: ResultSetDataBuilder;

    if (!this.con) {
      throw new Error('No connection');
    }
    if (!this.con.connected) {
      throw new Error('Not connected');
    }

    const binds = conditions?.binds ?? [];
    const startTime = new Date().getTime();

    if (this.tran) {
      this.req = this.tran.request();
    } else {
      this.req = this.con.request();
    }

    binds.forEach((bind, idx) => {
      this.req.input(`${idx + 1}`, bind);
    });
    // Return row results as a an array instead of a keyed object. Also adds columns array
    this.req.arrayRowMode = true;
    const result = await this.req.query(sql);
    this.req = undefined;
    const elapsedTimeMilli = new Date().getTime() - startTime;
    const columns: ResultColumn[] | undefined = result['columns']?.[0];

    if (columns === undefined) {
      rdb = new ResultSetDataBuilder([
        createRdhKey({ name: 'affectedRows', type: GeneralColumnType.INTEGER }),
      ]);
      rdb.addRow({
        affectedRows: result.rowsAffected[0],
      });
      rdb.setSummary({
        elapsedTimeMilli,
        affectedRows: result.rowsAffected[0],
      });
    } else {
      rdb = new ResultSetDataBuilder(
        columns.map((f) =>
          this.fieldInfo2Key(f, meta?.editable === true, dbTable),
        ),
      );

      result.recordset.forEach((recordValues: any[]) => {
        const values: any = {};
        columns.forEach((it) => {
          values[it.name] = recordValues[it.index];
        });
        rdb.addRow(values);
      });

      rdb.setSummary({
        elapsedTimeMilli,
        selectedRows: rdb.rs.rows.length,
      });
    }

    return rdb;
  }

  async explainSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    this.assertSessionStateAvailable('retrieve an execution plan');
    const req = this.con.request();
    await req.batch(`SET SHOWPLAN_ALL ON`);

    try {
      // SQL Server rejects "SET SHOWPLAN_ALL ON" together with a parameterized query in the same batch ("SET SHOWPLAN statements must be the only statements in the batch").
      const binds = params.conditions?.binds ?? [];
      const sql = binds.reduce<string>((acc, bind, idx) => {
        const placeholder = new RegExp(`@${idx + 1}(?!\\d)`, 'g');
        return acc.replace(placeholder, this.toSqlServerStringLiteral(bind));
      }, params.sql);

      const result = await req.batch(sql);
      const rdb = new ResultSetDataBuilder(EXPLAIN_COLUMNS);
      result.recordset.forEach((recordValues) => {
        const values: any = {};
        rdb.rs.keys.forEach((it) => {
          values[it.name] = recordValues[it.name];
        });
        rdb.addRow(values);
      });

      return rdb;
    } finally {
      await req.batch(`SET SHOWPLAN_ALL OFF`);
    }
  }

  async explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const actualPlan = await this.collectPerformanceTuningActualPlan(params);
    return this.actualPlanArtifactToResultSet(actualPlan);
  }

  async getVersion(): Promise<string> {
    const sql = `SELECT SERVERPROPERTY('productversion') as version`;
    const rdb = await this.requestSqlSub({ sql, dbTable: undefined });
    return rdb.rs.rows[0].values.version;
  }

  private performanceTuningContextProvider?: PerformanceTuningContextProvider;

  protected getPerformanceTuningContextProvider(): PerformanceTuningContextProvider {
    if (!this.performanceTuningContextProvider) {
      this.performanceTuningContextProvider = new SQLServerPerformanceTuningProvider(this);
    }
    return this.performanceTuningContextProvider;
  }

  private toSqlServerStringLiteral(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }

  private substituteShowplanBinds(sql: string, binds: string[], bindMarkers?: string[]): string {
    const markers =
      bindMarkers && bindMarkers.length === binds.length
        ? bindMarkers
        : binds.map((_, idx) => `@${idx + 1}`);

    return binds.reduce<string>((acc, bind, idx) => {
      const marker = markers[idx];
      const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // `(?<!@)` keeps `@@ROWCOUNT`-style system variables untouched even if one happened to share a name with a bind marker; `(?![\w$#])` stops `@1` from matching inside `@10`/`@name2`.
      const placeholder = new RegExp(`(?<!@)${escapedMarker}(?![\\w$#])`, 'g');
      return acc.replace(placeholder, this.toSqlServerStringLiteral(bind));
    }, sql);
  }

  async collectPerformanceTuningShowplan(
    params: QueryParams,
    bindMarkers?: string[],
  ): Promise<ResultSetData> {
    this.assertSessionStateAvailable('retrieve an execution plan');
    // A pool-backed Request (this.con.request()) does not guarantee its separate batch() calls all run on the same physical connection - node-mssql may hand each call whichever pooled connection happens to be free.
    const tran = new Transaction(this.con);
    await tran.begin();
    try {
      const req = tran.request();
      await req.batch(`SET SHOWPLAN_ALL ON`);
      try {
        // Same bind-substitution technique as explainSqlSub() and for the same reason: "SET SHOWPLAN statements must be the only statements in the batch", which rules out req.query()'s sp_executesql-based parameter binding.
        const binds = params.conditions?.binds ?? [];
        const sql = this.substituteShowplanBinds(params.sql, binds, bindMarkers);

        const result = await req.batch(sql);
        const firstRow = result.recordset[0];
        const keys: RdhKey[] = firstRow
          ? Object.keys(firstRow).map((name) =>
              createRdhKey({
                name,
                type:
                  typeof firstRow[name] === 'number'
                    ? GeneralColumnType.REAL
                    : GeneralColumnType.TEXT,
              }),
            )
          : [];
        const rdb = new ResultSetDataBuilder(keys);
        result.recordset.forEach((row) => rdb.addRow(row));
        return rdb.rs;
      } finally {
        await req.batch(`SET SHOWPLAN_ALL OFF`);
      }
    } finally {
      await tran.commit();
    }
  }

  /** Executes a diagnostic SELECT with STATISTICS XML enabled on a session pinned by a short-lived transaction. */
  async collectPerformanceTuningActualPlan(
    params: QueryParams,
    bindMarkers?: string[],
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<ActualPlanArtifact> {
    if (!this.con) {
      throw new Error('No connection');
    }
    if (!isSingleSelectStatement(params.sql)) {
      throw new Error('SQL Server actual-plan capture is limited to a single SELECT statement');
    }
    if (this.tran) {
      throw new Error('Cannot capture an actual plan while a transaction is active');
    }
    if (options?.signal?.aborted) {
      throw new Error('Actual plan capture was cancelled');
    }

    const releaseSessionState = this.beginExclusiveSessionStateOperation(
      'SQL Server actual-plan capture',
    );
    const tran = new Transaction(this.con);
    let req: Request | undefined;
    let statisticsXmlEnabled = false;
    let begun = false;
    let captureError: unknown;
    let artifact: ActualPlanArtifact | undefined;
    let cleanupError: unknown;
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
    const cancel = (): void => {
      req?.cancel();
    };
    options?.signal?.addEventListener('abort', cancel, { once: true });

    try {
      await tran.begin();
      begun = true;
      req = tran.request();
      this.req = req;
      // RDSBaseDriver.withDeadline() bounds the caller-facing promise, but does not itself interrupt a server-side request on timeout.
      if (options?.timeoutMs && options.timeoutMs > 0) {
        timeoutTimer = setTimeout(cancel, options.timeoutMs);
      }
      await req.batch('SET STATISTICS XML ON');
      statisticsXmlEnabled = true;

      const binds = params.conditions?.binds ?? [];
      const sql = this.substituteShowplanBinds(params.sql, binds, bindMarkers);
      const result = await req.batch(sql);
      const content = this.findStatisticsXml(result.recordsets ?? [result.recordset]);
      artifact = { source: 'SET STATISTICS XML', format: 'xml', content };
    } catch (e) {
      captureError = e;
    } finally {
      options?.signal?.removeEventListener('abort', cancel);
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
      this.req = undefined;
      if (statisticsXmlEnabled && req) {
        try {
          await req.batch('SET STATISTICS XML OFF');
        } catch (e) {
          cleanupError = e;
        }
      }
      if (begun) {
        try {
          // The target is required to be SELECT-only.
          await tran.rollback();
        } catch (e) {
          cleanupError ??= e;
        }
      }
      releaseSessionState();
    }
    if (cleanupError) {
      // A failed OFF means the pooled session might retain STATISTICS XML.
      const disconnectError = await this.disconnect();
      if (disconnectError) {
        throw new Error(`Failed to restore SQL Server actual-plan session state; connection was closed. ${disconnectError}`);
      }
    }
    if (captureError) {
      throw captureError;
    }
    if (cleanupError) {
      throw cleanupError;
    }
    if (!artifact) {
      throw new Error('SQL Server actual-plan capture completed without a showplan');
    }
    return artifact;
  }

  private findStatisticsXml(recordsets: unknown): string {
    const matches: string[] = [];
    const sets = Array.isArray(recordsets) ? recordsets : [];
    for (const recordset of sets) {
      if (!Array.isArray(recordset)) {
        continue;
      }
      for (const row of recordset ?? []) {
        if (!row || typeof row !== 'object') {
          continue;
        }
        for (const value of Object.values(row)) {
          if (typeof value === 'string' && /<ShowPlanXML(?:\s|>)/i.test(value)) {
            matches.push(value);
          }
        }
      }
    }
    if (matches.length !== 1) {
      throw new Error(
        matches.length === 0
          ? 'SQL Server did not return a STATISTICS XML showplan'
          : 'SQL Server returned multiple STATISTICS XML showplans',
      );
    }
    return matches[0];
  }

  private actualPlanArtifactToResultSet(actualPlan: ActualPlanArtifact): ResultSetDataBuilder {
    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'ActualPlanXml', type: GeneralColumnType.TEXT, width: 300 }),
    ]);
    rdb.addRow({ ActualPlanXml: actualPlan.content });
    return rdb;
  }

  supportsGetStatementStatistics(): boolean {
    return true;
  }

  async checkStatementStatisticsAvailability(
    databaseName: string,
  ): Promise<GeneralResult<void>> {
    try {
      await this.useDatabase(databaseName);
      const rdh = await this.requestSql({
        sql: `SELECT actual_state_desc
FROM sys.database_query_store_options`,
      });
      const state = String(
        rdh.rows[0]?.values.actual_state_desc ?? '',
      ).toUpperCase();
      if (state === 'READ_WRITE' || state === 'READ_ONLY') {
        return { ok: true, message: '' };
      }
      return {
        ok: false,
        message:
          'Statement statistics are unavailable. Enable Query Store for this database and try again.',
      };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message:
          'Statement statistics are unavailable. Grant Query Store read permissions (VIEW DATABASE STATE, or VIEW DATABASE PERFORMANCE STATE on SQL Server 2022+) and try again.' +
          (detail ? ` ${detail}` : ''),
      };
    }
  }

  async getStatementStatistics(
    params: StatementStatisticsParams,
  ): Promise<ResultSetData> {
    const availability = await this.checkStatementStatisticsAvailability(
      params.databaseName,
    );
    if (!availability.ok) {
      throw new Error(availability.message);
    }

    const normalized = normalizeStatementStatisticsParams(params);
    const orderBy = getStatementStatisticsOrderByColumn(normalized.sortBy);
    const sql = `SELECT TOP (${normalized.limit})
  CONVERT(varchar(64), q.query_id) AS statement_id,
  DB_NAME() AS database_name,
  qt.query_sql_text AS [query],
  SUM(rs.count_executions) AS execution_count,
  SUM(CONVERT(float, rs.avg_duration) * rs.count_executions) / 1000.0 AS total_elapsed_time_ms,
  SUM(CONVERT(float, rs.avg_duration) * rs.count_executions)
    / NULLIF(SUM(rs.count_executions), 0) / 1000.0 AS average_elapsed_time_ms,
  MIN(rs.min_duration) / 1000.0 AS min_elapsed_time_ms,
  MAX(rs.max_duration) / 1000.0 AS max_elapsed_time_ms,
  SUM(CONVERT(float, rs.avg_rowcount) * rs.count_executions) AS rows_processed,
  NULL AS rows_examined,
  SUM(CONVERT(float, rs.avg_logical_io_reads) * rs.count_executions) AS logical_reads,
  SUM(CONVERT(float, rs.avg_physical_io_reads) * rs.count_executions) AS physical_reads,
  MAX(rs.last_execution_time) AS last_executed_at,
  MIN(rsi.start_time) AS statistics_since,
  'query_store' AS source,
  q.query_parameterization_type_desc AS query_parameterization_type
FROM sys.query_store_query_text qt
JOIN sys.query_store_query q ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON p.query_id = q.query_id
JOIN sys.query_store_runtime_stats rs ON rs.plan_id = p.plan_id
JOIN sys.query_store_runtime_stats_interval rsi
  ON rsi.runtime_stats_interval_id = rs.runtime_stats_interval_id
WHERE rs.execution_type = 0
  AND qt.query_sql_text NOT LIKE '%sys.query_store_%'
GROUP BY q.query_id, qt.query_sql_text, q.query_parameterization_type_desc
HAVING SUM(CONVERT(float, rs.avg_duration) * rs.count_executions)
  / NULLIF(SUM(rs.count_executions), 0) / 1000.0 >= @1
ORDER BY ${orderBy} DESC`;

    return await this.requestSql({
      sql,
      conditions: {
        binds: [String(normalized.minimumAverageElapsedTimeMs)],
      },
    });
  }

  async getLocks(dbName: string): Promise<ResultSetData> {
    const sql = `SELECT
    r.request_session_id AS 'session_id',
    r.resource_type,
    DB_NAME(r.resource_database_id) AS 'database',
    r.resource_associated_entity_id AS 'associated_entity_id',
    r.request_mode,
    r.request_status,
    t.text AS 'query'
FROM
    sys.dm_tran_locks r
JOIN
    sys.dm_exec_requests e ON r.request_session_id = e.session_id
CROSS APPLY
    sys.dm_exec_sql_text(e.sql_handle) t
 WHERE
    LOWER(DB_NAME(r.resource_database_id)) = LOWER(@1)`;

    return await this.requestSql({ sql, conditions: { binds: [dbName] } });
  }

  async getSessions(dbName: string): Promise<ResultSetData> {
    const sql = `SELECT 
    s.session_id,
    s.login_time,
    s.host_name,
    s.program_name,
    s.login_name,
    s.nt_domain,
    s.status,
    s.cpu_time,
    s.memory_usage,
    s.total_elapsed_time,
    s.last_request_start_time,
    s.reads,
    s.writes,
    db.name as database_name,
    c.connection_id,
    (
      select text 
      from sys.dm_exec_sql_text(c.most_recent_sql_handle)
    ) as query
FROM sys.dm_exec_sessions s
LEFT OUTER JOIN sys.dm_exec_connections c ON c.session_id=s.session_id
LEFT OUTER JOIN sys.sysdatabases db on db.dbid=s.database_id
WHERE LOWER(DB_NAME(s.database_id)) = LOWER(@1) AND s.session_id != @@SPID
ORDER BY s.session_id DESC
`;

    return await this.requestSql({ sql, conditions: { binds: [dbName] } });
  }

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const dbResources = new Array<RdsDatabase>();
    const dbDatabase = new RdsDatabase(this.conRes.database);
    dbDatabase.capabilities = {
      ...(dbDatabase.capabilities ?? {}),
      dashboards: [
        ...(dbDatabase.capabilities?.dashboards ?? []),
        {
          dashboardId: 'rdb-database',
          providerId: 'rdb.sqlserver.database',
          variant: 'sqlserver',
          hints: { databaseName: this.conRes.database },
        },
      ],
    };
    dbResources.push(dbDatabase);

    const currentSchemaName = await this.getCurrentSchema();
    if (this.conRes.sqlServer?.onlyDefaultSchema === true) {
      const schemaRes = new DbSchema(currentSchemaName);
      dbDatabase.addChild(schemaRes);
    } else {
      const dbSchemas = this.filterSchemas(await this.getSchemas(dbDatabase));
      dbSchemas.forEach((res) => {
        dbDatabase.addChild(res);
      });
    }

    this.resetDefaultSchema(dbDatabase, currentSchemaName);

    for (const dbSchema of dbDatabase.children) {
      const dbTables = this.filterTables(await this.getTables(dbSchema));
      dbTables.forEach((res) => dbSchema.addChild(res));
      await this.setColumns(dbSchema);
    }

    const defaultSchema = dbDatabase.getSchema({ isDefault: true });
    if (defaultSchema) {
      await this.setForinKeys(defaultSchema);
      await this.setUniqueKeys(defaultSchema);
    }
    return dbResources;
  }

  async getCurrentSchema(): Promise<string> {
    const r = await this.con.request().query('SELECT SCHEMA_NAME() as name');
    return r.recordset[0].name;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSchemas(dbDatabase: RdsDatabase): Promise<Array<DbSchema>> {
    const rdh = await this.requestSql({
      sql: `SELECT SCHEMA_NAME as name, DEFAULT_CHARACTER_SET_NAME
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE CATALOG_NAME = '${dbDatabase.name}'
        AND SCHEMA_NAME NOT IN ('guest', 'INFORMATION_SCHEMA', 'sys',
          'db_owner',           'db_accessadmin', 'db_securityadmin',   'db_ddladmin',
          'db_backupoperator',  'db_datareader', 'db_datawriter',      'db_denydatareader',
          'db_denydatawriter'
        )
      `,
    });

    return rdh.rows.map((r) => {
      const res = new DbSchema(r.values.name);
      return res;
    });
  }

  async getTables(dbSchema: DbSchema): Promise<Array<DbTable>> {
    const binds = [dbSchema.name];
    const rdh = await this.requestSql({
      sql: `SELECT
      m.TABLE_NAME as name,
      CASE m.TABLE_TYPE
        WHEN 'BASE TABLE' THEN 'TABLE'
        WHEN 'VIEW' THEN 'VIEW'
      ELSE 'TABLE' END  AS table_type,
      s.comment
    FROM INFORMATION_SCHEMA.TABLES as m
    LEFT JOIN (
      SELECT
        t.name as table_name,
        s.name as schema_name,
        ep.value as comment
      FROM sys.tables t
      INNER JOIN sys.schemas s ON (t.schema_id = s.schema_id)
      INNER JOIN sys.extended_properties ep
        ON ( ep.major_id = t.object_id AND ep.minor_id = 0 AND  ep.name = 'MS_Description')
      WHERE s.name = @1
    ) s ON (m.TABLE_SCHEMA=s.schema_name AND m.TABLE_NAME = s.table_name)
    WHERE m.TABLE_SCHEMA = @1`,
      conditions: { binds },
    });

    return rdh.rows.map((r) => {
      const res = new DbTable(
        r.values.name,
        r.values.table_type,
        r.values.comment,
      );
      return res;
    });
  }

  async setColumns(dbSchema: DbSchema): Promise<void> {
    const binds = [dbSchema.name];
    const rdh = await this.requestSql({
      sql: `SELECT
        m.TABLE_NAME as tname,
        m.COLUMN_NAME as name,
        m.COLUMN_DEFAULT as col_default,
        m.DATA_TYPE as col_type,
        CASE
          WHEN m.IS_NULLABLE = 'YES' THEN 1
          ELSE 0
        END as nullable,
        s.is_identity,
        s.comment
      FROM
        INFORMATION_SCHEMA.COLUMNS m
      LEFT JOIN (
        SELECT
          schema_name(so.schema_id) as schema_name,
          so.name as table_name,
          sc.name as column_name,
          sc.is_identity,
          sep.value as comment
        FROM sys.extended_properties sep
        INNER join sys.objects so On sep.major_id = so.object_id
        INNER join sys.columns sc On (so.object_id = sc.object_id and sep.minor_id = sc.column_id)
        WHERE
          sep.name = 'MS_Description' and so.type = 'U'
          AND schema_name(so.schema_id) = @1
      ) s ON (m.TABLE_SCHEMA = s.schema_name AND m.TABLE_NAME = s.table_name AND m.COLUMN_NAME = s.column_name)
      WHERE
        m.TABLE_SCHEMA = @1
      ORDER BY
        m.ORDINAL_POSITION`,
      conditions: { binds },
    });

    const constraint = await this.requestSql({
      sql: `SELECT  T.TABLE_NAME as tname, C.COLUMN_NAME as name,T.CONSTRAINT_TYPE as ctype
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS T
    JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE C ON C.CONSTRAINT_NAME=T.CONSTRAINT_NAME
    WHERE
      T.TABLE_SCHEMA = @1 AND T.CONSTRAINT_TYPE IN ('PRIMARY KEY','UNIQUE')`,
      conditions: { binds },
    });

    rdh.rows.forEach((r) => {
      const dbTable = dbSchema.getChildByName(r.values.tname);
      if (dbTable) {
        const type_name = EnumValues.getNameFromValue(
          SQLServerColumnType,
          SQLServerColumnType.parse(r.values.col_type),
        ) as any;

        const ctype =
          constraint.rows.find(
            (it) =>
              it.values.tname === r.values.tname &&
              it.values.name === r.values.name,
          )?.values?.ctype ?? '';

        let key = '';
        if (ctype === 'PRIMARY KEY') {
          key = 'PRI';
        } else if (ctype === 'UNIQUE') {
          key = 'UNI';
        }

        const res = new DbColumn(
          r.values.name,
          parseColumnType(type_name),
          {
            nullable: r.values.nullable === 1,
            key,
            default: r.values.col_default,
            extra: r.values.is_identity === true ? 'identity' : '',
          },
          r.values.comment,
        );
        dbTable.addChild(res);
      }
    });
  }

  async setUniqueKeys(dbSchema: DbSchema): Promise<void> {
    const binds = [dbSchema.name];
    const rdh = await this.requestSql({
      sql: `SELECT T.TABLE_NAME as table_name, STRING_AGG( CONVERT(VARCHAR(max), C.COLUMN_NAME), ',') AS columns, T.CONSTRAINT_NAME as index_name
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS T
      JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE C ON C.CONSTRAINT_NAME=T.CONSTRAINT_NAME
      WHERE
        LOWER(T.TABLE_SCHEMA)=LOWER(@1)
        AND T.CONSTRAINT_TYPE = 'UNIQUE'
      GROUP BY T.TABLE_NAME, T.CONSTRAINT_NAME `,
      conditions: { binds },
    });

    rdh.rows.forEach((row) => {
      const tableName: string = row.values['table_name'];
      const indexName: string = row.values['index_name'];
      const columnNames: string = row.values['columns'];

      const tableRes = dbSchema.getChildByName(tableName);
      if (tableRes) {
        if (tableRes.uniqueKeys === undefined) {
          tableRes.uniqueKeys = [];
        }
        const constraint = {
          name: indexName,
          columns: columnNames.split(',').sort(),
        };
        tableRes.uniqueKeys.push(constraint);
        if (constraint.columns.length > 1) {
          constraint.columns.forEach((columnName) => {
            const colRes = tableRes.getChildByName(columnName);
            if (colRes) {
              (colRes as any)['uniqKey'] = true;
            }
          });
        }
      }
    });
  }

  async setForinKeys(dbSchema: DbSchema): Promise<void> {
    const binds = [dbSchema.name];
    const rdh = await this.requestSql({
      sql: `SELECT
      C.TABLE_NAME as table_name,
      KCU.COLUMN_NAME as column_name,
      C2.TABLE_NAME as referenced_table_name,
      KCU2.COLUMN_NAME as referenced_column_name,
      C.CONSTRAINT_NAME as constraint_name
    FROM
      INFORMATION_SCHEMA.TABLE_CONSTRAINTS C
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU ON (C.CONSTRAINT_SCHEMA = KCU.CONSTRAINT_SCHEMA AND C.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME)
    INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS RC ON (C.CONSTRAINT_SCHEMA = RC.CONSTRAINT_SCHEMA AND C.CONSTRAINT_NAME = RC.CONSTRAINT_NAME)
    INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS C2 ON (RC.UNIQUE_CONSTRAINT_SCHEMA = C2.CONSTRAINT_SCHEMA AND RC.UNIQUE_CONSTRAINT_NAME = C2.CONSTRAINT_NAME)
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KCU2 ON (C2.CONSTRAINT_SCHEMA = KCU2.CONSTRAINT_SCHEMA AND C2.CONSTRAINT_NAME = KCU2.CONSTRAINT_NAME AND KCU.ORDINAL_POSITION = KCU2.ORDINAL_POSITION)
    WHERE
      C.CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND LOWER(C.CONSTRAINT_SCHEMA) = LOWER(@1)`,
      conditions: { binds },
    });

    rdh.rows.forEach((row) => {
      const tableName = row.values['table_name']; // order_detail
      const columnName = row.values['column_name'];
      const referencedTableName = row.values['referenced_table_name']; // order
      const referencedColumnName = row.values['referenced_column_name'];
      const constraintName = row.values['constraint_name'];

      const tableRes = dbSchema.getChildByName(tableName);
      if (tableRes) {
        if (tableRes.getChildByName(columnName)) {
          if (tableRes.foreignKeys === undefined) {
            tableRes.foreignKeys = {};
          }
          if (tableRes.foreignKeys.referenceTo === undefined) {
            tableRes.foreignKeys.referenceTo = {};
          }
          tableRes.foreignKeys.referenceTo[columnName] = {
            tableName: referencedTableName, // customer
            columnName: referencedColumnName,
            constraintName,
          };
        }
      }

      const tableRes2 = dbSchema.getChildByName(referencedTableName);
      if (tableRes2) {
        if (tableRes2.getChildByName(referencedColumnName)) {
          if (tableRes2.foreignKeys === undefined) {
            tableRes2.foreignKeys = {};
          }
          if (tableRes2.foreignKeys.referencedFrom === undefined) {
            tableRes2.foreignKeys.referencedFrom = {};
          }
          tableRes2.foreignKeys.referencedFrom[referencedColumnName] = {
            tableName: tableName, // order_detail
            columnName: columnName,
            constraintName,
          };
        }
      }
    });
  }

  isPositionedParameterAvailable(): boolean {
    return true;
  }

  getPositionalCharacter(): string | undefined {
    return '@';
  }

  getLimitClauseStyle(): LimitClauseStyle {
    return 'top';
  }

  getIdQuoteCharacter(): QuoteChar | undefined {
    return '"';
  }

  async closeSub(): Promise<string> {
    try {
      if (this.con) {
        await this.con.close();
        this.con = undefined;
      }

      return '';
    } catch (e) {
      console.error(e);
      return e.message;
    } finally {
      this.tran = undefined;
      this.req = undefined;
    }
  }

  private async createConnection(): Promise<ConnectionPool> {
    const authenticationType =
      this.conRes.sqlServer?.authenticationType ??
      SQLServerAuthenticationType.default;

    let con: ConnectionPool;

    if (authenticationType === SQLServerAuthenticationType.useConnectString) {
      con = await connect(this.conRes.sqlServer?.connectString ?? '');
    } else {
      const options = this.createConnectOptions();
      con = await connect(options);
    }

    this.tran = undefined;
    this.req = undefined;
    return con;
  }

  private createConnectOptions(): config {
    const { sqlServer, transactionIsolationLevel, queryTimeoutMs } =
      this.conRes;
    const options: config = {
      server: this.conRes.host,
      database: this.conRes.database,
      connectionTimeout: 10000,
      pool: {
        min: 1,
        max: 3,
      },
      options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: sqlServer?.encrypt ?? false,
        //
        trustServerCertificate: sqlServer?.trustServerCertificate ?? false,
        // NOTE: this only requests Always-On Availability-Group read-only routing (ApplicationIntent=ReadOnly).
        readOnlyIntent: this.conRes.readOnly ?? false,
      },
    };
    if (transactionIsolationLevel) {
      switch (transactionIsolationLevel) {
        case 'READ UNCOMMITTED':
          options.options.connectionIsolationLevel =
            ISOLATION_LEVEL.READ_UNCOMMITTED;
          break;
        case 'READ COMMITTED':
          options.options.connectionIsolationLevel =
            ISOLATION_LEVEL.READ_COMMITTED;
          break;
        case 'REPEATABLE READ':
          options.options.connectionIsolationLevel =
            ISOLATION_LEVEL.REPEATABLE_READ;
          break;
        case 'SERIALIZABLE':
          options.options.connectionIsolationLevel =
            ISOLATION_LEVEL.SERIALIZABLE;
          break;
      }
    }

    if (queryTimeoutMs) {
      options.requestTimeout = queryTimeoutMs;
    }

    const authType =
      sqlServer?.authenticationType ?? SQLServerAuthenticationType.default;

    switch (authType) {
      case SQLServerAuthenticationType.default: {
        return {
          ...options,
          port: this.conRes.port,
          user: this.conRes.user,
          password: this.conRes.password,
        };
      }
      case SQLServerAuthenticationType.ntlm: {
        const opt: config = {
          ...options,
          authentication: {
            type: authType,
            options: {
              /** User name from your windows account. */
              userName: this.conRes.user,
              /** Password from your windows account. */
              password: this.conRes.password,
              /** Once you set domain for ntlm authentication type, driver will connect to SQL Server using domain login. */
              domain: sqlServer.domain,
            },
          },
        };
        return opt;
      }
      case SQLServerAuthenticationType.azureActiveDirectoryDefault:
      case SQLServerAuthenticationType.azureActiveDirectoryMsiVm: {
        const opt: config = {
          ...options,
          authentication: {
            type: authType,
            options: {
              clientId: sqlServer.clientId,
            },
          },
        };
        return opt;
      }
      case SQLServerAuthenticationType.azureActiveDirectoryPassword: {
        return {
          ...options,
          authentication: {
            type: authType,
            options: {
              clientId: sqlServer.clientId,
              tenantId: sqlServer.tenantId,
              userName: this.conRes.user,
              password: this.conRes.password,
            },
          },
        };
      }
      case SQLServerAuthenticationType.azureActiveDirectoryServicePrincipalSecret: {
        return {
          ...options,
          authentication: {
            type: authType,
            options: {
              clientId: sqlServer.clientId,
              tenantId: sqlServer.tenantId,
              clientSecret: sqlServer.clientSecret,
            },
          },
        };
      }
      case SQLServerAuthenticationType.azureActiveDirectoryAccessToken: {
        return {
          ...options,
          options: {
            ...options.options,
            encrypt: true, // Azure SQL Databaseは暗号化必須のため強制
          },
          authentication: {
            type: authType,
            options: {
              token: sqlServer.token,
            },
          },
        };
      }
    }
    throw new Error('Not supported' + authType);
  }
}
