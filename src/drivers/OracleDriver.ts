import {
  createRdhKey,
  GeneralColumnType,
  parseColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import { EnumValues } from 'enum-values';
import oracledb from 'oracledb';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import {
  ConnectionSetting,
  ActualPlanArtifact,
  GeneralResult,
  LimitClauseStyle,
  OracleConnectionType,
  QueryParams,
  StatementStatisticsParams,
  TransactionIsolationLevel,
} from '../types';
import { OracleColumnType } from '../types/resource/OracleColumnType';
import { QuoteChar } from '../helpers';
import { RDSBaseDriver } from './RDSBaseDriver';
import {
  OraclePerformanceTuningProvider,
  OracleRdbDashboardProvider,
  PerformanceTuningContextProvider,
  RdbDashboardProvider,
} from './providers';
import {
  getStatementStatisticsOrderByColumn,
  isSingleSelectStatement,
  normalizeStatementStatisticsParams,
} from '../utils';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];
oracledb.fetchAsBuffer = [oracledb.BLOB];

export class OracleDriver extends RDSBaseDriver {
  private con: oracledb.Connection | undefined;
  private autoCommitEnabled = true;
  private currentIsolationLevel: TransactionIsolationLevel = 'READ COMMITTED';
  private rdbDashboardProvider?: RdbDashboardProvider;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  protected getRdbDashboardProvider(): RdbDashboardProvider {
    if (!this.rdbDashboardProvider) {
      this.rdbDashboardProvider = new OracleRdbDashboardProvider(this);
    }
    return this.rdbDashboardProvider;
  }

  async begin(): Promise<void> {
    this.assertSessionStateAvailable('begin a transaction');
    this.autoCommitEnabled = false;
    const { transactionIsolationLevel } = this.conRes;
    if (
      transactionIsolationLevel === 'SERIALIZABLE' ||
      transactionIsolationLevel === 'REPEATABLE READ'
    ) {
      // Oracle has no distinct REPEATABLE READ; SERIALIZABLE is the closest (and strictest) match, same convention SQL Server's own docs use.
      await this.con?.execute('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      this.currentIsolationLevel = 'SERIALIZABLE';
    } else {
      // Oracle has no READ UNCOMMITTED (its MVCC model makes dirty reads impossible); UNSPECIFIED/SNAPSHOT are SQL-Server-only values.
      this.currentIsolationLevel = 'READ COMMITTED';
    }
  }

  async commit(): Promise<void> {
    this.assertSessionStateAvailable('commit a transaction');
    await this.con?.commit();
    this.autoCommitEnabled = true;
  }

  async rollback(): Promise<void> {
    this.assertSessionStateAvailable('roll back a transaction');
    await this.con?.rollback();
    this.autoCommitEnabled = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setAutoCommit(value: boolean): Promise<void> {
    // Oracle has no session-level autocommit statement — node-oracledb takes autoCommit per execute() call instead, so this just updates the flag requestSqlSub() reads on every call.
    this.autoCommitEnabled = value;
  }

  async getTransactionIsolationLevel(): Promise<TransactionIsolationLevel> {
    return this.currentIsolationLevel;
  }

  fieldInfo2Key(
    fieldInfo: oracledb.Metadata<any>,
    useTableColumnType: boolean,
    table?: DbTable,
  ): RdhKey {
    const name = EnumValues.getNameFromValue(
      OracleColumnType,
      OracleColumnType.parse(fieldInfo.dbTypeName),
    );

    const tableColumn = table?.children?.find(
      (it) => it.name === fieldInfo.name,
    );

    const key = createRdhKey({
      name: fieldInfo.name,
      // fieldInfo.isJson also covers legacy LOB/VARCHAR2 columns carrying an enabled "IS JSON" constraint (Oracle's only JSON storage before 21c), which report their real dbTypeName (e.g. "CLOB") here, not "JSON".
      type: fieldInfo.isJson ? GeneralColumnType.JSON : parseColumnType(name),
      comment: tableColumn?.comment ?? '',
      required: tableColumn?.nullable === false,
    });

    if (
      (useTableColumnType || key.type === GeneralColumnType.UNKNOWN) &&
      tableColumn
    ) {
      key.type = tableColumn.colType;
    }

    return key;
  }

  async useDatabase(database: string): Promise<void> {
    // Oracle has no session-level "switch database" — schema (owner) is bound to the connecting user, and cross-schema queries just qualify table references with `schema.table` instead (already handled by the shared schema-qualification logic in SQLHelper.ts).
    console.log(`Ignore "USE DATABASE(${database})"`);
  }

  async connectWithTest(): Promise<string> {
    let errorReason = '';
    this.con = await this.createConnection();
    try {
      errorReason = await this.test();
    } catch (e) {
      errorReason = e.message;
    }
    try {
      if (this.conRes.timezone) {
        await this.con.execute(
          `ALTER SESSION SET TIME_ZONE = '${this.conRes.timezone}'`,
        );
      }
      if (this.conRes.queryTimeoutMs !== undefined) {
        this.con.callTimeout = this.conRes.queryTimeoutMs;
      }
    } catch (e) {
      console.error(e);
      errorReason = e.message;
    }
    return errorReason;
  }

  /**
   * Terminate (kill) a specific session.
   * If sesssionOrPid is not specified, cancel the running request.
   * @param sesssionOrPid the target session's SID (the SERIAL# needed to
   *   actually kill it is looked up here, since Oracle requires the pair)
   */
  async kill(sesssionOrPid?: number): Promise<string> {
    let message = '';
    if (sesssionOrPid) {
      let extraCon: oracledb.Connection | undefined;
      try {
        extraCon = await this.createConnection();
        const lookup = await extraCon.execute<{ SERIAL_NUM: number }>(
          `SELECT SERIAL# AS SERIAL_NUM FROM V$SESSION WHERE SID = :1`,
          [sesssionOrPid],
        );
        const rows = lookup.rows ?? [];
        if (!rows.length) {
          return `Session ${sesssionOrPid} not found`;
        }
        const serial = rows[0].SERIAL_NUM;
        await extraCon.execute(
          `ALTER SYSTEM KILL SESSION '${sesssionOrPid},${serial}'`,
          [],
          { autoCommit: true },
        );
      } catch (e) {
        message = e.message;
      } finally {
        if (extraCon) {
          await extraCon.close();
        }
      }
    } else {
      try {
        if (!this.con) {
          return message;
        }
        await this.con.break();
      } catch (e) {
        message = e.message;
      }
    }
    return message;
  }

  protected getTestSqlStatement(): string {
    return 'SELECT 1 FROM DUAL';
  }

  async requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    this.assertSessionStateAvailable('run a query');
    const { sql, conditions, dbTable, meta } = params;
    if (!this.con) {
      throw new Error('No connection');
    }
    let rdb: ResultSetDataBuilder;

    const binds = conditions?.binds ?? [];
    const startTime = new Date().getTime();
    const result = await this.con.execute(sql, binds, {
      autoCommit: this.autoCommitEnabled,
    });
    const elapsedTimeMilli = new Date().getTime() - startTime;

    if (result.metaData?.length) {
      rdb = new ResultSetDataBuilder(
        result.metaData.map((f) =>
          this.fieldInfo2Key(f, meta?.editable === true, dbTable),
        ),
      );
      (result.rows as Record<string, any>[] | undefined)?.forEach((row) => {
        rdb.addRow(row);
      });
      rdb.setSummary({
        elapsedTimeMilli,
        selectedRows: rdb.rs.rows.length,
      });
    } else {
      rdb = new ResultSetDataBuilder([
        createRdhKey({ name: 'affectedRows', type: GeneralColumnType.INTEGER }),
      ]);
      rdb.addRow({ affectedRows: result.rowsAffected ?? 0 });
      rdb.setSummary({
        elapsedTimeMilli,
        affectedRows: result.rowsAffected ?? 0,
      });
    }

    return rdb;
  }

  async explainSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    this.assertSessionStateAvailable('retrieve an execution plan');
    if (!this.con) {
      throw new Error('No connection');
    }
    const binds = params.conditions?.binds ?? [];
    // Unique per call so concurrent/repeated explains never collide on the same (session-private, auto-cleared-at-disconnect) PLAN_TABLE rows.
    const statementId = `dbn_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    await this.con.execute(
      `EXPLAIN PLAN SET STATEMENT_ID = '${statementId}' FOR ${params.sql}`,
      binds,
      { autoCommit: false },
    );

    const rdb = await this.requestSqlSub({
      ...params,
      sql: `SELECT PLAN_TABLE_OUTPUT FROM TABLE(DBMS_XPLAN.DISPLAY(NULL, '${statementId}', 'BASIC'))`,
      conditions: undefined,
    });
    rdb.updateKeyName('PLAN_TABLE_OUTPUT', 'EXPLAIN');
    rdb.updateKeyWidth('EXPLAIN', 300);
    rdb.updateKeyAlign('EXPLAIN', 'left');

    return rdb;
  }

  async explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const actualPlan = await this.collectPerformanceTuningActualPlan(params);
    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'PLAN_TABLE_OUTPUT', type: GeneralColumnType.TEXT, width: 300 }),
    ]);
    actualPlan.content.split('\n').forEach((line) => rdb.addRow({ PLAN_TABLE_OUTPUT: line }));
    return rdb;
  }

  async getVersion(): Promise<string> {
    return this.con?.oracleServerVersionString ?? '';
  }

  private performanceTuningContextProvider?: PerformanceTuningContextProvider;

  // Typed to the interface (not the concrete OraclePerformanceTuningProvider), same rationale as the other three vendor drivers' override of this hook:
  protected getPerformanceTuningContextProvider(): PerformanceTuningContextProvider {
    if (!this.performanceTuningContextProvider) {
      this.performanceTuningContextProvider = new OraclePerformanceTuningProvider(this);
    }
    return this.performanceTuningContextProvider;
  }

  async collectPerformanceTuningPlanRows(
    params: QueryParams,
  ): Promise<ResultSetData> {
    this.assertSessionStateAvailable('retrieve an execution plan');
    if (!this.con) {
      throw new Error('No connection');
    }
    const binds = params.conditions?.binds ?? [];
    // Unique per call so concurrent/repeated calls never collide on the same (session-private) PLAN_TABLE rows - same scheme explainSqlSub() already uses, distinct prefix so a stray row is identifiable as coming from this method rather than the general Explain feature.
    const statementId = `dbnpt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    await this.con.execute(
      `EXPLAIN PLAN SET STATEMENT_ID = '${statementId}' FOR ${params.sql}`,
      binds,
      { autoCommit: false },
    );

    try {
      const rdb = await this.requestSqlSub({
        sql: `SELECT ID, PARENT_ID, DEPTH, OPERATION, OPTIONS, OBJECT_OWNER, OBJECT_NAME, OBJECT_ALIAS, OBJECT_TYPE, COST, CARDINALITY, BYTES, ACCESS_PREDICATES, FILTER_PREDICATES
FROM PLAN_TABLE WHERE STATEMENT_ID = :1 ORDER BY ID`,
        dbTable: undefined,
        conditions: { binds: [statementId] },
        meta: { type: 'performanceTuningContext' },
      });
      return rdb.rs;
    } finally {
      // PLAN_TABLE is session-private but not auto-cleared between calls - best-effort delete so repeated performance-tuning-context calls within one long-lived connection don't accumulate stale rows.
      try {
        await this.con.execute(
          `DELETE FROM PLAN_TABLE WHERE STATEMENT_ID = :1`,
          [statementId],
          { autoCommit: this.autoCommitEnabled },
        );
      } catch {
        // best-effort only
      }
    }
  }

  /** Executes a SELECT and retrieves its cursor statistics without relying on SQL-text hint injection. */
  async collectPerformanceTuningActualPlan(
    params: QueryParams,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<ActualPlanArtifact> {
    if (!this.con) {
      throw new Error('No connection');
    }
    if (!isSingleSelectStatement(params.sql)) {
      throw new Error('Oracle actual-plan capture is limited to a single SELECT statement');
    }
    if (!this.autoCommitEnabled) {
      throw new Error('Cannot capture an actual plan while a transaction is active');
    }
    if (options?.signal?.aborted) {
      throw new Error('Actual plan capture was cancelled');
    }

    const releaseSessionState = this.beginExclusiveSessionStateOperation(
      'Oracle actual-plan capture',
    );
    const con = this.con;
    const oldCallTimeout = con.callTimeout;
    let previousStatisticsLevel: string | undefined;
    let statisticsLevelChanged = false;
    let captureError: unknown;
    let artifact: ActualPlanArtifact | undefined;
    let cleanupError: unknown;
    const breakExecution = (): void => {
      void con.break();
    };
    options?.signal?.addEventListener('abort', breakExecution, { once: true });

    try {
      if (options?.timeoutMs && options.timeoutMs > 0) {
        con.callTimeout = options.timeoutMs;
      }
      const setting = await con.execute<{ VALUE: string }>(
        "SELECT VALUE FROM V$PARAMETER WHERE NAME = 'statistics_level'",
      );
      previousStatisticsLevel = String(setting.rows?.[0]?.VALUE ?? '').toUpperCase();
      if (!['BASIC', 'TYPICAL', 'ALL'].includes(previousStatisticsLevel)) {
        throw new Error('Oracle did not return a restorable STATISTICS_LEVEL value');
      }
      await con.execute('ALTER SESSION SET STATISTICS_LEVEL = ALL');
      statisticsLevelChanged = true;

      await con.execute(params.sql, params.conditions?.binds ?? [], { autoCommit: false });
      const cursor = await con.execute<{ PREV_SQL_ID: string; PREV_CHILD_NUMBER: number }>(
        `SELECT PREV_SQL_ID, PREV_CHILD_NUMBER
FROM V$SESSION
WHERE AUDSID = SYS_CONTEXT('USERENV', 'SESSIONID')`,
      );
      const sqlId = cursor.rows?.[0]?.PREV_SQL_ID;
      const childNumber = cursor.rows?.[0]?.PREV_CHILD_NUMBER;
      if (!sqlId || childNumber === undefined || childNumber === null) {
        throw new Error('Oracle could not identify the executed cursor for actual-plan capture');
      }
      const display = await con.execute<{ PLAN_TABLE_OUTPUT: string }>(
        "SELECT PLAN_TABLE_OUTPUT FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(:1, :2, 'ALLSTATS LAST'))",
        [sqlId, childNumber],
      );
      const content = (display.rows ?? [])
        .map((row) => row.PLAN_TABLE_OUTPUT)
        .filter((line): line is string => typeof line === 'string')
        .join('\n');
      if (!content) {
        throw new Error('Oracle did not return an ALLSTATS LAST cursor plan');
      }
      artifact = { source: 'DBMS_XPLAN.DISPLAY_CURSOR ALLSTATS LAST', format: 'text', content };
    } catch (e) {
      captureError = e;
    } finally {
      options?.signal?.removeEventListener('abort', breakExecution);
      if (statisticsLevelChanged && previousStatisticsLevel) {
        try {
          await con.execute(`ALTER SESSION SET STATISTICS_LEVEL = ${previousStatisticsLevel}`);
        } catch (e) {
          cleanupError = e;
        }
      }
      con.callTimeout = oldCallTimeout;
      releaseSessionState();
    }
    if (cleanupError) {
      // If STATISTICS_LEVEL cannot be restored, retaining this session could silently alter later user queries.
      const disconnectError = await this.disconnect();
      if (disconnectError) {
        throw new Error(`Failed to restore Oracle actual-plan session state; connection was closed. ${disconnectError}`);
      }
    }
    if (captureError) {
      throw captureError;
    }
    if (cleanupError) {
      throw cleanupError;
    }
    if (!artifact) {
      throw new Error('Oracle actual-plan capture completed without a cursor plan');
    }
    return artifact;
  }

  supportsGetStatementStatistics(): boolean {
    return true;
  }

  async checkStatementStatisticsAvailability(
    // Oracle connections are already scoped to one database/PDB.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    databaseName: string,
  ): Promise<GeneralResult<void>> {
    try {
      await this.requestSql({
        sql: 'SELECT SQL_ID FROM V$SQLSTATS WHERE 1 = 0',
      });
      return { ok: true, message: '' };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message:
          'Statement statistics are unavailable. Grant read access to V$SQLSTATS and try again.' +
          (detail ? ` ${detail}` : ''),
      };
    }
  }

  async getStatementStatistics(
    params: StatementStatisticsParams,
  ): Promise<ResultSetData> {
    const normalized = normalizeStatementStatisticsParams(params);
    const orderBy = getStatementStatisticsOrderByColumn(normalized.sortBy);
    const sql = `SELECT *
FROM (
  SELECT
    SQL_ID AS "statement_id",
    SYS_CONTEXT('USERENV', 'DB_NAME') AS "database_name",
    -- SQL_TEXT truncates at 1000 chars; SQL_FULLTEXT (CLOB) returns the
    -- whole statement. The self-referential exclusion filter below
    -- intentionally keeps using SQL_TEXT - it only needs to detect the
    -- string's presence, and comparing a CLOB there gains nothing.
    SQL_FULLTEXT AS "query",
    EXECUTIONS AS "execution_count",
    ELAPSED_TIME / 1000 AS "total_elapsed_time_ms",
    CASE WHEN EXECUTIONS > 0 THEN ELAPSED_TIME / EXECUTIONS / 1000 END AS "average_elapsed_time_ms",
    CAST(NULL AS NUMBER) AS "min_elapsed_time_ms",
    CAST(NULL AS NUMBER) AS "max_elapsed_time_ms",
    ROWS_PROCESSED AS "rows_processed",
    CAST(NULL AS NUMBER) AS "rows_examined",
    BUFFER_GETS AS "logical_reads",
    DISK_READS AS "physical_reads",
    LAST_ACTIVE_TIME AS "last_executed_at",
    CAST(NULL AS TIMESTAMP) AS "statistics_since",
    'V$SQLSTATS' AS "source"
  FROM V$SQLSTATS
  WHERE EXECUTIONS > 0
    AND ELAPSED_TIME / EXECUTIONS / 1000 >= :1
    AND UPPER(SQL_TEXT) NOT LIKE '%V$SQLSTATS%'
  ORDER BY "${orderBy}" DESC
)
WHERE ROWNUM <= ${normalized.limit}`;

    return await this.requestSql({
      sql,
      conditions: {
        binds: [String(normalized.minimumAverageElapsedTimeMs)],
      },
    });
  }

  async getCurrentSchema(): Promise<string> {
    const rdb = await this.requestSqlSub({
      sql: `SELECT SYS_CONTEXT('USERENV','CURRENT_SCHEMA') AS SCHEMA_NAME FROM DUAL`,
      dbTable: undefined,
    });
    return rdb.rs.rows[0]?.values.SCHEMA_NAME ?? this.conRes.user ?? '';
  }

  async getLocks(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dbName: string,
  ): Promise<ResultSetData> {
    // Oracle has no per-database filter analogous to MySQL/Postgres — a single instance/PDB is already what the connection is scoped to.
    const sql = `SELECT
    s.SID,
    s.SERIAL# AS SERIAL_NUM,
    s.USERNAME AS "USER",
    s.MACHINE,
    s.STATUS,
    o.OBJECT_NAME,
    lo.LOCKED_MODE,
    s.SQL_ID
FROM V$LOCKED_OBJECT lo
JOIN V$SESSION s ON s.SID = lo.SESSION_ID
JOIN ALL_OBJECTS o ON o.OBJECT_ID = lo.OBJECT_ID
WHERE s.SID != SYS_CONTEXT('USERENV', 'SID')
ORDER BY s.SID`;

    return await this.requestSql({ sql });
  }

  async getSessions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dbName: string,
  ): Promise<ResultSetData> {
    const sql = `SELECT
    s.SID,
    s.SERIAL# AS SERIAL_NUM,
    s.USERNAME AS "USER",
    s.MACHINE,
    s.PROGRAM,
    s.STATUS,
    s.LOGON_TIME,
    s.LAST_CALL_ET,
    sq.SQL_TEXT AS QUERY
FROM V$SESSION s
LEFT JOIN V$SQL sq ON sq.SQL_ID = s.SQL_ID AND sq.CHILD_NUMBER = s.SQL_CHILD_NUMBER
WHERE s.TYPE = 'USER'
  AND s.SID != SYS_CONTEXT('USERENV', 'SID')
ORDER BY s.SID DESC`;

    return await this.requestSql({ sql });
  }

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const dbResources = new Array<RdsDatabase>();
    const dbDatabase = new RdsDatabase(
      this.conRes.database ?? this.conRes.name,
    );
    dbDatabase.capabilities = {
      ...(dbDatabase.capabilities ?? {}),
      dashboards: [
        ...(dbDatabase.capabilities?.dashboards ?? []),
        {
          dashboardId: 'rdb-database',
          providerId: 'rdb.oracle.database',
          variant: 'oracle',
          hints: { databaseName: dbDatabase.name },
        },
      ],
    };
    dbResources.push(dbDatabase);

    const currentSchemaName = await this.getCurrentSchema();

    const dbSchemas = this.filterSchemas(await this.getSchemas(dbDatabase));
    dbSchemas.forEach((res) => {
      dbDatabase.addChild(res);
    });
    this.resetDefaultSchema(dbDatabase, currentSchemaName);

    for (const dbSchema of dbSchemas) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSchemas(dbDatabase: RdsDatabase): Promise<Array<DbSchema>> {
    const rdh = await this.requestSql({
      sql: `SELECT USERNAME AS NAME
      FROM ALL_USERS
      WHERE USERNAME NOT IN (
        'SYS','SYSTEM','OUTLN','XDB','CTXSYS','MDSYS','ORDSYS','ORDDATA',
        'WMSYS','APPQOSSYS','DBSFWUSER','DBSNMP','GSMADMIN_INTERNAL',
        'ANONYMOUS','XS$NULL','GGSYS','DVSYS','DVF','AUDSYS',
        'REMOTE_SCHEDULER_AGENT','SYSBACKUP','SYSDG','SYSKM','SYSRAC',
        'OJVMSYS','LBACSYS','FLOWS_FILES','ORACLE_OCM','GSMCATUSER',
        'GSMUSER','GSMROOTUSER','PDBADMIN',
        -- 23c+ additions
        'BAASSYS','DGPDB_INT','DIP','GGSHAREDCAP','SYS$UMF','VECSYS'
      )
      ORDER BY USERNAME`,
    });

    return rdh.rows.map((r) => new DbSchema(r.values.NAME));
  }

  async getTables(dbSchema: DbSchema): Promise<Array<DbTable>> {
    let rdh = await this.requestSql({
      sql: `SELECT t.TABLE_NAME AS NAME, NVL(c.COMMENTS, '') AS "COMMENT"
      FROM ALL_TABLES t
      LEFT JOIN ALL_TAB_COMMENTS c
        ON c.OWNER = t.OWNER AND c.TABLE_NAME = t.TABLE_NAME AND c.TABLE_TYPE = 'TABLE'
      WHERE t.OWNER = :1
      ORDER BY t.TABLE_NAME`,
      conditions: { binds: [dbSchema.name] },
    });

    const list = rdh.rows.map((r) => {
      return new DbTable(r.values.NAME, 'TABLE', r.values.COMMENT);
    });

    rdh = await this.requestSql({
      sql: `SELECT v.VIEW_NAME AS NAME, NVL(c.COMMENTS, '') AS "COMMENT"
      FROM ALL_VIEWS v
      LEFT JOIN ALL_TAB_COMMENTS c
        ON c.OWNER = v.OWNER AND c.TABLE_NAME = v.VIEW_NAME AND c.TABLE_TYPE = 'VIEW'
      WHERE v.OWNER = :1
      ORDER BY v.VIEW_NAME`,
      conditions: { binds: [dbSchema.name] },
    });

    return list.concat(
      rdh.rows.map(
        (r) => new DbTable(r.values.NAME, 'VIEW', r.values.COMMENT),
      ),
    );
  }

  async setColumns(dbSchema: DbSchema): Promise<void> {
    const jsonColumnNames = await this.getJsonColumnNames(dbSchema.name);
    const rdh = await this.requestSql({
      sql: `SELECT
      col.TABLE_NAME AS TNAME,
      col.COLUMN_NAME AS NAME,
      col.DATA_TYPE AS COL_TYPE,
      CASE WHEN col.NULLABLE = 'Y' THEN 1 ELSE 0 END AS NULLABLE,
      CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'PRI' ELSE NULL END AS COL_KEY,
      col.DATA_DEFAULT AS COL_DEFAULT,
      NVL(cm.COMMENTS, '') AS "COMMENT"
    FROM ALL_TAB_COLUMNS col
    LEFT JOIN ALL_COL_COMMENTS cm
      ON cm.OWNER = col.OWNER AND cm.TABLE_NAME = col.TABLE_NAME AND cm.COLUMN_NAME = col.COLUMN_NAME
    LEFT JOIN (
      SELECT acc.TABLE_NAME, acc.COLUMN_NAME
      FROM ALL_CONSTRAINTS ac
      JOIN ALL_CONS_COLUMNS acc
        ON acc.OWNER = ac.OWNER AND acc.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
      WHERE ac.OWNER = :1 AND ac.CONSTRAINT_TYPE = 'P'
    ) pk ON pk.TABLE_NAME = col.TABLE_NAME AND pk.COLUMN_NAME = col.COLUMN_NAME
    WHERE col.OWNER = :2
    ORDER BY col.TABLE_NAME, col.COLUMN_ID`,
      conditions: { binds: [dbSchema.name, dbSchema.name] },
    });

    rdh.rows.forEach((r) => {
      const dbTable = dbSchema.getChildByName(r.values.TNAME);
      if (dbTable) {
        const type_name = EnumValues.getNameFromValue(
          OracleColumnType,
          OracleColumnType.parse(r.values.COL_TYPE),
        );
        const colType = jsonColumnNames.has(`${r.values.TNAME}.${r.values.NAME}`)
          ? GeneralColumnType.JSON
          : parseColumnType(type_name);
        const res = new DbColumn(
          r.values.NAME,
          colType,
          {
            nullable: r.values.NULLABLE === 1,
            key: r.values.COL_KEY,
            default: r.values.COL_DEFAULT,
          },
          r.values.COMMENT,
        );
        dbTable.addChild(res);
      }
    });
  }

  /** Prior to Oracle 21c's native JSON type, JSON was only ever VARCHAR2/CLOB/BLOB storage guarded by an `IS JSON` check constraint, so ALL_TAB_COLUMNS.DATA_TYPE alone (used above) reports those columns as their storage type, not JSON. */
  private async getJsonColumnNames(schemaName: string): Promise<Set<string>> {
    try {
      const rdh = await this.requestSql({
        sql: `SELECT TABLE_NAME, COLUMN_NAME FROM ALL_JSON_COLUMNS WHERE OWNER = :1`,
        conditions: { binds: [schemaName] },
      });
      return new Set(
        rdh.rows.map((r) => `${r.values.TABLE_NAME}.${r.values.COLUMN_NAME}`),
      );
    } catch (e) {
      if (String(e.message).startsWith('ORA-00942')) {
        return new Set();
      }
      throw e;
    }
  }

  async setUniqueKeys(dbSchema: DbSchema): Promise<void> {
    const rdh = await this.requestSql({
      sql: `SELECT
      ac.TABLE_NAME AS TABLE_NAME,
      ac.CONSTRAINT_NAME AS INDEX_NAME,
      LISTAGG(acc.COLUMN_NAME, ',') WITHIN GROUP (ORDER BY acc.POSITION) AS COLUMNS
    FROM ALL_CONSTRAINTS ac
    JOIN ALL_CONS_COLUMNS acc
      ON acc.OWNER = ac.OWNER AND acc.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
    WHERE ac.OWNER = :1 AND ac.CONSTRAINT_TYPE = 'U'
    GROUP BY ac.TABLE_NAME, ac.CONSTRAINT_NAME
    ORDER BY ac.TABLE_NAME, ac.CONSTRAINT_NAME`,
      conditions: { binds: [dbSchema.name] },
    });

    rdh.rows.forEach((row) => {
      const tableName: string = row.values['TABLE_NAME'];
      const indexName: string = row.values['INDEX_NAME'];
      const columnNames: string = row.values['COLUMNS'];

      const tableRes = dbSchema.getChildByName(tableName);
      if (tableRes) {
        if (tableRes.uniqueKeys === undefined) {
          tableRes.uniqueKeys = [];
        }
        const constraint = {
          name: indexName,
          columns: columnNames.split(','),
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
    const rdh = await this.requestSql({
      sql: `SELECT
      ac.CONSTRAINT_NAME AS CONSTRAINT_NAME,
      ac.TABLE_NAME AS TABLE_NAME,
      acc.COLUMN_NAME AS COLUMN_NAME,
      rc.TABLE_NAME AS REFERENCED_TABLE_NAME,
      rcc.COLUMN_NAME AS REFERENCED_COLUMN_NAME
    FROM ALL_CONSTRAINTS ac
    JOIN ALL_CONS_COLUMNS acc
      ON acc.OWNER = ac.OWNER AND acc.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
    JOIN ALL_CONSTRAINTS rc
      ON rc.OWNER = ac.R_OWNER AND rc.CONSTRAINT_NAME = ac.R_CONSTRAINT_NAME
    JOIN ALL_CONS_COLUMNS rcc
      ON rcc.OWNER = rc.OWNER AND rcc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME AND rcc.POSITION = acc.POSITION
    WHERE ac.OWNER = :1 AND ac.CONSTRAINT_TYPE = 'R'
    ORDER BY ac.CONSTRAINT_NAME`,
      conditions: { binds: [dbSchema.name] },
    });

    rdh.rows.forEach((row) => {
      const tableName = row.values['TABLE_NAME']; // order_detail
      const columnName = row.values['COLUMN_NAME'];
      const referencedTableName = row.values['REFERENCED_TABLE_NAME']; // order
      const referencedColumnName = row.values['REFERENCED_COLUMN_NAME'];
      const constraintName = row.values['CONSTRAINT_NAME'];

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
    return ':';
  }

  getLimitClauseStyle(): LimitClauseStyle {
    return 'fetchFirst';
  }

  getIdQuoteCharacter(): QuoteChar | undefined {
    return '"';
  }

  supportsShowCreate(): boolean {
    return true;
  }

  async getTableDDL({
    tableName,
    schemaName,
  }: {
    tableName: string;
    schemaName?: string;
  }): Promise<string> {
    if (tableName.length === 0) {
      throw new Error('tableName must not be empty');
    }
    const binds = schemaName ? [tableName, schemaName] : [tableName];
    const sql = schemaName
      ? `SELECT DBMS_METADATA.GET_DDL('TABLE', :1, :2) AS DDL FROM DUAL`
      : `SELECT DBMS_METADATA.GET_DDL('TABLE', :1) AS DDL FROM DUAL`;

    const rdb = await this.requestSqlSub({
      sql,
      dbTable: undefined,
      conditions: { binds },
      meta: { type: 'select' },
    });

    if (rdb.rs.rows.length) {
      return rdb.rs.rows[0].values.DDL ?? '';
    }

    return '';
  }

  async closeSub(): Promise<string> {
    try {
      if (this.con) {
        await this.con.close();
        this.con = undefined;
      }
      return '';
    } catch (e) {
      return e.message;
    }
  }

  private getConnectString(): string {
    const { oracle } = this.conRes;
    if (oracle?.connectionType === OracleConnectionType.useConnectString) {
      return oracle.connectString ?? '';
    }
    const host = this.conRes.host || '127.0.0.1';
    const port = this.conRes.port || 1521;
    return `${host}:${port}/${this.conRes.database ?? ''}`;
  }

  private async createConnection(): Promise<oracledb.Connection> {
    return await oracledb.getConnection({
      user: this.conRes.user,
      password: this.conRes.password,
      connectString: this.getConnectString(),
    });
  }
}
