import {
  GeneralColumnType,
  ResultSetDataBuilder,
  sleep,
} from '@l-v-yonsama/rdh';
import {
  ConnectionSetting,
  DbColumn,
  DbSchema,
  DbTable,
  DBType,
  RDSBaseDriver,
  RdsDatabase,
  SQLServerDriver,
} from '../../../src';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { init, init0 } from '../../setup/mssql';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6433,
  user: 'testuser',
  password: 'Pass123zxcv!',
  database: 'testdb',
};
const connectOption: ConnectionSetting = {
  ...baseConnectOption,
  dbType: DBType.SQLServer,
  name: 'mssql',
  sqlServer: {
    encrypt: false,
    // defaultSchema: 'dbo',
  },
};

describe('SQLServerDriver', () => {
  let driver: SQLServerDriver;

  beforeAll(async () => {
    driver = createRDSDriver();
    await driver.connect();
    // await init0();
    // await init();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('SQLServerDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: RdsDatabase;
    let testSchema0Res: DbSchema;
    let testSchema1Res: DbSchema;
    let testTableRes: DbTable;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe(driver.getConnectionRes().database);
      // await saveRes('mysqlDbRes.json', testDbRes);
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.children.length).toBeGreaterThanOrEqual(3);
      testSchema0Res = testDbRes.getSchema({ name: 'schema0' });
      expect(testSchema0Res.name).toBe('schema0');
      testSchema1Res = testDbRes.getSchema({ isDefault: true });
      expect(testSchema1Res.name).toBe('schema1');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchema1Res.getChildByName('testtable');
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
      expect(idRes.extra).toBe('identity');
      // n0
      const n0Res = testTableRes.getChildByName('n0');
      expect(n0Res.colType).toBe(GeneralColumnType.BIT);
      expect(n0Res.nullable).toBe(true);
      // n1
      const n1Res = testTableRes.getChildByName('n1');
      expect(n1Res.colType).toBe(GeneralColumnType.TINYINT);
      expect(n1Res.nullable).toBe(true);
      // s71
      const s71Res = testTableRes.getChildByName('s5');
      expect(s71Res.colType).toBe(GeneralColumnType.BINARY);
      expect(s71Res.nullable).toBe(true);
    });

    it('should have Index on Column resource', async () => {
      const tableRes = testSchema1Res.getChildByName('diff');
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
      const empTable = testSchema1Res.getChildByName('EMP');
      expect(empTable).not.toBeUndefined();
      const deptTable = testSchema1Res.getChildByName('DEPT');
      expect(deptTable).not.toBeUndefined();

      // FROM EMP.DEPTNO -> TO DEPT.DEPTNO
      const fkDetail = empTable.foreignKeys.referenceTo['DEPTNO'];
      expect(fkDetail).toEqual({
        tableName: 'DEPT',
        columnName: 'DEPTNO',
        constraintName: expect.any(String),
      });

      // TO DEPT.DEPTNO <- FROM EMP.DEPTNO
      const fkDetail2 = deptTable.foreignKeys.referencedFrom['DEPTNO'];
      expect(fkDetail2).toEqual({
        tableName: 'EMP',
        columnName: 'DEPTNO',
        constraintName: expect.any(String),
      });
    });

    it('should have composite unique keys', async () => {
      // DIFF2
      const diff2Table = testSchema1Res.getChildByName('diff2');
      expect(diff2Table).not.toBeUndefined();

      expect(diff2Table.getChildByName('first_name').uniqKey).toBe(true);
      expect(diff2Table.getChildByName('last_name').uniqKey).toBe(true);
      expect(diff2Table.uniqueKeys).toEqual([
        {
          name: 'ukd',
          columns: ['first_name', 'last_name'],
        },
      ]);
      expect(diff2Table.getCompareKeys()).toEqual([
        {
          kind: 'primary',
          names: ['id'],
        },
        {
          kind: 'uniq',
          names: ['first_name', 'last_name'],
        },
      ]);
    });
  });

  describe('explainSql', () => {
    it('should return explain and analyze result', async () => {
      const query = 'SELECT * FROM EMP WHERE EMPNO > 1 ';
      const rdh = await driver.explainSql({ sql: query });
      expect(rdh.rows[1].values).toEqual({
        StmtText: expect.any(String),
        PhysicalOp: expect.any(String),
        LogicalOp: expect.any(String),
        Argument: expect.any(String),
        DefinedValues: expect.any(String),
        EstimateRows: expect.any(Number),
        EstimateIO: expect.any(Number),
        EstimateCPU: expect.any(Number),
        AvgRowSize: expect.any(Number),
        TotalSubtreeCost: expect.any(Number),
        OutputList: expect.any(String),
        Warnings: null,
        Type: expect.any(String),
        Parallel: expect.any(Boolean),
        EstimateExecutions: expect.any(Number),
      });
    });
  });

  describe('count', () => {
    it('should return number of rows', async () => {
      if (!driver.isConnected) {
        await driver.connect();
      }
      const count = await driver.count({ table: 'EMP' });
      expect(count).toEqual(6);
    });
  });

  describe('kill', () => {
    it('should success', async () => {
      const result = await Promise.allSettled([
        (async (): Promise<string> => {
          const r = await driver.requestSql({
            sql: "WAITFOR DELAY '00:00:04'",
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
      expect(reason.message.includes('Canceled.')).toBe(true);
    });
  });

  // re-create connection ( connect ,disconnect) in flow

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

  describe('rawQueries', () => {
    beforeAll(async () => {
      await driver.connect();
    });
    it('Create function', async () => {
      const rdh = await driver.requestSql({
        sql: `CREATE OR ALTER FUNCTION addition(
              @a INT, @b INT
          ) RETURNS INT AS
          BEGIN
              DECLARE @c INT;
              SET @c = @a + @b;
              RETURN @c;
          END;`,
        conditions: {
          rawQueries: true,
        },
      });
      expect(rdh).not.toBeUndefined();
    });
    it('Select from function', async () => {
      const rdh = await driver.requestSql({
        sql: `SELECT schema1.addition(12, 34) as answer`,
      });
      expect(rdh.rows[0].values).toEqual({ answer: 46 });
    });
  });

  describe('locks', () => {
    let driver1: RDSBaseDriver;
    let driver2: RDSBaseDriver;
    let driver3: RDSBaseDriver;

    beforeEach(async () => {
      driver1 = createRDSDriver();
      driver2 = createRDSDriver();
      driver3 = createRDSDriver();
      await driver1.connect();
      await driver2.connect();
      await driver3.connect();
    });

    afterEach(async () => {
      await driver1.disconnect();
      await driver2.disconnect();
      await driver3.disconnect();
    }, 10000);

    it('should have status', async () => {
      const sql1 = 'UPDATE EMP SET SAL=SAL WHERE EMPNO = 7839';
      const sql2 = 'UPDATE EMP SET SAL=SAL+1 WHERE EMPNO = 7839';

      await driver1.begin();
      await driver2.begin();

      await driver1.requestSql({ sql: sql1 });
      setTimeout(async () => {
        const result3 = await driver3.getLocks('testDb');
        const lockStatus = result3.rows
          .filter(
            (it) =>
              it.values['request_mode'] === 'X' ||
              it.values['request_mode'] === 'IX',
          )
          .map((it) => it.values['request_status']);
        expect(lockStatus).toEqual(expect.arrayContaining(['GRANT', 'WAIT']));
        await driver1.rollback();
      }, 200);
      await driver2.requestSql({ sql: sql2 });

      await driver2.rollback();
    });
  });

  describe('sessions', () => {
    let driver1: RDSBaseDriver;
    let driver2: RDSBaseDriver;
    let driver3: RDSBaseDriver;

    beforeEach(async () => {
      driver1 = createRDSDriver();
      driver2 = createRDSDriver();
      driver3 = createRDSDriver();
      await driver1.connect();
      await driver2.connect();
      await driver3.connect();
    });

    afterEach(async () => {
      await driver1.disconnect();
      await driver2.disconnect();
      await driver3.disconnect();
    }, 10000);

    it('should have status', async () => {
      const sql1 = 'UPDATE EMP SET SAL=SAL WHERE EMPNO = 7839';
      const sql2 = 'UPDATE EMP SET SAL=SAL+1 WHERE EMPNO = 7839';
      await driver1.begin();
      await driver2.begin();
      await driver1.requestSql({ sql: sql1 });
      setTimeout(async () => {
        const result3Before = await driver3.getSessions('testDb');

        const sessionIdsBefore = result3Before.rows
          .filter(
            (it) =>
              (it.values['query'] + '').indexOf(
                'UPDATE [EMP] set [SAL] = [SAL]+@1',
              ) >= 0,
          )
          .map((it) => it.values['session_id']);
        expect(sessionIdsBefore).toHaveLength(1);
        await driver1.rollback();
      }, 200);

      await driver2.requestSql({ sql: sql2 });
      await driver2.rollback();
    });
  });

  function createRDSDriver(asRoot = false): SQLServerDriver {
    return asRoot
      ? new SQLServerDriver({
          ...connectOption,
          user: 'sa',
          database: 'master',
          password: 'Pass123zxcv!',
          name: 'mssqlRoot',
        })
      : new SQLServerDriver(connectOption);
  }
});
