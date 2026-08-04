import {
  DeleteParameterCommand,
  DescribeParametersCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { ResultSetData } from '@l-v-yonsama/rdh';
import {
  AwsDatabase,
  AwsDriver,
  AwsRegion,
  AwsServiceType,
  ConnectionSetting,
  DBDriverResolver,
  DbSsmParameter,
  DBType,
  SupplyCredentialType,
} from '../../../src';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.apNortheast1,
};

describe('AwsSsmDriver', () => {
  let driverResolver: DBDriverResolver;
  let ssmClient: SSMClient;
  let driver: AwsDriver;
  const plainName = '/test/db-drivers/bucket-name';
  const secureName = '/test/db-drivers/assume-role-arn';
  const secureValue = 'arn:aws:iam::123456789012:role/ExternalAccess';
  const stringListName1 = '/test/db-drivers/allowed-regions';
  const stringListValue1 = 'ap-northeast-1,us-east-1,eu-west-1';
  const stringListName2 = '/test/db-drivers/admin-emails';
  const stringListValue2 = 'admin1@example.com,admin2@example.com';

  beforeAll(async () => {
    ssmClient = new SSMClient({
      region: connectOption.region,
      endpoint: connectOption.url, // localstack.
      credentials: {
        accessKeyId: connectOption.user,
        secretAccessKey: connectOption.password,
      },
    });
    driverResolver = DBDriverResolver.getInstance();
    const setting: ConnectionSetting = {
      name: 'localSSM',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.SSM],
        region: connectOption.region,
      },
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsDriver>(setting);

    try {
      const list = await ssmClient.send(new DescribeParametersCommand({}));
      for (const p of list.Parameters ?? []) {
        await ssmClient.send(new DeleteParameterCommand({ Name: p.Name }));
      }
    } catch (_) {
      console.error(_);
    }

    await ssmClient.send(
      new PutParameterCommand({
        Name: plainName,
        Type: 'String',
        Value: 'external-data-bucket',
      }),
    );
    await ssmClient.send(
      new PutParameterCommand({
        Name: secureName,
        Type: 'SecureString',
        Value: secureValue,
      }),
    );
    await ssmClient.send(
      new PutParameterCommand({
        Name: stringListName1,
        Type: 'StringList',
        Value: stringListValue1,
      }),
    );
    await ssmClient.send(
      new PutParameterCommand({
        Name: stringListName2,
        Type: 'StringList',
        Value: stringListValue2,
      }),
    );
  });

  afterAll(async () => {
    ssmClient.destroy();
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
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
      expect(testDbRes.name).toBe('SSM');
    });

    it('should have DbSsmParameter resources without exposing the value', async () => {
      const param = testDbRes.children.find(
        (it) => it.name === secureName,
      ) as DbSsmParameter;
      expect(param).toBeDefined();
      expect(param.attr.type).toBe('SecureString');
      // The metadata-only listing must never carry the actual value anywhere.
      expect(JSON.stringify(param)).not.toContain(secureValue);
    });

    it('should have DbSsmParameter resources of type StringList', async () => {
      const param = testDbRes.children.find(
        (it) => it.name === stringListName1,
      ) as DbSsmParameter;
      expect(param).toBeDefined();
      expect(param.attr.type).toBe('StringList');
    });
  });

  describe('asyncScan', () => {
    it('returns a masked placeholder, never the real value', async () => {
      const { ok, result } = await driver.flow(
        async (): Promise<ResultSetData> => {
          return await driver.ssmClient.scan({
            kind: 'aws-ssm',
            pathPrefix: '/test/db-drivers/',
            limit: 10,
          });
        },
      );

      expect(ok).toBe(true);
      expect(result.rows).toHaveLength(4);
      result.rows.forEach((row) => {
        expect(row.values['value']).not.toBe(secureValue);
        expect(row.values['value']).not.toBe('external-data-bucket');
        expect(row.values['value']).not.toBe(stringListValue1);
        expect(row.values['value']).not.toBe(stringListValue2);
      });
    });

    it('filters by pathPrefix', async () => {
      const { ok, result } = await driver.flow(async (): Promise<ResultSetData> => {
        return await driver.ssmClient.scan({
          kind: 'aws-ssm',
          pathPrefix: '/test/other-path/',
          limit: 10,
        });
      });

      expect(ok).toBe(true);
      expect(result.rows).toHaveLength(0);
    });
  });

  describe('getParameterValue', () => {
    it('fetches and decrypts the real value on demand', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.ssmClient.getParameterValue(secureName);
      });

      expect(ok).toBe(true);
      expect(result).toBe(secureValue);
    });

    it('fetches a plain String parameter the same way', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.ssmClient.getParameterValue(plainName);
      });

      expect(ok).toBe(true);
      expect(result).toBe('external-data-bucket');
    });

    it('fetches a StringList parameter the same way (raw comma-joined string, not split)', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.ssmClient.getParameterValue(stringListName1);
      });

      expect(ok).toBe(true);
      expect(result).toBe(stringListValue1);
    });
  });
});
