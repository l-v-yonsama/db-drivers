import * as path from 'path';
import { DBType, SQLiteDriver } from '../../src';

const databaseFile = path.join('__tests__', 'data', 'sqlite.db');

export async function init(): Promise<void> {
  const driver = new SQLiteDriver({
    database: databaseFile,
    dbType: DBType.SQLite,
    name: 'sqlite',
  });
  await driver.connect();

  try {
    for (const c of [1, 2, 3]) {
      for (const d of [1, 2]) {
        const tableName = `c${c}_d${d}_ftT_e${d}_f${c}`;
        await driver.requestSql({ sql: `DROP TABLE IF EXISTS ${tableName}` });
        await driver.requestSql({
          sql: `CREATE TABLE ${tableName} (ID INTEGER PRIMARY KEY)`,
        });
      }
    }

    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS testtable' });
    await driver.requestSql({ sql: CREATE_TABLE_STATEMENT });

    const dt = new Date(2023, 10, 11, 12, 13, 14, 0);
    for (let i = 1; i <= 10; i++) {
      const binds = [
        (12.3456 + i).toString(),
        'No' + i,
        new Date().toISOString(),
        new Date().toISOString(),
        Buffer.from([0x0, 0x1, 0x2, 0xf0]),
      ];
      await driver.requestSql({
        sql: INSERT_STATEMENT,
        conditions: { binds: binds as any },
      });
    }

    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS diff' });
    await driver.requestSql({ sql: CREATE_TABLE_STATEMENT2 });
    for (let i = 1; i <= 10; i++) {
      const binds = [
        `Uchida${i}`,
        `Takeshi${i}`,
        `Uchida${i} Takeshi${i}`,
        `note${i}`,
        new Date(2023, 10, i).toISOString(),
      ];
      await driver.requestSql({
        sql: INSERT_STATEMENT2,
        conditions: { binds },
      });
    }

    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS diff2' });
    await driver.requestSql({ sql: CREATE_DIFF2_TABLE_STATEMENT });

    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS  DEPT' });
    await driver.requestSql({ sql: CREATE_TABLE_ORA_DEPT });
    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS EMP' });
    await driver.requestSql({ sql: CREATE_TABLE_ORA_EMP });

    await driver.requestSql({
      sql: `INSERT INTO  DEPT VALUES(10, 'ACCOUNTING', 'NEW YORK')`,
    });
    await driver.requestSql({
      sql: `INSERT INTO DEPT VALUES(20, 'RESEARCH', 'DALLAS')`,
    });
    await driver.requestSql({
      sql: `INSERT INTO DEPT VALUES(30, 'SALES', 'CHICAGO')`,
    });
    await driver.requestSql({
      sql: `INSERT INTO DEPT VALUES(40, 'OPERATIONS', 'BOSTON')`,
    });

    const empValues = [
      [7839, 'KING', 0, 'PRESIDENT', null, 5000, 10],
      [7698, 'TARO', 1, 'MANAGER', 7839, 2850, 30],
      [7782, 'POCHI', 9, '', 7839, 2450, 10],
      [7566, 'HANAKO', 2, 'MANAGER', 7839, 2975, 20],
      [7788, 'SCOTT', 1, 'ANALYST', null, 3000, 30],
      [8000, 'TANUKICHI', 6, 'MANAGER', null, 2975, 20],
    ];

    for (const ev of empValues) {
      await driver.requestSql({
        sql: `INSERT INTO EMP 
      (EMPNO,ENAME,SEX,JOB,MGR,SAL, DEPTNO) 
      VALUES(?,?,?,?,?,?,?)`,
        conditions: { binds: ev as any },
      });
    }

    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS order_detail' });
    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS order0' });
    await driver.requestSql({ sql: 'DROP TABLE IF EXISTS customer' });
    await driver.requestSql({ sql: CREATE_CUSTOMER_TABLE_STATEMENT });
    await driver.requestSql({ sql: CREATE_ORDER_TABLE_STATEMENT });
    await driver.requestSql({ sql: CREATE_ORDER_DETAIL_TABLE_STATEMENT });
    for (let i = 1; i <= 10; i++) {
      const binds = [i, `0120-11-121${i % 10}`];
      await driver.requestSql({
        sql: `INSERT INTO customer (customer_no, tel) VALUES (?, ?)`,
        conditions: { binds: binds as any },
      });

      const binds2 = [i, i, dt.toISOString(), i * 100];
      await driver.requestSql({
        sql: `INSERT INTO order0 (order_no0, customer_no, order_date, amount) 
          VALUES (?, ?, ?, ?)`,
        conditions: { binds: binds2 as any },
      });

      const binds3 = [i, i, i * 10, i * 100];
      await driver.requestSql({
        sql: `INSERT INTO order_detail (order_no, detail_no, item_no, amount) 
          VALUES (?, ?, ?, ?)`,
        conditions: { binds: binds3 as any },
      });
    }
  } finally {
    await driver.disconnect();
  }
}

const CREATE_TABLE_STATEMENT = `

CREATE TABLE testtable (
  ID INTEGER PRIMARY KEY AUTOINCREMENT, 
  f1 REAL ,
  s1 TEXT NOT NULL,
  d1 DATE,
  d2 DATETIME,
  b1 BLOB
)
`;

const CREATE_TABLE_STATEMENT2 = `
CREATE TABLE diff (
  last_name TEXT,
  first_name TEXT,
  full_name TEXT unique,
  note TEXT,
  birthday DATE,
  PRIMARY KEY(last_name, first_name)

)
`;

const CREATE_DIFF2_TABLE_STATEMENT = `
CREATE TABLE diff2 (
  id INTEGER,
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) ,
  note VARCHAR(128),
  birthday DATE,
  PRIMARY KEY (id, note),
  UNIQUE (last_name, first_name, note)

)
`;

const CREATE_TABLE_ORA_DEPT = `CREATE TABLE DEPT (
  DEPTNO integer NOT NULL ,
  DNAME TEXT default NULL ,
  LOC TEXT default NULL ,
  PRIMARY KEY  (DEPTNO)
) `;

const CREATE_TABLE_ORA_EMP = `CREATE TABLE EMP (
  EMPNO INTEGER NOT NULL,
  ENAME TEXT default NULL,
  SEX tinyint NOT NULL default 0,
  JOB TEXT default NULL,
  MGR INTEGER default NULL,
  HIREDATE date default NULL,
  SAL REAL default NULL,
  COMM REAL default NULL,
  DEPTNO INTEGER default NULL,
  PRIMARY KEY  (EMPNO)
) `;

const INSERT_STATEMENT = `INSERT INTO testtable ( f1, s1, d1, d2, b1 ) VALUES(?, ?, ?, ?, ?)`;

const INSERT_STATEMENT2 = `INSERT INTO diff (
  last_name, first_name, full_name, note, birthday )
  VALUES(?, ?, ?, ?, ?)`;

const CREATE_CUSTOMER_TABLE_STATEMENT = `CREATE TABLE customer (
  customer_no INTEGER PRIMARY KEY AUTOINCREMENT ,
  tel TEXT 
)
`;

const CREATE_ORDER_TABLE_STATEMENT = `CREATE TABLE order0 (
  order_no0 INTEGER PRIMARY KEY AUTOINCREMENT ,
  customer_no INTEGER ,
  order_date TEXT ,
  amount INTEGER ,

  FOREIGN KEY (customer_no) REFERENCES customer(customer_no)
)
`;

const CREATE_ORDER_DETAIL_TABLE_STATEMENT = `CREATE TABLE order_detail (
  order_no INTEGER ,
  detail_no INTEGER ,
  item_no INTEGER ,
  amount INTEGER ,

  PRIMARY KEY(order_no, detail_no),
  FOREIGN KEY (order_no) REFERENCES order0(order_no0)
)
`;
