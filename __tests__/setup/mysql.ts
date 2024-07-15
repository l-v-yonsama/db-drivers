import { promises as fs } from 'fs';
import * as mysql from 'mysql2/promise';
import { ResultSetHeader } from 'mysql2/promise';
import * as path from 'path';
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
    await con.query(`GRANT ALL PRIVILEGES ON testdb.* TO 'testuser'@'%'`);
    await con.execute('DROP TABLE IF EXISTS testdb.testtable');
    await con.execute<ResultSetHeader>(CREATE_TABLE_STATEMENT);

    const dt = new Date(2023, 10, 11, 12, 13, 14, 0);
    for (let i = 1; i <= 10; i++) {
      const integers = [
        0,
        1 + i,
        2 + i + i * 10,
        3 + i + i * 100,
        4 + i + i * 1000,
      ];
      const decimals = [12.3456, 0.5, 0.05];
      const datetimes = [dt, dt, dt, dt, dt];
      const strings = [
        'No' + i,
        's2-' + i,
        's3a-' + i,
        's3b-' + i,
        's3c-' + i,
        'long_column_name_long_text-' + i,
        'b',
        's5',
        's6',
        's7',
        'b',
      ];
      const others = [{ k1: 'v' + i }];
      const binds = [
        ...integers,
        ...decimals,
        ...datetimes,
        ...strings,
        ...others,
      ];
      await con.execute(INSERT_STATEMENT, binds);
    }
    await con.execute('UPDATE testtable set n1 = n2 + 1 WHERE id=8 ');
    await con.execute(
      "UPDATE testtable set s4='b', d1=NULL, d2=NULL WHERE id=9 ",
    );

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

    await con.execute('DROP TABLE IF EXISTS testdb.diff2');
    await con.execute(CREATE_DIFF2_TABLE_STATEMENT);

    for (let i = 0; i < 20; i++) {
      await con.execute(`DROP TABLE IF EXISTS testdb.tmp${i}`);
      await con.execute(`CREATE TABLE testdb.tmp${i} (
        ID integer NOT NULL,
        PRIMARY KEY  (ID)
      ) `);
    }

    await con.execute('DROP TABLE IF EXISTS testdb.DEPT');
    await con.execute(CREATE_TABLE_ORA_DEPT.replace('oradb', 'testdb'));
    await con.execute('DROP TABLE IF EXISTS testdb.EMP');
    await con.execute(CREATE_TABLE_ORA_EMP.replace('oradb', 'testdb'));

    await con.execute(
      `INSERT INTO testdb.DEPT VALUES(10, 'ACCOUNTING', 'NEW YORK')`,
    );
    await con.execute(
      `INSERT INTO testdb.DEPT VALUES(20, 'RESEARCH', 'DALLAS')`,
    );
    await con.execute(`INSERT INTO testdb.DEPT VALUES(30, 'SALES', 'CHICAGO')`);
    await con.execute(
      `INSERT INTO testdb.DEPT VALUES(40, 'OPERATIONS', 'BOSTON')`,
    );

    const empValues = [
      [7839, 'KING', 0, 'PRESIDENT', null, 5000, 10],
      [7698, 'TARO', 1, 'MANAGER', 7839, 2850, 30],
      [7782, 'POCHI', 9, '', 7839, 2450, 10],
      [7566, 'HANAKO', 2, 'MANAGER', 7839, 2975, 20],
      [7788, 'SCOTT', 1, 'ANALYST', null, 3000, 30],
      [8000, 'TANUKICHI', 6, 'MANAGER', null, 2975, 20],
    ];

    for (const ev of empValues) {
      await con.execute(
        `INSERT INTO testdb.EMP 
      (EMPNO,ENAME,SEX,JOB,MGR,SAL, DEPTNO) 
      VALUES(?,?,?,?,?,?,?)`,
        ev,
      );
    }

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

      const binds2 = [
        i,
        `SMITH${i}`,
        i === 10 ? 6 : i % 3, // sex
        `CLERK${i}`,
        i,
        dt,
        i,
        null,
        i,
      ];
      await con.execute(
        `INSERT INTO oradb.EMP (EMPNO, ENAME, SEX, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        binds2,
      );
    }

    await con.execute('DROP TABLE IF EXISTS testdb.order_detail');
    await con.execute('DROP TABLE IF EXISTS testdb.order');
    await con.execute('DROP TABLE IF EXISTS testdb.customer');
    await con.execute(CREATE_CUSTOMER_TABLE_STATEMENT);
    await con.execute(CREATE_ORDER_TABLE_STATEMENT);
    await con.execute(CREATE_ORDER_DETAIL_TABLE_STATEMENT);
    for (let i = 1; i <= 10; i++) {
      const binds = [i, `0120-11-121${i % 10}`];
      await con.execute(
        `INSERT INTO testdb.customer (customer_no, tel) VALUES (?, ?)`,
        binds,
      );

      const binds2 = [i, i, dt, i * 100];
      await con.execute(
        `INSERT INTO testdb.order (order_no, customer_no, order_date, amount) 
          VALUES (?, ?, ?, ?)`,
        binds2,
      );

      const binds3 = [i, i, i * 10, i * 100];
      await con.execute(
        `INSERT INTO testdb.order_detail (order_no, detail_no, item_no, amount) 
          VALUES (?, ?, ?, ?)`,
        binds3,
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
  long_column_name_long_text LONGTEXT,
  s4 ENUM('a','b','c') COMMENT 'A list of a,b or c', 
  s5 BINARY(10),
  s6 VARBINARY(10),
  s7 BLOB,
  s71 TINYBLOB,
  s8 SET('a','b','c'),

  g1 geometry,

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

const CREATE_DIFF2_TABLE_STATEMENT = `
CREATE TABLE testdb.diff2 (
  id int auto_increment PRIMARY KEY,
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) ,
  note VARCHAR(128),
  birthday DATE,
  UNIQUE KEY ukd (last_name, first_name)

)
`;

const CREATE_TABLE_ORA_DEPT = `CREATE TABLE oradb.DEPT (
  DEPTNO integer NOT NULL COMMENT '部門番号',
  DNAME varchar(14) default NULL COMMENT '部門名',
  LOC varchar(13) default NULL COMMENT 'ロケーション',
  PRIMARY KEY  (DEPTNO)
) COMMENT='部門' `;

const CREATE_TABLE_ORA_EMP = `CREATE TABLE oradb.EMP (
  EMPNO int(11) NOT NULL,
  ENAME varchar(10) default NULL,
  SEX tinyint NOT NULL default 0,
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
  s1, s2, s3a, s3b, s3c, long_column_name_long_text, s4, s5, s6, s7, s8,
  g1, j1 )
  VALUES(
    ?, ?, ?, ?, ?, 
    ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?, ?, ?, HEX(?), ?,
    ST_GeomFromText('POINT(35.702727 100)'), ? )`;

const INSERT_STATEMENT2 = `INSERT INTO testdb.diff (
  last_name, first_name, full_name, note, birthday )
  VALUES(?, ?, ?, ?, ?)`;

const CREATE_CUSTOMER_TABLE_STATEMENT = `CREATE TABLE testdb.customer (
  customer_no int auto_increment PRIMARY KEY COMMENT '顧客番号',
  tel VARCHAR(20) COMMENT '電話番号'
) COMMENT='顧客'
`;

const CREATE_ORDER_TABLE_STATEMENT = `CREATE TABLE testdb.order (
  order_no int auto_increment PRIMARY KEY COMMENT '受注番号',
  customer_no int COMMENT '顧客番号',
  order_date DATE COMMENT '受注日',
  amount int COMMENT '受注金額',

  FOREIGN KEY fk_customer_no(customer_no) REFERENCES testdb.customer(customer_no)
) COMMENT='受注'
`;

const CREATE_ORDER_DETAIL_TABLE_STATEMENT = `CREATE TABLE testdb.order_detail (
  order_no int COMMENT '受注番号',
  detail_no int COMMENT '受注明細番号',
  item_no int COMMENT '商品番号',
  amount int COMMENT '金額',

  PRIMARY KEY(order_no, detail_no),
  FOREIGN KEY fk_order_no(order_no) REFERENCES testdb.order(order_no)
) COMMENT='受注明細'
`;
