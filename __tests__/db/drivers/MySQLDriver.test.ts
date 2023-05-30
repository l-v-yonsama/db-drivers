import {
  MySQLDriver,
  DbSchema,
  DbTable,
  DbColumn,
  DBType,
  GeneralColumnType,
  RdsDatabase,
  ConnectionSetting,
} from '../../../src';
import { init, saveRes } from '../../setup/mysql';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6001,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
};
const connectOption: ConnectionSetting = {
  ...baseConnectOption,
  dbType: DBType.MySQL,
  name: 'mysql',
};

describe('MySQLDriver', () => {
  let driver: MySQLDriver;

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
    let testDbRes: RdsDatabase;
    let testSchemaRes: DbSchema;
    let testTableRes: DbTable;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe(driver.getConnectionRes().database);
      // await saveRes('mysqlDbRes.json', testDbRes);
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.children).toHaveLength(2);
      testSchemaRes = testDbRes.getSchema({ isDefault: true });
      expect(testSchemaRes.name).toBe('testdb');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchemaRes.getChildByName('testtable');
      expect(testTableRes.name).toBe('testtable');
      expect(testTableRes.tableType).toBe('TABLE');
      expect(testTableRes.comment).toBe('table with various data types');
    });

    it('should have Column resource', async () => {
      // ID
      const idRes = testTableRes.getChildByName('ID');
      expect(idRes.colType).toBe(GeneralColumnType.INTEGER);
      expect(idRes.nullable).toBe(false);
      expect(idRes.primaryKey).toBe(true);
      expect(idRes.extra).toBe('auto_increment');
      // n0
      const n0Res = testTableRes.getChildByName('n0');
      expect(n0Res.colType).toBe(GeneralColumnType.BIT);
      expect(n0Res.nullable).toBe(true);
      // n1
      const n1Res = testTableRes.getChildByName('n1');
      expect(n1Res.colType).toBe(GeneralColumnType.TINYINT);
      expect(n1Res.nullable).toBe(true);
    });

    it('should have Index on Column resource', async () => {
      const tableRes = testSchemaRes.getChildByName('diff');
      expect(tableRes.getPrimaryColumnNames()).toEqual(
        expect.arrayContaining(['last_name', 'first_name']),
      );
      expect(tableRes.getUniqColumnNames()).toEqual(['full_name']);

      const lastName = tableRes.getChildByName('last_name');
      expect(lastName.primaryKey).toBe(true);
      const firstName = tableRes.getChildByName('first_name');
      expect(firstName.primaryKey).toBe(true);
      const fullName = tableRes.children.find(
        (it) => it.name == 'full_name',
      ) as DbColumn;
      expect(fullName.uniqKey).toBe(true);
    });

    it('should have foreign key', async () => {
      // ORDER
      const orderTable = testSchemaRes.getChildByName('order');
      expect(orderTable).not.toBeUndefined();
      // ORDER_DETAIL
      const orderDetailTable = testSchemaRes.getChildByName('order_detail');
      expect(orderDetailTable).not.toBeUndefined();
      // CUSTOMER
      const customerTable = testSchemaRes.getChildByName('customer');
      expect(customerTable).not.toBeUndefined();

      // FROM order.customer_no -> TO CUSTOMER.customer_no
      const fkDetail = orderTable.foreignKeys.referenceTo['customer_no'];
      expect(fkDetail).toEqual({
        tableName: 'customer',
        columnName: 'customer_no',
        constraintName: expect.any(String),
      });

      // FROM order_detail.order_no -> TO order.order_no
      const fkDetail2 = orderDetailTable.foreignKeys.referenceTo['order_no'];
      expect(fkDetail2).toEqual({
        tableName: 'order',
        columnName: 'order_no',
        constraintName: expect.any(String),
      });

      // TO customer.customer_no <- FROM order.customer_no
      const fkDetail3 = customerTable.foreignKeys.referencedFrom['customer_no'];
      expect(fkDetail3).toEqual({
        tableName: 'order',
        columnName: 'customer_no',
        constraintName: expect.any(String),
      });

      // TO order.order_no <- FROM order_detail.order_no
      const fkDetail4 = orderTable.foreignKeys.referencedFrom['order_no'];
      expect(fkDetail4).toEqual({
        tableName: 'order_detail',
        columnName: 'order_no',
        constraintName: expect.any(String),
      });
    });
  });

  describe('requestSql', () => {
    it('should return GLOBAL VARIABLES', async () => {
      const query = "SHOW GLOBAL VARIABLES  LIKE 'group_concat_max_len'";
      const rdh = await driver.requestSql({ sql: query });
      expect(rdh.rows[0].values).toEqual({
        Variable_name: 'group_concat_max_len',
        Value: expect.any(String),
      });
    });
    it('should not throw error', async () => {
      const query = 'SET group_concat_max_len = 10000000';
      await expect(driver.requestSql({ sql: query })).resolves.not.toThrow();
    });
  });

  function createDriver(): MySQLDriver {
    return new MySQLDriver(connectOption);
  }
});
