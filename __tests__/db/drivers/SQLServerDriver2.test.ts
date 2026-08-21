import { ConnectionSetting, DBType, SQLServerDriver } from '../../../src';

describe('SQLServerDriver2', () => {
  describe('showplan bind substitution', () => {
    it('always escapes a bind that is already surrounded by single quotes', () => {
      const driver = new SQLServerDriver({
        dbType: DBType.SQLServer,
        name: 'mssql_bind_escape_test',
      });

      const sql = (driver as any).substituteShowplanBinds(
        'SELECT * FROM t WHERE c = @value AND d = @other',
        ["'a' OR '1'='1'", "O'Reilly"],
        ['@value', '@other'],
      );

      expect(sql).toBe("SELECT * FROM t WHERE c = '''a'' OR ''1''=''1''' AND d = 'O''Reilly'");
    });
  });

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
        'Server=localhost,6433;Database=master;User Id=sa;Password=Pass123zxcv!;Encrypt=false';
      driver = new SQLServerDriver(connectStringOption);
      expect(await driver.connect()).toBe('');
    });
    it('by connect string2', async () => {
      connectStringOption.sqlServer.connectString =
        'Server=localhost,6433;Database=master;User Id=sa;Password=Pass123zxcv!;Encrypt=true';
      driver = new SQLServerDriver(connectStringOption);
      expect(await driver.connect()).toMatch(/Failed.+self-signed certificate/);
    });
  });
});
