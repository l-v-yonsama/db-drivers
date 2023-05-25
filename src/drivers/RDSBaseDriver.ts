import { BaseDriver } from './BaseDriver';
import {
  DbTable,
  RdsDatabase,
  ResultSetDataHolder,
  SchemaAndTableHints,
  TableRows,
} from '../resource';
import { Statement } from 'pgsql-ast-parser';
import {
  CompareKey,
  ConnectionSetting,
  QueryParams,
  ResourceType,
} from '../types';

export abstract class RDSBaseDriver extends BaseDriver<RdsDatabase> {
  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  protected abstract getTestSqlStatement(): string;

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

  async viewData(
    tableName: string,
    options?: {
      schemaName?: string;
      columnNames?: string[];
      maxRows?: number;
      compareKeys?: CompareKey[];
    },
  ): Promise<ResultSetDataHolder> {
    let sp = '';
    let cols = '';

    if (options?.schemaName) {
      sp = `${options.schemaName}.`;
    }
    if (options?.columnNames && options.columnNames?.length > 0) {
      cols = options.columnNames.join(',');
    } else {
      cols = '*';
    }
    return await this.requestSql({
      sql: `SELECT ${cols} FROM ${sp}${tableName} `,
      meta: {
        tableName,
        maxRows: options?.maxRows,
        compareKeys: options?.compareKeys,
      },
    });
  }

  abstract countTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]>;

  abstract isPositionedParameterAvailable(): boolean;

  protected getRdsDatabase(): RdsDatabase | undefined {
    const db = this.getDbDatabase();
    if (db instanceof RdsDatabase) {
      return db;
    }
    return undefined;
  }

  async requestSql(params: QueryParams): Promise<ResultSetDataHolder> {
    const { sql, conditions } = params;
    const ast = this.parseQuery(sql);
    const astTableName = this.getTableName(ast);
    const dbTable = this.getDbTable(astTableName);

    const rdh = await this.requestSqlSub({
      ...params,
      dbTable,
    });
    this.setRdhMetaAndStatement(params, rdh, ast?.type, astTableName, dbTable);

    return rdh;
  }

  abstract requestSqlSub(
    params: QueryParams & { dbTable: DbTable },
  ): Promise<ResultSetDataHolder>;

  private getTableName(ast: Statement): string | undefined {
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
    rdh: ResultSetDataHolder,
    type: Statement['type'],
    astTableName?: string,
    dbTable?: DbTable,
  ): void {
    const { sql, conditions, meta } = params;
    rdh.setSqlStatement(sql);
    rdh.meta.connectionName = this.conRes.name;
    rdh.meta.tableName = meta?.tableName;
    rdh.meta.comment = meta?.comment ?? dbTable?.comment;
    rdh.meta.compareKeys = meta?.compareKeys;
    rdh.meta.type = type;
    if (!rdh.meta.tableName) {
      rdh.meta.tableName = astTableName;
    }
    if (!rdh.meta.compareKeys && rdh.meta.tableName) {
      if (dbTable) {
        rdh.meta.compareKeys = dbTable.getCompareKeys();
      }
    }
    rdh.queryConditions = conditions;
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
