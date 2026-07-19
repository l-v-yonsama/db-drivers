import pluralize from 'pluralize';
import { RedisDatabase } from '../../resource';
import { CreateRedisSchemaDefinitionsForPromptParams } from '../../types';

/**
 * Lists the DB index (logical database number) and key count of a target
 * Redis resource tree. Both are already fully populated on `RedisDatabase`
 * (parsed from `INFO keyspace`), so no live driver call is needed here.
 */
export const createRedisSchemaDefinitionsForPrompt = async (
  params: CreateRedisSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    if (databases.length === 0) {
      return undefined;
    }

    const lines = databases.map(
      (redisDb: RedisDatabase) =>
        `- DB ${redisDb.getDBIndex()}: ${pluralize('key', redisDb.numOfKeys, true)}`,
    );

    return lines.join('\n');
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};
