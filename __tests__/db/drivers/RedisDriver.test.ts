import { Redis, RedisOptions } from 'ioredis';
import {
  RedisDriver,
  DbConnection,
  RedisDatabase,
  RedisKeyType,
  DBDriverResolver,
  ConnectionSetting,
  DBType,
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
      // We can write `age: 20` here but ioredis will convert it to a string anyway.
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
    const con = new DbConnection({
      port: 6379,
      database: '0',
      host: '127.0.0.1',
      user: 'xxxx',
      password: 'xxxx',
    });
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
      const dbRootRes = await driver.getInfomationSchemas({});
      expect(dbRootRes).toHaveLength(16);
      testRedisDb0Res = dbRootRes[0] as RedisDatabase;
      expect(testRedisDb0Res.getName()).toBe(
        driver.getConnectionRes().database,
      );
    });
  });

  describe('asyncScan', () => {
    it('should return values', async () => {
      const keys = await driver.scan({
        target: '0',
        limit: 1000,
        keyword: '*',
        withValue: true,
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
});
