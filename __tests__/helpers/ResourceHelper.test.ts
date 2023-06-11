import {
  ConnectionSetting,
  DBType,
  diff,
  MySQLDriver,
  RowHelper,
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

    await driver.getInfomationSchemas();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('diff', () => {
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
        expect(RowHelper.hasAnnotation(rdh1.rows[3], 'Del')).toBe(true);
        expect(RowHelper.hasAnnotation(rdh1.rows[4], 'Del')).toBe(true);
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
        expect(RowHelper.hasAnnotation(rdh1.rows[3], 'Del')).toBe(true);
        expect(RowHelper.hasAnnotation(rdh1.rows[4], 'Del')).toBe(true);
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
        expect(RowHelper.hasAnnotation(rdh1.rows[3], 'Del')).toBe(true);
        expect(RowHelper.hasAnnotation(rdh1.rows[4], 'Del')).toBe(true);
      });
    });
  });
});
