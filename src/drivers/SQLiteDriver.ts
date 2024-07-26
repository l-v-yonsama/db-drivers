import {
  createRdhKey,
  GeneralColumnType,
  isBinaryLike,
  isTextLike,
  parseColumnType as parseGeneralColumnType,
  RdhKey,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import Sqlite, { type Database } from 'better-sqlite3';
import { parseQuery } from '../helpers';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import { ConnectionSetting, QueryParams } from '../types';
import { RDSBaseDriver } from './RDSBaseDriver';

type SQLiteColumnInfo = {
  name: string;
  column: string;
  table: string;
  database: string;
  type: string;
};

export class SQLiteDriver extends RDSBaseDriver {
  explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder> {
    throw new Error('SQLite does not support explain analyze');
  }
  private db: Database | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async begin(): Promise<void> {
    await this.db.prepare('BEGIN').run();
  }

  async commit(): Promise<void> {
    await this.db.prepare('COMMIT').run();
  }

  async rollback(): Promise<void> {
    await this.db.prepare('ROLLBACK').run();
  }

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
    // https://github.com/kysely-org/kysely/issues/783
    throw new Error(
      'Not supported in SQLiteDriver.\nhttps://github.com/kysely-org/kysely/issues/783',
    );
  }

  protected getTestSqlStatement(): string {
    return 'SELECT 1';
  }

  private fieldInfo2Key(
    fieldInfo: SQLiteColumnInfo,
    useTableColumnType: boolean,
    table?: DbTable,
  ): RdhKey {
    const tableColumn = table?.children?.find(
      (it) => it.name === fieldInfo.name,
    );

    const key = createRdhKey({
      name: fieldInfo.name,
      type: this.parseColumnType(fieldInfo.type),
      comment: tableColumn?.comment ?? '',
      required: tableColumn?.nullable === false,
    });

    // Correspondence to ENUM type returned as text type
    if (useTableColumnType && tableColumn) {
      key.type = tableColumn.colType;
    }

    return key;
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

    const statement = this.db.prepare(sql);
    if (meta?.type === 'select') {
      const results = statement.all(...binds);
      const fields = statement.columns();
      const elapsedTimeMilli = new Date().getTime() - startTime;

      rdb = new ResultSetDataBuilder(
        fields === undefined
          ? []
          : fields.map((f) =>
              this.fieldInfo2Key(f, meta?.editable === true, dbTable),
            ),
      );
      results.forEach((result: any) => {
        rdb.addRow(result);
      });

      rdb.setSummary({
        elapsedTimeMilli,
        selectedRows: rdb.rs.rows.length,
      });
    } else {
      const { changes, lastInsertRowid } = statement.run(...binds);
      const elapsedTimeMilli = new Date().getTime() - startTime;
      rdb = new ResultSetDataBuilder([
        createRdhKey({ name: 'affectedRows', type: GeneralColumnType.INTEGER }),
        createRdhKey({ name: 'insertId', type: GeneralColumnType.INTEGER }),
      ]);

      rdb.addRow({
        affectedRows: changes,
        insertId: lastInsertRowid,
      });

      rdb.setSummary({
        elapsedTimeMilli,
        affectedRows: changes,
        insertId: lastInsertRowid as number,
      });
    }

    return rdb;
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
    this.db
      .prepare(
        `
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
      )
      .all()
      .forEach(
        (it: {
          tableName: string;
          colName: string;
          colType: string;
          colIsPk: number;
          colDefaultVal: any;
          colIsNotNull: number;
          sql: string;
        }) => {
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
        },
      );

    await this.setForinKeys(defaultSchema);
    await this.setUniqueKeys(defaultSchema);
    return dbResources;
  }

  private async setForinKeys(dbSchema: DbSchema): Promise<void> {
    this.db
      .prepare(
        `
    SELECT 
        m.tbl_name as table_name,
        p.[from] as column_name,
        p.[table] as referenced_table_name,
        p.[to] as referenced_column_name
    FROM sqlite_master AS m,
        pragma_foreign_key_list(m.name) AS p ON m.name != p."table"
        `,
      )
      .all()
      .forEach(
        (it: {
          table_name: string;
          column_name: string;
          referenced_table_name: string;
          referenced_column_name: string;
        }) => {
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
        },
      );
  }

  private async setUniqueKeys(dbSchema: DbSchema): Promise<void> {
    this.db
      .prepare(
        `
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
      )
      .all()
      .forEach(
        (it: { tableName: string; keyName: string; columnNames: string }) => {
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
        },
      );
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
        return GeneralColumnType.DATE;
      case 'datetime':
        return GeneralColumnType.TIMESTAMP;
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
    this.db = new Sqlite(database);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = true');
  }
}
