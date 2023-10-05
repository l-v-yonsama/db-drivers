import {
  ConnectionSetting,
  createRdhKey,
  createUndoChangeSQL,
  DBType,
  diff,
  diffToUndoChanges,
  MySQLDriver,
  RdsDatabase,
  RowHelper,
} from '../../src';
import { init } from '../setup/mysql';

describe('ResourceHelper', () => {
  let driver: MySQLDriver;
  let db: RdsDatabase;

  beforeEach(async () => {
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
          sql: 'SELECT LAST_NAME, FIRST_NAME, FULL_NAME,NOTE,BIRTHDAY FROM diff order by birthday asc',
          meta: {
            compareKeys: [
              {
                kind: 'uniq',
                names: ['FULL_NAME'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('diff');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'uniq',
          names: ['FULL_NAME'],
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
          sql: 'SELECT id,s1,s2,n1,d1,s1,g1 FROM testtable order by n2 asc',
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
          sql: 'SELECT LAST_NAME, FIRST_NAME, FULL_NAME,NOTE,BIRTHDAY FROM diff order by birthday asc',
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('diff');
        expect(compareKeys).toHaveLength(2);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: expect.arrayContaining(['LAST_NAME', 'FIRST_NAME']),
        });
        expect(compareKeys[1]).toEqual({
          kind: 'uniq',
          names: ['FULL_NAME'],
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
          sql: 'SELECT id,N0,n1,n2,n3,n4,f1,f2,f3,d1,d2,d3,d4,d5 FROM testtable order by ID',
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
          sql: `DELETE FROM testtable WHERE ID = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET n2=20,f2=20.10,d2='21:43:03' WHERE ID=2`,
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
                id: 11,
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
                N0: false,
                n1: 2,
                n2: 13,
                n3: 104,
                n4: 1005,
                d1: expect.any(Date),
                d2: expect.any(String),
                d3: expect.any(Date),
                d4: expect.any(Date),
                d5: 2023,
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
                n2: 24,
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
            "INSERT INTO testdb.testtable (id,N0,n1,n2,n3,n4,f1,f2,f3,d1,d2,d3,d4,d5) VALUES (1,B'0',2,13,104,1005,12.3456,0.5,0.05,'2023-11-11 00:00:00','12:13:14','2023-11-11 12:13:14','2023-11-11 12:13:14',2023)",
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            "UPDATE testdb.testtable SET n2 = 24,f2 = 0.5,d2 = '12:13:14' WHERE id = 2",
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM testdb.testtable WHERE id  = 11',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT id,N0,n1,n2,n3,n4,f1,f2,f3,d1,d2,d3,d4,d5 FROM testtable order by ID',
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
      it('should create sql success (String, Enum, Set types)', async () => {
        const rdh1 = await driver.requestSql({
          sql: 'SELECT ID,s1,s2,s3a,s3b,s3c,long_column_name_long_text,s4,s8 FROM testtable order by ID',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['ID'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['ID'],
        });

        await driver.requestSql({
          sql: `DELETE FROM testtable WHERE ID = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET s1='modify',s3a='update',s4='b', s8='c' WHERE ID=2`,
        });
        await driver.requestSql({
          sql: `INSERT INTO testtable (long_column_name_long_text) values ('aiueo')`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diffToUndoChanges(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          message: 'toBeInserted:1, toBeDeleted:1, toBeUpdated:1',
          toBeDeleted: [
            {
              conditions: {
                ID: 11,
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                ID: 1,
                s1: 'No1',
                s2: 's2-1',
                s3a: 's3a-1',
                s3b: 's3b-1',
                s3c: 's3c-1',
                s4: 'b',
                s8: 'b',
                long_column_name_long_text: 'long_column_name_long_text-1',
              },
            },
          ],
          toBeUpdated: [
            {
              conditions: {
                ID: 2,
              },
              values: {
                s1: 'No2',
                s3a: 's3a-2',
                s8: 'b',
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
            "INSERT INTO testdb.testtable (ID,s1,s2,s3a,s3b,s3c,long_column_name_long_text,s4,s8) VALUES (1,'No1','s2-1','s3a-1','s3b-1','s3c-1','long_column_name_long_text-1','b','b')",
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            "UPDATE testdb.testtable SET s1 = 'No2',s3a = 's3a-2',s8 = 'b' WHERE ID = 2",
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM testdb.testtable WHERE ID  = 11',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT ID,s1,s2,s3a,s3b,s3c,long_column_name_long_text,s4,s8 FROM testtable order by ID',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['ID'],
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
          sql: 'SELECT ID,j1,n1,s1 FROM testtable order by ID',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['ID'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['ID'],
        });

        await driver.requestSql({
          sql: `DELETE FROM testtable WHERE ID = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET j1=NULL WHERE ID=2`,
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
                ID: 11,
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                ID: 1,
                j1: {
                  k1: 'v1',
                },
                n1: 2,
                s1: 'No1',
              },
            },
          ],
          toBeUpdated: [
            {
              conditions: {
                ID: 2,
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
            'INSERT INTO testdb.testtable (ID,j1,n1,s1) VALUES (1,\'{"k1":"v1"}\',2,\'No1\')',
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            'UPDATE testdb.testtable SET j1 = \'{"k1":"v2"}\' WHERE ID = 2',
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM testdb.testtable WHERE ID  = 11',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT ID,j1,n1,s1 FROM testtable order by ID',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['ID'],
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
          sql: 'SELECT ID,n1,s5,s6,s7,s71,g1 FROM testtable order by ID',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['ID'],
              },
            ],
          },
        });

        const { tableName, compareKeys } = rdh1.meta;
        expect(tableName).toBe('testtable');
        expect(compareKeys).toHaveLength(1);
        expect(compareKeys[0]).toEqual({
          kind: 'primary',
          names: ['ID'],
        });

        await driver.requestSql({
          sql: `DELETE FROM testtable WHERE ID = 1`,
        });
        await driver.requestSql({
          sql: `UPDATE testtable SET n1=NULL, g1=NULL, s7=HEX('ABC') WHERE ID=2`,
        });
        await driver.requestSql({
          sql: `INSERT INTO testtable (g1, s7) values (ST_GeomFromText('POINT(3.2727 200)'), HEX('ABC'))`,
        });

        const rdh2 = await driver.requestSql({ sql: rdh1.sqlStatement });

        const diffResult = diffToUndoChanges(rdh1, rdh2);
        expect(diffResult).toEqual({
          ok: true,
          message: 'toBeInserted:1, toBeDeleted:1, toBeUpdated:1',
          toBeDeleted: [
            {
              conditions: {
                ID: 11,
              },
            },
          ],
          toBeInserted: [
            {
              values: {
                ID: 1,
                n1: 2,
              },
            },
          ],
          toBeUpdated: [
            {
              conditions: {
                ID: 2,
              },
              values: {
                n1: 3,
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
          query: 'INSERT INTO testdb.testtable (ID,n1) VALUES (1,2)',
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query: 'UPDATE testdb.testtable SET n1 = 3 WHERE ID = 2',
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query: 'DELETE FROM testdb.testtable WHERE ID  = 11',
          binds: [],
        });

        // Execute undo SQL.
        for (const undo of undoStatements) {
          const r = await driver.requestSql({ sql: undo.query });
          expect(r.summary.affectedRows).toBe(1);
        }

        // check
        const rdh3 = await driver.requestSql({
          sql: 'SELECT ID,n1,s5,s6,s7,s71,g1 FROM testtable order by ID',
          meta: {
            compareKeys: [
              {
                kind: 'primary',
                names: ['ID'],
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
            "INSERT INTO testdb.diff (last_name,first_name,full_name,note,birthday) VALUES ('Uchida4','Takeshi4','Uchida4 Takeshi4','note4','2023-11-04 00:00:00')",
          binds: [],
        });

        expect(undoStatements[1]).toEqual({
          query:
            "INSERT INTO testdb.diff (last_name,first_name,full_name,note,birthday) VALUES ('Uchida5','Takeshi5','Uchida5 Takeshi5','note5','2023-11-05 00:00:00')",
          binds: [],
        });

        expect(undoStatements[2]).toEqual({
          query:
            "UPDATE testdb.diff SET note = 'note6' WHERE full_name = 'Uchida6 Takeshi6'",
          binds: [],
        });

        expect(undoStatements[3]).toEqual({
          query: "DELETE FROM testdb.diff WHERE full_name  = 'taro yamada'",
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
            'INSERT INTO testdb.diff (last_name,first_name,full_name,note,birthday) VALUES (?,?,?,?,?)',
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
            'INSERT INTO testdb.diff (last_name,first_name,full_name,note,birthday) VALUES (?,?,?,?,?)',
          binds: [
            'Uchida5',
            'Takeshi5',
            'Uchida5 Takeshi5',
            'note5',
            expect.anything(),
          ],
        });

        expect(undoStatementWithBinds[2]).toEqual({
          query: 'UPDATE testdb.diff SET note = ? WHERE full_name = ?',
          binds: ['note6', 'Uchida6 Takeshi6'],
        });

        expect(undoStatementWithBinds[3]).toEqual({
          query: 'DELETE FROM testdb.diff WHERE full_name  = ?',
          binds: ['taro yamada'],
        });
      });
    });
  });
});
