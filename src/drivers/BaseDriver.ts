import * as tunnel from 'tunnel-ssh';
import { getPort } from 'get-port-please';
import * as fs from 'fs';
import {
  ColumnResolver,
  DbColumn,
  DbConnection,
  DbDatabase,
  DbSchema,
  ResultSetDataHolder,
  SchemaAndTableHints,
} from '../resource';
import { GeneralResult, ResourceType, ScanParams } from '../types';
import { DBError } from './DBError';

export interface Scannable {
  scan(params: ScanParams): Promise<ResultSetDataHolder>;
}

export function isScannable(arg: any): arg is Scannable {
  if (!arg) {
    return false;
  }
  return typeof arg === 'object' && typeof arg.scan === 'function';
}

export abstract class BaseDriver {
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

  async flow<T = any>(f: () => Promise<T>): Promise<GeneralResult<T>> {
    let ok = true;
    let message = await this.connect();
    let result: T;
    if (message) {
      return {
        ok: false,
        message,
      };
    }
    try {
      result = await f();
    } catch (e) {
      ok = false;
      message = e.message;
    } finally {
      await this.disconnect();
    }
    return {
      ok,
      message,
      result,
    };
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
        const t = this.conRes.findResource(ResourceType.Table, hints.table);
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
  abstract getInfomationSchemas(): Promise<Array<DbDatabase>>;
  abstract test(with_connect: boolean): Promise<string>;

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
  needsColumnResolve?: boolean;
  maxRows?: number;
}
