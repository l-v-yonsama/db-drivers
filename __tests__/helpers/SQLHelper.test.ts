import { DbDatabase, getProposals, ProposalKind } from '../../src';
import { loadRes } from '../setup/mysql';

describe('SQLHelper', () => {
  let db: DbDatabase;

  beforeAll(async () => {
    db = await loadRes<DbDatabase>('mysqlDbRes.json');
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
});
