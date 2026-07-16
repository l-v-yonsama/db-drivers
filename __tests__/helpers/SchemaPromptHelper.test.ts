import { eolToSpace, GeneralColumnType } from '@l-v-yonsama/rdh';
import {
  AwsDatabase,
  AwsServiceType,
  createAwsSchemaDefinitionsForPrompt,
  createRdsSchemaDefinitionsForPrompt,
  createTableDefinisionsForPrompt,
  DbColumn,
  DbDynamoTable,
  DbDynamoTableColumn,
  DbLogGroup,
  DbS3Bucket,
  DbS3Owner,
  DbSchema,
  DbSQSQueue,
  DbTable,
  RdsDatabase,
  toCreateTableDDL,
} from '../../src';
import * as SchemaPromptHelperExports from '../../src';
import { loadMysqlDbFixture } from '../setup/mysql';

describe('SchemaPromptHelper', () => {
  let db: RdsDatabase;

  beforeAll(async () => {
    db = await loadMysqlDbFixture();
  });

  describe('module exports', () => {
    // Guard against the package barrel (src/index.ts) silently dropping a
    // re-export of a symbol that lives in SchemaPromptHelper.ts.
    it('still exposes every function defined in SchemaPromptHelper.ts', () => {
      const exportedFunctionNames = [
        'createTableDefinisionsForPrompt',
        'createRdsSchemaDefinitionsForPrompt',
        'toCreateTableDDL',
        'toDynamoTableSchemaText',
        'createAwsSchemaDefinitionsForPrompt',
      ];

      exportedFunctionNames.forEach((name) => {
        expect(typeof (SchemaPromptHelperExports as any)[name]).toBe(
          'function',
        );
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

  describe('createAwsSchemaDefinitionsForPrompt', () => {
    const buildDynamoDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('DynamoDB', AwsServiceType.DynamoDB);
      const table = new DbDynamoTable('Music', {
        lsi: [
          {
            IndexName: 'AlbumTitleIndex',
            // A real LSI's KeySchema always repeats the table's own
            // partition key (HASH) alongside its own sort key (RANGE).
            KeySchema: [
              { AttributeName: 'Artist', KeyType: 'HASH' },
              { AttributeName: 'AlbumTitle', KeyType: 'RANGE' },
            ],
          },
        ],
        gsi: [
          {
            IndexName: 'GenreIndex',
            KeySchema: [{ AttributeName: 'Genre', KeyType: 'HASH' }],
            IndexStatus: 'ACTIVE',
          },
        ],
      });
      table.addChild(new DbDynamoTableColumn('Artist', 'S', true, false));
      table.addChild(new DbDynamoTableColumn('SongTitle', 'S', false, true));
      table.addChild(new DbDynamoTableColumn('Genre', 'S', false, false));
      table.addChild(new DbDynamoTableColumn('AlbumTitle', 'S', false, false));
      awsDb.addChild(table);
      return awsDb;
    };

    const buildS3Db = (): AwsDatabase => {
      const awsDb = new AwsDatabase('S3', AwsServiceType.S3);
      awsDb.addChild(
        new DbS3Bucket('bucket-a', new Date('2023-01-01T00:00:00Z')),
      );
      awsDb.addChild(
        new DbS3Bucket('bucket-b', new Date('2023-02-01T00:00:00Z')),
      );
      awsDb.addChild(new DbS3Owner('owner-id-1', 'account-owner'));
      return awsDb;
    };

    const buildCloudwatchDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('Cloudwatch', AwsServiceType.Cloudwatch);
      awsDb.addChild(
        new DbLogGroup('/aws/lambda/my-func', {
          retentionInDays: 14,
          storedBytes: 2048,
          creationTime: Date.parse('2023-03-01T00:00:00Z'),
        }),
      );
      return awsDb;
    };

    const buildSqsDb = (): AwsDatabase => {
      const awsDb = new AwsDatabase('SQS', AwsServiceType.SQS);
      awsDb.addChild(
        new DbSQSQueue(
          'orders.fifo',
          'https://sqs.us-east-1.amazonaws.com/123456789012/orders.fifo',
          {
            FifoQueue: true,
            RedrivePolicy: JSON.stringify({
              deadLetterTargetArn:
                'arn:aws:sqs:us-east-1:123456789012:orders-dlq',
              maxReceiveCount: '5',
            }),
          },
        ),
      );
      awsDb.addChild(
        new DbSQSQueue(
          'notifications',
          'https://sqs.us-east-1.amazonaws.com/123456789012/notifications',
          {},
        ),
      );
      return awsDb;
    };

    it('renders DynamoDB tables in Dynamo-native vocabulary under a "-- DynamoDB --" / "--- Tables ---" heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildDynamoDb(),
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (1 table) ---');
      expect(promptText).toContain('Music (');
      expect(promptText).toContain('Artist String PARTITION KEY,');
      expect(promptText).toContain('SongTitle String SORT KEY');
      expect(promptText).toContain('GSI GenreIndex (');
      expect(promptText).toContain('Genre String PARTITION KEY');
      expect(promptText).toContain('LSI AlbumTitleIndex (');
      expect(promptText).toContain('AlbumTitle String SORT KEY');
      expect(promptText).toContain('ATTRIBUTES (');
      expect(promptText).toContain('Genre String,');
    });

    it('omits the redundant partition key line from LSI blocks (always identical to the table PK)', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildDynamoDb(),
      });

      const lsiStart = promptText.indexOf('LSI AlbumTitleIndex (');
      const lsiEnd = promptText.indexOf(')', lsiStart);
      const lsiBlock = promptText.slice(lsiStart, lsiEnd);

      expect(lsiBlock).not.toContain('PARTITION KEY');
      expect(lsiBlock).toContain('AlbumTitle String SORT KEY');
    });

    it('renders buckets and the owner for S3 under separate resource-group headings', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildS3Db(),
      });

      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('--- Buckets (2 buckets) ---');
      expect(promptText).toContain('- Bucket: bucket-a');
      expect(promptText).toContain('- Bucket: bucket-b');
      expect(promptText).toContain('--- Owners (1 owner) ---');
      expect(promptText).toContain('- Owner: account-owner (id: owner-id-1)');
    });

    it('renders formatted attributes for Cloudwatch log groups under a LogGroups heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildCloudwatchDb(),
      });

      expect(promptText).toContain('-- Cloudwatch --');
      expect(promptText).toContain('--- LogGroups (1 log group) ---');
      expect(promptText).toContain('- LogGroup: /aws/lambda/my-func');
      expect(promptText).toContain('retention: 14 days');
      expect(promptText).toContain('size: 2048 bytes');
    });

    it('renders FIFO and parsed DLQ info for SQS queues under a Queues heading, and "DLQ: none" otherwise', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: buildSqsDb(),
      });

      expect(promptText).toContain('-- SQS --');
      expect(promptText).toContain('--- Queues (2 queues) ---');
      expect(promptText).toContain(
        '- orders.fifo (type: FIFO, DLQ: arn:aws:sqs:us-east-1:123456789012:orders-dlq (maxReceiveCount: 5))',
      );
      expect(promptText).toContain(
        '- notifications (type: Standard, DLQ: none)',
      );
    });

    it('filters by resourceName across multiple services, only rendering the match - other resource-type groups still get a "(0 ...)" heading', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db()],
        resourceName: 'bucket-a',
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (0 tables) ---');
      expect(promptText).not.toContain('Music (');

      expect(promptText).toContain('--- Buckets (1 bucket) ---');
      expect(promptText).toContain('- Bucket: bucket-a');
      expect(promptText).not.toContain('bucket-b');
      // 'account-owner' doesn't match the 'bucket-a' filter, so the Owners
      // group is still headed, just empty.
      expect(promptText).toContain('--- Owners (0 owners) ---');
      expect(promptText).not.toContain('- Owner: account-owner');
    });

    it('still returns a "(0 ...)" heading for every queried service/group when resourceName matches nothing at all', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db()],
        resourceName: 'no-such-resource',
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (0 tables) ---');
      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('--- Buckets (0 buckets) ---');
      expect(promptText).toContain('--- Owners (0 owners) ---');
    });

    it('returns undefined when no service in db has anything schema-like to render (e.g. SES only)', async () => {
      const sesDb = new AwsDatabase('SES', AwsServiceType.SES);
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: sesDb,
      });

      expect(promptText).toBeUndefined();
    });

    it('filters by serviceType, skipping other services entirely', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db()],
        serviceType: AwsServiceType.S3,
      });

      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('- Bucket: bucket-a');
      expect(promptText).not.toContain('-- DynamoDB --');
    });

    it('renders a section for every service when no filter is given', async () => {
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [buildDynamoDb(), buildS3Db(), buildCloudwatchDb(), buildSqsDb()],
      });

      expect(promptText).toContain('-- DynamoDB --');
      expect(promptText).toContain('--- Tables (1 table) ---');
      expect(promptText).toContain('-- S3 --');
      expect(promptText).toContain('--- Buckets (2 buckets) ---');
      expect(promptText).toContain('-- Cloudwatch --');
      expect(promptText).toContain('--- LogGroups (1 log group) ---');
      expect(promptText).toContain('-- SQS --');
      expect(promptText).toContain('--- Queues (2 queues) ---');
    });

    it('ignores AWS services with nothing schema-like to render, such as SES', async () => {
      const sesDb = new AwsDatabase('SES', AwsServiceType.SES);
      const promptText = await createAwsSchemaDefinitionsForPrompt({
        db: [sesDb, buildS3Db()],
      });

      expect(promptText).toContain('-- S3 --');
      expect(promptText).not.toContain('SES');
    });
  });
});
