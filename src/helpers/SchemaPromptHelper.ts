import { equalsIgnoreCase } from '@l-v-yonsama/rdh';
import pluralize from 'pluralize';
import {
  AwsDatabase,
  DbDynamoTable,
  DbLogGroup,
  DbS3Bucket,
  DbS3Owner,
  DbSQSQueue,
  DbTable,
  RdsDatabase,
} from '../resource';
import { RDSBaseDriver } from '../drivers';
import {
  AwsServiceType,
  CreateAwsSchemaDefinitionsForPromptParams,
  CreateRdsSchemaDefinitionsForPromptParams,
  CreateTableDefinitionsForPromptParams,
  QNames,
} from '../types';
import { parseQuery, toRdsDatabase } from './SQLHelper';

type RdsTableWithSchema = { table: DbTable; schemaName: string };

/**
 * Renders DDL text for each resolved table, preferring a live driver-issued
 * DDL statement (e.g. `SHOW CREATE TABLE`) and falling back to a DDL string
 * reconstructed from the `DbTable`/`DbColumn` model when the driver doesn't
 * support it (or none was supplied).
 */
const renderRdsTableDefinitionsForPrompt = async ({
  dbTableWithSchemas,
  rdsDriver,
}: {
  dbTableWithSchemas: RdsTableWithSchema[];
  rdsDriver?: RDSBaseDriver;
}): Promise<string | undefined> => {
  if (dbTableWithSchemas.length === 0) {
    return undefined;
  }
  const lines: string[] = [];

  for (const dbTable of dbTableWithSchemas) {
    let tableDDL = '';
    if (rdsDriver && rdsDriver.supportsShowCreate()) {
      tableDDL = await rdsDriver.getTableDDL({
        schemaName: dbTable.schemaName,
        tableName: dbTable.table.name,
      });
    }
    if (tableDDL) {
      lines.push(tableDDL);
    } else {
      const tableDef = toCreateTableDDL({ dbTable: dbTable.table });
      lines.push(tableDef);
    }
    lines.push('');
  }
  return lines.join('\n');
};

export const createTableDefinisionsForPrompt = async (
  params: CreateTableDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db: idb, sql, rdsDriver } = params;

  const db = idb instanceof RdsDatabase ? idb : toRdsDatabase(idb);

  try {
    if (db) {
      const qst = parseQuery(sql);
      if (qst === undefined || qst.names === undefined) {
        return undefined;
      }

      const dbTableWithSchemas: RdsTableWithSchema[] = [];
      const qnameList: QNames[] = [qst.names];
      if (qst.additionalNames) {
        qnameList.push(...qst.additionalNames);
      }
      qnameList.forEach(({ schemaName, tableName }) => {
        const schemas = db.children.filter((it) =>
          schemaName ? equalsIgnoreCase(it.name, schemaName) : true,
        );
        for (const schema of schemas) {
          const tbl = schema.children.find((it) =>
            equalsIgnoreCase(it.name, tableName),
          );
          if (tbl) {
            dbTableWithSchemas.push({ table: tbl, schemaName: schema.name });
            if (tbl.foreignKeys?.referenceTo) {
              Object.values(tbl.foreignKeys.referenceTo).forEach((refTo) => {
                const tblTo = schema.children.find((it) =>
                  equalsIgnoreCase(it.name, refTo.tableName),
                );
                if (
                  tblTo &&
                  dbTableWithSchemas.find(
                    (it) => it.table.name === tblTo.name,
                  ) === undefined
                ) {
                  dbTableWithSchemas.push({
                    table: tblTo,
                    schemaName: schema.name,
                  });
                }
              });
            }
            if (tbl.foreignKeys?.referencedFrom) {
              Object.values(tbl.foreignKeys.referencedFrom).forEach(
                (refFrom) => {
                  const tblFrom = schema.children.find((it) =>
                    equalsIgnoreCase(it.name, refFrom.tableName),
                  );
                  if (
                    tblFrom &&
                    dbTableWithSchemas.find(
                      (it) => it.table.name === tblFrom.name,
                    ) === undefined
                  ) {
                    dbTableWithSchemas.push({
                      table: tblFrom,
                      schemaName: schema.name,
                    });
                  }
                },
              );
            }
            break;
          }
        }
      });

      return await renderRdsTableDefinitionsForPrompt({
        dbTableWithSchemas,
        rdsDriver,
      });
    }
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};

/**
 * Returns DDL text for the tables of a target RDS resource tree, optionally
 * narrowed by an exact-match `schemaName`/`tableName` filter (applied only
 * when the corresponding filter is given). Unlike `createTableDefinisionsForPrompt`,
 * this is not driven by parsing a SQL statement, so it doesn't expand to
 * foreign-key-related tables.
 */
export const createRdsSchemaDefinitionsForPrompt = async (
  params: CreateRdsSchemaDefinitionsForPromptParams,
): Promise<string | undefined> => {
  const { db, rdsDriver, schemaName, tableName } = params;

  try {
    const databases = Array.isArray(db) ? db : [db];
    const dbTableWithSchemas: RdsTableWithSchema[] = [];

    for (const rdsDb of databases) {
      const schemas = rdsDb.children.filter((it) =>
        schemaName ? equalsIgnoreCase(it.name, schemaName) : true,
      );
      for (const schema of schemas) {
        schema.children
          .filter((it) =>
            tableName ? equalsIgnoreCase(it.name, tableName) : true,
          )
          .forEach((table) => {
            dbTableWithSchemas.push({ table, schemaName: schema.name });
          });
      }
    }

    return await renderRdsTableDefinitionsForPrompt({
      dbTableWithSchemas,
      rdsDriver,
    });
  } catch (_) {
    console.error(_);
    // do nothing.
  }

  return undefined;
};

export const toCreateTableDDL = ({ dbTable }: { dbTable: DbTable }): string => {
  const columns = dbTable.children;
  const colDefs: string[] = [];
  columns.forEach((col) => {
    let line = `  ${col.name} ${col.colType}`;
    if (col.primaryKey) {
      line += ' PRIMARY KEY';
    } else {
      if (col.nullable === false) {
        line += ' NOT NULL';
      }
    }
    if (col.uniqKey) {
      line += ' UNIQUE';
    }
    if (col.extra) {
      if (col.extra.toLocaleLowerCase() === 'auto_increment') {
        line += ' AUTO_INCREMENT';
      }
    }
    if (col.default) {
      line += ` DEFAULT ${col.default}`;
    }
    if (col.comment) {
      line += ` COMMENT '${col.comment}'`;
    }
    colDefs.push(line);
  });

  if (dbTable.foreignKeys?.referenceTo) {
    Object.entries(dbTable.foreignKeys.referenceTo).forEach(
      ([colName, refTo]) => {
        colDefs.push(
          `  FOREIGN KEY ${refTo.constraintName}(${colName}) REFERENCES ${refTo.tableName}(${refTo.columnName})`,
        );
      },
    );
  }

  let tableDef = `CREATE TABLE ${dbTable.name} (\n${colDefs.join(',\n')}\n)`;
  if (dbTable.comment) {
    tableDef += ` COMMENT '${dbTable.comment}';`;
  } else {
    tableDef += `;`;
  }
  return tableDef;
};

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

/**
 * Formats a level-2 resource-group heading, e.g. `--- Buckets (3 buckets) ---`.
 */
const formatResourceGroupHeading = (
  groupName: string,
  unit: string,
  count: number,
): string => `--- ${groupName} (${count} ${pluralize(unit, count)}) ---`;

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
    lines.push(`- ${queue.name} (type: ${type}, ${dlqInfo})`);
  });
  lines.push('');
  return lines;
};

/**
 * Returns a schema-like description of a target AWS resource tree, with a
 * `-- ${service} --` heading per AWS service (DynamoDB/S3/Cloudwatch/SQS),
 * a `--- ${group} (N ${unit}) ---` heading per resource type within that
 * service, and the matching resources listed underneath. Optionally
 * narrowed by an exact-match `resourceName` and/or `serviceType` filter
 * (applied only when given). A resource-type group's heading is always
 * shown for a service that was actually queried - even with a "(0 ...)"
 * count - so the caller can tell "checked, found nothing" apart from "not
 * checked at all". A service outside the `db`/`serviceType` input (or one
 * with no resource types defined here, e.g. SES) contributes nothing.
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
        default:
          // e.g. SES has nothing schema-like to render.
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
