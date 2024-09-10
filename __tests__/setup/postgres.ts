import { default as pg } from 'pg';

const baseConnectOption = {
  host: '127.0.0.1',
  port: 6002,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
};

export async function init(): Promise<void> {
  const options = Object.assign(
    {
      port: 5432,
      host: '127.0.0.1',
      database: 'postgres',
    },
    {
      max: 1,
      idleTimeoutMillis: 3000,
      connectionTimeoutMillis: 1000,
      ...baseConnectOption,
    },
  );
  const pool = new pg.Pool(options);

  try {
    await pool.query('DROP TABLE IF EXISTS testtable');
    await pool.query('DROP TYPE IF EXISTS mood');
    await pool.query("CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy')");

    await pool.query(CREATE_TABLE_STATEMENT);
    await pool.query(
      "COMMENT ON TABLE testtable IS 'table with various data types'",
    );

    const dt = new Date(2023, 10, 11, 12, 13, 14, 0);
    for (let i = 1; i <= 200; i++) {
      const integers = [0, 1 + i, 2 + i + i, i % 10, 4 + i + i * 100];
      const decimals = [12.3456, 0.5, 0.05];
      const datetimes = [dt, '12:13:14', dt, dt, 2000];
      const strings = [
        'No' + i,
        's2-' + i,
        's3a-' + i,
        'happy',
        Buffer.from('\x00\x01\x02'),
        `6050103d-e0cd-4134-adaa-fe1a9dbd344${i % 10}`,
      ];
      const others = [{ k1: 'v' + i }];
      const binds = [
        ...integers,
        ...decimals,
        ...datetimes,
        ...strings,
        ...others,
      ];

      await pool.query(INSERT_STATEMENT, binds);
    }

    await pool.query('DROP TABLE IF EXISTS lock_test');
    await pool.query(CREATE_LOCK_TEST_TABLE_STATEMENT);
    for (const n of [1, 5, 10]) {
      await pool.query(
        `INSERT INTO lock_test (id,title,n) VALUES(${n}, 'T${n}', ${n * 10})`,
      );
    }

    await pool.query('DROP TABLE IF EXISTS diff');
    await pool.query(CREATE_TABLE_STATEMENT2);
    for (let i = 1; i <= 10; i++) {
      const binds = [
        `Uchida${i}`,
        `Takeshi${i}`,
        `Uchida${i} Takeshi${i}`,
        `note${i}`,
        new Date(2023, 10, i),
      ];
      await pool.query(INSERT_STATEMENT2, binds);
    }
    await pool.query('DROP TABLE IF EXISTS diff2');
    await pool.query(CREATE_DIFF2_TABLE_STATEMENT);

    await pool.query('DROP TABLE IF EXISTS DEPT CASCADE');
    await pool.query(CREATE_TABLE_DEPT);

    await pool.query(`INSERT INTO DEPT VALUES(10, 'ACCOUNTING', 'NEW YORK')`);
    await pool.query(`INSERT INTO DEPT VALUES(20, 'RESEARCH', 'DALLAS')`);
    await pool.query(`INSERT INTO DEPT VALUES(30, 'SALES', 'CHICAGO')`);
    await pool.query(`INSERT INTO DEPT VALUES(40, 'OPERATIONS', 'BOSTON')`);

    await pool.query('DROP TABLE IF EXISTS EMP CASCADE');
    await pool.query(CREATE_TABLE_EMP);

    const empValues = [
      [7839, 'KING', 0, 'PRESIDENT', null, 5000, 10],
      [7698, 'TARO', 1, 'MANAGER', 7839, 2850, 30],
      [7782, 'POCHI', 9, '', 7839, 2450, 10],
      [7566, 'HANAKO', 2, 'MANAGER', 7839, 2975, 20],
      [7788, 'SCOTT', 1, 'ANALYST', null, 3000, 30],
      [8000, 'TANUKICHI', 6, 'MANAGER', null, 2975, 20],
    ];

    for (const ev of empValues) {
      await pool.query(
        `INSERT INTO EMP 
      (EMPNO,ENAME,SEX,JOB,MGR,SAL, DEPTNO) 
      VALUES($1,$2,$3,$4,$5,$6,$7)`,
        ev,
      );
    }

    await pool.query('DROP TABLE IF EXISTS order_detail');
    await pool.query('DROP TABLE IF EXISTS order1');
    await pool.query('DROP TABLE IF EXISTS customer');

    await pool.query('DROP TYPE IF EXISTS clothesSize');
    await pool.query(
      `CREATE TYPE clothesSize AS ENUM ('S', 'M', 'L', 'KID''s')`,
    );

    await pool.query(CREATE_CUSTOMER_TABLE_STATEMENT);

    const customerValues = [
      [7839, '0120-99-7000', 40, 172, 55, 'L'],
      [7698, '0120-88-6000', 30, 152, 60, 'L'],
      [7782, '0120-00-1234', 20, 145, 100, 'S'],
      [7566, '0120-88-3321', 10, 100, 20, "KID's"],
      [7788, null, 5, 72, 10, 'S'],
    ];

    await pool.query(CREATE_ORDER_TABLE_STATEMENT);
    await pool.query(CREATE_ORDER_DETAIL_TABLE_STATEMENT);

    for (let i = 0; i < customerValues.length; i++) {
      const no = i + 1;
      await pool.query(
        `INSERT INTO  customer (customer_no, tel, age, height,weight, clothes_size)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        customerValues[i],
      );
      const customerNo = customerValues[i][0];

      const binds2 = [no, customerNo, dt, no * 100];
      await pool.query(
        `INSERT INTO order1 (order_no, customer_no, order_date, amount) 
          VALUES ($1, $2, $3, $4)`,
        binds2,
      );

      const binds3 = [no, no, no * 10, no * 100];
      await pool.query(
        `INSERT INTO order_detail (order_no, detail_no, item_no, amount) 
          VALUES ($1, $2, $3, $4)`,
        binds3,
      );
    }
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

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

)
`;

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
  id SERIAL NOT NULL PRIMARY KEY,
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) ,
  note VARCHAR(128),
  birthday DATE,
  UNIQUE (last_name, first_name)

)
`;

const INSERT_STATEMENT = `INSERT INTO testtable (
  n0, n1, n2, n3, n4,
  f1, f2, f3,
  d1, d2, d3, d4, d5,
  s1, s2, s3, s4, s5, s6,
  j1)
  VALUES(
    $1, $2, $3, $4, $5 ,
    $6, $7, $8,
    $9, $10, $11, $12, $13,
    $14, $15, $16, $17, $18, $19,
    $20)`;

const INSERT_STATEMENT2 = `INSERT INTO diff (
  last_name, first_name, full_name, note, birthday )
  VALUES($1, $2, $3, $4, $5)`;

const CREATE_CUSTOMER_TABLE_STATEMENT = `CREATE TABLE customer (
    customer_no SERIAL NOT NULL PRIMARY KEY,
    tel VARCHAR(20),
    age integer,
    height NUMERIC,
    weight NUMERIC,
    clothes_size clothesSize
  )
  `;

const CREATE_ORDER_TABLE_STATEMENT = `CREATE TABLE  order1 (
    order_no SERIAL NOT NULL PRIMARY KEY ,
    customer_no int,
    order_date DATE,
    amount int,
  
    FOREIGN KEY (customer_no) REFERENCES  customer(customer_no)
  )
  `;

const CREATE_ORDER_DETAIL_TABLE_STATEMENT = `CREATE TABLE order_detail (
    order_no int,
    detail_no int,
    item_no int,
    amount int,
  
    PRIMARY KEY(order_no, detail_no),
    FOREIGN KEY (order_no) REFERENCES order1(order_no)
  )
  `;

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

const CREATE_LOCK_TEST_TABLE_STATEMENT = `CREATE TABLE lock_test (
    id SERIAL NOT NULL PRIMARY KEY,
    title varchar(255) NOT NULL DEFAULT '',
    n int NOT NULL
  )
  `;
