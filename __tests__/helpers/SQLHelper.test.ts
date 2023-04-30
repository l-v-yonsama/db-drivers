import { DbDatabase, getProposals, ProposalKind } from '../../src';
import { loadRes } from '../setup/mysql';

describe('SQLHelper', () => {
  let dbRes: DbDatabase;

  beforeAll(async () => {
    dbRes = await loadRes<DbDatabase>('mysqlDbRes.json');
  });

  describe('getProposals', () => {
    it('should return table proposals', () => {
      const list = getProposals(dbRes, 'SELECT * FROM t', 't');
      const o = list.find((it) => it.label === 'testtable');
      expect(o).not.toBeUndefined();
      expect(o.kind).toBe(ProposalKind.Table);
      expect(o.detail).toEqual(expect.any(String));
    });

    it('should return column proposals', () => {
      const list = getProposals(dbRes, 'SELECT * FROM testtable WHERE d', 'd');
      const d1 = list.find((it) => it.label === 'd1');
      expect(d1).not.toBeUndefined();
      expect(d1.kind).toBe(ProposalKind.Column);
      expect(d1.detail).toEqual(expect.any(String));
    });
  });
});
