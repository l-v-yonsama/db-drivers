/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseDriver, { RequestSqlOptions } from './BaseDriver';
import {
  DbConnection,
  DbResource,
  RedisDatabase,
  DbKey,
  SchemaAndTableHints,
  TableRows,
} from '../resource/DbResource';
import { Redis } from 'ioredis';
import ResultSetDataHolder from '../resource/ResultSetDataHolder';
import { RedisKeyType } from '../resource/types/RedisKeyType';
import {
  RedisCommandType,
  RedisRequest,
} from '../../service/request/RedisRequest';

export default class RedisDriver extends BaseDriver {
  client: Redis | undefined;
  databases = 16;

  constructor(conRes: DbConnection) {
    super(conRes);
  }

  async connectSub(): Promise<string> {
    try {
      const options: any = Object.assign(
        {
          port: 6379, // Redis port
          host: '127.0.0.1', // Redis host
          password: 'auth',
          db: 0,
        },
        {
          port: this.conRes.port,
          host: this.conRes.host,
          password: this.conRes.password,
          db: this.conRes.database,
          retryStrategy: function () {
            return 'No!';
          },
        },
      );
      if (this.isNeedsSsh()) {
        options.host = '127.0.0.1';
        options.port = this.sshLocalPort;
      }
      options.connectTimeout = 5_000;
      if (this.conRes.hasUrl()) {
        // Connect to 127.0.0.1:6380, db 4, using password "authpassword":
        // "redis://:authpassword@127.0.0.1:6380/4"
        this.client = new Redis(this.conRes.url);
      } else {
        this.client = new Redis(options);
      }
      // dbs= [ [ null, '# Serverxxxx' ], [ null, [ 'databases', '16' ] ] ]
      try {
        // ReplyError: EXECABORT Transaction discarded because of previous errors.
        const dbs = await this.client
          .multi()
          .info()
          .config('GET', 'databases')
          .exec();
        if (dbs && dbs.length > 1 && dbs[1].length > 1) {
          const dbs2 = dbs[1][1] as any; // dbs2= [ 'databases', '16' ]
          if (dbs2 && dbs2.length > 1) {
            this.databases = parseInt(dbs2[1], 10);
          }
        }
      } catch (e) {
        this.databases = 16;
      }
    } catch (e) {
      return e.message;
    }

    return '';
  }

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    try {
      if (with_connect) {
        const con_result = await this.connect();
        if (con_result) {
          return con_result;
        }
      }
      await this.client.ping();
      if (with_connect) {
        await this.disconnect();
      }
    } catch (e) {
      errorReason = e.message;
    }
    return errorReason;
  }

  async requestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder> {
    return ResultSetDataHolder.createEmpty();
  }
  async countTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]> {
    return new Array<TableRows>();
  }

  async executeCommand(req: RedisRequest): Promise<DbKey | string | number> {
    let ret: DbKey | string | number = '';
    if (!this.client) {
      return ret;
    }
    await this.client.select(req.index);
    let r: any = '';
    switch (req.command) {
      case RedisCommandType.GetValue:
        {
          r = await this.getValueByKey(this.client, req.key, req.type);
          const ttl = await this.client.ttl(req.key);
          ret = new DbKey(req.key, req.type, ttl);
          if (ret.ttl > 0) {
            ret.ttlConfirmationDatetime = new Date().getTime();
          }
          ret.val = r;
        }
        break;
      case RedisCommandType.SetValue:
        if (req.options) {
          await this.client.set(req.key, req.options.val);
        }
        break;
      case RedisCommandType.Flushall:
        ret = await this.client.flushall();
        break;
      case RedisCommandType.Flushdb:
        ret = await this.client.flushdb();
        break;
      case RedisCommandType.Dbsize:
        ret = await this.client.dbsize();
        break;
      case RedisCommandType.Info:
        ret = await this.client.info(<string>req.options.section);
        break;
      default:
        console.error('undefined.', req.command);
        break;
    }
    return ret;
  }

  scan(
    db_index: number,
    key: string,
    count: number,
    with_value: boolean,
    progressCallback: Function,
  ): Promise<Array<DbKey>> {
    return new Promise((resolve) => {
      const currentClient = this.client;
      this.client.select(db_index);
      const stream = this.client.scanStream({
        match: key,
        count,
      });
      const ret = new Array<DbKey>();
      stream.on('data', (resultKeys: string[]) => {
        resultKeys.forEach((key) => {
          ret.push(new DbKey(key));
        });
        progressCallback(
          'Key scanning now.',
          Math.round((ret.length * 100) / count),
        );
        if (ret.length > count) {
          (<any>stream).close(); // ScanStream.close()
        }
      });
      stream.on('end', () => {
        progressCallback('Key scanning done. get type and ttl.', 80);
        if (ret.length > count) {
          ret.splice(count - 1, ret.length - count);
        }
        const parallels: any[] = [];
        ret.forEach((keyRes) => {
          parallels.push(
            (async (): Promise<void> => {
              keyRes.type = RedisKeyType.parse(
                await currentClient.type(keyRes.getName()),
              );
              keyRes.ttl = await currentClient.ttl(keyRes.getName());
              if (keyRes.ttl > 0) {
                keyRes.ttlConfirmationDatetime = new Date().getTime();
              }
              if (with_value) {
                keyRes.val = await this.getValueByKey(
                  currentClient,
                  keyRes.getName(),
                  keyRes.type,
                );
              }
            })(),
          );
        });
        (async (): Promise<void> => {
          await Promise.all(parallels);
          progressCallback('Key scanning done.', 100);
          resolve(ret);
        })();
      });
    });
  }
  async getValueByKey(
    client: Redis,
    key: string,
    type: RedisKeyType,
  ): Promise<any> {
    switch (type) {
      case RedisKeyType.string:
        return await client.get(key);
      case RedisKeyType.list:
        return await client.lrange(key, 0, -1);
      case RedisKeyType.set:
        return await client.smembers(key);
      case RedisKeyType.zset:
        return await client.zrange(key, 0, -1);
      case RedisKeyType.hash:
        return await client.hgetall(key);
      default:
        console.log('whattype??', type);
    }
    return undefined;
  }
  async getInfomationSchemas(options: {
    progress_callback?: Function | undefined;
    params?: any;
  }): Promise<Array<DbResource>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<DbResource>();

    const keyspace = await this.client.info('keyspace');
    // db0:keys=7,expires=0,avg_ttl=0
    // db3:keys=1,expires=1,avg_ttl=4996199
    const re = /db([0-9]+):keys=([0-9]+),expires=([0-9]+),avg_ttl=([0-9]+)/g;
    let m: string[];
    while ((m = re.exec(keyspace))) {
      const db = m[1];
      const keys = parseInt(m[2], 10);
      const expires = parseInt(m[3], 10);
      const avg_ttl = parseInt(m[4], 10);
      const dbRes = new RedisDatabase(db, keys, expires, avg_ttl);
      dbResources.push(dbRes);
    }
    for (let i = 0; i < this.databases; i++) {
      const name = `${i}`;
      if (!dbResources.some((r) => r.getName() === name)) {
        const dbRes = new RedisDatabase(name, 0, 0, 0);
        dbResources.push(dbRes);
      }
    }

    return dbResources;
  }
  async closeSub(): Promise<string> {
    if (this.client) {
      await this.client.quit();
    }
    return '';
  }
}
