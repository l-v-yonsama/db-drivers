/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GeneralColumnType,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
} from '@l-v-yonsama/rdh';
import { Redis } from 'ioredis';
import { DbKey, RedisDatabase, RedisKeyParams } from '../resource';
import { ConnectionSetting, RedisKeyType, RedisScanParams } from '../types';
import { prettyTime } from '../utils';
import { BaseDriver, Commandable, Scannable } from './BaseDriver';

export class RedisDriver
  extends BaseDriver<RedisDatabase>
  implements Scannable<RedisScanParams>, Commandable
{
  client: Redis | undefined;

  constructor(conRes: ConnectionSetting) {
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
      if (this.conRes.url) {
        // Connect to 127.0.0.1:6380, db 4, using password "authpassword": "redis://:authpassword@127.0.0.1:6380/4"
        this.client = new Redis(this.conRes.url);
      } else {
        this.client = new Redis(options);
      }
      await this.client.ping(); // test
    } catch (e) {
      return `failed to connect:${e.message}`;
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

  async flushAll(): Promise<void> {
    await this.client.flushall();
  }

  async flushDb(): Promise<void> {
    await this.client.flushdb();
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async scanStream(params: RedisScanParams): Promise<DbKey<RedisKeyParams>[]> {
    const { dbIndex, limit, fetchValue, keyGlob } = params;

    await this.client.select(dbIndex);
    const keys = await new Promise<string[]>((resolve) => {
      const stream = this.client.scanStream({
        match: keyGlob,
        count: limit,
      });
      const keys: string[] = [];

      stream.on('data', (resultKeys: string[]) => {
        resultKeys.forEach((key) => {
          keys.push(key);
        });

        if (keys.length > limit) {
          (<any>stream).close(); // ScanStream.close()
        }
      });
      stream.on('end', () => {
        if (keys.length > limit) {
          keys.splice(limit - 1, keys.length - limit);
        }
        resolve(keys);
      });
    });

    const promises = keys.map(async (key) => {
      const type = (await this.client.type(key)) as RedisKeyType;
      const ttl = await this.client.ttl(key);
      let val: any;
      if (fetchValue) {
        val = await this.getValueByKey(this.client, key, type);
      }
      return new DbKey<RedisKeyParams>(key, {
        type,
        ttl,
        val,
      });
    });
    return await Promise.all(promises);
  }

  async scan(params: RedisScanParams): Promise<ResultSetData> {
    const dbKeys = await this.scanStream(params);

    const rdb = new ResultSetDataBuilder([
      createRdhKey({
        name: 'key',
        type: GeneralColumnType.TEXT,
        width: 150,
      }),
      createRdhKey({
        name: 'type',
        type: GeneralColumnType.ENUM,
        width: 70,
      }),
      createRdhKey({
        name: 'ttl',
        type: GeneralColumnType.TEXT, // number to pretty time
        width: 60,
        align: 'right',
      }),
      createRdhKey({
        name: 'val',
        type: GeneralColumnType.JSON,
        width: 300,
        align: 'left',
      }),
    ]);
    dbKeys.forEach((dbKey) => {
      const ttl =
        dbKey.params.ttl < 0 ? '' : prettyTime(dbKey.params.ttl * 1000); // sec to ms
      rdb.addRow({
        key: dbKey.name,
        type: dbKey.params.type,
        ttl,
        val: JSON.stringify(dbKey.params.val),
      });
    });
    rdb.updateMeta({
      tableName: `RedisDB${this.conRes.database}`,
      connectionName: this.conRes.name,
      compareKeys: [
        {
          kind: 'primary',
          names: ['key'],
        },
      ],
    });
    return rdb.build();
  }

  async executeCommand(command: string): Promise<ResultSetData> {
    const startTime = new Date().getTime();
    const { cmdName, args } = this.tokenizeCommand(command);
    const reply = await this.client.call(cmdName, ...args);
    const elapsedTimeMilli = new Date().getTime() - startTime;

    const rdb = this.buildCommandResultSet(cmdName, reply);
    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
    });
    const result = rdb.build();
    result.meta.command = command;
    return result;
  }

  private tokenizeCommand(command: string): { cmdName: string; args: string[] } {
    const matches = command.trim().match(/"([^"]*)"|'([^']*)'|\S+/g) ?? [];
    const tokens = matches.map((tok) => {
      if (
        (tok.startsWith('"') && tok.endsWith('"')) ||
        (tok.startsWith("'") && tok.endsWith("'"))
      ) {
        return tok.slice(1, -1);
      }
      return tok;
    });
    const [cmdName, ...args] = tokens;
    if (!cmdName) {
      throw new Error('Empty command');
    }
    return { cmdName, args };
  }

  private buildCommandResultSet(
    cmdName: string,
    reply: unknown,
  ): ResultSetDataBuilder {
    if (
      cmdName.toUpperCase() === 'HGETALL' &&
      Array.isArray(reply) &&
      reply.length % 2 === 0
    ) {
      const rdb = new ResultSetDataBuilder([
        createRdhKey({ name: 'field', type: GeneralColumnType.TEXT, width: 150 }),
        createRdhKey({ name: 'value', type: GeneralColumnType.TEXT, width: 300 }),
      ]);
      for (let i = 0; i < reply.length; i += 2) {
        rdb.addRow({ field: reply[i], value: reply[i + 1] });
      }
      rdb.updateMeta({
        tableName: `Redis${cmdName.toUpperCase()}`,
        connectionName: this.conRes.name,
      });
      return rdb;
    }

    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'value', type: GeneralColumnType.JSON, width: 300 }),
    ]);
    if (Array.isArray(reply)) {
      reply.forEach((el) => {
        const value = el !== null && typeof el === 'object' ? JSON.stringify(el) : el;
        rdb.addRow({ value });
      });
    } else {
      rdb.addRow({ value: reply });
    }
    rdb.updateMeta({
      tableName: `Redis${cmdName.toUpperCase()}`,
      connectionName: this.conRes.name,
    });
    return rdb;
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
  async getInfomationSchemasSub(): Promise<Array<RedisDatabase>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<RedisDatabase>();

    const keyspace = await this.client.info('keyspace');
    const re = /db([0-9]+):keys=([0-9]+),expires=([0-9]+),avg_ttl=([0-9]+)/g;
    let m: string[];
    while ((m = re.exec(keyspace))) {
      const db = m[1];
      const keys = parseInt(m[2], 10);
      const dbRes = new RedisDatabase(db, keys);
      dbResources.push(dbRes);
    }
    // flushallすると情報が何も取れない状態の救済
    if (dbResources.length === 0) {
      const dbRes = new RedisDatabase(this.conRes.database, 0);
      dbResources.push(dbRes);
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
