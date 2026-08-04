import {
  AwsDatabase,
  AwsDriver,
  AwsRegion,
  AwsServiceType,
  ConnectionSetting,
  DbSESIdentity,
  DBDriverResolver,
  DBType,
  SupplyCredentialType,
} from '../../../src';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.apNortheast1,
};

describe('AwsSESDriver', () => {
  let driverResolver: DBDriverResolver;
  let driver: AwsDriver;
  const emailAddress = 'sender@example.com';
  const domain = 'example.com';

  beforeAll(async () => {
    driverResolver = DBDriverResolver.getInstance();
    const setting: ConnectionSetting = {
      name: 'localSES',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.SES],
        region: connectOption.region,
      },
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsDriver>(setting);
    await driver.connect();

    await driver.sesClient.verifyEmailAddress(emailAddress);
    await driver.sesClient.verifyDomainIdentity(domain);
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('asyncGetResouces', () => {
    let testDbRes: AwsDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe('SES');
    });

    it('should have a DbSESIdentity child for the verified email address', async () => {
      const identity = testDbRes.children.find(
        (it) => it.name === emailAddress,
      ) as DbSESIdentity;
      expect(identity).toBeDefined();
      expect(identity.attr.identityType).toBe('EmailAddress');
      expect(identity.attr.verificationStatus).toBe('Success');
    });

    it('should have a DbSESIdentity child for the verified domain', async () => {
      const identity = testDbRes.children.find(
        (it) => it.name === domain,
      ) as DbSESIdentity;
      expect(identity).toBeDefined();
      expect(identity.attr.identityType).toBe('Domain');
      expect(identity.attr.verificationStatus).toBe('Success');
    });
  });
});
