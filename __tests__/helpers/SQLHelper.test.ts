import {
  getProposals,
  normalizeQuery,
  ProposalKind,
  RdsDatabase,
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
          query: 'select * from xxx where id = :id AND other=:other + :id',
          toPositionedParameter: true,
          bindParams: { id: 'myId', other: 42 },
        });

        expect(query).toBe('select * from xxx where id = $1 AND other=$2 + $1');
        expect(binds).toEqual(['myId', 42]);
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

        expect(query).toBe(
          'select ID, n0,n1,n2 from testtable \n-- where ID > :minId',
        );
        expect(binds).toEqual([]);
      });

      it('should not be error too, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '# where ID > :minId',
          toPositionedParameter: true,
        });

        expect(query).toBe(
          'select ID, n0,n1,n2 from testtable \n# where ID > :minId',
        );
        expect(binds).toEqual([]);
      });
    });

    describe('Simple 2Way-SQL', () => {
      const sqlStatement =
        'select * from xxx ' +
        'where id = /*id*/120 AND other=/* other */50 + /* id */120 ' +
        'ORDER BY /*$orderByColumn*/ ' +
        'LIMIT /*$limit*/ OFFSET /*$offset*/';

      it('transform a named query to a standard positioned parameters query', () => {
        const { query, binds } = normalizeQuery({
          query: sqlStatement,
          toPositionedParameter: true,
          bindParams: {
            id: 'myId',
            other: 42,
            orderByColumn: 'id desc',
            limit: 10,
            offset: 20,
          },
        });

        expect(query).toBe(
          'select * from xxx ' +
            'where id = $1 AND other=$2 + $1 ' +
            'ORDER BY id desc ' +
            'LIMIT 10 OFFSET 20',
        );
        expect(binds).toEqual(['myId', 42]);
      });

      it('IN clause', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where deleted = /* is_deleted */FALSE AND id in /*ids*/(1, 2)',
          toPositionedParameter: true,
          bindParams: { is_deleted: false, ids: [4, 5, 6] },
        });

        expect(query).toBe(
          'select * from xxx where deleted = $1 AND id in ($2,$3,$4)',
        );
        expect(binds).toEqual([false, 4, 5, 6]);
      });

      it('IN null clause', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where deleted = /* isDeleted */FALSE AND id in /*ids*/(1, 2)',
          toPositionedParameter: true,
          bindParams: { isDeleted: false, ids: [] },
        });

        expect(query).toBe(
          'select * from xxx where deleted = $1 AND id in ( null )',
        );
        expect(binds).toEqual([false]);
      });

      it('should throw error', () => {
        expect(() =>
          normalizeQuery({
            query: sqlStatement,
            toPositionedParameter: true,
            bindParams: {
              isDelete: false,
              other: 43,
              offset: 9,
            },
          }),
        ).toThrow('Missing bind parameters [id,orderByColumn,limit]');
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

      it('should not be error, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '-- where ID > :minId',
        });

        expect(query).toBe(
          'select ID, n0,n1,n2 from testtable \n-- where ID > :minId',
        );
        expect(binds).toEqual([]);
      });

      it('should not be error too, in a comment line', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select ID, n0,n1,n2 from testtable \n' + '# where ID > :minId',
        });

        expect(query).toBe(
          'select ID, n0,n1,n2 from testtable \n# where ID > :minId',
        );
        expect(binds).toEqual([]);
      });
    });

    describe('Simple 2Way-SQL to simple query', () => {
      const sqlStatement =
        'select * from xxx ' +
        'where id = /*id*/120 AND other=/* other */50 + /* id */120 ' +
        'ORDER BY /*$orderByColumn*/ ' +
        'LIMIT /*$limit*/ OFFSET /*$offset*/';

      it('transform a named query to a simple query', () => {
        const { query, binds } = normalizeQuery({
          query: sqlStatement,
          bindParams: {
            id: 'myId',
            other: 42,
            orderByColumn: 'id desc',
            limit: 10,
            offset: 20,
          },
        });

        expect(query).toBe(
          'select * from xxx ' +
            'where id = ? AND other=? + ? ' +
            'ORDER BY id desc ' +
            'LIMIT 10 OFFSET 20',
        );
        expect(binds).toEqual(['myId', 42, 'myId']);
      });

      it('IN clause', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where deleted = /* is_deleted */FALSE AND id in /*ids*/(1, 2)',
          bindParams: { is_deleted: false, ids: [4, 5, 6] },
        });

        expect(query).toBe(
          'select * from xxx where deleted = ? AND id in (?,?,?)',
        );
        expect(binds).toEqual([false, 4, 5, 6]);
      });

      it('IN null clause', () => {
        const { query, binds } = normalizeQuery({
          query:
            'select * from xxx where deleted = /* isDeleted */FALSE AND id in /*ids*/(1, 2)',
          toPositionedParameter: true,
          bindParams: { isDeleted: false, ids: [] },
        });

        expect(query).toBe(
          'select * from xxx where deleted = $1 AND id in ( null )',
        );
        expect(binds).toEqual([false]);
      });

      it('should throw error', () => {
        expect(() =>
          normalizeQuery({
            query: sqlStatement,
            toPositionedParameter: true,
            bindParams: {
              isDelete: false,
              other: 43,
              offset: 9,
            },
          }),
        ).toThrow('Missing bind parameters [id,orderByColumn,limit]');
      });
    });
  });
});
