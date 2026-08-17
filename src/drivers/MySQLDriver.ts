import {
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
  parseColumnType,
  toBoolean,
  toNum,
} from '@l-v-yonsama/rdh';
import { EnumValues } from 'enum-values';
import * as mysql from 'mysql2/promise';
import { ResultSetHeader } from 'mysql2/promise';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import {
  ConnectionSetting,
  GeneralResult,
  LimitClauseStyle,
  QueryParams,
  StatementStatisticsParams,
  TransactionIsolationLevel,
} from '../types';
import { MySQLColumnType } from '../types/resource/MySQLColumnType';
import { MySQLPerformanceTuningProvider, PerformanceTuningContextProvider } from './providers';
import { RDSBaseDriver } from './RDSBaseDriver';
import { QuoteChar } from '../helpers';
import {
  getStatementStatisticsOrderByColumn,
  normalizeStatementStatisticsParams,
} from '../utils';

export class MySQLDriver extends RDSBaseDriver {
  private con: mysql.Connection | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async begin(): Promise<void> {
    await this.con?.beginTransaction();
  }

  async commit(): Promise<void> {
    await this.con?.commit();
  }

  async rollback(): Promise<void> {
    await this.con?.rollback();
  }

  async setAutoCommit(value: boolean): Promise<void> {
    await this.con?.execute(`SET AUTOCOMMIT = ${value ? 1 : 0}`);
    // const [rows, _] = await this.con.execute('select @@session.autocommit');
    // if (rows && (rows as any[]).length) {
    //   const result = (rows as any[])[0]['@@session.autocommit'];
    //   console.log('@@session.autocommit = ', result);
    // }
  }

  async getLockWaitTimeout(): Promise<number> {
    const rows = await this.executeOnConnection(
      `SHOW VARIABLES LIKE 'innodb_lock_wait_timeout'`,
    );
    if (rows.length) {
      return toNum(rows[0]['Value']);
    }
    throw new Error('Missing innodb_lock_wait_timeout');
  }

  private async setLockWaitTimeout(ms: number): Promise<void> {
    await this.con?.execute(
      `SET innodb_lock_wait_timeout = ${Math.round(ms / 1000)}`,
    );
  }

  private async setMaxExecutionTime(ms: number): Promise<void> {
    await this.con?.execute(`SET SESSION max_execution_time = ${ms}`);
  }

  async getTransactionIsolationLevel(): Promise<TransactionIsolationLevel> {
    if (!this.con) {
      throw new Error('No connection');
    }
    let sql = '';
    const version = await this.getMajorVersion();
    if (version >= 8) {
      sql = `SELECT @@session.transaction_isolation as isolation_lv`;
    } else {
      sql = `SELECT @@tx_isolation as isolation_lv`;
    }
    const [rows] = await this.con.execute<mysql.RowDataPacket[]>(sql);
    if (rows.length && rows[0]['isolation_lv']) {
      const s = rows[0]['isolation_lv'] as string;
      return s.toUpperCase().replace('-', ' ') as TransactionIsolationLevel;
    }
    throw new Error('Missing transaction_isolation');
  }

  async setTransactionIsolationLevel(
    value: TransactionIsolationLevel,
  ): Promise<void> {
    await this.con?.execute(`SET SESSION TRANSACTION ISOLATION LEVEL ${value}`);
  }

  fieldInfo2Key(
    fieldInfo: mysql.FieldPacket,
    useTableColumnType: boolean,
    table?: DbTable,
  ): RdhKey {
    const mysqlColumnTypename = EnumValues.getNameFromValue(
      MySQLColumnType,
      MySQLColumnType.parseByFieldInfo(fieldInfo),
    );

    const tableColumn = table?.children?.find(
      (it) => it.name === fieldInfo.name,
    );

    const key = createRdhKey({
      name: fieldInfo.name,
      type: parseColumnType(mysqlColumnTypename),
      comment: tableColumn?.comment ?? '',
      required: tableColumn?.nullable === false,
    });

    // Correspondence to ENUM type returned as text type
    if (useTableColumnType && tableColumn) {
      key.type = tableColumn.colType;
    }

    return key;
  }

  async useDatabase(database: string): Promise<void> {
    await this.con.query(`USE \`${database}\``);
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
      if (this.conRes.timezone) {
        // e.g. SET TIME ZONE '+00:00'
        await this.con.query(`SET time_zone = ?`, [this.conRes.timezone]);
      }
      if (this.conRes.queryTimeoutMs !== undefined) {
        await this.setMaxExecutionTime(this.conRes.queryTimeoutMs);
      }
      if (this.conRes.lockWaitTimeoutMs !== undefined) {
        await this.setLockWaitTimeout(this.conRes.lockWaitTimeoutMs);
      }
      if (this.conRes.transactionIsolationLevel) {
        await this.setTransactionIsolationLevel(
          this.conRes.transactionIsolationLevel,
        );
      }
    } catch (e) {
      console.error(e);
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
    let extraCon: mysql.Connection | undefined;
    let message = '';
    try {
      if (!this.con) {
        return message;
      }
      extraCon = await this.createConnection();
      if (sesssionOrPid) {
        await extraCon.query(`KILL ${sesssionOrPid}`);
      } else {
        const { threadId } = this.con;
        await extraCon.query(`KILL ${threadId}`);
      }
    } catch (e) {
      message = e.message;
    }
    if (extraCon) {
      await extraCon.end();
    }
    return message;
  }

  protected getTestSqlStatement(): string {
    return 'SELECT 1';
  }

  async requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const { sql, conditions, dbTable, meta } = params;
    let rdb: ResultSetDataBuilder;

    // if (
    //   sql.trim().match(/set\s+global\s+.+/i) &&
    //   conditions.rawQueries !== true
    // ) {
    //   // This query will crash current node process.
    //   // RangeError [ERR_OUT_OF_RANGE]: The value of "offset" is out of range. It must be >= 0 and <= 9. Received 11
    //   throw new Error(
    //     'Setting global system variables is not supported.\nYou want to run this query, Set raw queries=CHECKED on metadata setting.',
    //   );
    // }

    if (!this.con) {
      throw new Error('No connection');
    }

    const binds = conditions?.binds ?? [];
    const startTime = new Date().getTime();
    // const [rows, fields] = conditions?.rawQueries
    //   ? await this.con.query(sql)
    //   : await this.con.execute(sql, binds);

    const [rows, fields] = await this.con.query(sql, binds);

    const elapsedTimeMilli = new Date().getTime() - startTime;

    if (fields === undefined) {
      // execute...
      // Ok Packet {
      //   fieldCount: 0,
      //   affectedRows: 1,
      //   insertId: 0,
      //   serverStatus: 2,
      //   warningCount: 0,
      //   message: '',
      //   protocol41: true,
      //   changedRows: 0 }
      const results = rows as ResultSetHeader;

      rdb = new ResultSetDataBuilder([
        createRdhKey({ name: 'fieldCount', type: GeneralColumnType.INTEGER }),
        createRdhKey({ name: 'affectedRows', type: GeneralColumnType.INTEGER }),
        createRdhKey({ name: 'insertId', type: GeneralColumnType.INTEGER }),
        createRdhKey({ name: 'serverStatus', type: GeneralColumnType.INTEGER }),
        createRdhKey({
          name: 'warningStatus',
          type: GeneralColumnType.INTEGER,
        }),
        createRdhKey({ name: 'changedRows', type: GeneralColumnType.INTEGER }),
      ]);

      rdb.addRow({
        fieldCount: results.fieldCount,
        affectedRows: results.affectedRows,
        insertId: results.insertId,
        serverStatus: results.serverStatus,
        warningStatus: results.warningStatus,
        changedRows: results.changedRows,
      });

      rdb.setSummary({
        elapsedTimeMilli,
        affectedRows: results.affectedRows,
        insertId: results.insertId,
        changedRows: results.changedRows,
      });
    } else {
      rdb = new ResultSetDataBuilder(
        fields === undefined
          ? []
          : fields.map((f) =>
              this.fieldInfo2Key(f, meta?.editable === true, dbTable),
            ),
      );
      (rows as any).forEach((result: any) => {
        rdb.rs.keys.forEach((key) => {
          const v = result[key.name];
          if (key.type === GeneralColumnType.BIT) {
            result[key.name] = toBoolean(v);
          }
        });
        rdb.addRow(result);
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
    const explainParams = {
      ...params,
      sql: `EXPLAIN ${params.sql}`,
    };

    const rdb = await this.requestSqlSub(explainParams);
    rdb.updateKeyComment('id', 'SELECT identifier');
    rdb.updateKeyComment('select_type', 'SELECT type');
    rdb.updateKeyComment('table', 'table for the output row');
    rdb.updateKeyComment('partitions', 'matching partitions');
    rdb.updateKeyComment('type', 'join type');
    rdb.updateKeyComment('possible_keys', 'possible indexes to choose');
    rdb.updateKeyComment('key', 'index actually chosen');
    rdb.updateKeyComment('key_len', 'length of the chosen key');
    rdb.updateKeyComment('ref', 'columns compared to the index');
    rdb.updateKeyComment('rows', 'Estimate of rows to be examined');
    rdb.updateKeyComment(
      'filtered',
      'Percentage of rows filtered by table condition',
    );
    rdb.updateKeyComment('Extra', 'Additional information');

    return rdb;
  }

  async explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const explainParams = {
      ...params,
      sql: `EXPLAIN ANALYZE ${params.sql}`,
    };

    const rdb = await this.requestSqlSub(explainParams);
    rdb.updateKeyWidth('EXPLAIN', 300);
    rdb.updateKeyAlign('EXPLAIN', 'left');

    return rdb;
  }

  async getVersion(): Promise<string> {
    const sql = 'SELECT VERSION() as version';
    const rdb = await this.requestSqlSub({ sql, dbTable: undefined });
    return rdb.rs.rows[0].values.version;
  }

  private performanceTuningContextProvider?: PerformanceTuningContextProvider;

  // Typed to the interface (not the concrete MySQLPerformanceTuningProvider),
  // same rationale as PostgresDriver's override of this hook: stays
  // override-compatible with RDSBaseDriver's declared return type, and test
  // doubles overriding this hook with a fake Provider remain valid overrides.
  protected getPerformanceTuningContextProvider(): PerformanceTuningContextProvider {
    if (!this.performanceTuningContextProvider) {
      this.performanceTuningContextProvider = new MySQLPerformanceTuningProvider(this);
    }
    return this.performanceTuningContextProvider;
  }

  supportsGetStatementStatistics(): boolean {
    return true;
  }

  async checkStatementStatisticsAvailability(
    // Performance Schema statement digests are server-wide; databaseName is
    // applied by getStatementStatistics() through SCHEMA_NAME.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    databaseName: string,
  ): Promise<GeneralResult<void>> {
    try {
      const status = await this.requestSql({
        sql: 'SELECT @@performance_schema AS performance_schema_enabled',
      });
      const values = status.rows[0]?.values;
      const performanceSchemaEnabled = Number(
        values?.performance_schema_enabled ?? 0,
      );
      if (performanceSchemaEnabled !== 1) {
        return {
          ok: false,
          message:
            'Statement statistics are unavailable. Enable Performance Schema and the statements_digest consumer, then try again.',
        };
      }

      // Probe the exact table used by getStatementStatistics(). Requiring
      // setup_consumers access as well would reject otherwise-valid users
      // that can read digest statistics but not Performance Schema settings.
      await this.requestSql({
        sql: `SELECT DIGEST
FROM performance_schema.events_statements_summary_by_digest
WHERE FALSE`,
      });
      return { ok: true, message: '' };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message:
          'Statement statistics are unavailable. Enable the statements_digest consumer, grant SELECT access to performance_schema.events_statements_summary_by_digest, and try again.' +
          (detail ? ` ${detail}` : ''),
      };
    }
  }

  // Probes whether this server's performance_schema.
  // events_statements_summary_by_digest exposes the sample-text columns
  // added in MySQL 8.0 (misc/design/performance-tuning-query-statistics-
  // parameter-input-plan.ja.md §3.1/§6.4, db-notebook repo). A "WHERE
  // FALSE" probe never touches a row, matching the existing
  // checkStatementStatisticsAvailability() precedent just above. Only an
  // unknown-column error (this server version predates the columns, e.g.
  // MySQL 5.7) is treated as "not supported" and swallowed; any other
  // error (permission, connectivity, ...) propagates so a real problem is
  // never misread as "sample columns unavailable" (§6.4: "権限エラーを
  // sample列非対応と誤認しない").
  private async supportsStatementStatisticsSampleColumns(): Promise<boolean> {
    try {
      await this.requestSql({
        sql: `SELECT QUERY_SAMPLE_TEXT, QUERY_SAMPLE_SEEN
FROM performance_schema.events_statements_summary_by_digest
WHERE FALSE`,
      });
      return true;
    } catch (e) {
      const code = (e as { code?: string } | undefined)?.code;
      if (code === 'ER_BAD_FIELD_ERROR') {
        return false;
      }
      throw e;
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
    const supportsSampleColumns = await this.supportsStatementStatisticsSampleColumns();
    // Optional columns appended after the 15 required ones (never
    // interleaved) so existing name/order-based consumers are unaffected
    // (§11 completion criteria). QUERY_SAMPLE_TEXT is a representative
    // sample for this digest, not necessarily the latest execution - see
    // §3.1 for why the UI must label it "Representative query"/"Sampled
    // at", not "Latest query". The truncation-suspect flag is a heuristic
    // (length reaching the server's configured cap), not a guarantee.
    const sampleColumnsSql = supportsSampleColumns
      ? `,
  QUERY_SAMPLE_TEXT AS query_sample_text,
  QUERY_SAMPLE_SEEN AS query_sample_seen_at,
  (QUERY_SAMPLE_TEXT IS NOT NULL
    AND LENGTH(QUERY_SAMPLE_TEXT) >= @@GLOBAL.performance_schema_max_sql_text_length
  ) AS query_sample_text_may_be_truncated`
      : '';
    const sql = `SELECT
  DIGEST AS statement_id,
  SCHEMA_NAME AS database_name,
  DIGEST_TEXT AS query,
  COUNT_STAR AS execution_count,
  SUM_TIMER_WAIT / 1000000000 AS total_elapsed_time_ms,
  AVG_TIMER_WAIT / 1000000000 AS average_elapsed_time_ms,
  MIN_TIMER_WAIT / 1000000000 AS min_elapsed_time_ms,
  MAX_TIMER_WAIT / 1000000000 AS max_elapsed_time_ms,
  SUM_ROWS_SENT AS rows_processed,
  SUM_ROWS_EXAMINED AS rows_examined,
  NULL AS logical_reads,
  NULL AS physical_reads,
  LAST_SEEN AS last_executed_at,
  FIRST_SEEN AS statistics_since,
  'performance_schema.events_statements_summary_by_digest' AS source${sampleColumnsSql}
FROM performance_schema.events_statements_summary_by_digest
WHERE LOWER(SCHEMA_NAME) = LOWER(?)
  AND DIGEST IS NOT NULL
  AND COUNT_STAR > 0
  AND AVG_TIMER_WAIT / 1000000000 >= ?
  AND DIGEST_TEXT NOT LIKE '%events_statements_summary_by_digest%'
ORDER BY ${orderBy} DESC
LIMIT ${normalized.limit}`;

    return await this.requestSql({
      sql,
      conditions: {
        binds: [
          normalized.databaseName,
          String(normalized.minimumAverageElapsedTimeMs),
        ],
      },
    });
  }

  async getLocks(dbName: string): Promise<ResultSetData> {
    let sql = '';
    const version = await this.getMajorVersion();
    if (version >= 8) {
      sql = `
        SELECT
            t.THREAD_ID AS 'thread_id',
            t.PROCESSLIST_ID AS 'processlist_id',
            t.PROCESSLIST_USER AS 'user',
            t.PROCESSLIST_HOST AS 'host',
            t.PROCESSLIST_DB AS 'db',
            t.PROCESSLIST_COMMAND AS 'command',
            t.PROCESSLIST_TIME AS 'time',
            t.PROCESSLIST_STATE AS 'state',
            t.PROCESSLIST_INFO AS 'query',
            l.OBJECT_SCHEMA AS 'object_schema',
            l.OBJECT_NAME AS 'object_name',
            l.LOCK_TYPE AS 'lock_type',
            l.LOCK_MODE AS 'lock_mode',
            l.LOCK_STATUS AS 'lock_status',
            l.LOCK_DATA AS 'lock_data'
        FROM
            performance_schema.threads t
        JOIN
            performance_schema.data_locks l ON t.THREAD_ID = l.THREAD_ID
        WHERE
            LOWER(t.PROCESSLIST_DB) = LOWER(?);
      `;

      return await this.requestSql({ sql, conditions: { binds: [dbName] } });
    } else {
      sql = `
        SELECT
            r.trx_id,
            r.trx_state,
            r.trx_started,
            r.trx_query AS 'query',
            l.lock_type  ,
            l.lock_mode  ,
            l.lock_table  ,
            l.lock_index,
            l.lock_data
        FROM
            information_schema.innodb_trx r
        JOIN
            information_schema.innodb_locks l ON r.trx_id = l.lock_trx_id;
      `;

      return await this.requestSql({ sql });
    }
  }

  async getSessions(dbName: string): Promise<ResultSetData> {
    const sql = `SELECT 
    ID AS session_id,
    USER AS user,
    HOST AS host,
    DB AS "database",
    COMMAND AS command,
    TIME AS time,
    STATE AS state,
    INFO AS query
FROM 
    information_schema.PROCESSLIST
WHERE LOWER(DB) = LOWER(?) AND ID != CONNECTION_ID()
ORDER BY ID DESC`;

    return await this.requestSql({ sql, conditions: { binds: [dbName] } });
  }

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const dbResources = new Array<RdsDatabase>();
    const dbDatabase = new RdsDatabase(this.conRes.database);
    dbResources.push(dbDatabase);

    const dbSchemas = this.filterSchemas(await this.getSchemas(dbDatabase));
    dbSchemas.forEach((res) => {
      dbDatabase.addChild(res);
    });
    this.resetDefaultSchema(dbDatabase);

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
      sql: `SELECT SCHEMA_NAME AS name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE LOWER(SCHEMA_NAME) NOT IN ('information_schema', 'sys', 'performance_schema')
      ORDER BY name`,
    });

    return rdh.rows.map((r) => {
      const res = new DbSchema(r.values.name);
      return res;
    });
  }

  async getTables(dbSchema: DbSchema): Promise<Array<DbTable>> {
    const rdh = await this.requestSql({
      sql: `SELECT TABLE_NAME as name, CASE TABLE_TYPE
          WHEN 'BASE TABLE' THEN 'TABLE'
          WHEN 'SYSTEM VIEW' THEN 'VIEW'
          ELSE 'TABLE' END  AS table_type,
          TABLE_COMMENT as comment
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = '${dbSchema.name}' `,
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
            TABLE_NAME as tname,
            COLUMN_NAME as name,
            DATA_TYPE as col_type,
            CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as nullable,
            COLUMN_KEY as col_key,
            COLUMN_DEFAULT as col_default,
            EXTRA as col_extra,
            COLUMN_COMMENT as comment
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME,ORDINAL_POSITION`,
      conditions: { binds },
    });

    rdh.rows.forEach((r) => {
      const dbTable = dbSchema.getChildByName(r.values.tname);
      if (dbTable) {
        const type_name = EnumValues.getNameFromValue(
          MySQLColumnType,
          MySQLColumnType.parse(r.values.col_type),
        ) as any;

        const res = new DbColumn(
          r.values.name,
          parseColumnType(type_name),
          {
            nullable: r.values.nullable === 1,
            key: r.values.col_key,
            default: r.values.col_default,
            extra: r.values.col_extra,
          },
          r.values.comment,
        );
        dbTable.addChild(res);
      }
    });
  }

  async setUniqueKeys(dbSchema: DbSchema): Promise<void> {
    const binds = [dbSchema.name.toLowerCase()];

    const rdh = await this.requestSql({
      sql: `select stat.table_name as table_name,
      stat.index_name as index_name,
      group_concat(stat.column_name order by stat.seq_in_index separator ',') as columns
  from information_schema.statistics stat
  join information_schema.table_constraints tco on (stat.table_schema = tco.table_schema
    and stat.table_name = tco.table_name
    and stat.index_name = tco.constraint_name)
  where stat.non_unique = 0
     and LOWER(stat.table_schema) = ?
     and tco.constraint_type='UNIQUE'
  group by stat.table_schema,
        stat.table_name,
        stat.index_name,
        tco.constraint_type
  order by stat.table_name;`,
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

  //  table_name   column_name referenced_table_name referenced_column_name constraint_name
  //  order        customer_no customer              customer_no            order_ibfk_1
  //  order_detail order_no    order                 order_no               order_detail_ibfk_1
  async setForinKeys(dbSchema: DbSchema): Promise<void> {
    const binds = [dbSchema.name.toLowerCase()];

    const rdh = await this.requestSql({
      sql: `SELECT
      usg.table_name as table_name,
      usg.column_name as column_name,
      usg.referenced_table_name as referenced_table_name,
      usg.referenced_column_name as referenced_column_name,
      cst.constraint_name as constraint_name
    FROM information_schema.key_column_usage usg
    LEFT JOIN information_schema.table_constraints cst
      ON ( usg.table_schema = cst.table_schema AND usg.constraint_name = cst.constraint_name )
    WHERE
      cst.constraint_type = 'FOREIGN KEY'
      AND LOWER(usg.constraint_schema) = ?`,
      conditions: { binds },
    });

    rdh.rows.forEach((row) => {
      const tableName = row.values['table_name']; // order_detail
      const columnName = row.values['column_name'];
      const referencedTableName = row.values['referenced_table_name']; // order
      const referencedColumnName = row.values['referenced_column_name'];
      const constraintName = row.values['constraint_name'];

      // FROM order.customer_no -> TO customer.customer_no
      // FROM order_detail.order_no -> TO order.order_no
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

      // TO customer.customer_no <- FROM order.customer_no
      // TO order.order_no <- FROM order_detail.order_no
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
    return false;
  }

  getPositionalCharacter(): string | undefined {
    return undefined;
  }

  getLimitClauseStyle(): LimitClauseStyle {
    return 'trailing';
  }

  getIdQuoteCharacter(): QuoteChar | undefined {
    return '`';
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
    const name = schemaName
      ? `${this.quoteIdentifier(schemaName)}.${this.quoteIdentifier(tableName)}`
      : this.quoteIdentifier(tableName);
    const rows = await this.executeOnConnection(`SHOW CREATE TABLE ${name}`);

    const ddl = rows.length ? (rows[0]['Create Table'] ?? '') : '';
    if (ddl && schemaName) {
      // `SHOW CREATE TABLE` never includes the schema in its output, so
      // qualify it ourselves to match the RDSBaseDriver.getTableDDL contract.
      return ddl.replace(
        /^CREATE TABLE (`(?:[^`]|``)*`)/,
        `CREATE TABLE ${this.quoteIdentifier(schemaName)}.$1`,
      );
    }

    return ddl;
  }

  async closeSub(): Promise<string> {
    try {
      if (this.con) {
        await this.con.end();
        this.con = undefined;
      }
      return '';
    } catch (e) {
      return e.message;
    }
  }

  private async executeOnConnection(
    sql: string,
  ): Promise<mysql.RowDataPacket[]> {
    if (!this.con) {
      throw new Error('No connection');
    }
    const [rows] = await this.con.execute<mysql.RowDataPacket[]>(sql);
    return rows;
  }

  private async createConnection(): Promise<mysql.Connection> {
    const options: mysql.ConnectionOptions = {
      multipleStatements: false, // 複数のSQL文を禁止
      port: this.conRes.port,
      host: this.conRes.host,
      user: this.conRes.user,
      password: this.conRes.password,
      database: this.conRes.database,
    };

    const con = await mysql.createConnection(options);
    if (this.conRes.readOnly) {
      await con.query('SET SESSION TRANSACTION READ ONLY');
    }
    return con;
  }
}
