import pluralize from 'pluralize';
import { Auth0Database, IamClient, IamOrganization } from '../../resource';
import { CreateAuth0SchemaDefinitionsForPromptParams } from '../../types';
import { formatResourceGroupHeading } from './promptFormatUtils';

/** Auth0 has no relational schema (it's an identity provider, not a database), so this renders a summary of its IAM entities instead. */
export const createAuth0SchemaDefinitionsForPrompt = async (
  params: CreateAuth0SchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    if (databases.length === 0) {
      return undefined;
    }

    const blocks = databases.map((auth0Db: Auth0Database) => {
      const lines: string[] = [
        `Auth0 has no relational schema. This connection has ${pluralize(
          'user',
          auth0Db.numOfUsers,
          true,
        )} and ${pluralize('organization', auth0Db.numOfOrganizations, true)}.`,
      ];

      const organizations = auth0Db.children.filter(
        (it): it is IamOrganization => it instanceof IamOrganization,
      );
      if (organizations.length > 0) {
        lines.push('');
        lines.push(
          formatResourceGroupHeading(
            'Organizations',
            'organization',
            organizations.length,
          ),
        );
        organizations.forEach((org) => {
          lines.push(`- ${org.name}${org.comment ? ` (${org.comment})` : ''}`);
        });
      }

      const clients = auth0Db.children.filter(
        (it): it is IamClient => it instanceof IamClient,
      );
      if (clients.length > 0) {
        lines.push('');
        lines.push(formatResourceGroupHeading('Clients', 'client', clients.length));
        clients.forEach((client) => {
          lines.push(
            `- ${client.name}${client.appType ? ` (type: ${client.appType})` : ''}`,
          );
        });
      }

      return lines.join('\n');
    });

    return blocks.join('\n\n');
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};
