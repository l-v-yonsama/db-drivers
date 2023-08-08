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
  QueryParams,
  ResourceType,
  ResultSetData,
} from '../types';
import { parseQuery } from '../helpers';

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
    let tableName = this.getTableNameInLowercase(ast);
    const dbTable = this.getDbTable(tableName);
    if (dbTable) {
      tableName = dbTable.name;
    }

    const rdb = await this.requestSqlSub({
      ...params,
      dbTable,
    });
    this.setRdhMetaAndStatement(params, rdb, ast?.type, tableName, dbTable);

    return rdb.build();
  }

  abstract requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  async explainSql(params: QueryParams): Promise<ResultSetData> {
    const { sql } = params;
    const ast = parseQuery(sql);
    let tableName = this.getTableNameInLowercase(ast);
    const dbTable = this.getDbTable(tableName);
    if (dbTable) {
      tableName = dbTable.name;
    }

    const rdb = await this.explainSqlSub({
      ...params,
      dbTable,
    });
    this.setRdhMetaAndStatement(
      params,
      rdb,
      'explain' as any,
      tableName,
      dbTable,
    );

    return rdb.build();
  }

  abstract explainSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataBuilder>;

  private getTableNameInLowercase(ast: Statement): string | undefined {
    if (ast) {
      // console.log(JSON.stringify(ast, null, 2));
      switch (ast.type) {
        case 'select':
          if (ast.from && ast.from[0].type === 'table') {
            return ast.from[0].name.name;
          }
          break;
        case 'insert':
          return ast.into.name;
        case 'update':
          return ast.table.name;
        case 'delete':
          return ast.from.name;
      }
    }
    return undefined;
  }

  private getDbTable(name: string): DbTable | undefined {
    if (!name) {
      return undefined;
    }
    const list = this.getRdsDatabase()?.findChildren<DbTable>({
      keyword: name,
      resourceType: ResourceType.Table,
      recursively: true,
    });
    if (list) {
      return list[0];
    }
    return undefined;
  }

  setRdhMetaAndStatement(
    params: QueryParams,
    rdb: ResultSetDataBuilder,
    type: Statement['type'],
    astTableName?: string,
    dbTable?: DbTable,
  ): void {
    const { sql, conditions, meta } = params;
    rdb.setSqlStatement(sql);
    const connectionName = this.conRes.name;
    let tableName = meta?.tableName;
    const comment = meta?.comment ?? dbTable?.comment;
    let compareKeys = meta?.compareKeys;
    if (!rdb.rs.meta.tableName) {
      tableName = astTableName;
    }

    if (!rdb.rs.meta.compareKeys && !compareKeys) {
      if (dbTable) {
        compareKeys = dbTable.getCompareKeys();
      }
    }
    rdb.updateMeta({
      connectionName,
      comment,
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
}
