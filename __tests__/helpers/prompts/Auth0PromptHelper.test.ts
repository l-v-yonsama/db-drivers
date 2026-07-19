import {
  Auth0Database,
  createAuth0SchemaDefinitionsForPrompt,
  IamClient,
  IamOrganization,
} from '../../../src';

describe('Auth0PromptHelper', () => {
  describe('createAuth0SchemaDefinitionsForPrompt', () => {
    it('returns undefined for an empty array', async () => {
      const promptText = await createAuth0SchemaDefinitionsForPrompt({
        db: [],
      });
      expect(promptText).toBeUndefined();
    });

    it('renders just the notice and counts when no organization/client children are loaded', async () => {
      const db = new Auth0Database('auth0');
      db.numOfUsers = 2;
      db.numOfOrganizations = 1;

      const promptText = await createAuth0SchemaDefinitionsForPrompt({ db });

      expect(promptText).toBe(
        'Auth0 has no relational schema. This connection has 2 users and 1 organization.',
      );
    });

    it('uses singular wording for a single user and zero organizations', async () => {
      const db = new Auth0Database('auth0');
      db.numOfUsers = 1;
      db.numOfOrganizations = 0;

      const promptText = await createAuth0SchemaDefinitionsForPrompt({ db });

      expect(promptText).toContain(
        'This connection has 1 user and 0 organizations.',
      );
    });

    it('adds Organizations/Clients sections when those children are present', async () => {
      const db = new Auth0Database('auth0');
      db.numOfUsers = 2;
      db.numOfOrganizations = 1;

      const org = new IamOrganization('acme-corp');
      org.comment = 'Acme Corp';
      db.addChild(org);

      const client = new IamClient('my-spa');
      client.appType = 'spa';
      db.addChild(client);

      const promptText = await createAuth0SchemaDefinitionsForPrompt({ db });

      expect(promptText).toContain('--- Organizations (1 organization) ---');
      expect(promptText).toContain('- acme-corp (Acme Corp)');
      expect(promptText).toContain('--- Clients (1 client) ---');
      expect(promptText).toContain('- my-spa (type: spa)');
    });

    it('joins multiple Auth0Database entries with a blank line', async () => {
      const dbA = new Auth0Database('tenant-a');
      dbA.numOfUsers = 1;
      dbA.numOfOrganizations = 0;
      const dbB = new Auth0Database('tenant-b');
      dbB.numOfUsers = 3;
      dbB.numOfOrganizations = 2;

      const promptText = await createAuth0SchemaDefinitionsForPrompt({
        db: [dbA, dbB],
      });

      expect(promptText).toContain(
        'This connection has 1 user and 0 organizations.',
      );
      expect(promptText).toContain(
        'This connection has 3 users and 2 organizations.',
      );
      expect(promptText.split('\n\n')).toHaveLength(2);
    });
  });
});
