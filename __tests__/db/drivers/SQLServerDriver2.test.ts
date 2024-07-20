import { ConnectionSetting, DBType, SQLServerDriver } from '../../../src';

describe('SQLServerDriver2', () => {
  describe('Authorize', () => {
    let driver: SQLServerDriver;
    const connectStringOption: ConnectionSetting = {
      dbType: DBType.SQLServer,
      name: 'mssql_auth_test',
      sqlServer: {
        authenticationType: 'Use Connect String',
      },
    };

    afterEach(async () => {
      await driver.disconnect();
    });

    it('by connect string', async () => {
      connectStringOption.sqlServer.connectString =
        'Server=localhost,6433;Database=testdb;User Id=testuser;Password=Pass123zxcv!;Encrypt=false';
      driver = new SQLServerDriver(connectStringOption);
      expect(await driver.connect()).toBe('');
    });
    it('by connect string2', async () => {
      connectStringOption.sqlServer.connectString =
        'Server=localhost,6433;Database=testdb;User Id=testuser;Password=Pass123zxcv!;Encrypt=true';
      driver = new SQLServerDriver(connectStringOption);
      expect(await driver.connect()).toMatch(/Failed.+self-signed certificate/);
    });
  });
});
