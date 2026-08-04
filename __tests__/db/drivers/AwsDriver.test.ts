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
