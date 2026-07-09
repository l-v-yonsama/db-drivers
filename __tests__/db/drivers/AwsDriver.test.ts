import { AwsDriver, ConnectionSetting, DBType } from '../../../src';

describe('AwsDriver', () => {
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
