import { GeneralColumnType, sleep, toNum } from '@l-v-yonsama/rdh';
import {
  ConnectionSetting,
  DbColumn,
  DbSchema,
  DbTable,
  DBType,
  PostgresDriver,
  RDSBaseDriver,
  RdsDatabase,
  TransactionIsolationLevel,
} from '../../../src';
import { init } from '../../setup/postgres';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6002,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
  timezone: '+00:00',
};
const connectOption: ConnectionSetting = {
  ...baseConnectOption,
  dbType: DBType.Postgres,
  name: 'postgres',
  lockWaitTimeoutMs: 1000,
  queryTimeoutMs: 2000,
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
      // await saveRes('postgresDbRes.json', testDbRes);
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.children).toHaveLength(2);
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

  describe('explainSql', () => {
    it('should return explain and analyze result', async () => {
      const query = 'SELECT * FROM EMP WHERE EMPNO = 7839 ';
      const rdh = await driver.explainSql({ sql: query });
      const queryPlan = rdh.rows[0].values['QUERY PLAN'];
      expect(queryPlan).toMatch(/^Index Scan using.+ rows=1.+/);

      const analyzedRdh = await driver.explainAnalyzeSql({ sql: query });
      expect(analyzedRdh.rows[0].values['EXPLAIN']).toMatch(
        /^Index Scan using.+actual time=[0-9.]+ .+/,
      );
    });

    it('should return explain and analyze result2', async () => {
      const query = 'SELECT * FROM EMP WHERE SAL > 1000 ';
      const rdh = await driver.explainSql({ sql: query });
      const queryPlan = rdh.rows[0].values['QUERY PLAN'];

      expect(queryPlan).toMatch(/^Seq Scan on emp .+ rows=.+/);

      const analyzedRdh = await driver.explainAnalyzeSql({ sql: query });
      expect(analyzedRdh.rows[0].values['EXPLAIN']).toMatch(
        /^Seq Scan on emp .+actual time=[0-9.]+ rows=6 .+/,
      );
    });

    it('should return explain analyze error result', async () => {
      const query = 'DELETE FROM EMP WHERE SAL > 1000 ';
      await driver.begin();
      const rdh = await driver.explainSql({ sql: query });
      const queryPlan = rdh.rows[0].values['QUERY PLAN'];
      const analyzedRdh = await driver.explainAnalyzeSql({ sql: query });

      await driver.rollback();

      expect(queryPlan).toMatch(/^Delete on emp .+/);

      expect(analyzedRdh.rows[0].values['EXPLAIN']).toMatch(
        /^Delete on emp .+actual time=[0-9.]+ rows=0 .+/,
      );
    });
  });

  describe('flow(autoCommit=1)', () => {
    const kingRowQuery = "SELECT * FROM EMP WHERE ENAME='KING'";

    const getSal = async (rdsDriver: RDSBaseDriver): Promise<number> => {
      await rdsDriver.connect();

      const rdh = await rdsDriver.requestSql({
        sql: kingRowQuery,
      });
      const sal = rdh.rows[0].values['sal'];
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
      const sal = rdh.rows[0].values['sal'];
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
          ).rows[0].values['sal'];
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
          ).rows[0].values['sal'];
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
          ).rows[0].values['sal'];
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
          ).rows[0].values['sal'];
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
      expect(count).toEqual(5);
    });
  });

  describe('Timeout', () => {
    it('should cause query timeout', async () => {
      const driver = createRDSDriver({ queryTimeoutMs: 500 });
      await driver.connect();
      await expect(
        driver.requestSql({
          sql: `select pg_sleep(10000000000) `,
        }),
      ).rejects.toThrow('canceling statement due to statement timeout');
      await driver.disconnect();
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

  describe('rawQueries', () => {
    it('Create function', async () => {
      const rdh = await rootDriver.requestSql({
        sql: `CREATE OR REPLACE FUNCTION addition(float, float) RETURNS float
    AS 'select $1 + $2;'
    LANGUAGE SQL
    IMMUTABLE
    RETURNS NULL ON NULL INPUT;`,
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
      expect(rdh.rows[0].values).toEqual({ answer: 4.6 });
    });
  });

  // https://www.postgresql.jp/document/12/html/explicit-locking.html#LOCKING-ROWS
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

    it('should have RowExclusiveLock', async () => {
      await driver1.begin();
      // ROW EXCLUSIVE
      // SHARE、SHARE ROW EXCLUSIVE、EXCLUSIVE、およびACCESS EXCLUSIVEロックモードと競合します
      // UPDATE、DELETE、およびINSERTコマンドは、（参照される他の全てのテーブルに対するACCESS SHAREロックに加えて）対象となるテーブル上にこのモードのロックを獲得します。
      // 通常、このロックモードは、テーブルのデータを変更する問い合わせにより獲得されます。
      await driver1.requestSql({
        sql: `INSERT INTO lock_test VALUES (20, 'T20', 200)`,
      });
      const result2 = await driver2.requestSql({
        sql: `SELECT * FROM lock_test LIMIT 1`,
      });
      const result3 = await driver3.getLocks('testDb');
      await driver1.rollback();

      const tableLockStatus = result3.rows.find(
        (it) => it.values['object_name'] === 'lock_test',
      )?.values;
      expect(tableLockStatus.lock_type).toBe('relation');
      expect(tableLockStatus.lock_mode).toBe('RowExclusiveLock');
      expect(tableLockStatus.granted).toBe(true);
      expect(result2.summary.selectedRows).toBe(1);
    });

    it('should have AccessExclusiveLock', async () => {
      await driver1.begin();
      // ACCESS EXCLUSIVE
      // 全てのモードのロック（ACCESS SHARE、ROW SHARE、ROW EXCLUSIVE、SHARE UPDATE EXCLUSIVE、SHARE、SHARE ROW EXCLUSIVE、EXCLUSIVE、および ACCESS EXCLUSIVE）と競合します。
      // このモードにより、その保持者以外にテーブルにアクセスするトランザクションがないことが保証されます。
      // DROP TABLE、TRUNCATE、REINDEX、CLUSTER、VACUUM FULL、（CONCURRENTLYなしの）REFRESH MATERIALIZED VIEWコマンドによって獲得されます。 ALTER INDEXとALTER TABLEの多くの形式もこのレベルでロックを獲得します。 これはまた、明示的にモードを指定しないLOCK TABLE文のデフォルトのロックモードです。
      await driver1.requestSql({ sql: `TRUNCATE TABLE lock_test` });
      const result3 = await driver3.getLocks('testDb');

      // await driver2.setLockWaitTimeout(1);

      await expect(
        driver2.requestSql({
          sql: `SELECT * FROM lock_test LIMIT 1`,
        }),
      ).rejects.toThrow('canceling statement due to lock timeout');

      await driver1.rollback();

      const tableLockStatus = result3.rows
        .filter((it) => it.values['object_name'] === 'lock_test')
        .map((it) => it.values);
      expect(tableLockStatus.map((it) => it.lock_type)).toEqual([
        'relation',
        'relation',
      ]);
      expect(tableLockStatus.map((it) => it.lock_mode)).toEqual(
        expect.arrayContaining(['ShareLock', 'AccessExclusiveLock']),
      );
      expect(tableLockStatus.map((it) => it.granted)).toEqual([true, true]);
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

    const resetDrivers = async (
      transactionIsolationLevel: TransactionIsolationLevel,
    ): Promise<void> => {
      driver1 = createRDSDriver({ transactionIsolationLevel });
      await driver1.connect();
      driver2 = createRDSDriver({ transactionIsolationLevel });
      await driver2.connect();
    };

    const getLockTestRecordById = async (
      driver: RDSBaseDriver,
      id: number,
    ): Promise<LockTestRecord> => {
      const r = await driver.requestSql({
        sql: 'SELECT n FROM lock_test WHERE id = $1',
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
        await driver1.begin();
        await expect(driver1.getTransactionIsolationLevel()).resolves.toBe(
          transactionIsolationLevel,
        );
        await driver1.rollback();
      },
    );

    describe('Level READ UNCOMMITTED', () => {
      it('should not cause Dirty read', async () => {
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
        // PostgreSQLではREAD UNCOMMITTEDはREAD COMMITTEDとして扱われます
        expect(afterRecord.n).toBe(10);

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
        // PostgreSQLの場合リピータブルリード分離レベルではファントムリードは起きません
        const afterValue2 = await getLockTestSummaryValue(driver2);
        expect(afterValue2).toBe(160); // 10 + 50 + 100
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
        // user: 'root',
        // password: 'p@ssw0rd',
      };
    }
    options = {
      ...options,
      ...others,
    };
    return new PostgresDriver(options);
  }
});
