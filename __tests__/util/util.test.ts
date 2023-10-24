import { parseContentType } from '../../src';

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
      });
    });
  });

  describe('contentType is application/json; charset=utf-8', () => {
    it('should be json lang', async () => {
      expect(
        parseContentType({
          contentType: 'application/json; charset=utf-8',
        }),
      ).toEqual({
        renderType: 'Text',
        isTextValue: true,
        contentType: 'application/json; charset=utf-8',
        shortLang: 'json',
      });
    });
  });
});
