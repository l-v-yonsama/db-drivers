import {
  createKeycloakSchemaDefinitionsForPrompt,
  IamRealm,
  KeycloakDatabase,
} from '../../../src';

describe('KeycloakPromptHelper', () => {
  describe('createKeycloakSchemaDefinitionsForPrompt', () => {
    it('returns undefined for an empty array', async () => {
      const promptText = await createKeycloakSchemaDefinitionsForPrompt({
        db: [],
      });
      expect(promptText).toBeUndefined();
    });

    it('lists realms with a default marker and user/group counts', async () => {
      const db = new KeycloakDatabase('Keycloak');
      const master = new IamRealm('master');
      master.isDefault = true;
      master.numOfUsers = 1;
      master.numOfGroups = 0;
      db.addChild(master);

      const other = new IamRealm('test-realm-99');
      other.numOfUsers = 12;
      other.numOfGroups = 3;
      db.addChild(other);

      const promptText = await createKeycloakSchemaDefinitionsForPrompt({
        db,
      });

      expect(promptText).toContain('--- Realms (2 realms) ---');
      expect(promptText).toContain(
        '- master [default] (users: 1, groups: 0)',
      );
      expect(promptText).toContain('- test-realm-99 (users: 12, groups: 3)');
    });

    it('filters by realmName case-insensitively', async () => {
      const db = new KeycloakDatabase('Keycloak');
      db.addChild(new IamRealm('master'));
      db.addChild(new IamRealm('test-realm'));

      const promptText = await createKeycloakSchemaDefinitionsForPrompt({
        db,
        realmName: 'MASTER',
      });

      expect(promptText).toContain('--- Realms (1 realm) ---');
      expect(promptText).toContain('- master');
      expect(promptText).not.toContain('test-realm');
    });

    it('returns undefined when realmName matches nothing', async () => {
      const db = new KeycloakDatabase('Keycloak');
      db.addChild(new IamRealm('master'));

      const promptText = await createKeycloakSchemaDefinitionsForPrompt({
        db,
        realmName: 'no-such-realm',
      });

      expect(promptText).toBeUndefined();
    });

    it('renders a "(0 realms)" heading rather than undefined when there is no filter and no realms exist', async () => {
      const db = new KeycloakDatabase('Keycloak');

      const promptText = await createKeycloakSchemaDefinitionsForPrompt({
        db,
      });

      expect(promptText).toContain('--- Realms (0 realms) ---');
    });
  });
});
