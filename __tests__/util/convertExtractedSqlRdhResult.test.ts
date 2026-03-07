import { promises as fs } from 'fs';
import * as path from 'path';
import { convertExtractedSqlRdhResult, ExtractedSqlResult } from '../../src';

const dataFolder = path.join('__tests__', 'data');

const readFile = async (dir: string, fileName: string): Promise<string> => {
  return await fs.readFile(path.join(dataFolder, 'logs', dir, fileName), {
    encoding: 'utf-8',
  });
};

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
      'dir:%s, file:%s, logRowCount:%d, sqlRowCount:%d',
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
