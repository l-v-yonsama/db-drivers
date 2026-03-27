import { promises as fs } from 'fs';
import * as path from 'path';

import {
  LOG_EVENT_SPLIT_PRESETS,
  LogParser,
  SQL_LOG_PARSE_PRESETS,
} from '../../src';

const dataFolder = path.join('__tests__', 'data');

const RESET_EXTRACTED_SQL_RESULT = true;

const readFile = async (fileName: string): Promise<string> => {
  return await fs.readFile(path.join(dataFolder, 'logs', 'parse', fileName), {
    encoding: 'utf-8',
  });
};

const writeJSONFile = async (fileName: string, data: string): Promise<void> => {
  await fs.writeFile(path.join(dataFolder, 'logs', 'parse', fileName), data, {
    encoding: 'utf-8',
  });
};

describe('LogParser.parse (SQL execution extraction)', () => {
  describe('Hibernate preset', () => {
    it('should parse Hibernate SQL execution logs correctly', async () => {
      const logText = await readFile('Hibernate.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['Hibernate'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Hibernate.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(73);
      expect(result.logEvents[25]).toEqual({
        lineNo: 33,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'DEBUG',
        fields: {
          pid: expect.any(String),
        },
        thread: 'main',
        logger: 'org.hibernate.SQL',
        message:
          'insert \n    into\n        users\n        (age, name, id) \n    values\n        (?, ?, default)',
        eventType: 'SQL_START',
      });
      expect(result.sqlExecutions.length).toBe(7);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 15,
        endLine: 15,
        framework: 'Hibernate',
        timestamp: expect.any(String),
        thread: 'main',
        sql: 'drop table if exists users cascade ',
        formattedSql: 'DROP TABLE IF EXISTS users CASCADE',
        type: 'drop table',
      });
    });
    it('should parse Hibernate SQL execution logs with mapper context correctly', async () => {
      const logText = await readFile('Hibernate2.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['Hibernate'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
        withSqlFragments: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Hibernate2.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(36);
      expect(result.logEvents[2]).toEqual({
        lineNo: 5,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'WARN',
        fields: {
          pid: expect.any(String),
        },
        thread: 'main',
        logger: 'o.h.engine.jdbc.spi.SqlExceptionHelper',
        message: 'SQL Error: 42000, SQLState: 42000',
        eventType: 'SQL_ERROR',
      });

      expect(result.sqlExecutions.length).toBe(7);
      expect(result.sqlExecutions[1]).toEqual({
        startLine: 5,
        endLine: 6,
        timestamp: expect.any(String),
        thread: 'main',
        sql: '',
        formattedSql: '',
        framework: 'Hibernate',
        error: 'SQL Error: 42000, SQLState: 42000',
        type: 'error',
        errorDetail: expect.any(String),
      });
    });
  });

  describe('Doma preset', () => {
    it('should parse Doma SQL execution logs correctly', async () => {
      const logText = await readFile('Doma.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['Doma'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Doma.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(25);
      expect(result.logEvents[2]).toEqual({
        lineNo: 3,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'INFO',
        fields: {
          pid: expect.any(String),
        },
        thread: 'main',
        logger: 'o.s.doma.jdbc.UtilLoggingJdbcLogger',
        message:
          '[DOMA2220] ENTER  : CLASS=com.example.demo.UserDaoImpl, METHOD=insert',
        eventType: 'TX_METHOD_ENTER',
        eventContext: {
          daoClass: 'com.example.demo.UserDaoImpl,',
          daoMethod: 'insert',
        },
      });
      expect(result.sqlExecutions.length).toBe(7);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 4,
        endLine: 4,
        framework: 'Doma',
        timestamp: expect.any(String),
        thread: 'main',
        sql: "insert into users (name) values ('CommitUser')",
        formattedSql: "INSERT INTO\n  users (name)\nVALUES\n  ('CommitUser')",
        table: 'users',
        type: 'insert',
        daoClass: 'com.example.demo.UserDaoImpl,',
        daoMethod: 'insert',
      });
    });
    it('should parse alternative Doma log format correctly', async () => {
      const logText = await readFile('Doma2.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['Doma'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Doma2.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(37);
      expect(result.logEvents[5]).toEqual({
        lineNo: 6,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'INFO',
        fields: {
          pid: expect.any(String),
        },
        thread: 'main',
        logger: 'o.s.doma.jdbc.UtilLoggingJdbcLogger',
        message:
          '[DOMA2220] ENTER  : CLASS=com.example.demo.UserDaoImpl, METHOD=insert',
        eventType: 'TX_METHOD_ENTER',
        eventContext: {
          daoClass: 'com.example.demo.UserDaoImpl,',
          daoMethod: 'insert',
        },
      });
      expect(result.sqlExecutions.length).toBe(7);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 7,
        endLine: 7,
        framework: 'Doma',
        timestamp: expect.any(String),
        thread: 'main',
        sql: "insert into users (name) values ('CommitUser')",
        formattedSql: "INSERT INTO\n  users (name)\nVALUES\n  ('CommitUser')",
        table: 'users',
        type: 'insert',
        daoClass: 'com.example.demo.UserDaoImpl,',
        daoMethod: 'insert',
      });
    });
    it('should parse alternative Doma ERROR log format correctly', async () => {
      const logText = await readFile('Doma3.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['Doma'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
        withSqlFragments: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Doma3.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(29);
      expect(result.logEvents[3]).toEqual({
        lineNo: 4,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'INFO',
        fields: {
          pid: expect.any(String),
        },
        thread: 'main',
        logger: 'o.s.doma.jdbc.UtilLoggingJdbcLogger',
        message:
          '[DOMA2222] THROW  : CLASS=com.example.demo.UserDaoImpl, METHOD=selectSyntaxError, EXCEPTION=org.seasar.doma.jdbc.JdbcException',
        eventType: 'SQL_ERROR',
        transformed: 'org.seasar.doma.jdbc.JdbcException',
      });
      expect(result.sqlExecutions.length).toBe(5);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 4,
        endLine: 5,
        timestamp: expect.any(String),
        thread: 'main',
        sql: '',
        formattedSql: '',
        framework: 'Doma',
        daoClass: 'com.example.demo.UserDaoImpl,',
        daoMethod: 'selectSyntaxError',
        error: 'org.seasar.doma.jdbc.JdbcException',
        type: 'error',
        errorDetail: expect.any(String),
      });
    });
  });
  describe('MyBatis preset', () => {
    it('should parse MyBatis SQL execution logs correctly', async () => {
      const logText = await readFile('MyBatis.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['MyBatis'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`MyBatis.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(47);
      expect(result.sqlExecutions.length).toBe(7);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 6,
        endLine: 8,
        framework: 'MyBatis',
        timestamp: '2026-03-13T11:20:54.404+09:00',
        thread: 'main',
        sql: 'insert into users(name) values(?)',
        params: 'MyBatisCommitUser(String)',
        result: '1',
        formattedSql:
          "INSERT INTO\n  users (name)\nVALUES\n  ('MyBatisCommitUser')",
        table: 'users',
        type: 'insert',
        daoClass: 'o.s.t.i',
        daoMethod: 'TransactionInterceptor',
      });
    });
    it('should parse alternative MyBatis log format correctly', async () => {
      const logText = await readFile('MyBatis2.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['MyBatis'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`MyBatis2.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(50);

      expect(result.sqlExecutions.length).toBe(6);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 6,
        endLine: 8,
        framework: 'MyBatis',
        timestamp: '2026-03-13T16:36:42.174+09:00',
        thread: 'main',
        sql: 'insert into users(name) values(?)',
        params: 'MyBatisCommitUser(String)',
        result: '1',
        formattedSql:
          "INSERT INTO\n  users (name)\nVALUES\n  ('MyBatisCommitUser')",
        table: 'users',
        type: 'insert',
        daoClass: 'o.s.jdbc.datasource',
        daoMethod: 'DataSourceUtils',
      });
    });

    it('should parse MyBatis SQL execution logs with mapper context correctly', async () => {
      const logText = await readFile('MyBatis3.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['MyBatis'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
        withSqlFragments: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`MyBatis3.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(115);
      expect(result.logEvents[5]).toEqual({
        lineNo: 6,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'DEBUG',
        fields: {
          pid: expect.any(String),
        },
        thread: 'main',
        logger: 'c.example.demo.MyBatisUserMapper.insert',
        message: '==>  Preparing: insert into users(name) values(?)',
        eventType: 'SQL_START',
        transformed: 'insert into users(name) values(?)',
        eventContext: {
          daoClass: 'c.example.demo.MyBatisUserMapper',
          daoMethod: 'insert',
        },
      });

      expect(result.sqlExecutions.length).toBe(13);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 6,
        endLine: 8,
        framework: 'MyBatis',
        timestamp: expect.any(String),
        thread: 'main',
        sql: 'insert into users(name) values(?)',
        params: 'MyBatisCommitUser(String)',
        result: '1',
        formattedSql:
          "INSERT INTO\n  users (name)\nVALUES\n  ('MyBatisCommitUser')",
        table: 'users',
        type: 'insert',
        daoClass: 'c.example.demo.MyBatisUserMapper',
        daoMethod: 'insert',
      });
    });

    it('should parse MyBatis SQL execution Error logs correctly', async () => {
      const logText = await readFile('MyBatis4.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['MyBatis'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
        withSqlFragments: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`MyBatis4.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(42);

      expect(result.sqlExecutions.length).toBe(6);
      expect(result.sqlExecutions[1]).toEqual({
        startLine: 12,
        endLine: 12,
        timestamp: expect.any(String),
        thread: 'main',
        sql: '',
        formattedSql: '',
        framework: 'MyBatis',
        daoClass: 'c.e.d.M',
        daoMethod: 'selectSyntaxError',
        error: expect.any(String),
        type: 'error',
      });
    });
  });
  describe('SpringJdbc preset', () => {
    it('should parse Spring JDBC SQL execution logs correctly', async () => {
      const logText = await readFile('SpringJdbc.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['SpringJdbc'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`SpringJdbc.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(45);
      expect(result.logEvents[1]).toEqual({
        lineNo: 2,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'DEBUG',
        fields: {
          pid: expect.any(String),
        },
        thread: 'main',
        logger: 'o.s.orm.jpa.JpaTransactionManager',
        message:
          'Creating new transaction with name [com.example.demo.SpringJdbcService.commitTransactionTest]: PROPAGATION_REQUIRED,ISOLATION_DEFAULT',
        eventType: 'TX_BEGIN',
      });
      expect(result.sqlExecutions.length).toBe(6);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 7,
        endLine: 9,
        framework: 'SpringJdbc',
        timestamp: expect.any(String),
        thread: 'main',
        sql: 'insert into users(name, age) values(?, ?)',
        params:
          'column index 1, parameter value [JdbcCommitUser], value class [java.lang.String], SQL type unknown,column index 2, parameter value [20], value class [java.lang.Integer], SQL type unknown',
        formattedSql:
          "INSERT INTO\n  users (name, age)\nVALUES\n  ('JdbcCommitUser', 20)",
        table: 'users',
        type: 'insert',
      });
    });
    it('should parse Spring JDBC SQL execution Error logs correctly', async () => {
      const logText = await readFile('SpringJdbc2.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['SpringJdbc'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
        withSqlFragments: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(
          `SpringJdbc2.json`,
          JSON.stringify(result, null, 2),
        );
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(16);

      expect(result.sqlExecutions.length).toBe(4);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 4,
        endLine: 18,
        timestamp: expect.any(String),
        thread: 'main',
        sql: '',
        formattedSql: '',
        framework: 'SpringJdbc',
        error: expect.any(String),
        type: 'error',
      });
    });
  });
  describe('S2Jdbc preset', () => {
    it('should parse S2Jdbc SQL execution logs correctly', async () => {
      const logText = await readFile('S2Jdbc.log');
      const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS['S2Jdbc'];
      const parser = new LogParser({
        split,
        classify,
        extractors,
      });
      const result = await parser.parse({
        logText,
        stage: 'sqlExecution',
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`S2Jdbc.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(5);
      expect(result.logEvents[2]).toEqual({
        lineNo: 3,
        messageSeq: 1,
        timestamp: expect.any(String),
        level: 'DEBUG',
        fields: {
          pid: '30',
        },
        thread: 'ajp-nio-0.0.0.0-8009-exec-1',
        logger: 'query.SqlFileUpdateImpl',
        message:
          "UPDATE\n  super_mario_bros\n  AS o\n  SET\n  o.sf_mon9 = '2025-01', \n  o.standard_mario_bros_pp_gener = (select pp_gener from standard_mario_bros where id = o.standard_mario_bros_id)\n-- Com-Google\n  WHERE (bi_type6 IN (1 ,9) OR (bi_type6 = 2 AND usg_type = 3))\n-- Common Clause\nAND tanaka_pny >= 6\n  AND (sf_mon9 = \"\" OR sf_mon9 IS NULL)\n  AND t8_date >= '2025-01-01' \n  AND t8_date <= '2025-01-01' \n  AND hj999id LIKE CONCAT('%', '100000034701', '%') \n  AND pid IN ('600000006083') \n  LIMIT 10000 ",
        eventType: 'SQL_SINGLE',
      });
      expect(result.sqlExecutions.length).toBe(1);
      expect(result.sqlExecutions[0]).toEqual({
        startLine: 3,
        endLine: 3,
        framework: 'S2Jdbc',
        timestamp: expect.any(String),
        thread: 'ajp-nio-0.0.0.0-8009-exec-1',
        sql: "UPDATE\n  super_mario_bros\n  AS o\n  SET\n  o.sf_mon9 = '2025-01', \n  o.standard_mario_bros_pp_gener = (select pp_gener from standard_mario_bros where id = o.standard_mario_bros_id)\n-- Com-Google\n  WHERE (bi_type6 IN (1 ,9) OR (bi_type6 = 2 AND usg_type = 3))\n-- Common Clause\nAND tanaka_pny >= 6\n  AND (sf_mon9 = \"\" OR sf_mon9 IS NULL)\n  AND t8_date >= '2025-01-01' \n  AND t8_date <= '2025-01-01' \n  AND hj999id LIKE CONCAT('%', '100000034701', '%') \n  AND pid IN ('600000006083') \n  LIMIT 10000 ",
        formattedSql: expect.any(String),
        table: 'standard_mario_bros',
        type: 'select',
      });
    });
  });
});
