import {
  getProposals,
  getResourcePositions,
  normalizeQuery,
  parseQuery,
  ProposalKind,
  RdsDatabase,
  toViewDataQuery,
} from '../../src';
import { loadRes } from '../setup/mysql';

describe('SQLHelper', () => {
  let db: RdsDatabase;

  beforeAll(async () => {
    db = await loadRes<RdsDatabase>('mysqlDbRes.json');
  });

  describe('getProposals', () => {
    describe('Select statement', () => {
      it('should return reserved word proposals', () => {
        const list = getProposals({
          db: undefined,
          sql: 'SELECT * FROM testtable as tbl WHERE c',
          lastChar: 'c',
          keyword: 'c',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'CURRENT_DATE');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.ReservedWord);
      });

      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'SELECT * FROM t',
          lastChar: 't',
          keyword: 't',
        });
        const o = list.find((it) => it.label === 'testtable');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
        expect(o.detail).toEqual(expect.any(String));
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'SELECT * FROM testtable WHERE d',
          lastChar: 'd',
          keyword: 'd',
        });
        const d1 = list.find((it) => it.label === 'd1');
        expect(d1).not.toBeUndefined();
        expect(d1.kind).toBe(ProposalKind.Column);
        expect(d1.detail).toEqual(expect.any(String));
      });

      it('should return column proposals2', () => {
        const list = getProposals({
          db,
          sql: 'SELECT * FROM testtable as tbl WHERE tbl.d',
          lastChar: 'd',
          keyword: 'd',
          parentWord: 'tbl',
        });
        const d1 = list.find((it) => it.label === 'd1');
        expect(d1).not.toBeUndefined();
        expect(d1.kind).toBe(ProposalKind.Column);
        expect(d1.detail).toEqual(expect.any(String));
      });

      it('should return column proposals3', () => {
        const list = getProposals({
          db,
          sql:
            'SELECT * FROM DEPT as d ' +
            'inner join EMP e ON (d.DEPTNO = e.DEPTNO) ' +
            'WHERE d.l',
          lastChar: 'l',
          keyword: 'l',
          parentWord: 'd',
        });
        const loc = list.find((it) => it.label === 'LOC');
        expect(loc).not.toBeUndefined();
        expect(loc.kind).toBe(ProposalKind.Column);
      });

      it('should return column proposals4', () => {
        const list = getProposals({
          db,
          sql:
            'SELECT * FROM DEPT as d ' +
            'inner join EMP e ON (d.DEPTNO = e.DEPTNO) ' +
            'WHERE e.em',
          lastChar: 'm',
          keyword: 'em',
          parentWord: 'e',
        });
        const loc = list.find((it) => it.label === 'EMPNO');
        expect(loc).not.toBeUndefined();
        expect(loc.kind).toBe(ProposalKind.Column);
      });
    });

    describe('Insert statement', () => {
      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'INSERT INTO ',
          lastChar: ' ',
          keyword: 'INTO',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'EMP');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return table proposals2', () => {
        const list = getProposals({
          db,
          sql: 'INSERT INTO D',
          lastChar: 'D',
          keyword: 'D',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'INSERT INTO DEPT ( DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });
    });

    describe('Update statement', () => {
      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE ',
          lastChar: ' ',
          keyword: 'UPDATE',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'EMP');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return table proposals2', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE D',
          lastChar: 'D',
          keyword: 'D',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE DEPT SET DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });

      it('should return column proposals2', () => {
        const list = getProposals({
          db,
          sql: 'UPDATE DEPT as d SET d.DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: 'd',
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });
    });

    describe('Delete statement', () => {
      it('should return reserved word proposals', () => {
        const list = getProposals({
          db,
          sql: 'DELETE ',
          lastChar: ' ',
          keyword: 'DELETE',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'FROM');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.ReservedWord);
      });

      it('should return table proposals', () => {
        const list = getProposals({
          db,
          sql: 'DELETE FROM ',
          lastChar: ' ',
          keyword: 'FROM',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return table proposals2', () => {
        const list = getProposals({
          db,
          sql: 'DELETE FROM D',
          lastChar: 'D',
          keyword: 'D',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPT');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Table);
      });

      it('should return column proposals', () => {
        const list = getProposals({
          db,
          sql: 'DELETE FROM DEPT WHERE DEPT',
          lastChar: 'T',
          keyword: 'DEPT',
          parentWord: undefined,
        });
        const o = list.find((it) => it.label === 'DEPTNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });

      it('should return column proposals2', () => {
        const list = getProposals({
          db,
          sql:
            'DELETE FROM e, d ' +
            'USING EMP AS e INNER JOIN DEPT AS d ' +
            'ON e.DEPT_NO = d.DEPT_NO ' +
            'WHERE e.EM',
          lastChar: 'M',
          keyword: 'EM',
          parentWord: 'e',
        });
        const o = list.find((it) => it.label === 'EMPNO');
        expect(o).not.toBeUndefined();
        expect(o.kind).toBe(ProposalKind.Column);
      });
    });
  });

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

      it('transform a named query to a standard positioned parameters query2', () => {
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

      it('should not be error too, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '# where ID > :minId',
          toPositionedParameter: true,
        });

        expect(query).toBe('select ID, n0,n1,n2 from testtable \n');
        expect(binds).toEqual([]);
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
    });
  });

  describe('parseQuery', () => {
    it('Calculate timestamp', () => {
      const sql =
        'select 1 from hoge where a_timestamp >= currenttimestamp - interval 1 hour';
      const ast = parseQuery(sql);
      expect(ast).not.toBeUndefined();
    });
    it('Limit n1,n2', () => {
      const sql = 'select 1 from hoge LIMIT 1, 20';
      const ast = parseQuery(sql);
      expect(ast).not.toBeUndefined();
    });
  });

  describe('getResourcePositions', () => {
    it('should return table and column positions', () => {
      const sql =
        'select n1,n2, a.ID, note from testtable a inner join diff b on (a.id=b.id) where a_timestamp >= currenttimestamp - interval 1 hour';
      const positions = getResourcePositions({ sql, db });

      const pos = positions.find(
        (it) => it.kind === ProposalKind.Table && it.name === 'testtable',
      );
      expect(pos).not.toBeUndefined();
      expect(pos).toEqual({
        kind: 1,
        name: 'testtable',
        comment: 'table with various data types',
        offset: 30,
        length: 9,
      });
      const pos2 = positions.find(
        (it) => it.kind === ProposalKind.Column && it.name === 'n1',
      );
      expect(pos2).toEqual({
        kind: 2,
        name: 'n1',
        comment: 'MAX 127',
        offset: 7,
        length: 2,
      });
    });
    it('should return empty array', () => {
      const sql = 'select 1';
      const positions = getResourcePositions({ sql, db });

      expect(positions).toEqual([]);
    });
  });

  describe('toViewDataQuery', () => {
    it('Simple (no conitions)', () => {
      const schemaRes = db.getSchema({ isDefault: true });
      const { query, binds } = toViewDataQuery({
        tableRes: schemaRes.getChildByName('testtable'),
        schemaName: schemaRes.name,
      });
      expect(query).toBe('SELECT * FROM testdb.testtable');
      expect(binds).toEqual([]);
    });
    it('With conitions', () => {
      const schemaRes = db.getSchema({ isDefault: true });
      const { query, binds } = toViewDataQuery({
        tableRes: schemaRes.getChildByName('testtable'),
        schemaName: schemaRes.name,
        conditions: {
          andOr: 'and',
          items: [
            {
              column: 'ID',
              operator: 'notEqual',
              value: '100',
            },
            {
              column: 'n0',
              operator: 'equal',
              value: '1',
            },
            {
              column: 'n1',
              operator: 'isNotNull',
            },
            {
              column: 'n2',
              operator: 'in',
              values: ['1', '2', '3'],
            },
            {
              column: 'd1',
              operator: 'in',
              values: ['2020-01-01', 'today'],
            },
            {
              column: 'd3',
              operator: 'lessThan',
              value: 'now',
            },
          ],
        },
      });
      expect(query).toBe(
        'SELECT * FROM testdb.testtable WHERE ID <> ? AND n0 = ? AND n1 IS NOT NULL AND n2 IN  (? ,? ,? ) AND d1 IN  (? ,? ) AND d3 < ?',
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
    it('With conitions2', () => {
      const schemaRes = db.getSchema({ isDefault: true });
      const { query, binds } = toViewDataQuery({
        tableRes: schemaRes.getChildByName('testtable'),
        schemaName: schemaRes.name,
        toPositionedParameter: true,
        conditions: {
          andOr: 'or',
          items: [
            {
              column: 'n0',
              operator: 'isNull',
            },
            {
              column: 'd2',
              operator: 'greaterThan',
              value: '13:24:56',
            },
            {
              column: 's2',
              operator: 'like',
              value: 't%st',
            },
          ],
        },
      });
      expect(query).toBe(
        'SELECT * FROM testdb.testtable WHERE n0 IS NULL OR d2 > $1 OR s2 LIKE $2',
      );
      expect(binds).toEqual(['13:24:56', 't%st']);
    });
  });
});
