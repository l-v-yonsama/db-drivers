import { GeneralColumnType, sleep } from '@l-v-yonsama/rdh';
import path from 'path';
import {
  ConnectionSetting,
  DbColumn,
  DbSchema,
  DbTable,
  DBType,
  RDSBaseDriver,
  RdsDatabase,
  SQLiteDriver,
} from '../../../src';
import { init } from '../../setup/sqlite';

const databaseFile = path.join('__tests__', 'data', 'sqlite.db');

const connectOption: ConnectionSetting = {
  database: databaseFile,
  dbType: DBType.SQLite,
  name: 'sqlite',
};

const LONG_TIME_QUERY = `WITH RECURSIVE r(i) AS (
  VALUES(0)
  UNION ALL
  SELECT i FROM r
  LIMIT 6500000
)
SELECT i FROM r WHERE i <= 100`;

describe('SQLiteDriver', () => {
  let driver: RDSBaseDriver;

  beforeAll(async () => {
    try {
      await init();
    } catch (e) {
      console.error(e);
    }
    driver = createRDSDriver();
    await driver.connect();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('SQLiteDriver');
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
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.children).toHaveLength(1);
      testSchemaRes = testDbRes.getSchema({ isDefault: true });
      expect(testSchemaRes.name).toBe('Default');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchemaRes.getChildByName('testtable');
      expect(testTableRes.name).toBe('testtable');
      expect(testTableRes.tableType).toBe('TABLE');
    });

    it('should have Column resource', async () => {
      // ID
      const idRes = testTableRes.getChildByName('ID');
      expect(idRes.colType).toBe(GeneralColumnType.INTEGER);
      expect(idRes.primaryKey).toBe(true);
      expect(idRes.extra).toBe('auto_increment');
      // f1
      const n0Res = testTableRes.getChildByName('f1');
      expect(n0Res.colType).toBe(GeneralColumnType.REAL);
      expect(n0Res.nullable).toBe(true);
      // s1
      const n1Res = testTableRes.getChildByName('s1');
      expect(n1Res.colType).toBe(GeneralColumnType.TEXT);
      expect(n1Res.nullable).toBe(false);
      // b1
      const s71Res = testTableRes.getChildByName('b1');
      expect(s71Res.colType).toBe(GeneralColumnType.BLOB);
      expect(s71Res.nullable).toBe(true);
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
      const orderTable = testSchemaRes.getChildByName('order0');
      expect(orderTable).not.toBeUndefined();
      // ORDER_DETAIL
      const orderDetailTable = testSchemaRes.getChildByName('order_detail');
      expect(orderDetailTable).not.toBeUndefined();
      // CUSTOMER
      const customerTable = testSchemaRes.getChildByName('customer');
      expect(customerTable).not.toBeUndefined();

      // FROM order0.customer_no -> TO CUSTOMER.customer_no
      const fkDetail = orderTable.foreignKeys.referenceTo['customer_no'];
      expect(fkDetail).toEqual({
        tableName: 'customer',
        columnName: 'customer_no',
        constraintName: expect.any(String),
      });

      // FROM order_detail.order_no -> TO order0.order_no0
      const fkDetail2 = orderDetailTable.foreignKeys.referenceTo['order_no'];
      expect(fkDetail2).toEqual({
        tableName: 'order0',
        columnName: 'order_no0',
        constraintName: expect.any(String),
      });

      // TO customer.customer_no <- FROM order0.customer_no
      const fkDetail3 = customerTable.foreignKeys.referencedFrom['customer_no'];
      expect(fkDetail3).toEqual({
        tableName: 'order0',
        columnName: 'customer_no',
        constraintName: expect.any(String),
      });

      // TO order.order_no <- FROM order_detail.order_no
      const fkDetail4 = orderTable.foreignKeys.referencedFrom['order_no0'];
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
          columns: ['last_name', 'first_name', 'note'],
        },
      ]);
      expect(diff2Table.getCompareKeys()).toEqual([
        {
          kind: 'primary',
          names: ['id', 'note'],
        },
        {
          kind: 'uniq',
          names: ['last_name', 'first_name', 'note'],
        },
      ]);
    });
  });

  describe('requestSql', () => {
    it('should return 6 records', async () => {
      const query = 'SELECT * FROM EMP';
      const rdh = await driver.requestSql({ sql: query });
      expect(rdh.rows.length).toBe(6);
    });
    it('should return 0 records', async () => {
      const query = 'SELECT * FROM EMP WHERE 1=2';
      const rdh = await driver.requestSql({ sql: query });
      expect(rdh.rows.length).toBe(0);
    });
    it('should return pragma command list', async () => {
      const query = 'Pragma pragma_list';
      const rdh = await driver.requestSql({ sql: query });
      expect(rdh.rows.length).toBeGreaterThan(0);
    });
    it('should return pragma exec result', async () => {
      const query = 'Pragma busy_timeout=5000';
      const rdh = await driver.requestSql({ sql: query });
      expect(rdh.summary.affectedRows).toBe(0);
    });
    it('should throw Error', async () => {
      const query = 'SELECT * FROM EMP2';
      await expect(driver.requestSql({ sql: query })).rejects.toThrow(
        new Error('no such table: EMP2'),
      );
    });
  });

  describe('explainSql', () => {
    it('should return explain and analyze result', async () => {
      const query = 'SELECT * FROM EMP WHERE EMPNO = 7839 ';
      const rdh = await driver.explainSql({ sql: query });
      expect(rdh.rows[0].values).toEqual({
        id: expect.any(Number),
        notused: expect.any(Number),
        parent: expect.any(Number),
        detail: expect.any(String),
      });
    });
  });

  describe('flow(autoCommit=1)', () => {
    const kingRowQuery = "SELECT * FROM EMP WHERE ENAME='KING'";

    const getSal = async (rdsDriver: RDSBaseDriver): Promise<number> => {
      await rdsDriver.connect();

      const rdh = await rdsDriver.requestSql({
        sql: kingRowQuery,
      });
      const sal = rdh.rows[0].values['SAL'];
      await rdsDriver.disconnect();
      return sal;
    };

    it('should be commited', async () => {
      const driver2 = createRDSDriver();

      const kingsSalBeforeUpdate = await getSal(driver2);

      await driver2.flow(async (): Promise<void> => {
        await driver2.requestSql({
          sql: "UPDATE EMP SET SAL=SAL+100 WHERE ENAME='KING'",
        });
        const salInFlow = (
          await driver2.requestSql({
            sql: kingRowQuery,
          })
        ).rows[0].values['SAL'];
        expect(salInFlow).toBe(kingsSalBeforeUpdate + 100);
      });

      const kingsSalAfterTransaction = await getSal(driver2);

      expect(kingsSalBeforeUpdate + 100).toBe(kingsSalAfterTransaction);
    });
  });

  describe('flowTransaction(autoCommit=0)', () => {
    const kingRowQuery = "SELECT * FROM EMP WHERE ENAME='KING'";

    const getSal = async (rdsDriver: RDSBaseDriver): Promise<number> => {
      await rdsDriver.connect();

      const rdh = await rdsDriver.requestSql({
        sql: kingRowQuery,
      });
      const sal = rdh.rows[0].values['SAL'];
      await rdsDriver.disconnect();
      return sal;
    };

    it('should rollback', async () => {
      const driverForFlow = createRDSDriver();

      const kingsSalBeforeUpdate = await getSal(driverForFlow);

      const transactionResult = await driverForFlow.flowTransaction(
        async (): Promise<number> => {
          await driverForFlow.requestSql({
            sql: "UPDATE EMP SET SAL=SAL+100 WHERE ENAME='KING'",
          });
          const salInTransaction = (
            await driverForFlow.requestSql({
              sql: kingRowQuery,
            })
          ).rows[0].values['SAL'];
          expect(salInTransaction).toBe(kingsSalBeforeUpdate + 100);
          return salInTransaction;
        },
        { transactionControlType: 'alwaysRollback' },
      );

      const kingsSalAfterTransaction = await getSal(driverForFlow);

      expect(kingsSalBeforeUpdate).toBe(kingsSalAfterTransaction);
      expect(transactionResult).toEqual({
        ok: true,
        message: '',
        result: kingsSalAfterTransaction + 100,
      });
    });

    it('should commit on success', async () => {
      const driverForFlow = createRDSDriver();

      const kingsSalBeforeUpdate = await getSal(driverForFlow);

      const transactionResult = await driverForFlow.flowTransaction(
        async (): Promise<number> => {
          await driverForFlow.requestSql({
            sql: "UPDATE EMP SET SAL=SAL+100 WHERE ENAME='KING'",
          });
          const salInTransaction = (
            await driverForFlow.requestSql({
              sql: kingRowQuery,
            })
          ).rows[0].values['SAL'];
          expect(salInTransaction).toBe(kingsSalBeforeUpdate + 100);
          return salInTransaction;
        },
        { transactionControlType: 'rollbackOnError' },
      );

      const kingsSalAfterTransaction = await getSal(driverForFlow);

      expect(kingsSalBeforeUpdate + 100).toBe(kingsSalAfterTransaction);
      expect(transactionResult).toEqual({
        ok: true,
        message: '',
        result: kingsSalAfterTransaction,
      });
    });

    it('should rollback on error', async () => {
      const driverForFlow = createRDSDriver();

      const kingsSalBeforeUpdate = await getSal(driverForFlow);

      const transactionResult = await driverForFlow.flowTransaction(
        async (): Promise<number> => {
          await driverForFlow.requestSql({
            sql: "UPDATE EMP SET SAL=SAL+100 WHERE ENAME='KING'",
          });
          const salInTransaction = (
            await driverForFlow.requestSql({
              sql: kingRowQuery,
            })
          ).rows[0].values['SAL'];
          expect(salInTransaction).toBe(kingsSalBeforeUpdate + 100);
          if (salInTransaction >= 0) {
            throw new Error('Something error!');
          }
          return salInTransaction;
        },
        { transactionControlType: 'rollbackOnError' },
      );

      const kingsSalAfterTransaction = await getSal(driverForFlow);

      expect(kingsSalBeforeUpdate).toBe(kingsSalAfterTransaction);
      expect(transactionResult).toEqual({
        ok: false,
        message: 'Something error!',
        result: undefined,
      });
    });

    it('should commit on error', async () => {
      const driverForFlow = createRDSDriver();

      const kingsSalBeforeUpdate = await getSal(driverForFlow);

      const transactionResult = await driverForFlow.flowTransaction(
        async (): Promise<number> => {
          await driverForFlow.requestSql({
            sql: "UPDATE EMP SET SAL=SAL+100 WHERE ENAME='KING'",
          });
          const salInTransaction = (
            await driverForFlow.requestSql({
              sql: kingRowQuery,
            })
          ).rows[0].values['SAL'];
          expect(salInTransaction).toBe(kingsSalBeforeUpdate + 100);
          if (salInTransaction >= 0) {
            throw new Error('Something error!');
          }
          return salInTransaction;
        },
        { transactionControlType: 'alwaysCommit' },
      );

      const kingsSalAfterTransaction = await getSal(driverForFlow);

      expect(kingsSalBeforeUpdate + 100).toBe(kingsSalAfterTransaction);
      expect(transactionResult).toEqual({
        ok: false,
        message: 'Something error!',
        result: undefined,
      });
    });
  });

  describe('count', () => {
    it('should return number of rows', async () => {
      const count = await driver.count({ table: 'customer' });
      expect(count).toEqual(10);
    });
  });

  describe('kill', () => {
    it('should fail', async () => {
      const result = await Promise.allSettled([
        driver.requestSql({
          sql: LONG_TIME_QUERY,
        }),
        (async (): Promise<string> => {
          await sleep(50);
          return await driver.kill();
        })(),
      ]);
      expect(result[0].status).toBe('rejected');
      const firstResult = result[0] as PromiseRejectedResult;
      expect(firstResult.reason.toString()).toMatch(/.*SQLITE_INTERRUPT.*/);
      expect(result[1].status).toBe('fulfilled');
    }, 6000);
  });

  function createRDSDriver(): RDSBaseDriver {
    return new SQLiteDriver(connectOption);
  }
});
