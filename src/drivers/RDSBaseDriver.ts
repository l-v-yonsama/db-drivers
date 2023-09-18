import { BaseDriver } from './BaseDriver';
import {
  DbTable,
  RdsDatabase,
  ResultSetDataBuilder,
  SchemaAndTableHints,
  SchemaAndTableName,
  TableRows,
} from '../resource';
import { Statement } from 'pgsql-ast-parser';
import {
  ConnectionSetting,
  GeneralResult,
  QStatement,
  QueryParams,
  ResourceType,
  ResultSetData,
  TransactionControlType,
} from '../types';
import { parseQuery } from '../helpers';
import { toNum } from '../util';

export abstract class RDSBaseDriver extends BaseDriver<RdsDatabase> {
  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  protected abstract getTestSqlStatement(): string;

  abstract kill(): Promise<string>;

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    if (with_connect) {
      errorReason = await this.connect();
    }
    if (!errorReason) {
      try {
        await this.requestSql({ sql: this.getTestSqlStatement() });
      } catch (e) {
        errorReason = e.message;
      }
      if (with_connect) {
        await this.disconnect();
      }
    }
    return errorReason;
  }

  abstract countTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]>;

  abstract count(params: SchemaAndTableName): Promise<number>;

  abstract isPositionedParameterAvailable(): boolean;

  protected getRdsDatabase(): RdsDatabase | undefined {
    const db = this.getDbDatabase();
    if (db instanceof RdsDatabase) {
      return db;
    }
    return undefined;
  }

  async requestSql(params: QueryParams): Promise<ResultSetData> {
    const { sql } = params;
    const ast = parseQuery(sql);
    const dbTable = this.getDbTable(ast);

    const rdb = await this.requestSqlSub({
      ...params,
      dbTable,
    });
    this.setRdhMetaAndStatement(params, rdb, ast?.ast?.type, ast, dbTable);

    return rdb.build();
  }

  async countSql(params: QueryParams): Promise<number | undefined> {
    const rdb = await this.requestSql(params);
    if (rdb.rows.length > 0) {
      const v = rdb.rows[0].values[rdb.keys[0].name];
      return toNum(v);
    }
    return undefined;
  }

  abstract requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  async explainSql(params: QueryParams): Promise<ResultSetData> {
    const { sql } = params;
    const ast = parseQuery(sql);
    const dbTable = this.getDbTable(ast);

    const rdb = await this.explainSqlSub({
      ...params,
      dbTable,
    });
    this.setRdhMetaAndStatement(params, rdb, 'explain' as any, ast, dbTable);
    rdb.rs.meta.compareKeys = undefined; // update

    return rdb.build();
  }

  abstract explainSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  async explainAnalyzeSql(params: QueryParams): Promise<ResultSetData> {
    const { sql } = params;
    const ast = parseQuery(sql);
    const dbTable = this.getDbTable(ast);

    const rdb = await this.explainAnalyzeSqlSub({
      ...params,
      dbTable,
    });
    this.setRdhMetaAndStatement(params, rdb, 'analyze' as any, ast, dbTable);
    rdb.rs.meta.compareKeys = undefined; // update

    return rdb.build();
  }

  abstract explainAnalyzeSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  private getDbTable(qst?: QStatement): DbTable | undefined {
    const db = this.getRdsDatabase();
    if (qst === undefined || qst.names === undefined || db === undefined) {
      return undefined;
    }

    if (qst.names.schemaName) {
      const schema = db.children.find(
        (it) =>
          it.name.toLocaleLowerCase() ===
          qst.names.schemaName.toLocaleLowerCase(),
      );
      if (schema) {
        return schema.children.find(
          (it) =>
            it.name.toLocaleLowerCase() ===
            qst.names.tableName.toLocaleLowerCase(),
        );
      }
    }

    for (const schema of db.children) {
      const table = schema.children.find(
        (it) =>
          it.name.toLocaleLowerCase() ===
          qst.names.tableName.toLocaleLowerCase(),
      );
      if (table) {
        return table;
      }
    }

    return undefined;
  }

  setRdhMetaAndStatement(
    params: QueryParams,
    rdb: ResultSetDataBuilder,
    type: Statement['type'],
    qst: QStatement,
    dbTable?: DbTable,
  ): void {
    const { sql, conditions, meta } = params;
    rdb.setSqlStatement(sql);
    const connectionName = this.conRes.name;
    let schemaName = meta?.schemaName;
    let tableName = meta?.tableName;
    const comment = meta?.comment ?? dbTable?.comment;
    let compareKeys = meta?.compareKeys;

    if (!schemaName) {
      schemaName = qst?.names?.schemaName;
    }
    if (!tableName) {
      tableName = qst?.names?.tableName;
    }

    if (!rdb.rs.meta.compareKeys && !compareKeys) {
      if (dbTable) {
        compareKeys = dbTable.getCompareKeys();
      }
    }
    rdb.updateMeta({
      connectionName,
      comment,
      schemaName,
      tableName,
      compareKeys,
      type,
      editable: meta?.editable,
    });
    rdb.rs.queryConditions = conditions;
  }

  resetDefaultSchema(database: RdsDatabase): void {
    const searchNames = [];
    if (this.conRes.database) {
      searchNames.push(this.conRes.database);
    }
    if (this.conRes.user) {
      searchNames.push(this.conRes.user);
    }
    searchNames.push('public');

    for (const searchName of searchNames) {
      const idx = database.children.findIndex((it) => it.name == searchName);
      if (idx >= 0) {
        database.children[idx].isDefault = true;
        const [defaultSchema] = database.children.splice(idx, 1);
        database.children.unshift(defaultSchema);
        return;
      }
    }

    if (database.children.length) {
      database.children[0].isDefault = true;
    }
  }

  abstract begin(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
  abstract setAutoCommit(value: boolean): Promise<void>;
  abstract connectWithTest(): Promise<string>;

  async connectSub(autoCommit = true): Promise<string> {
    let errorMessage = await this.connectWithTest();

    try {
      if (!errorMessage) {
        await this.setAutoCommit(autoCommit);
      }
    } catch (e) {
      errorMessage = e.message;
    }
    return errorMessage;
  }

  async flowTransaction<T = any>(
    f: (driver: this) => Promise<T>,
    options?: {
      transactionControlType: TransactionControlType;
    },
  ): Promise<GeneralResult<T>> {
    let ok = true;
    let message = '';
    let result: T;
    let transactionControlType = 'rollbackOnError';
    if (options) {
      transactionControlType = options.transactionControlType;
    }

    if (this.isConnected) {
      await this.disconnect();
    }

    message = await this.connect();
    if (message) {
      return {
        ok: false,
        message,
      };
    }

    try {
      await this.begin();
      result = await f(this);

      if (
        transactionControlType === 'alwaysCommit' ||
        transactionControlType === 'rollbackOnError'
      ) {
        await this.commit();
      } else if (transactionControlType === 'alwaysRollback') {
        await this.rollback();
      }
    } catch (e) {
      ok = false;
      message = e.message;
      if (transactionControlType === 'alwaysCommit') {
        await this.commit();
      } else if (
        transactionControlType === 'alwaysRollback' ||
        transactionControlType === 'rollbackOnError'
      ) {
        await this.rollback();
      }
    } finally {
      await this.disconnect();
    }
    return {
      ok,
      message,
      result,
    };
  }
}
