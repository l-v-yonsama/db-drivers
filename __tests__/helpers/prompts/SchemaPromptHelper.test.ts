import {
  Auth0Database,
  AwsDatabase,
  AwsServiceType,
  createSchemaDefinitionsForPrompt,
  DbSubscription,
  IamRealm,
  KeycloakDatabase,
  MemcacheDatabase,
  MqttDatabase,
  RedisDatabase,
} from '../../../src';
import * as SchemaPromptHelperExports from '../../../src';
import { loadMysqlDbFixture } from '../../setup/mysql';

describe('SchemaPromptHelper', () => {
  describe('module exports', () => {
    // Guard against the package barrel (src/index.ts) silently dropping a
    // re-export of a symbol that lives under src/helpers/prompts/.
    it('still exposes every function defined under src/helpers/prompts/', () => {
      const exportedFunctionNames = [
        'createTableDefinitionsForPrompt',
        'createRdsSchemaDefinitionsForPrompt',
        'toCreateTableDDL',
        'toDynamoTableSchemaText',
        'createAwsSchemaDefinitionsForPrompt',
        'createAuth0SchemaDefinitionsForPrompt',
        'createKeycloakSchemaDefinitionsForPrompt',
        'createMemcacheSchemaDefinitionsForPrompt',
        'createMqttSchemaDefinitionsForPrompt',
        'createRedisSchemaDefinitionsForPrompt',
        'createSchemaDefinitionsForPrompt',
      ];

      exportedFunctionNames.forEach((name) => {
        expect(typeof (SchemaPromptHelperExports as any)[name]).toBe(
          'function',
        );
      });
    });
  });

  describe('createSchemaDefinitionsForPrompt', () => {
    it('returns undefined for an empty array', async () => {
      const promptText = await createSchemaDefinitionsForPrompt({ db: [] });
      expect(promptText).toBeUndefined();
    });

    it('routes an RdsDatabase to the RDS renderer', async () => {
      const db = await loadMysqlDbFixture();
      const promptText = await createSchemaDefinitionsForPrompt({
        db,
        tableName: 'DEPT',
      });

      expect(promptText).toContain('CREATE TABLE DEPT');
    });

    it('routes an AwsDatabase to the AWS renderer', async () => {
      const awsDb = new AwsDatabase('S3', AwsServiceType.S3);
      const promptText = await createSchemaDefinitionsForPrompt({ db: awsDb });

      expect(promptText).toContain('-- S3 --');
    });

    it('routes an Auth0Database to the Auth0 renderer', async () => {
      const auth0Db = new Auth0Database('auth0');
      auth0Db.numOfUsers = 2;
      auth0Db.numOfOrganizations = 1;
      const promptText = await createSchemaDefinitionsForPrompt({
        db: auth0Db,
      });

      expect(promptText).toContain('Auth0 has no relational schema');
    });

    it('routes a KeycloakDatabase to the Keycloak renderer, honoring realmName', async () => {
      const keycloakDb = new KeycloakDatabase('Keycloak');
      keycloakDb.addChild(new IamRealm('master'));
      keycloakDb.addChild(new IamRealm('test-realm'));
      const promptText = await createSchemaDefinitionsForPrompt({
        db: keycloakDb,
        realmName: 'master',
      });

      expect(promptText).toContain('--- Realms (1 realm) ---');
      expect(promptText).toContain('- master');
      expect(promptText).not.toContain('test-realm');
    });

    it('routes a MemcacheDatabase to the Memcache renderer', async () => {
      const memcacheDb = new MemcacheDatabase('Server');
      memcacheDb.servers = '127.0.0.1:11211';
      memcacheDb.hot = 1;
      memcacheDb.warm = 2;
      memcacheDb.cold = 3;
      const promptText = await createSchemaDefinitionsForPrompt({
        db: memcacheDb,
      });

      expect(promptText).toContain('Memcache has no relational schema');
    });

    it('routes a MqttDatabase to the Mqtt renderer', async () => {
      const mqttDb = new MqttDatabase('Mqtt');
      mqttDb.addChild(new DbSubscription('sensors/temperature', 1));
      const promptText = await createSchemaDefinitionsForPrompt({
        db: mqttDb,
      });

      expect(promptText).toContain('--- Topic filters (1 topic filter) ---');
      expect(promptText).toContain('sensors/temperature');
    });

    it('routes a RedisDatabase to the Redis renderer', async () => {
      const redisDb = new RedisDatabase('0', 7);
      const promptText = await createSchemaDefinitionsForPrompt({
        db: redisDb,
      });

      expect(promptText).toContain('- DB 0: 7 keys');
    });

    it('joins results across a mixed-vendor array', async () => {
      const redisDb = new RedisDatabase('0', 7);
      const awsDb = new AwsDatabase('S3', AwsServiceType.S3);
      const promptText = await createSchemaDefinitionsForPrompt({
        db: [redisDb, awsDb],
      });

      expect(promptText).toContain('- DB 0: 7 keys');
      expect(promptText).toContain('-- S3 --');
    });
  });
});
