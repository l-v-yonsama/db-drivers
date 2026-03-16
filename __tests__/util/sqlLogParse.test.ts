import { promises as fs, read } from 'fs';
import * as path from 'path';

import {
  createLogEventPatternText,
  LOG_EVENT_SPLIT_PRESETS,
  LogParser,
  SQL_LOG_PARSE_PRESETS,
  SqlExecutionEvent,
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

// describe('createLogEventPatternText', () => {
//   it('returns ok,S2Jdbc.split.fields', () => {
//     const splitPattern = createLogEventPatternText({
//       ...LOG_PARSE_CONFIG_PRESETS.S2Jdbc.split,
//       targetForHuman: true,
//     });

//     expect(splitPattern).toBe(
//       '^\\[(?<timestamp>\\d{4}/\\d{2}/\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\s+\\d{4})\\] △ \\[(?<level>{LEVEL})\\] △ \\[(?<thread>{DATA})\\] △ \\[(?<logNo>{INT})\\] △ (?<logger>{LOGGER}) △ (?<literal_1>-) △ (?<message>{GREEDY_MULTILINE})',
//     );
//   });

//   it('returns ok,MyBatis.split.fields', () => {
//     const splitPattern = createLogEventPatternText({
//       ...LOG_PARSE_CONFIG_PRESETS.MyBatis.split,
//       targetForHuman: true,
//     });

//     expect(splitPattern).toBe(
//       '^(?<timestamp>{ISO8601_TIMESTAMP}) △ \\[(?<thread>{DATA})\\] △ (?<level>{LEVEL}) △ (?<logger>{DATA}) △ (?<literal_1>-) △ (?<message>{GREEDY_MULTILINE})',
//     );
//   });
// });

describe('parseSql', () => {
  describe('Hibernate', () => {
    it('ok', async () => {
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
        debug: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Hibernate.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(56);
      expect(result.logEvents[8]).toEqual({
        lineNo: 9,
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
    });
  });
  describe('Doma', () => {
    it('ok', async () => {
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
        debug: true,
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
        timestamp: expect.any(String),
        thread: 'main',
        sql: "insert into users (name) values ('CommitUser')",
        normalizedSql: "insert into users (name) values ('CommitUser')",
        table: 'users',
        type: 'insert',
        daoClass: 'com.example.demo.UserDaoImpl,',
        daoMethod: 'insert',
      });
    });
    it('2, ok', async () => {
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
        debug: true,
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
        timestamp: expect.any(String),
        thread: 'main',
        sql: "insert into users (name) values ('CommitUser')",
        normalizedSql: "insert into users (name) values ('CommitUser')",
        table: 'users',
        type: 'insert',
        daoClass: 'com.example.demo.UserDaoImpl,',
        daoMethod: 'insert',
      });
    });
  });
  describe('MyBatis', () => {
    it('ok', async () => {
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
        debug: true,
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
        timestamp: '2026-03-13T11:20:54.404+09:00',
        thread: 'main',
        sql: 'insert into users(name) values(?)',
        params: 'MyBatisCommitUser(String)',
        result: '1',
        normalizedSql: 'insert into users(name) values(?)',
        table: 'users',
        type: 'insert',
        daoClass: 'o.s.t.i',
        daoMethod: 'TransactionInterceptor',
      });
    });
    it('2, ok', async () => {
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
        debug: true,
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
        timestamp: '2026-03-13T16:36:42.174+09:00',
        thread: 'main',
        sql: 'insert into users(name) values(?)',
        params: 'MyBatisCommitUser(String)',
        result: '1',
        normalizedSql: 'insert into users(name) values(?)',
        table: 'users',
        type: 'insert',
        daoClass: 'o.s.jdbc.datasource',
        daoMethod: 'DataSourceUtils',
      });
    });
    it('3, ok', async () => {
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
        debug: true,
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
        timestamp: expect.any(String),
        thread: 'main',
        sql: 'insert into users(name) values(?)',
        params: 'MyBatisCommitUser(String)',
        result: '1',
        normalizedSql: 'insert into users(name) values(?)',
        table: 'users',
        type: 'insert',
        daoClass: 'c.example.demo.MyBatisUserMapper',
        daoMethod: 'insert',
      });
    });
  });
});
