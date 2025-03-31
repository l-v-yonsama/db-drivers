import {
  ResultSetData,
  ResultSetDataBuilder,
  equalsIgnoreCase,
  toNum,
} from '@l-v-yonsama/rdh';
import { parseQuery, toCountRecordsQuery } from '../helpers';
import {
  DbSchema,
  DbTable,
  RdsDatabase,
  SchemaAndTableName,
} from '../resource';
import {
  ConnectionSetting,
  GeneralResult,
  QStatement,
  QueryParams,
  SQLLang,
  TransactionControlType,
  TransactionIsolationLevel,
} from '../types';
import { acceptResourceFilter, setRdhMetaAndStatement } from '../utils';
import { BaseSQLSupportDriver } from './BaseSQLSupportDriver';

export abstract class RDSBaseDriver extends BaseSQLSupportDriver<RdsDatabase> {
  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  protected abstract getTestSqlStatement(): string;

  getSqlLang(): SQLLang {
    return 'sql';
  }

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

  async count(params: SchemaAndTableName): Promise<number | undefined> {
    const { query } = toCountRecordsQuery({
      schemaName: params.schema,
      tableRes: new DbTable(params.table, null),
    });
    return await this.countSql({
      sql: query,
    });
  }

  abstract useDatabase(database: string): Promise<void>;

  isSchemaSpecificationSvailable(): boolean {
    return true;
  }

  protected getRdsDatabase(): RdsDatabase | undefined {
    const db = this.getFirstDbDatabase();
    if (db instanceof RdsDatabase) {
      return db;
    }
    return undefined;
  }

  async requestSql(params: QueryParams): Promise<ResultSetData> {
    const { sql, conditions, prepare } = params;

    let qst: QStatement | undefined = undefined;
    let dbTable: DbTable | undefined = undefined;

    if (conditions?.rawQueries !== true) {
      qst = parseQuery(sql);
      dbTable = this.getDbTable(qst);
      if (qst?.ast?.type) {
        if (!params.meta) {
          params.meta = {};
        }
        params.meta.type = qst?.ast?.type;
      }
    }
    if (prepare && prepare.useDatabaseName) {
      await this.useDatabase(prepare.useDatabaseName);
    }

    const rdb = await this.requestSqlSub({
      ...params,
      dbTable,
    });
    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      useDatabase: prepare?.useDatabaseName,
      params,
      rdb,
      type: qst?.ast?.type,
      qst,
      dbTable,
      tableComment: dbTable?.comment,
    });

    return rdb.build();
  }

  async countSql(params: QueryParams): Promise<number | undefined> {
    if (params.prepare && params.prepare.useDatabaseName) {
      await this.useDatabase(params.prepare.useDatabaseName);
    }
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
    const { sql, prepare } = params;
    const ast = parseQuery(sql);
    const dbTable = this.getDbTable(ast);

    if (prepare && prepare.useDatabaseName) {
      await this.useDatabase(prepare.useDatabaseName);
    }

    const rdb = await this.explainSqlSub({
      ...params,
      dbTable,
    });
    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      useDatabase: prepare?.useDatabaseName,
      params,
      rdb,
      type: 'explain' as any,
      qst: ast,
      dbTable,
      tableComment: dbTable?.comment,
    });

    rdb.rs.meta.compareKeys = undefined; // update

    return rdb.build();
  }

  abstract explainSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  abstract getLocks(dbName: string): Promise<ResultSetData>;
  abstract getSessions(dbName: string): Promise<ResultSetData>;

  async explainAnalyzeSql(params: QueryParams): Promise<ResultSetData> {
    const { sql, prepare } = params;
    const ast = parseQuery(sql);
    const dbTable = this.getDbTable(ast);

    if (prepare && prepare.useDatabaseName) {
      await this.useDatabase(prepare.useDatabaseName);
    }
    const rdb = await this.explainAnalyzeSqlSub({
      ...params,
      dbTable,
    });
    setRdhMetaAndStatement({
      connectionName: this.conRes.name,
      useDatabase: prepare?.useDatabaseName,
      params,
      rdb,
      type: 'analyze' as any,
      qst: ast,
      dbTable,
      tableComment: dbTable?.comment,
    });
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
      const schema = db.children.find((it) =>
        equalsIgnoreCase(it.name, qst.names.schemaName),
      );
      if (schema) {
        return schema.children.find((it) =>
          equalsIgnoreCase(it.name, qst.names.tableName),
        );
      }
    }

    for (const schema of db.children) {
      const table = schema.children.find((it) =>
        equalsIgnoreCase(it.name, qst.names.tableName),
      );
      if (table) {
        return table;
      }
    }

    return undefined;
  }

  protected filterSchemas(schemas: DbSchema[]): DbSchema[] {
    const { resourceFilter } = this.conRes;
    if (!resourceFilter?.schema) {
      return schemas;
    }
    return schemas.filter((it) =>
      acceptResourceFilter(it.name, resourceFilter.schema),
    );
  }

  protected filterTables(tables: DbTable[]): DbTable[] {
    const { resourceFilter } = this.conRes;
    if (!resourceFilter?.table) {
      return tables;
    }
    return tables.filter((it) =>
      acceptResourceFilter(it.name, resourceFilter.table),
    );
  }

  resetDefaultSchema(database: RdsDatabase, hint = ''): void {
    const searchNames = [];
    if (hint) {
      searchNames.push(hint);
    }
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

  supportsShowCreate(): boolean {
    return false;
  }

  getTableDDL({
    tableName,
    schemaName,
  }: {
    tableName: string;
    schemaName?: string;
  }): Promise<string> {
    throw new Error('Does not support Show Create statement.');
  }

  abstract begin(): Promise<void>;
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
  abstract setAutoCommit(value: boolean): Promise<void>;
  abstract connectWithTest(): Promise<string>;
  abstract getVersion(): Promise<string>;
  abstract getTransactionIsolationLevel(): Promise<TransactionIsolationLevel>;
  async getMajorVersion(): Promise<number> {
    const version = await this.getVersion();
    return toNum(version.replace(/^([0-9]+)\..*$/, '$1'));
  }

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
