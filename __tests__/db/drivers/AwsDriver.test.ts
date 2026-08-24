import {
  AwsDriver,
  ConnectionSetting,
  DBType,
  SupplyCredentialType,
} from '../../../src';

describe('AwsDriver', () => {
  describe('createClientConfig (credential resolution)', () => {
    it('includes sessionToken when explicitly provided', () => {
      const conRes: ConnectionSetting = {
        dbType: DBType.Aws,
        name: 'aws',
        user: 'AKIAEXAMPLE',
        password: 'secret',
        awsSetting: {
          services: [],
          supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
          sessionToken: 'FQoGZXIvYXdzEXAMPLE',
        },
      } as ConnectionSetting;

      const driver = new AwsDriver(conRes);
      const config = (driver as any).createClientConfig();

      expect(config.credentials).toEqual({
        accessKeyId: 'AKIAEXAMPLE',
        secretAccessKey: 'secret',
        sessionToken: 'FQoGZXIvYXdzEXAMPLE',
      });
    });

    it('omits sessionToken when not provided', () => {
      const conRes: ConnectionSetting = {
        dbType: DBType.Aws,
        name: 'aws',
        user: 'AKIAEXAMPLE',
        password: 'secret',
        awsSetting: {
          services: [],
          supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        },
      } as ConnectionSetting;

      const driver = new AwsDriver(conRes);
      const config = (driver as any).createClientConfig();

      expect(config.credentials).toEqual({
        accessKeyId: 'AKIAEXAMPLE',
        secretAccessKey: 'secret',
      });
      expect('sessionToken' in config.credentials).toBe(false);
    });
  });

  describe('supportsGetDynamoDbPerformanceTuningContext', () => {
    it('answers from the connection setting alone, without requiring a live connection (dynamoClient unset)', () => {
      const conRes: ConnectionSetting = {
        dbType: DBType.Aws,
        name: 'aws',
        awsSetting: { services: ['DynamoDB'] },
      } as ConnectionSetting;

      const driver = new AwsDriver(conRes);
      // Never connected - dynamoClient is still undefined, matching how
      // db-notebook's createSQLSupportDriver()/createRDSDriver() callers
      // use this exact "quick check before opening progress" pattern
      // (see startPerformanceTuningPreview()'s own RDB precedent).
      expect(driver.dynamoClient).toBeUndefined();
      expect(driver.supportsGetDynamoDbPerformanceTuningContext()).toBe(true);
    });

    it('returns false when the connection was not configured with the DynamoDB service', () => {
      const conRes: ConnectionSetting = {
        dbType: DBType.Aws,
        name: 'aws',
        awsSetting: { services: ['S3'] },
      } as ConnectionSetting;

      const driver = new AwsDriver(conRes);
      expect(driver.supportsGetDynamoDbPerformanceTuningContext()).toBe(false);
    });

    it('returns false when awsSetting itself is missing', () => {
      const conRes: ConnectionSetting = { dbType: DBType.Aws, name: 'aws' } as ConnectionSetting;
      const driver = new AwsDriver(conRes);
      expect(driver.supportsGetDynamoDbPerformanceTuningContext()).toBe(false);
    });
  });

  describe('closeSub', () => {
    it('skips services that were never connected instead of crashing', async () => {
      const conRes: ConnectionSetting = {
        dbType: DBType.Aws,
        name: 'aws',
        awsSetting: {
          services: [],
        },
      } as ConnectionSetting;

      const driver = new AwsDriver(conRes);

      // Only S3 was connected; the other 4 clients remain undefined,
      // as they would after a real connectSub() that only enabled S3.
      driver.s3Client = {
        disconnect: jest.fn().mockResolvedValue(''),
      } as any;

      await expect(driver.closeSub()).resolves.toBe('');
      expect(driver.s3Client.disconnect).toHaveBeenCalled();
    });
  });
});
