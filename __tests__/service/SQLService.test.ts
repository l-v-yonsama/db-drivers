import { DbDatabase, DbSchema, SQLService } from '../../src';
import { data as resourceData } from '../data/resource.mysql';

describe('SQLService', () => {
  let defaultSchema: DbSchema;
  let anotherSchema: DbSchema;

  beforeAll(async () => {
    const db = DbDatabase.deserialize(resourceData);
    defaultSchema = db.getSchema({ isDefault: true });
    anotherSchema = db.getSchema({ name: 'oradb' });
  });

  describe('validate on defaultSchema', () => {
    describe('Select statement', () => {
      describe('without alias', () => {
        it('should success', async () => {
          const sql = `SELECT n0,f1,f2,d1 FROM testtable WHERE n2=2 AND s2='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: true,
            message: '',
            result: undefined,
          });
        });

        it('should fail', async () => {
          const sql = `SELECT n0,f1,dummy1,d1 FROM testtable WHERE n2=2 AND dummy2='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: false,
            message: '',
            result: [
              {
                column: 'dummy1',
                table: '',
                type: 'select',
              },
              {
                column: 'dummy2',
                table: '',
                type: 'select',
              },
            ],
          });
        });
      });

      describe('with alias', () => {
        it('should success', async () => {
          const sql = `SELECT T.n0,T.f1,T.f2,T.d1 FROM testtable AS T WHERE T.n2=2 AND T.s2='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: true,
            message: '',
            result: undefined,
          });
        });

        it('should fail', async () => {
          const sql = `SELECT T.n0,T.f1,T.dummy1,T.d1 FROM testtable T WHERE T.n2=2 AND T.dummy2='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: false,
            message: '',
            result: [
              {
                column: 'dummy1',
                table: 'testtable',
                type: 'select',
              },
              {
                column: 'dummy2',
                table: 'testtable',
                type: 'select',
              },
            ],
          });
        });
      });
    });

    describe('Delete statement', () => {
      describe('without alias', () => {
        it('should success', async () => {
          const sql = `DELETE FROM testtable WHERE n2=2 AND s2='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: true,
            message: '',
            result: undefined,
          });
        });

        it('should fail', async () => {
          const sql = `DELETE FROM testtable WHERE n2=2 AND dummy1='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: false,
            message: '',
            result: [
              {
                column: 'dummy1',
                table: '',
                type: 'delete',
              },
            ],
          });
        });
      });

      describe('with alias', () => {
        it('should success', async () => {
          const sql = `DELETE FROM testtable T WHERE T.n2=2 AND T.s2='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: true,
            message: '',
            result: undefined,
          });
        });

        it('should fail', async () => {
          const sql = `DELETE FROM testtable AS T WHERE T.n2=2 AND T.dummy1='s2' `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: false,
            message: '',
            result: [
              {
                column: 'dummy1',
                table: 'testtable',
                type: 'delete',
              },
            ],
          });
        });
      });
    });

    describe('Insert statement', () => {
      describe('without alias', () => {
        it('should success', async () => {
          const sql = `INSERT INTO testtable (n0,n1,d1) VALUES (1,2, '2020-01-01') `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: true,
            message: '',
            result: undefined,
          });
        });

        it('should fail', async () => {
          const sql = `INSERT INTO testtable (n0,n1,dummy1) VALUES (1,2, '2020-01-01') `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: false,
            message: '',
            result: [
              {
                column: 'dummy1',
                table: 'testtable',
                type: 'insert',
              },
            ],
          });
        });
      });

      describe('with alias', () => {
        it('should fail', async () => {
          const sql = `INSERT INTO testtable as T (T.n0,T.n1,T.d1) VALUES (1,2, '2020-01-01') `;
          const res = SQLService.validate(sql, defaultSchema);
          expect(res).toEqual({
            ok: false,
            message: expect.any(String),
            result: undefined,
          });
        });
      });
    });
  });

  describe('validate on anotherSchema', () => {
    it('should success Select statement', async () => {
      const sql = `SELECT ENAME,HIREDATE FROM oradb.EMP WHERE DEPTNO=6 `;
      const res = SQLService.validate(sql, anotherSchema);
      expect(res).toEqual({
        ok: true,
        message: '',
        result: undefined,
      });
    });

    it('should fail Select statement', async () => {
      const sql = `SELECT ENAME,dummy1 FROM oradb.EMP WHERE dummy2=6 `;
      const res = SQLService.validate(sql, anotherSchema);
      expect(res).toEqual({
        ok: false,
        message: '',
        result: [
          {
            column: 'dummy1',
            table: '',
            type: 'select',
          },
          {
            column: 'dummy2',
            table: '',
            type: 'select',
          },
        ],
      });
    });

    it('should success Joined Select statement', async () => {
      const sql = `SELECT E.ENAME,E.HIREDATE
      FROM oradb.EMP AS E
      INNER JOIN DEPT D ON (E.DEPTNO = D.DEPTNO)
      WHERE E.JOB='HR' AND E.DEPTNO=6 `;
      const res = SQLService.validate(sql, anotherSchema);
      expect(res).toEqual({
        ok: true,
        message: '',
        result: undefined,
      });
    });

    it('should fail Joined Select statement', async () => {
      const sql = `SELECT E.ENAME,E.dummy1, dummy2
      FROM oradb.EMP AS E
      INNER JOIN DEPT D ON (E.DEPTNO = D.DEPTNO)
      WHERE E.JOB='HR' AND E.dummy3=6 `;
      const res = SQLService.validate(sql, anotherSchema);
      expect(res).toEqual({
        ok: false,
        message: '',
        result: [
          {
            column: 'dummy1',
            table: 'EMP',
            type: 'select',
          },
          {
            column: 'dummy2',
            table: '',
            type: 'select',
          },
          {
            column: 'dummy3',
            table: 'EMP',
            type: 'select',
          },
        ],
      });
    });
  });
});
