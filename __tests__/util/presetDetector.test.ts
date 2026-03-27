import { promises as fs } from 'fs';
import * as path from 'path';

import {
  ClassifiedEvent,
  detectLogSplitPreset,
  detectSqlParsePreset,
  formatLogDetectionMessage,
  LOG_EVENT_SPLIT_PRESETS,
  LogParser,
  SQL_LOG_PARSE_PRESETS,
  SqlLogParsePresetName,
} from '../../src';

const dataFolder = path.join('__tests__', 'data');

const getLogEvent = async (
  fileName: string,
  sqlLogPreset: SqlLogParsePresetName,
): Promise<ClassifiedEvent[]> => {
  const logText = await fs.readFile(
    path.join(dataFolder, 'logs', 'parse', fileName),
    {
      encoding: 'utf-8',
    },
  );
  const { split } = LOG_EVENT_SPLIT_PRESETS['SpringBoot'];
  const { classify, extractors } = SQL_LOG_PARSE_PRESETS[sqlLogPreset];
  const parser = new LogParser({
    split,
    classify,
    extractors,
  });
  const result = await parser.parse({
    logText,
    stage: 'split',
  });
  return result.logEvents;
};

describe('detectLogSplitPreset', () => {
  it.each([
    ['Simple', ['Simple']],
    ['Logback', ['Logback', 'Log4j']],
    ['Log4j', ['Log4j']],
    ['Log4jMdc', ['Log4jMdc']],
    ['JavaUtilLogging', ['JavaUtilLogging']],
    ['SpringBoot', ['Simple', 'SpringBoot']],
  ])(
    'should detect %s preset from sample log',
    async (iPresetName: string, detectedPresetNames: string[]) => {
      const { logExample } = LOG_EVENT_SPLIT_PRESETS[iPresetName];

      const result = detectLogSplitPreset(logExample, LOG_EVENT_SPLIT_PRESETS);

      expect(result.presetNames).toEqual(detectedPresetNames);
      expect(result.confidence).toBeGreaterThanOrEqual(0.4);
    },
  );
});

describe('detectSqlParsePreset', () => {
  it.each([
    ['Hibernate.log', 'Hibernate', ['Hibernate']],
    ['Doma.log', 'Doma', ['Doma']],
    ['Doma2.log', 'Doma', ['Doma']],
    ['MyBatis.log', 'MyBatis', ['MyBatis']],
    ['MyBatis2.log', 'MyBatis', ['MyBatis']],
    ['MyBatis3.log', 'MyBatis', ['MyBatis']],
    ['SpringJdbc.log', 'SpringJdbc', ['SpringJdbc']],
    ['S2Jdbc.log', 'S2Jdbc', ['S2Jdbc']],
  ])(
    'should detect SQL preset %s from log file %s',
    async (
      fileName: string,
      sqlLogPresetName: SqlLogParsePresetName,
      detectedPresetNames: string[],
    ) => {
      const logEvents = await getLogEvent(fileName, sqlLogPresetName);
      const result = detectSqlParsePreset(logEvents, SQL_LOG_PARSE_PRESETS);

      expect(result.presetNames).toEqual(detectedPresetNames);
      expect(result.confidence).toBeGreaterThanOrEqual(0.4);
    },
  );
});

describe('formatLogDetectionMessage', () => {
  it('should format detection message for log split preset', async () => {
    const { logExample } = LOG_EVENT_SPLIT_PRESETS.Logback;

    const result = detectLogSplitPreset(logExample, LOG_EVENT_SPLIT_PRESETS);
    const text = formatLogDetectionMessage(result);

    expect(text).toBe('Likely: Logback,Log4j (50%)');
  });

  it('should format detection message for SQL parse preset', async () => {
    const logEvents = await getLogEvent('Hibernate.log', 'Hibernate');
    const result = detectSqlParsePreset(logEvents, SQL_LOG_PARSE_PRESETS);
    const text = formatLogDetectionMessage(result);

    expect(text).toMatch(/Detected: Hibernate \(\d+% confidence\)/);
  });
});
