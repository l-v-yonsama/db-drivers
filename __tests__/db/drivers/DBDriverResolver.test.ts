import {
  ConnectionSetting,
  DBDriverResolver,
  DBType,
  SQLiteDriver,
} from '../../../src';

describe('DBDriverResolver', () => {
  describe('closeAll', () => {
    it('awaits every disconnect and reports the error before clearing the driver map', async () => {
      const resolver = DBDriverResolver.getInstance();

      const okOption: ConnectionSetting = {
        dbType: DBType.SQLite,
        name: 'ok',
        database: ':memory:',
      };
      const ngOption: ConnectionSetting = {
        dbType: DBType.SQLite,
        name: 'ng',
        database: ':memory:',
      };

      const okDriver = resolver.createRDSDriver<SQLiteDriver>(okOption);
      const ngDriver = resolver.createRDSDriver<SQLiteDriver>(ngOption);

      let ngDisconnectFinished = false;

      jest.spyOn(okDriver, 'disconnect').mockResolvedValue('');
      jest.spyOn(ngDriver, 'disconnect').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        ngDisconnectFinished = true;
        throw new Error('disconnect failed');
      });

      const errorMessage = await resolver.closeAll();

      // closeAll() must wait for the slow disconnect before resolving.
      expect(ngDisconnectFinished).toBe(true);
      expect(errorMessage).toContain('disconnect failed');

      // Both drivers must be removed from the map once closeAll settles.
      expect(() => resolver.getDriverById(okDriver.getConnectionRes().id)).toThrow();
      expect(() => resolver.getDriverById(ngDriver.getConnectionRes().id)).toThrow();
    });
  });
});
