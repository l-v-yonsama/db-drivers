import oracledb from 'oracledb';

const baseConnectOption = {
  user: 'testuser',
  password: 'testpass',
  connectString: 'localhost:6012/FREEPDB1',
};

async function dropIfExists(
  con: oracledb.Connection,
  ddl: 'TABLE',
  name: string,
): Promise<void> {
  try {
    await con.execute(`DROP ${ddl} ${name} PURGE`);
  } catch (e) {
    // ORA-00942: table or view does not exist -- fine, nothing to drop.
    if (!String(e.message).startsWith('ORA-00942')) {
      throw e;
    }
  }
}

async function ensureTestAdmin(): Promise<void> {
  const sysCon = await oracledb.getConnection({
    user: 'system',
    password: 'testpass',
    connectString: 'localhost:6012/FREEPDB1',
  });
  try {
    const existing = await sysCon.execute<{ USERNAME: string }>(
      `SELECT username FROM all_users WHERE username = 'TESTADMIN'`,
    );
    if (!(existing.rows ?? []).length) {
      await sysCon.execute(`CREATE USER testadmin IDENTIFIED BY testpass`);
    }
    // DBA covers CREATE SESSION plus the ALTER SYSTEM privilege
    // kill(sessionOrPid) needs for ALTER SYSTEM KILL SESSION on another
    // session; re-granting an already-held role is a harmless no-op.
    await sysCon.execute(`GRANT DBA TO testadmin`);
  } finally {
    await sysCon.close();
  }
}

async function grantCatalogAccess(): Promise<void> {
  // getLocks()/getSessions() query V$SESSION/V$SQL/V$LOCKED_OBJECT, which a
  // bare APP_USER (as gvenzl/oracle-free creates it) has no privilege to
  // read by default. Grant it once via a SYSTEM connection so the driver's
  // real behavior is exercised, not just its privilege-error path.
  const sysCon = await oracledb.getConnection({
    user: 'system',
    password: 'testpass',
    connectString: 'localhost:6012/FREEPDB1',
  });
  try {
    await sysCon.execute('GRANT SELECT_CATALOG_ROLE TO testuser');
    await sysCon.execute('GRANT SELECT ANY DICTIONARY TO testuser');
  } finally {
    await sysCon.close();
  }
}

export async function init(): Promise<void> {
  await ensureTestAdmin();
  await grantCatalogAccess();

  const con = await oracledb.getConnection(baseConnectOption);

  try {
    await dropIfExists(con, 'TABLE', 'testtable');
    await con.execute(CREATE_TABLE_STATEMENT);
    await con.execute(
      "COMMENT ON TABLE testtable IS 'table with various data types'",
    );

    const dt = new Date(2023, 10, 11, 12, 13, 14, 0);
    for (let i = 1; i <= 20; i++) {
      const binds = [
        i,
        1 + i,
        2 + i + i,
        12.3456,
        i * 1.5,
        dt,
        dt,
        dt,
        'No' + i,
        's2-' + i,
        'clob-' + i,
        JSON.stringify({ kind: 'native', no: i }),
        JSON.stringify({ kind: 'legacy', no: i }),
      ];
      await con.execute(INSERT_STATEMENT, binds, { autoCommit: false });
    }
    await con.commit();

    await dropIfExists(con, 'TABLE', 'lock_test');
    await con.execute(CREATE_LOCK_TEST_TABLE_STATEMENT);
    for (const n of [1, 5, 10]) {
      await con.execute(
        `INSERT INTO lock_test (id,title,n) VALUES(${n}, 'T${n}', ${n * 10})`,
        [],
        { autoCommit: false },
      );
    }
    await con.commit();

    await dropIfExists(con, 'TABLE', 'EMP');
    await dropIfExists(con, 'TABLE', 'DEPT');

    await con.execute(CREATE_TABLE_DEPT);
    await con.execute("COMMENT ON TABLE DEPT IS '部門マスタ'");
    await con.execute("COMMENT ON COLUMN DEPT.LOC IS 'ロケーション'");

    await con.execute(
      `INSERT INTO DEPT VALUES(10, 'ACCOUNTING', 'NEW YORK')`,
      [],
      { autoCommit: false },
    );
    await con.execute(`INSERT INTO DEPT VALUES(20, 'RESEARCH', 'DALLAS')`, [], {
      autoCommit: false,
    });
    await con.execute(`INSERT INTO DEPT VALUES(30, 'SALES', 'CHICAGO')`, [], {
      autoCommit: false,
    });
    await con.commit();

    await con.execute(CREATE_TABLE_EMP);

    const empValues = [
      [7839, 'KING', 'PRESIDENT', null, 5000, 10],
      [7698, 'TARO', 'MANAGER', 7839, 2850, 30],
      [7782, 'POCHI', 'CLERK', 7839, 2450, 10],
      [7566, 'HANAKO', 'MANAGER', 7839, 2975, 20],
      [7788, 'SCOTT', 'ANALYST', null, 3000, 30],
    ];

    for (const ev of empValues) {
      await con.execute(
        `INSERT INTO EMP (EMPNO,ENAME,JOB,MGR,SAL,DEPTNO) VALUES(:1,:2,:3,:4,:5,:6)`,
        ev,
        { autoCommit: false },
      );
    }
    await con.commit();
  } finally {
    if (con) {
      await con.close();
    }
  }
}

const CREATE_TABLE_STATEMENT = `
CREATE TABLE testtable (
  ID NUMBER NOT NULL PRIMARY KEY,
  n1 NUMBER(10),
  n2 NUMBER(19),
  f1 NUMBER(10,4),
  f2 BINARY_DOUBLE,

  d1 DATE,
  d3 TIMESTAMP,
  d4 TIMESTAMP WITH TIME ZONE,

  s1 CHAR(10),
  s2 VARCHAR2(50),
  s3 CLOB,

  -- j1: native JSON type (Oracle 21c+)
  j1 JSON,
  -- j2: pre-21c style JSON storage, still supported today -- a LOB/VARCHAR2
  -- column guarded by an "IS JSON" check constraint (Oracle 12.1.0.2+)
  j2 CLOB CHECK (j2 IS JSON)
)
`;

const INSERT_STATEMENT = `INSERT INTO testtable (
  ID, n1, n2,
  f1, f2,
  d1, d3, d4,
  s1, s2, s3,
  j1, j2)
  VALUES(
    :1, :2, :3,
    :4, :5,
    :6, :7, :8,
    :9, :10, :11,
    :12, :13)`;

const CREATE_TABLE_DEPT = `CREATE TABLE DEPT (
    DEPTNO NUMBER(4) NOT NULL,
    DNAME VARCHAR2(14) DEFAULT NULL,
    LOC VARCHAR2(13) DEFAULT NULL,
    PRIMARY KEY (DEPTNO)
  )`;

const CREATE_TABLE_EMP = `CREATE TABLE EMP (
    EMPNO NUMBER(4) NOT NULL,
    ENAME VARCHAR2(10) DEFAULT NULL,
    JOB VARCHAR2(9) DEFAULT NULL,
    MGR NUMBER(4) DEFAULT NULL,
    SAL NUMBER(7,2) DEFAULT NULL,
    DEPTNO NUMBER(4) DEFAULT NULL,

    PRIMARY KEY (EMPNO),
    FOREIGN KEY (DEPTNO) REFERENCES DEPT(DEPTNO)
  )`;

const CREATE_LOCK_TEST_TABLE_STATEMENT = `CREATE TABLE lock_test (
    id NUMBER NOT NULL PRIMARY KEY,
    title VARCHAR2(255) DEFAULT '' NOT NULL,
    n NUMBER NOT NULL
  )`;
