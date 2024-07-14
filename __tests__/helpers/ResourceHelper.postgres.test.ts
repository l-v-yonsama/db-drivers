import {
  createRdhKey,
  diff,
  diffToUndoChanges,
  RowHelper,
} from '@l-v-yonsama/rdh';
import * as crypto from 'crypto';
import {
  ConnectionSetting,
  createUndoChangeSQL,
  DBType,
  PostgresDriver,
  RdsDatabase,
} from '../../src';
import { init } from '../setup/postgres';

describe('ResourceHelper', () => {
  let driver: PostgresDriver;
  let db: RdsDatabase;

  beforeEach(async () => {
    await init();

    const conRes: ConnectionSetting = {
      host: '127.0.0.1',
      port: 6002,
      user: 'testuser',
      password: 'testpass',
      database: 'testdb',
      dbType: DBType.Postgres,
      name: 'mysql',
    };
    driver = new PostgresDriver(conRes);
    await driver.connect();

    const dbs = await driver.getInfomationSchemas();
    db = dbs[0];
  });

  afterEach(async () => {
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
                names: ['full_name'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('diff');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'uniq',
          names: ['full_name'],
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
      // beforeAll(async () => {
      //   await init();
      // });

      it('should has pk compareKey in meta', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT * FROM testtable order by n2 asc',
        });
        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['id'],
        });

        await driver.requestSql({
          sql: 'DELETE FROM testtable WHERE ID IN (4,5)',
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET s2='upd' WHERE ID=6`,
        });
        await driver.requestSql({
          sql:
            `INSERT INTO testtable (n1,d1,s1) VALUES ` +
            ` (2, '2020-01-01', 'hello' )`,
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
          names: ['full_name'],
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

  describe('diffToUndoChanges', () => {
    describe('Primary key specified', () => {
      it('should create sql success (Number, Date types)', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT id,n0,n1,n2,n3,n4,f1,f2,f3,d1,d2,d3 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['id'],
        });

        await driver.requestSql({
          sql: `DELETE FROM testtable WHERE id = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET n2=20,f2=20.10,d2='21:43:03' WHERE id=2`,
        });
        await driver.requestSql({
          sql: `INSERT INTO testtable (n1,f1,d1) values (1, 23.4567,'2023-01-01')`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diffToUndoChanges(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          message: 'toBeInserted:1, toBeDeleted:1, toBeUpdated:1',
          toBeDeleted: [
            {
              conditions: {
                id: 201,
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                id: 1,
                f1: '12.3456',
                f2: 0.5,
                f3: 0.05,
                n0: '0',
                n1: 2,
                n2: '4',
                n3: 1,
                n4: '105',
                d1: expect.any(Date),
                d2: expect.any(String),
                d3: expect.any(Date),
              },
            },
          ],
          toBeUpdated: [
            {
              conditions: {
                id: 2,
              },
              values: {
                d2: '12:13:14',
                f2: 0.5,
                n2: '6',
              },
            },
          ],
        });

        const schemaRes = db.getSchema({ isDefault: true });
        const tableRes = schemaRes.getChildByName('testtable');
        const columns = tableRes.children.map((it) =>
          createRdhKey({
            name: it.name,
            type: it.colType,
            comment: it.comment,
          }),
        );

        const undoStatements = createUndoChangeSQL({
          schemaName: schemaRes.name,
          tableName,
          columns,
          diffResult,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
        });

        expect(undoStatements[0]).toEqual({
          query:
            "INSERT INTO public.testtable (id,n0,n1,n2,n3,n4,f1,f2,f3,d1,d2,d3) VALUES (1,B'0',2,4,1,105,12.3456,0.5,0.05,'2023-11-11 00:00:00','12:13:14','2023-11-11 12:13:14')",
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            "UPDATE public.testtable SET n2 = 6,f2 = 0.5,d2 = '12:13:14' WHERE id = 2",
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM public.testtable WHERE id  = 201',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT id,n0,n1,n2,n3,n4,f1,f2,f3,d1,d2,d3 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const result = diff(rdh1, rdh3);
        expect(result).toEqual({
          ok: true,
          deleted: 0,
          inserted: 0,
          updated: 0,
          message: 'No changes',
        });
      });

      it('should create sql success (String types)', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT id,s1,s2,s3 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['id'],
        });

        await driver.requestSql({
          sql: `DELETE FROM testtable WHERE id = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET s1='modify',s3='update' WHERE id=2`,
        });
        await driver.requestSql({
          sql: `INSERT INTO testtable (s3) values ('aiueo')`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diffToUndoChanges(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          message: 'toBeInserted:1, toBeDeleted:1, toBeUpdated:1',
          toBeDeleted: [
            {
              conditions: {
                id: 201,
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                id: 1,
                s1: 'No1       ',
                s2: 's2-1',
                s3: 's3a-1',
              },
            },
          ],
          toBeUpdated: [
            {
              conditions: {
                id: 2,
              },
              values: {
                s1: 'No2       ',
                s3: 's3a-2',
              },
            },
          ],
        });

        const schemaRes = db.getSchema({ isDefault: true });
        const tableRes = schemaRes.getChildByName('testtable');
        const columns = tableRes.children.map((it) =>
          createRdhKey({
            name: it.name,
            type: it.colType,
            comment: it.comment,
          }),
        );

        const undoStatements = createUndoChangeSQL({
          schemaName: schemaRes.name,
          tableName,
          columns,
          diffResult,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
        });

        expect(undoStatements[0]).toEqual({
          query:
            "INSERT INTO public.testtable (id,s1,s2,s3) VALUES (1,'No1       ','s2-1','s3a-1')",
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            "UPDATE public.testtable SET s1 = 'No2       ',s3 = 's3a-2' WHERE id = 2",
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM public.testtable WHERE id  = 201',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT id,s1,s2,s3 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const result = diff(rdh1, rdh3);
        expect(result).toEqual({
          ok: true,
          deleted: 0,
          inserted: 0,
          updated: 0,
          message: 'No changes',
        });
      });

      it('should create sql success (json and some types)', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT id,j1,s4 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['id'],
        });

        await driver.requestSql({
          sql: `DELETE FROM testtable WHERE id = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET j1=NULL WHERE id=2`,
        });
        await driver.requestSql({
          sql: `INSERT INTO testtable (j1) values ('{"v1":"aaa"}')`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diffToUndoChanges(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          message: 'toBeInserted:1, toBeDeleted:1, toBeUpdated:1',
          toBeDeleted: [
            {
              conditions: {
                id: 201,
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                id: 1,
                j1: {
                  k1: 'v1',
                },
              },
            },
          ],
          toBeUpdated: [
            {
              conditions: {
                id: 2,
              },
              values: {
                j1: {
                  k1: 'v2',
                },
              },
            },
          ],
        });

        const schemaRes = db.getSchema({ isDefault: true });
        const tableRes = schemaRes.getChildByName('testtable');
        const columns = tableRes.children.map((it) =>
          createRdhKey({
            name: it.name,
            type: it.colType,
            comment: it.comment,
          }),
        );

        const undoStatements = createUndoChangeSQL({
          schemaName: schemaRes.name,
          tableName,
          columns,
          diffResult,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
        });

        expect(undoStatements[0]).toEqual({
          query:
            'INSERT INTO public.testtable (id,j1) VALUES (1,\'{"k1":"v1"}\')',
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            'UPDATE public.testtable SET j1 = \'{"k1":"v2"}\' WHERE id = 2',
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM public.testtable WHERE id  = 201',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT id,j1,s4 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const result = diff(rdh1, rdh3);
        expect(result).toEqual({
          ok: true,
          deleted: 0,
          inserted: 0,
          updated: 0,
          message: 'No changes',
        });
      });

      it('should create sql success (not support types like binary types)', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT id,n1,s5,s6 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['id'],
        });

        await driver.requestSql({
          sql: `DELETE FROM testtable WHERE id = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET n1=NULL, s5=NULL, s6=NULL WHERE id=2`,
        });
        await driver.requestSql({
          sql: `INSERT INTO testtable (s5, s6) values (decode('013d7d16d7ad4f', 'hex'), $1)`,
          conditions: {
            binds: [crypto.randomUUID()],
          },
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diffToUndoChanges(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          message: 'toBeInserted:1, toBeDeleted:1, toBeUpdated:1',
          toBeDeleted: [
            {
              conditions: {
                id: 201,
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                id: 1,
                n1: 2,
                s6: expect.any(String),
              },
            },
          ],
          toBeUpdated: [
            {
              conditions: {
                id: 2,
              },
              values: {
                n1: 3,
                s6: expect.any(String),
              },
            },
          ],
        });

        const schemaRes = db.getSchema({ isDefault: true });
        const tableRes = schemaRes.getChildByName('testtable');
        const columns = tableRes.children.map((it) =>
          createRdhKey({
            name: it.name,
            type: it.colType,
            comment: it.comment,
          }),
        );

        const undoStatements = createUndoChangeSQL({
          schemaName: schemaRes.name,
          tableName,
          columns,
          diffResult,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
        });

        expect(undoStatements[0]).toEqual({
          query:
            "INSERT INTO public.testtable (id,n1,s6) VALUES (1,2,'6050103d-e0cd-4134-adaa-fe1a9dbd3441')",
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            "UPDATE public.testtable SET n1 = 3,s6 = '6050103d-e0cd-4134-adaa-fe1a9dbd3442' WHERE id = 2",
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM public.testtable WHERE id  = 201',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT id,n1,s5,s6 FROM testtable order by id',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['id'],
              },
            ],
          },
        });

        const result = diff(rdh1, rdh3);
        expect(result).toEqual({
          ok: true,
          deleted: 0,
          inserted: 0,
          updated: 0,
          message: 'No changes',
        });
      });
    });

    describe('Unique key specified', () => {
      it('should create sql success', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT * FROM diff order by birthday asc',
          meta: {
            compareKeys: [
              {
                kind: 'uniq',
                names: ['full_name'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('diff');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'uniq',
          names: ['full_name'],
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

        const diffResult = diffToUndoChanges(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          message: 'toBeInserted:2, toBeDeleted:1, toBeUpdated:1',
          toBeDeleted: [
            {
              conditions: {
                full_name: 'taro yamada',
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                birthday: expect.anything(),
                first_name: 'Takeshi4',
                full_name: 'Uchida4 Takeshi4',
                last_name: 'Uchida4',
                note: 'note4',
              },
            },
            {
              values: {
                birthday: expect.anything(),
                first_name: 'Takeshi5',
                full_name: 'Uchida5 Takeshi5',
                last_name: 'Uchida5',
                note: 'note5',
              },
            },
          ],

          toBeUpdated: [
            {
              conditions: {
                full_name: 'Uchida6 Takeshi6',
              },
              values: {
                note: 'note6',
              },
            },
          ],
        });

        const schemaRes = db.getSchema({ isDefault: true });
        const tableRes = schemaRes.getChildByName('diff');
        const columns = tableRes.children.map((it) =>
          createRdhKey({
            name: it.name,
            type: it.colType,
            comment: it.comment,
          }),
        );

        const undoStatements = createUndoChangeSQL({
          schemaName: schemaRes.name,
          tableName,
          columns,
          diffResult,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
        });

        expect(undoStatements[0]).toEqual({
          query:
            "INSERT INTO public.diff (last_name,first_name,full_name,note,birthday) VALUES ('Uchida4','Takeshi4','Uchida4 Takeshi4','note4','2023-11-04 00:00:00')",
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            "INSERT INTO public.diff (last_name,first_name,full_name,note,birthday) VALUES ('Uchida5','Takeshi5','Uchida5 Takeshi5','note5','2023-11-05 00:00:00')",
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query:
            "UPDATE public.diff SET note = 'note6' WHERE full_name = 'Uchida6 Takeshi6'",
          binds: [],
        });

        expect(undoStatements[3]).toEqual({
          query: "DELETE FROM public.diff WHERE full_name  = 'taro yamada'",
          binds: [],
        });

        const undoStatementWithBinds = createUndoChangeSQL({
          schemaName: schemaRes.name,
          tableName,
          columns,
          diffResult,
          bindOption: {
            specifyValuesWithBindParameters: true,
            toPositionedParameter: false,
          },
        });

        expect(undoStatementWithBinds[0]).toEqual({
          query:
            'INSERT INTO public.diff (last_name,first_name,full_name,note,birthday) VALUES (?,?,?,?,?)',
          binds: [
            'Uchida4',
            'Takeshi4',
            'Uchida4 Takeshi4',
            'note4',
            expect.anything(),
          ],
        });

        expect(undoStatementWithBinds[1]).toEqual({
          query:
            'INSERT INTO public.diff (last_name,first_name,full_name,note,birthday) VALUES (?,?,?,?,?)',
          binds: [
            'Uchida5',
            'Takeshi5',
            'Uchida5 Takeshi5',
            'note5',
            expect.anything(),
          ],
        });

        expect(undoStatementWithBinds[2]).toEqual({
          query: 'UPDATE public.diff SET note = ? WHERE full_name = ?',
          binds: ['note6', 'Uchida6 Takeshi6'],
        });

        expect(undoStatementWithBinds[3]).toEqual({
          query: 'DELETE FROM public.diff WHERE full_name  = ?',
          binds: ['taro yamada'],
        });
      });
    });
  });
});
