import * as SQLHelperExports from '../../../src';

describe('SQLHelper', () => {
  describe('module exports', () => {
    // Guard against the package barrel (src/index.ts) silently dropping a
    // re-export of a function this file's describe blocks exercise below.
    it('still exposes every function tested in this file', () => {
      const exportedFunctionNames = [
        'normalizeQuery',
        'parseQuery',
        'isReadOnlyQuery',
        'toViewDataQuery',
        'toViewDataNormalizedQuery',
        'toViewRecordsQuery',
        'toInsertStatement',
        'toUpdateStatement',
        'hasSetVariableClause',
        'separateMultipleQueries',
        'toSafeQueryForPgsqlAst',
      ];

      exportedFunctionNames.forEach((name) => {
        expect(typeof (SQLHelperExports as any)[name]).toBe('function');
      });
    });
  });
});
