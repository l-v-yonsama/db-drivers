import { config as MssqlConfig, connect, ConnectionPool } from 'mssql';

const host = '127.0.0.1';
const port = 6433;
const saPassword = 'Pass123zxcv!';

function connectOptions(database: string): MssqlConfig {
  return {
    server: host,
    port,
    user: 'sa',
    password: saPassword,
    database,
    options: {
      encrypt: false,
      trustServerCertificate: false,
    },
  };
}

async function withPool<T>(
  database: string,
  fn: (pool: ConnectionPool) => Promise<T>,
): Promise<T> {
  const pool = await connect(connectOptions(database));
  try {
    return await fn(pool);
  } finally {
    await pool.close();
  }
}

/** `sa`-only DDL (CREATE LOGIN/DATABASE) has no automatic bootstrap on this image (unlike postgres/mysql's env-var-driven app user, or oracle's APP_USER), so it has to be provisioned here instead of relying on the container to have done it. */
async function ensureLoginAndDatabase(): Promise<void> {
  await withPool('master', async (pool) => {
    await pool.request().query(`
      IF DB_ID('testdb') IS NULL
      BEGIN
        CREATE DATABASE testdb;
      END
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'testuser')
      BEGIN
        CREATE LOGIN testuser WITH PASSWORD = '${saPassword}';
      END
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'testadmin')
      BEGIN
        CREATE LOGIN testadmin WITH PASSWORD = '${saPassword}';
      END
    `);
    // sysadmin membership is what lets KILL target a session other than its own (plain ALTER ANY CONNECTION would suffice too, but sysadmin is the direct SQL Server equivalent of "DBA").
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT 1
        FROM sys.server_role_members rm
        JOIN sys.server_principals r ON rm.role_principal_id = r.principal_id
        JOIN sys.server_principals m ON rm.member_principal_id = m.principal_id
        WHERE r.name = 'sysadmin' AND m.name = 'testadmin'
      )
      BEGIN
        ALTER SERVER ROLE sysadmin ADD MEMBER testadmin;
      END
    `);
  });
}

async function ensureUserAndSchemas(): Promise<void> {
  await withPool('testdb', async (pool) => {
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'testuser')
      BEGIN
        CREATE USER testuser FOR LOGIN testuser;
      END
    `);
    await pool.request().query(`ALTER ROLE db_owner ADD MEMBER testuser`);

    for (const schema of ['schema0', 'schema1', 'testdb', 'h1_piyo2']) {
      // CREATE SCHEMA must be the only statement in its batch, so it's routed through EXEC() rather than sent as a plain statement.
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = '${schema}')
          EXEC('CREATE SCHEMA ${schema}');
      `);
    }

    await pool
      .request()
      .query(`ALTER USER testuser WITH DEFAULT_SCHEMA = testdb`);
  });
}

export async function init(): Promise<void> {
  await ensureLoginAndDatabase();
  await ensureUserAndSchemas();

  await withPool('testdb', async (pool) => {
    const q = (sql: string): Promise<unknown> => pool.request().query(sql);

    await q(`DROP TABLE IF EXISTS schema1.testtable`);
    await q(CREATE_TESTTABLE_STATEMENT);
    await q(`
      EXEC sys.sp_addextendedproperty
        @name = N'MS_Description',
        @value = N'table with various data types',
        @level0type = N'SCHEMA', @level0name = N'schema1',
        @level1type = N'TABLE',  @level1name = N'testtable'
    `);
    await q(`
      EXEC sys.sp_addextendedproperty
        @name = N'MS_Description',
        @value = N'MAX 127',
        @level0type = N'SCHEMA', @level0name = N'schema1',
        @level1type = N'TABLE',  @level1name = N'testtable',
        @level2type = N'COLUMN', @level2name = N'n1'
    `);
    await q(`
      EXEC sys.sp_addextendedproperty
        @name = N'MS_Description',
        @value = N'ID,pk',
        @level0type = N'SCHEMA', @level0name = N'schema1',
        @level1type = N'TABLE',  @level1name = N'testtable',
        @level2type = N'COLUMN', @level2name = N'ID'
    `);

    for (let i = 1; i <= 10; i++) {
      await q(`
        INSERT INTO schema1.testtable VALUES (
          0, ${1 + i}, ${2 + i + i * 10}, ${3 + i + i * 100},
          12.3456, 0.5, 0.05,
          GETDATE(), GETDATE(), GETDATE(),
          'No${i}',
          's2-${i}',
          's3b-${i}',
          's3c-${i}',
          0x01, 0x01,
          geometry::STGeomFromText('POINT(135 35)', 4326)
        )
      `);
    }

    await q(`DROP TABLE IF EXISTS testdb.lock_test`);
    await q(`
      CREATE TABLE testdb.lock_test (
        id int PRIMARY KEY,
        title varchar(255),
        n int
      )
    `);
    await q(
      `INSERT INTO testdb.lock_test VALUES (1,'T1',10),(5,'T5',50),(10,'T10',100)`,
    );

    await q(`DROP TABLE IF EXISTS testdb.diff`);
    await q(CREATE_DIFF_TABLE_STATEMENT);
    for (let d = 1; d <= 10; d++) {
      await q(`
        INSERT INTO testdb.diff VALUES(
          'Uchida${d}',
          'Takeshi${d}',
          'Uchida${d} Takeshi${d}',
          'note${d}',
          DATEFROMPARTS(2023,11,${d})
        )
      `);
    }

    await q(`DROP TABLE IF EXISTS testdb.EMP`);
    await q(`DROP TABLE IF EXISTS testdb.DEPT`);
    await q(CREATE_DEPT_TABLE_STATEMENT);
    await q(`
      INSERT INTO testdb.DEPT VALUES
      (10,'ACCOUNTING','NEW YORK'),
      (20,'RESEARCH','DALLAS'),
      (30,'SALES','CHICAGO'),
      (40,'OPERATIONS','BOSTON')
    `);
    await q(CREATE_EMP_TABLE_STATEMENT);
    await q(`
      INSERT INTO testdb.EMP VALUES
      (7839,'KING',0,'PRESIDENT',NULL,5000,10),
      (7698,'TARO',1,'MANAGER',7839,2850,30),
      (7782,'POCHI',9,'',7839,2450,10),
      (7566,'HANAKO',2,'MANAGER',7839,2975,20)
    `);

    await q(`DROP TABLE IF EXISTS testdb.city`);
    await q(CREATE_CITY_TABLE_STATEMENT);
    await q(`
      INSERT INTO testdb.city VALUES
      (1,'Kabul','AFG','Kabol',1780000),
      (2,'Qandahar','AFG','Qandahar',237500),
      (3,'Herat','AFG','Herat',186800)
    `);

    await q(`
      IF OBJECT_ID('schema1.addition', 'FN') IS NOT NULL
        DROP FUNCTION schema1.addition
    `);
    await q(`
      CREATE FUNCTION schema1.addition (
        @a INT,
        @b INT
      )
      RETURNS INT
      AS
      BEGIN
        RETURN @a + @b;
      END
    `);

    // performance-tuning-context fixture (composite/unique/filtered indexes, a CHECK constraint, 50 rows + UPDATE STATISTICS WITH FULLSCAN) - kept independent of the tables above, same rationale as Postgres/MySQL's own perf_orders fixtures in __tests__/setup/postgres.ts / mysql.ts.
    await q(`DROP TABLE IF EXISTS testdb.perf_orders`);
    await q(CREATE_PERF_ORDERS_TABLE_STATEMENT);
    await q(`CREATE INDEX idx_perf_orders_status ON testdb.perf_orders(status)`);
    await q(
      `CREATE INDEX idx_perf_orders_customer_status ON testdb.perf_orders(customer_id, status)`,
    );
    await q(
      `CREATE UNIQUE INDEX uq_perf_orders_id_status ON testdb.perf_orders(id, status)`,
    );
    await q(
      `CREATE INDEX idx_perf_orders_status_filtered ON testdb.perf_orders(status) WHERE status = 'shipped'`,
    );
    for (let i = 0; i < 50; i++) {
      const status = i % 5 === 0 ? 'shipped' : 'new';
      await q(
        `INSERT INTO testdb.perf_orders(customer_id, status, amount) VALUES (${(i % 10) + 1}, '${status}', ${i * 1.5})`,
      );
    }
    await q(`UPDATE STATISTICS testdb.perf_orders WITH FULLSCAN`);
  });
}

const CREATE_TESTTABLE_STATEMENT = `
CREATE TABLE schema1.testtable (
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
  s1 CHAR(10),
  s2 VARCHAR(10),
  s3b TEXT,
  s3c NTEXT,
  s5 BINARY(10),
  s6 VARBINARY(10),
  g1 geometry
)
`;

const CREATE_DIFF_TABLE_STATEMENT = `
CREATE TABLE testdb.diff (
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) UNIQUE,
  note VARCHAR(128),
  birthday DATE,
  PRIMARY KEY(last_name, first_name)
)
`;

const CREATE_DEPT_TABLE_STATEMENT = `
CREATE TABLE testdb.DEPT (
  DEPTNO int PRIMARY KEY,
  DNAME varchar(14),
  LOC varchar(13)
)
`;

const CREATE_EMP_TABLE_STATEMENT = `
CREATE TABLE testdb.EMP (
  EMPNO int PRIMARY KEY,
  ENAME varchar(10),
  SEX int,
  JOB varchar(9),
  MGR int,
  SAL int,
  DEPTNO int
)
`;

const CREATE_CITY_TABLE_STATEMENT = `
CREATE TABLE testdb.city (
  id int PRIMARY KEY,
  name char(35),
  country_code char(3),
  district char(20),
  population int
)
`;

const CREATE_PERF_ORDERS_TABLE_STATEMENT = `
CREATE TABLE testdb.perf_orders (
  id INT IDENTITY PRIMARY KEY,
  customer_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  amount DECIMAL(10,2) CHECK (amount >= 0)
)
`;
