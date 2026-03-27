import Memcached from 'memcached';
import {
  ConnectionSetting,
  DBDriverResolver,
  DBType,
  MemcacheDatabase,
  MemcacheDriver,
} from '../../../src';
import { setAsync } from '../../../src/drivers/memcache/helper';
import { randomUUID } from 'crypto';
import { ResultSetData, ResultSetDataBuilder } from '@l-v-yonsama/rdh';

describe('MemcacheDriver', () => {
  let driverResolver: DBDriverResolver;
  let driver: MemcacheDriver;

  beforeAll(async () => {
    driverResolver = DBDriverResolver.getInstance();
    const memjsClient = new Memcached('localhost:6211', {
      retries: 1,
      retry: 1000,
      timeout: 5000,
    });

    // await flushAsync(memjsClient);
    const id = randomUUID().substring(0, 8);
    await setAsync(
      memjsClient,
      'buff_' + id,
      Buffer.from([0x0, 0x1, 0x2, 0xf0]),
      3500,
    );
    await setAsync(memjsClient, 'stringKey_' + id, 'stringValue_' + id, 3500);
    await setAsync(memjsClient, 'numEKey_' + id, '5e-3', 3500);
    const date = new Date();
    await setAsync(memjsClient, 'createdAt_' + id, date.toISOString(), 3000);
    await setAsync(
      memjsClient,
      'obj_' + id,
      JSON.stringify({
        name: 'Bob_' + id,
        age: '20',
        description: 'I am a programmer',
      }),
      3000,
    );

    memjsClient.end();

    const setting: ConnectionSetting = {
      host: 'localhost:6211',
      dbType: DBType.Memcache,
      name: 'localMemcache',
    };
    driver = driverResolver.createDriver<MemcacheDriver>(setting);
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('MemcacheDriver');
    });
  });

  describe('scan', () => {
    it('should return values',async () => {
      const { ok, message, result } = await driver.flow(
        async (): Promise<ResultSetData> => {
          return driver.scan({
            target:'',
            matchType: 'partial',
            keyword: 'num',
            limit: 10,
          });
        },
      );

      expect(ok).toBe(true);
      expect(message).toBe('');
      // console.log(ResultSetDataBuilder.from(result).toMarkdown({withType:true,maxPrintLines:30}));
    });

    it('should return exact match value',async () => {
      const { ok, message, result } = await driver.flow(
        async (): Promise<ResultSetData> => {
          return driver.scan({
            target:'',
            matchType: 'exact',
            keyword: 'testKey4',
            limit: 1,
          });
        },
      );

      expect(ok).toBe(true);
      expect(message).toBe('');
      // console.log(ResultSetDataBuilder.from(result).toMarkdown({withType:true}));
    });
  });

  describe('asyncGetResouces', () => {
    let testMemcacheDb0Res: MemcacheDatabase;

    beforeEach(async () => {
      if (!driver.isConnected) {
        await driver.connect();
      }
    });

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testMemcacheDb0Res = dbRootRes[0];
      expect(testMemcacheDb0Res.name).toBe('Server');
      // console.log(testMemcacheDb0Res.children);
    });
  });
});
