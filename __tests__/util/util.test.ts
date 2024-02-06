import {
  ResultSetDataBuilder,
  parseContentType,
  parseCsvFromFile,
  parseCsvFromString,
} from '../../src';
import * as path from 'path';
import { promises as fs } from 'fs';

const dataFolder = path.join('__tests__', 'data');

describe('parseContentType', () => {
  describe('contentType is text/plain', () => {
    it('lang[ts] resolve from fileName', async () => {
      expect(
        parseContentType({
          contentType: 'text/plain',
          fileName: 'a.ts',
        }),
      ).toEqual({
        renderType: 'Text',
        isTextValue: true,
        contentType: 'text/plain',
        shortLang: 'ts',
        fileName: 'a.ts',
      });
    });

    it('lang[sql] resolve from fileName', async () => {
      expect(
        parseContentType({
          contentType: 'text/plain',
          fileName: 'a.sql',
        }),
      ).toEqual({
        renderType: 'Text',
        isTextValue: true,
        contentType: 'text/plain',
        shortLang: 'sql',
        fileName: 'a.sql',
      });
    });
  });

  describe('contentType is text/html', () => {
    it('should be html lang', async () => {
      expect(
        parseContentType({
          contentType: 'text/html',
        }),
      ).toEqual({
        renderType: 'Text',
        isTextValue: true,
        contentType: 'text/html',
        shortLang: 'html',
        fileName: 'filename.html',
      });
    });
  });

  describe('contentType is application/json; charset=utf-8', () => {
    it('should be json lang', async () => {
      expect(
        parseContentType({
          fileName: 'http://www.examples.com/hoge/piyo.json?ts=990',
          contentType: 'application/json; charset=utf-8',
        }),
      ).toEqual({
        renderType: 'Text',
        isTextValue: true,
        contentType: 'application/json; charset=utf-8',
        shortLang: 'json',
        fileName: 'piyo.json',
      });
    });
  });

  describe('contentType is image/webp', () => {
    it('should be no lang', async () => {
      expect(
        parseContentType({
          fileName:
            'https://www.google.com/images/searchbox/desktop_searchbox_sprites318_hr.webp',
          contentType: 'image/webp',
        }),
      ).toEqual({
        renderType: 'Image',
        isTextValue: false,
        contentType: 'image/webp',
        fileName: 'desktop_searchbox_sprites318_hr.webp',
      });
    });
  });

  describe('contentType is font/woff2', () => {
    it('should be no lang', async () => {
      expect(
        parseContentType({
          fileName:
            'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
          contentType: 'font/woff2',
        }),
      ).toEqual({
        renderType: 'Font',
        isTextValue: false,
        contentType: 'font/woff2',
        fileName: 'KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
      });
    });
  });
});

describe('parseCsvFromFile', () => {
  it('should be success to read the CSV file', async () => {
    const rdb = await parseCsvFromFile(path.join(dataFolder, 'iris.csv'), {
      columns: true,
      cast: true,
    });

    expect(rdb.hasKey('sepal.length')).toBe(true);
    expect(rdb.hasKey('sepal.width')).toBe(true);
    expect(rdb.hasKey('petal.length')).toBe(true);
    expect(rdb.hasKey('petal.width')).toBe(true);
    expect(rdb.hasKey('variety')).toBe(true);
    expect(rdb.rs.rows.length).toBe(150);
  });

  it('should be success to cast', async () => {
    const rdb = await parseCsvFromFile(path.join(dataFolder, 'weather.csv'), {
      columns: true,
      cast: true,
      castDate: true,
    });

    expect(rdb.hasKey('date')).toBe(true);
    expect(rdb.hasKey('outlook')).toBe(true);
    expect(rdb.hasKey('temperature')).toBe(true);
    expect(rdb.hasKey('humidity')).toBe(true);
    expect(rdb.hasKey('windy')).toBe(true);
    expect(rdb.hasKey('play')).toBe(true);
    expect(rdb.rs.rows.length).toBe(7);

    const firstRow = rdb.rs.rows[0];
    expect(firstRow.values['date']).toEqual(expect.any(Date));
    expect(firstRow.values['outlook']).toBe('overcast');
    expect(firstRow.values['temperature']).toBe(10.5);
    expect(firstRow.values['windy']).toBe(true);
  });
});

describe('parseCsvFromString', () => {
  it('should be success to read the CSV string', async () => {
    const csvText = await fs.readFile(path.join(dataFolder, 'iris.csv'), {
      encoding: 'utf-8',
    });
    const rdb = await parseCsvFromString(csvText, {
      columns: true,
    });

    expect(rdb.hasKey('sepal.length')).toBe(true);
    expect(rdb.hasKey('sepal.width')).toBe(true);
    expect(rdb.hasKey('petal.length')).toBe(true);
    expect(rdb.hasKey('petal.width')).toBe(true);
    expect(rdb.hasKey('variety')).toBe(true);
    expect(rdb.rs.rows.length).toBe(150);
  });

  it('should be success to read the headless CSV string', async () => {
    const csvText = await fs.readFile(
      path.join(dataFolder, 'iris_headless.csv'),
      {
        encoding: 'utf-8',
      },
    );
    const rdb = await parseCsvFromString(csvText, {
      columns: [
        'sepal.length',
        'sepal.width',
        'petal.length',
        'petal.width',
        'variety',
      ],
    });

    expect(rdb.hasKey('sepal.length')).toBe(true);
    expect(rdb.hasKey('sepal.width')).toBe(true);
    expect(rdb.hasKey('petal.length')).toBe(true);
    expect(rdb.hasKey('petal.width')).toBe(true);
    expect(rdb.hasKey('variety')).toBe(true);
    expect(rdb.rs.rows.length).toBe(150);
  });
});
