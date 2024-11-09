import { GeneralColumnType, sleep, toNum } from '@l-v-yonsama/rdh';
import {
  ConnectionSetting,
  DbColumn,
  DbSchema,
  DbTable,
  DBType,
  MySQLDriver,
  RDSBaseDriver,
  RdsDatabase,
  TransactionIsolationLevel,
} from '../../../src';
import { init } from '../../setup/mysql';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6001,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
  timezone: '+00:00',
};
const connectOption: ConnectionSetting = {
  ...baseConnectOption,
  dbType: DBType.MySQL,
  name: 'mysql',
  lockWaitTimeoutMs: 1000,
  queryTimeoutMs: 2000,
};

describe('MySQLDriver', () => {
  let driver: RDSBaseDriver;
  let rootDriver: RDSBaseDriver;

  beforeAll(async () => {
    driver = createRDSDriver();
    rootDriver = createRDSDriver({ asRoot: true });
    await driver.connect();
    await rootDriver.connect();

    await init();
  });

  afterAll(async () => {
    await driver.disconnect();
    await rootDriver.disconnect();
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

    describe('no resource filters', () => {
      it('should return Database resource', async () => {
        const dbRootRes = await driver.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe(driver.getConnectionRes().database);
        // await saveRes('mysqlDbRes.json', testDbRes);
      });

      it('should have Schema resource', async () => {
        expect(testDbRes.children).toHaveLength(9);
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
        // s71
        const s71Res = testTableRes.getChildByName('s71');
        expect(s71Res.colType).toBe(GeneralColumnType.TINYBLOB);
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
        const fkDetail3 =
          customerTable.foreignKeys.referencedFrom['customer_no'];
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

      it('should have composite unique keys', async () => {
        // DIFF2
        const diff2Table = testSchemaRes.getChildByName('diff2');
        expect(diff2Table).not.toBeUndefined();

        expect(diff2Table.getChildByName('first_name').uniqKey).toBe(true);
        expect(diff2Table.getChildByName('last_name').uniqKey).toBe(true);
        expect(diff2Table.uniqueKeys).toEqual([
          {
            name: 'ukd',
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

    describe('specify resource filters', () => {
      let driver2: RDSBaseDriver;

      afterEach(async () => {
        if (driver2) {
          await driver2.disconnect();
          driver2 = undefined;
        }
      });

      it('prefix', async () => {
        driver2 = createRDSDriver({
          resourceFilter: {
            schema: { type: 'prefix', value: 'a2_b1' },
            table: { type: 'prefix', value: 'c2_d2' },
          },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe(driver.getConnectionRes().database);

        const schemaRes = testDbRes.getChildByName('a2_b1_filTer_Test_c1_d2');
        expect(schemaRes).not.toBeUndefined();
        const tableRes = schemaRes.getChildByName('c2_d2_ftT_e2_f2');
        expect(tableRes).not.toBeUndefined();
        expect(tableRes.children).toHaveLength(1);

        for (const a of [1, 3]) {
          for (const b of [2, 3]) {
            const schemaName = `a${a}_b${b}_filTer_Test_c${b}_d${a}`;
            const schemaRes = testDbRes.getChildByName(schemaName);
            expect(schemaRes).toBeUndefined();
          }
        }
      });

      it('include', async () => {
        driver2 = createRDSDriver({
          resourceFilter: {
            schema: { type: 'include', value: '_b1_filT' },
            table: { type: 'include', value: 'd2_ft' },
          },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe(driver.getConnectionRes().database);

        const schemaRes = testDbRes.getChildByName('a2_b1_filTer_Test_c1_d2');
        expect(schemaRes).not.toBeUndefined();
        const tableRes = schemaRes.getChildByName('c1_d2_ftT_e2_f1');
        expect(tableRes).not.toBeUndefined();
        expect(tableRes.children).toHaveLength(1);

        for (const a of [1, 2, 3]) {
          for (const b of [2, 3]) {
            const schemaName = `a${a}_b${b}_filTer_Test_c${b}_d${a}`;
            const schemaRes = testDbRes.getChildByName(schemaName);
            expect(schemaRes).toBeUndefined();
          }
        }
      });

      it('suffix', async () => {
        driver2 = createRDSDriver({
          resourceFilter: {
            schema: { type: 'suffix', value: 'c1_d2' },
            table: { type: 'suffix', value: 'e2_f1' },
          },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe(driver.getConnectionRes().database);

        const schemaRes = testDbRes.getChildByName('a2_b1_filTer_Test_c1_d2');
        expect(schemaRes).not.toBeUndefined();
        const tableRes = schemaRes.getChildByName('c1_d2_ftT_e2_f1');
        expect(tableRes).not.toBeUndefined();
        expect(tableRes.children).toHaveLength(1);

        for (const a of [1, 2, 3]) {
          for (const b of [2, 3]) {
            const schemaName = `a${a}_b${b}_filTer_Test_c${b}_d${a}`;
            const schemaRes = testDbRes.getChildByName(schemaName);
            expect(schemaRes).toBeUndefined();
          }
        }
      });

      it('regex', async () => {
        driver2 = createRDSDriver({
          resourceFilter: {
            schema: { type: 'regex', value: 'a[12]_B1' },
            table: { type: 'regex', value: 'c2_d[12]' },
          },
        });
        await driver2.connect();

        const dbRootRes = await driver2.getInfomationSchemas();
        expect(dbRootRes).toHaveLength(1);
        testDbRes = dbRootRes[0];
        expect(testDbRes.name).toBe(driver.getConnectionRes().database);

        const schemaRes = testDbRes.getChildByName('a1_b1_filTer_Test_c1_d1');
        expect(schemaRes).not.toBeUndefined();
        const schemaRes2 = testDbRes.getChildByName('a2_b1_filTer_Test_c1_d2');
        expect(schemaRes2).not.toBeUndefined();

        const tableRes = schemaRes.getChildByName('c2_d2_ftT_e2_f2');
        expect(tableRes).not.toBeUndefined();
        expect(tableRes.children).toHaveLength(1);
        const tableRes2 = schemaRes.getChildByName('c2_d1_ftT_e1_f2');
        expect(tableRes2).not.toBeUndefined();

        for (const b of [2, 3]) {
          const schemaName = `a3_b${b}_filTer_Test_c${b}_d3`;
          const schemaRes = testDbRes.getChildByName(schemaName);
          expect(schemaRes).toBeUndefined();
        }
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

  describe('explainSql', () => {
    it('should return explain and analyze result', async () => {
      const query = 'SELECT * FROM EMP WHERE EMPNO = 7839 ';
      const rdh = await driver.explainSql({ sql: query });
      expect(rdh.rows[0].values).toEqual({
        id: 1,
        select_type: 'SIMPLE',
        table: 'EMP',
        partitions: null,
        type: 'const',
        possible_keys: 'PRIMARY',
        key: 'PRIMARY',
        key_len: expect.anything(),
        ref: expect.any(String),
        rows: 1,
        filtered: expect.any(Number),
        Extra: null,
      });

      const analyzedRdh = await driver.explainAnalyzeSql({ sql: query });
      expect(analyzedRdh.rows[0].values['EXPLAIN'].includes('rows=1')).toBe(
        true,
      );
    });

    it('should return explain and analyze result2', async () => {
      const query = 'SELECT * FROM EMP WHERE SAL > 1000 ';
      const rdh = await driver.explainSql({ sql: query });

      expect(rdh.rows[0].values).toEqual({
        id: 1,
        select_type: 'SIMPLE',
        table: 'EMP',
        partitions: null,
        type: 'ALL',
        possible_keys: null,
        key: null,
        key_len: null,
        ref: null,
        rows: 6,
        filtered: expect.any(Number),
        Extra: expect.anything(),
      });

      const analyzedRdh = await driver.explainAnalyzeSql({ sql: query });
      expect(
        analyzedRdh.rows[0].values['EXPLAIN'].includes('Table scan on EMP'),
      ).toBe(true);
    });

    it('should return explain analyze error result', async () => {
      const query = 'DELETE FROM EMP WHERE SAL > 1000 ';
      await driver.begin();
      const rdh = await driver.explainSql({ sql: query });
      const analyzedRdh = await driver.explainAnalyzeSql({ sql: query });
      await driver.rollback();

      expect(rdh.rows[0].values).toEqual({
        id: 1,
        select_type: 'DELETE',
        table: 'EMP',
        partitions: null,
        type: 'ALL',
        possible_keys: null,
        key: null,
        key_len: null,
        ref: null,
        rows: 6,
        filtered: expect.any(Number),
        Extra: expect.anything(),
      });

      expect(
        analyzedRdh.rows[0].values['EXPLAIN'].includes(
          'not executable by iterator executor',
        ),
      ).toBe(true);
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

  describe('switch databse', () => {
    let driver1: RDSBaseDriver;
    beforeEach(async () => {
      driver1 = createRDSDriver();
      await driver1.connect();
    });

    afterEach(async () => {
      await driver1.disconnect();
    });

    it('should have 2 records', async () => {
      const sql1 = 'SELECT * FROM stock_market.`stocks by trading volume`';
      const rs1 = await driver.requestSql({ sql: sql1 });
      expect(rs1.rows).toHaveLength(2);
    });

    it('should have 2 records too', async () => {
      const sql1 = 'SELECT * FROM `stocks by trading volume`';
      const rs1 = await driver1.requestSql({
        sql: sql1,
        prepare: { useDatabaseName: 'stock_market' },
      });
      expect(rs1.rows).toHaveLength(2);
    });
  });

  describe('count', () => {
    it('should return number of rows', async () => {
      const count = await driver.count({ table: 'customer' });
      expect(count).toEqual(10);
    });
  });

  describe('Timeout', () => {
    it('should cause query timeout', async () => {
      const driver = createRDSDriver({ queryTimeoutMs: 500 });
      await driver.connect();
      await expect(
        driver.requestSql({
          sql: `select sleep(3) from testtable `,
        }),
      ).rejects.toThrow(
        'Query execution was interrupted, maximum statement execution time exceeded',
      );
      await driver.disconnect();
    });
  });

  describe('kill', () => {
    it('current session', async () => {
      const result = await Promise.allSettled([
        (async (): Promise<string> => {
          const r = await driver.requestSql({
            sql: "select benchmark(20000000, md5('when will it end?'))",
          });
          return 'Got a benchmark result ' + r;
        })(),
        (async (): Promise<string> => {
          await sleep(500);
          return await driver.kill();
        })(),
      ]);
      expect(result[0].status).toEqual('rejected');
      const reason = (result[0] as PromiseRejectedResult).reason as Error;
      expect(reason.message.includes('Connection lost')).toBe(true);
    });
  });

  describe('rawQueries', () => {
    it('Create function', async () => {
      const rdh = await rootDriver.requestSql({
        sql: `CREATE FUNCTION IF NOT EXISTS addition(
            a FLOAT, b FLOAT
        ) RETURNS DECIMAL(9,2)
        DETERMINISTIC
        BEGIN
            DECLARE c DECIMAL(9,2);
            SET c = a + b;
            RETURN c;
        END;`,
        conditions: {
          rawQueries: true,
        },
      });
      expect(rdh).not.toBeUndefined();
    });
    it('Select from function', async () => {
      const rdh = await rootDriver.requestSql({
        sql: `SELECT addition(1.2, 3.4) as answer`,
      });
      expect(rdh.rows[0].values).toEqual({ answer: '4.60' });
    });
  });

  describe('locks', () => {
    let driver1: RDSBaseDriver;
    let driver2: RDSBaseDriver;
    let driver3: RDSBaseDriver;

    beforeEach(async () => {
      driver1 = createRDSDriver();
      driver2 = createRDSDriver();
      driver3 = createRDSDriver({ asRoot: true });
      await driver1.connect();
      await driver2.connect();
      await driver3.connect();
    });

    afterEach(async () => {
      await driver1.disconnect();
      await driver2.disconnect();
      await driver3.disconnect();
    });

    it('should have Recrod lock', async () => {
      const sql1 = 'SELECT * FROM lock_test WHERE id = 1 FOR UPDATE';
      await driver1.begin();
      await driver1.requestSql({ sql: sql1 });
      const result3 = await driver3.getLocks('testDb');
      await driver1.rollback();

      // TABLE_LOCK
      const tableLockStatus = result3.rows.find(
        (it) => it.values['lock_type'] === 'TABLE',
      )?.values;
      expect(tableLockStatus.lock_mode).toBe('IX');
      expect(tableLockStatus.lock_status).toBe('GRANTED');
      expect(tableLockStatus.lock_data).toBeNull();
      // RECORD_LOCK
      const recordLockStatus = result3.rows.find(
        (it) => it.values['lock_type'] === 'RECORD',
      )?.values;
      expect(recordLockStatus.lock_mode).toBe('X,REC_NOT_GAP');
      expect(recordLockStatus.lock_status).toBe('GRANTED');
      expect(recordLockStatus.lock_data).toBe('1');
    });

    it('should have Gap lock', async () => {
      const sql1 = 'SELECT * FROM lock_test WHERE id = 2 FOR UPDATE';
      await driver1.begin();
      await driver1.requestSql({ sql: sql1 });
      const result3 = await driver3.getLocks('testDb');
      await driver1.rollback();

      // TABLE_LOCK
      const tableLockStatus = result3.rows.find(
        (it) => it.values['lock_type'] === 'TABLE',
      )?.values;
      expect(tableLockStatus.lock_mode).toBe('IX');
      expect(tableLockStatus.lock_status).toBe('GRANTED');
      expect(tableLockStatus.lock_data).toBeNull();
      // RECORD_LOCK
      const recordLockStatus = result3.rows.find(
        (it) => it.values['lock_type'] === 'RECORD',
      )?.values;
      expect(recordLockStatus.lock_mode).toBe('X,GAP');
      expect(recordLockStatus.lock_status).toBe('GRANTED');
      expect(recordLockStatus.lock_data).toBe('5');
    });

    it('should have Next Key lock', async () => {
      const sql1 = 'SELECT * FROM lock_test WHERE id > 5 FOR UPDATE';
      await driver1.begin();
      await driver1.requestSql({ sql: sql1 });
      const result3 = await driver3.getLocks('testDb');
      await driver1.rollback();

      // TABLE_LOCK
      const tableLockStatus = result3.rows.find(
        (it) => it.values['lock_type'] === 'TABLE',
      )?.values;
      expect(tableLockStatus.lock_mode).toBe('IX');
      expect(tableLockStatus.lock_status).toBe('GRANTED');
      expect(tableLockStatus.lock_data).toBeNull();
      // RECORD_LOCK
      const recordLockStatusList = result3.rows
        .filter((it) => it.values['lock_type'] === 'RECORD')
        .map((it) => it.values);
      expect(recordLockStatusList.map((it) => it.lock_mode)).toEqual([
        'X',
        'X',
      ]);
      expect(recordLockStatusList.map((it) => it.lock_status)).toEqual([
        'GRANTED',
        'GRANTED',
      ]);
      expect(recordLockStatusList.map((it) => it.lock_data)).toEqual(
        expect.arrayContaining(['supremum pseudo-record', '10']),
      );
    });
  });

  type LockTestRecord = {
    id: number;
    title: string;
    n: number;
  };

  describe('transaction isolation', () => {
    let driver1: RDSBaseDriver;
    let driver2: RDSBaseDriver;

    beforeEach(async () => {
      const driver = createRDSDriver();
      await driver.connect();
      // init
      await driver.requestSql({ sql: `DELETE FROM lock_test` });
      for (const n of [1, 5, 10]) {
        await driver.requestSql({
          sql: `INSERT INTO lock_test (id,title,n) VALUES(${n}, 'T${n}', ${
            n * 10
          })`,
        });
      }
      await driver.disconnect();
    });

    const getLockTestRecordById = async (
      driver: RDSBaseDriver,
      id: number,
    ): Promise<LockTestRecord> => {
      const r = await driver.requestSql({
        sql: 'SELECT n FROM lock_test WHERE id = ?',
        conditions: { binds: [id + ''] },
      });
      return r.rows[0].values as LockTestRecord;
    };

    const getLockTestSummaryValue = async (
      driver: RDSBaseDriver,
    ): Promise<number> => {
      const r = await driver.requestSql({
        sql: 'SELECT SUM(n) as n FROM lock_test',
      });
      return toNum(r.rows[0].values.n);
    };

    const resetDrivers = async (
      transactionIsolationLevel: TransactionIsolationLevel,
    ): Promise<void> => {
      driver1 = createRDSDriver({ transactionIsolationLevel });
      await driver1.connect();
      driver2 = createRDSDriver({ transactionIsolationLevel });
      await driver2.connect();
    };

    afterEach(async () => {
      await driver1.disconnect();
      await driver2.disconnect();
    });

    test.each([
      'READ UNCOMMITTED',
      'READ COMMITTED',
      'REPEATABLE READ',
      'SERIALIZABLE',
    ])(
      'should succeed in setting the transaction isolation level (%s)',
      async (transactionIsolationLevel: TransactionIsolationLevel) => {
        await resetDrivers(transactionIsolationLevel);
        await expect(driver1.getTransactionIsolationLevel()).resolves.toBe(
          transactionIsolationLevel,
        );
      },
    );

    describe('Level READ UNCOMMITTED', () => {
      it('should cause Dirty read', async () => {
        const transactionIsolationLevel = 'READ UNCOMMITTED';
        await resetDrivers(transactionIsolationLevel);

        await driver1.begin();
        await driver2.begin();

        const beforeRecord = await getLockTestRecordById(driver2, 1);
        await driver1.requestSql({
          sql: `UPDATE lock_test SET n=999 WHERE id=1`,
        });
        const afterRecord = await getLockTestRecordById(driver2, 1);

        expect(beforeRecord.n).toBe(10);
        expect(afterRecord.n).toBe(999);

        await driver1.rollback();
        await driver2.rollback();
      });
    });

    describe('Level READ COMMITTED', () => {
      it('should not cause Dirty read', async () => {
        const transactionIsolationLevel = 'READ COMMITTED';
        await resetDrivers(transactionIsolationLevel);
        await driver1.begin();
        await driver2.begin();

        const beforeRecord = await getLockTestRecordById(driver2, 1);
        await driver1.requestSql({
          sql: `UPDATE lock_test SET n=999 WHERE id=1`,
        });
        const afterRecord = await getLockTestRecordById(driver2, 1);

        expect(beforeRecord.n).toBe(10);
        expect(afterRecord.n).toBe(10);

        await driver1.rollback();
        await driver2.rollback();
      });

      it('should cause Fuzzy read', async () => {
        const transactionIsolationLevel = 'READ COMMITTED';
        await resetDrivers(transactionIsolationLevel);
        await driver1.begin();
        await driver2.begin();

        const beforeRecord = await getLockTestRecordById(driver2, 1);
        await driver1.requestSql({
          sql: `UPDATE lock_test SET n=999 WHERE id=1`,
        });
        const afterRecord = await getLockTestRecordById(driver2, 1);
        expect(beforeRecord.n).toBe(10);
        expect(afterRecord.n).toBe(10);
        await driver1.commit();
        const afterRecord2 = await getLockTestRecordById(driver2, 1);
        expect(afterRecord2.n).toBe(999);
        await driver2.rollback();
      });

      it('should cause Phantom read', async () => {
        const transactionIsolationLevel = 'READ COMMITTED';
        await resetDrivers(transactionIsolationLevel);
        await driver1.begin();
        await driver2.begin();

        const beforeValue = await getLockTestSummaryValue(driver2);
        await driver1.requestSql({
          sql: `INSERT INTO lock_test (id,title,n) VALUES (20, 'T20', 200)`,
        });
        const afterValue = await getLockTestSummaryValue(driver2);

        expect(beforeValue).toBe(160); // 10 + 50 + 100
        expect(afterValue).toBe(160); // 10 + 50 + 100
        await driver1.commit();
        const afterValue2 = await getLockTestSummaryValue(driver2);
        expect(afterValue2).toBe(360); // 10 + 50 + 100 + 200
        await driver2.rollback();
      });
    });

    describe('Level REPEATABLE READ', () => {
      it('should not cause Dirty read', async () => {
        const transactionIsolationLevel = 'REPEATABLE READ';
        await resetDrivers(transactionIsolationLevel);
        await driver1.begin();
        await driver2.begin();

        const beforeRecord = await getLockTestRecordById(driver2, 1);
        await driver1.requestSql({
          sql: `UPDATE lock_test SET n=999 WHERE id=1`,
        });
        const afterRecord = await getLockTestRecordById(driver2, 1);

        expect(beforeRecord.n).toBe(10);
        expect(afterRecord.n).toBe(10);

        await driver1.rollback();
        await driver2.rollback();
      });

      it('should not cause Fuzzy read', async () => {
        const transactionIsolationLevel = 'REPEATABLE READ';
        await resetDrivers(transactionIsolationLevel);
        await driver1.begin();
        await driver2.begin();

        const beforeRecord = await getLockTestRecordById(driver2, 1);
        await driver1.requestSql({
          sql: `UPDATE lock_test SET n=999 WHERE id=1`,
        });
        const afterRecord = await getLockTestRecordById(driver2, 1);
        expect(beforeRecord.n).toBe(10);
        expect(afterRecord.n).toBe(10);
        await driver1.commit();
        const afterRecord2 = await getLockTestRecordById(driver2, 1);
        expect(afterRecord2.n).toBe(10);
        await driver2.rollback();
      });

      it('should not cause Phantom read', async () => {
        const transactionIsolationLevel = 'REPEATABLE READ';
        await resetDrivers(transactionIsolationLevel);
        await driver1.begin();
        await driver2.begin();

        const beforeValue = await getLockTestSummaryValue(driver2);
        await driver1.requestSql({
          sql: `INSERT INTO lock_test (id,title,n) VALUES (20, 'T20', 200)`,
        });
        const afterValue = await getLockTestSummaryValue(driver2);

        expect(beforeValue).toBe(160); // 10 + 50 + 100
        expect(afterValue).toBe(160); // 10 + 50 + 100
        await driver1.commit();
        // InnoDBはリピータブルリード分離レベルではファントムリードは起きません
        const afterValue2 = await getLockTestSummaryValue(driver2);
        expect(afterValue2).toBe(160); // 10 + 50 + 100
        await driver2.rollback();
      });
    });

    describe('Level SERIALIZABLE', () => {
      it('should not cause Phantom read', async () => {
        const transactionIsolationLevel = 'SERIALIZABLE';
        await resetDrivers(transactionIsolationLevel);
        await driver1.begin();
        await driver2.begin();

        await getLockTestSummaryValue(driver2);
        await expect(
          driver1.requestSql({
            sql: `INSERT INTO lock_test (id,title,n) VALUES (20, 'T20', 200)`,
          }),
        ).rejects.toThrow(
          'Lock wait timeout exceeded; try restarting transaction',
        );
        await driver1.rollback();
        await driver2.rollback();
      });
    });
  });

  function createRDSDriver(
    params?: Partial<ConnectionSetting> & { asRoot?: boolean },
  ): RDSBaseDriver {
    let options = { ...connectOption };
    const { asRoot, ...others } = { ...params };
    if (asRoot) {
      options = {
        ...options,
        user: 'root',
        password: 'p@ssw0rd',
      };
    }
    options = {
      ...options,
      ...others,
    };

    return new MySQLDriver(options);
  }
});
