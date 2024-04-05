import * as tunnel from 'tunnel-ssh';
import { getPort } from 'get-port-please';
import * as fs from 'fs';
import { DbDatabase, SchemaAndTableHints } from '../resource';
import {
  ConnectionSetting,
  GeneralResult,
  ScanParams,
  ResultSetData,
} from '../types';
import { DBError } from './DBError';

export interface Scannable {
  scan(params: ScanParams): Promise<ResultSetData>;
}

export function isScannable(arg: any): arg is Scannable {
  if (!arg) {
    return false;
  }
  return typeof arg === 'object' && typeof arg.scan === 'function';
}

class SharedDbRes {
  static instance;
  private map = new Map<string, DbDatabase>();

  public static getInstance(): SharedDbRes {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new SharedDbRes();
    return this.instance;
  }

  get(conName: string): DbDatabase | undefined {
    return this.map.get(conName);
  }

  set(conName: string, res: DbDatabase): void {
    this.map.set(conName, res);
  }

  remove(conName: string): void {
    this.map.delete(conName);
  }
}

export abstract class BaseDriver<T extends DbDatabase = DbDatabase> {
  public isConnected: boolean;
  protected conRes: ConnectionSetting;
  protected sshServer: any;
  protected sshLocalPort?: number;

  constructor(conRes: ConnectionSetting) {
    this.conRes = conRes;
    this.isConnected = false;
    // log.info(this.getName(), '★CREATED', this.conRes.id);
  }
  getName(): string {
    return this.constructor.name;
  }
  getConnectionRes(): ConnectionSetting {
    return this.conRes;
  }

  initBaseStatus(): void {
    this.isConnected = false;
  }

  isNeedsSsh(): boolean {
    return this.conRes.ssh != undefined;
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

  async flow<T = any>(
    f: (driver: this) => Promise<T>,
  ): Promise<GeneralResult<T>> {
    let ok = true;

    if (this.isConnected) {
      await this.disconnect();
    }

    let message = await this.connect();
    let result: T;
    if (message) {
      return {
        ok: false,
        message,
      };
    }
    try {
      result = await f(this);
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
  async getInfomationSchemas(): Promise<T[]> {
    if (!this.conRes) {
      return undefined;
    }
    const dbResource = await this.getInfomationSchemasSub();
    if (dbResource.length) {
      SharedDbRes.getInstance().set(this.conRes.name, dbResource[0]);
    } else {
      SharedDbRes.getInstance().remove(this.conRes.name);
    }
    return dbResource;
  }

  abstract getInfomationSchemasSub(): Promise<T[]>;

  protected getDbDatabase(): DbDatabase | undefined {
    return SharedDbRes.getInstance().get(this.conRes.name);
  }

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
