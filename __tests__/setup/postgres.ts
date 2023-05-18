import { default as pg } from 'pg';
import * as crypto from 'crypto';

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
    const now = new Date();
    for (let i = 1; i <= 200; i++) {
      const integers = [0, 1 + i, 2 + i + i, i % 10, 4 + i + i * 100];
      const decimals = [12.3456 + (i % 50), 0.1 + i, 0.05 + i];
      const datetimes = [now, '10:00:12', now, now, 2000];
      const strings = [
        'No' + i,
        's2-' + i,
        's3a-' + i,
        'happy',
        Buffer.from('\x00\x01\x02'),
        crypto.randomUUID(),
      ];
      const others = [{ k1: 'v1' }];
      const binds = [
        ...integers,
        ...decimals,
        ...datetimes,
        ...strings,
        ...others,
      ];

      await pool.query(INSERT_STATEMENT, binds);
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
