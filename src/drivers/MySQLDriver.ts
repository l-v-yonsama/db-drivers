import * as mysql from 'mysql2/promise';
import { EnumValues } from 'enum-values';
import { ResultSetHeader } from 'mysql2/promise';
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
import {
  ConnectionSetting,
  GeneralColumnType,
  QueryParams,
  RdhKey,
} from '../types';
import { RDSBaseDriver } from './RDSBaseDriver';
import { MySQLColumnType } from '../types/resource/MySQLColumnType';
import { toBoolean } from '../util';
import { table } from 'console';

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

  fieldInfo2Key(
    fieldInfo,
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
    });

    // Correspondence to ENUM type returned as text type
    if (useTableColumnType && tableColumn) {
      key.type = tableColumn.colType;
    }
    key.required = tableColumn?.nullable === false;
    //  if (key.type === GeneralColumnType.UNKNOWN) {
    //   console.log('Unknownt=', fieldInfo);
    // }

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
    return errorMessage;
  }

  async kill(): Promise<string> {
    let extraCon: mysql.Connection | undefined;
    let message = '';
    try {
      if (!this.con) {
        return message;
      }
      const { threadId } = this.con;
      extraCon = await this.createConnection();
      await extraCon.query(`KILL ${threadId}`);
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

    if (sql.trim().match(/set\s+global\s+.+/i)) {
      // This query will crash current node process.
      // RangeError [ERR_OUT_OF_RANGE]: The value of "offset" is out of range. It must be >= 0 and <= 9. Received 11
      throw new Error('Setting global system variables is not supported');
    }

    if (!this.con) {
      throw new Error('No connection');
    }

    const binds = conditions?.binds ?? [];
    const startTime = new Date().getTime();
    const [rows, fields] = await this.con.execute(sql, binds);
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
        'fieldCount',
        'affectedRows',
        'insertId',
        'serverStatus',
        'warningStatus',
        'changedRows',
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

  async count(params: SchemaAndTableName): Promise<number> {
    let prefix = '';
    if (params.schema) {
      prefix = params.schema + '.';
    }

    const sql = `SELECT COUNT(*) as count FROM ${prefix}${params.table}`;
    const [results] = await this.con.query(sql, []);
    if (results && (results as any).length > 0) {
      const row = results[0];
      return row.count;
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
        const [results] = await this.con.query(sql, []);
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
    const defaultSchema = dbDatabase.getSchema({ isDefault: true });
    await this.setForinKeys(defaultSchema);
    await this.setUniqueKeys(defaultSchema);
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

  private async createConnection(): Promise<mysql.Connection> {
    const options: mysql.ConnectionOptions = {
      multipleStatements: true,
      port: this.conRes.port,
      host: this.conRes.host,
      user: this.conRes.user,
      password: this.conRes.password,
      database: this.conRes.database,
    };
    return await mysql.createConnection(options);
  }
}
