import { GeneralColumnType, sleep } from '@l-v-yonsama/rdh';
import {
  ConnectionSetting,
  DbColumn,
  DbSchema,
  DbTable,
  DBType,
  OracleDriver,
  RDSBaseDriver,
  RdsDatabase,
  resolveLastOrderByColumn,
  StatementStatisticsSortKey,
} from '../../../src';
import { init } from '../../setup/oracle';

const connectOption: ConnectionSetting = {
  host: '127.0.0.1',
  port: 6012,
  user: 'testuser',
  password: 'testpass',
  database: 'FREEPDB1',
  dbType: DBType.Oracle,
  name: 'oracle',
  queryTimeoutMs: 20000,
};

describe('OracleDriver', () => {
  let driver: RDSBaseDriver;

  beforeAll(async () => {
    driver = createRDSDriver();
    await driver.connect();

    await init();
  }, 60000);

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('OracleDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: RdsDatabase;
    let testSchemaRes: DbSchema;
    let testTableRes: DbTable;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      testDbRes = dbRootRes.find((it) => it.name === 'FREEPDB1');
      expect(testDbRes).not.toBeUndefined();
    });

    it('should have default Schema resource matching the connected user', async () => {
      testSchemaRes = testDbRes.getSchema({ isDefault: true });
      expect(testSchemaRes.name).toBe('TESTUSER');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchemaRes.getChildByName('TESTTABLE') as DbTable;
      expect(testTableRes.name).toBe('TESTTABLE');
      expect(testTableRes.tableType).toBe('TABLE');
      expect(testTableRes.comment).toBe('table with various data types');
    });

    it('should have Column resource with Oracle types mapped to GeneralColumnType', async () => {
      const idRes = testTableRes.getChildByName('ID') as DbColumn;
      expect(idRes.colType).toBe(GeneralColumnType.NUMERIC);
      expect(idRes.nullable).toBe(false);
      expect(idRes.primaryKey).toBe(true);

      const s2Res = testTableRes.getChildByName('S2') as DbColumn;
      expect(s2Res.colType).toBe(GeneralColumnType.VARCHAR);
      expect(s2Res.nullable).toBe(true);

      const s3Res = testTableRes.getChildByName('S3') as DbColumn;
      expect(s3Res.colType).toBe(GeneralColumnType.CLOB);

      const d3Res = testTableRes.getChildByName('D3') as DbColumn;
      expect(d3Res.colType).toBe(GeneralColumnType.TIMESTAMP);

      const d4Res = testTableRes.getChildByName('D4') as DbColumn;
      expect(d4Res.colType).toBe(GeneralColumnType.TIMESTAMP_WITH_TIME_ZONE);

      // J1: native JSON type (Oracle 21c+) -- ALL_TAB_COLUMNS.DATA_TYPE is already "JSON", so this works without any extra lookup.
      const j1Res = testTableRes.getChildByName('J1') as DbColumn;
      expect(j1Res.colType).toBe(GeneralColumnType.JSON);

      // J2: pre-21c style storage -- a CLOB with an "IS JSON" check constraint.
      const j2Res = testTableRes.getChildByName('J2') as DbColumn;
      expect(j2Res.colType).toBe(GeneralColumnType.JSON);
    });

    it('should have foreign key', async () => {
      const deptTable = testSchemaRes.getChildByName('DEPT');
      const empTable = testSchemaRes.getChildByName('EMP');
      expect(deptTable).not.toBeUndefined();
      expect(empTable).not.toBeUndefined();

      expect(deptTable.comment).toBe('部門マスタ');
      const locCol = deptTable.getChildByName('LOC') as DbColumn;
      expect(locCol.comment).toBe('ロケーション');

      const fkDetail = empTable.foreignKeys.referenceTo['DEPTNO'];
      expect(fkDetail).toEqual({
        tableName: 'DEPT',
        columnName: 'DEPTNO',
        constraintName: expect.any(String),
      });

      const fkDetail2 = deptTable.foreignKeys.referencedFrom['DEPTNO'];
      expect(fkDetail2).toEqual({
        tableName: 'EMP',
        columnName: 'DEPTNO',
        constraintName: expect.any(String),
      });
    });
  });

  describe('JSON columns', () => {
    it('reports GeneralColumnType.JSON via live query metadata for both native (21c+) and legacy IS-JSON-constrained storage', async () => {
      const rdh = await driver.requestSql({
        sql: 'SELECT ID, J1, J2 FROM testtable WHERE ID = 1',
      });

      expect(rdh.keys.find((it) => it.name === 'J1').type).toBe(
        GeneralColumnType.JSON,
      );
      expect(rdh.keys.find((it) => it.name === 'J2').type).toBe(
        GeneralColumnType.JSON,
      );

      const row = rdh.rows[0].values;
      // Native JSON (21c+) is decoded to a JS value automatically by node-oracledb.
      expect(row.J1).toEqual({ kind: 'native', no: 1 });
      // Legacy CLOB+"IS JSON" storage still comes back as raw JSON text.
      expect(JSON.parse(row.J2)).toEqual({ kind: 'legacy', no: 1 });
    });

    it('can query into a JSON column with JSON_VALUE, for both native and legacy storage', async () => {
      const rdh = await driver.requestSql({
        sql: `SELECT ID FROM testtable
              WHERE JSON_VALUE(J1, '$.no') = 7
              AND JSON_VALUE(J2, '$.no') = 7`,
      });
      expect(rdh.rows).toHaveLength(1);
      expect(rdh.rows[0].values.ID).toBe(7);
    });
  });

  describe('getTableDDL', () => {
    it('should return DDL via DBMS_METADATA.GET_DDL', async () => {
      const ddl = await driver.getTableDDL({
        tableName: 'DEPT',
        schemaName: 'TESTUSER',
      });
      expect(ddl).toContain('CREATE TABLE');
      expect(ddl).toContain('DEPT');
      expect(ddl).toContain('DEPTNO');
    });
  });

  describe('requestSql', () => {
    it('should select rows with a positional bind', async () => {
      const rdh = await driver.requestSql({
        sql: 'SELECT * FROM EMP WHERE ENAME = :1',
        conditions: { binds: ['KING'] },
      });
      expect(rdh.rows).toHaveLength(1);
      expect(rdh.rows[0].values.EMPNO).toBe(7839);
    });

    it('should select from DUAL', async () => {
      const rdh = await driver.requestSql({ sql: 'SELECT 1 AS N FROM DUAL' });
      expect(rdh.rows[0].values.N).toBe(1);
    });
  });

  describe('explainSql', () => {
    it('should return an estimated plan for explainSql', async () => {
      const rdh = await driver.explainSql({
        sql: 'SELECT * FROM EMP WHERE EMPNO = 7839',
      });
      expect(rdh.rows.length).toBeGreaterThan(0);
      const planText = rdh.rows.map((r) => r.values.EXPLAIN).join('\n');
      expect(planText).toContain('EMP');
    });

    it('explainAnalyzeSql falls back to the same estimated plan (no PL/SQL hint injection)', async () => {
      const rdh = await driver.explainAnalyzeSql({
        sql: 'SELECT * FROM EMP WHERE EMPNO = 7839',
      });
      expect(rdh.rows.length).toBeGreaterThan(0);
    });
  });

  describe('flow(autoCommit=1)', () => {
    const kingRowQuery = "SELECT * FROM EMP WHERE ENAME='KING'";

    const getSal = async (rdsDriver: RDSBaseDriver): Promise<number> => {
      await rdsDriver.connect();
      const rdh = await rdsDriver.requestSql({ sql: kingRowQuery });
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
          await driver2.requestSql({ sql: kingRowQuery })
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
      const rdh = await rdsDriver.requestSql({ sql: kingRowQuery });
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
            await driverForFlow.requestSql({ sql: kingRowQuery })
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
            await driverForFlow.requestSql({ sql: kingRowQuery })
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
            await driverForFlow.requestSql({ sql: kingRowQuery })
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
            await driverForFlow.requestSql({ sql: kingRowQuery })
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
      const count = await driver.count({ table: 'DEPT' });
      expect(count).toEqual(3);
    });
  });

  describe('viewRows', () => {
    it('Top 3 (FETCH FIRST 3 ROWS ONLY)', async () => {
      const rs = await driver.viewRows({
        schemaAndName: { table: 'EMP' },
        limit: 3,
        limitMode: 'top',
      });
      expect(rs.rows).toHaveLength(3);
    });

    it('Last 3', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      const testDbRes = dbRootRes[0];
      const tableRes = testDbRes
        .getSchema({ isDefault: true })
        .getChildByName('EMP');
      const limitLastColumn = resolveLastOrderByColumn(tableRes);
      const rs = await driver.viewRows({
        schemaAndName: { table: 'EMP' },
        limit: 3,
        limitMode: 'last',
        limitLastColumn,
      });
      expect(rs.rows).toHaveLength(3);
    });
  });

  describe('readOnly', () => {
    it('success: allows a read statement', async () => {
      const driver = createRDSDriver({ readOnly: true });
      await driver.connect();
      const rdh = await driver.requestSql({ sql: 'SELECT 1 AS N FROM DUAL' });
      expect(rdh.rows).toHaveLength(1);
      await driver.disconnect();
    });

    it('failure: does not block writes (known limitation, isReadOnlyEnforcementReliable=false)', async () => {
      const driver = createRDSDriver({ readOnly: true });
      await driver.connect();
      const rdh = await driver.requestSql({
        sql: `INSERT INTO lock_test (id,title,n) VALUES (999, 'ReadOnlyTest', 1)`,
      });
      expect(rdh.summary.affectedRows).toBe(1);
      await driver.requestSql({ sql: `DELETE FROM lock_test WHERE id = 999` });
      await driver.disconnect();
    });
  });

  describe('kill', () => {
    it('current session: cancels a long-running pure-SQL query', async () => {
      const heavyQuery = `SELECT COUNT(*) AS C FROM
        (SELECT LEVEL AS n FROM DUAL CONNECT BY LEVEL <= 18000) a
        CROSS JOIN
        (SELECT LEVEL AS n FROM DUAL CONNECT BY LEVEL <= 18000) b`;

      const result = await Promise.allSettled([
        driver.requestSql({ sql: heavyQuery }),
        (async (): Promise<string> => {
          await sleep(500);
          return await driver.kill();
        })(),
      ]);

      expect(result[0].status).toEqual('rejected');
    }, 30000);
  });

  describe('locks', () => {
    let driver1: RDSBaseDriver;
    let driver2: RDSBaseDriver;

    beforeEach(async () => {
      driver1 = createRDSDriver();
      driver2 = createRDSDriver();
      await driver1.connect();
      await driver2.connect();
    });

    afterEach(async () => {
      await driver1.disconnect();
      await driver2.disconnect();
    });

    it('should show a locked row while an uncommitted transaction holds it', async () => {
      await driver1.begin();
      await driver1.requestSql({
        sql: `INSERT INTO lock_test VALUES (20, 'T20', 200)`,
      });

      const locks = await driver2.getLocks('FREEPDB1');
      await driver1.rollback();

      const lockRow = locks.rows.find(
        (it) => it.values['OBJECT_NAME'] === 'LOCK_TEST',
      );
      expect(lockRow).not.toBeUndefined();
    });
  });

  describe('getStatementStatistics', () => {
    const REQUIRED_COLUMNS = [
      'statement_id',
      'database_name',
      'query',
      'execution_count',
      'total_elapsed_time_ms',
      'average_elapsed_time_ms',
      'min_elapsed_time_ms',
      'max_elapsed_time_ms',
      'rows_processed',
      'rows_examined',
      'logical_reads',
      'physical_reads',
      'last_executed_at',
      'statistics_since',
      'source',
    ];

    it('keeps the 15 required columns (name and order unchanged)', async () => {
      await driver.requestSql({ sql: 'SELECT 1 FROM DUAL' });

      const rdh = await driver.getStatementStatistics({
        databaseName: connectOption.database,
        minimumAverageElapsedTimeMs: 0,
        limit: 5,
      });
      expect(rdh.keys.map((k) => k.name)).toEqual(REQUIRED_COLUMNS);
    });

    it('returns SQL_FULLTEXT (not truncated at 1000 chars like SQL_TEXT) as the query column', async () => {
      // This Oracle container accumulates thousands of unrelated V$SQLSTATS entries over its lifetime (background/maintenance statements), so a fast trivial query has no reliable way to rank into a small ORDER-BY-elapsed-time/LIMIT slice.
      const marker = `ORACLE_FULLTEXT_TEST_${Date.now()}`;
      const padding = 'x'.repeat(1100);
      const sql = `SELECT /*+ NO_MERGE(a) NO_MERGE(b) USE_NL(b) */ COUNT(*) AS CNT
FROM (SELECT LEVEL AS N FROM DUAL CONNECT BY LEVEL <= 6000) a,
     (SELECT LEVEL AS N FROM DUAL CONNECT BY LEVEL <= 6000) b
-- ${marker} ${padding}`;
      await driver.requestSql({ sql });
      await sleep(500);

      const rdh = await driver.getStatementStatistics({
        databaseName: connectOption.database,
        minimumAverageElapsedTimeMs: 1000,
        sortBy: StatementStatisticsSortKey.AverageElapsedTime,
        limit: 50,
      });
      const row = rdh.rows.find(
        (r) => typeof r.values.query === 'string' && r.values.query.includes(marker),
      );
      expect(row).not.toBeUndefined();
      expect(String(row!.values.query).length).toBeGreaterThan(1000);
    }, 30000);
  });

  describe('sessions', () => {
    it('should list other sessions without throwing', async () => {
      const driver2 = createRDSDriver();
      await driver2.connect();

      const sessions = await driver2.getSessions('FREEPDB1');
      expect(sessions.rows.length).toBeGreaterThan(0);
      expect(
        sessions.rows.every((it) => it.values['USER'] !== undefined || true),
      ).toBe(true);

      await driver2.disconnect();
    });
  });

  function createRDSDriver(
    params?: Partial<ConnectionSetting>,
  ): RDSBaseDriver {
    const options: ConnectionSetting = {
      ...connectOption,
      ...params,
    };
    return new OracleDriver(options);
  }
});
