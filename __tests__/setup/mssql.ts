import { promises as fs } from 'fs';
import * as mssql from 'mssql';
import * as path from 'path';
import { DbResource, fromJson, parseCsvFromFile } from '../../src';

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
    const q = async (sql: string): Promise<mssql.IResult<any>> => {
      console.log('Exec sql: ', sql);
      return await con.request().query(sql);
    };
    const cq = async (sql: string): Promise<number> => {
      console.log('Exec sql: ', sql);
      const r = await con.request().query(sql);
      const c = await r.recordset[0].count;
      console.log('Count: ', c);
      return c;
    };
    const pq = async (
      sql: string,
      binds: any[],
    ): Promise<mssql.IResult<any>> => {
      const req = con.request();
      binds.forEach((it, idx) => req.input(`${idx + 1}`, it));
      return await req.query(sql);
    };

    await q('DROP DATABASE testdb');
    await q('CREATE DATABASE testdb');
    await q('USE testdb');
    await q('DROP LOGIN testuser');
    await q(
      `CREATE LOGIN testuser WITH PASSWORD = 'Pass123zxcv!', DEFAULT_DATABASE = testdb`,
    );
    await q('ALTER LOGIN testuser WITH DEFAULT_DATABASE=testdb');
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

    // const countUser = await cq(
    //   `SELECT COUNT(*) as count
    //   FROM master.sys.server_principals
    //   WHERE default_database_name ='testdb' AND name ='testuser'`,
    // );
    // if (countUser > 0) {
    //   await q(`DROP USER testuser`);
    // }
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
  const q = async (sql: string): Promise<mssql.IResult<any>> => {
    console.log('Exec sql: ', sql);
    return await con.request().query(sql);
  };
  const pq = async (sql: string, binds: any[]): Promise<mssql.IResult<any>> => {
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
      req.input('11', 'No' + i);
      req.input('12', 's2-' + i);
      req.input('13', 's3b-' + i);
      req.input('14', 's3c-' + i);
      req.input('15', Buffer.from('s5')); // BINARY
      req.input('16', Buffer.from('s6')); // VARBINARY

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

      await q('DROP TABLE IF EXISTS iris');
      await q(CREATE_IRIS_TABLE_STATEMENT);

      const irisResult = await parseCsvFromFile(
        path.join(dataFolder, 'iris.csv'),
        {
          columns: true,
          cast: true,
        },
      );
      for (const row of irisResult.rs.rows) {
        const { values } = row;
        const binds = [
          values['sepal.length'],
          values['sepal.width'],
          values['petal.length'],
          values['petal.width'],
          values['variety'],
        ];
        await pq(
          `INSERT INTO iris (sepal_length, sepal_width,petal_length, petal_width,variety)
            VALUES (@1, @2, @3, @4, @5)`,
          binds,
        );
      }

      await q('DROP TABLE IF EXISTS weather');
      await q(CREATE_WEATHER_TABLE_STATEMENT);

      const weatherResult = await parseCsvFromFile(
        path.join(dataFolder, 'weather.csv'),
        {
          columns: true,
          cast: true,
        },
      );
      for (const row of weatherResult.rs.rows) {
        const { values } = row;
        const binds = [
          values['date'],
          values['outlook'],
          values['temperature'],
          values['humidity'],
          values['windy'],
          values['play'] === 'yes',
        ];
        await pq(
          `INSERT INTO weather (create_date,outlook, temperature,humidity, windy,play)
            VALUES (@1, @2, @3, @4, @5, @6)`,
          binds,
        );
      }

      await q('DROP TABLE IF EXISTS city');
      await q(CREATE_CITY_TABLE_STATEMENT);

      await q(`INSERT INTO city VALUES (1,'Kabul','AFG','Kabol',1780000)`);
      await q(`INSERT INTO city VALUES (2,'Qandahar','AFG','Qandahar',237500)`);
      await q(`INSERT INTO city VALUES (3,'Herat','AFG','Herat',186800)`);
      await q(
        `INSERT INTO city VALUES (4,'Mazar-e-Sharif','AFG','Balkh',127800)`,
      );
      await q(
        `INSERT INTO city VALUES (5,'Amsterdam','NLD','Noord-Holland',731200)`,
      );
      await q(
        `INSERT INTO city VALUES (6,'Rotterdam','NLD','Zuid-Holland',593321)`,
      );
      await q(`INSERT INTO city VALUES (7,'Haag','NLD','Zuid-Holland',440900)`);
      await q(`INSERT INTO city VALUES (8,'Utrecht','NLD','Utrecht',234323)`);
      await q(
        `INSERT INTO city VALUES (9,'Eindhoven','NLD','Noord-Brabant',201843)`,
      );
      await q(
        `INSERT INTO city VALUES (10,'Tilburg','NLD','Noord-Brabant',193238)`,
      );
      await q(
        `INSERT INTO city VALUES (11,'Groningen','NLD','Groningen',172701)`,
      );
      await q(
        `INSERT INTO city VALUES (12,'Breda','NLD','Noord-Brabant',160398)`,
      );
      await q(
        `INSERT INTO city VALUES (13,'Apeldoorn','NLD','Gelderland',153491)`,
      );
      await q(
        `INSERT INTO city VALUES (14,'Nijmegen','NLD','Gelderland',152463)`,
      );
      await q(
        `INSERT INTO city VALUES (15,'Enschede','NLD','Overijssel',149544)`,
      );
      await q(
        `INSERT INTO city VALUES (16,'Haarlem','NLD','Noord-Holland',148772)`,
      );
      await q(`INSERT INTO city VALUES (17,'Almere','NLD','Flevoland',142465)`);
      await q(
        `INSERT INTO city VALUES (18,'Arnhem','NLD','Gelderland',138020)`,
      );
      await q(
        `INSERT INTO city VALUES (19,'Zaanstad','NLD','Noord-Holland',135621)`,
      );
      await q(
        `INSERT INTO city VALUES (20,'´s-Hertogenbosch','NLD','Noord-Brabant',129170)`,
      );
      await q(
        `INSERT INTO city VALUES (21,'Amersfoort','NLD','Utrecht',126270)`,
      );
      await q(
        `INSERT INTO city VALUES (22,'Maastricht','NLD','Limburg',122087)`,
      );
      await q(
        `INSERT INTO city VALUES (23,'Dordrecht','NLD','Zuid-Holland',119811)`,
      );
      await q(
        `INSERT INTO city VALUES (24,'Leiden','NLD','Zuid-Holland',117196)`,
      );
      await q(
        `INSERT INTO city VALUES (25,'Haarlemmermeer','NLD','Noord-Holland',110722)`,
      );
      await q(
        `INSERT INTO city VALUES (26,'Zoetermeer','NLD','Zuid-Holland',110214)`,
      );
      await q(`INSERT INTO city VALUES (27,'Emmen','NLD','Drenthe',105853)`);
      await q(
        `INSERT INTO city VALUES (28,'Zwolle','NLD','Overijssel',105819)`,
      );
      await q(`INSERT INTO city VALUES (29,'Ede','NLD','Gelderland',101574)`);
      await q(
        `INSERT INTO city VALUES (30,'Delft','NLD','Zuid-Holland',95268)`,
      );

      await q(`INSERT INTO city VALUES (31,'Heerlen','NLD','Limburg',95052)`);
      await q(
        `INSERT INTO city VALUES (32,'Alkmaar','NLD','Noord-Holland',92713)`,
      );
      await q(`INSERT INTO city VALUES (33,'Willemstad','ANT','Curaçao',2345)`);
      await q(`INSERT INTO city VALUES (34,'Tirana','ALB','Tirana',270000)`);
      await q(`INSERT INTO city VALUES (35,'Alger','DZA','Alger',2168000)`);
      await q(`INSERT INTO city VALUES (36,'Oran','DZA','Oran',609823)`);
      await q(
        `INSERT INTO city VALUES (37,'Constantine','DZA','Constantine',443727)`,
      );
      await q(`INSERT INTO city VALUES (38,'Annaba','DZA','Annaba',222518)`);
      await q(`INSERT INTO city VALUES (39,'Batna','DZA','Batna',183377)`);
      await q(`INSERT INTO city VALUES (40,'Sétif','DZA','Sétif',179055)`);
      await q(
        `INSERT INTO city VALUES (41,'Sidi Bel Abbès','DZA','Sidi Bel Abbès',153106)`,
      );
      await q(`INSERT INTO city VALUES (42,'Skikda','DZA','Skikda',128747)`);
      await q(`INSERT INTO city VALUES (43,'Biskra','DZA','Biskra',128281)`);
      await q(
        `INSERT INTO city VALUES (44,'Blida (el-Boulaida)','DZA','Blida',127284)`,
      );
      await q(`INSERT INTO city VALUES (45,'Béjaïa','DZA','Béjaïa',117162)`);
      await q(
        `INSERT INTO city VALUES (46,'Mostaganem','DZA','Mostaganem',115212)`,
      );
      await q(`INSERT INTO city VALUES (47,'Tébessa','DZA','Tébessa',112007)`);
      await q(
        `INSERT INTO city VALUES (48,'Tlemcen (Tilimsen)','DZA','Tlemcen',110242)`,
      );
      await q(`INSERT INTO city VALUES (49,'Béchar','DZA','Béchar',107311)`);
      await q(`INSERT INTO city VALUES (50,'Tiaret','DZA','Tiaret',100118)`);
      await q(
        `INSERT INTO city VALUES (51,'Ech-Chleff (el-Asnam)','DZA','Chlef',96794)`,
      );
      await q(`INSERT INTO city VALUES (52,'Ghardaïa','DZA','Ghardaïa',89415)`);
      await q(`INSERT INTO city VALUES (53,'Tafuna','ASM','Tutuila',5200)`);
      await q(`INSERT INTO city VALUES (54,'Fagatogo','ASM','Tutuila',2323)`);
      await q(
        `INSERT INTO city VALUES (55,'Andorra la Vella','AND','Andorra la Vella',21189)`,
      );
      await q(`INSERT INTO city VALUES (56,'Luanda','AGO','Luanda',2022000)`);
      await q(`INSERT INTO city VALUES (57,'Huambo','AGO','Huambo',163100)`);
      await q(`INSERT INTO city VALUES (58,'Lobito','AGO','Benguela',130000)`);
      await q(
        `INSERT INTO city VALUES (59,'Benguela','AGO','Benguela',128300)`,
      );
      await q(`INSERT INTO city VALUES (60,'Namibe','AGO','Namibe',118200)`);
      await q(`INSERT INTO city VALUES (61,'South Hill','AIA','–',961)`);
      await q(`INSERT INTO city VALUES (62,'The Valley','AIA','–',595)`);
      await q(
        `INSERT INTO city VALUES (63,'Saint John´s','ATG','St John',24000)`,
      );
      await q(`INSERT INTO city VALUES (64,'Dubai','ARE','Dubai',669181)`);
      await q(
        `INSERT INTO city VALUES (65,'Abu Dhabi','ARE','Abu Dhabi',398695)`,
      );
      await q(`INSERT INTO city VALUES (66,'Sharja','ARE','Sharja',320095)`);
      await q(`INSERT INTO city VALUES (67,'al-Ayn','ARE','Abu Dhabi',225970)`);
      await q(`INSERT INTO city VALUES (68,'Ajman','ARE','Ajman',114395)`);
      await q(
        `INSERT INTO city VALUES (69,'Buenos Aires','ARG','Distrito Federal',2982146)`,
      );
      await q(
        `INSERT INTO city VALUES (70,'La Matanza','ARG','Buenos Aires',1266461)`,
      );
      await q(`INSERT INTO city VALUES (71,'Córdoba','ARG','Córdoba',1157507)`);
      await q(`INSERT INTO city VALUES (72,'Rosario','ARG','Santa Fé',907718)`);
      await q(
        `INSERT INTO city VALUES (73,'Lomas de Zamora','ARG','Buenos Aires',622013)`,
      );
      await q(
        `INSERT INTO city VALUES (74,'Quilmes','ARG','Buenos Aires',559249)`,
      );
      await q(
        `INSERT INTO city VALUES (75,'Almirante Brown','ARG','Buenos Aires',538918)`,
      );
      await q(
        `INSERT INTO city VALUES (76,'La Plata','ARG','Buenos Aires',521936)`,
      );
      await q(
        `INSERT INTO city VALUES (77,'Mar del Plata','ARG','Buenos Aires',512880)`,
      );
      await q(
        `INSERT INTO city VALUES (78,'San Miguel de Tucumán','ARG','Tucumán',470809)`,
      );
      await q(
        `INSERT INTO city VALUES (79,'Lanús','ARG','Buenos Aires',469735)`,
      );
      await q(
        `INSERT INTO city VALUES (80,'Merlo','ARG','Buenos Aires',463846)`,
      );
      await q(
        `INSERT INTO city VALUES (81,'General San Martín','ARG','Buenos Aires',422542)`,
      );
      await q(`INSERT INTO city VALUES (82,'Salta','ARG','Salta',367550)`);
      await q(
        `INSERT INTO city VALUES (83,'Moreno','ARG','Buenos Aires',356993)`,
      );
      await q(
        `INSERT INTO city VALUES (84,'Santa Fé','ARG','Santa Fé',353063)`,
      );
      await q(
        `INSERT INTO city VALUES (85,'Avellaneda','ARG','Buenos Aires',353046)`,
      );
      await q(
        `INSERT INTO city VALUES (86,'Tres de Febrero','ARG','Buenos Aires',352311)`,
      );
      await q(
        `INSERT INTO city VALUES (87,'Morón','ARG','Buenos Aires',349246)`,
      );
      await q(
        `INSERT INTO city VALUES (88,'Florencio Varela','ARG','Buenos Aires',315432)`,
      );
      await q(
        `INSERT INTO city VALUES (89,'San Isidro','ARG','Buenos Aires',306341)`,
      );
      await q(
        `INSERT INTO city VALUES (90,'Tigre','ARG','Buenos Aires',296226)`,
      );
      await q(
        `INSERT INTO city VALUES (91,'Malvinas Argentinas','ARG','Buenos Aires',290335)`,
      );
      await q(
        `INSERT INTO city VALUES (92,'Vicente López','ARG','Buenos Aires',288341)`,
      );
      await q(
        `INSERT INTO city VALUES (93,'Berazategui','ARG','Buenos Aires',276916)`,
      );
      await q(
        `INSERT INTO city VALUES (94,'Corrientes','ARG','Corrientes',258103)`,
      );
      await q(
        `INSERT INTO city VALUES (95,'San Miguel','ARG','Buenos Aires',248700)`,
      );
      await q(
        `INSERT INTO city VALUES (96,'Bahía Blanca','ARG','Buenos Aires',239810)`,
      );
      await q(
        `INSERT INTO city VALUES (97,'Esteban Echeverría','ARG','Buenos Aires',235760)`,
      );
      await q(
        `INSERT INTO city VALUES (98,'Resistencia','ARG','Chaco',229212)`,
      );
      await q(
        `INSERT INTO city VALUES (99,'José C. Paz','ARG','Buenos Aires',221754)`,
      );
      await q(
        `INSERT INTO city VALUES (100,'Paraná','ARG','Entre Rios',207041)`,
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
  d1, d2, d3,
  s1, s2, s3b, s3c, s5, s6,
  g1 )
  VALUES(
    @1, @2, @3, @4,
    @5, @6, @7,
    @8, @9, @10,
    @11, @12, @13, @14, @15, @16,
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

const CREATE_IRIS_TABLE_STATEMENT = `CREATE TABLE iris (
  sepal_length NUMERIC(7,1),
  sepal_width NUMERIC(7,1),
  petal_length NUMERIC(7,1),
  petal_width NUMERIC(7,1),
  variety varchar(255)
)`;

const CREATE_WEATHER_TABLE_STATEMENT = `CREATE TABLE weather (
  create_date DATE,
  outlook text,
  temperature NUMERIC(7,1),
  humidity text,
  windy BIT,
  play BIT
)`;

const CREATE_CITY_TABLE_STATEMENT = `CREATE TABLE city (
  id int PRIMARY KEY,
  name char(35),
  country_code char(3),
  district char(20),
  population int
)`;
