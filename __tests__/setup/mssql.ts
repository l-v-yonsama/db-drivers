import * as mssql from 'mssql';
import { promises as fs } from 'fs';
import * as path from 'path';
import { DbResource, fromJson } from '../../src';

const baseConnectOption0: mssql.config = {
  server: '127.0.0.1',
  port: 6433,
  user: 'sa',
  password: 'Pass123zxcv!',
  database: 'master',
  options: {
    // If you are on Microsoft Azure, you need encryption:
    encrypt: false,
    // database: 'your_database'  //update me
  },
};

const baseConnectOption: mssql.config = {
  server: '127.0.0.1',
  port: 6433,
  user: 'testuser',
  password: 'Pass123zxcv!',
  database: 'testdb',
  options: {
    // If you are on Microsoft Azure, you need encryption:
    /**
     * A boolean determining whether or not the connection will be encrypted. Set to true if you're on Windows Azure. (default: false).
     */
    encrypt: false,
  },
};

export const RES_FILE_NAMES = ['mssqlDbRes.json'] as const;
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

export async function init0(): Promise<void> {
  const con = await mssql.connect(baseConnectOption0);

  try {
    const q = async (sql: string) => con.request().query(sql);
    const cq = async (sql: string): Promise<number> => {
      const r = await con.request().query(sql);
      return r.recordset[0].count;
    };
    const pq = async (sql: string, binds: any[]) => {
      const req = con.request();
      binds.forEach((it, idx) => req.input(`${idx + 1}`, it));
      return await req.query(sql);
    };

    // await q('CREATE DATABASE testdb');
    await q('USE testdb');
    // await q('ALTER LOGIN testuser WITH DEFAULT_DATABASE=testdb');
    // await q(
    //     `CREATE LOGIN testuser WITH PASSWORD = 'Pass123zxcv!', DEFAULT_DATABASE = testdb`,
    //   );
    const countSchema0 = await cq(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.SCHEMATA WHERE CATALOG_NAME='testdb' AND SCHEMA_NAME='schema0'`,
    );
    if (countSchema0 === 0) {
      await q('CREATE SCHEMA schema0');
    }
    const countSchema1 = await cq(
      `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.SCHEMATA WHERE CATALOG_NAME='testdb' AND SCHEMA_NAME='schema1'`,
    );
    if (countSchema1 === 0) {
      await q('CREATE SCHEMA schema1');
    }

    const countUser = await cq(
      `SELECT COUNT(*) as count
      FROM master.sys.server_principals
      WHERE default_database_name ='testdb' AND name ='testuser'`,
    );
    if (countUser > 0) {
      await q(`DROP USER testuser`);
    }
    await q(
      `CREATE USER testuser FOR LOGIN testuser WITH DEFAULT_SCHEMA=schema1`,
    );

    await q(`GRANT ALL to testuser`);
    await q(`GRANT SHOWPLAN to testuser`);

    for (const command of [
      'ALTER',
      'CONTROL',
      'CREATE SEQUENCE',
      'DELETE',
      'EXECUTE',
      'INSERT',
      'REFERENCES',
      'SELECT',
      'TAKE OWNERSHIP',
      'UPDATE',
    ]) {
      await q(`GRANT ${command} ON SCHEMA::schema0 TO testuser`);
      await q(`GRANT ${command} ON SCHEMA::schema1 TO testuser`);
    }
  } finally {
    if (con) {
      await con.close();
    }
  }
}

export async function init(): Promise<void> {
  const con = await mssql.connect(baseConnectOption);
  const q = async (sql: string) => con.request().query(sql);
  const pq = async (sql: string, binds: any[]) => {
    const req = con.request();
    binds.forEach((it, idx) => req.input(`${idx + 1}`, it));
    return await req.query(sql);
  };

  try {
    const a = await q('SELECT SCHEMA_NAME() as schenaName');
    await q('DROP TABLE IF EXISTS testtable');
    await q(CREATE_TABLE_STATEMENT);
    await q(`EXEC sys.sp_addextendedproperty  @name=N'MS_Description'
      ,@value=N'table with various data types'
      ,@level0type=N'SCHEMA'
      ,@level0name=N'schema1'
      ,@level1type=N'TABLE'
      ,@level1name=N'testtable'`);
    await q(`EXEC sys.sp_addextendedproperty  @name=N'MS_Description'
      ,@value=N'Unique id'
      ,@level0type=N'SCHEMA'
      ,@level0name=N'schema1'
      ,@level1type=N'TABLE'
      ,@level1name=N'testtable'
      ,@level2type=N'COLUMN'
      ,@level2name=N'ID'`);

    const dt = new Date(2023, 10, 11, 12, 13, 14, 0);
    for (let i = 1; i <= 10; i++) {
      const req = con.request();
      req.input('1', 0);
      req.input('2', 1 + i);
      req.input('3', 2 + i + i * 10);
      req.input('4', 3 + i + i * 100);
      req.input('5', 12.3456);
      req.input('6', 0.5);
      req.input('7', 0.05);
      req.input('8', dt); // DATE
      req.input('9', dt); // TIME
      req.input('10', dt); // DATETIME

      req.input('12', 'No' + i);
      req.input('13', 's2-' + i);
      req.input('14', 's3b-' + i);
      req.input('15', 's3c-' + i);
      req.input('16', Buffer.from('s5')); // BINARY
      req.input('17', Buffer.from('s6')); // VARBINARY

      await req.query(INSERT_STATEMENT);
    }

    await q('DROP TABLE IF EXISTS diff');
    await q(CREATE_TABLE_STATEMENT2);
    for (let i = 1; i <= 10; i++) {
      const req = con.request();
      req.input('1', `Uchida${i}`);
      req.input('2', `Takeshi${i}`);
      req.input('3', `Uchida${i} Takeshi${i}`);
      req.input('4', `note${i}`);
      req.input('5', new Date(2023, 10, i));
      await req.query(INSERT_STATEMENT2);
    }

    await q('DROP TABLE IF EXISTS diff2');
    await q(CREATE_DIFF2_TABLE_STATEMENT);

    await q('DROP TABLE IF EXISTS EMP');

    await q('DROP TABLE IF EXISTS DEPT');
    await q(CREATE_TABLE_DEPT);

    await q(`INSERT INTO DEPT VALUES(10, 'ACCOUNTING', 'NEW YORK')`);
    await q(`INSERT INTO DEPT VALUES(20, 'RESEARCH', 'DALLAS')`);
    await q(`INSERT INTO DEPT VALUES(30, 'SALES', 'CHICAGO')`);
    await q(`INSERT INTO DEPT VALUES(40, 'OPERATIONS', 'BOSTON')`);

    await q(CREATE_TABLE_EMP);

    const empValues = [
      [7839, 'KING', 0, 'PRESIDENT', null, 5000, 10],
      [7698, 'TARO', 1, 'MANAGER', 7839, 2850, 30],
      [7782, 'POCHI', 9, '', 7839, 2450, 10],
      [7566, 'HANAKO', 2, 'MANAGER', 7839, 2975, 20],
      [7788, 'SCOTT', 1, 'ANALYST', null, 3000, 30],
      [8000, 'TANUKICHI', 6, 'MANAGER', null, 2975, 20],
    ];

    for (const ev of empValues) {
      await pq(
        `INSERT INTO EMP 
      (EMPNO,ENAME,SEX,JOB,MGR,SAL, DEPTNO) 
      VALUES(@1,@2,@3,@4,@5,@6,@7)`,
        ev,
      );
    }

    await q('DROP TABLE IF EXISTS schema0.order_detail');
    await q('DROP TABLE IF EXISTS schema0.order1');
    await q('DROP TABLE IF EXISTS schema0.customer');

    await q(CREATE_CUSTOMER_TABLE_STATEMENT);

    const customerValues = [
      [7839, '0120-99-7000', 40, 172, 55],
      [7698, '0120-88-6000', 30, 152, 60],
      [7782, '0120-00-1234', 20, 145, 100],
      [7566, '0120-88-3321', 10, 100, 20],
      [7788, null, 5, 72, 10],
    ];

    await q(CREATE_ORDER_TABLE_STATEMENT);
    await q(CREATE_ORDER_DETAIL_TABLE_STATEMENT);
    for (let i = 0; i < customerValues.length; i++) {
      const no = i + 1;
      await pq(
        `INSERT INTO schema0.customer (customer_no, tel, age, height,weight)
         VALUES (@1, @2, @3, @4, @5)`,
        customerValues[i],
      );
      const customerNo = customerValues[i][0];

      const binds2 = [no, customerNo, dt, no * 100];
      await pq(
        `INSERT INTO schema0.order1 (order_no, customer_no, order_date, amount) 
          VALUES (@1, @2, @3, @4)`,
        binds2,
      );

      const binds3 = [no, no, no * 10, no * 100];
      await pq(
        `INSERT INTO schema0.order_detail (order_no, detail_no, item_no, amount) 
          VALUES (@1, @2, @3, @4)`,
        binds3,
      );
    }
  } finally {
    if (con) {
      await con.close();
    }
  }
}

const CREATE_TABLE_STATEMENT = `
CREATE TABLE testtable (
  ID int IDENTITY PRIMARY KEY,
  n0 BIT,
  n1 TINYINT,
  n2 SMALLINT,
  n4 BIGINT,
  f1 DECIMAL(6,4),
  f2 FLOAT,
  f3 REAL,
  d1 DATE,
  d2 TIME, 
  d3 DATETIME,
  d4 TIMESTAMP, 
  s1 CHAR(10),
  s2 VARCHAR(10), 
  s3b TEXT,
  s3c NTEXT,
  s5 BINARY(10),
  s6 VARBINARY(10),
  g1 geometry
)
`;

const INSERT_STATEMENT = `INSERT INTO testtable (
  n0, n1, n2, n4, 
  f1, f2, f3,
  d1, d2, d3, d4,
  s1, s2, s3b, s3c, s5, s6,
  g1 )
  VALUES(
    @1, @2, @3, @4,
    @5, @6, @7,
    @8, @9, @10, DEFAULT,
    @12, @13, @14, @15, @16, @17,
    geometry::STGeomFromText('POINT(135 35)', 4326)
  )`;

const CREATE_TABLE_STATEMENT2 = `
CREATE TABLE diff (
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) unique,
  note VARCHAR(128),
  birthday DATE,
  PRIMARY KEY(last_name, first_name)

)
`;

const CREATE_DIFF2_TABLE_STATEMENT = `
CREATE TABLE diff2 (
  id int IDENTITY PRIMARY KEY,
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) ,
  note VARCHAR(128),
  birthday DATE,
  CONSTRAINT ukd UNIQUE (last_name, first_name)

)
`;

const INSERT_STATEMENT2 = `INSERT INTO diff (
  last_name, first_name, full_name, note, birthday )
  VALUES(@1, @2, @3, @4, @5)`;

const CREATE_TABLE_DEPT = `CREATE TABLE DEPT (
    DEPTNO integer NOT NULL,
    DNAME varchar(14) default NULL,
    LOC varchar(13) default NULL,
    PRIMARY KEY  (DEPTNO)
  )`;

const CREATE_TABLE_EMP = `CREATE TABLE EMP (
    EMPNO int NOT NULL,
    ENAME varchar(10) default NULL,
    SEX int NOT NULL default 0,
    JOB varchar(9) default NULL,
    MGR int default NULL,
    HIREDATE date default NULL,
    SAL int default NULL,
    COMM NUMERIC(7,2) default NULL,
    DEPTNO int default NULL,

    PRIMARY KEY  (EMPNO),
    FOREIGN KEY (DEPTNO) REFERENCES DEPT(DEPTNO)
  ) `;

const CREATE_CUSTOMER_TABLE_STATEMENT = `CREATE TABLE schema0.customer (
  customer_no int PRIMARY KEY,
  tel VARCHAR(20),
  age integer,
  height NUMERIC,
  weight NUMERIC
)
`;

const CREATE_ORDER_TABLE_STATEMENT = `CREATE TABLE schema0.order1 (
  order_no int PRIMARY KEY ,
  customer_no int,
  order_date DATE,
  amount int,

  FOREIGN KEY (customer_no) REFERENCES  schema0.customer(customer_no)
)
`;

const CREATE_ORDER_DETAIL_TABLE_STATEMENT = `CREATE TABLE schema0.order_detail (
  order_no int,
  detail_no int,
  item_no int,
  amount int,

  PRIMARY KEY(order_no, detail_no),
  FOREIGN KEY (order_no) REFERENCES schema0.order1(order_no)
)
`;
