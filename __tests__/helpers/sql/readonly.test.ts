import { isReadOnlyQuery } from '../../../src';

describe('SQLHelper', () => {
  describe('isReadOnlyQuery', () => {
    it('returns true for select', () => {
      expect(isReadOnlyQuery('select * from hoge')).toBe(true);
    });
    it('returns true for show', () => {
      expect(isReadOnlyQuery('show full processlist')).toBe(true);
    });
    it('returns false for insert', () => {
      expect(isReadOnlyQuery('insert into hoge (a) values (1)')).toBe(false);
    });
    it('returns false for update', () => {
      expect(isReadOnlyQuery('update hoge set a = 1 where id = 1')).toBe(
        false,
      );
    });
    it('returns false for delete', () => {
      expect(isReadOnlyQuery('delete from hoge where id = 1')).toBe(false);
    });
    it('returns false for truncate table', () => {
      expect(isReadOnlyQuery('truncate table hoge')).toBe(false);
    });
    it('returns false for a create table (DDL)', () => {
      expect(isReadOnlyQuery('create table hoge (id int)')).toBe(false);
    });
    describe('SQLite PRAGMA', () => {
      it('returns true for a PRAGMA read', () => {
        expect(isReadOnlyQuery('pragma table_info(hoge)')).toBe(true);
      });
      it('returns false for a PRAGMA assignment', () => {
        expect(isReadOnlyQuery('pragma foreign_keys = ON')).toBe(false);
      });
    });
  });
});
