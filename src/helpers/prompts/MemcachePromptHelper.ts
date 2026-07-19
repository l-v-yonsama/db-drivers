import { MemcacheDatabase } from '../../resource';
import { CreateMemcacheSchemaDefinitionsForPromptParams } from '../../types';

/**
 * Memcache has no relational schema (it's a key-value cache), so this
 * renders the segmented-LRU cache tiers ("generations") the driver already
 * summarizes on the resource tree instead.
 */
export const createMemcacheSchemaDefinitionsForPrompt = async (
  params: CreateMemcacheSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    if (databases.length === 0) {
      return undefined;
    }

    const blocks = databases.map((memcacheDb: MemcacheDatabase) => {
      const lines: string[] = [
        `Memcache has no relational schema. Instead, keys move through Memcached's segmented LRU as they age, landing in one of three cache tiers ("generations"):`,
        `- HOT: ${memcacheDb.hot} keys — most recently written or promoted; least likely to be evicted`,
        `- WARM: ${memcacheDb.warm} keys — accessed at least once since arriving; protected from most eviction`,
        `- COLD: ${memcacheDb.cold} keys — least recently used; first to be evicted under memory pressure`,
        '',
        `Servers: ${memcacheDb.servers}`,
      ];
      return lines.join('\n');
    });

    return blocks.join('\n\n');
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};
