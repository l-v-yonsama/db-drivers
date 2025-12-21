import Memcached, { StatusData } from 'memcached';
import { MemcachedValue } from '../../types';

/* =========================
 * stats 系
 * ========================= */


export function statsAsync(client: Memcached): Promise<StatusData[]> {
  return new Promise((resolve, reject) => {
    client.stats((err, stats) => {
      if (err) return reject(err);
      resolve(stats);
    });
  });
}

export function settingsAsync(client: Memcached): Promise<StatusData[]> {
  return new Promise((resolve, reject) => {
    client.settings((err, settings) => {
      if (err) return reject(err);
      resolve(settings);
    });
  });
}

export function versionAsync(client: Memcached): Promise<StatusData[]> {
  return new Promise((resolve, reject) => {
    client.version((err, versions) => {
      if (err) return reject(err);
      resolve(versions);
    });
  });
}

/* =========================
 * items / dump 系
 * ========================= */

export function itemsAsync(
  client: Memcached,
): Promise<Array<Record<string, any>>> {
  return new Promise((resolve, reject) => {
    client.items((err, results) => {
      if (err) reject(err);
      else resolve(results ?? []);
    });
  });
}

export function cachedumpAsync(
  client: Memcached,
  server: string,
  slabId: number,
  limit: number,
): Promise<Array<Memcached.CacheDumpData>> {
  return new Promise((resolve, reject) => {
    client.cachedump(server, slabId, limit, (err, results) => {
      if (err) {
        reject(err);
      } else if (!results) {
        resolve([]);
      } else {
        const copied = JSON.parse(JSON.stringify(results));
        resolve(Array.isArray(copied) ? copied : [copied]);
      }
    });
  });
}

export async function getKeysFromSlab(
  client: Memcached,
  server: string,
  slabId: number,
  limit: number,
): Promise<string[]> {
  const dumps = await cachedumpAsync(client, server, slabId, limit);
  return dumps.map((d) => d.key).sort();
}

/* =========================
 * data 操作系
 * ========================= */

export function getMultiAsync(
  client: Memcached,
  keys: string[],
): Promise<Record<string, MemcachedValue>> {
  return new Promise((resolve, reject) => {
    client.getMulti(keys, (err, data) => {
      if (err) reject(err);
      else resolve(data ?? {});
    });
  });
}

export function delAsync(client: Memcached, key: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    client.del(key, (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

export function setAsync(
  client: Memcached,
  key: string,
  value: string | Buffer,
  lifetime: number,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    client.set(key, value, lifetime, (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

export function getAsync(
  client: Memcached,
  key: string,
): Promise<MemcachedValue> {
  return new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

export function flushAsync(client: Memcached): Promise<boolean> {
  return new Promise((resolve, reject) => {
    client.flush((err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
}

export function isIsoDateString(value: string): boolean {
  if (typeof value !== 'string') return false;

  // ISO 8601 (例: 2024-01-01T12:34:56Z)
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

  if (!isoRegex.test(value)) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export function isNumericString(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (value.trim() === '') return false;

  return Number.isFinite(Number(value));
}
