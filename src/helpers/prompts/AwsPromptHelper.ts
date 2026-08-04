import { equalsIgnoreCase } from '@l-v-yonsama/rdh';
import {
  AwsDatabase,
  DbDynamoTable,
  DbLogGroup,
  DbS3Bucket,
  DbS3Owner,
  DbSESIdentity,
  DbSQSQueue,
  DbSsmParameter,
  DbSecretsManagerSecret,
} from '../../resource';
import { AwsServiceType, CreateAwsSchemaDefinitionsForPromptParams } from '../../types';
import { formatResourceGroupHeading } from './promptFormatUtils';

const DYNAMO_ATTR_TYPE_LABELS: Record<string, string> = {
  S: 'String',
  N: 'Number',
  B: 'Binary',
  SS: 'String Set',
  NS: 'Number Set',
  BS: 'Binary Set',
  M: 'Map',
  L: 'List',
  NULL: 'Null',
  BOOL: 'Boolean',
};

// DynamoDB's own attribute-type vocabulary (String/Number/Binary/...), as
// used in AWS's own docs - kept separate from `parseDynamoAttrType`, which
// maps to the cross-database `GeneralColumnType` used elsewhere (SQL-ish
// terms like "text"/"numeric" that don't match Dynamo's own type names).
const formatDynamoAttrType = (attrType: string): string =>
  DYNAMO_ATTR_TYPE_LABELS[attrType] ?? attrType;

const formatDynamoKeySchemaLine = (
  attrName: string,
  keyType: 'HASH' | 'RANGE' | undefined,
  attrTypeByName: Map<string, string>,
): string => {
  const typeLabel = formatDynamoAttrType(attrTypeByName.get(attrName) ?? '');
  const keyLabel = keyType === 'RANGE' ? 'SORT KEY' : 'PARTITION KEY';
  return `${attrName} ${typeLabel} ${keyLabel}`;
};

const DYNAMO_INDENT = '    ';

/**
 * Renders a DynamoDB table's schema in Dynamo's own vocabulary (attribute
 * types, PARTITION KEY/SORT KEY, one block per GSI/LSI, and a full
 * ATTRIBUTES listing) rather than as relational DDL, since DynamoDB has no
 * CREATE TABLE syntax of its own. An LSI's partition key is always
 * identical to the table's own (that's the definition of "local"), so only
 * its differentiating sort key is shown.
 */
export const toDynamoTableSchemaText = ({
  dbTable,
}: {
  dbTable: DbDynamoTable;
}): string => {
  const attrTypeByName = new Map(
    dbTable.children.map((col) => [col.name, col.attrType]),
  );

  const blocks: string[] = [];

  const pkCol = dbTable.children.find((col) => col.pk);
  const skCol = dbTable.children.find((col) => col.sk);
  const pkLines: string[] = [];
  if (pkCol) {
    pkLines.push(formatDynamoKeySchemaLine(pkCol.name, 'HASH', attrTypeByName));
  }
  if (skCol) {
    pkLines.push(formatDynamoKeySchemaLine(skCol.name, 'RANGE', attrTypeByName));
  }
  blocks.push(pkLines.map((line) => `${DYNAMO_INDENT}${line}`).join(',\n'));

  (dbTable.attr.gsi ?? []).forEach((index) => {
    const keyLines = (index.KeySchema ?? []).map((ks) =>
      formatDynamoKeySchemaLine(ks.AttributeName ?? '', ks.KeyType, attrTypeByName),
    );
    const body = keyLines
      .map((line) => `${DYNAMO_INDENT}${DYNAMO_INDENT}${line}`)
      .join(',\n');
    blocks.push(
      `${DYNAMO_INDENT}GSI ${index.IndexName} (\n${body}\n${DYNAMO_INDENT})`,
    );
  });

  (dbTable.attr.lsi ?? []).forEach((index) => {
    const sortKey = (index.KeySchema ?? []).find((ks) => ks.KeyType === 'RANGE');
    const keyLines = sortKey
      ? [formatDynamoKeySchemaLine(sortKey.AttributeName ?? '', 'RANGE', attrTypeByName)]
      : [];
    const body = keyLines
      .map((line) => `${DYNAMO_INDENT}${DYNAMO_INDENT}${line}`)
      .join(',\n');
    blocks.push(
      `${DYNAMO_INDENT}LSI ${index.IndexName} (\n${body}\n${DYNAMO_INDENT})`,
    );
  });

  const attrLines = dbTable.children
    .map(
      (col) =>
        `${DYNAMO_INDENT}${DYNAMO_INDENT}${col.name} ${formatDynamoAttrType(col.attrType)}`,
    )
    .join(',\n');
  blocks.push(`${DYNAMO_INDENT}ATTRIBUTES (\n${attrLines}\n${DYNAMO_INDENT})`);

  return `${dbTable.name} (\n${blocks.join('\n\n')}\n)`;
};

const renderDynamoTableSection = (
  awsDb: AwsDatabase,
  resourceName?: string,
): string[] => {
  const tables = awsDb.children.filter(
    (it): it is DbDynamoTable => it instanceof DbDynamoTable,
  );
  const matches = resourceName
    ? tables.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : tables;
  const lines: string[] = [
    formatResourceGroupHeading('Tables', 'table', matches.length),
  ];
  matches.forEach((table) => {
    lines.push(toDynamoTableSchemaText({ dbTable: table }));
    lines.push('');
  });
  return lines;
};

const renderS3Section = (
  awsDb: AwsDatabase,
  resourceName?: string,
): string[] => {
  const buckets = awsDb.children.filter(
    (it): it is DbS3Bucket => it instanceof DbS3Bucket,
  );
  const owners = awsDb.children.filter(
    (it): it is DbS3Owner => it instanceof DbS3Owner,
  );
  const matchedBuckets = resourceName
    ? buckets.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : buckets;
  const matchedOwners = resourceName
    ? owners.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : owners;

  const lines: string[] = [
    formatResourceGroupHeading('Buckets', 'bucket', matchedBuckets.length),
  ];
  matchedBuckets.forEach((bucket) => {
    const created = bucket.attr.CreationDate
      ? new Date(bucket.attr.CreationDate).toISOString()
      : 'unknown';
    lines.push(`- Bucket: ${bucket.name} (created: ${created})`);
  });
  lines.push('');

  lines.push(
    formatResourceGroupHeading('Owners', 'owner', matchedOwners.length),
  );
  matchedOwners.forEach((owner) => {
    lines.push(`- Owner: ${owner.name} (id: ${owner.ownerId})`);
  });
  lines.push('');

  return lines;
};

const renderCloudwatchSection = (
  awsDb: AwsDatabase,
  resourceName?: string,
): string[] => {
  const groups = awsDb.children.filter(
    (it): it is DbLogGroup => it instanceof DbLogGroup,
  );
  const matches = resourceName
    ? groups.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : groups;
  const lines: string[] = [
    formatResourceGroupHeading('LogGroups', 'log group', matches.length),
  ];
  matches.forEach((group) => {
    const parts: string[] = [];
    if (group.attr.retentionInDays !== undefined) {
      parts.push(`retention: ${group.attr.retentionInDays} days`);
    }
    if (group.attr.storedBytes !== undefined) {
      parts.push(`size: ${group.attr.storedBytes} bytes`);
    }
    if (group.attr.creationTime !== undefined) {
      parts.push(`created: ${new Date(group.attr.creationTime).toISOString()}`);
    }
    lines.push(
      `- LogGroup: ${group.name}${parts.length ? ` (${parts.join(', ')})` : ''}`,
    );
  });
  lines.push('');
  return lines;
};

const renderSqsSection = (
  awsDb: AwsDatabase,
  resourceName?: string,
): string[] => {
  const queues = awsDb.children.filter(
    (it): it is DbSQSQueue => it instanceof DbSQSQueue,
  );
  const matches = resourceName
    ? queues.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : queues;
  const lines: string[] = [
    formatResourceGroupHeading('Queues', 'queue', matches.length),
  ];
  matches.forEach((queue) => {
    const type = queue.attr.FifoQueue ? 'FIFO' : 'Standard';
    let dlqInfo = 'DLQ: none';
    if (queue.attr.RedrivePolicy) {
      try {
        const policy =
          typeof queue.attr.RedrivePolicy === 'string'
            ? JSON.parse(queue.attr.RedrivePolicy)
            : queue.attr.RedrivePolicy;
        if (policy?.deadLetterTargetArn) {
          dlqInfo = `DLQ: ${policy.deadLetterTargetArn} (maxReceiveCount: ${
            policy.maxReceiveCount ?? 'unknown'
          })`;
        }
      } catch (_) {
        dlqInfo = `DLQ: ${queue.attr.RedrivePolicy}`;
      }
    }
    const dlqFlag = queue.attr.isDlq ? ', is a DLQ target for another queue' : '';
    lines.push(`- ${queue.name} (type: ${type}, ${dlqInfo}${dlqFlag})`);
  });
  lines.push('');
  return lines;
};

const renderSesSection = (
  awsDb: AwsDatabase,
  resourceName?: string,
): string[] => {
  const identities = awsDb.children.filter(
    (it): it is DbSESIdentity => it instanceof DbSESIdentity,
  );
  const matches = resourceName
    ? identities.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : identities;
  const lines: string[] = [
    formatResourceGroupHeading('Identities', 'identity', matches.length),
  ];
  matches.forEach((identity) => {
    lines.push(
      `- ${identity.name} (type: ${identity.attr.identityType}, verification: ${
        identity.attr.verificationStatus ?? 'NotStarted'
      })`,
    );
  });
  lines.push('');
  return lines;
};

// Deliberately renders only name/type/lastModifiedDate - never the parameter's
// actual value. Mirrors AwsSsmServiceClient#scan(), which never fetches it
// either; only the dedicated "copy real value" action does a single on-demand
// fetch, entirely separate from this prompt/schema rendering path.
const renderSsmSection = (
  awsDb: AwsDatabase,
  resourceName?: string,
): string[] => {
  const parameters = awsDb.children.filter(
    (it): it is DbSsmParameter => it instanceof DbSsmParameter,
  );
  const matches = resourceName
    ? parameters.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : parameters;
  const lines: string[] = [
    formatResourceGroupHeading('Parameters', 'parameter', matches.length),
  ];
  matches.forEach((param) => {
    const parts: string[] = [`type: ${param.attr.type}`];
    if (param.attr.lastModifiedDate) {
      parts.push(`modified: ${new Date(param.attr.lastModifiedDate).toISOString()}`);
    }
    lines.push(`- ${param.name} (${parts.join(', ')})`);
  });
  lines.push('');
  return lines;
};

// Deliberately renders only name/description/rotation status - never the
// secret's actual value. Mirrors AwsSecretsManagerServiceClient#scan(), which
// never fetches it either (ListSecrets cannot return values in the first
// place); only the dedicated "copy real value" action fetches it, via a
// single on-demand GetSecretValue call entirely separate from this path.
const renderSecretsManagerSection = (
  awsDb: AwsDatabase,
  resourceName?: string,
): string[] => {
  const secrets = awsDb.children.filter(
    (it): it is DbSecretsManagerSecret => it instanceof DbSecretsManagerSecret,
  );
  const matches = resourceName
    ? secrets.filter((it) => equalsIgnoreCase(it.name, resourceName))
    : secrets;
  const lines: string[] = [
    formatResourceGroupHeading('Secrets', 'secret', matches.length),
  ];
  matches.forEach((secret) => {
    const parts: string[] = [];
    if (secret.attr.description) {
      parts.push(secret.attr.description);
    }
    parts.push(`rotation: ${secret.attr.rotationEnabled ? 'enabled' : 'disabled'}`);
    lines.push(`- ${secret.name} (${parts.join(', ')})`);
  });
  lines.push('');
  return lines;
};

/**
 * Returns a schema-like description of a target AWS resource tree, with a
 * `-- ${service} --` heading per AWS service (DynamoDB/S3/Cloudwatch/SQS/SES/SSM/SecretsManager),
 * a `--- ${group} (N ${unit}) ---` heading per resource type within that
 * service, and the matching resources listed underneath. Optionally
 * narrowed by an exact-match `resourceName` and/or `serviceType` filter
 * (applied only when given). A resource-type group's heading is always
 * shown for a service that was actually queried - even with a "(0 ...)"
 * count - so the caller can tell "checked, found nothing" apart from "not
 * checked at all". A service outside the `db`/`serviceType` input contributes
 * nothing; a service with no case below (there are none currently) would too.
 */
export const createAwsSchemaDefinitionsForPrompt = async (
  params: CreateAwsSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db, resourceName, serviceType } = params;

  try {
    const databases = (Array.isArray(db) ? db : [db]).filter(
      (it) => !serviceType || it.serviceType === serviceType,
    );
    const lines: string[] = [];

    for (const awsDb of databases) {
      let serviceLines: string[] = [];
      switch (awsDb.serviceType) {
        case AwsServiceType.DynamoDB:
          serviceLines = renderDynamoTableSection(awsDb, resourceName);
          break;
        case AwsServiceType.S3:
          serviceLines = renderS3Section(awsDb, resourceName);
          break;
        case AwsServiceType.Cloudwatch:
          serviceLines = renderCloudwatchSection(awsDb, resourceName);
          break;
        case AwsServiceType.SQS:
          serviceLines = renderSqsSection(awsDb, resourceName);
          break;
        case AwsServiceType.SES:
          serviceLines = renderSesSection(awsDb, resourceName);
          break;
        case AwsServiceType.SSM:
          serviceLines = renderSsmSection(awsDb, resourceName);
          break;
        case AwsServiceType.SecretsManager:
          serviceLines = renderSecretsManagerSection(awsDb, resourceName);
          break;
      }
      if (serviceLines.length === 0) {
        continue;
      }
      lines.push(`-- ${awsDb.serviceType} --`);
      lines.push(...serviceLines);
    }

    return lines.length > 0 ? lines.join('\n') : undefined;
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};
