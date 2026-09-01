import { normalizeQuery } from '../../../src';

describe('SQLHelper', () => {
  describe('normalizeQuery', () => {
    describe('Named query to positioned parameter query', () => {
      it('transform a named query to a standard positioned parameters query', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx /* \na\nbc */where id = :id AND other=:other + :id',
          toPositionedParameter: true,
          bindParams: { id: 'myId', other: 42 },
        });

        expect(query).toBe('select * from xxx where id = $1 AND other=$2 + $1');
        expect(binds).toEqual(['myId', 42]);
      });

      it('transform a named query to a standard positioned parameters query2(for PostgreSQL)', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where id IN (:ids) AND other IN ( :others )',
          toPositionedParameter: true,
          bindParams: { ids: ['myId1', 'myId2', 'myId3'], others: [42] },
        });

        expect(query).toBe(
          'select * from xxx where id IN ($1,$2,$3) AND other IN ( $4 )',
        );
        expect(binds).toEqual(['myId1', 'myId2', 'myId3', 42]);
      });

      it('transform a named query to a standard positioned parameters query3(for SQL Server)', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where id IN (:ids) AND other IN ( :others )',
          toPositionedParameter: true,
          toPositionalCharacter: '@', // for SQL Server
          bindParams: { ids: ['myId1', 'myId2', 'myId3'], others: [42] },
        });

        expect(query).toBe(
          'select * from xxx where id IN (@1,@2,@3) AND other IN ( @4 )',
        );
        expect(binds).toEqual(['myId1', 'myId2', 'myId3', 42]);
      });

      it('should be ignored 3rd parameter', () => {
        const { query, binds } = normalizeQuery({
          query: 'select * from xxx where id = :id AND other=:other + :id',
          toPositionedParameter: true,
          bindParams: { id: 'myId', other: 42, theOther: 43 },
        });

        expect(query).toBe('select * from xxx where id = $1 AND other=$2 + $1');
        expect(binds).toEqual(['myId', 42]);
      });

      it('should throw error', () => {
        expect(() =>
          normalizeQuery({
            query: 'select * from xxx where id = :id AND other=:other + :id',
            toPositionedParameter: true,
            bindParams: { id: 'myId', theOther: 43 },
          }),
        ).toThrow('Missing bind parameter [other]');
      });

      it('should not be error, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '-- where ID > :minId',
          toPositionedParameter: true,
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      it('converts a live (non-comment) marker to positional syntax without throwing when bindParams is omitted entirely', () => {
        expect(() =>
          normalizeQuery({
            query: 'select * from xxx where id = :id',
            toPositionedParameter: true,
          }),
        ).not.toThrow();

        const { query } = normalizeQuery({
          query: 'select * from xxx where id = :id',
          toPositionedParameter: true,
        });
        expect(query).toBe('select * from xxx where id = $1');
      });

      it('should not be error too, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '# where ID > :minId',
          toPositionedParameter: true,
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      describe('Do not misinterpret colons inside quotes as bind variables', () => {
        it('Case with multiple colons inside quotes (mi, ss)', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp('2025-04-26 05:48:50.000', 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            toPositionedParameter: true,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });

        it('Case with mixed single and double quotes', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp("2025-04-26 05:48:50.000", 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            toPositionedParameter: true,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });
        it('Case where colons outside quotes are recognized as bind variables', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw WHERE id = :id AND data_tm >= '2025-04-26 05:48:50.000`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            toPositionedParameter: true,
            bindParams: { id: 123 },
          });

          expect(query).toBe(SQL.replace(':id', '$1'));
          expect(binds).toEqual([123]);
        });
      });
    });

    describe('Named query to simple query', () => {
      it('transform a named query to a simple query', () => {
        const { query, binds } = normalizeQuery({
          query: 'select * from xxx where id = :id AND other=:other + :id',
          bindParams: { id: 'myId', other: 42 },
        });

        expect(query).toBe('select * from xxx where id = ? AND other=? + ?');
        expect(binds).toEqual(['myId', 42, 'myId']);
      });

      it('transform a named query to a simple query2', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where id IN (:ids) AND other= IN ( :others )',
          bindParams: { ids: ['myId1', 'myId2', 'myId3'], others: [42] },
        });

        expect(query).toBe(
          'select * from xxx where id IN (?,?,?) AND other= IN ( ? )',
        );
        expect(binds).toEqual(['myId1', 'myId2', 'myId3', 42]);
      });

      it('should be ignored 3rd parameter', () => {
        const { query, binds } = normalizeQuery({
          query: 'select * from xxx where id = :id AND other=:other + :id',
          bindParams: { id: 'myId', other: 42, theOther: 43 },
        });

        expect(query).toBe('select * from xxx where id = ? AND other=? + ?');
        expect(binds).toEqual(['myId', 42, 'myId']);
      });

      it('should throw error', () => {
        expect(() =>
          normalizeQuery({
            query: 'select * from xxx where id = :id AND other=:other + :id',
            toPositionedParameter: true,
            bindParams: { id: 'myId', theOther: 43 },
          }),
        ).toThrow('Missing bind parameter [other]');
      });

      it('should not be error, in a comment line1', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '-- where ID > :minId',
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      // Regression: same bug as the positioned-parameters case above, in this path's own (separate) unconditional `bindParams[word]` read.
      it('converts a live (non-comment) marker to `?` without throwing when bindParams is omitted entirely', () => {
        const { query, binds } = normalizeQuery({
          query: 'select * from xxx where id = :id',
        });

        expect(query).toBe('select * from xxx where id = ?');
        expect(binds).toEqual([]);
      });

      it('should not be error, in a comment line2', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + 'where n1=3 -- n1 > :n1',
        });

        expect(query).toBe(
          'select ID, n0,n1,n2 from testtable \n' + 'where n1=3 ',
        );
        expect(binds).toEqual([]);
      });

      it('should not be error, in a comment line3', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '# where ID > :minId',
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
      });

      it(`should not be error, in a time format's colon`, () => {
        const { query, binds } = normalizeQuery({
          query: `select ID, n0,n1,n2 from testtable WHERE update_date >= ('2020-05-05 14:23:23' - interval 30 day)`,
        });

        expect(query).toBe(
          `select ID, n0,n1,n2 from testtable WHERE update_date >= ('2020-05-05 14:23:23' - interval 30 day)`,
        );
        expect(binds).toEqual([]);
      });

      it(`should not be error, like bind comment`, () => {
        const { query, binds } = normalizeQuery({
          query: `select ID FROM EMP where schema IN (20) -- (<10:Z1, 15:Z2>) \r\nORDER BY ID`,
        });

        expect(query).toBe(
          `select ID FROM EMP where schema IN (20) \nORDER BY ID`,
        );
        expect(binds).toEqual([]);
      });

      describe('Do not misinterpret colons inside quotes as bind variables', () => {
        it('Case with multiple colons inside quotes (mi, ss)', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp('2025-04-26 05:48:50.000', 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });

        it('Case with mixed single and double quotes', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw
  WHERE data_tm >= (to_timestamp("2025-04-26 05:48:50.000", 'yyyy-mm-dd hh24:mi:ss.ms') - INTERVAL '6 hours')`;
          const { query, binds } = normalizeQuery({
            query: SQL,
          });

          expect(query).toBe(SQL);
          expect(binds).toEqual([]);
        });
        it('Case where colons outside quotes are recognized as bind variables', () => {
          const SQL = `SELECT * FROM tn_h_zs_raw WHERE id = :id AND data_tm >= '2025-04-26 05:48:50.000`;
          const { query, binds } = normalizeQuery({
            query: SQL,
            bindParams: { id: 123 },
          });

          expect(query).toBe(SQL.replace(':id', '?'));
          expect(binds).toEqual([123]);
        });
      });
    });
  });
});
