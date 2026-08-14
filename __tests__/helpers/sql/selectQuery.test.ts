import { eolToSpace } from '@l-v-yonsama/rdh';
import {
  RdsDatabase,
  toViewDataNormalizedQuery,
  toViewDataQuery,
  toViewRecordsQuery,
} from '../../../src';
import { loadMysqlDbFixture } from '../../setup/mysql';

describe('SQLHelper', () => {
  let db: RdsDatabase;

  beforeAll(async () => {
    db = await loadMysqlDbFixture();
  });

  describe('toViewDataQuery', () => {
    describe('sql', () => {
      it('Simple (no conitions)', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
        });
        expect(eolToSpace(query)).toBe('SELECT * FROM testdb.testtable');
        expect(binds).toEqual([]);
      });
      it('With conitions', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n0',
                operator: 'equal',
                value: '1',
              },
              {
                fact: 'n1',
                operator: 'isNotNull',
                value: null,
              },
              {
                fact: 'n2',
                operator: 'in',
                value: '1, 2, 3',
              },
              {
                fact: 'd1',
                operator: 'in',
                value: '2020-01-01, today',
              },
              {
                fact: 'd3',
                operator: 'lessThan',
                value: 'now',
              },
            ],
          },
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable WHERE ID <> :val1 AND n0 = :val2 AND n1 IS NOT NULL AND n2 IN (:val3) AND d1 IN (:val4) AND d3 < :val5',
        );
        expect(binds).toEqual({
          val1: 100,
          val2: true,
          val3: [1, 2, 3],
          val4: expect.any(Array),
          val5: expect.anything(),
        });
      });
      it('With conitions2', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n0',
                operator: 'equal',
                value: '1',
              },
              {
                fact: 'n1',
                operator: 'isNotNull',
                value: null,
              },
              {
                fact: 'n2',
                operator: 'in',
                value: '1, 2, 3',
              },
              {
                fact: 'd1',
                operator: 'in',
                value: '2020-01-01, today',
              },
              {
                fact: 'd3',
                operator: 'lessThan',
                value: 'now',
              },
            ],
          },
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable WHERE ID <> ? AND n0 = ? AND n1 IS NOT NULL AND n2 IN (?,?,?) AND d1 IN (?,?) AND d3 < ?',
        );
        expect(binds).toEqual([
          100,
          true,
          1,
          2,
          3,
          expect.anything(),
          expect.anything(),
          expect.anything(),
        ]);
      });
      it('With conitions3', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          toPositionedParameter: true,
          conditions: {
            any: [
              {
                fact: 'n0',
                operator: 'isNull',
                value: null,
              },
              {
                fact: 'd2',
                operator: 'greaterThan',
                value: '13:24:56',
              },
              {
                all: [
                  {
                    fact: 'n2',
                    operator: 'between',
                    value: '20, 30',
                  },
                  {
                    fact: 'd1',
                    operator: 'between',
                    value: '2020-01-01, 2022-12-31',
                  },
                ],
              },
              {
                fact: 's2',
                operator: 'like',
                value: 't%st',
              },
            ],
          },
        });

        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable WHERE n0 IS NULL OR d2 > $1 OR ( n2 BETWEEN $2 AND $3 AND d1 BETWEEN $4 AND $5 ) OR s2 LIKE $6',
        );
        expect(binds).toEqual([
          '13:24:56',
          20,
          30,
          expect.anything(),
          expect.anything(),
          't%st',
        ]);
      });
    });
    describe('limit clause style', () => {
      it('top: TOP n in the SELECT clause, no trailing clause', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          limit: 10,
          limitClauseStyle: 'top',
        });
        expect(eolToSpace(query)).toBe(
          'SELECT TOP 10 * FROM testdb.testtable',
        );
      });
      it('trailing: trailing LIMIT n', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          limit: 10,
          limitClauseStyle: 'trailing',
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable LIMIT 10',
        );
      });
      it('fetchFirst: trailing FETCH FIRST n ROWS ONLY (Oracle)', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          limit: 10,
          limitClauseStyle: 'fetchFirst',
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM testdb.testtable FETCH FIRST 10 ROWS ONLY',
        );
      });
      it('toViewRecordsQuery: fetchFirst combined with limitMode "last"', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const query = toViewRecordsQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          limit: 5,
          limitClauseStyle: 'fetchFirst',
          limitMode: 'last',
          limitLastColumn: 'ID',
        });
        expect(query).toBe(
          'SELECT * FROM testdb.testtable ORDER BY ID DESC FETCH FIRST 5 ROWS ONLY',
        );
      });
      it('toViewRecordsQuery: top ignores limitMode and always puts TOP up front', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const query = toViewRecordsQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          schemaName: schemaRes.name,
          limit: 5,
          limitClauseStyle: 'top',
          limitMode: 'last',
          limitLastColumn: 'ID',
        });
        expect(query).toBe(
          'SELECT TOP 5 * FROM testdb.testtable ORDER BY ID DESC',
        );
      });
    });
    describe('partiql', () => {
      it('Simple (no conitions)', () => {
        const schemaRes = db.getSchema({ isDefault: true });
        const { query, binds } = toViewDataNormalizedQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          sqlLang: 'partiql',
        });
        expect(eolToSpace(query)).toBe('SELECT * FROM "testtable"');
        expect(binds).toEqual([]);
      });
      it('With conitions-in', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n0',
                operator: 'equal',
                value: '1',
              },
              {
                fact: 'n1',
                operator: 'isNotNull',
                value: null,
              },
              {
                fact: 'n2',
                operator: 'in',
                value: '1, 2, 3',
              },
              {
                fact: 's2',
                operator: 'like',
                value: 'test',
              },
            ],
          },
          sqlLang: 'partiql',
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM "testtable" WHERE "ID" <> :val1 AND "n0" = :val2 AND "n1" IS NOT NULL AND "n2" IN (:val3) AND Contains("s2", :val4)',
        );
        expect(binds).toEqual({
          val1: 100,
          val2: true,
          val3: [1, 2, 3],
          val4: 'test',
        });
      });
      it('With conitions2', () => {
        const schemaRes = db.getSchema({ isDefault: true });

        const { query, binds } = toViewDataQuery({
          tableRes: schemaRes.getChildByName('testtable'),
          conditions: {
            all: [
              {
                fact: 'ID',
                operator: 'notEqual',
                value: '100',
              },
              {
                fact: 'n2',
                operator: 'between',
                value: '1, 2',
              },
              {
                fact: 's2',
                operator: 'like',
                value: 'test',
              },
            ],
          },
          sqlLang: 'partiql',
        });
        expect(eolToSpace(query)).toBe(
          'SELECT * FROM "testtable" WHERE "ID" <> :val1 AND "n2" BETWEEN :val2 AND :val3 AND Contains("s2", :val4)',
        );
        expect(binds).toEqual({
          val1: 100,
          val2: 1,
          val3: 2,
          val4: 'test',
        });
      });
    });
  });
});
