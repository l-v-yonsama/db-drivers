import { isRecord } from '@l-v-yonsama/rdh';
import { AllConditions, AnyConditions, TopLevelCondition } from '../../types/helpers/ViewCondition';

export function isAllConditions(item: unknown): item is AllConditions {
  return isRecord(item) && Array.isArray(item.all);
}

export function isAnyConditions(item: unknown): item is AnyConditions {
  return isRecord(item) && Array.isArray(item.any);
}

export function isTopLevelCondition(item: unknown): item is TopLevelCondition {
  return isAllConditions(item) || isAnyConditions(item);
}

const SQL_OPERATORS: Record<string, string> = {
  isNull: 'IS NULL',
  isNotNull: 'IS NOT NULL',
  equal: '=',
  notEqual: '<>',
  lessThan: '<',
  lessThanInclusive: '<=',
  greaterThan: '>',
  greaterThanInclusive: '>=',
  between: 'BETWEEN',
  startsWith: 'LIKE',
  endsWith: 'LIKE',
  in: 'IN',
  notIn: 'NOT IN',
  like: 'LIKE',
};

export function operatorToSQLString(operator: string): string {
  return SQL_OPERATORS[operator] ?? '';
}
