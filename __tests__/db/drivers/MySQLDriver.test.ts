import MySQLDriver from '../../../src/db/drivers/MySQLDriver';
import {
  DbConnection,
  DbSchema,
  DbTable,
  DbColumn,
  DbDatabase,
} from '../../../src/db/resource/DbResource';
import { DBType } from '../../../src/db/resource/types/DBType';
import { GeneralColumnType } from '../../../src/db/resource/types/GeneralColumnType';
import { init } from '../../setup/mysql';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6001,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
};
const connectOption = {
  ...baseConnectOption,
  dbType: DBType.MySQL,
  enviroment: 'ut',
};

describe('MySQLDriver', () => {
  let driver: MySQLDriver;
  let conRes: DbConnection;

  beforeAll(async () => {
    driver = createDriver();

    await init();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('MySQLDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: DbDatabase;
    let testSchemaRes: DbSchema;
    let testTableRes: DbTable;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas({});
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0] as DbDatabase;
      expect(testDbRes.getName()).toBe(driver.getConnectionRes().database);
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.getChildren()).toHaveLength(2);
      testSchemaRes = testDbRes.getSchema({ isDefault: true });
      expect(testSchemaRes.getName()).toBe('testdb');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchemaRes.getChildByName('testtable') as DbTable;
      expect(testTableRes.getName()).toBe('testtable');
      expect(testTableRes.tableType).toBe('TABLE');
      expect(testTableRes.comment).toBe('table with various data types');
    });

    it('should have Column resource', async () => {
      // ID
      const idRes = testTableRes.getChildByName('ID') as DbColumn;
      expect(idRes.colType).toBe(GeneralColumnType.INTEGER);
      expect(idRes.nullable).toBe(false);
      expect(idRes.key).toBe('PRI');
      expect(idRes.extra).toBe('auto_increment');
      // n0
      const n0Res = testTableRes.getChildByName('n0') as DbColumn;
      expect(n0Res.colType).toBe(GeneralColumnType.BIT);
      expect(n0Res.nullable).toBe(true);
      // n1
      const n1Res = testTableRes.getChildByName('n1') as DbColumn;
      expect(n1Res.colType).toBe(GeneralColumnType.TINYINT);
      expect(n1Res.nullable).toBe(true);
    });
  });

  function createDriver(): MySQLDriver {
    conRes = new DbConnection(connectOption);
    return new MySQLDriver(conRes);
  }
});
