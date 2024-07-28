import {
  createRdhKey,
  GeneralColumnType,
  isBinaryLike,
  isTextLike,
  parseColumnType as parseGeneralColumnType,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import Sqlite, { Statement, type Database } from 'sqlite3';
import { parseQuery } from '../helpers';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import { ConnectionSetting, QueryParams } from '../types';
import { RDSBaseDriver } from './RDSBaseDriver';

type RunResult = {
  changes: number;
  lastInsertRowid: number;
};

export class SQLiteDriver extends RDSBaseDriver {
  explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    throw new Error('SQLite does not support explain analyze');
  }
  private db: Database | undefined;
  private statement: Statement | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async begin(): Promise<void> {
    await this.runWithFinalyze('BEGIN');
  }

  async commit(): Promise<void> {
    await this.runWithFinalyze('COMMIT');
  }

  async rollback(): Promise<void> {
    await this.runWithFinalyze('ROLLBACK');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  async setAutoCommit(value: boolean): Promise<void> {}

  async connectWithTest(): Promise<string> {
    let errorMessage = '';
    await this.createConnection();
    try {
      errorMessage = await this.test();
    } catch (e) {
      errorMessage = e.message;
    }
    return errorMessage;
  }

  async kill(): Promise<string> {
    try {
      this.db?.interrupt();
      return '';
    } catch (e) {
      if (e instanceof Error) {
        return e.message;
      }
      return e + '';
    }
  }

  protected getTestSqlStatement(): string {
    return 'SELECT 1';
  }

  private fieldInfo2Key(
    name: string,
    v: any,
    useTableColumnType: boolean,
    table?: DbTable,
  ): GeneralColumnType {
    const tableColumn = table?.children?.find((it) => it.name === name);

    // Correspondence to ENUM type returned as text type
    if (useTableColumnType && tableColumn) {
      return tableColumn.colType;
    }

    if (v instanceof Buffer) {
      return GeneralColumnType.BLOB;
    } else if (typeof v === 'number') {
      if (Number.isInteger(v)) {
        return GeneralColumnType.INTEGER;
      }
      return GeneralColumnType.REAL;
    } else if (typeof v === 'string') {
      return GeneralColumnType.TEXT;
    }
    return GeneralColumnType.UNKNOWN;
  }

  async requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const { sql, conditions, dbTable, meta } = params;
    let rdb: ResultSetDataBuilder;

    if (!this.db) {
      throw new Error('No database');
    }

    const binds = conditions?.binds ?? [];
    const startTime = new Date().getTime();

    if (meta?.type === 'select') {
      const statement = await this.createStatement(sql, binds);
      return new Promise((resolve, reject) => {
        try {
          statement.all((err, rows) => {
            statement.finalize();
            if (err) {
              reject(err);
              return;
            }

            const elapsedTimeMilli = new Date().getTime() - startTime;
            const fields = Object.keys(rows[0]);
            const fieldTypeMap = new Map<string, GeneralColumnType>();
            rdb = new ResultSetDataBuilder(fields.map((it) => '' + it));
            rows.forEach((row, idx) => {
              if (fields.length !== fieldTypeMap.size && idx < 30) {
                fields
                  .filter((f) => !fieldTypeMap.has(f))
                  .forEach((it) => {
                    const v = row[it];
                    if (v !== null && v !== undefined) {
                      fieldTypeMap.set(
                        it,
                        this.fieldInfo2Key(
                          it,
                          v,
                          meta?.editable === true,
                          dbTable,
                        ),
                      );
                    }
                  });
              }
              rdb.addRow(row);
            });
            fieldTypeMap.forEach((type, name) => {
              rdb.updateKeyType(name, type);
            });
            rdb.setSummary({
              elapsedTimeMilli,
              selectedRows: rdb.rs.rows.length,
            });
            resolve(rdb);
          });
        } catch (e) {
          reject(e);
        }
      });
    } else {
      const r = await this.runWithFinalyze(sql, binds);
      const elapsedTimeMilli = new Date().getTime() - startTime;
      rdb = new ResultSetDataBuilder([
        createRdhKey({
          name: 'affectedRows',
          type: GeneralColumnType.INTEGER,
        }),
        createRdhKey({ name: 'insertId', type: GeneralColumnType.INTEGER }),
      ]);
      rdb.addRow({
        affectedRows: r.changes,
        insertId: r.lastInsertRowid,
      });
      rdb.setSummary({
        elapsedTimeMilli,
        affectedRows: r.changes,
        insertId: r.lastInsertRowid,
      });
      return rdb;
    }
  }

  async explainSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    const ast = parseQuery(params.sql);
    const explainParams = {
      ...params,
      sql: `EXPLAIN QUERY PLAN ${params.sql}`,
    };
    if (ast?.ast?.type) {
      if (!explainParams.meta) {
        explainParams.meta = {};
      }
      explainParams.meta.type = ast?.ast?.type;
    }

    const rdb = await this.requestSqlSub(explainParams);

    return rdb;
  }

  async getInfomationSchemasSub(): Promise<Array<RdsDatabase>> {
    const dbResources = new Array<RdsDatabase>();
    const dbDatabase = new RdsDatabase(this.conRes.database);
    dbResources.push(dbDatabase);

    const defaultSchema = new DbSchema('Default');
    defaultSchema.isDefault = true;
    dbDatabase.addChild(defaultSchema);

    let beforeTableRes: DbTable | undefined = undefined;
    const tableRs = await this.requestSql({
      sql: `
  SELECT
    m.name AS tableName,
    p.name AS colName,
    p.type AS colType,
    p.pk AS colIsPk,
    p.dflt_value AS colDefaultVal,
    p.[notnull] AS colIsNotNull,
    m.sql
  FROM sqlite_master m
  LEFT OUTER JOIN pragma_table_info((m.name)) p
    ON m.name <> p.name
  WHERE m.type = 'table'
  ORDER BY m.name, p.cid`,
    });

    tableRs.rows.forEach((row) => {
      const { values: it } = row;
      if (
        beforeTableRes === undefined ||
        beforeTableRes.name !== it.tableName
      ) {
        beforeTableRes = new DbTable(it.tableName, 'TABLE');
        defaultSchema.addChild(beforeTableRes);
      }
      const colType = this.parseColumnType(it.colType);
      const nullable = it.colIsNotNull === 0;
      const key = it.colIsPk > 0 ? 'PRI' : '';
      let extra = '';
      if (
        it.colIsPk === 1 &&
        colType === GeneralColumnType.INTEGER &&
        it.sql.toLocaleLowerCase().includes('autoincrement')
      ) {
        extra = 'auto_increment';
      }
      const colRes = new DbColumn(it.colName, colType, {
        nullable,
        key,
        default: it.colDefaultVal,
        extra,
      });
      beforeTableRes.addChild(colRes);
    });

    await this.setForinKeys(defaultSchema);
    await this.setUniqueKeys(defaultSchema);
    return dbResources;
  }

  private async setForinKeys(dbSchema: DbSchema): Promise<void> {
    const rdh = await this.requestSql({
      sql: `
    SELECT
        m.tbl_name as table_name,
        p.[from] as column_name,
        p.[table] as referenced_table_name,
        p.[to] as referenced_column_name
    FROM sqlite_master AS m
    INNER JOIN pragma_foreign_key_list(m.name) AS p ON m.name != p."table"
        `,
    });

    rdh.rows.forEach((row) => {
      const { values: it } = row;
      const tableName = it['table_name']; // order_detail
      const columnName = it['column_name'];
      const referencedTableName = it['referenced_table_name']; // order
      const referencedColumnName = it['referenced_column_name'];
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
            constraintName: '',
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
            constraintName: '',
          };
        }
      }
    });
  }

  private async setUniqueKeys(dbSchema: DbSchema): Promise<void> {
    const rdh = await this.requestSql({
      sql: `
      SELECT
          m.tbl_name as tableName,
          il.name as keyName,
          group_concat(ii.name) as columnNames
      FROM sqlite_master AS m,
          pragma_index_list(m.name) AS il,
          pragma_index_info(il.name) AS ii
      WHERE
          m.type = 'table'
          AND il.origin='u'
      GROUP by m.tbl_name,il.name
      ORDER BY m.tbl_name,il.name
          `,
    });

    rdh.rows.forEach((row) => {
      const { values: it } = row;
      const tableRes = dbSchema.getChildByName(it.tableName);
      if (tableRes) {
        if (tableRes.uniqueKeys === undefined) {
          tableRes.uniqueKeys = [];
        }
        const constraint = {
          name: it.keyName,
          columns: it.columnNames.split(','),
        };
        tableRes.uniqueKeys.push(constraint);
        constraint.columns.forEach((columnName) => {
          const colRes = tableRes.getChildByName(columnName);
          if (colRes) {
            (colRes as any)['uniqKey'] = true;
          }
        });
      }
    });
  }

  private parseColumnType(typeString: string): GeneralColumnType {
    if (typeString == null || typeString === '') {
      return GeneralColumnType.UNKNOWN;
    }
    switch (typeString.toLocaleLowerCase()) {
      case 'blob':
        return GeneralColumnType.BLOB;
      case 'text':
        return GeneralColumnType.TEXT;
      case 'date':
        return GeneralColumnType.TEXT;
      case 'datetime':
        return GeneralColumnType.TEXT;
      case 'real':
        return GeneralColumnType.REAL;
      case 'integer':
        return GeneralColumnType.INTEGER;
    }

    // varchar(128) -> varchar
    const typeString2 = parseGeneralColumnType(
      typeString.replace(/\([0-9.,]+\)/, ''),
    );
    if (isTextLike(typeString2)) {
      return GeneralColumnType.TEXT;
    }
    if (isBinaryLike(typeString2)) {
      return GeneralColumnType.BLOB;
    }

    return GeneralColumnType.UNKNOWN;
  }

  isPositionedParameterAvailable(): boolean {
    return false;
  }

  getPositionalCharacter(): string | undefined {
    return undefined;
  }

  isLimitAsTop(): boolean {
    return false;
  }

  isSchemaSpecificationSvailable(): boolean {
    return false;
  }

  async closeSub(): Promise<string> {
    try {
      if (this.db) {
        await this.db.close();
        this.db = undefined;
      }
      return '';
    } catch (e) {
      return e.message;
    }
  }

  private async createConnection(): Promise<void> {
    const { database } = this.conRes;
    this.db = new (Sqlite.verbose().Database)(database);
    this.db.configure('busyTimeout', 2000);

    await this.pragma('journal_mode = WAL');
    await this.pragma('foreign_keys = true');
  }

  private async pragma(query: string): Promise<void> {
    await this.runWithFinalyze(`PRAGMA ${query}`);
  }

  private async runWithFinalyze(
    query: string,
    binds?: any[],
  ): Promise<RunResult> {
    const statement = await this.createStatement(query, binds);
    return new Promise<RunResult>((resolve, reject) => {
      statement.run(function (err) {
        const { changes, lastInsertRowid } = this;
        statement.finalize();
        if (err) {
          reject(err);
        } else {
          resolve({ changes, lastInsertRowid });
        }
      });
    });
  }

  private async createStatement(
    sql: string,
    binds?: any[],
  ): Promise<Statement> {
    return new Promise<Statement>((resolve, reject) => {
      const statement = this.db.prepare(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          if (binds) {
            statement.bind(...binds);
          }
          resolve(statement);
        }
      });
    });
  }
}
