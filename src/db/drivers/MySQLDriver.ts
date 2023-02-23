import BaseDriver, { RequestSqlOptions } from './BaseDriver';
import * as mysql from 'mysql2/promise';
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
import { MySQLColumnType } from '../resource/types/MySQLColumnType';
import { EnumValues } from 'enum-values';
import { GeneralColumnType } from '../resource/types/GeneralColumnType';
import { ResultSetHeader } from 'mysql2/promise';

export default class MySQLDriver extends BaseDriver {
  private client: mysql.Pool | undefined;

  constructor(conRes: DbConnection) {
    super(conRes);
  }

  fieldInfo2Key(fieldInfo, resolver?: ColumnResolver): RdhKey {
    if (resolver) {
      resolver.hints.list.push({ table: fieldInfo.orgTable });
    }
    const name = EnumValues.getNameFromValue(
      MySQLColumnType,
      MySQLColumnType.parseByFieldInfo(fieldInfo),
    );
    const key = new RdhKey(
      fieldInfo.name,
      GeneralColumnType.parse(name),
      super.resolveColumnComment(fieldInfo.orgName, resolver),
    );
    if (key.type === GeneralColumnType.UNKNOWN) {
      // log.error(LOG_PREFIX, 'Unknownt=', fieldInfo)
    }
    // console.log('key=', key, EnumValues.getNameFromValue(GeneralColumnType, key.type));
    return key;
  }

  async asyncConnectSub(): Promise<string> {
    let errorMessage = '';
    const options = {
      connectionLimit: 4,
      multipleStatements: true,
      port: this.conRes.port,
      host: this.conRes.host,
      user: this.conRes.user,
      password: this.conRes.password,
      database: this.conRes.database,
    };
    this.client = mysql.createPool(options);
    try {
      errorMessage = await this.asyncTest();
    } catch (e) {
      errorMessage = e.message;
    }
    return errorMessage;
  }

  async asyncTest(with_connect = false): Promise<string> {
    let errorReason = '';
    if (with_connect) {
      errorReason = await this.asyncConnect();
    }
    if (!errorReason) {
      const rdh = await this.asyncRequestSql('SELECT 1 from DUAL');
      if (rdh && rdh.errorMessage) {
        return rdh.errorMessage;
      }
      if (with_connect) {
        await this.asyncClose();
      }
    }
    return errorReason;
  }

  // public
  async asyncRequestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder> {
    // console.log('asyncRequestSql', sql);
    let rdh = new ResultSetDataHolder([]);

    if (this.client) {
      let binds: string[] = [];
      if (options && options.binds) {
        binds = options.binds;
      }
      let resolver: ColumnResolver;
      if (options && options.needs_column_resolve === true) {
        resolver = this.createColumnResolver(sql);
      }

      const [rows, fields] = await this.client.execute(sql, binds);
      try {
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

          rdh = new ResultSetDataHolder([
            'fieldCount',
            'affectedRows',
            'insertId',
            'serverStatus',
            'warningStatus',
            'changedRows',
          ]);
          rdh.addRow({
            fieldCount: results.fieldCount,
            affectedRows: results.affectedRows,
            insertId: results.insertId,
            serverStatus: results.serverStatus,
            warningStatus: results.warningStatus,
            changedRows: results.changedRows,
          });
        } else {
          rdh = new ResultSetDataHolder(
            fields === undefined
              ? []
              : fields.map((f) => this.fieldInfo2Key(f, resolver)),
          );
          (rows as any).forEach((result: any) => {
            rdh.addRow(result);
          });
        }
      } catch (err) {
        rdh = ResultSetDataHolder.create(err);
      }
    } else {
      new Error('No connection');
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
        const [results] = await this.client!.query(sql, []);
        if (results && (results as any).length > 0) {
          const row = results[0];
          const obj: TableRows = Object.assign({ count: row.count }, st);
          list.push(obj);
        }
      } catch (e) {
        console.error(e);
      }
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
    const dbResources = new Array<DbResource>();
    const dbDatabase = new DbDatabase(this.conRes.database);
    dbResources.push(dbDatabase);
    let progress = 10;
    if (options.progress_callback) {
      options.progress_callback(
        `${dbResources.length} Databases found.`,
        progress,
      );
    }

    const dbSchemas = await this.asyncGetSchemas(dbDatabase);
    dbSchemas.forEach((res) => {
      dbDatabase.addChild(res);
    });
    progress = 30;
    if (options.progress_callback) {
      options.progress_callback(`${dbSchemas.length} Schemas found.`, progress);
    }

    // const parallels = [];
    const incrPerSchema = Math.round(20 / dbSchemas.length);
    for (const dbSchema of dbSchemas) {
      const dbTables = await this.asyncGetTables(dbSchema);
      dbTables.forEach((res) => dbSchema.addChild(res));
      if (options.progress_callback) {
        progress += incrPerSchema;
        options.progress_callback(
          `${dbTables.length} Tables found in Schema[${dbSchema.getName()}].`,
          progress,
        );
      }
    }
    for (const dbSchema of dbSchemas) {
      if (options.progress_callback) {
        progress += incrPerSchema;
        options.progress_callback(
          `Commnets finding now... in Schema[${dbSchema.getName()}].`,
          progress,
        );
      }
      for (const dbTable of dbSchema.getChildren()) {
        const dbColumns = await this.asyncGetColumns(<DbTable>dbTable);
        dbColumns.forEach((res: DbColumn) => dbTable.addChild(res));
      }
    }
    return dbResources;
  }

  async asyncGetSchemas(dbDatabase: DbDatabase): Promise<Array<DbSchema>> {
    const rdh = await this.asyncRequestSql(`SELECT SCHEMA_NAME AS name
      FROM INFORMATION_SCHEMA.SCHEMATA
      WHERE LOWER(SCHEMA_NAME) NOT IN ('information_schema', 'sys', 'performance_schema')
      ORDER BY name`);
    return rdh.rows.map((r) => {
      const res = new DbSchema(r.values.name);
      return res;
    });
  }

  async asyncGetTables(dbSchema: DbSchema): Promise<Array<DbTable>> {
    const rdh = await this
      .asyncRequestSql(`SELECT TABLE_NAME as name, CASE TABLE_TYPE
          WHEN 'BASE TABLE' THEN 'TABLE'
          WHEN 'SYSTEM VIEW' THEN 'VIEW'
          ELSE 'TABLE' END  AS table_type,
          TABLE_COMMENT as comment
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = '${dbSchema.getName()}' `);

    return rdh.rows.map((r) => {
      const res = new DbTable(
        r.values.name,
        r.values.table_type,
        r.values.comment,
      );
      return res;
    });
  }

  async asyncGetColumns(dbTable: DbTable): Promise<Array<DbColumn>> {
    const binds = [dbTable.getParent()!.getName(), dbTable.getName()];
    const rdh = await this.asyncRequestSql(
      `SELECT COLUMN_NAME as name,
            DATA_TYPE as col_type,
            CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as nullable,
            COLUMN_KEY as col_key,
            COLUMN_DEFAULT as col_default,
            EXTRA as col_extra,
            COLUMN_COMMENT as comment
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND  TABLE_NAME = ?`,
      { binds },
    );

    console.log(rdh.toString(rdh.rows.length));
    return rdh.rows.map((r) => {
      const type_name = EnumValues.getNameFromValue(
        MySQLColumnType,
        MySQLColumnType.parse(r.values.col_type),
      );
      const res = new DbColumn(
        r.values.name,
        GeneralColumnType.parse(type_name),
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

  async asyncCloseSub(): Promise<string> {
    try {
      if (this.client) {
        await this.client.end();
      }
      return '';
    } catch (e) {
      return e.message;
    }
  }
}
