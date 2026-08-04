import {
  Auth0Database,
  DbSESIdentity,
  fromJson,
  IamGroup,
  IamRealm,
  IamRole,
} from '../../src';

describe('DbResource', () => {
  describe('getProperties', () => {
    it('returns the comment under the "comment" key', () => {
      const db = new Auth0Database('auth0');
      db.comment = 'a comment';

      expect(db.getProperties().comment).toBe('a comment');
    });
  });

  describe.each([
    { className: 'Auth0Database', create: () => new Auth0Database('auth0') },
    { className: 'IamRealm', create: () => new IamRealm('realm') },
  ])('$className', ({ create }) => {
    describe('getGroupByName', () => {
      it('finds a child of type IamGroup by name', () => {
        const db = create();
        const group = new IamGroup('admins');
        db.addChild(group);

        expect(db.getGroupByName('admins')).toBe(group);
      });
    });

    describe('getRoleByName', () => {
      it('finds a child of type IamRole by name', () => {
        const db = create();
        const role = new IamRole('editor');
        db.addChild(role);

        expect(db.getRoleByName('editor')).toBe(role);
      });
    });
  });

  describe('fromJson', () => {
    it('restores a DbSESIdentity with its attr intact', () => {
      const original = new DbSESIdentity('sender@example.com', {
        identityType: 'EmailAddress',
        verificationStatus: 'Success',
      });

      const restored = fromJson(JSON.parse(JSON.stringify(original)));

      expect(restored).toBeInstanceOf(DbSESIdentity);
      expect((restored as DbSESIdentity).attr).toEqual({
        identityType: 'EmailAddress',
        verificationStatus: 'Success',
      });
    });
  });
});
