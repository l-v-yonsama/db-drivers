import { LOG_EVENT_SPLIT_PRESETS, LogParser } from '../../src';

describe('LogParser.split', () => {
  describe('Simple preset', () => {
    it('should split log events correctly', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Simple'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
      });

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '2026-03-12 10:11:22',
        level: 'DEBUG',
        logger: 'com.example.UserService',
        message: 'Executing query',
        messageSeq: 1,
        eventType: 'NORMAL',
      });
    });
  });
  describe('Logback preset', () => {
    it('should split log events correctly', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Logback'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
      });

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '10:11:22.333',
        thread: 'http-nio-8080-exec-1',
        level: 'DEBUG',
        logger: 'com.example.UserService',
        message: 'Executing query',
        messageSeq: 1,
        eventType: 'NORMAL',
      });
    });
  });
  describe('Log4j preset', () => {
    it('should split log events correctly', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Log4j'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
      });

      expect(result.ok).toBeTruthy();
      expect(result.logEvents.length).toBe(3);
      expect(result.logEvents[0]).toEqual({
        lineNo: 1,
        timestamp: '2026-03-12 10:11:22,333',
        thread: 'http-nio-8080-exec-1',
        level: 'DEBUG',
        logger: 'com.example.UserService',
        message: 'Executing query',
        messageSeq: 1,
        eventType: 'NORMAL',
      });
    });
    it('should split log events correctly when MDC fields exist', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['Log4jMdc'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
      });

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
        messageSeq: 1,
        eventType: 'NORMAL',
      });
    });
  });
  describe('JavaUtilLogging preset', () => {
    it('should split log events correctly', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['JavaUtilLogging'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
      });

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
        messageSeq: 1,
        eventType: 'NORMAL',
      });
    });
  });
  describe('SpringBoot preset', () => {
    it('should split log events correctly', async () => {
      const { split, logExample } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
      const parser = new LogParser({
        split,
        classify: [],
        extractors: [],
      });
      const result = await parser.parse({
        logText: logExample,
        stage: 'split',
      });

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
        messageSeq: 1,
        eventType: 'NORMAL',
      });
    });
  });
});
