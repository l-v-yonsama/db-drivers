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
    const TESTTABLE_DEF = `CREATE TABLE testdb.testtable (
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

    const DIFF_DEF = `CREATE TABLE testdb.diff (
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
        const expected = `CREATE TABLE testdb.order (
        amount integer COMMENT '受注金額',
        customer_no integer UNIQUE COMMENT '顧客番号',
        order_date date COMMENT '受注日',
        order_no integer PRIMARY KEY AUTO_INCREMENT COMMENT '受注番号',
        FOREIGN KEY order_ibfk_1(customer_no) REFERENCES customer(customer_no)
      ) COMMENT '受注';

      CREATE TABLE testdb.customer (
        customer_no integer PRIMARY KEY AUTO_INCREMENT COMMENT '顧客番号',
        tel varchar COMMENT '電話番号'
      ) COMMENT '顧客';

      CREATE TABLE testdb.order_detail (
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
        const expected = `CREATE TABLE testdb.EMP (
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

      CREATE TABLE testdb.DEPT (
        DEPTNO integer PRIMARY KEY COMMENT '部門番号',
        DNAME varchar COMMENT '部門名',
        LOC varchar COMMENT 'ロケーション'
      ) COMMENT '部門';
      `;

        expect(eolToSpace(expected.trim())).toBe(eolToSpace(promptText.trim()));
      });

      it('does not drop a same-named FK table from a second schema', async () => {
        // Two schemas each have their own `order` -> `customer` FK pair.
        const multiDb = new RdsDatabase('multidb');
        const buildSchema = (schemaName: string): void => {
          const schema = new DbSchema(schemaName);
          multiDb.addChild(schema);

          const customer = new DbTable('customer', 'TABLE');
          customer.addChild(
            new DbColumn('customer_no', GeneralColumnType.INTEGER, {
              key: 'PRI',
            }),
          );
          schema.addChild(customer);

          const order = new DbTable('order', 'TABLE');
          order.addChild(
            new DbColumn('order_no', GeneralColumnType.INTEGER, {
              key: 'PRI',
            }),
          );
          order.addChild(
            new DbColumn('customer_no', GeneralColumnType.INTEGER, {}),
          );
          order.foreignKeys = {
            referenceTo: {
              customer_no: {
                tableName: 'customer',
                columnName: 'customer_no',
                constraintName: `${schemaName}_order_ibfk_1`,
              },
            },
          };
          schema.addChild(order);
        };
        buildSchema('sA');
        buildSchema('sB');

        const sql = `SELECT * FROM sA.order O1 JOIN sB.order O2 ON 1 = 1`;
        const promptText = await createTableDefinitionsForPrompt({
          sql,
          db: multiDb,
        });

        expect(promptText).toContain('CREATE TABLE sA.customer');
        expect(promptText).toContain('CREATE TABLE sB.customer');
        expect(promptText.match(/CREATE TABLE \S+\.customer/g)).toHaveLength(2);
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
      // DEPT exists in both the `testdb` and `oradb` schemas of the fixture -- each occurrence must be schema-qualified so the two are distinguishable.
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        tableName: 'DEPT',
      });

      expect(promptText).toContain('CREATE TABLE testdb.DEPT');
      expect(promptText).toContain('CREATE TABLE oradb.DEPT');
      expect(promptText.match(/CREATE TABLE \S+\.DEPT/g)).toHaveLength(2);
    });

    it('filters by schemaName only, returning every table in that schema', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        schemaName: 'oradb',
      });

      expect(promptText).toContain('CREATE TABLE oradb.DEPT');
      expect(promptText).toContain('CREATE TABLE oradb.EMP');
      expect(promptText).not.toContain('testtable');
      expect(promptText.match(/CREATE TABLE /g)).toHaveLength(2);
    });

    it('filters by schemaName and tableName together, narrowing to a single table', async () => {
      const promptText = await createRdsSchemaDefinitionsForPrompt({
        db,
        schemaName: 'oradb',
        tableName: 'DEPT',
      });

      expect(promptText.match(/CREATE TABLE oradb\.DEPT/g)).toHaveLength(1);

      const oradbSchema = db.children.find((it) => it.name === 'oradb');
      const deptTable = oradbSchema.children.find((it) => it.name === 'DEPT');
      expect(promptText.trim()).toBe(
        toCreateTableDDL({ dbTable: deptTable, schemaName: 'oradb' }).trim(),
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

      // The qualifier reflects the schema's real (as-stored) name, not the filter's casing.
      expect(promptText).toContain('CREATE TABLE oradb.DEPT');
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

      expect(promptText).toContain('CREATE TABLE public.extra_table');
    });
  });

  describe('toCreateTableDDL', () => {
    const findTable = (schemaName: string, tableName: string): DbTable => {
      const schema = db.children.find((it) => it.name === schemaName);
      return schema.children.find((it) => it.name === tableName);
    };

    it('qualifies the table name with schemaName when given', () => {
      const deptTable = findTable('oradb', 'DEPT');

      expect(toCreateTableDDL({ dbTable: deptTable, schemaName: 'oradb' })).toMatch(
        /^CREATE TABLE oradb\.DEPT \(/,
      );
    });

    it('falls back to the bare table name when schemaName is omitted (backward compatible)', () => {
      const deptTable = findTable('oradb', 'DEPT');

      expect(toCreateTableDDL({ dbTable: deptTable })).toMatch(
        /^CREATE TABLE DEPT \(/,
      );
    });

    it('same-named tables in different schemas produce distinguishable, non-identical DDL', () => {
      const testdbDept = findTable('testdb', 'DEPT');
      const oradbDept = findTable('oradb', 'DEPT');

      const testdbDDL = toCreateTableDDL({
        dbTable: testdbDept,
        schemaName: 'testdb',
      });
      const oradbDDL = toCreateTableDDL({
        dbTable: oradbDept,
        schemaName: 'oradb',
      });

      expect(testdbDDL).not.toBe(oradbDDL);
      expect(testdbDDL).toContain('CREATE TABLE testdb.DEPT');
      expect(oradbDDL).toContain('CREATE TABLE oradb.DEPT');
    });

    describe('identifier quoting', () => {
      const buildTable = (): DbTable => {
        const table = new DbTable('my table', 'TABLE');
        table.addChild(
          new DbColumn('id', GeneralColumnType.INTEGER, { key: 'PRI' }),
        );
        return table;
      };

      it('quotes schema and table names that need it with a double quote by default', () => {
        expect(
          toCreateTableDDL({ dbTable: buildTable(), schemaName: 'my-schema' }),
        ).toMatch(/^CREATE TABLE "my-schema"\."my table" \(/);
      });

      it('quotes with a backtick when idQuoteCharacter is `', () => {
        expect(
          toCreateTableDDL({
            dbTable: buildTable(),
            schemaName: 'my-schema',
            idQuoteCharacter: '`',
          }),
        ).toMatch(/^CREATE TABLE `my-schema`\.`my table` \(/);
      });

      it('leaves safe identifiers unquoted regardless of idQuoteCharacter', () => {
        const deptTable = findTable('oradb', 'DEPT');

        expect(
          toCreateTableDDL({
            dbTable: deptTable,
            schemaName: 'oradb',
            idQuoteCharacter: '`',
          }),
        ).toMatch(/^CREATE TABLE oradb\.DEPT \(/);
      });
    });
  });
});
