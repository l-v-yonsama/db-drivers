import {
  AnnotationType,
  ConnectionSetting,
  DBType,
  diff,
  MySQLDriver,
  runRuleEngine,
} from '../../src';
import { init } from '../setup/mysql';

describe('ResourceHelper', () => {
  let driver: MySQLDriver;

  beforeAll(async () => {
    await init();

    const conRes: ConnectionSetting = {
      host: '127.0.0.1',
      port: 6001,
      user: 'testuser',
      password: 'testpass',
      database: 'testdb',
      dbType: DBType.MySQL,
      name: 'mysql',
    };
    driver = new MySQLDriver(conRes);
    await driver.connect();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('diff', () => {
    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
    });

    describe('Compare key specified', () => {
      it('should has uniq compareKey', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT * FROM diff order by birthday asc',
          meta: {
            compareKeys: [
              {
                kind: 'uniq',
                name: 'full_name',
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('diff');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'uniq',
          name: 'full_name',
        });

        await driver.requestSql({
          sql: `DELETE FROM diff WHERE last_name IN ('Uchida4','Uchida5')`,
        });
        await driver.requestSql({
          sql: `UPDATE diff SET note='upd' WHERE last_name='Uchida6'`,
        });
        await driver.requestSql({
          sql:
            `INSERT INTO diff (first_name,last_name,full_name,birthday) VALUES ` +
            ` ('taro', 'yamada', 'taro yamada', '2025-12-31' )`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diff(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          deleted: 2,
          inserted: 1,
          updated: 1,
          message: 'Inserted:1, Deleted:2, Updated:1',
        });
        expect(rdh1.rows[3].hasAnnotation(AnnotationType.Del)).toBe(true);
        expect(rdh1.rows[4].hasAnnotation(AnnotationType.Del)).toBe(true);
      });
    });

    describe('Compare key not specified', () => {
      beforeAll(async () => {
        await init();
      });

      it('should has pk compareKey in meta', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT * FROM testtable order by n2 asc',
        });
        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['ID'],
        });

        await driver.requestSql({
          sql: 'DELETE FROM testtable WHERE ID IN (4,5)',
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET s2='upd' WHERE ID=6`,
        });
        await driver.requestSql({
          sql:
            `INSERT INTO testtable (n1,d1,s1,g1) VALUES ` +
            ` (2, '2020-01-01', 'hello',ST_GeomFromText('POINT(15.702727 200)') )`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diff(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          deleted: 2,
          inserted: 1,
          updated: 1,
          message: 'Inserted:1, Deleted:2, Updated:1',
        });
        expect(rdh1.rows[3].hasAnnotation(AnnotationType.Del)).toBe(true);
        expect(rdh1.rows[4].hasAnnotation(AnnotationType.Del)).toBe(true);
      });

      it('should has uniq compareKey in meta', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT * FROM diff order by birthday asc',
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('diff');
        expect(compareKeys).toHaveLength(2);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: expect.arrayContaining(['last_name', 'first_name']),
        });
        expect(compareKeys[1]).toEqual({
          kind: 'uniq',
          name: 'full_name',
        });

        await driver.requestSql({
          sql: `DELETE FROM diff WHERE last_name IN ('Uchida4','Uchida5')`,
        });
        await driver.requestSql({
          sql: `UPDATE diff SET note='upd' WHERE last_name='Uchida6'`,
        });
        await driver.requestSql({
          sql:
            `INSERT INTO diff (first_name,last_name,full_name,birthday) VALUES ` +
            ` ('taro', 'yamada', 'taro yamada', '2025-12-31' )`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diff(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          deleted: 2,
          inserted: 1,
          updated: 1,
          message: 'Inserted:1, Deleted:2, Updated:1',
        });
        expect(rdh1.rows[3].hasAnnotation(AnnotationType.Del)).toBe(true);
        expect(rdh1.rows[4].hasAnnotation(AnnotationType.Del)).toBe(true);
      });
    });
  });

  describe('runRuleEngine', () => {
    it('simple rule', async () => {
      const query = 'select id,n1,n2,n3,n4,d1,d2,s4,s8 from testtable';
      const rdh = await driver.requestSql({
        sql: query,
      });

      const r = await runRuleEngine(rdh, [
        {
          conditions: {
            any: [
              {
                all: [
                  {
                    fact: 's4',
                    operator: 'in',
                    value: ['a', 'c'],
                  },
                  {
                    fact: 'd1',
                    operator: 'equal',
                    value: null,
                  },
                ],
              },
              {
                all: [
                  {
                    fact: 's4',
                    operator: 'equal',
                    value: 'b',
                  },
                  {
                    fact: 'd1',
                    operator: 'notEqual',
                    value: null,
                  },
                ],
              },
              {
                all: [
                  {
                    fact: 's4',
                    operator: 'equal',
                    value: null,
                  },
                ],
              },
            ],
          },
          event: {
            type: 'testtable',
            params: {
              message: 's4:${s4} & d1:${d1} combination violation',
              key: 's4',
            },
          },
          name: 'S4, D1 combination',
        },
      ]);
      expect(r).toBe(false);
      const ruleError = rdh.rows.find((it) =>
        it.hasAnnotation(AnnotationType.Rul),
      );
      expect(ruleError).not.toBeUndefined();
      expect(ruleError.meta['s4'][0].options.result).toBe('S4, D1 combination');
      expect(ruleError.meta['s4'][0].options.message).toBe(
        'Error: s4:b & d1:null combination violation',
      );
    });
  });
});
