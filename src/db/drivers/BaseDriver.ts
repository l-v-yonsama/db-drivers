import DBError from '../DBError';
import {
  DbConnection,
  DbResource,
  ColumnResolver,
  DbColumn,
  SchemaAndTableHints,
  TableRows,
  DbDatabase,
  DbSchema,
} from '../resource/DbResource';
import ResultSetDataHolder from '../resource/ResultSetDataHolder';
import * as tunnel from 'tunnel-ssh';
import { getPort } from 'get-port-please';
import { ResourceType } from '../resource/types/ResourceType';
import * as fs from 'fs';
import { ResourceHelper } from '../resource';

export default abstract class BaseDriver {
  public isConnected: boolean;
  protected conRes: DbConnection;
  protected sshServer: any;
  protected sshLocalPort?: number;

  constructor(conRes: DbConnection) {
    this.conRes = conRes;
    this.isConnected = false;
    // log.info(this.getName(), '★CREATED', this.conRes.id);
  }
  getName(): string {
    return this.constructor.name;
  }
  getConnectionRes(): DbConnection {
    return this.conRes;
  }

  initBaseStatus(): void {
    this.isConnected = false;
  }

  isNeedsSsh(): boolean {
    return this.conRes.hasSshSetting();
  }
  isQuery(sql: string): boolean {
    sql = sql.toLocaleLowerCase();
    sql = sql.replace(/-- .+/, '');
    sql = sql.replace(/(\r\n|\r|\n|\t| )+/g, ' ').trim();
    // console.log('final sql =[' + sql + ']');
    if (sql.match(/select[ ]+[^ ]+[ ]+from/)) {
      return true;
    }
    return false;
  }

  createColumnResolver(sql?: string): ColumnResolver {
    if (sql) {
      const hints = this.parseSchemaAndTableHints(sql);
      return { hints };
    }
    return { hints: { list: [] } };
  }
  parseSchemaAndTableHints(sql: string): SchemaAndTableHints {
    const ret: SchemaAndTableHints = { list: [] };
    const myRegexp = /(FROM|UPDATE)[\s]+(([^\s()]+)\.)?([^\s()]+)/gim;
    let match = myRegexp.exec(sql);
    while (match != null) {
      // sql=SELECT * FROM SSS.TTT
      // [1]=SSS.TTT
      // [2]=SSS.
      // [3]=SSS
      // [4]=TTT
      ret.list.push({ schema: match[3], table: match[4] });
      match = myRegexp.exec(sql);
    }
    return ret;
  }

  resetDefaultSchema(database: DbDatabase): void {
    const searchNames = [];
    if (this.conRes.database) {
      searchNames.push(this.conRes.database);
    }
    if (this.conRes.user) {
      searchNames.push(this.conRes.user);
    }
    searchNames.push('public');
    for (const searchName of searchNames) {
      const child = database.getChildByName(searchName, {
        resouceType: ResourceType.Schema,
      }) as DbSchema;

      if (child) {
        child.isDefault = true;
        return;
      }
    }

    const child = database
      .getChildren()
      .find((it) => it.getResouceType() === ResourceType.Schema) as DbSchema;
    if (child) {
      child.isDefault = true;
    }
  }

  resolveColumn(
    column: string,
    resolver?: ColumnResolver,
  ): DbColumn | undefined {
    if (resolver === undefined) {
      return undefined;
    }
    if (this.conRes) {
      for (let i = 0; i < resolver.hints.list.length; i++) {
        const hints = resolver.hints.list[i];
        const t = ResourceHelper.findResource(
          this.conRes,
          ResourceType.Table,
          hints.table,
        );
        if (t) {
          // log.info(LOG_PREFIX, "#resolveColumn found table", hints.table);
          return <DbColumn>t.getChildByName(column, { unwrapQuote: true });
        } else {
          // log.warn(LOG_PREFIX, "#resolveColumn not found table", hints.table);
        }
      }
    } else {
      // log.warn(LOG_PREFIX, '#resolveColumn no connection res.')
    }
    return undefined;
  }

  resolveColumnComment(column: string, resolver?: ColumnResolver): string {
    const c = this.resolveColumn(column, resolver);
    if (c && c.comment) {
      return c.comment;
    }
    return '';
  }

  async connectToSshServer(): Promise<string> {
    this.sshLocalPort = await getPort({ portRange: [13000, 15100] });
    // log.info(LOG_PREFIX, 'SSH Local host port is ', this.sshLocalPort)
    return new Promise<string>((resolve, reject) => {
      const setting = Object.assign({}, this.conRes.ssh, {
        localHost: '127.0.0.1',
        localPort: this.sshLocalPort,
      });
      if (setting.authMethod === 'privateKey') {
        setting.privateKey = fs.readFileSync(setting.privateKeyPath, 'utf8');
      }

      this.sshServer = tunnel(setting, function (err: Error) {
        if (err) {
          reject(err);
        } else {
          resolve('');
        }
      });
      // Use a listener to handle errors outside the callback
      this.sshServer.on('error', function (err: Error) {
        console.error('Something bad happened:', err);
      });
    });
  }

  async connect(): Promise<string> {
    let errorReason = '';
    try {
      this.initBaseStatus();
      if (this.conRes) {
        if (this.isNeedsSsh()) {
          await this.connectToSshServer();
        }
        errorReason = await this.connectSub();
      } else {
        errorReason = 'Connection property is nothing';
      }
    } catch (e) {
      errorReason = e.message;
    }
    this.isConnected = errorReason === '';
    return errorReason;
  }

  async disconnect(): Promise<string> {
    let errorReason = '';
    try {
      if (this.conRes) {
        if (this.isConnected) {
          errorReason = await this.closeSub();
        } else {
          // log.info('not connected, skip close.')
        }
      } else {
        errorReason = 'Connection property is nothing';
      }
    } catch (e) {
      errorReason = e.message;
    } finally {
      if (this.sshServer) {
        this.sshServer.close();
        this.sshServer = undefined;
      }
      this.initBaseStatus();
    }
    return errorReason;
  }
  abstract connectSub(): Promise<string>;
  abstract closeSub(): Promise<string>;
  abstract getInfomationSchemas(options: {
    progress_callback?: Function | undefined;
    params?: any;
  }): Promise<Array<DbResource>>;
  abstract test(with_connect: boolean): Promise<string>;
  abstract countTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]>;
  abstract requestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder>;
  createDBError(message: string, sourceError: any): DBError {
    return new DBError(
      message,
      sourceError.code,
      sourceError.errno,
      sourceError.sqlMessage,
      sourceError.sqlState,
    );
  }
}

export interface RequestSqlOptions {
  binds?: string[];
  needs_column_resolve?: boolean;
  progress_callback?: Function;
  max_rows?: number;
  auto_connection?: boolean;
}
