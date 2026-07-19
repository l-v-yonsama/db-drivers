import { eolToSpace, GeneralColumnType } from '@l-v-yonsama/rdh';
import {
  createRdsSchemaDefinitionsForPrompt,
  createTableDefinitionsForPrompt,
  DbColumn,
  DbSchema,
  DbTable,
  RdsDatabase,
  toCreateTableDDL,
} from '../../../src';
import { loadMysqlDbFixture } from '../../setup/mysql';

describe('RdsPromptHelper', () => {
  let db: RdsDatabase;

  beforeAll(async () => {
    db = await loadMysqlDbFixture();
  });

  describe('createTableDefinitionsForPrompt', () => {
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
        const promptText = await createTableDefinitionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
      it('table definition with foreign key tables', async () => {
        const sql = 'select * from testdb.order';
        const promptText = await createTableDefinitionsForPrompt({ sql, db });
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
        const promptText = await createTableDefinitionsForPrompt({ sql, db });
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

        const promptText = await createTableDefinitionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });

      it('without bind', async () => {
        const sql = `INSERT INTO testdb.diff (
  last_name, first_name, full_name, note, birthday )
  VALUES('John', 'Disney', 'John Disney', 'blah', '2001-09-12')`;

        const promptText = await createTableDefinitionsForPrompt({ sql, db });
        const expected = DIFF_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
    });
    describe('Update statement', () => {
      it('with bind', async () => {
        const sql = `UPDATE testtable SET n0=? WHERE s1=?`;

        const promptText = await createTableDefinitionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });

      it('without bind', async () => {
        const sql = `UPDATE diff SET note='blah' WHERE full_name='A'`;

        const promptText = await createTableDefinitionsForPrompt({ sql, db });
        const expected = DIFF_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
    });
    describe('Delete statement', () => {
      it('with bind', async () => {
        const sql = `DELETE FROM testtable WHERE s1=?`;

        const promptText = await createTableDefinitionsForPrompt({ sql, db });
        const expected = TESTTABLE_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });

      it('without bind', async () => {
        const sql = `DELETE FROM diff WHERE full_name='A'`;

        const promptText = await createTableDefinitionsForPrompt({ sql, db });
        const expected = DIFF_DEF;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });
    });
  });

  describe('createRdsSchemaDefinitionsForPrompt', () => {
    it('filters by tableName only, matching the table in every schema that has it', async () => {
      // DEPT exists in both the `testdb` and `oradb` schemas of the fixture.
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        tableName: 'DEPT',
      });

      expect(promptText.match(/CREATE TABLE DEPT/g)).toHaveLength(2);
    });

    it('filters by schemaName only, returning every table in that schema', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        schemaName: 'oradb',
      });

      expect(promptText).toContain('CREATE TABLE DEPT');
      expect(promptText).toContain('CREATE TABLE EMP');
      expect(promptText).not.toContain('CREATE TABLE testtable');
      expect(promptText.match(/CREATE TABLE /g)).toHaveLength(2);
    });

    it('filters by schemaName and tableName together, narrowing to a single table', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        schemaName: 'oradb',
        tableName: 'DEPT',
      });

      expect(promptText.match(/CREATE TABLE DEPT/g)).toHaveLength(1);

      const oradbSchema = db.children.find((it) => it.name === 'oradb');
      const deptTable = oradbSchema.children.find((it) => it.name === 'DEPT');
      expect(promptText.trim()).toBe(
        toCreateTableDDL({ dbTable: deptTable }).trim(),
      );
    });

    it('returns every table across every schema when no filter is given', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({ db });
      const totalTables = db.children.reduce(
        (sum, schema) => sum + schema.children.length,
        0,
      );

      expect(promptText.match(/CREATE TABLE /g)).toHaveLength(totalTables);
    });

    it('returns undefined when the schemaName does not exist', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        schemaName: 'no_such_schema',
      });

      expect(promptText).toBeUndefined();
    });

    it('returns undefined when the tableName does not exist', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        tableName: 'no_such_table',
      });

      expect(promptText).toBeUndefined();
    });

    it('matches names case-insensitively', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        schemaName: 'ORADB',
        tableName: 'dept',
      });

      expect(promptText).toContain('CREATE TABLE DEPT');
    });

    it('accepts an array of RdsDatabase and resolves tables across all of them', async () => {
      const secondDb = new RdsDatabase('otherdb');
      const schema = new DbSchema('public');
      schema.isDefault = true;
      secondDb.addChild(schema);
      const table = new DbTable('extra_table', 'TABLE');
      schema.addChild(table);
      table.addChild(
        new DbColumn('id', GeneralColumnType.INTEGER, { key: 'PRI' }),
      );

      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db: [db, secondDb],
        tableName: 'extra_table',
      });

      expect(promptText).toContain('CREATE TABLE extra_table');
    });
  });
});
