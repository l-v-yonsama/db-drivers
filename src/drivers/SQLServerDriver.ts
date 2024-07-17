import {
  createRdhKey,
  GeneralColumnType,
  parseColumnType,
  RdhKey,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import { EnumValues } from 'enum-values';
import mssql, {
  config,
  connect,
  ConnectionPool,
  Request,
  Transaction,
} from 'mssql';

import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import {
  ConnectionSetting,
  QueryParams,
  ResultColumn,
  SQLServerColumnType,
} from '../types';
import { RDSBaseDriver } from './RDSBaseDriver';

type MSSql = typeof mssql;

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

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async begin(): Promise<void> {
    this.tran = this.con.transaction();
    await this.tran.begin();
  }

  async commit(): Promise<void> {
    try {
      await this.tran?.commit();
    } finally {
      this.tran = undefined;
    }
  }

  async rollback(): Promise<void> {
    try {
      await this.tran?.rollback();
    } finally {
      this.tran = undefined;
    }
    this.tran = undefined;
  }

  async setAutoCommit(value: boolean): Promise<void> {
    // do nothing.
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
      // if (this.conRes.timezone) {
      //   // e.g. SET TIME ZONE '+00:00'
      //   await this.con.query(`SET time_zone = ?`, [this.conRes.timezone]);
      // }
    } catch (e) {
      errorMessage = e.message;
    }
    return errorMessage;
  }

  async kill(): Promise<string> {
    let message = '';
    try {
      if (!this.con && !this.req) {
        return message;
      }
      this.req.cancel();
    } catch (e) {
      message = e.message;
    } finally {
      this.req = undefined;
    }

    return message;
  }

  protected getTestSqlStatement(): string {
    return "SELECT name as test_result FROM sys.databases WHERE name='master'";
  }

  async requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
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
    const req = this.con.request();
    await req.batch(`SET SHOWPLAN_ALL ON`);

    try {
      const binds = params.conditions?.binds ?? [];
      binds.forEach((bind, idx) => {
        this.req.input(`${idx + 1}`, bind);
      });

      const result = await req.query(params.sql);
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
    throw new Error('SQL Server does not support explain analyze');
  }

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const st = new Date().getTime();
    const dbResources = new Array<RdsDatabase>();
    const dbDatabase = new RdsDatabase(this.conRes.database);
    dbResources.push(dbDatabase);

    const currentSchemaName = await this.getCurrentSchema();
    if (this.conRes.sqlServer?.onlyDefaultSchema === true) {
      const schemaRes = new DbSchema(currentSchemaName);
      dbDatabase.addChild(schemaRes);
    } else {
      const dbSchemas = await this.getSchemas(dbDatabase);
      dbSchemas.forEach((res) => {
        dbDatabase.addChild(res);
      });
    }

    this.resetDefaultSchema(dbDatabase, currentSchemaName);

    for (const dbSchema of dbDatabase.children) {
      const dbTables = await this.getTables(dbSchema);
      dbTables.forEach((res) => dbSchema.addChild(res));
      await this.setColumns(dbSchema);
    }

    const defaultSchema = dbDatabase.getSchema({ isDefault: true });
    await this.setForinKeys(defaultSchema);
    await this.setUniqueKeys(defaultSchema);
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
      WHERE s.name = '${dbSchema.name}'
    ) s ON (m.TABLE_SCHEMA=s.schema_name AND m.TABLE_NAME = s.table_name)
    WHERE m.TABLE_SCHEMA = '${dbSchema.name}'`,
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
          AND schema_name(so.schema_id) = '${dbSchema.name}'  
      ) s ON (m.TABLE_SCHEMA = s.schema_name AND m.TABLE_NAME = s.table_name AND m.COLUMN_NAME = s.column_name)
      WHERE
        m.TABLE_SCHEMA = '${dbSchema.name}'  
      ORDER BY
        m.ORDINAL_POSITION`,
    });

    const constraint = await this.requestSql({
      sql: `SELECT  T.TABLE_NAME as tname, C.COLUMN_NAME as name,T.CONSTRAINT_TYPE as ctype
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS T
    JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE C ON C.CONSTRAINT_NAME=T.CONSTRAINT_NAME
    WHERE
      T.TABLE_SCHEMA = '${dbSchema.name}' AND T.CONSTRAINT_TYPE IN ('PRIMARY KEY','UNIQUE')`,
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
    const rdh = await this.requestSql({
      sql: `SELECT T.TABLE_NAME as table_name, STRING_AGG( CONVERT(VARCHAR(max), C.COLUMN_NAME), ',') AS columns, T.CONSTRAINT_NAME as index_name 
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS T
      JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE C ON C.CONSTRAINT_NAME=T.CONSTRAINT_NAME
      WHERE
        LOWER(T.TABLE_SCHEMA)='${dbSchema.name.toLowerCase()}'
        AND T.CONSTRAINT_TYPE = 'UNIQUE'
      GROUP BY T.TABLE_NAME, T.CONSTRAINT_NAME `,
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

  //  table_name   column_name referenced_table_name referenced_column_name constraint_name
  //  order        customer_no customer              customer_no            order_ibfk_1
  //  order_detail order_no    order                 order_no               order_detail_ibfk_1
  async setForinKeys(dbSchema: DbSchema): Promise<void> {
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
      AND LOWER(C.CONSTRAINT_SCHEMA) = '${dbSchema.name.toLowerCase()}'`,
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
    return true;
  }

  getPositionalCharacter(): string | undefined {
    return '@';
  }

  isLimitAsTop(): boolean {
    return true;
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
    } finally {
      this.tran = undefined;
      this.req = undefined;
    }
  }

  private async createConnection(): Promise<ConnectionPool> {
    const options: config = {
      port: this.conRes.port,
      server: this.conRes.host,
      user: this.conRes.user,
      password: this.conRes.password,
      database: this.conRes.database,
      pool: {
        min: 1,
        max: 1,
      },
      options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: this.conRes.sqlServer?.encrypt ?? false,
        // database: 'your_database'  //update me
      },
    };

    let con: ConnectionPool;
    if (this.conRes.sqlServer?.windowsAuthentication) {
      // https://learn.microsoft.com/ja-jp/sql/connect/odbc/linux-mac/install-microsoft-odbc-driver-sql-server-macos?view=sql-server-ver16
      // Set to true if using Windows Authentication
      options.options.trustedConnection = true;
      // Set to true if using self-signed certificates
      options.options.trustServerCertificate = true;

      // Required if using Windows Authentication
      options.driver = 'msnodesqlv8';

      // The normal mssql lib doesn't work on Windows and even importing this
      // mssql/msnodesqlv8 library on MacOS will fail. So we have to conditionally
      // import it.
      const _mssqlV8 = (await import('mssql/msnodesqlv8.js').then(
        (m) => m.default,
      )) as MSSql;
      con = await _mssqlV8.connect(options);
    } else {
      con = await connect(options);
    }

    this.tran = undefined;
    this.req = undefined;
    return con;
  }
}
