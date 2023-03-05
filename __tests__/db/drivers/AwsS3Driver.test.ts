import AwsS3Driver from '../../../src/db/drivers/AwsS3Driver';
import {
  DbConnection,
  DbDatabase,
  DbS3Bucket,
  DbS3Owner,
} from '../../../src/db/resource/DbResource';
import { DBType } from '../../../src/db/resource/types/DBType';

const connectOption = {
  port: 6003,
  user: 'testuser', // aws:accessKeyId
  password: 'testpass', // aws:secretAccessKey
  url: 'http://127.0.0.1:6003',
  region: 'us-west-1',
};

describe('AwsS3Driver', () => {
  let driver: AwsS3Driver;
  const bucket = 'testbucket';

  beforeAll(async () => {
    driver = createDriver();
    await driver.connect();
    try {
      await driver.removeBucket({ bucket });
    } catch (e) {
      // The specified bucket does not exist
      // console.error('error:' + e.message);
    }
    await driver.createBucket({ bucket });
    await driver.putObject({ bucket, key: 'text/abc.txt', body: 'abc' });
    await driver.putObject({
      bucket,
      key: 'text/folder/abc.txt',
      body: 'abc',
    });
    await driver.putObject({ bucket, key: 'text/empty.txt', body: '' });
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsS3Driver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: DbDatabase;
    let testBucketRes: DbS3Bucket;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas({});
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0] as DbDatabase;
      expect(testDbRes.getName()).toBe('S3');
    });

    it('should have DbS3Bucket resource', async () => {
      testBucketRes = testDbRes.getChildByName(bucket) as DbS3Bucket;
      expect(testBucketRes.getName()).toBe(bucket);
    });

    it('should have DbS3Owner resource', async () => {
      const owner = testDbRes.getChildByName('minio') as DbS3Owner;
      expect(owner.getName()).toBe('minio');
    });

    it('should have values', async () => {
      const textValue = await driver.getValueByKey({
        bucket,
        key: 'text/abc.txt',
      });
      expect(textValue).toBe('abc');

      const textValue2 = await driver.getValueByKey({
        bucket,
        key: 'text/folder/abc.txt',
      });
      expect(textValue2).toBe('abc');

      const textValue3 = await driver.getValueByKey({
        bucket,
        key: 'text/empty.txt',
      });
      expect(textValue3).toBe('');
    });
  });

  function createDriver(): AwsS3Driver {
    const con = new DbConnection({ ...connectOption, dbType: DBType.Minio });
    return new AwsS3Driver(con);
  }
});
