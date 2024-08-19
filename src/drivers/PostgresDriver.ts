/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
  parseColumnType,
} from '@l-v-yonsama/rdh';
import { EnumValues } from 'enum-values';
import { PoolConfig, default as pg } from 'pg';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import { ConnectionSetting, QueryParams } from '../types';
import { PostgresColumnType } from '../types/resource/PostgresColumnType';
import { RDSBaseDriver } from './RDSBaseDriver';

export class PostgresDriver extends RDSBaseDriver {
  private pool: pg.Pool;
  private client: pg.PoolClient;
  private pid: number | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async begin(): Promise<void> {
    await this.client.query('BEGIN');
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.client.query('ROLLBACK');
  }

  async setAutoCommit(value: boolean): Promise<void> {
    // set autocommit = ON;  -->> do nothing.
    // set autocommit = OFF;  -->> use flowTransaction.
    // see. https://node-postgres.com/features/transactions
  }

  //      name: 'name',
  //      tableID: 12822,
  //      columnID: 2,
  //      dataTypeID: 1043,
  //      dataTypeSize: -1,
  //      dataTypeModifier: -1,
  //      format: 'text' }
  fieldInfo2Key(
    fieldInfo: pg.FieldDef,
    useTableColumnType: boolean,
    table?: DbTable,
  ): RdhKey {
    // if (fieldInfo.name.startsWith('c_')) {
    //   console.log(
    //     `★ ${fieldInfo.name.substring(2).toUpperCase()} = ${
    //       fieldInfo.dataTypeID
    //     }`,
    //   );
    // }
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
    } catch (e) {
      console.error(e);
      errorReason = e.message;
    }

    return errorReason;
  }

  async kill(): Promise<string> {
    let extraPool: pg.Pool | undefined;
    let message = '';
    try {
      if (this.pid === undefined) {
        return message;
      }
      extraPool = this.createPool();
      await extraPool.query('SELECT pg_cancel_backend($1)', [this.pid]);
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
    // console.log(results);
    // command: 'SELECT',
    // rowCount: 5,
    // oid: null,
    // rows:
    //  [ anonymous { name: 'pg_catalog' },
    //    anonymous { name: 'pg_temp_1' },
    //    anonymous { name: 'pg_toast' },
    //    anonymous { name: 'pg_toast_temp_1' },
    //    anonymous { name: 'public' } ],
    // fields: [  ],
    // console.log('done.', results.fields)
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
            rdb.addRow(result);
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

  async getLocks(): Promise<ResultSetData> {
    const sql = `SELECT
    A.pid,
    A.application_name AS "app",
    A.usename AS "user",
    A.client_addr,
    A.state,
    A.query,
    C.relname AS "object_name",
    L.locktype AS "lock_type",
    L.mode AS "lock_mode",
    L.granted
FROM pg_stat_activity A
INNER JOIN pg_locks L ON A.pid = L.pid
LEFT join pg_class C ON L.relation = C.oid
WHERE L.pid <> pg_backend_pid()  -- このクエリ実行自体は対象外
`;

    return await this.requestSql({ sql });
  }

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const dbResources = new Array<RdsDatabase>();
    const db_list = await this.asyncGetDatabases(this.conRes.database);
    db_list.forEach((db) => dbResources.push(db));
    const dbDatabase = db_list.find((d) => d.name === this.conRes.database);

    const dbSchemas = await this.getSchemas(dbDatabase);
    dbSchemas.forEach((res) => {
      dbDatabase.addChild(res);
    });
    this.resetDefaultSchema(dbDatabase);
    // const parallels = [];
    for (const dbSchema of dbSchemas) {
      const dbTables = await this.getTables(dbSchema);
      dbTables.forEach((res) => dbSchema.addChild(res));
      await this.setColumns(dbSchema);
    }
    const defaultSchema = dbDatabase.getSchema({ isDefault: true });
    await this.setForinKeys(defaultSchema);
    await this.setUniqueKeys(defaultSchema);

    return dbResources;
  }

  async asyncGetDatabases(
    connectionDatabase: string,
  ): Promise<Array<RdsDatabase>> {
    const rdh = await this.requestSql({
      sql: `SELECT datname AS name, pg_encoding_to_char(encoding) AS comment
      FROM pg_database ORDER BY datname`,
    });
    const list = rdh.rows.map((r) => {
      const res = new RdsDatabase(r.values.name);
      res.comment = r.values.comment;
      return res;
    });
    const idx = list.findIndex(
      (it) => it.name.toUpperCase() == connectionDatabase.toUpperCase(),
    );
    if (idx > 0) {
      const arr = list.splice(idx, 1);
      list.unshift(arr[0]);
    }
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
        pg_catalog.col_description(oid,
        col.ordinal_position::int)
      from
        pg_catalog.pg_class c
      where
        c.relname = col.table_name) as comment
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
      }
    });
  }

  isPositionedParameterAvailable(): boolean {
    return true;
  }

  getPositionalCharacter(): string | undefined {
    return '$';
  }

  isLimitAsTop(): boolean {
    return false;
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

    if (this.conRes.ssl?.use) {
      options.ssl = {
        rejectUnauthorized: false,
      };
    }

    return new pg.Pool(options);
  }
}
