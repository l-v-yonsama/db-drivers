import { promises as fs } from 'fs';
import * as path from 'path';
import {
  convertExtractedSqlRdhResult,
  createLogEventPatternText,
  ExtractedSqlResult,
  extractSqlFromLogText,
  LOG_PARSE_CONFIG_PRESETS,
  SqlLogEvent,
} from '../../src';

const dataFolder = path.join('__tests__', 'data');

const RESET_EXTRACTED_SQL_RESULT = false;

const readFile = async (dir: string, fileName: string): Promise<string> => {
  return await fs.readFile(path.join(dataFolder, 'logs', dir, fileName), {
    encoding: 'utf-8',
  });
};

const writeJSONFile = async (
  dir: string,
  fileName: string,
  data: string,
): Promise<void> => {
  await fs.writeFile(path.join(dataFolder, 'logs', dir, fileName), data, {
    encoding: 'utf-8',
  });
};

describe('createLogEventPatternText', () => {
  it('returns ok,S2Jdbc.split.fields', () => {
    const splitPattern = createLogEventPatternText({
      ...LOG_PARSE_CONFIG_PRESETS.S2Jdbc.split,
      targetForHuman: true,
    });

    expect(splitPattern).toBe(
      '^\\[(?<timestamp>\\d{4}/\\d{2}/\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\s+\\d{4})\\] \\[(?<level>{LEVEL})\\] \\[(?<thread>{DATA})\\] \\[(?<logNo>{INT})\\] (?<logger>{LOGGER}) (?<delimiter_1>-) (?<message>{GREEDY_MULTILINE})',
    );
  });
  it('returns ok,MyBatis.split.fields', () => {
    const splitPattern = createLogEventPatternText({
      ...LOG_PARSE_CONFIG_PRESETS.MyBatis.split,
      targetForHuman: true,
    });

    expect(splitPattern).toBe(
      '^(?<timestamp>{ISO8601_TIMESTAMP}) \\[(?<thread>{DATA})\\] (?<level>{LEVEL}) (?<logger>{DATA}) (?<delimiter_1>-) (?<message>{GREEDY_MULTILINE})',
    );
  });
});

describe('extractSqlFromLogText', () => {
  describe('01_Seasar_S2JDBC', () => {
    it.each([
      ['01', 's01.log', [{ type: 'select', table: 'standard_mario_bros' }]],
      [
        '02',
        's02.log',
        [
          { type: 'select', table: 'XD_trader' },
          { type: 'select', table: 'tm5' },
          { type: 'select', table: 'super_mario_bros' },
          { type: 'select', table: 'NU' },
          { type: 'select', table: 'CY_SETTINGS' },
          { type: 'update', table: 'tm5' },
          { type: 'update', table: 'super_mario_bros' },
        ],
      ],
      [
        '03',
        's03.log',
        [{ type: 'select', table: 'SELLER' }, { type: 'select' }],
      ],
      [
        '04',
        's04.log',
        [
          { type: 'select', table: 'PENGUIN' },
          { type: 'insert', table: 'PENGUIN' },
          { type: 'update', table: 'PENGUIN' },
        ],
      ],
      [
        '05',
        's05.log',
        [
          {
            type: 'insert',
            table: 'MAIL_QUEUE',
          },
        ],
      ],
      [
        '06',
        's06.log',
        [
          {
            type: 'select',
            table: 'standard_mario_bros_history',
          },
        ],
      ],
    ])(
      'returns (type:%s, table:%s) when dir:%s, file:%s',
      async (
        dir: string,
        file: string,
        expectedSqlEvents: Partial<SqlLogEvent>[],
      ) => {
        const logText = await readFile(dir, file);
        const result = await extractSqlFromLogText(
          logText,
          LOG_PARSE_CONFIG_PRESETS.S2Jdbc,
        );
        if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
          await writeJSONFile(
            dir,
            `${file}.json`,
            JSON.stringify(result, null, 2),
          );
        }
        expect(result.ok).toBeTruthy();
        expect(result.logEvents.length).toBeGreaterThanOrEqual(1);
        expect(result.sqlEvents).toHaveLength(expectedSqlEvents.length);
        for (let i = 0; i < expectedSqlEvents.length; i++) {
          const actualSqlEvent = result.sqlEvents[i];
          const expectedSqlEvent = expectedSqlEvents[i];
          expect(actualSqlEvent).toEqual({
            lineNo: expect.any(Number),
            timestamp: expect.any(String),
            rawSql: expect.any(String),
            normalizedSql: expect.any(String),
            bindParams: undefined,
            total: undefined,
            type: expectedSqlEvent.type,
            schema: undefined,
            table: expectedSqlEvent.table,
            index: undefined,
          });
        }
      },
    );
  });

  describe('02_Spring_MyBatis', () => {
    it.each([
      [
        '01',
        'm01.log',
        [
          {
            type: 'select',
            table: 'standard_mario_bros',
            total: 1,
            rawParams:
              '2025-01(String), 2025-01-01(String), 2025-01-01(String), 100000034701(String), 600000006083(String), 10000(Integer)',
          },
        ],
      ],
      [
        '02',
        'm02.log',
        [
          { type: 'select', table: 'XD_trader', total: 1 },
          {
            type: 'select',
            table: 'tm5',
            rawParams: '12552(Integer), RAKKO1234(String)',
            total: 1,
          },
          {
            type: 'select',
            table: 'tm5',
            rawParams: '30747344(Integer), 31(Integer)',
            total: 1,
          },
          {
            type: 'select',
            table: 'super_mario_bros',
            rawParams: '30747344(Integer)',
            total: 1,
          },
          {
            type: 'select',
            table: 'super_mario_bros',
            rawParams: '80001965(Integer)',
            total: 1,
          },
          {
            type: 'select',
            table: 'sanrio',
            rawParams: '12552(Integer)',
            total: 1,
          },
          {
            type: 'update',
            table: 'tm5',
            rawParams:
              '789##$K1LL4$=-(String), /tanuki800$=-(String), 30747344(Integer)',
            total: 1,
          },
          {
            type: 'update',
            table: 'super_mario_bros',
            rawParams:
              '30747344(Integer), 789(String),  80001965(Integer), 36(Integer)',
            total: 1,
          },
        ],
      ],
      [
        '03',
        'm03.log',
        [
          { type: 'select', table: 'seller', total: 2 },
          {
            type: 'select',
            rawParams:
              '86(Integer), RAKKO1234(String), RAKKO1234(String), 9(Short), 1999/01/01(String), 1999/01/01(String), 030PA1DW(String), 8012020052701(String), 030PA1DW(String), 8012020052701(String), 100(String), 102(String)',
            total: 1,
          },
        ],
      ],
      [
        '04',
        'm04.log',
        [
          {
            type: 'select',
            table: 'penguin',
            rawParams: '801test801(String)',
            total: 0,
          },
          {
            type: 'insert',
            table: 'penguin',
            rawParams:
              '801test801(String), test(String), (String), 1999-01-19 17:16:07.672(Timestamp)',
            total: 1,
          },
          {
            type: 'update',
            table: 'penguin',
            rawParams:
              '801test801(String), test\ntest_update(String), (String), 1999-01-19 17:16:08.0(Timestamp), 131090(Integer), 1(Integer)',
            total: 1,
          },
        ],
      ],
      [
        '05',
        'm05.log',
        [
          {
            type: 'insert',
            table: 'mail_queue',
            rawParams:
              '【TEST】Test-subject(String), Body-1\nBody-2\nBody-3\n(String), 1999-01-28 13:53:44.123(Timestamp)',
            total: 1,
          },
        ],
      ],
    ])(
      'returns (type:%s, table:%s) when dir:%s, file:%s',
      async (
        dir: string,
        file: string,
        expectedSqlEvents: Partial<SqlLogEvent>[],
      ) => {
        const logText = await readFile(dir, file);
        const result = await extractSqlFromLogText(
          logText,
          LOG_PARSE_CONFIG_PRESETS.S2Jdbc,
        );
        if (RESET_EXTRACTED_SQL_RESULT && result.ok) {
          await writeJSONFile(
            dir,
            `${file}.json`,
            JSON.stringify(result, null, 2),
          );
        }
        expect(result.ok).toBeTruthy();
        expect(result.logEvents.length).toBeGreaterThanOrEqual(1);
        expect(result.sqlEvents).toHaveLength(expectedSqlEvents.length);
        for (let i = 0; i < expectedSqlEvents.length; i++) {
          const actualSqlEvent = result.sqlEvents[i];
          const expectedSqlEvent = expectedSqlEvents[i];
          expect(actualSqlEvent).toEqual({
            lineNo: expect.any(Number),
            timestamp: expect.any(String),
            rawSql: expect.any(String),
            normalizedSql: expect.any(String),
            errorMessage: undefined,
            rawParams: expectedSqlEvent.rawParams,
            total: expectedSqlEvent.total,
            type: expectedSqlEvent.type,
            schema: undefined,
            table: expectedSqlEvent.table,
            index: undefined,
          });
        }
      },
    );

    it.each([
      [
        '06',
        'm06.log',
        [
          {
            type: 'UNKNOWN',
            total: 1,
          },
        ],
      ],
    ])(
      'returns (type:%s, table:%s) with error-message when dir:%s, file:%s',
      async (
        dir: string,
        file: string,
        expectedSqlEvents: Partial<SqlLogEvent>[],
      ) => {
        const logText = await readFile(dir, file);
        const result = await extractSqlFromLogText(
          logText,
          LOG_PARSE_CONFIG_PRESETS.MyBatis,
        );
        expect(result.ok).toBeTruthy();
        expect(result.logEvents.length).toBeGreaterThanOrEqual(1);
        expect(result.sqlEvents).toHaveLength(expectedSqlEvents.length);
        for (let i = 0; i < expectedSqlEvents.length; i++) {
          const actualSqlEvent = result.sqlEvents[i];
          const expectedSqlEvent = expectedSqlEvents[i];
          expect(actualSqlEvent).toEqual({
            lineNo: expect.any(Number),
            timestamp: expect.any(String),
            rawSql: expect.any(String),
            normalizedSql: expect.any(String),
            errorMessage: expect.any(String),
            rawParams: expectedSqlEvent.rawParams,
            total: expectedSqlEvent.total,
            type: expectedSqlEvent.type,
            schema: undefined,
            table: expectedSqlEvent.table,
            index: undefined,
          });
        }
      },
    );
  });
});

describe('convertExtractedSqlRdhResult', () => {
  describe('01_Seasar_S2JDBC', () => {
    it.each([
      ['01', 's01.log.json', 3, 1],
      ['02', 's02.log.json', 10, 7],
      ['03', 's03.log.json', 5, 2],
      ['04', 's04.log.json', 6, 3],
      ['05', 's05.log.json', 3, 1],
      ['06', 's06.log.json', 2, 1],
    ])(
      'Input dir:%s, file:%s, Output logRowCount:%d, sqlRowCount:%d',
      async (
        dir: string,
        file: string,
        logRowCount: number,
        sqlRowCount: number,
      ) => {
        const input = JSON.parse(
          await readFile(dir, file),
        ) as ExtractedSqlResult;
        const result = await convertExtractedSqlRdhResult(input);
        expect(result.logEvents.rows).toHaveLength(logRowCount);
        expect(result.sqlEvents.rows).toHaveLength(sqlRowCount);
      },
    );
  });

  describe('02_Spring_MyBatis', () => {
    it.each([
      ['01', 'm01.log.json', 7, 1],
      ['02', 'm02.log.json', 42, 8],
      ['03', 'm03.log.json', 16, 2],
      ['04', 'm04.log.json', 19, 3],
      ['05', 'm05.log.json', 10, 1],
    ])(
      'returns (type:%s, table:%s) when dir:%s, file:%s',
      async (
        dir: string,
        file: string,
        logRowCount: number,
        sqlRowCount: number,
      ) => {
        const input = JSON.parse(
          await readFile(dir, file),
        ) as ExtractedSqlResult;
        const result = await convertExtractedSqlRdhResult(input);
        expect(result.logEvents.rows).toHaveLength(logRowCount);
        expect(result.sqlEvents.rows).toHaveLength(sqlRowCount);
      },
    );
  });
});
