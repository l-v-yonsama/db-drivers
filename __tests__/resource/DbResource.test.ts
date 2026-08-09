import {
  Auth0Database,
  DbCfnStack,
  DbResourceGroup,
  DbSESIdentity,
  fromJson,
  IamClient,
  IamGroup,
  IamOrganization,
  IamRealm,
  IamRole,
  IamUser,
  KeycloakDatabase,
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

    it('restores a DbCfnStack with its attr (including resources) intact', () => {
      const original = new DbCfnStack('OrderProcessingStack', {
        stackStatus: 'CREATE_COMPLETE',
        resources: [
          {
            logicalId: 'OrderQueue',
            physicalId: 'https://sqs.../OrderQueue',
            resourceType: 'AWS::SQS::Queue',
          },
        ],
      });

      const restored = fromJson(JSON.parse(JSON.stringify(original)));

      expect(restored).toBeInstanceOf(DbCfnStack);
      expect((restored as DbCfnStack).attr).toEqual({
        stackStatus: 'CREATE_COMPLETE',
        resources: [
          {
            logicalId: 'OrderQueue',
            physicalId: 'https://sqs.../OrderQueue',
            resourceType: 'AWS::SQS::Queue',
          },
        ],
      });
    });

    describe.each([
      { className: 'KeycloakDatabase', create: () => new KeycloakDatabase('keycloak') },
      { className: 'Auth0Database', create: () => new Auth0Database('auth0') },
      { className: 'IamRealm', create: () => new IamRealm('realm') },
      { className: 'IamClient', create: () => new IamClient('client') },
      { className: 'IamUser', create: () => new IamUser('user') },
      { className: 'IamGroup', create: () => new IamGroup('group') },
      { className: 'IamOrganization', create: () => new IamOrganization('org') },
      { className: 'IamRole', create: () => new IamRole('role') },
      { className: 'DbResourceGroup', create: () => new DbResourceGroup('String params (4)') },
    ])('restores a $className', ({ create }) => {
      it('keeps the same constructor and name', () => {
        const original = create();

        const restored = fromJson(JSON.parse(JSON.stringify(original)));

        expect(restored).toBeInstanceOf(original.constructor);
        expect(restored.name).toBe(original.name);
      });
    });
  });
});
