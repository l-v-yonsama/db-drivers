import type { RdhDynamoDbAccessPath } from '@l-v-yonsama/rdh';
import type { DbDynamoTable } from '../../resource';

type DynamoDbKeyRole =
  | 'pk'
  | 'sk'
  | 'table pk'
  | 'table sk'
  | 'access pk'
  | 'access sk';

export function resolveDynamoDbAccessPath(
  table: DbDynamoTable | undefined,
  indexName: string | undefined,
): RdhDynamoDbAccessPath {
  if (!indexName) {
    return { type: 'table' };
  }
  if (table?.attr.lsi.some((index) => index.IndexName === indexName)) {
    return { type: 'index', indexName, indexType: 'LSI' };
  }
  if (table?.attr.gsi.some((index) => index.IndexName === indexName)) {
    return { type: 'index', indexName, indexType: 'GSI' };
  }
  return { type: 'index', indexName };
}

function keyRoles(
  table: DbDynamoTable | undefined,
  indexName: string | undefined,
  columnName: string,
): DynamoDbKeyRole[] {
  if (!table) {
    return [];
  }

  const tableKeys = table.getPkAndSkByIndex();
  if (!indexName) {
    if (columnName === tableKeys.pk) return ['pk'];
    if (columnName === tableKeys.sk) return ['sk'];
    return [];
  }

  const accessKeys = table.getPkAndSkByIndex(indexName);
  const roles: DynamoDbKeyRole[] = [];
  if (columnName === tableKeys.pk) roles.push('table pk');
  if (columnName === tableKeys.sk) roles.push('table sk');
  if (columnName === accessKeys.pk) roles.push('access pk');
  if (columnName === accessKeys.sk) roles.push('access sk');
  return roles;
}

export function describeDynamoDbResultKey(
  table: DbDynamoTable | undefined,
  indexName: string | undefined,
  columnName: string,
): { comment: string; required: boolean } {
  const roles = keyRoles(table, indexName, columnName);
  return {
    comment: roles.length > 0 ? `(${roles.join(', ')})` : '',
    required: roles.length > 0,
  };
}

export function getDynamoDbResultKeyNames(
  table: DbDynamoTable | undefined,
  indexName: string | undefined,
): string[] {
  if (!table) {
    return [];
  }
  const tableKeys = table.getPkAndSkByIndex();
  const accessKeys = indexName ? table.getPkAndSkByIndex(indexName) : tableKeys;
  return [tableKeys.pk, tableKeys.sk, accessKeys.pk, accessKeys.sk].filter(
    (name, index, names): name is string =>
      name !== undefined && names.indexOf(name) === index,
  );
}

export function compareDynamoDbResultKeys(
  table: DbDynamoTable | undefined,
  indexName: string | undefined,
  left: string,
  right: string,
): number {
  const keyNames = getDynamoDbResultKeyNames(table, indexName);
  const rank = (name: string): number => {
    const index = keyNames.indexOf(name);
    return index === -1 ? keyNames.length : index;
  };
  const leftRank = rank(left);
  const rightRank = rank(right);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }
  return left.localeCompare(right);
}
