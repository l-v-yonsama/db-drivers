import PostgresDriver from '../../../src/db/drivers/PostgresDriver';
import {
  DbConnection,
  DbSchema,
  DbTable,
  DbColumn,
  DbDatabase,
} from '../../../src/db/resource/DbResource';
import { DBType } from '../../../src/db/resource/types/DBType';
import { default as pg } from 'pg';
import { GeneralColumnType } from '../../../src/db/resource/types/GeneralColumnType';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6002,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
};
const connectOption = {
  ...baseConnectOption,
  dbType: DBType.Postgres,
  enviroment: 'ut',
};

const CREATE_TABLE_STATEMENT = `
CREATE TABLE testtable (
  ID SERIAL NOT NULL PRIMARY KEY,
  n0 BIT,
  n1 INT,
  n2 BIGINT,
  n3 SMALLSERIAL,
  n4 BIGSERIAL,
  f1 NUMERIC(6,4),
  f2 DOUBLE PRECISION,
  f3 REAL,

  d1 DATE,
  d2 TIME, 
  d3 TIMESTAMP, 
  d4 TIMESTAMP WITH TIME ZONE, 
  d5 INTERVAL YEAR,

  s1 CHAR(10),
  s2 VARCHAR(10), 
  s3 TEXT,
  s4 mood, 
  s5 BYTEA,
  s6 uuid,

  j1 JSON

)`;

describe('PostgresDriver', () => {
  let driver: PostgresDriver;
  let conRes: DbConnection;
  let client: pg.Client;

  beforeAll(async () => {
    driver = createDriver();

    client = new pg.Client(baseConnectOption);

    await client.connect();

    await client.query('DROP TABLE IF EXISTS testtable');
    await client.query('DROP TYPE IF EXISTS mood');
    await client.query("CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy')");

    await client.query(CREATE_TABLE_STATEMENT);

    await client.query(
      "COMMENT ON TABLE testtable IS 'table with various data types'",
    );
  });

  afterAll(async () => {
    await driver.disconnect();
    client.end();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('PostgresDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: DbDatabase;
    let testSchemaRes: DbSchema;
    let testTableRes: DbTable;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas({});
      testDbRes = dbRootRes.find((it) => it.name === 'testdb') as DbDatabase;
      expect(testDbRes.getName()).toBe(driver.getConnectionRes().database);
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.getChildren()).toHaveLength(1);
      testSchemaRes = testDbRes.getSchema({ isDefault: true });
      expect(testSchemaRes.getName()).toBe('public');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchemaRes.getChildByName('testtable') as DbTable;
      expect(testTableRes.getName()).toBe('testtable');
      expect(testTableRes.tableType).toBe('TABLE');
      expect(testTableRes.comment).toBe('table with various data types');
    });

    it('should have Column resource', async () => {
      // ID
      const idRes = testTableRes.getChildByName('ID') as DbColumn;
      expect(idRes.colType).toBe(GeneralColumnType.INTEGER);
      expect(idRes.nullable).toBe(false);
      expect(idRes.key).toBe('PRI');
      expect(idRes.default).toContain('nextval');
      // n0
      const n0Res = testTableRes.getChildByName('n0') as DbColumn;
      expect(n0Res.colType).toBe(GeneralColumnType.BIT);
      expect(n0Res.nullable).toBe(true);
      // n1
      const n1Res = testTableRes.getChildByName('n1') as DbColumn;
      expect(n1Res.colType).toBe(GeneralColumnType.INTEGER);
      expect(n1Res.nullable).toBe(true);
    });
  });

  function createDriver(): PostgresDriver {
    conRes = new DbConnection(connectOption);
    return new PostgresDriver(conRes);
  }
});
