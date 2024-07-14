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
  let driverResolver: DBDriverResolver;
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
    driverResolver = DBDriverResolver.getInstance();
    const setting: ConnectionSetting = {
      name: 'localLog',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.Cloudwatch],
        region: connectOption.region,
      },
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsDriver>(setting);

    try {
      const { logGroups } = await logsClient.send(
        new DescribeLogGroupsCommand({ limit: 50 }),
      );
      for (const logGroup of logGroups) {
        await logsClient.send(
          new DeleteLogGroupCommand({ logGroupName: logGroup.logGroupName }),
        );
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
});
