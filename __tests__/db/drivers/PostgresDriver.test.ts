import {
  PostgresDriver,
  DbSchema,
  DbTable,
  DbColumn,
  DBType,
  GeneralColumnType,
  RdsDatabase,
  ConnectionSetting,
  sleep,
} from '../../../src';
import { init } from '../../setup/postgres';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6002,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
};
const connectOption: ConnectionSetting = {
  ...baseConnectOption,
  dbType: DBType.Postgres,
  name: 'postgres',
};

// const CREATE_TABLE_STATEMENT = `
// CREATE TABLE testtable (
//   ID SERIAL NOT NULL PRIMARY KEY,
//   n0 BIT,
//   n1 INT,
//   n2 BIGINT,
//   n3 SMALLSERIAL,
//   n4 BIGSERIAL,
//   f1 NUMERIC(6,4),
//   f2 DOUBLE PRECISION,
//   f3 REAL,

//   d1 DATE,
//   d2 TIME,
//   d3 TIMESTAMP,
//   d4 TIMESTAMP WITH TIME ZONE,
//   d5 INTERVAL YEAR,

//   s1 CHAR(10),
//   s2 VARCHAR(10),
//   s3 TEXT,
//   s4 mood,
//   s5 BYTEA,
//   s6 uuid,

//   j1 JSON

// )`;

describe('PostgresDriver', () => {
  let driver: PostgresDriver;

  beforeAll(async () => {
    driver = createDriver();

    await init();
  });

  afterAll(async () => {
    await driver.disconnect();
    // client.end();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('PostgresDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: RdsDatabase;
    let testSchemaRes: DbSchema;
    let testTableRes: DbTable;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      testDbRes = dbRootRes.find((it) => it.name === 'testdb');
      expect(testDbRes.name).toBe(driver.getConnectionRes().database);
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.children).toHaveLength(1);
      testSchemaRes = testDbRes.getSchema({ isDefault: true });
      expect(testSchemaRes.name).toBe('public');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchemaRes.getChildByName('testtable') as DbTable;
      expect(testTableRes.name).toBe('testtable');
      expect(testTableRes.tableType).toBe('TABLE');
      expect(testTableRes.comment).toBe('table with various data types');
    });

    it('should have Column resource', async () => {
      // ID
      const idRes = testTableRes.getChildByName('ID', true) as DbColumn;
      expect(idRes.colType).toBe(GeneralColumnType.INTEGER);
      expect(idRes.nullable).toBe(false);
      expect(idRes.primaryKey).toBe(true);
      expect(idRes.default).toContain('nextval');
      // n0
      const n0Res = testTableRes.getChildByName('n0') as DbColumn;
      expect(n0Res.colType).toBe(GeneralColumnType.BIT);
      expect(n0Res.nullable).toBe(true);
      // n1
      const n1Res = testTableRes.getChildByName('n1') as DbColumn;
      expect(n1Res.colType).toBe(GeneralColumnType.INTEGER);
      expect(n1Res.nullable).toBe(true);
    });

    it('should have foreign key', async () => {
      // ORDER
      const orderTable = testSchemaRes.getChildByName('order1');
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
        tableName: 'order1',
        columnName: 'order_no',
        constraintName: expect.any(String),
      });

      // TO customer.customer_no <- FROM order.customer_no
      const fkDetail3 = customerTable.foreignKeys.referencedFrom['customer_no'];
      expect(fkDetail3).toEqual({
        tableName: 'order1',
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

    it('should have composite unique keys', async () => {
      // DIFF2
      const diff2Table = testSchemaRes.getChildByName('diff2');
      expect(diff2Table).not.toBeUndefined();

      expect(diff2Table.getChildByName('first_name').uniqKey).toBe(true);
      expect(diff2Table.getChildByName('last_name').uniqKey).toBe(true);
      expect(diff2Table.uniqueKeys).toEqual([
        {
          name: expect.any(String),
          columns: ['last_name', 'first_name'],
        },
      ]);
      expect(diff2Table.getCompareKeys()).toEqual([
        {
          kind: 'primary',
          names: ['id'],
        },
        {
          kind: 'uniq',
          names: ['last_name', 'first_name'],
        },
      ]);
    });
  });

  describe('count', () => {
    it('should return number of rows', async () => {
      const count = await driver.count({ table: 'customer' });
      expect(count).toEqual(10);
    });
  });

  describe('kill', () => {
    it('should success', async () => {
      const result = await Promise.allSettled([
        (async (): Promise<string> => {
          const r = await driver.requestSql({
            sql: 'SELECT pg_sleep(10000000000)',
          });
          return 'Got a pg_sleep result ' + r;
        })(),
        (async (): Promise<string> => {
          await sleep(500);
          return await driver.kill();
        })(),
      ]);
      expect(result[0].status).toEqual('rejected');
      const reason = (result[0] as PromiseRejectedResult).reason as Error;
      expect(reason.message.includes('canceling')).toBe(true);
    });
  });

  function createDriver(): PostgresDriver {
    return new PostgresDriver(connectOption);
  }
});
