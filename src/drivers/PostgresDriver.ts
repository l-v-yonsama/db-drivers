/* eslint-disable @typescript-eslint/no-unused-vars */

import { default as pg } from 'pg';
import { EnumValues } from 'enum-values';
import {
  DbColumn,
  DbSchema,
  DbTable,
  RdsDatabase,
  ResultSetDataBuilder,
  SchemaAndTableHints,
  SchemaAndTableName,
  TableRows,
  createRdhKey,
  parseColumnType,
} from '../resource';
import { ConnectionSetting, QueryParams, RdhKey } from '../types';
import { RDSBaseDriver } from './RDSBaseDriver';
import { PostgresColumnType } from '../types/resource/PostgresColumnType';

export class PostgresDriver extends RDSBaseDriver {
  private pool: pg.Pool;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  //      name: 'name',
  //      tableID: 12822,
  //      columnID: 2,
  //      dataTypeID: 1043,
  //      dataTypeSize: -1,
  //      dataTypeModifier: -1,
  //      format: 'text' }
  fieldInfo2Key(fieldInfo: pg.FieldDef, table?: DbTable): RdhKey {
    if (fieldInfo.name.startsWith('c_')) {
      console.log(
        `★ ${fieldInfo.name.substring(2).toUpperCase()} = ${
          fieldInfo.dataTypeID
        }`,
      );
    }
    const name = EnumValues.getNameFromValue(
      PostgresColumnType,
      PostgresColumnType.parse(fieldInfo.dataTypeID),
    );
    let comment = '';
    if (table) {
      comment =
        table.children.find((it) => it.name === fieldInfo.name)?.comment ?? '';
    }
    const key = createRdhKey({
      name: fieldInfo.name,
      type: parseColumnType(name),
      comment,
    });
    return key;
  }

  async connectSub(): Promise<string> {
    let errorReason = '';

    const options = Object.assign(
      {
        port: 5432,
        host: '127.0.0.1',
        database: 'postgres',
      },
      {
        max: 1,
        idleTimeoutMillis: 3000,
        connectionTimeoutMillis: 1000,
        port: this.conRes.port,
        host: this.conRes.host,
        user: this.conRes.user,
        password: this.conRes.password,
        database: this.conRes.database,
      },
    );

    this.pool = new pg.Pool(options);
    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    // this.pool.on('error', (err, client) => {
    //   // log.error('Unexpected error on idle client', err);
    // });
    // this.pool.on('acquire', function (client) {
    //   // log.info('acquire', client);
    // });
    // this.pool.on('connect', function (client) {
    //   // log.info('connect', client);
    // });
    errorReason = await this.test();

    return errorReason;
  }

  protected getTestSqlStatement(): string {
    return 'SELECT NOW()';
  }

  // public
  async requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const { sql, conditions, dbTable } = params;
    // log.info("sql2=", sql);
    let rdb: ResultSetDataBuilder;

    const binds = conditions?.binds ?? [];
    const results = await this.pool.query(sql, binds);
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
          fields.map((f) => this.fieldInfo2Key(f, dbTable)),
        );
        if (results.rows) {
          results.rows.forEach((result: any) => {
            rdb.addRow(result);
          });
        }
      } else {
        rdb = new ResultSetDataBuilder(['Result']);
        rdb.addRow({ Result: 'OK' });
      }
    }

    return rdb;
  }

  async count(params: SchemaAndTableName): Promise<number> {
    let prefix = '';
    if (params.schema) {
      prefix = params.schema + '.';
    }

    const sql = `SELECT COUNT(*) as count FROM ${prefix}${params.table}`;
    const results = await this.pool.query(sql, []);
    if (results && results.rows && results.rows.length > 0) {
      const row = results.rows[0];
      return Number(row.count);
    }
    throw new Error('No records');
  }

  async countTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]> {
    const list = new Array<TableRows>();
    let counter = 1;
    for (const st of tables.list) {
      let prefix = '';
      if (st.schema) {
        prefix = st.schema + '.';
      }
      if (options && options.progress_callback) {
        if (counter % 5 === 0) {
          options.progress_callback(`Count ${prefix}${st.table}`, 70);
        }
      }
      const sql = `SELECT COUNT(*) as count FROM ${prefix}${st.table}`;
      try {
        const results = await this.pool.query(sql, []);
        if (results && results.rows && results.rows.length > 0) {
          const row = results.rows[0];
          const obj: TableRows = Object.assign(
            { count: Number(row.count) },
            st,
          );
          list.push(obj);
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
      counter++;
    }
    return list;
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
    }
    for (const dbSchema of dbSchemas) {
      for (const dbTable of dbSchema.children) {
        const dbColumns = await this.getColumns(dbSchema.name, dbTable);
        dbColumns.forEach((res) => dbTable.addChild(res));
      }
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

  async getColumns(
    schemaName: string,
    dbTable: DbTable,
  ): Promise<Array<DbColumn>> {
    const binds = [schemaName, dbTable.name];
    const rdh = await this.requestSql({
      sql: `select
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
    col.table_schema = $1 AND  quote_ident(col.table_name) = $2
    order by
      col.ordinal_position`,
      conditions: { binds },
    });

    return rdh.rows.map((r) => {
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
      return res;
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

  async closeSub(): Promise<string> {
    try {
      if (this.pool) {
        await this.pool.end();
      }
      return '';
    } catch (e) {
      return e.message;
    }
  }
}
