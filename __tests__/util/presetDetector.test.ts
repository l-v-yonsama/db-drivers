import { promises as fs } from 'fs';
import * as path from 'path';

import {
  detectLogFormatWithConfidence,
  LOG_PARSE_CONFIG_PRESETS,
} from '../../src';

const dataFolder = path.join('__tests__', 'data');

const readFile = async (dir: string, fileName: string): Promise<string> => {
  return await fs.readFile(path.join(dataFolder, 'logs', dir, fileName), {
    encoding: 'utf-8',
  });
};

describe('detectLogFormatWithConfidence', () => {
  describe('S2Jdbc detection', () => {
    it.each([
      ['01', 's01.log'],
      ['02', 's02.log'],
      ['03', 's03.log'],
      ['04', 's04.log'],
      ['05', 's05.log'],
      ['06', 's06.log'],
    ])('detects S2Jdbc dir:%s file:%s', async (dir: string, file: string) => {
      const logText = await readFile(dir, file);

      const result = detectLogFormatWithConfidence(
        logText,
        LOG_PARSE_CONFIG_PRESETS,
      );

      expect(result.presetName).toBe('S2Jdbc');

      expect(result.confidence).toBeGreaterThanOrEqual(0.4);

      expect(result.scores['S2Jdbc']).toBeGreaterThan(
        result.scores['MyBatis'] ?? 0,
      );
    });
  });

  describe('MyBatis detection', () => {
    it.each([
      ['01', 'm01.log'],
      ['02', 'm02.log'],
      // ['03', 'm03.log'],
      // ['04', 'm04.log'],
      // ['05', 'm05.log'],
    ])('detects MyBatis dir:%s file:%s', async (dir: string, file: string) => {
      const logText = await readFile(dir, file);

      const result = detectLogFormatWithConfidence(
        logText,
        LOG_PARSE_CONFIG_PRESETS,
      );

      expect(result.presetName).toBe('MyBatis');

      expect(result.confidence).toBeGreaterThanOrEqual(0.4);

      expect(result.scores['MyBatis']).toBeGreaterThan(
        result.scores['S2Jdbc'] ?? 0,
      );
    });
  });

  describe('unknown format', () => {
    it('returns low confidence for random log', () => {
      const randomLog = `
Hello world
This is random log
Something happened
Stack trace maybe
`;

      const result = detectLogFormatWithConfidence(
        randomLog,
        LOG_PARSE_CONFIG_PRESETS,
      );

      expect(result.confidence).toBeLessThanOrEqual(0.4);
    });
  });
});
