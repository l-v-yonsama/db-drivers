import {
  hasSetVariableClause,
  isReadOnlyQuery,
  parseQuery,
  separateMultipleQueries,
  toSafeQueryForPgsqlAst,
} from '../../../src';

describe('SQLHelper', () => {
  describe('parseQuery', () => {
    describe('dialect regression matrix', () => {
      it.each([
        [
          'PostgreSQL quoted identifier and $1 bind',
          'SELECT * FROM "audit"."event log" WHERE id = $1',
          'select',
          'audit',
          'event log',
          true,
        ],
        [
          'PostgreSQL CTE',
          'WITH active_users AS (SELECT * FROM users) SELECT * FROM active_users',
          'select',
          undefined,
          'active_users',
          true,
        ],
        [
          'PostgreSQL RETURNING mutation',
          'INSERT INTO audit.events (id) VALUES ($1) RETURNING id',
          'insert',
          'audit',
          'events',
          false,
        ],
        [
          'PostgreSQL multiple FROM tables',
          'SELECT * FROM users u JOIN roles r ON r.id = u.role_id',
          'select',
          undefined,
          'users',
          true,
          'roles',
        ],
        [
          'MySQL positional bind and backtick identifier',
          'SELECT * FROM `shop`.`order items` WHERE id = ?',
          'select',
          'shop',
          'order items',
          true,
        ],
        [
          'MySQL LIMIT offset,count',
          'SELECT * FROM orders LIMIT 10, 20',
          'select',
          undefined,
          'orders',
          true,
        ],
        [
          'MySQL ON DUPLICATE KEY',
          'INSERT INTO orders (id) VALUES (?) ON DUPLICATE KEY UPDATE id = VALUES(id)',
          'insert',
          undefined,
          'orders',
          false,
        ],
        [
          'MySQL LOCK IN SHARE MODE',
          'SELECT * FROM orders LOCK IN SHARE MODE',
          'select',
          undefined,
          'orders',
          true,
        ],
        [
          'SQL Server local variable, TOP, and bracket identifier',
          'SELECT TOP 10 * FROM [sales].[order items] WHERE id = @id',
          'select',
          'sales',
          'order items',
          true,
        ],
        [
          'SQL Server table hint',
          'SELECT * FROM [sales].[orders] WITH (NOLOCK)',
          'select',
          'sales',
          'orders',
          true,
        ],
        [
          'SQL Server DATETIME2 type',
          'CREATE TABLE [audit] (created_at DATETIME2)',
          'create table',
          undefined,
          undefined,
          false,
        ],
        [
          'SQL Server system variable is not a bind',
          'SELECT @@ROWCOUNT FROM [sales].[orders]',
          'select',
          'sales',
          'orders',
          true,
        ],
        [
          'Oracle named bind and FETCH FIRST',
          'SELECT * FROM "HR"."EMPLOYEES" WHERE employee_id = :id FETCH FIRST 1 ROWS ONLY',
          'select',
          'HR',
          'EMPLOYEES',
          true,
        ],
        [
          'Oracle ROWNUM',
          'SELECT * FROM employees WHERE ROWNUM <= :limit',
          'select',
          undefined,
          'employees',
          true,
        ],
        [
          'Oracle quoted identifier',
          'SELECT * FROM "HR"."Employee Log"',
          'select',
          'HR',
          'Employee Log',
          true,
        ],
        [
          'Oracle named bind in mutation',
          'UPDATE HR.EMPLOYEES SET salary = :salary WHERE employee_id = :id',
          'update',
          'HR',
          'EMPLOYEES',
          false,
        ],
      ])(
        '%s',
        (
          _label,
          sql,
          type,
          schemaName,
          tableName,
          readOnly,
          additionalTableName = undefined,
        ) => {
          const parsed = parseQuery(sql);

          expect(parsed?.ast.type).toBe(type);
          expect(parsed?.names).toEqual(
            tableName ? { schemaName, tableName } : undefined,
          );
          expect(parsed?.additionalNames?.[0]?.tableName).toBe(
            additionalTableName,
          );
          expect(isReadOnlyQuery(sql)).toBe(readOnly);
        },
      );
    });

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
    it('only transforms markers outside literals and comments', () => {
      const safe = toSafeQueryForPgsqlAst(
        "SELECT '? :id @owner DATETIME' AS note, ? FROM `orders` -- ? :id @owner\nWHERE id = :id AND owner = @owner",
      );

      expect(safe).toContain("'? :id @owner DATETIME'");
      expect(safe).toContain('FROM "orders"');
      expect(safe).toContain('WHERE id = $1 AND owner = $1');
      expect(safe).not.toContain('-- ? :id @owner');
    });

    it('retains PostgreSQL casts and Oracle assignments', () => {
      expect(toSafeQueryForPgsqlAst('SELECT now()::timestamp, :id := 1')).toBe(
        'SELECT now()::timestamp, $1 := 1',
      );
    });

    it('continues to transform rules that include a string literal', () => {
      expect(toSafeQueryForPgsqlAst("WAITFOR DELAY '00:00:01'")).toBe(
        'SELECT pg_sleep(1)',
      );
      expect(
        toSafeQueryForPgsqlAst("SET GLOBAL sql_mode = 'TRADITIONAL'"),
      ).toBe('SET sql_mode TO dummy');
      expect(
        toSafeQueryForPgsqlAst("SELECT DATEDIFF('day', starts_at, ends_at)"),
      ).toBe('SELECT 1');
    });

    it('falls back to quoted schema and table names when parsing fails', () => {
      const ast = parseQuery(
        'SELECT * FROM "sales data"."order items" WHERE ???',
      );

      expect(ast).toEqual({
        ast: { type: 'select' },
        names: { schemaName: 'sales data', tableName: 'order items' },
      });
    });

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
      expect(toSafeQueryForPgsqlAst('CREATE TABLE t (c SMALLDATETIME)')).toBe(
        'CREATE TABLE t (c SMALLDATETIME)',
      );
      expect(toSafeQueryForPgsqlAst('CREATE TABLE t (c DATETIMEOFFSET)')).toBe(
        'CREATE TABLE t (c DATETIMEOFFSET)',
      );
    });
  });
});
