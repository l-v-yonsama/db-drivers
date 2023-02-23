import BaseDriver, { RequestSqlOptions } from './BaseDriver';
import ResultSetDataHolder, { RdhKey } from '../resource/ResultSetDataHolder';
import {
  DbConnection,
  DbResource,
  DbDatabase,
  DbSchema,
  DbTable,
  DbColumn,
  ColumnResolver,
  TableRows,
  SchemaAndTableHints,
} from '../resource/DbResource';
import { Pool, FieldDef } from 'pg';
import { PostgresColumnType } from '../resource/types/PostgresColumnType';
import { EnumValues } from 'enum-values';
import { GeneralColumnType } from '../resource/types/GeneralColumnType';

export default class PostgresDriver extends BaseDriver {
  private pool: Pool | undefined;

  constructor(conRes: DbConnection) {
    super(conRes);
  }

  //      name: 'name',
  //      tableID: 12822,
  //      columnID: 2,
  //      dataTypeID: 1043,
  //      dataTypeSize: -1,
  //      dataTypeModifier: -1,
  //      format: 'text' }
  fieldInfo2Key(fieldInfo: FieldDef, resolver?: ColumnResolver) {
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
    const key = new RdhKey(
      fieldInfo.name,
      GeneralColumnType.parse(name),
      super.resolveColumnComment(fieldInfo.name, resolver),
    );
    return key;
  }

  async asyncConnectSub(): Promise<string> {
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

    this.pool = new Pool(options);
    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    this.pool.on('error', (err, client) => {
      // log.error('Unexpected error on idle client', err);
    });
    this.pool.on('acquire', function (client) {
      // log.info('acquire', client);
    });
    this.pool.on('connect', function (client) {
      // log.info('connect', client);
    });
    errorReason = await this.asyncTest();

    return errorReason;
  }

  async asyncTest(with_connect = false): Promise<string> {
    let errorReason = '';
    try {
      if (with_connect) {
        errorReason = await this.asyncConnect();
      }
      const rdh = await this.asyncRequestSql('SELECT NOW()');
      if (rdh && rdh.errorMessage) {
        errorReason = rdh.errorMessage;
      }
    } catch (e) {
      errorReason = e.message;
    } finally {
      if (with_connect) {
        await this.asyncClose();
      }
      return errorReason;
    }
  }

  // public
  async asyncRequestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder> {
    // log.info("sql2=", sql);
    let rdh = new ResultSetDataHolder([]);

    try {
      let binds: string[] = [];
      if (options && options.binds) {
        binds = options.binds;
      }
      const results = await this.pool!.query(sql, binds);
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
        let resolver: ColumnResolver;
        if (options && options.needs_column_resolve === true) {
          resolver = this.createColumnResolver(sql);
        }
        const fields = results.fields;
        rdh = new ResultSetDataHolder(
          fields === undefined
            ? []
            : fields.map((f) => this.fieldInfo2Key(f, resolver)),
        );
        if (results.rows) {
          results.rows.forEach((result: any) => {
            rdh.addRow(result);
          });
        }
      }
    } catch (err) {
      rdh = ResultSetDataHolder.create(err);
    }

    return rdh;
  }

  async asyncCountTables(
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
        const results = await this.pool!.query(sql, []);
        if (results && results.rows && results.rows.length > 0) {
          const row = results.rows[0];
          const obj: TableRows = Object.assign({ count: row.count }, st);
          list.push(obj);
        }
      } catch (e) {}
      counter++;
    }
    return list;
  }

  async asyncGetResouces(options: {
    progress_callback?: Function | undefined;
    params?: any;
  }): Promise<Array<DbResource>> {
    if (!this.conRes) {
      return [];
    }
    console.log('L188 asyncGetResouces');
    const dbResources = new Array<DbResource>();
    const db_list = await this.asyncGetDatabases(this.conRes.database);
    console.log('L195 db_list');
    db_list.forEach((db) => console.log('L193!!!!' + db.name));
    db_list.forEach((db) => dbResources.push(db));
    const dbDatabase = db_list.find((d) => d.name === this.conRes.database)!;

    const dbSchemas = await this.asyncGetSchemas(dbDatabase);
    dbSchemas.forEach((res) => {
      dbDatabase.addChild(res);
    });
    // const parallels = [];
    for (const dbSchema of dbSchemas) {
      const dbTables = await this.asyncGetTables(dbSchema);
      dbTables.forEach((res) => dbSchema.addChild(res));
    }
    for (const dbSchema of dbSchemas) {
      for (const dbTable of dbSchema.getChildren()) {
        const dbColumns = await this.asyncGetColumns(<DbTable>dbTable);
        dbColumns.forEach((res) => dbTable.addChild(res));
      }
    }
    return dbResources;
  }

  async asyncGetDatabases(
    connection_database: string,
  ): Promise<Array<DbDatabase>> {
    const rdh = await this
      .asyncRequestSql(`SELECT datname AS name, pg_encoding_to_char(encoding) AS comment
      FROM pg_database ORDER BY datname`);
    return rdh.rows.map((r) => {
      const res = new DbDatabase(r.values.name);
      res.comment = r.values.comment;
      res.disabled = res.name !== connection_database;
      return res;
    });
  }

  async asyncGetSchemas(dbDatabase: DbDatabase): Promise<Array<DbSchema>> {
    const rdh = await this.asyncRequestSql(`SELECT SCHEMA_NAME AS name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE LOWER(SCHEMA_NAME) NOT IN ('information_schema', 'sys', 'performance_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY name`);
    return rdh.rows.map((r) => {
      const res = new DbSchema(r.values.name);
      return res;
    });
  }

  async asyncGetTables(dbSchema: DbSchema): Promise<Array<DbTable>> {
    let rdh = await this
      .asyncRequestSql(`select quote_ident(m.relname) as qname, COALESCE(d.description, '') as comment
      from pg_stat_all_tables as m
      LEFT JOIN pg_description as d ON (m.relid = d.objoid AND d.objsubid=0)
      WHERE m.schemaname='${dbSchema.getName()}'
      ORDER BY m.relname`);

    const list = rdh.rows.map((r) => {
      const res = new DbTable(r.values.qname, 'TABLE', r.values.comment);
      return res;
    });

    rdh = await this
      .asyncRequestSql(`select quote_ident(viewname) as qname, definition from pg_catalog.pg_views 
      where schemaname = '${dbSchema.getName()}' 
      order by viewname`);

    return list.concat(
      rdh.rows.map((r) => {
        const res = new DbTable(r.values.qname, 'VIEW', '');
        return res;
      }),
    );
  }

  async asyncGetColumns(dbTable: DbTable): Promise<Array<DbColumn>> {
    const binds = [dbTable.getParent()!.getName(), dbTable.getName()];
    const rdh = await this.asyncRequestSql(
      `SELECT COLUMN_NAME as name, quote_ident(COLUMN_NAME) as qname,
            data_type as col_type,
            CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as nullable,
            NULL as col_key,
            COLUMN_DEFAULT as col_default,
            NULL as col_extra,
            (select pg_catalog.col_description(oid, INFORMATION_SCHEMA.COLUMNS.ordinal_position::int) from pg_catalog.pg_class c where c.relname=INFORMATION_SCHEMA.COLUMNS.table_name) as comment
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = $1 AND  quote_ident(TABLE_NAME) = $2`,
      { binds },
    );

    return rdh.rows.map((r) => {
      const type_name = EnumValues.getNameFromValue(
        PostgresColumnType,
        PostgresColumnType.parse(r.values.col_type),
      );
      const res = new DbColumn(
        r.values.qname,
        GeneralColumnType.parse(type_name),
        {},
        r.values.comment,
      );
      // {
      //   nullable: rs.nullable === 1,
      //   key: rs.col_key,
      //   default: rs.col_default,
      //   extra: rs.col_extra
      // }
      return res;
    });
  }

  async asyncCloseSub(): Promise<string> {
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
