import { Redis, RedisOptions } from 'ioredis';
import {
  RedisDriver,
  DbConnection,
  DbKey,
  RedisDatabase,
  RedisCommandType,
  RedisRequest,
  RedisKeyType,
} from '../../../src';

const connectOption: RedisOptions = {
  port: 6000, // Redis port
  host: '127.0.0.1', // Redis host
  password: 'testpass',
};

describe('RedisDriver', () => {
  let redisClient: Redis;
  let driver: RedisDriver;

  beforeAll(async () => {
    redisClient = new Redis({ ...connectOption, db: 0 });
    driver = createDriver();
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
      const keys = await driver.scan(
        0,
        '*',
        1000,
        true,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      );
      let key = keys.find((it) => it.name === 'n1');
      expect(key.val).toBe('1');
      expect(key.type).toBe(RedisKeyType.string);
      expect(key.ttl).toBe(-1);

      key = keys.find((it) => it.name === 'age');
      expect(key.val).toBe('20');
      expect(key.type).toBe(RedisKeyType.string);

      key = keys.find((it) => it.name === 'name');
      expect(key.val).toBe('Bob');
      expect(key.type).toBe(RedisKeyType.string);

      key = keys.find((it) => it.name === 'description');
      expect(key.val).toBe('I am a programmer');
      expect(key.type).toBe(RedisKeyType.string);

      key = keys.find((it) => it.name === 'user-hash');
      expect(key.val).toEqual({
        name: 'Bob',
        age: '20',
        description: 'I am a programmer',
      });
      expect(key.type).toBe(RedisKeyType.hash);

      key = keys.find((it) => it.name === 'list3');
      expect(key.val).toEqual(['1', '2', '3']);
      expect(key.type).toBe(RedisKeyType.list);

      key = keys.find((it) => it.name === 'sortedSet');
      expect(key.val).toEqual(['one', 'dos', 'three', 'quatro']);
      expect(key.type).toBe(RedisKeyType.zset);
    });
  });

  describe('RedisCommandType.GetValue', () => {
    it('should return values', async () => {
      const key = (await driver.executeCommand(
        createRedisRequest(RedisCommandType.GetValue, {
          key: 'n1',
          type: RedisKeyType.string,
        }),
      )) as DbKey;
      expect(key.val).toBe('1');
      expect(key.ttl).toBe(-1);
    });
  });

  function createDriver(): RedisDriver {
    const con = new DbConnection({ ...connectOption, database: '0' });
    return new RedisDriver(con);
  }

  function createRedisRequest(
    command: RedisCommandType,
    options: { key?: string; type?: RedisKeyType },
  ): RedisRequest {
    return {
      connectionId: '1',
      index: 0,
      command,
      ...options,
    };
  }
});
