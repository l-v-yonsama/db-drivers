import { BaseDriver, RequestSqlOptions } from './BaseDriver';
import {
  DbConnection,
  ResultSetDataHolder,
  SchemaAndTableHints,
  TableRows,
} from '../resource';

export abstract class RDSBaseDriver extends BaseDriver {
  constructor(conRes: DbConnection) {
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
        await this.requestSql(this.getTestSqlStatement());
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
    return await this.requestSql(`SELECT ${cols} FROM ${sp}${tableName} `, {
      needsColumnResolve: false,
    });
  }

  // public
  public abstract requestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder>;

  public abstract countTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]>;
}
