import { GeneralColumnType } from '@l-v-yonsama/rdh';
import {
  Auth0Database,
  AwsDatabase,
  AwsServiceType,
  DbCfnStack,
  DbColumn,
  DbConnection,
  DbDynamoTable,
  DbDynamoTableColumn,
  DbKey,
  DbLogGroup,
  DbLogStream,
  DbResourceGroup,
  DbS3Bucket,
  DbS3Owner,
  DbSchema,
  DbSecretsManagerSecret,
  DbSESIdentity,
  DbSQSQueue,
  DbSsmParameter,
  DbSubscription,
  DbTable,
  fromJson,
  IamClient,
  IamGroup,
  IamOrganization,
  IamRealm,
  IamRole,
  IamUser,
  KeycloakDatabase,
  MemcacheDatabase,
  MqttDatabase,
  RdsDatabase,
  RedisDatabase,
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

    // Covers every ResourceType that fromJson() is expected to restore (all of them except IamSession - see the dedicated "IamSession" test below).
    describe.each([
      {
        className: 'DbConnection',
        create: () => new DbConnection({ name: 'conn', dbType: 'MySQL' }),
      },
      { className: 'RdsDatabase', create: () => new RdsDatabase('rds') },
      {
        className: 'AwsDatabase',
        create: () => new AwsDatabase('aws', AwsServiceType.S3),
      },
      {
        className: 'RedisDatabase',
        create: () => new RedisDatabase('0', 3),
      },
      {
        className: 'MemcacheDatabase',
        create: () => new MemcacheDatabase('memcache'),
      },
      { className: 'MqttDatabase', create: () => new MqttDatabase('mqtt') },
      {
        className: 'DbSubscription',
        create: () => new DbSubscription('topic/#', 1),
      },
      { className: 'DbSchema', create: () => new DbSchema('public') },
      {
        className: 'DbTable',
        create: () => new DbTable('users', 'TABLE', 'a table'),
      },
      {
        className: 'DbColumn',
        create: () =>
          new DbColumn('id', GeneralColumnType.INTEGER, { key: 'PRI' }),
      },
      {
        className: 'DbKey',
        create: () =>
          new DbKey('session:1', { type: 'string', ttl: 60 } as any),
      },
      {
        className: 'DbS3Bucket',
        create: () => new DbS3Bucket('my-bucket', new Date('2024-01-01')),
      },
      {
        className: 'DbSQSQueue',
        create: () =>
          new DbSQSQueue(
            'my-queue',
            'https://sqs.example.com/my-queue',
            {} as any,
          ),
      },
      {
        className: 'DbS3Owner',
        create: () => new DbS3Owner('owner-id', 'owner-name'),
      },
      {
        className: 'DbLogGroup',
        create: () => new DbLogGroup('/aws/lambda/fn', {}),
      },
      {
        className: 'DbLogStream',
        create: () =>
          new DbLogStream('stream-1', {
            creationTime: new Date('2024-01-01'),
            firstEventTimestamp: new Date('2024-01-01'),
            lastEventTimestamp: new Date('2024-01-02'),
            lastIngestionTime: new Date('2024-01-02'),
          }),
      },
      {
        className: 'DbDynamoTable',
        create: () => new DbDynamoTable('orders', { lsi: [], gsi: [] } as any),
      },
      {
        className: 'DbDynamoTableColumn',
        create: () => new DbDynamoTableColumn('pk', 'S', true, false),
      },
      {
        className: 'DbSsmParameter',
        create: () => new DbSsmParameter('/app/config', {} as any),
      },
      {
        className: 'DbSecretsManagerSecret',
        create: () => new DbSecretsManagerSecret('my-secret', {} as any),
      },
      {
        className: 'DbResourceGroup',
        create: () => new DbResourceGroup('String params (4)'),
      },
      {
        className: 'KeycloakDatabase',
        create: () => new KeycloakDatabase('keycloak'),
      },
      { className: 'Auth0Database', create: () => new Auth0Database('auth0') },
      { className: 'IamRealm', create: () => new IamRealm('realm') },
      { className: 'IamClient', create: () => new IamClient('client') },
      { className: 'IamUser', create: () => new IamUser('user') },
      { className: 'IamGroup', create: () => new IamGroup('group') },
      {
        className: 'IamOrganization',
        create: () => new IamOrganization('org'),
      },
      { className: 'IamRole', create: () => new IamRole('role') },
    ])('restores a $className', ({ create }) => {
      it('keeps the same constructor, name, id, comment, and meta', () => {
        const original = create();
        original.comment = 'a comment';
        original.meta = { extra: 'value' };

        const restored = fromJson(JSON.parse(JSON.stringify(original)));

        expect(restored).toBeInstanceOf(original.constructor);
        expect(restored.name).toBe(original.name);
        expect(restored.id).toBe(original.id);
        expect(restored.comment).toBe('a comment');
        expect(restored.meta).toEqual({ extra: 'value' });
      });
    });

    it("recursively restores nested children, preserving each level's class", () => {
      const original = new RdsDatabase('orders-db');
      const schema = original.addChild(new DbSchema('public'));
      const table = schema.addChild(new DbTable('orders', 'TABLE'));
      table.addChild(
        new DbColumn('id', GeneralColumnType.INTEGER, { key: 'PRI' }),
      );

      const restored = fromJson(
        JSON.parse(JSON.stringify(original)),
      ) as RdsDatabase;

      expect(restored).toBeInstanceOf(RdsDatabase);
      expect(restored.children).toHaveLength(1);

      const restoredSchema = restored.children[0];
      expect(restoredSchema).toBeInstanceOf(DbSchema);
      expect(restoredSchema.name).toBe('public');
      expect(restoredSchema.children).toHaveLength(1);

      const restoredTable = restoredSchema.children[0];
      expect(restoredTable).toBeInstanceOf(DbTable);
      expect(restoredTable.name).toBe('orders');
      expect(restoredTable.children).toHaveLength(1);

      const restoredColumn = restoredTable.children[0];
      expect(restoredColumn).toBeInstanceOf(DbColumn);
      expect(restoredColumn.name).toBe('id');
    });

    it('throws for IamSession, which is a scan-target discriminant with no backing DbResource', () => {
      // IamSession has no DbResource subclass (see ScanParams.ts / the comment in fromJson()), so there is nothing a real instance's resourceType could ever be - a plain object stands in for what fromJson() would receive if this ever happened.
      const fakeJson = { resourceType: 'IamSession', name: 'session' } as any;

      expect(() => fromJson(fakeJson)).toThrow(
        'IamSession is not a DbResource node and cannot be restored via fromJson.',
      );
    });
  });
});
