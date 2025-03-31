import {
  createRdhKey,
  eolToSpace,
  isNumericLike,
  isTextLike,
  RdhKey,
} from '@l-v-yonsama/rdh';
import {
  createTableDefinisionsForPrompt,
  getProposals,
  getResourcePositions,
  hasSetVariableClause,
  normalizeQuery,
  parseQuery,
  ProposalKind,
  RdsDatabase,
  separateMultipleQueries,
  toInsertStatement,
  toViewDataNormalizedQuery,
  toViewDataQuery,
} from '../../src';
import { loadRes } from '../setup/mysql';

describe('SQLHelper', () => {
  let db: RdsDatabase;

  beforeAll(async () => {
    db = await loadRes<RdsDatabase>('mysqlDbRes.json');
  });

  describe('getProposals', () => {
    describe('Select statement', () => {
      it('should return reserved word proposals', () => {
        const list = getProposals({
          db: undefined,
          sql: 'SELECT * FROM testtable as tbl WHERE c',
          lastChar: 'c',
          keyword: 'c',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'CURRENT_DATE');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.ReservedWord);
      });

      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'SELECT * FROM t',
          lastChar: 't',
          keyword: 't',
        });
        const o = list.find((it) => it.label === 'testtable');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
        expect(o.detail).toEqual(expect.any(String));
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'SELECT * FROM testtable WHERE d',
          lastChar: 'd',
          keyword: 'd',
        });
        const d1 = list.find((it) => it.label === 'd1');
        expect(d1).not.toBeUndefined();
        expect(d1.kind).toBe(ProposalKind.Column);
        expect(d1.detail).toEqual(expect.any(String));
      });

      it('should return column proposals2', () => {
        const list = getProposals({
          db,
          sql: 'SELECT * FROM testtable as tbl WHERE tbl.d',
          lastChar: 'd',
          keyword: 'd',
          parentWord: 'tbl',
        });
        const d1 = list.find((it) => it.label === 'd1');
        expect(d1).not.toBeUndefined();
        expect(d1.kind).toBe(ProposalKind.Column);
        expect(d1.detail).toEqual(expect.any(String));
      });

      it('should return column proposals3', () => {
        const list = getProposals({
          db,
          sql:
            'SELECT * FROM DEPT as d ' +
            'inner join EMP e ON (d.DEPTNO = e.DEPTNO) ' +
            'WHERE d.l',
          lastChar: 'l',
          keyword: 'l',
          parentWord: 'd',
        });
        const loc = list.find((it) => it.label === 'LOC');
        expect(loc).not.toBeUndefined();
        expect(loc.kind).toBe(ProposalKind.Column);
      });

      it('should return column proposals4', () => {
        const list = getProposals({
          db,
          sql:
            'SELECT * FROM DEPT as d ' +
            'inner join EMP e ON (d.DEPTNO = e.DEPTNO) ' +
            'WHERE e.em',
          lastChar: 'm',
          keyword: 'em',
          parentWord: 'e',
        });
        const loc = list.find((it) => it.label === 'EMPNO');
        expect(loc).not.toBeUndefined();
        expect(loc.kind).toBe(ProposalKind.Column);
      });
    });

    describe('Insert statement', () => {
      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'INSERT INTO ',
          lastChar: ' ',
          keyword: 'INTO',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'EMP');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return table proposals2', () => {
        const list = getProposals({
          db,
          sql: 'INSERT INTO D',
          lastChar: 'D',
          keyword: 'D',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'INSERT INTO DEPT ( DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });
    });

    describe('Update statement', () => {
      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE ',
          lastChar: ' ',
          keyword: 'UPDATE',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'EMP');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return table proposals2', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE D',
          lastChar: 'D',
          keyword: 'D',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE DEPT SET DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });

      it('should return column proposals2', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE DEPT as d SET d.DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: 'd',
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });
    });

    describe('Delete statement', () => {
      it('should return reserved word proposals', () => {
        const list = getProposals({
          db,
          sql: 'DELETE ',
          lastChar: ' ',
          keyword: 'DELETE',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'FROM');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.ReservedWord);
      });

      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'DELETE FROM ',
          lastChar: ' ',
          keyword: 'FROM',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return table proposals2', () => {
        const list = getProposals({
          db,
          sql: 'DELETE FROM D',
          lastChar: 'D',
          keyword: 'D',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'DELETE FROM DEPT WHERE DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });

      it('should return column proposals2', () => {
        const list = getProposals({
          db,
          sql:
            'DELETE FROM e, d ' +
            'USING EMP AS e INNER JOIN DEPT AS d ' +
            'ON e.DEPT_NO = d.DEPT_NO ' +
            'WHERE e.EM',
          lastChar: 'M',
          keyword: 'EM',
          parentWord: 'e',
        });
        const o = list.find((it) => it.label === 'EMPNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
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

  describe('createTableDefinisionsForPrompt', () => {
    const TESTTABLE_DEF = `CREATE TABLE testtable (
        d1 date COMMENT '“Zero” Value 0000-00-00',
        d2 time COMMENT '“Zero” Value 00:00:00',
        d3 timestamp COMMENT '“Zero” Value 0000-00-00 00:00:00',
        d4 timestamp COMMENT '“Zero” Value 0000-00-00 00:00:00',
        d5 year COMMENT '“Zero” Value 0000',
        f1 decimal,
        f2 float,
        f3 real,
        g1 geometry,
        ID integer PRIMARY KEY AUTO_INCREMENT,
        j1 json COMMENT 'JSON data type',
        long_column_name_long_text longtext,
        n0 bit,
        n1 tinyint COMMENT 'MAX 127',
        n2 smallint COMMENT 'MAX 32767',
        n3 mediumint COMMENT 'MAX 8388607',
        n4 bigint COMMENT 'MAX 9223372036854775807',
        s1 char,
        s2 varchar,
        s3a tinytext,
        s3b text,
        s3c mediumtext,
        s4 enum COMMENT 'A list of a,b or c',
        s5 binary,
        s6 varbinary,
        s7 blob,
        s71 tinyblob,
        s8 set
      ) COMMENT 'table with various data types';`;

    const DIFF_DEF = `CREATE TABLE diff (
  birthday date,
  first_name varchar PRIMARY KEY,
  full_name varchar UNIQUE,
  last_name varchar PRIMARY KEY,
  note varchar
  ) COMMENT 'test diff';`;
    describe('Select statement', () => {
      it('single table definition', async () => {
        const sql = 'select * from testtable';
        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
      it('table definition with foreign key tables', async () => {
        const sql = 'select * from testdb.order';
        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = `CREATE TABLE order (
        amount integer COMMENT '受注金額',
        customer_no integer UNIQUE COMMENT '顧客番号',
        order_date date COMMENT '受注日',
        order_no integer PRIMARY KEY AUTO_INCREMENT COMMENT '受注番号',
        FOREIGN KEY order_ibfk_1(customer_no) REFERENCES customer(customer_no)
      ) COMMENT '受注';
      
      CREATE TABLE customer (
        customer_no integer PRIMARY KEY AUTO_INCREMENT COMMENT '顧客番号',
        tel varchar COMMENT '電話番号'
      ) COMMENT '顧客';
      
      CREATE TABLE order_detail (
        amount integer COMMENT '金額',
        detail_no integer PRIMARY KEY COMMENT '受注明細番号',
        item_no integer COMMENT '商品番号',
        order_no integer PRIMARY KEY COMMENT '受注番号',
        FOREIGN KEY order_detail_ibfk_1(order_no) REFERENCES order(order_no)
      ) COMMENT '受注明細';`;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
      it('table definition with joined tables', async () => {
        const sql = `SELECT E.*, D.LOC
  FROM EMP E
  LEFT JOIN DEPT D ON E.DEPTNO = D.DEPTNO
  WHERE E.SAL > 1000
  ORDER BY E.ENAME;`;
        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = `CREATE TABLE EMP (
        COMM float,
        DEPTNO integer UNIQUE,
        EMPNO integer PRIMARY KEY,
        ENAME varchar,
        HIREDATE date,
        JOB varchar,
        MGR integer,
        SAL float,
        SEX tinyint NOT NULL DEFAULT 0
      );
      
      CREATE TABLE DEPT (
        DEPTNO integer PRIMARY KEY COMMENT '部門番号',
        DNAME varchar COMMENT '部門名',
        LOC varchar COMMENT 'ロケーション'
      ) COMMENT '部門';
      `;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
    });
    describe('Insert statement', () => {
      it('with bind', async () => {
        const sql = `INSERT INTO testdb.testtable (
  n0, n1, n2, n3, n4, 
  f1, f2, f3,
  d1, d2, d3, d4, d5,
  s1, s2, s3a, s3b, s3c, long_column_name_long_text, s4, s5, s6, s7, s8,
  g1, j1 )
  VALUES(
    ?, ?, ?, ?, ?, 
    ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, HEX(?), ?,
    ST_GeomFromText('POINT(35.702727 100)'), ? )`;

        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });

      it('without bind', async () => {
        const sql = `INSERT INTO testdb.diff (
  last_name, first_name, full_name, note, birthday )
  VALUES('John', 'Disney', 'John Disney', 'blah', '2001-09-12')`;

        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = DIFF_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
    });
    describe('Update statement', () => {
      it('with bind', async () => {
        const sql = `UPDATE testtable SET n0=? WHERE s1=?`;

        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });

      it('without bind', async () => {
        const sql = `UPDATE diff SET note='blah' WHERE full_name='A'`;

        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = DIFF_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
    });
    describe('Delete statement', () => {
      it('with bind', async () => {
        const sql = `DELETE FROM testtable WHERE s1=?`;

        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });

      it('without bind', async () => {
        const sql = `DELETE FROM diff WHERE full_name='A'`;

        const promptText = await createTableDefinisionsForPrompt({ sql, db });
        const expected = DIFF_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
    });
  });

  describe('getResourcePositions', () => {
    it('should return table and column positions', () => {
      const sql =
        'select n1,n2, a.ID, note from testtable a inner join diff b on (a.id=b.id) where a_timestamp >= currenttimestamp - interval 1 hour';
      const positions = getResourcePositions({ sql, db });

      const pos = positions.find(
        (it) => it.kind === ProposalKind.Table && it.name === 'testtable',
      );
      expect(pos).not.toBeUndefined();
      expect(pos).toEqual({
        kind: 1,
        name: 'testtable',
        comment: 'table with various data types',
        offset: 30,
        length: 9,
      });
      const pos2 = positions.find(
        (it) => it.kind === ProposalKind.Column && it.name === 'n1',
      );
      expect(pos2).toEqual({
        kind: 2,
        name: 'n1',
        comment: 'MAX 127',
        offset: 7,
        length: 2,
      });
    });
    it('should return empty array', () => {
      const sql = 'select 1';
      const positions = getResourcePositions({ sql, db });

      expect(positions).toEqual([]);
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
