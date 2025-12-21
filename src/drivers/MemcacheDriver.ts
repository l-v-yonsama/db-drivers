/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GeneralColumnType,
  ResultSetData,
  ResultSetDataBuilder,
  createRdhKey,
  getUniqObjectKeys,
  toBoolean,
  toDate,
  toNum,
} from '@l-v-yonsama/rdh';
import dayjs from 'dayjs';
import Memcached from 'memcached';
import { DbKey, MemcacheDatabase, MemcacheKeyParams } from '../resource';
import {
  ConnectionSetting,
  ListOption,
  MemcachedValue,
  ParsedCommand,
  ScanParams,
} from '../types';
import { BaseDriver, Commandable, Scannable } from './BaseDriver';
import {
  getAsync,
  getKeysFromSlab,
  getMultiAsync,
  isIsoDateString,
  isNumericString,
  itemsAsync,
  setAsync,
  versionAsync,
} from './memcache/helper';
import { isJson } from '../utils';

export class MemcacheDriver
  extends BaseDriver<MemcacheDatabase>
  implements Scannable, Commandable
{
  private client: Memcached | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  async connectSub(): Promise<string> {
    try {
      const timeout = this.conRes.connectTimeoutMs ?? 1000;
      const server = `${this.conRes.host}`;
      this.client = new Memcached(server, {
        retries: 1,
        retry: 100,
        timeout,
      });
    } catch (e: any) {
      return `failed to connect:${e.message}`;
    }
    return '';
  }

  async test(with_connect = false): Promise<string> {
    try {
      if (with_connect) {
        const con_result = await this.connect();
        if (con_result) {
          return con_result;
        }
      }
      await this.getVersion();
      if (with_connect) {
        await this.disconnect();
      }
    } catch (e: any) {
      return e.message;
    }
    return '';
  }

  async getVersion(): Promise<string> {
    const versions = await versionAsync(this.client);
    return Object.values(versions).join(', ');
  }

  /** 全キーを取得（memcached の items + cachedump を使用） */
  async listKeyWithValues(
    options?: ListOption,
  ): Promise<DbKey<MemcacheKeyParams>[]> {
    // デフォルト値を設定
    const limit = options?.limit ?? 100;
    const keyword = options?.keyword ?? '';

    const list: DbKey<MemcacheKeyParams>[] = [];
    const items = await itemsAsync(this.client);

    out: for (const item of items) {
      const server = item.server;
      if (!server) continue;

      for (const key of Object.keys(item)) {
        if (key === 'server') continue;
        const slabId = Number(key);
        const iLimit = item[key].number;
        // 残り必要な件数を計算（limitを超えないようにする）
        const remainingLimit = Math.max(0, limit - list.length);
        // iLimitと残り必要な件数の小さい方を使用
        const keysToFetch = Math.min(iLimit, remainingLimit);
        const keys = await getKeysFromSlab(
          this.client,
          server,
          slabId,
          keysToFetch,
        );

        if (keys.length === 0) continue;

        const data = await getMultiAsync(this.client, keys);
        for (const dataKey of Object.keys(data)) {
          // keyword フィルタリング（キーワードが指定されている場合は部分一致検索）
          if (keyword && !dataKey.includes(keyword)) {
            continue;
          }

          const val = data[dataKey];
          const dbKey = new DbKey<MemcacheKeyParams>(dataKey, {
            slabId: slabId,
            val: val,
          });
          list.push(dbKey);

          if (list.length >= limit) {
            break out;
          }
        }
      }
    }

    return list;
  }

  async getByRdh(key: string): Promise<ResultSetData> {
    return await this.scan({
      limit: 1,
      target: 'exact',
      keyword: key,
    });
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { matchType, limit, withValue, keyword, jsonExpansion } = params;

    const keys = [
      createRdhKey({
        name: 'key',
        type: GeneralColumnType.TEXT,
        width: 150,
      }),
      createRdhKey({
        name: 'raw_text',
        type: GeneralColumnType.TEXT,
        width: 60,
        align: 'left',
      }),
      createRdhKey({
        name: 'raw_buffer',
        type: GeneralColumnType.BLOB,
        width: 60,
        align: 'left',
      }),
      createRdhKey({
        name: 'type',
        type: GeneralColumnType.ENUM,
        width: 70,
      }),
      createRdhKey({
        name: 'formatted',
        type: GeneralColumnType.TEXT,
        width: 360,
        align: 'left',
      }),
    ];

    let list: DbKey<MemcacheKeyParams>[] = [];

    const startTime = new Date().getTime();
    if (matchType === 'exact') {
      const val = await this.get(keyword);
      if (val !== undefined && val !== null) {
        const dbKey = new DbKey<MemcacheKeyParams>(keyword, {
          slabId: -1,
          val: val,
        });
        list.push(dbKey);
      }
    } else {
      list = await this.listKeyWithValues({
        limit,
        keyword,
      });
    }
    const elapsedTimeMilli = new Date().getTime() - startTime;

    const rdb = new ResultSetDataBuilder(keys);

    list.forEach((o) => {
      const v = o.params.val;
      const rowData = {
        key: o.name,
      };

      let type: GeneralColumnType = GeneralColumnType.UNKNOWN;

      if (v === null || v === undefined) {
        type = GeneralColumnType.NULL;
      } else if (Buffer.isBuffer(v)) {
        rowData['raw_text'] = `B'${v.toString(
          'hex',
          0,
          Math.max(v.byteLength, 64),
        )}`;
        rowData['raw_buffer'] = v;
        type = GeneralColumnType.BLOB;
      } else {
        rowData['raw_text'] = v;
        if (isJson(v)) {
          rowData['formatted'] = JSON.stringify(JSON.parse(v), null, 2);
          type = GeneralColumnType.JSON;
        } else {
          let formatted = v;
          if (/^(TRUE|FALSE)$/i.test(v)) {
            type = GeneralColumnType.BOOLEAN;
            formatted = v;
          } else if (isNumericString(v)) {
            type = GeneralColumnType.NUMERIC;
            formatted = toNum(v).toString();
          } else if (isIsoDateString(v)) {
            type = GeneralColumnType.TIMESTAMP;
            formatted = dayjs(toDate(v)).format('YYYY-MM-DD HH:mm:ss');
          } else {
            type = GeneralColumnType.TEXT;
          }
          rowData['formatted'] = formatted;
        }
      }
      rowData['type'] = type;

      rdb.addRow(rowData);
    });

    rdb.updateMeta({
      tableName: `MemcacheServer`,
      connectionName: this.conRes.name,
      compareKeys: [{ kind: 'primary', names: ['key'] }],
      type: 'select',
    });
    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
    });
    return rdb.build();
  }

  async executeCommand(command: string): Promise<ResultSetData> {
    const parsed = this.parseCommand(command);

    const scanParams: Partial<ScanParams> = {
      target: '',
    };
    switch (parsed.type) {
      case 'get':
        scanParams.matchType = 'exact';
        scanParams.limit = 1;
        scanParams.keyword = parsed.key;
        break;
      case 'cachedump':
        scanParams.matchType = 'partial';
        scanParams.limit = parsed.limit;
        scanParams.keyword = parsed.keyword;
    }
    const result = await this.scan(scanParams as ScanParams);
    result.meta.command = command;
    return result;
  }

  private parseCommand(command: string): ParsedCommand {
    const tokens = command.trim().split(/\s+/);
    const cmd = tokens.shift()?.toLowerCase();

    if (!cmd) {
      throw new Error('Empty command');
    }

    switch (cmd) {
      case 'get': {
        if (tokens.length !== 1) {
          throw new Error('Usage: get <key>');
        }
        return { type: 'get', key: tokens[0] };
      }

      case 'cachedump': {
        let limit: number | undefined;
        let keyword: string | undefined;

        for (const t of tokens) {
          if (isNumericString(t)) {
            limit = toNum(t);
          } else {
            keyword = t;
          }
        }

        return { type: 'cachedump', limit, keyword };
      }

      default:
        throw new Error(`Unknown command: ${cmd}`);
    }
  }

  /** キーを指定して 1 件取得 */
  async get(key: string): Promise<MemcachedValue> {
    return await getAsync(this.client, key);
  }

  /** キーと値を指定して保存 */
  async set(
    key: string,
    value: string | Buffer,
    options?: { lifetime?: number },
  ): Promise<boolean> {
    const lifetime = options?.lifetime ?? 0;
    return await setAsync(this.client, key, value, lifetime);
  }

  async getInfomationSchemasSub(): Promise<Array<MemcacheDatabase>> {
    const dbResources: MemcacheDatabase[] = [];

    const items = await itemsAsync(this.client);
    let hot = 0;
    let warm = 0;
    let cold = 0;

    items.forEach((serverItem: any) => {
      Object.entries(serverItem).forEach(([slabId, slabStats]: any) => {
        if (slabId === 'server') return;
        hot += Number(slabStats.number_hot ?? 0);
        warm += Number(slabStats.number_warm ?? 0);
        cold += Number(slabStats.number_cold ?? 0);
      });
    });

    const dbRes = new MemcacheDatabase('Server');
    dbRes.servers = this.conRes.host;
    dbRes.hot = hot;
    dbRes.warm = warm;
    dbRes.cold = cold;
    dbRes.comment = `LRU(HOT:${hot},WARM:${warm},COLD:${cold})`;
    dbResources.push(dbRes);

    const keys = await this.listKeyWithValues(); // preload
    keys.forEach((key) => {
      dbRes.addChild(key);
    });

    return dbResources;
  }

  async closeSub(): Promise<string> {
    if (this.client) {
      (this.client as any).end(true);
      this.client = undefined;
    }
    return '';
  }
}
