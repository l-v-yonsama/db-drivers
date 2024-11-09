import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DeleteLogGroupCommand,
  DescribeLogGroupsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  AwsDatabase,
  AwsDriver,
  AwsRegion,
  AwsServiceType,
  ConnectionSetting,
  DBDriverResolver,
  DbLogGroup,
  DBType,
  ResourceFilter,
  ResourceType,
  SupplyCredentialType,
} from '../../../src';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.usEast1,
};

describe('AwsCloudwatchClient', () => {
  let logsClient: CloudWatchLogsClient;
  let driver: AwsDriver;

  beforeAll(async () => {
    logsClient = new CloudWatchLogsClient({
      region: connectOption.region,
      endpoint: connectOption.url, // localstack.
      credentials: {
        accessKeyId: connectOption.user,
        secretAccessKey: connectOption.password,
      },
    });
    driver = createDriver();

    try {
      const { logGroups } = await logsClient.send(
        new DescribeLogGroupsCommand({ limit: 50 }),
      );
      for (const logGroup of logGroups) {
        await logsClient.send(
          new DeleteLogGroupCommand({ logGroupName: logGroup.logGroupName }),
        );
      }

      for (const a of [1, 2, 3]) {
        for (const b of [1, 2, 3]) {
          const logGroupName = `a${a}-b${b}_filTer-Test_c${b}-d${a}`;
          await logsClient.send(new CreateLogGroupCommand({ logGroupName }));
          for (let j = 1; j <= 2; j++) {
            await logsClient.send(
              new CreateLogStreamCommand({
                logGroupName,
                logStreamName: `stream${j}`,
              }),
            );
          }
        }
      }

      for (let i = 1; i <= 10; i++) {
        const logGroupName = `logGroupName${i}`;
        await logsClient.send(new CreateLogGroupCommand({ logGroupName }));
        for (let j = 1; j <= 5; j++) {
          await logsClient.send(
            new CreateLogStreamCommand({
              logGroupName,
              logStreamName: `stream${j}`,
            }),
          );
        }
      }
    } catch (_) {
      console.error(_);
    }
  });

  afterAll(async () => {
    logsClient.destroy();
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  it('failed to connect', async () => {
    const setting: ConnectionSetting = {
      name: 'localLog',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.Cloudwatch],
        region: connectOption.region,
      },
      url: 'http://127.0.0.1:100/hoge',
      user: 'xxx',
      password: 'xx',
    };
    const testDriver = DBDriverResolver.getInstance().createDriver(setting);
    expect(await testDriver.connect()).toContain('ECONNREFUSED');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: AwsDatabase;

    describe('no resource filters', () => {
      it('should return Database resource', async () => {
        const dbRootRes = await driver.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('Cloudwatch');
      });

      it('should have DbLogGroup resource', async () => {
        const logGroup = testDbRes.findChildren<DbLogGroup>({
          keyword: 'logGroupName1',
          resourceType: ResourceType.LogGroup,
          recursively: false,
        })[0];
        expect(logGroup.name).toBe('logGroupName1');
        expect(logGroup.attr.storedBytes).toBeDefined();
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
          group: { type: 'prefix', value: 'a2-b1' },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('Cloudwatch');

        const table = testDbRes.getChildByName('a2-b1_filTer-Test_c1-d2');
        expect(table).not.toBeUndefined();

        for (const a of [1, 3]) {
          for (const b of [2, 3]) {
            const tableName = `a${a}-b${b}_filTer-Test_c${b}-d${a}`;
            const table = testDbRes.getChildByName(tableName);
            expect(table).toBeUndefined();
          }
        }
      });

      it('inclue', async () => {
        driver2 = createDriver({
          group: { type: 'include', value: '-B2_FiL' },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('Cloudwatch');

        for (const a of [1, 2, 3]) {
          const tableName = `a${a}-b2_filTer-Test_c2-d${a}`;
          const table = testDbRes.getChildByName(tableName);
          expect(table).not.toBeUndefined();

          for (const b of [1, 3]) {
            const tableName = `a${a}-b${b}_filTer-Test_c${b}-d${a}`;
            const table = testDbRes.getChildByName(tableName);
            expect(table).toBeUndefined();
          }
        }
      });

      it('suffix', async () => {
        driver2 = createDriver({
          group: { type: 'suffix', value: 'c1-d2' },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('Cloudwatch');

        const table = testDbRes.getChildByName('a2-b1_filTer-Test_c1-d2');
        expect(table).not.toBeUndefined();

        for (const a of [1, 3]) {
          for (const b of [2, 3]) {
            const tableName = `a${a}-b${b}_filTer-Test_c${b}-d${a}`;
            const table = testDbRes.getChildByName(tableName);
            expect(table).toBeUndefined();
          }
        }

        await driver2.disconnect();
      });

      it('regex', async () => {
        driver2 = createDriver({
          group: { type: 'regex', value: 'a[23]-B1' },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe('Cloudwatch');

        let table = testDbRes.getChildByName('a2-b1_filTer-Test_c1-d2');
        expect(table).not.toBeUndefined();
        table = testDbRes.getChildByName('a3-b1_filTer-Test_c1-d3');
        expect(table).not.toBeUndefined();

        for (const b of [2, 3]) {
          const tableName = `a1-b${b}_filTer-Test_c${b}-d1`;
          const table = testDbRes.getChildByName(tableName);
          expect(table).toBeUndefined();
        }
      });
    });
  });

  function createDriver(resourceFilter?: ResourceFilter): AwsDriver {
    const setting: ConnectionSetting = {
      name: 'localAwsTest',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.Cloudwatch],
        region: connectOption.region,
      },
      resourceFilter,
      ...connectOption,
    };

    return new AwsDriver(setting);
  }
});
