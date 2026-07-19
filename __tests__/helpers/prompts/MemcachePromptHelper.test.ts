import {
  createMemcacheSchemaDefinitionsForPrompt,
  MemcacheDatabase,
} from '../../../src';

describe('MemcachePromptHelper', () => {
  describe('createMemcacheSchemaDefinitionsForPrompt', () => {
    it('returns undefined for an empty array', async () => {
      const promptText = await createMemcacheSchemaDefinitionsForPrompt({
        db: [],
      });
      expect(promptText).toBeUndefined();
    });

    it('renders the segmented-LRU cache tiers and servers', async () => {
      const db = new MemcacheDatabase('Server');
      db.servers = '127.0.0.1:11211';
      db.hot = 42;
      db.warm = 130;
      db.cold = 850;

      const promptText = await createMemcacheSchemaDefinitionsForPrompt({
        db,
      });

      expect(promptText).toContain('Memcache has no relational schema');
      expect(promptText).toContain('- HOT: 42 keys');
      expect(promptText).toContain('- WARM: 130 keys');
      expect(promptText).toContain('- COLD: 850 keys');
      expect(promptText).toContain('Servers: 127.0.0.1:11211');
    });

    it('joins multiple MemcacheDatabase entries with a blank line', async () => {
      const dbA = new MemcacheDatabase('Server A');
      dbA.servers = 'a:11211';
      dbA.hot = 1;
      dbA.warm = 2;
      dbA.cold = 3;
      const dbB = new MemcacheDatabase('Server B');
      dbB.servers = 'b:11211';
      dbB.hot = 4;
      dbB.warm = 5;
      dbB.cold = 6;

      const promptText = await createMemcacheSchemaDefinitionsForPrompt({
        db: [dbA, dbB],
      });

      expect(promptText).toContain('Servers: a:11211');
      expect(promptText).toContain('Servers: b:11211');
      expect(
        promptText.match(/Memcache has no relational schema/g),
      ).toHaveLength(2);
    });
  });
});
