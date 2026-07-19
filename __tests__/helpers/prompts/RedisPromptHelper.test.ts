import {
  createRedisSchemaDefinitionsForPrompt,
  RedisDatabase,
} from '../../../src';

describe('RedisPromptHelper', () => {
  describe('createRedisSchemaDefinitionsForPrompt', () => {
    it('returns undefined for an empty array', async () => {
      const promptText = await createRedisSchemaDefinitionsForPrompt({
        db: [],
      });
      expect(promptText).toBeUndefined();
    });

    it('lists DB index and key count, singularizing a single key', async () => {
      const promptText = await createRedisSchemaDefinitionsForPrompt({
        db: [new RedisDatabase('0', 7), new RedisDatabase('3', 1)],
      });

      expect(promptText).toBe('- DB 0: 7 keys\n- DB 3: 1 key');
    });
  });
});
