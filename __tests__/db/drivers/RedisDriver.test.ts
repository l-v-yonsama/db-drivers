import { Redis, RedisOptions } from 'ioredis';
import {
  ConnectionSetting,
  DBDriverResolver,
  DBType,
  RedisDatabase,
  RedisDriver,
  RedisKeyType,
} from '../../../src';

const connectOption: RedisOptions = {
  port: 6000, // Redis port
  host: '127.0.0.1', // Redis host
  password: 'testpass',
};

describe('RedisDriver', () => {
  let driverResolver: DBDriverResolver;
  let redisClient: Redis;
  let driver: RedisDriver;

  beforeAll(async () => {
    driverResolver = DBDriverResolver.getInstance();
    redisClient = new Redis({ ...connectOption, db: 0 });
    const setting: ConnectionSetting = {
      name: 'localRedis',
      dbType: DBType.Redis,
      database: '0',
      ...connectOption,
    };
    driver = driverResolver.createDriver<RedisDriver>(setting);
    await redisClient.flushall();
    await redisClient.set('s1', 'text', 'EX', 100);
    const user = {
      name: 'Bob',
      // The value of a Redis key can not be a number.
      age: '20',
      description: 'I am a programmer',
    };

    await redisClient.mset(user);
    await redisClient.hmset('user-hash', user);
    await redisClient.zadd(
      'sortedSet',
      1,
      'one',
      2,
      'dos',
      4,
      'quatro',
      3,
      'three',
    );
    await redisClient.set('n1', 1);
    await redisClient.rpush('list3', '1', '2', '3');
  });

  afterAll(async () => {
    await redisClient.quit();
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  it('failed to connect', async () => {
    const con: ConnectionSetting = {
      dbType: DBType.Redis,
      port: 6379,
      database: '0',
      host: '127.0.0.1',
      user: 'xxxx',
      password: 'xxxx',
      name: 'redis',
    };
    const testDriver = new RedisDriver(con);
    expect(await testDriver.connect()).toContain('failed to connect');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('RedisDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testRedisDb0Res: RedisDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testRedisDb0Res = dbRootRes[0];
      expect(testRedisDb0Res.name).toBe(driver.getConnectionRes().database);
      expect(testRedisDb0Res.numOfKeys).toEqual(expect.any(Number));
    });
  });

  describe('scanStream', () => {
    it('should return values', async () => {
      const keys = await driver.scanStream({
        kind: 'redis',
        dbIndex: 0,
        limit: 1000,
        keyGlob: '*',
        fetchValue: {
          limitSize: 100_000,
        },
      });

      let key = keys.find((it) => it.name === 'n1');
      expect(key.params.val).toBe('1');
      expect(key.params.type).toBe(RedisKeyType.string);
      expect(key.params.ttl).toBe(-1);

      key = keys.find((it) => it.name === 'age');
      expect(key.params.val).toBe('20');
      expect(key.params.type).toBe(RedisKeyType.string);

      key = keys.find((it) => it.name === 'name');
      expect(key.params.val).toBe('Bob');
      expect(key.params.type).toBe(RedisKeyType.string);

      key = keys.find((it) => it.name === 'description');
      expect(key.params.val).toBe('I am a programmer');
      expect(key.params.type).toBe(RedisKeyType.string);

      key = keys.find((it) => it.name === 'user-hash');
      expect(key.params.val).toEqual({
        name: 'Bob',
        age: '20',
        description: 'I am a programmer',
      });
      expect(key.params.type).toBe(RedisKeyType.hash);

      key = keys.find((it) => it.name === 'list3');
      expect(key.params.val).toEqual(['1', '2', '3']);
      expect(key.params.type).toBe(RedisKeyType.list);

      key = keys.find((it) => it.name === 'sortedSet');
      expect(key.params.val).toEqual(['one', 'dos', 'three', 'quatro']);
      expect(key.params.type).toBe(RedisKeyType.zset);
    });
  });

  describe('executeCommand', () => {
    it('GET returns a single scalar row (generic case)', async () => {
      const result = await driver.executeCommand('GET s1');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].values.value).toBe('text');
      expect(result.meta.command).toBe('GET s1');
    });

    it('LRANGE returns one row per array element (generic case)', async () => {
      const result = await driver.executeCommand('LRANGE list3 0 -1');
      expect(result.rows).toHaveLength(3);
      expect(result.rows.map((r) => r.values.value)).toEqual(['1', '2', '3']);
    });

    it('HGETALL reshapes into a field/value table (special case)', async () => {
      const result = await driver.executeCommand('HGETALL user-hash');
      expect(result.rows).toHaveLength(3);
      const byField = Object.fromEntries(
        result.rows.map((r) => [r.values.field, r.values.value]),
      );
      expect(byField).toEqual({
        name: 'Bob',
        age: '20',
        description: 'I am a programmer',
      });
    });

    it('quoted argument with embedded space is tokenized as one arg', async () => {
      await driver.executeCommand('SET quoted:key "hello world"');
      const result = await driver.executeCommand('GET quoted:key');
      expect(result.rows[0].values.value).toBe('hello world');
    });

    it('unknown/nil key returns a single null-value row', async () => {
      const result = await driver.executeCommand('GET does-not-exist');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].values.value).toBeNull();
    });

    it('sets a summary describing the row count, like other drivers do', async () => {
      const result = await driver.executeCommand('LRANGE list3 0 -1');
      expect(result.summary.selectedRows).toBe(3);
      expect(result.summary.info).toMatch(/^3 rows in set \(\d+\.\d+ sec\)$/);
    });
  });
});
