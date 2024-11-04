import {
  AwsDatabase,
  AwsDriver,
  AwsRegion,
  AwsServiceType,
  ConnectionSetting,
  DbS3Bucket,
  DbS3Owner,
  DBType,
  ResourceFilter,
  SupplyCredentialType,
} from '../../../src';

const connectOption = {
  port: 6003,
  user: 'testuser', // aws:accessKeyId
  password: 'testpass', // aws:secretAccessKey
  url: 'http://127.0.0.1:6003',
  region: AwsRegion.usEast1,
};

describe('AwsS3Driver', () => {
  let driver: AwsDriver;
  const bucket = 'testbucket';

  beforeAll(async () => {
    driver = createDriver();
    await driver.connect();

    for (const a of [1, 2, 3]) {
      for (const b of [1, 2, 3]) {
        const bucketName = `a${a}-b${b}-filter-test.c${b}.d${a}`;
        try {
          await driver.s3Client.removeBucket({ bucket: bucketName });
        } catch (e) {
          // The specified bucket does not exist
          console.error('error:' + e.message);
        }
        await driver.s3Client.createBucket({ bucket: bucketName });
      }
    }

    try {
      await driver.s3Client.removeBucket({ bucket });
    } catch (e) {
      // The specified bucket does not exist
      // console.error('error:' + e.message);
    }
    await driver.s3Client.createBucket({ bucket });
    await driver.s3Client.putObject({
      bucket,
      key: 'text/abc.txt',
      body: 'abc',
      contentType: 'text/plain',
      contentLength: 3,
    });
    await driver.s3Client.putObject({
      bucket,
      key: 'text/folder/abc.txt',
      body: 'abc',
      contentType: 'text/plain',
      contentLength: 3,
    });
    await driver.s3Client.putObject({
      bucket,
      key: 'text/empty.txt',
      body: '',
      contentType: 'text/plain',
      contentLength: 0,
    });
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: AwsDatabase;
    let testBucketRes: DbS3Bucket;

    describe('no resource filters', () => {
      it('should return Database resource', async () => {
        const dbRootRes = await driver.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('S3');
      });

      it('should have DbS3Bucket resource', async () => {
        testBucketRes = testDbRes.children.find(
          (it) => it.name == bucket,
        ) as DbS3Bucket;
        expect(testBucketRes.name).toBe(bucket);
      });

      it('should have DbS3Owner resource', async () => {
        const owner = testDbRes.children.find(
          (it) => it.name == 'minio',
        ) as DbS3Owner;
        expect(owner.name).toBe('minio');
      });

      it('should have values', async () => {
        const res = await driver.s3Client.getValueByKey({
          bucket,
          key: 'text/abc.txt',
        });
        const text = await res.Body.transformToString();
        expect(text).toBe('abc');

        const res2 = await driver.s3Client.getValueByKey({
          bucket,
          key: 'text/folder/abc.txt',
        });
        const text2 = await res2.Body.transformToString();
        expect(text2).toBe('abc');

        const res3 = await driver.s3Client.getValueByKey({
          bucket,
          key: 'text/empty.txt',
        });
        const text3 = await res3.Body.transformToString();
        expect(text3).toBe('');
      });

      it('should have values2', async () => {
        const rdh = await driver.s3Client.scan({
          target: bucket,
          limit: 2000,
          withValue: { limitSize: 100_000 },
        });

        expect(rdh.rows.length).toBe(3);

        const row2 = rdh.rows[1];
        expect(row2.values['value']).toBe('');
        const row3 = rdh.rows[2];
        expect(row3.values['value']).toBe('abc');
      });
    });

    describe('specify resource filters', () => {
      let driver2: AwsDriver;

      afterEach(async () => {
        if (driver2) {
          await driver2.disconnect();
          driver2 = undefined;
        }
      });

      it('prefix', async () => {
        driver2 = createDriver({
          bucket: { type: 'prefix', value: 'a2-b1' },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('S3');

        const table = testDbRes.getChildByName('a2-b1-filter-test.c1.d2');
        expect(table).not.toBeUndefined();

        for (const a of [1, 3]) {
          for (const b of [2, 3]) {
            const tableName = `a${a}-b${b}-filter-test.c${b}.d${a}`;
            const table = testDbRes.getChildByName(tableName);
            expect(table).toBeUndefined();
          }
        }
      });

      it('inclue', async () => {
        driver2 = createDriver({
          bucket: { type: 'include', value: '-b2-fil' },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('S3');

        for (const a of [1, 2, 3]) {
          const tableName = `a${a}-b2-filter-test.c2.d${a}`;
          const table = testDbRes.getChildByName(tableName);
          expect(table).not.toBeUndefined();

          for (const b of [1, 3]) {
            const tableName = `a${a}-b${b}-filter-test.c${b}.d${a}`;
            const table = testDbRes.getChildByName(tableName);
            expect(table).toBeUndefined();
          }
        }
      });

      it('suffix', async () => {
        driver2 = createDriver({
          bucket: { type: 'suffix', value: 'c1.d2' },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('S3');

        const table = testDbRes.getChildByName('a2-b1-filter-test.c1.d2');
        expect(table).not.toBeUndefined();

        for (const a of [1, 3]) {
          for (const b of [2, 3]) {
            const tableName = `a${a}-b${b}_filter-test.c${b}.d${a}`;
            const table = testDbRes.getChildByName(tableName);
            expect(table).toBeUndefined();
          }
        }

        await driver2.disconnect();
      });
    });
  });

  function createDriver(resourceFilter?: ResourceFilter): AwsDriver {
    const setting: ConnectionSetting = {
      name: 'localDynamo',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.S3],
        region: connectOption.region,
        s3ForcePathStyle: true,
      },
      resourceFilter,
      ...connectOption,
    };

    return new AwsDriver(setting);
  }
});
