-- =========================================
-- DB & LOGIN
-- =========================================
USE master;
GO

IF DB_ID('testdb') IS NULL
BEGIN
  CREATE DATABASE testdb;
END
GO

IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'testuser')
BEGIN
  CREATE LOGIN testuser WITH PASSWORD = 'testpass';
END
GO

USE testdb;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'testuser')
BEGIN
  CREATE USER testuser FOR LOGIN testuser;
END
GO

ALTER ROLE db_owner ADD MEMBER testuser;
GO

-- =========================================
-- SCHEMA
-- =========================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'schema0')
  EXEC('CREATE SCHEMA schema0');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'schema1')
  EXEC('CREATE SCHEMA schema1');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'testdb')
  EXEC('CREATE SCHEMA testdb');
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'h1_piyo2')
  EXEC('CREATE SCHEMA h1_piyo2');
GO

-- デフォルトスキーマは testdb
ALTER USER testuser WITH DEFAULT_SCHEMA = testdb;
GO

-- =========================================
-- testtable（schema1固定）
-- =========================================
IF OBJECT_ID('schema1.testtable', 'U') IS NOT NULL
  DROP TABLE schema1.testtable;
GO

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
);
GO

-- テーブルコメント
EXEC sys.sp_addextendedproperty
  @name = N'MS_Description',
  @value = N'table with various data types',
  @level0type = N'SCHEMA', @level0name = N'schema1',
  @level1type = N'TABLE',  @level1name = N'testtable';
GO

-- カラムコメント
EXEC sys.sp_addextendedproperty
  @name = N'MS_Description',
  @value = N'MAX 127',
  @level0type = N'SCHEMA', @level0name = N'schema1',
  @level1type = N'TABLE',  @level1name = N'testtable',
  @level2type = N'COLUMN', @level2name = N'n1';
GO

EXEC sys.sp_addextendedproperty
  @name = N'MS_Description',
  @value = N'ID,pk',
  @level0type = N'SCHEMA', @level0name = N'schema1',
  @level1type = N'TABLE',  @level1name = N'testtable',
  @level2type = N'COLUMN', @level2name = N'ID';
GO

-- データ投入
DECLARE @i INT = 1;
WHILE @i <= 10
BEGIN
  INSERT INTO schema1.testtable VALUES (
    0,1+@i,2+@i+@i*10,3+@i+@i*100,
    12.3456,0.5,0.05,
    GETDATE(),GETDATE(),GETDATE(),
    'No'+CAST(@i AS VARCHAR),
    's2-'+CAST(@i AS VARCHAR),
    's3b-'+CAST(@i AS VARCHAR),
    's3c-'+CAST(@i AS VARCHAR),
    0x01,0x01,
    geometry::STGeomFromText('POINT(135 35)',4326)
  );
  SET @i += 1;
END
GO

-- =========================================
-- lock_test（testdb）
-- =========================================
IF OBJECT_ID('testdb.lock_test','U') IS NOT NULL DROP TABLE testdb.lock_test;
GO

CREATE TABLE testdb.lock_test (
  id int PRIMARY KEY,
  title varchar(255),
  n int
);
GO

INSERT INTO testdb.lock_test VALUES (1,'T1',10),(5,'T5',50),(10,'T10',100);
GO

-- =========================================
-- diff（testdb）
-- =========================================
IF OBJECT_ID('testdb.diff','U') IS NOT NULL DROP TABLE testdb.diff;
GO

CREATE TABLE testdb.diff (
  last_name VARCHAR(128),
  first_name VARCHAR(128),
  full_name VARCHAR(128) UNIQUE,
  note VARCHAR(128),
  birthday DATE,
  PRIMARY KEY(last_name, first_name)
);
GO

DECLARE @d INT = 1;
WHILE @d <= 10
BEGIN
  INSERT INTO testdb.diff VALUES(
    'Uchida'+CAST(@d AS VARCHAR),
    'Takeshi'+CAST(@d AS VARCHAR),
    'Uchida'+CAST(@d AS VARCHAR)+' Takeshi'+CAST(@d AS VARCHAR),
    'note'+CAST(@d AS VARCHAR),
    DATEFROMPARTS(2023,11,@d)
  );
  SET @d += 1;
END
GO

-- =========================================
-- DEPT / EMP（testdb）
-- =========================================
IF OBJECT_ID('testdb.EMP','U') IS NOT NULL DROP TABLE testdb.EMP;
IF OBJECT_ID('testdb.DEPT','U') IS NOT NULL DROP TABLE testdb.DEPT;
GO

CREATE TABLE testdb.DEPT (
  DEPTNO int PRIMARY KEY,
  DNAME varchar(14),
  LOC varchar(13)
);
GO

INSERT INTO testdb.DEPT VALUES
(10,'ACCOUNTING','NEW YORK'),
(20,'RESEARCH','DALLAS'),
(30,'SALES','CHICAGO'),
(40,'OPERATIONS','BOSTON');
GO

CREATE TABLE testdb.EMP (
  EMPNO int PRIMARY KEY,
  ENAME varchar(10),
  SEX int,
  JOB varchar(9),
  MGR int,
  SAL int,
  DEPTNO int
);
GO

INSERT INTO testdb.EMP VALUES
(7839,'KING',0,'PRESIDENT',NULL,5000,10),
(7698,'TARO',1,'MANAGER',7839,2850,30),
(7782,'POCHI',9,'',7839,2450,10),
(7566,'HANAKO',2,'MANAGER',7839,2975,20);
GO

-- =========================================
-- city（testdb）
-- =========================================
IF OBJECT_ID('testdb.city','U') IS NOT NULL DROP TABLE testdb.city;
GO

CREATE TABLE testdb.city (
  id int PRIMARY KEY,
  name char(35),
  country_code char(3),
  district char(20),
  population int
);
GO

INSERT INTO testdb.city VALUES
(1,'Kabul','AFG','Kabol',1780000),
(2,'Qandahar','AFG','Qandahar',237500),
(3,'Herat','AFG','Herat',186800);
GO

-- =========================================
-- Function: addition
-- =========================================
IF OBJECT_ID('schema1.addition', 'FN') IS NOT NULL
  DROP FUNCTION schema1.addition;
GO

CREATE FUNCTION schema1.addition (
  @a INT,
  @b INT
)
RETURNS INT
AS
BEGIN
  RETURN @a + @b;
END;
GO