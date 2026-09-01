/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
  parseColumnType,
  toNum,
} from '@l-v-yonsama/rdh';
import { EnumValues } from 'enum-values';
import { PoolConfig, default as pg } from 'pg';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import {
  ConnectionSetting,
  GeneralResult,
  LimitClauseStyle,
  QueryParams,
  StatementStatisticsParams,
  TransactionIsolationLevel,
} from '../types';
import { PostgresColumnType } from '../types/resource/PostgresColumnType';
import {
  PerformanceTuningContextProvider,
  PostgresRdbDashboardProvider,
  PostgresPerformanceTuningProvider,
  RdbDashboardProvider,
} from './providers';
import { RDSBaseDriver } from './RDSBaseDriver';
import { QuoteChar } from '../helpers';
import {
  getStatementStatisticsOrderByColumn,
  normalizeStatementStatisticsParams,
} from '../utils';

/** Convert driver-specific class instances (e.g. `PostgresInterval`, which `pg` returns for INTERVAL columns) into plain, rdh-safe values. */
function normalizePostgresValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizePostgresValue(item));
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    !Buffer.isBuffer(value) &&
    typeof (value as { toPostgres?: unknown }).toPostgres === 'function'
  ) {
    return (value as { toPostgres(): string }).toPostgres();
  }
  return value;
}

function normalizePostgresRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  Object.entries(row).forEach(([key, value]) => {
    normalized[key] = normalizePostgresValue(value);
  });
  return normalized;
}

export class PostgresDriver extends RDSBaseDriver {
  private pool: pg.Pool;
  private client: pg.PoolClient;
  private pid: number | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async begin(): Promise<void> {
    const { transactionIsolationLevel } = this.conRes;
    if (transactionIsolationLevel) {
      await this.client.query(
        `BEGIN TRANSACTION ISOLATION LEVEL ${transactionIsolationLevel}`,
      );
    } else {
      await this.client.query('BEGIN');
    }
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.client.query('ROLLBACK');
  }

  async setAutoCommit(value: boolean): Promise<void> {
    // set autocommit = ON; -->> do nothing.
  }

  async getLockWaitTimeout(): Promise<number> {
    const { rows } = await this.client.query('show lock_timeout');
    if (rows.length) {
      const s = rows[0]['lock_timeout'] as string;
      if (s.endsWith('ms')) {
        return toNum(s.substring(0, s.length - 2));
      } else if (s.endsWith('s')) {
        return toNum(s.substring(0, s.length - 1)) * 1000;
      }
      if (s.match(/^[0-9]+$/)) {
        return toNum(s);
      }
      throw new Error('Unknown format ' + s);
    }
    throw new Error('Missing lock_wait_timeout');
  }

  private async setLockWaitTimeout(ms: number): Promise<void> {
    await this.client.query(`SET lock_timeout = '${ms}ms'`);
  }

  async getTransactionIsolationLevel(): Promise<TransactionIsolationLevel> {
    const { rows } = await this.client.query(
      `SHOW TRANSACTION ISOLATION LEVEL`,
    );
    if (rows.length && rows[0]['transaction_isolation']) {
      const s = rows[0]['transaction_isolation'] as string;
      return s.toUpperCase().replace('-', ' ') as TransactionIsolationLevel;
    }
    throw new Error('Missing transaction_isolation');
  }

  fieldInfo2Key(
    fieldInfo: pg.FieldDef,
    useTableColumnType: boolean,
    table?: DbTable,
  ): RdhKey {
    const name = EnumValues.getNameFromValue(
      PostgresColumnType,
      PostgresColumnType.parse(fieldInfo.dataTypeID),
    );
    const tableColumn = table?.children?.find(
      (it) => it.name === fieldInfo.name,
    );

    const key = createRdhKey({
      name: fieldInfo.name,
      type: parseColumnType(name),
      comment: tableColumn?.comment ?? '',
      required: tableColumn?.nullable === false,
    });

    // Correspondence to ENUM type returned as text type
    if (
      (useTableColumnType || key.type === GeneralColumnType.UNKNOWN) &&
      tableColumn
    ) {
      key.type = tableColumn.colType;
    }

    return key;
  }

  async useDatabase(database: string): Promise<void> {
    console.log(`Ignore "USE DATABASE(${database})"`);
  }

  async connectWithTest(): Promise<string> {
    let errorReason = '';

    this.pool = this.createPool();
    this.client = await this.pool.connect();
    const pidResult = await this.client.query('SELECT pg_backend_pid() AS pid');
    this.pid = pidResult.rows[0].pid;
    try {
      errorReason = await this.test();
    } catch (e) {
      errorReason = e.message;
    }

    try {
      if (this.conRes.timezone) {
        // e.g. SET TIME ZONE 'UTC'
        await this.client.query(`SET TIME ZONE '${this.conRes.timezone}'`);
      }
      if (this.conRes.lockWaitTimeoutMs) {
        await this.setLockWaitTimeout(this.conRes.lockWaitTimeoutMs);
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
   * @param sesssionOrPid
   */
  async kill(sesssionOrPid?: number): Promise<string> {
    let extraPool: pg.Pool | undefined;
    let message = '';
    try {
      if (sesssionOrPid) {
        extraPool = this.createPool();
        await extraPool.query('SELECT pg_cancel_backend($1)', [sesssionOrPid]);
      } else {
        if (this.pid === undefined) {
          return message;
        }
        extraPool = this.createPool();
        await extraPool.query('SELECT pg_cancel_backend($1)', [this.pid]);
      }
    } catch (e) {
      message = e.message;
    }
    if (extraPool) {
      await extraPool.end();
    }
    return message;
  }

  protected getTestSqlStatement(): string {
    return 'SELECT NOW()';
  }

  // public
  async requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const { sql, conditions, dbTable, meta } = params;
    // log.info("sql2=", sql);
    let rdb: ResultSetDataBuilder;

    const binds = conditions?.binds ?? [];
    const startTime = new Date().getTime();
    const results = await this.client.query(sql, binds);
    const elapsedTimeMilli = new Date().getTime() - startTime;
    if (results) {
      const fields = results.fields;
      if (fields?.length) {
        rdb = new ResultSetDataBuilder(
          fields.map((f) =>
            this.fieldInfo2Key(f, meta?.editable === true, dbTable),
          ),
        );
        if (results.rows) {
          results.rows.forEach((result: any) => {
            rdb.addRow(normalizePostgresRow(result));
          });
        }

        rdb.setSummary({
          elapsedTimeMilli,
          selectedRows: rdb.rs.rows.length,
        });
      } else {
        rdb = new ResultSetDataBuilder([
          createRdhKey({
            name: 'affectedRows',
            type: GeneralColumnType.INTEGER,
          }),
        ]);
        rdb.addRow({ affectedRows: results.rowCount });

        rdb.setSummary({
          elapsedTimeMilli,
          affectedRows: results.rowCount,
        });
      }
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

    return await this.requestSqlSub(explainParams);
  }

  async explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const explainParams = {
      ...params,
      sql: `EXPLAIN ANALYZE ${params.sql}`,
    };

    const rdb = await this.requestSqlSub(explainParams);
    rdb.updateKeyName('QUERY PLAN', 'EXPLAIN');
    rdb.updateKeyWidth('EXPLAIN', 300);
    rdb.updateKeyAlign('EXPLAIN', 'left');

    return rdb;
  }

  async getVersion(): Promise<string> {
    // `SHOW` is a command, not a SELECT - it doesn't accept `AS alias` (`SHOW server_version AS version` is a syntax error).
    const sql = 'SHOW server_version';
    const rdb = await this.requestSqlSub({ sql, dbTable: undefined });
    return rdb.rs.rows[0].values.server_version;
  }

  private performanceTuningContextProvider?: PerformanceTuningContextProvider;
  private rdbDashboardProvider?: RdbDashboardProvider;

  protected getRdbDashboardProvider(): RdbDashboardProvider {
    if (!this.rdbDashboardProvider) {
      this.rdbDashboardProvider = new PostgresRdbDashboardProvider(this);
    }
    return this.rdbDashboardProvider;
  }

  protected getPerformanceTuningContextProvider(): PerformanceTuningContextProvider {
    // Lazily constructed and cached on the driver instance (not a module singleton) so it always closes over this connection's `requestSql`, and a second call doesn't re-allocate for no reason.
    if (!this.performanceTuningContextProvider) {
      this.performanceTuningContextProvider = new PostgresPerformanceTuningProvider(this);
    }
    return this.performanceTuningContextProvider;
  }

  supportsGetStatementStatistics(): boolean {
    return true;
  }

  async checkStatementStatisticsAvailability(
    // PostgreSQL is already connected to a single database; the probe checks
    // the extension view in that current database.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    databaseName: string,
  ): Promise<GeneralResult<void>> {
    try {
      await this.requestSql({
        sql: 'SELECT queryid FROM pg_stat_statements WHERE FALSE',
      });
      return { ok: true, message: '' };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message:
          'Statement statistics are unavailable. Install and preload pg_stat_statements, grant SELECT access, and try again.' +
          (detail ? ` ${detail}` : ''),
      };
    }
  }

  async getStatementStatistics(
    params: StatementStatisticsParams,
  ): Promise<ResultSetData> {
    const normalized = normalizeStatementStatisticsParams(params);
    const orderBy = getStatementStatisticsOrderByColumn(normalized.sortBy);
    const majorVersion = await this.getMajorVersion();
    const totalTime = majorVersion >= 13 ? 'total_exec_time' : 'total_time';
    const meanTime = majorVersion >= 13 ? 'mean_exec_time' : 'mean_time';
    const minTime = majorVersion >= 13 ? 'min_exec_time' : 'min_time';
    const maxTime = majorVersion >= 13 ? 'max_exec_time' : 'max_time';
    const sql = `SELECT
  queryid::text AS statement_id,
  current_database() AS database_name,
  query,
  calls AS execution_count,
  ${totalTime} AS total_elapsed_time_ms,
  ${meanTime} AS average_elapsed_time_ms,
  ${minTime} AS min_elapsed_time_ms,
  ${maxTime} AS max_elapsed_time_ms,
  rows AS rows_processed,
  NULL::bigint AS rows_examined,
  (shared_blks_hit + shared_blks_read) AS logical_reads,
  shared_blks_read AS physical_reads,
  NULL::timestamptz AS last_executed_at,
  NULL::timestamptz AS statistics_since,
  'pg_stat_statements' AS source
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE LOWER(datname) = LOWER($1))
  AND calls > 0
  AND ${meanTime} >= $2
  AND query NOT ILIKE '%pg_stat_statements%'
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
    const sql = `SELECT
    A.pid,
    A.application_name AS "app",
    A.usename AS "user",
    A.client_addr,
    A.state,
    A.query,
    A.datname AS "database",
    C.relname AS "object_name",
    L.locktype AS "lock_type",
    L.mode AS "lock_mode",
    L.granted
FROM pg_stat_activity A
INNER JOIN pg_locks L ON A.pid = L.pid
LEFT join pg_class C ON L.relation = C.oid
WHERE L.pid <> pg_backend_pid()  -- このクエリ実行自体は対象外
AND ( LOWER(A.datname) = LOWER($1) OR A.datname IS NULL)
`;

    return await this.requestSql({ sql, conditions: { binds: [dbName] } });
  }

  async getSessions(dbName: string): Promise<ResultSetData> {
    const sql = `SELECT 
    A.pid,
    A.datname AS "database",
    A.application_name AS "app",
    A.usename AS "user",
    A.client_addr,
    A.state,
    backend_start AS start_time,
    A.query
    FROM pg_stat_activity A
WHERE A.pid <> pg_backend_pid()  -- このクエリ実行自体は対象外
AND ( LOWER(A.datname) = LOWER($1) OR A.datname IS NULL)
ORDER BY A.pid DESC
`;

    return await this.requestSql({ sql, conditions: { binds: [dbName] } });
  }

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const dbResources = new Array<RdsDatabase>();
    const db_list = await this.asyncGetDatabases(this.conRes.database);
    db_list.forEach((db) => dbResources.push(db));
    const dbDatabase = db_list.find((d) => d.name === this.conRes.database);

    const dbSchemas = this.filterSchemas(await this.getSchemas(dbDatabase));
    dbSchemas.forEach((res) => {
      dbDatabase.addChild(res);
    });
    this.resetDefaultSchema(dbDatabase);
    // const parallels = [];
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

  async asyncGetDatabases(
    connectionDatabase: string,
  ): Promise<Array<RdsDatabase>> {
    const rdh = await this.requestSql({
      sql: `SELECT datname AS name, pg_encoding_to_char(encoding) AS comment
      FROM pg_database
      WHERE LOWER(datname) = '${connectionDatabase.toLowerCase()}'
      ORDER BY datname`,
    });
    const list = rdh.rows.map((r) => {
      const res = new RdsDatabase(r.values.name);
      res.comment = r.values.comment;
      res.capabilities = {
        ...(res.capabilities ?? {}),
        dashboards: [
          ...(res.capabilities?.dashboards ?? []),
          {
            dashboardId: 'rdb-database',
            providerId: 'rdb.postgres.database',
            variant: 'postgres',
            hints: { databaseName: String(r.values.name) },
          },
        ],
      };
      return res;
    });
    return list;
  }

  async getSchemas(dbDatabase: RdsDatabase): Promise<Array<DbSchema>> {
    const rdh = await this.requestSql({
      sql: `SELECT SCHEMA_NAME AS name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE LOWER(SCHEMA_NAME) NOT IN ('information_schema', 'sys', 'performance_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY name`,
    });

    return rdh.rows.map((r) => {
      const res = new DbSchema(r.values.name);
      return res;
    });
  }

  async getTables(dbSchema: DbSchema): Promise<Array<DbTable>> {
    let rdh = await this.requestSql({
      sql: `select quote_ident(m.relname) as qname, COALESCE(d.description, '') as comment
      from pg_stat_all_tables as m
      LEFT JOIN pg_description as d ON (m.relid = d.objoid AND d.objsubid=0)
      WHERE m.schemaname='${dbSchema.name}'
      ORDER BY m.relname`,
    });

    const list = rdh.rows.map((r) => {
      const res = new DbTable(r.values.qname, 'TABLE', r.values.comment);
      return res;
    });

    rdh = await this.requestSql({
      sql: `select quote_ident(viewname) as qname, definition from pg_catalog.pg_views
      where schemaname = '${dbSchema.name}'
      order by viewname`,
    });

    return list.concat(
      rdh.rows.map((r) => {
        const res = new DbTable(r.values.qname, 'VIEW', '');
        return res;
      }),
    );
  }

  async setColumns(dbSchema: DbSchema): Promise<void> {
    const binds = [dbSchema.name];
    const rdh = await this.requestSql({
      sql: `select
      col.table_name as tname,
      quote_ident(col.table_name) as qtname,
      col.COLUMN_NAME as name,
      quote_ident(col.COLUMN_NAME) as qname,
      data_type as col_type,
      case
        when IS_NULLABLE = 'YES' then 1
        else 0
      end as nullable,
      case
        when pk.column_name is not null then 'PRI'
        else null
      end as col_key,
      COLUMN_DEFAULT as col_default,
      null as col_extra,
      (
	    select
    		pg_catalog.col_description(c.oid,
	    	col.ordinal_position::int)
    	from
    		pg_catalog.pg_class c
	    inner join pg_catalog.pg_namespace n on
	    	c.relnamespace = n.oid
	    where
	    	c.relname = col.table_name
	    	and n.nspname = col.table_schema) as comment
    from
      INFORMATION_SCHEMA.columns col
    left join (
      select
        tc.table_catalog,
        tc.table_schema,
        tc.table_name,
        ccu.column_name
      from
        information_schema.table_constraints tc
      inner join
        information_schema.constraint_column_usage ccu
        on
        (tc.table_catalog = ccu.table_catalog
          and
      tc.table_schema = ccu.table_schema
          and
      tc.table_name = ccu.table_name
          and
      tc.constraint_name = ccu.constraint_name)
      where
        tc.constraint_type = 'PRIMARY KEY'
    ) pk on
      (col.table_catalog = pk.table_catalog
        and col.table_schema = pk.table_schema
        and col.table_name = pk.table_name
        and col.column_name = pk.column_name)
    where
    col.table_schema = $1
    order by
      tname,
      col.ordinal_position`,
      conditions: { binds },
    });

    rdh.rows.forEach((r) => {
      const dbTable = dbSchema.getChildByName(r.values.qtname);
      if (dbTable) {
        const type_name = EnumValues.getNameFromValue(
          PostgresColumnType,
          PostgresColumnType.parse(r.values.col_type),
        );
        const res = new DbColumn(
          r.values.qname,
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
      sql: `SELECT
      t.relname AS table_name
     ,i.relname AS index_name
     ,array_to_string( array_agg( a.attname ), ',') AS columns
 FROM
      pg_class AS t
     ,pg_class AS i
     ,pg_index AS ix
     ,pg_attribute AS a
     ,pg_tables AS ta
 WHERE
         t.oid = ix.indrelid
     AND i.oid = ix.indexrelid
     AND ix.indisprimary = false
     AND ix.indisunique = true
     AND a.attrelid = t.oid
     AND a.attnum = ANY( ix.indkey )
     AND t.relkind = 'r'
     AND t.relname = ta.tablename
     AND LOWER(ta.schemaname) = $1
 GROUP BY
      t.relname
     ,i.relname
     ,ix.indisprimary
     ,ix.indisunique
 ORDER BY
      t.relname
     ,i.relname`,
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

  async setForinKeys(dbSchema: DbSchema): Promise<void> {
    const binds = [dbSchema.name.toLowerCase()];

    const rdh = await this.requestSql({
      sql: `select
      c.conname as constraint_name,
      t.relname as table_name,
      pg_get_constraintdef(c.oid) as add_constraint_ddl
      from pg_constraint c
      inner join pg_class t on c.conrelid = t.oid
      inner join pg_namespace n on c.connamespace = n.oid
      where c.contype = 'f'
      and LOWER(n.nspname)=$1
      order by conname`,
      conditions: { binds },
    });

    rdh.rows.forEach((row) => {
      const tableName = row.values['table_name']; // order_detail
      const constraintName = row.values['constraint_name'];
      // FOREIGN KEY (order_no) REFERENCES order1(order_no)
      const constraintDDL = row.values['add_constraint_ddl'];

      const regexp = /FOREIGN\s+KEY\s+\((\S+)\)\s+REFERENCES\s+(\S+)\((\S+)\)/i;
      const r = regexp.exec(constraintDDL);
      if (r) {
        const columnName = r[1];
        const referencedTableName = r[2];
        const referencedColumnName = r[3];

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
      }
    });
  }

  isPositionedParameterAvailable(): boolean {
    return true;
  }

  getPositionalCharacter(): string | undefined {
    return '$';
  }

  getLimitClauseStyle(): LimitClauseStyle {
    return 'trailing';
  }

  getIdQuoteCharacter(): QuoteChar | undefined {
    return '"';
  }

  async closeSub(): Promise<string> {
    try {
      if (this.client) {
        this.client.release();
        this.pid = undefined;
        this.client = undefined;
      }

      if (this.pool) {
        await this.pool.end();
        this.pool = undefined;
      }
      return '';
    } catch (e) {
      return e.message;
    }
  }

  private createPool(): pg.Pool {
    const options: PoolConfig = Object.assign(
      {
        port: 5432,
        host: '127.0.0.1',
        database: 'postgres',
      },
      {
        max: 1,
        idleTimeoutMillis: 3000,
        connectionTimeoutMillis: 3000,
        port: this.conRes.port,
        host: this.conRes.host,
        user: this.conRes.user,
        password: this.conRes.password,
        database: this.conRes.database,
      },
    );

    if (this.conRes.queryTimeoutMs) {
      // https://github.com/brianc/node-postgres/issues/3219 options.query_timeout = this.conRes.queryTimeoutMs;
      options.statement_timeout = this.conRes.queryTimeoutMs;
    }

    if (this.conRes.ssl?.use) {
      options.ssl = {
        rejectUnauthorized: false,
      };
    }

    if (this.conRes.readOnly) {
      options.options = '-c default_transaction_read_only=on';
    }

    return new pg.Pool(options);
  }
}
