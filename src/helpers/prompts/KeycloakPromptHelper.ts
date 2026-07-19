import { equalsIgnoreCase } from '@l-v-yonsama/rdh';
import { IamRealm, KeycloakDatabase } from '../../resource';
import { CreateKeycloakSchemaDefinitionsForPromptParams } from '../../types';
import { formatResourceGroupHeading } from './promptFormatUtils';

/**
 * Lists the realms of a target Keycloak resource tree, optionally narrowed
 * by an exact-match `realmName` filter. `isDefault`/`numOfUsers`/
 * `numOfGroups` are unconditionally populated on `IamRealm`, so no live
 * driver call is needed here.
 */
export const createKeycloakSchemaDefinitionsForPrompt = async (
  params: CreateKeycloakSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db, realmName } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    if (databases.length === 0) {
      return undefined;
    }

    const realms: IamRealm[] = [];
    databases.forEach((keycloakDb: KeycloakDatabase) => {
      keycloakDb.children
        .filter((it) => (realmName ? equalsIgnoreCase(it.name, realmName) : true))
        .forEach((realm) => realms.push(realm));
    });

    if (realmName && realms.length === 0) {
      return undefined;
    }

    const lines: string[] = [
      formatResourceGroupHeading('Realms', 'realm', realms.length),
    ];
    realms.forEach((realm) => {
      const marker = realm.isDefault ? ' [default]' : '';
      lines.push(
        `- ${realm.name}${marker} (users: ${realm.numOfUsers}, groups: ${realm.numOfGroups})`,
      );
    });

    return lines.join('\n');
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};
