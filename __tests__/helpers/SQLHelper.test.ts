import {
  createRdhKey,
  eolToSpace,
  isNumericLike,
  isTextLike,
  RdhKey,
} from '@l-v-yonsama/rdh';
import {
  hasSetVariableClause,
  isReadOnlyQuery,
  normalizeQuery,
  parseQuery,
  RdsDatabase,
  separateMultipleQueries,
  toInsertStatement,
  toSafeQueryForPgsqlAst,
  toViewDataNormalizedQuery,
  toViewDataQuery,
} from '../../src';
import * as SQLHelperExports from '../../src';
import { loadMysqlDbFixture } from '../setup/mysql';

describe('SQLHelper', () => {
  let db: RdsDatabase;

  beforeAll(async () => {
    db = await loadMysqlDbFixture();
  });

  describe('module exports', () => {
    // Guard against the package barrel (src/index.ts) silently dropping a
    // re-export of a function this file's describe blocks exercise below.
    it('still exposes every function tested in this file', () => {
      const exportedFunctionNames = [
        'normalizeQuery',
        'parseQuery',
        'isReadOnlyQuery',
        'toViewDataQuery',
        'toViewDataNormalizedQuery',
        'toInsertStatement',
        'hasSetVariableClause',
        'separateMultipleQueries',
        'toSafeQueryForPgsqlAst',
      ];

      exportedFunctionNames.forEach((name) => {
        expect(typeof (SQLHelperExports as any)[name]).toBe('function');
      });
    });
  });

  describe('normalizeQuery', () => {
    describe('Named query to positioned parameter query', () => {
      it('transform a named query to a standard positioned parameters query', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx /* \na\nbc */where id = :id AND other=:other + :id',
          toPositionedParameter: true,
          bindParams: { id: 'myId', other: 42 },
        });

        expect(query).toBe('select * from xxx where id = $1 AND other=$2 + $1');
        expect(binds).toEqual(['myId', 42]);
      });

      it('transform a named query to a standard positioned parameters query2(for PostgreSQL)', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where id IN (:ids) AND other IN ( :others )',
          toPositionedParameter: true,
          bindParams: { ids: ['myId1', 'myId2', 'myId3'], others: [42] },
        });

        expect(query).toBe(
          'select * from xxx where id IN ($1,$2,$3) AND other IN ( $4 )',
        );
        expect(binds).toEqual(['myId1', 'myId2', 'myId3', 42]);
      });

      it('transform a named query to a standard positioned parameters query3(for SQL Server)', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where id IN (:ids) AND other IN ( :others )',
          toPositionedParameter: true,
          toPositionalCharacter: '@', // for SQL Server
          bindParams: { ids: ['myId1', 'myId2', 'myId3'], others: [42] },
        });

        expect(query).toBe(
          'select * from xxx where id IN (@1,@2,@3) AND other IN ( @4 )',
        );
        expect(binds).toEqual(['myId1', 'myId2', 'myId3', 42]);
      });

      it('should be ignored 3rd parameter', () => {
        const { query, binds } = normalizeQuery({
          query: 'select * from xxx where id = :id AND other=:other + :id',
          toPositionedParameter: true,
          bindParams: { id: 'myId', other: 42, theOther: 43 },
        });

        expect(query).toBe('select * from xxx where id = $1 AND other=$2 + $1');
        expect(binds).toEqual(['myId', 42]);
      });

      it('should throw error', () => {
        expect(() =>
          normalizeQuery({
            query: 'select * from xxx where id = :id AND other=:other + :id',
            toPositionedParameter: true,
            bindParams: { id: 'myId', theOther: 43 },
          }),
        ).toThrow('Missing bind parameter [other]');
      });

      it('should not be error, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '-- where ID > :minId',
          toPositionedParameter: true,
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      it('should not be error too, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '# where ID > :minId',
          toPositionedParameter: true,
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      describe('Do not misinterpret colons inside quotes as bind variables', () => {
        it('Case with multiple colons inside quotes (mi, ss)', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp('2025-04-26 05:48:50.000', 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            toPositionedParameter: true,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });

        it('Case with mixed single and double quotes', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp("2025-04-26 05:48:50.000", 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            toPositionedParameter: true,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });
        it('Case where colons outside quotes are recognized as bind variables', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw WHERE id = :id AND data_tm >= '2025-04-26 05:48:50.000`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            toPositionedParameter: true,
            bindParams: { id: 123 },
          });

          expect(query).toBe(SQL.replace(':id', '$1'));
          expect(binds).toEqual([123]);
        });
      });
    });

    describe('Named query to simple query', () => {
      it('transform a named query to a simple query', () => {
        const { query, binds } = normalizeQuery({
          query: 'select * from xxx where id = :id AND other=:other + :id',
          bindParams: { id: 'myId', other: 42 },
        });

        expect(query).toBe('select * from xxx where id = ? AND other=? + ?');
        expect(binds).toEqual(['myId', 42, 'myId']);
      });

      it('transform a named query to a simple query2', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where id IN (:ids) AND other= IN ( :others )',
          bindParams: { ids: ['myId1', 'myId2', 'myId3'], others: [42] },
        });

        expect(query).toBe(
          'select * from xxx where id IN (?,?,?) AND other= IN ( ? )',
        );
        expect(binds).toEqual(['myId1', 'myId2', 'myId3', 42]);
      });

      it('should be ignored 3rd parameter', () => {
        const { query, binds } = normalizeQuery({
          query: 'select * from xxx where id = :id AND other=:other + :id',
          bindParams: { id: 'myId', other: 42, theOther: 43 },
        });

        expect(query).toBe('select * from xxx where id = ? AND other=? + ?');
        expect(binds).toEqual(['myId', 42, 'myId']);
      });

      it('should throw error', () => {
        expect(() =>
          normalizeQuery({
            query: 'select * from xxx where id = :id AND other=:other + :id',
            toPositionedParameter: true,
            bindParams: { id: 'myId', theOther: 43 },
          }),
        ).toThrow('Missing bind parameter [other]');
      });

      it('should not be error, in a comment line1', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '-- where ID > :minId',
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      it('should not be error, in a comment line2', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + 'where n1=3 -- n1 > :n1',
        });

        expect(query).toBe(
          'select ID, n0,n1,n2 from testtable \n' + 'where n1=3 ',
        );
        expect(binds).toEqual([]);
      });

      it('should not be error, in a comment line3', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '# where ID > :minId',
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      it(`should not be error, in a time format's colon`, () => {
        const { query, binds } = normalizeQuery({
          query: `select ID, n0,n1,n2 from testtable WHERE update_date >= ('2020-05-05 14:23:23' - interval 30 day)`,
        });

        expect(query).toBe(
          `select ID, n0,n1,n2 from testtable WHERE update_date >= ('2020-05-05 14:23:23' - interval 30 day)`,
        );
        expect(binds).toEqual([]);
      });

      it(`should not be error, like bind comment`, () => {
        const { query, binds } = normalizeQuery({
          query: `select ID FROM EMP where schema IN (20) -- (<10:Z1, 15:Z2>) \r\nORDER BY ID`,
        });

        expect(query).toBe(
          `select ID FROM EMP where schema IN (20) \nORDER BY ID`,
        );
        expect(binds).toEqual([]);
      });

      describe('Do not misinterpret colons inside quotes as bind variables', () => {
        it('Case with multiple colons inside quotes (mi, ss)', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp('2025-04-26 05:48:50.000', 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });

        it('Case with mixed single and double quotes', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp("2025-04-26 05:48:50.000", 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });
        it('Case where colons outside quotes are recognized as bind variables', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw WHERE id = :id AND data_tm >= '2025-04-26 05:48:50.000`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            bindParams: { id: 123 },
          });

          expect(query).toBe(SQL.replace(':id', '?'));
          expect(binds).toEqual([123]);
        });
      });
    });
  });

  describe('parseQuery', () => {
    it('Calculate timestamp', () => {
      const sql =
        'select 1 from hoge where a_timestamp >= currenttimestamp - interval 1 hour';
      const ast = parseQuery(sql);
      expect(ast).not.toBeUndefined();
    });
    it('Limit n1,n2', () => {
      const sql = 'select 1 from hoge LIMIT 1, 20';
      const ast = parseQuery(sql);
      expect(ast).not.toBeUndefined();
    });
    describe('Unexpected keyword tokens for pgsqlAST', () => {
      it('authorization', () => {
        const sql = 'select authorization from hoge';
        const ast = parseQuery(sql);
        expect(ast).not.toBeUndefined();
      });
      it('show full xxx', () => {
        const sql = 'show full processlist';
        const ast = parseQuery(sql);
        expect(ast).not.toBeUndefined();
      });
    });
    describe('Unexpected quote for MySQL', () => {
      it('with schema', () => {
        const sql = 'select * from hoge.`piyo fuga`';
        const ast = parseQuery(sql);
        expect(ast.ast.type).toBe('select');
        expect(ast.names.schemaName).toBe('hoge');
        expect(ast.names.tableName).toBe('piyo fuga');
      });
      it('without schema', () => {
        const sql = 'select * from `piyo fuga`';
        const ast = parseQuery(sql);
        expect(ast.ast.type).toBe('select');
        expect(ast.names.schemaName).toBeUndefined();
        expect(ast.names.tableName).toBe('piyo fuga');
      });
    });
    describe('Unexpected quote for SQLServer', () => {
      it('with schema', () => {
        const sql = 'select * from hoge.[piyo fuga]';
        const ast = parseQuery(sql);
        expect(ast.ast.type).toBe('select');
        expect(ast.names.schemaName).toBe('hoge');
        expect(ast.names.tableName).toBe('piyo fuga');
      });
      it('without schema', () => {
        const sql = 'select * from [piyo fuga]';
        const ast = parseQuery(sql);
        expect(ast.ast.type).toBe('select');
        expect(ast.names.schemaName).toBeUndefined();
        expect(ast.names.tableName).toBe('piyo fuga');
      });
    });
    describe('Unexpected quote for PostgreSQL', () => {
      it('with schema', () => {
        const sql = 'select * from hoge."piyo fuga"';
        const ast = parseQuery(sql);
        expect(ast.ast.type).toBe('select');
        expect(ast.names.schemaName).toBe('hoge');
        expect(ast.names.tableName).toBe('piyo fuga');
      });
      it('without schema', () => {
        const sql = 'select * from "piyo fuga"';
        const ast = parseQuery(sql);
        expect(ast.ast.type).toBe('select');
        expect(ast.names.schemaName).toBeUndefined();
        expect(ast.names.tableName).toBe('piyo fuga');
      });
    });
    describe('Unexpected keyword tokens for DynamoDB', () => {
      it('update', () => {
        const sql = `UPDATE "Music"
SET AwardsWon=1
SET AwardDetail={'Grammys':[2020, 2018]}
WHERE Artist='Acme Band' AND SongTitle='PartiQL Rocks'`;
        const ast = parseQuery(sql);
        expect(ast).toEqual({
          ast: {
            type: 'update',
          },
          names: {
            tableName: 'Music',
          },
        });
      });
      it('delete', () => {
        const sql = `DELETE FROM
"Music"
WHERE Artist='Acme Band' AND SongTitle='PartiQL Rocks'
RETURNING ALL OLD`;
        const ast = parseQuery(sql);
        expect(ast).toEqual({
          ast: {
            type: 'delete',
          },
          names: {
            tableName: 'Music',
          },
        });
      });
      it('insert', () => {
        const sql = `INSERT
INTO Music (a)
values (`;
        const ast = parseQuery(sql);

        expect(ast.ast.type).toBe('insert');
        expect(ast.names.tableName).toBe('Music');
      });

      it('select', () => {
        const sql = `SELECT OrderID, Total
FROM "Orders"
WHERE OrderID IN [1, 2, 3] ORDER BY OrderID DESC`;
        const ast = parseQuery(sql);

        expect(ast.ast.type).toBe('select');
        expect(ast.names.tableName).toBe('Orders');
      });
    });
  });

  describe('isReadOnlyQuery', () => {
    it('returns true for select', () => {
      expect(isReadOnlyQuery('select * from hoge')).toBe(true);
    });
    it('returns true for show', () => {
      expect(isReadOnlyQuery('show full processlist')).toBe(true);
    });
    it('returns false for insert', () => {
      expect(isReadOnlyQuery('insert into hoge (a) values (1)')).toBe(false);
    });
    it('returns false for update', () => {
      expect(isReadOnlyQuery('update hoge set a = 1 where id = 1')).toBe(
        false,
      );
    });
    it('returns false for delete', () => {
      expect(isReadOnlyQuery('delete from hoge where id = 1')).toBe(false);
    });
    it('returns false for truncate table', () => {
      expect(isReadOnlyQuery('truncate table hoge')).toBe(false);
    });
    it('returns false for a create table (DDL)', () => {
      expect(isReadOnlyQuery('create table hoge (id int)')).toBe(false);
    });
    describe('SQLite PRAGMA', () => {
      it('returns true for a PRAGMA read', () => {
        expect(isReadOnlyQuery('pragma table_info(hoge)')).toBe(true);
      });
      it('returns false for a PRAGMA assignment', () => {
        expect(isReadOnlyQuery('pragma foreign_keys = ON')).toBe(false);
      });
    });
  });

  describe('toViewDataQuery', () => {
    describe('sql', () => {
      it('Simple (no conitions)', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
        });
        expect(eolToSpace(query)).toBe('SELECT * FROM testdb.testtable');
        expect(binds).toEqual([]);
      });
      it('With conitions', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n0',
                operator: 'equal',
                value: '1',
              },
              {
                fact: 'n1',
                operator: 'isNotNull',
                value: null,
              },
              {
                fact: 'n2',
                operator: 'in',
                value: '1, 2, 3',
              },
              {
                fact: 'd1',
                operator: 'in',
                value: '2020-01-01, today',
              },
              {
                fact: 'd3',
                operator: 'lessThan',
                value: 'now',
              },
            ],
          },
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable WHERE ID <> :val1 AND n0 = :val2 AND n1 IS NOT NULL AND n2 IN (:val3) AND d1 IN (:val4) AND d3 < :val5',
        );
        expect(binds).toEqual({
          val1: 100,
          val2: true,
          val3: [1, 2, 3],
          val4: expect.any(Array),
          val5: expect.anything(),
        });
      });
      it('With conitions2', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n0',
                operator: 'equal',
                value: '1',
              },
              {
                fact: 'n1',
                operator: 'isNotNull',
                value: null,
              },
              {
                fact: 'n2',
                operator: 'in',
                value: '1, 2, 3',
              },
              {
                fact: 'd1',
                operator: 'in',
                value: '2020-01-01, today',
              },
              {
                fact: 'd3',
                operator: 'lessThan',
                value: 'now',
              },
            ],
          },
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable WHERE ID <> ? AND n0 = ? AND n1 IS NOT NULL AND n2 IN (?,?,?) AND d1 IN (?,?) AND d3 < ?',
        );
        expect(binds).toEqual([
          100,
          true,
          1,
          2,
          3,
          expect.anything(),
          expect.anything(),
          expect.anything(),
        ]);
      });
      it('With conitions3', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          toPositionedParameter: true,
          conditions: {
            any: [
              {
                fact: 'n0',
                operator: 'isNull',
                value: null,
              },
              {
                fact: 'd2',
                operator: 'greaterThan',
                value: '13:24:56',
              },
              {
                all: [
                  {
                    fact: 'n2',
                    operator: 'between',
                    value: '20, 30',
                  },
                  {
                    fact: 'd1',
                    operator: 'between',
                    value: '2020-01-01, 2022-12-31',
                  },
                ],
              },
              {
                fact: 's2',
                operator: 'like',
                value: 't%st',
              },
            ],
          },
        });

        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable WHERE n0 IS NULL OR d2 > $1 OR ( n2 BETWEEN $2 AND $3 AND d1 BETWEEN $4 AND $5 ) OR s2 LIKE $6',
        );
        expect(binds).toEqual([
          '13:24:56',
          20,
          30,
          expect.anything(),
          expect.anything(),
          't%st',
        ]);
      });
    });
    describe('partiql', () => {
      it('Simple (no conitions)', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          sqlLang: 'partiql',
        });
        expect(eolToSpace(query)).toBe('SELECT * FROM "testtable"');
        expect(binds).toEqual([]);
      });
      it('With conitions-in', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n0',
                operator: 'equal',
                value: '1',
              },
              {
                fact: 'n1',
                operator: 'isNotNull',
                value: null,
              },
              {
                fact: 'n2',
                operator: 'in',
                value: '1, 2, 3',
              },
              {
                fact: 's2',
                operator: 'like',
                value: 'test',
              },
            ],
          },
          sqlLang: 'partiql',
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM "testtable" WHERE "ID" <> :val1 AND "n0" = :val2 AND "n1" IS NOT NULL AND "n2" IN (:val3) AND Contains("s2", :val4)',
        );
        expect(binds).toEqual({
          val1: 100,
          val2: true,
          val3: [1, 2, 3],
          val4: 'test',
        });
      });
      it('With conitions2', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n2',
                operator: 'between',
                value: '1, 2',
              },
              {
                fact: 's2',
                operator: 'like',
                value: 'test',
              },
            ],
          },
          sqlLang: 'partiql',
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM "testtable" WHERE "ID" <> :val1 AND "n2" BETWEEN :val2 AND :val3 AND Contains("s2", :val4)',
        );
        expect(binds).toEqual({
          val1: 100,
          val2: 1,
          val3: 2,
          val4: 'test',
        });
      });
    });
  });

  describe('toInsertStatement', () => {
    describe('compactSql:true', () => {
      it('withComment:true', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: true,
          compactSql: true,
        });

        const expectedQuery = `-- table with various data types
        INSERT INTO testdb.testtable (d1,d2,d3,d4,d5,f1,f2,f3,g1,ID,j1,long_column_name_long_text,n0,n1,n2,n3,n4,s1,s2,s3a,s3b,s3c,s4,s5,s6,s7,s71,s8) VALUES (NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,0,NULL,'',NULL,0,0,0,0,'','','','','',NULL,NULL,NULL,NULL,NULL,NULL)`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('withComment:false', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: true,
        });

        const expectedQuery = `INSERT INTO testdb.testtable (d1,d2,d3,d4,d5,f1,f2,f3,g1,ID,j1,long_column_name_long_text,n0,n1,n2,n3,n4,s1,s2,s3a,s3b,s3c,s4,s5,s6,s7,s71,s8) VALUES (NULL,NULL,NULL,NULL,0,0,0,NULL,NULL,0,NULL,'',NULL,0,0,0,0,'','','','','',NULL,NULL,NULL,NULL,NULL,NULL)`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL embedded values', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: true,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"  VALUE {'ID': 0, 's1': '', 'd1': NULL}`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL with bind parameters', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query, binds } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: true,
          },
          withComment: false,
          compactSql: true,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"  VALUE {'ID': ?, 's1': ?, 'd1': ?}`;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
        expect(binds).toEqual([0, '', null]);
      });
    });
    describe('compactSql:false', () => {
      it('withComment:true', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: true,
          compactSql: false,
        });

        const expectedQuery = `-- table with various data types
        INSERT INTO testdb.testtable
         (
          d1,
          d2,
          d3,
          d4,
          d5,
          f1,
          f2,
          f3,
          g1,
          ID,
          j1,
          long_column_name_long_text,
          n0,
          n1,
          n2,
          n3,
          n4,
          s1,
          s2,
          s3a,
          s3b,
          s3c,
          s4,
          s5,
          s6,
          s7,
          s71,
          s8
        ) VALUES (
          NULL, -- “Zero” Value 0000-00-00 [date]
          NULL, -- “Zero” Value 00:00:00 [time]
          NULL, -- “Zero” Value 0000-00-00 00:00:00 [timestamp]
          NULL, -- “Zero” Value 0000-00-00 00:00:00 [timestamp]
          0, -- “Zero” Value 0000 [year]
          0, -- f1 [decimal]
          0, -- f2 [float]
          NULL, -- f3 [real]
          NULL, -- g1 [geometry]
          0, -- ID [integer]
          NULL, -- JSON data type [json]
          '', -- long_column_name_long_text [longtext]
          NULL, -- n0 [bit]
          0, -- MAX 127 [tinyint]
          0, -- MAX 32767 [smallint]
          0, -- MAX 8388607 [mediumint]
          0, -- MAX 9223372036854775807 [bigint]
          '', -- s1 [char]
          '', -- s2 [varchar]
          '', -- s3a [tinytext]
          '', -- s3b [text]
          '', -- s3c [mediumtext]
          NULL, -- A list of a,b or c [enum]
          NULL, -- s5 [binary]
          NULL, -- s6 [varbinary]
          NULL, -- s7 [blob]
          NULL, -- s71 [tinyblob]
          NULL -- s8 [set]
        )
       `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('withComment:false', () => {
        const { schemaName, tableName, tableComment, columns, values } =
          createToInsertStatementParams(db);

        const { query } = toInsertStatement({
          schemaName,
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: false,
        });

        const expectedQuery = `INSERT INTO testdb.testtable
        (
         d1,
         d2,
         d3,
         d4,
         d5,
         f1,
         f2,
         f3,
         g1,
         ID,
         j1,
         long_column_name_long_text,
         n0,
         n1,
         n2,
         n3,
         n4,
         s1,
         s2,
         s3a,
         s3b,
         s3c,
         s4,
         s5,
         s6,
         s7,
         s71,
         s8
       ) VALUES (
         NULL,
         NULL,
         NULL,
         NULL,
         0,
         0,
         0,
         NULL,
         NULL,
         0,
         NULL,
         '',
         NULL,
         0,
         0,
         0,
         0,
         '',
         '',
         '',
         '',
         '',
         NULL,
         NULL,
         NULL,
         NULL,
         NULL,
         NULL
       )
       `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL embedded values', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: false,
          },
          withComment: false,
          compactSql: false,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"
        VALUE {
          'ID': 0,
          's1': '',
          'd1': NULL
        }
        `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
      });
      it('partiQL with bind parameters', () => {
        const {
          tableName,
          tableComment,
          columns: iCols,
          values: iVals,
        } = createToInsertStatementParams(db);

        const columns: RdhKey[] = [];
        const values: { [key: string]: any } = {};
        ['ID', 's1', 'd1'].forEach((col) => {
          const idx = iCols.findIndex((it) => it.name === col);
          if (idx >= 0) {
            columns.push(iCols[idx]);
            values[col] = iVals[col];
          }
        });

        const { query, binds } = toInsertStatement({
          tableName,
          tableComment,
          columns,
          values,
          bindOption: {
            specifyValuesWithBindParameters: true,
          },
          withComment: false,
          compactSql: false,
          sqlLang: 'partiql',
        });

        const expectedQuery = `INSERT INTO "testtable"
        VALUE {
          'ID': ?,
          's1': ?,
          'd1': ?
        }
        `;

        expect(eolToSpace(query)).toBe(eolToSpace(expectedQuery));
        expect(binds).toEqual([0, '', null]);
      });
    });
  });

  describe('hasSetVariableClause', () => {
    it('true; pattern1', () => {
      const sql = `SET @ind_rate = 83.52;\n
SELECT CarName, FORMAT(Price * @ind_rate, 2) "Rupees" FROM cars`;

      expect(hasSetVariableClause(sql)).toBe(true);
    });
    it('true; pattern2', () => {
      const sql = `SET var ind_rate = 83.52;\n
SELECT CarName, FORMAT(Price * @ind_rate, 2) "Rupees" FROM cars`;

      expect(hasSetVariableClause(sql)).toBe(true);
    });
    it('false; pattern1', () => {
      const sql = `SELECT CarName, FORMAT(Price * :ind_rate, 2) "Rupees" FROM cars`;
      expect(hasSetVariableClause(sql)).toBe(false);
    });
    it('false; pattern2', () => {
      const sql = `SET GLOBAL max_connections = 1000`;
      expect(hasSetVariableClause(sql)).toBe(false);
    });
    it('false; pattern3', () => {
      const sql = `SET @@PERSIST.max_connections = 1000;`;
      expect(hasSetVariableClause(sql)).toBe(false);
    });
    it('false; pattern4', () => {
      const sql = `SET @@SESSION.sql_mode = 'TRADITIONAL';`;
      expect(hasSetVariableClause(sql)).toBe(false);
    });
  });

  describe('separateMultipleQueries', () => {
    it('true; pattern1 single query', () => {
      const text = `SELECT * FROM users`;
      const queries = separateMultipleQueries(text);
      expect(queries).toHaveLength(1);
      expect(queries[0]).toBe('SELECT * FROM users');
    });
    it('true; pattern2 single query with semicolon', () => {
      const text = `SELECT * FROM users;`;
      const queries = separateMultipleQueries(text);
      expect(queries).toHaveLength(1);
      expect(queries[0]).toBe('SELECT * FROM users');
    });
    it('true; pattern3', () => {
      const text = `
SELECT * FROM users;
-- Comment about next
UPDATE users\nSET name = 'Alice' WHERE id = 2;
INSERT INTO users (name) VALUES ('Bob'); -- Insert Bob
/* Multi-line
comment */
DROP TABLE test; // Drop the test table
`;
      const queries = separateMultipleQueries(text);
      expect(queries).toHaveLength(5);
      expect(queries[0]).toBe('SELECT * FROM users');
      expect(queries[1]).toBe(
        "-- Comment about next\nUPDATE users\nSET name = 'Alice' WHERE id = 2",
      );
      expect(queries[2]).toBe("INSERT INTO users (name) VALUES ('Bob')");
      expect(queries[3]).toBe(
        '-- Insert Bob\n/* Multi-line\ncomment */\nDROP TABLE test',
      );
      expect(queries[4]).toBe('// Drop the test table');
    });
    it('true; pattern4', () => {
      const text = `
CREATE TABLE DEPT(
  DEPTNO NUMBER(2) CONSTRAINT PK_DEPT PRIMARY KEY,
  DNAME VARCHAR2(14) ,
  LOC VARCHAR2(13)
);

CREATE TABLE EMP(
  EMPNO NUMBER(4) CONSTRAINT PK_EMP PRIMARY KEY,
  ENAME VARCHAR2(10),
  JOB VARCHAR2(9),
  MGR NUMBER(4),
  HIREDATE DATE,
  SAL NUMBER(7,2),
  COMM NUMBER(7,2),
  DEPTNO NUMBER(2) CONSTRAINT FK_DEPTNO REFERENCES DEPT
);
INSERT INTO DEPT VALUES
  (10,'ACCOUNTING','NEW YORK');
INSERT INTO EMP VALUES
  (7369,'SMITH','CLERK',7902,'1980-12-12',800,NULL,20);
COMMIT;
EXIT
`;
      const queries = separateMultipleQueries(text);

      expect(queries).toHaveLength(6);
      expect(queries[0]).toBe(
        'CREATE TABLE DEPT(\n  DEPTNO NUMBER(2) CONSTRAINT PK_DEPT PRIMARY KEY,\n  DNAME VARCHAR2(14) ,\n  LOC VARCHAR2(13)\n)',
      );
      expect(queries[1]).toBe(
        `CREATE TABLE EMP(
  EMPNO NUMBER(4) CONSTRAINT PK_EMP PRIMARY KEY,
  ENAME VARCHAR2(10),
  JOB VARCHAR2(9),
  MGR NUMBER(4),
  HIREDATE DATE,
  SAL NUMBER(7,2),
  COMM NUMBER(7,2),
  DEPTNO NUMBER(2) CONSTRAINT FK_DEPTNO REFERENCES DEPT
)`,
      );
      expect(queries[2]).toBe(
        "INSERT INTO DEPT VALUES\n  (10,'ACCOUNTING','NEW YORK')",
      );
      expect(queries[3]).toBe(
        "INSERT INTO EMP VALUES\n  (7369,'SMITH','CLERK',7902,'1980-12-12',800,NULL,20)",
      );
      expect(queries[4]).toBe('COMMIT');
      expect(queries[5]).toBe('EXIT');
    });
    it('pattern5', () => {
      const text =
        "select * from table1 where col1 = 'ab\\'c;de'; select * from table2;\n\n";
      const queries = separateMultipleQueries(text);
      expect(queries).toHaveLength(2);
      expect(queries[0]).toBe("select * from table1 where col1 = 'ab\\'c;de'");
      expect(queries[1]).toBe('select * from table2');
    });
  });

  describe('toSafeQueryForPgsqlAst', () => {
    it('replaces the standalone DATETIME keyword with TIMESTAMP', () => {
      const sql = 'CREATE TABLE t (created_at DATETIME)';
      expect(toSafeQueryForPgsqlAst(sql)).toBe(
        'CREATE TABLE t (created_at TIMESTAMP)',
      );
    });

    it('replaces DATETIME2 with TIMESTAMP (not TIMESTAMP2)', () => {
      const sql = 'CREATE TABLE t (created_at DATETIME2)';
      expect(toSafeQueryForPgsqlAst(sql)).toBe(
        'CREATE TABLE t (created_at TIMESTAMP)',
      );
    });

    it('does not touch SMALLDATETIME or DATETIMEOFFSET', () => {
      expect(
        toSafeQueryForPgsqlAst('CREATE TABLE t (c SMALLDATETIME)'),
      ).toBe('CREATE TABLE t (c SMALLDATETIME)');
      expect(
        toSafeQueryForPgsqlAst('CREATE TABLE t (c DATETIMEOFFSET)'),
      ).toBe('CREATE TABLE t (c DATETIMEOFFSET)');
    });
  });
});

const createToInsertStatementParams = (
  db: RdsDatabase,
): {
  schemaName?: string;
  tableName: string;
  tableComment?: string;
  columns: RdhKey[];
  values: { [key: string]: any };
} => {
  const schemaRes = db.getSchema({ isDefault: true });
  const tableRes = schemaRes.getChildByName('testtable');
  const columns: RdhKey[] = [];
  const values: { [key: string]: any } = {};
  tableRes.children.forEach((it) => {
    columns.push(
      createRdhKey({
        name: it.name,
        type: it.colType,
        comment: it.comment,
      }),
    );

    if (isTextLike(it.colType)) {
      values[it.name] = '';
    } else if (isNumericLike(it.colType)) {
      values[it.name] = 0;
    } else {
      values[it.name] = null;
    }
  });

  return {
    schemaName: schemaRes.name,
    tableName: tableRes.name,
    tableComment: tableRes.comment,
    columns,
    values,
  };
};
