import MySQLDriver from '../../../src/db/drivers/MySQLDriver';
import {
  DbConnection,
  DbResource,
  DbSchema,
  DbTable,
  DbColumn,
} from '../../../src/db/resource/DbResource';
import { DBType } from '../../../src/db/resource/types/DBType';
import * as mysql from 'mysql2/promise';
import { ResultSetHeader } from 'mysql2/promise';
import { GeneralColumnType } from '../../../src/db/resource/types/GeneralColumnType';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6001,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
};
const connectOption = {
  ...baseConnectOption,
  db_type: DBType.MySQL,
  enviroment: 'ut',
};

const CREATE_TABLE_STATEMENT = `
CREATE TABLE testtable (
  ID int auto_increment PRIMARY KEY,
  n0 BIT,
  n1 TINYINT COMMENT 'MAX 127',
  n2 SMALLINT COMMENT 'MAX 32767',
  n3 MEDIUMINT COMMENT 'MAX 8388607',
  n4 BIGINT COMMENT 'MAX 9223372036854775807',
  f1 DECIMAL(6,4),
  f2 FLOAT,
  f3 DOUBLE,

  d1 DATE COMMENT '“Zero” Value 0000-00-00',
  d2 TIME COMMENT '“Zero” Value 00:00:00', 
  d3 DATETIME COMMENT '“Zero” Value 0000-00-00 00:00:00',
  d4 TIMESTAMP COMMENT '“Zero” Value 0000-00-00 00:00:00', 
  d5 YEAR COMMENT '“Zero” Value 0000',

  s1 CHAR(10),
  s2 VARCHAR(10), 
  s3 TEXT,
  s4 ENUM('a','b','c') COMMENT 'A list of a,b or c', 
  s5 BINARY(10),
  s6 VARBINARY(10),
  s7 BLOB,
  s8 SET('a','b','c'),

  g1 geometry NOT NULL,

  j1 JSON COMMENT 'JSON data type'

) COMMENT='table with various data types'
`;

describe('MySQLDriver', () => {
  let driver: MySQLDriver;
  let conRes: DbConnection;
  let con: mysql.Connection;

  beforeAll(async () => {
    driver = createDriver();

    con = await mysql.createConnection(baseConnectOption);

    await con.connect();

    await con.execute('DROP TABLE IF EXISTS testtable');

    const [rows, fields] = await con.execute<ResultSetHeader>(
      CREATE_TABLE_STATEMENT,
    );
    console.log('rows=', rows);
    console.log('fields=', fields);
  });

  afterAll(async () => {
    await driver.asyncClose();
    con.destroy();
  });

  it('asyncConnect', async () => {
    expect(await driver.asyncConnect()).toBe('');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('MySQLDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: DbResource;
    let testSchemaRes: DbSchema;
    let testTableRes: DbTable;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.asyncGetResouces({});
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.getName()).toBe(driver.getConnectionRes().database);
    });

    it('should have Schema resource', async () => {
      expect(testDbRes.getChildren()).toHaveLength(1);
      testSchemaRes = testDbRes.getChildren()[0];
      expect(testSchemaRes.getName()).toBe('testdb');
    });

    it('should have Table resource', async () => {
      testTableRes = testSchemaRes.getChildByName('testtable') as DbTable;
      expect(testTableRes.getName()).toBe('testtable');
      expect(testTableRes.table_type).toBe('TABLE');
      expect(testTableRes.comment).toBe('table with various data types');
    });

    it('should have Column resource', async () => {
      // console.log(testTableRes.getChildren());
      // ID
      const idRes = testTableRes.getChildByName('ID') as DbColumn;
      expect(idRes.col_type).toBe(GeneralColumnType.INTEGER);
      expect(idRes.nullable).toBe(false);
      expect(idRes.key).toBe('PRI');
      expect(idRes.extra).toBe('auto_increment');
      // n0
      const n0Res = testTableRes.getChildByName('n0') as DbColumn;
      expect(n0Res.col_type).toBe(GeneralColumnType.BIT);
      expect(n0Res.nullable).toBe(true);
      // n1
      const n1Res = testTableRes.getChildByName('n1') as DbColumn;
      expect(n1Res.col_type).toBe(GeneralColumnType.TINYINT);
      expect(n1Res.nullable).toBe(true);
    });
  });

  function createDriver(): MySQLDriver {
    conRes = new DbConnection(connectOption);
    return new MySQLDriver(conRes);
  }
});
