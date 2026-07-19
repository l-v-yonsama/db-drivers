import {
  Auth0Database,
  AwsDatabase,
  KeycloakDatabase,
  MemcacheDatabase,
  MqttDatabase,
  RdsDatabase,
  RedisDatabase,
} from '../../resource';
import { CreateSchemaDefinitionsForPromptParams } from '../../types';
import { createAuth0SchemaDefinitionsForPrompt } from './Auth0PromptHelper';
import { createAwsSchemaDefinitionsForPrompt } from './AwsPromptHelper';
import { createKeycloakSchemaDefinitionsForPrompt } from './KeycloakPromptHelper';
import { createMemcacheSchemaDefinitionsForPrompt } from './MemcachePromptHelper';
import { createMqttSchemaDefinitionsForPrompt } from './MqttPromptHelper';
import { createRdsSchemaDefinitionsForPrompt } from './RdsPromptHelper';
import { createRedisSchemaDefinitionsForPrompt } from './RedisPromptHelper';

/**
 * Single entry point for MCP tools: dispatches to the vendor-specific
 * schema-prompt renderer based on the runtime type of each element of
 * `db`, so callers don't need to branch on dbType themselves. Elements are
 * grouped by vendor before calling (rather than one call per element) so
 * each vendor's own "0 count" heading etc. stays aggregated across all of
 * that vendor's entries, same as e.g. `createAwsSchemaDefinitionsForPrompt`
 * already does internally for a mixed-`AwsServiceType` array.
 */
export const createSchemaDefinitionsForPrompt = async (
  params: CreateSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const {
    db,
    rdsDriver,
    schemaName,
    tableName,
    resourceName,
    serviceType,
    realmName,
  } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    const results: string[] = [];

    const rdsDbs = databases.filter(
      (it): it is RdsDatabase => it instanceof RdsDatabase,
    );
    if (rdsDbs.length) {
      const t = await createRdsSchemaDefinitionsForPrompt({
        db: rdsDbs,
        rdsDriver,
        schemaName,
        tableName,
      });
      if (t) results.push(t);
    }

    const awsDbs = databases.filter(
      (it): it is AwsDatabase => it instanceof AwsDatabase,
    );
    if (awsDbs.length) {
      const t = await createAwsSchemaDefinitionsForPrompt({
        db: awsDbs,
        resourceName,
        serviceType,
      });
      if (t) results.push(t);
    }

    const auth0Dbs = databases.filter(
      (it): it is Auth0Database => it instanceof Auth0Database,
    );
    if (auth0Dbs.length) {
      const t = await createAuth0SchemaDefinitionsForPrompt({ db: auth0Dbs });
      if (t) results.push(t);
    }

    const keycloakDbs = databases.filter(
      (it): it is KeycloakDatabase => it instanceof KeycloakDatabase,
    );
    if (keycloakDbs.length) {
      const t = await createKeycloakSchemaDefinitionsForPrompt({
        db: keycloakDbs,
        realmName,
      });
      if (t) results.push(t);
    }

    const memcacheDbs = databases.filter(
      (it): it is MemcacheDatabase => it instanceof MemcacheDatabase,
    );
    if (memcacheDbs.length) {
      const t = await createMemcacheSchemaDefinitionsForPrompt({
        db: memcacheDbs,
      });
      if (t) results.push(t);
    }

    const mqttDbs = databases.filter(
      (it): it is MqttDatabase => it instanceof MqttDatabase,
    );
    if (mqttDbs.length) {
      const t = await createMqttSchemaDefinitionsForPrompt({ db: mqttDbs });
      if (t) results.push(t);
    }

    const redisDbs = databases.filter(
      (it): it is RedisDatabase => it instanceof RedisDatabase,
    );
    if (redisDbs.length) {
      const t = await createRedisSchemaDefinitionsForPrompt({ db: redisDbs });
      if (t) results.push(t);
    }

    return results.length > 0 ? results.join('\n\n') : undefined;
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};
