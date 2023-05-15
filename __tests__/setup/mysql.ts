import * as mysql from 'mysql2/promise';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ResultSetHeader } from 'mysql2/promise';
import { DbResource, fromJson } from '../../src';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6001,
  user: 'root',
  password: 'p@ssw0rd',
  database: 'testdb',
};

export const RES_FILE_NAMES = ['mysqlDbRes.json'] as const;
export type ResFileNames = (typeof RES_FILE_NAMES)[number];

const dataFolder = path.join('__tests__', 'data');

export async function saveRes(
  name: ResFileNames,
  res: DbResource,
): Promise<void> {
  const data = res.toJsonStringify();
  await fs.writeFile(path.join(dataFolder, name.toString()), data, {
    encoding: 'utf8',
  });
}

export async function loadRes<T extends DbResource>(
  name: ResFileNames,
): Promise<T> {
  const jsonString = await fs.readFile(path.join(dataFolder, name.toString()), {
    encoding: 'utf8',
  });
  return fromJson<T>(JSON.parse(jsonString));
}

export async function init(): Promise<void> {
  const con = await mysql.createConnection(baseConnectOption);

  try {
    await con.execute('DROP TABLE IF EXISTS testdb.testtable');
    await con.execute<ResultSetHeader>(CREATE_TABLE_STATEMENT);

    const now = new Date();
    for (let i = 1; i <= 10; i++) {
      const integers = [
        0,
        1 + i,
        2 + i + i * 10,
        3 + i + i * 100,
        4 + i + i * 1000,
      ];
      const decimals = [12.3456 + i, 0.1 + i, 0.05 + i];
      const datetimes = [now, now, now, now, now];
      const strings = [
        'No' + i,
        's2-' + i,
        's3a-' + i,
        's3b-' + i,
        's3c-' + i,
        's3d-' + i,
        'a',
        's5',
        's6',
        's7',
        'b',
      ];
      const others = [{ k1: 'v1' }];
      const binds = [
        ...integers,
        ...decimals,
        ...datetimes,
        ...strings,
        ...others,
      ];
      await con.execute(INSERT_STATEMENT, binds);
    }

    await con.execute('DROP TABLE IF EXISTS testdb.diff');
    await con.execute(CREATE_TABLE_STATEMENT2);
    for (let i = 1; i <= 10; i++) {
      const binds = [
        `Uchida${i}`,
        `Takeshi${i}`,
        `Uchida${i} Takeshi${i}`,
        `note${i}`,
        new Date(2023, 10, i),
      ];
      await con.execute(INSERT_STATEMENT2, binds);
    }

    await con.execute('DROP TABLE IF EXISTS testdb.DEPT');
    await con.execute(CREATE_TABLE_ORA_DEPT.replace('oradb', 'testdb'));
    await con.execute('DROP TABLE IF EXISTS testdb.EMP');
    await con.execute(CREATE_TABLE_ORA_EMP.replace('oradb', 'testdb'));

    await con.execute('DROP DATABASE IF EXISTS oradb');
    await con.execute(`CREATE DATABASE oradb`);
    await con.execute(
      `GRANT ALL PRIVILEGES ON oradb.* TO 'testuser'@'%' WITH GRANT OPTION`,
    );
    await con.execute(CREATE_TABLE_ORA_DEPT);
    await con.execute(CREATE_TABLE_ORA_EMP);
    for (let i = 1; i <= 10; i++) {
      const binds = [i, `DN${i}`, `LOC${i}`];
      await con.execute(`INSERT INTO oradb.DEPT VALUES (?, ?, ?)`, binds);

      const binds2 = [i, `SMITH${i}`, `CLERK${i}`, i, now, i, null, i];
      await con.execute(
        `INSERT INTO oradb.EMP VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        binds2,
      );
    }
  } finally {
    if (con) {
      await con.destroy();
    }
  }
}

const CREATE_TABLE_STATEMENT = `
CREATE TABLE testdb.testtable (
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
  s3a TINYTEXT,
  s3b TEXT,
  s3c MEDIUMTEXT,
  s3d LONGTEXT,
  s4 ENUM('a','b','c') COMMENT 'A list of a,b or c', 
  s5 BINARY(10),
  s6 VARBINARY(10),
  s7 BLOB,
  s8 SET('a','b','c'),

  g1 geometry NOT NULL,

  j1 JSON COMMENT 'JSON data type'

) COMMENT='table with various data types'
`;

const CREATE_TABLE_STATEMENT2 = `
CREATE TABLE testdb.diff (
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) unique,
  note VARCHAR(128),
  birthday DATE,
  PRIMARY KEY(last_name, first_name)

) COMMENT='test diff'
`;

const CREATE_TABLE_ORA_DEPT = `CREATE TABLE oradb.DEPT (
  DEPTNO integer NOT NULL,
  DNAME varchar(14) default NULL,
  LOC varchar(13) default NULL,
  PRIMARY KEY  (DEPTNO)
) `;

const CREATE_TABLE_ORA_EMP = `CREATE TABLE oradb.EMP (
  EMPNO int(11) NOT NULL,
  ENAME varchar(10) default NULL,
  JOB varchar(9) default NULL,
  MGR int(11) default NULL,
  HIREDATE date default NULL,
  SAL float(7,2) default NULL,
  COMM float(7,2) default NULL,
  DEPTNO int(11) default NULL,
  PRIMARY KEY  (EMPNO),
  KEY newfk (DEPTNO)
) `;

const INSERT_STATEMENT = `INSERT INTO testdb.testtable (
  n0, n1, n2, n3, n4, 
  f1, f2, f3,
  d1, d2, d3, d4, d5,
  s1, s2, s3a, s3b, s3c, s3d, s4, s5, s6, s7, s8,
  g1, j1 )
  VALUES(
    ?, ?, ?, ?, ?, 
    ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
    ST_GeomFromText('POINT(35.702727 100)'), ? )`;

const INSERT_STATEMENT2 = `INSERT INTO testdb.diff (
  last_name, first_name, full_name, note, birthday )
  VALUES(?, ?, ?, ?, ?)`;
