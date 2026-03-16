import { promises as fs } from 'fs';
import * as path from 'path';

import { LOG_EVENT_SPLIT_PRESETS, LogParser } from '../../src';

const dataFolder = path.join('__tests__', 'data');

const RESET_EXTRACTED_SQL_RESULT = true;

const writeJSONFile = async (fileName: string, data: string): Promise<void> => {
  await fs.writeFile(path.join(dataFolder, 'logs', 'split', fileName), data, {
    encoding: 'utf-8',
  });
};

describe('split', () => {
  describe('Simple', () => {
    it('ok', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Simple'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
        debug: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Simple.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '2026-03-12 10:11:22',
        level: 'DEBUG',
        logger: 'com.example.UserService',
        message: 'Executing query',
        eventType: 'NORMAL',
      });
    });
  });
  describe('Logback', () => {
    it('ok', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Logback'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
        debug: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Logback.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '10:11:22.333',
        thread: 'http-nio-8080-exec-1',
        level: 'DEBUG',
        logger: 'com.example.UserService',
        message: 'Executing query',
        eventType: 'NORMAL',
      });
    });
  });
  describe('Log4j', () => {
    it('ok', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Log4j'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
        debug: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Log4j.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '2026-03-12 10:11:22,333',
        thread: 'http-nio-8080-exec-1',
        level: 'DEBUG',
        logger: 'com.example.UserService',
        message: 'Executing query',
        eventType: 'NORMAL',
      });
    });
    it('mdc, ok', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Log4jMdc'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
        debug: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`Log4jMdc.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '1999/01/01 14:52:34 0502',
        level: 'DEBUG',
        thread: 'http-nio-8080-exec-1',
        fields: {
          logNo: '30',
        },
        logger: 'com.example.UserService',
        message: 'Executing query',
        eventType: 'NORMAL',
      });
    });
  });
  describe('JavaUtilLogging', () => {
    it('ok', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['JavaUtilLogging'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
        debug: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(
          `JavaUtilLogging.json`,
          JSON.stringify(result, null, 2),
        );
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(2);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: 'Mar 12, 2026 10:11:22 AM',
        logger: 'com.example.UserService',
        fields: {
          method: 'execute',
        },
        level: 'INFO',
        message: 'Executing query',
        eventType: 'NORMAL',
      });
    });
  });
  describe('SpringBoot', () => {
    it('ok', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
        debug: true,
      });

      if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
        await writeJSONFile(`SpringBoot.json`, JSON.stringify(result, null, 2));
      }

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '2026-03-12 10:11:22.333',
        level: 'INFO',
        fields: {
          pid: '12345',
        },
        thread: 'nio-8080-exec-1',
        logger: 'c.example.demo.UserService',
        message: 'Executing query',
        eventType: 'NORMAL',
      });
    });
  });
});
