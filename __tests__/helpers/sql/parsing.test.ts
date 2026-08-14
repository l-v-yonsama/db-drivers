import {
  hasSetVariableClause,
  parseQuery,
  separateMultipleQueries,
  toSafeQueryForPgsqlAst,
} from '../../../src';

describe('SQLHelper', () => {
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
