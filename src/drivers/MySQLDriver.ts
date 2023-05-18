import * as mysql from 'mysql2/promise';
import { EnumValues } from 'enum-values';
import { ResultSetHeader } from 'mysql2/promise';
import {
  DbColumn,
  DbSchema,
  DbTable,
  RdhKey,
  RdsDatabase,
  ResultSetDataHolder,
  SchemaAndTableHints,
  TableRows,
  createRdhKey,
  parseColumnType,
} from '../resource';
import { ConnectionSetting, GeneralColumnType, QueryParams } from '../types';
import { RDSBaseDriver } from './RDSBaseDriver';
import { MySQLColumnType } from '../types/resource/MySQLColumnType';
import { toBoolean } from '../util';

export class MySQLDriver extends RDSBaseDriver {
  private client: mysql.Pool | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  fieldInfo2Key(fieldInfo, table?: DbTable): RdhKey {
    const name = EnumValues.getNameFromValue(
      MySQLColumnType,
      MySQLColumnType.parseByFieldInfo(fieldInfo),
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
    if (key.type === GeneralColumnType.UNKNOWN) {
      // log.error(LOG_PREFIX, 'Unknownt=', fieldInfo)
    }
    // console.log('key=', key, EnumValues.getNameFromValue(GeneralColumnType, key.type));
    return key;
  }

  async connectSub(): Promise<string> {
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
      errorMessage = await this.test();
    } catch (e) {
      errorMessage = e.message;
    }
    return errorMessage;
  }

  protected getTestSqlStatement(): string {
    return 'SELECT 1';
  }

  async requestSql(params: QueryParams): Promise<ResultSetDataHolder> {
    const { sql, conditions } = params;
    let rdh = new ResultSetDataHolder([]);

    const ast = this.parseQuery(sql);

    const astTableName = this.getTableName(ast);
    const dbTable = this.getDbTable(astTableName);

    if (this.client) {
      const binds = conditions?.binds ?? [];
      const [rows, fields] = await this.client.execute(sql, binds);

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
            : fields.map((f) => this.fieldInfo2Key(f, dbTable)),
        );
        (rows as any).forEach((result: any) => {
          rdh.keys.forEach((key) => {
            const v = result[key.name];
            if (key.type === GeneralColumnType.BIT) {
              result[key.name] = toBoolean(v);
            }
          });
          rdh.addRow(result);
        });
      }
    } else {
      new Error('No connection');
    }
    this.setRdhMetaAndStatement(params, rdh, ast?.type, astTableName, dbTable);

    return rdh;
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
        const [results] = await this.client.query(sql, []);
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

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const dbResources = new Array<RdsDatabase>();
    const dbDatabase = new RdsDatabase(this.conRes.database);
    dbResources.push(dbDatabase);

    const dbSchemas = await this.getSchemas(dbDatabase);
    dbSchemas.forEach((res) => {
      dbDatabase.addChild(res);
    });
    this.resetDefaultSchema(dbDatabase);

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

  async getColumns(
    schemaName: string,
    dbTable: DbTable,
  ): Promise<Array<DbColumn>> {
    const binds = [schemaName, dbTable.name];
    const rdh = await this.requestSql({
      sql: `SELECT COLUMN_NAME as name,
            DATA_TYPE as col_type,
            CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as nullable,
            COLUMN_KEY as col_key,
            COLUMN_DEFAULT as col_default,
            EXTRA as col_extra,
            COLUMN_COMMENT as comment
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND  TABLE_NAME = ?`,
      conditions: { binds },
    });

    return rdh.rows.map((r) => {
      const type_name = EnumValues.getNameFromValue(
        MySQLColumnType,
        MySQLColumnType.parse(r.values.col_type),
      );
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
      return res;
    });
  }

  isPositionedParameterAvailable(): boolean {
    return false;
  }

  async closeSub(): Promise<string> {
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
