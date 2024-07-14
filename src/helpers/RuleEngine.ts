import {
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  RowHelper,
  TableRuleDetail,
  isBooleanLike,
  isDateTimeOrDate,
  isNumericLike,
  toBoolean,
  toDate,
  toNum,
} from '@l-v-yonsama/rdh';
import {
  AllConditions,
  AnyConditions,
  ConditionReference,
  Engine,
  NotConditions,
  TopLevelCondition,
} from 'json-rules-engine';

export function isAllConditions(item: any): item is AllConditions {
  return item.all && item.all.length !== undefined;
}

export function isAnyConditions(item: any): item is AnyConditions {
  return item.any && item.any.length !== undefined;
}
export function isNotConditions(item: any): item is NotConditions {
  return !!item.not;
}
export function isConditionReference(item: any): item is ConditionReference {
  return item.condition && typeof item.condition === 'string';
}
export function isTopLevelCondition(item: any): item is TopLevelCondition {
  return (
    isAllConditions(item) ||
    isAnyConditions(item) ||
    isNotConditions(item) ||
    isConditionReference(item)
  );
}

const OPERATORS = [
  { label: '-', value: '' },
  { label: 'IS NULL', value: 'isNull', sql: 'IS NULL' },
  { label: 'IS NOT NULL', value: 'isNotNull', sql: 'IS NOT NULL' },
  { label: 'IS NIL', value: 'isNil' },
  { label: 'IS NOT NIL', value: 'isNotNil' },
  { label: '=', value: 'equal', sql: '=' },
  { label: '≠', value: 'notEqual', sql: '<>' },
  { label: '<', value: 'lessThan', sql: '<' },
  { label: '≦', value: 'lessThanInclusive', sql: '<=' },
  { label: '>', value: 'greaterThan', sql: '>' },
  { label: '≧', value: 'greaterThanInclusive', sql: '>=' },
  { label: 'BETWEEN', value: 'between', sql: 'BETWEEN' },
  { label: 'STARTS WITH', value: 'startsWith', sql: 'LIKE' },
  { label: 'ENDS WITH', value: 'endsWith', sql: 'LIKE' },
  { label: '∈ (IN)', value: 'in', sql: 'IN' },
  { label: '∉ (NOT IN)', value: 'notIn', sql: 'NOT IN' },
  // only view condition
  { label: 'LIKE', value: 'like', sql: 'LIKE' },
];

/**
 *
 * @ref https://github.com/CacheControl/json-rules-engine/blob/beb656df2502c8716ffab9dc37dc134271b56506/docs/rules.md#operators
 * @param rdh
 */
export const runRuleEngine = async (rdh: ResultSetData): Promise<boolean> => {
  let ok = true;
  const engine = new Engine();
  const { tableRule } = rdh.meta;
  if (!tableRule) {
    return false;
  }
  rdh.meta.ruleViolationSummary = {};
  const { ruleViolationSummary } = rdh.meta;

  // ADD CUSTOM OPERATORS
  engine.addOperator('isNull', (factValue) => {
    return factValue === null;
  });
  engine.addOperator('isNotNull', (factValue) => {
    return factValue !== null;
  });
  engine.addOperator('isNil', (factValue) => {
    return factValue === null || factValue === undefined;
  });
  engine.addOperator('isNotNil', (factValue) => {
    return factValue !== null && factValue !== undefined;
  });
  engine.addOperator('startsWith', (factValue, jsonValue) => {
    if (jsonValue === null || jsonValue === undefined) {
      return true;
    }
    const v = (factValue ?? '').toString();
    if (v.length === 0) {
      return false;
    }
    return v.startsWith(jsonValue.toString());
  });
  engine.addOperator('endsWith', (factValue, jsonValue) => {
    if (jsonValue === null || jsonValue === undefined) {
      return true;
    }
    const v = (factValue ?? '').toString();
    if (v.length === 0) {
      return false;
    }
    return v.endsWith(jsonValue.toString());
  });
  engine.addOperator<number, number[]>('between', (factValue, jsonValue) => {
    if (
      jsonValue === null ||
      jsonValue === undefined ||
      (jsonValue as any[]).length < 2
    ) {
      return true;
    }
    const from = jsonValue[0];
    const to = jsonValue[1];
    return from <= factValue && factValue <= to;
  });

  const limitCounters: {
    [key: string]: {
      limit: number;
      count: number;
    };
  } = {};

  tableRule.details.forEach((detail, idx) => {
    limitCounters[detail.ruleName] = {
      limit: detail.error.limit,
      count: 0,
    };

    engine.addRule({
      conditions: detail.conditions,
      event: {
        type: `type${idx}`,
        params: detail.error,
      },
      name: detail.ruleName,
    });
  });

  for (const row of rdh.rows) {
    const facts = RowHelper.getRuleEngineValues(row, rdh.keys);
    const { failureResults } = await engine.run(facts);

    if (failureResults.length) {
      ok = false;
      for (const result of failureResults) {
        const { event, name, conditions } = result;
        const error = event.params as TableRuleDetail['error'];
        const message = `"${name}" Violation`;
        const conditionValues = getConditionalValues(conditions, facts);

        if (ruleViolationSummary[name] === undefined) {
          ruleViolationSummary[name] = 0;
        }
        ruleViolationSummary[name]++;

        if (limitCounters[name].count < limitCounters[name].limit) {
          RowHelper.pushAnnotation(row, error.column, {
            type: 'Rul',
            values: {
              name,
              message,
              conditionValues,
            },
          });
          limitCounters[name].count++;
        }
      }
    }
    if (Object.values(limitCounters).every((v) => v.count >= v.limit)) {
      break;
    }
  }
  return ok;
};

// editor's string text value to rule-engine's json value
export function stringConditionToJsonCondition(
  condition: TopLevelCondition,
  keys: RdhKey[],
): void {
  const nestedList = [];
  if (isAllConditions(condition)) {
    nestedList.push(...condition.all);
  } else if (isAnyConditions(condition)) {
    nestedList.push(...condition.any);
  }

  for (const nest of nestedList) {
    if (isTopLevelCondition(nest)) {
      stringConditionToJsonCondition(nest, keys);
    } else {
      // condition
      const { fact, value, operator } = nest;
      const colType =
        keys.find((it) => it.name === fact)?.type ?? GeneralColumnType.TEXT;

      if (operator === 'between' || operator === 'in' || operator === 'notIn') {
        if (value === undefined || value === null) {
          nest.value = null;
        } else {
          let arr: any[] = [];
          if (Array.isArray(value)) {
            arr = value;
          } else if (value.startsWith('[') && value.endsWith(']')) {
            arr = JSON.parse(value) as any[];
          } else {
            arr = ('' + value).split(/,/).map((it) => it.trim());
          }
          if (isNumericLike(colType)) {
            nest.value = arr.map((it) => toNum(it) ?? null);
          } else if (isBooleanLike(colType)) {
            nest.value = arr.map((it) => toBoolean(it) ?? null);
          } else if (isDateTimeOrDate(colType)) {
            nest.value = arr.map((it) => toDate(it)?.getTime() ?? null);
          } else {
            nest.value = arr.map((it) => it + '');
          }
        }
      } else {
        if (isNumericLike(colType)) {
          nest.value = toNum(value) ?? null;
        } else if (isBooleanLike(colType)) {
          nest.value = toBoolean(value) ?? null;
        } else if (isDateTimeOrDate(colType)) {
          nest.value = toDate(value)?.getTime() ?? null;
        }
      }
    }
  }
}

export function operatorToLabelString(operator: string): string {
  return OPERATORS.find((it) => it.value === operator)?.label ?? '';
}

export function operatorToSQLString(operator: string): string {
  return OPERATORS.find((it) => it.value === operator)?.sql ?? '';
}

export function conditionsToString(
  condition: TopLevelCondition,
  keys: RdhKey[],
  indent = '',
): string {
  let s = '';
  const nestedList = [];
  if (isAllConditions(condition)) {
    nestedList.push(...condition.all);
    s += `${indent}AND\n`;
  } else if (isAnyConditions(condition)) {
    nestedList.push(...condition.any);
    s += `${indent}OR\n`;
  }
  indent += '    ';

  const withComment = (colName: string): string => {
    const key = keys.find((it) => it.name === colName);
    if (key && key.comment) {
      return `${colName}(${key.comment})`;
    }
    return colName;
  };

  for (const nest of nestedList) {
    if (isTopLevelCondition(nest)) {
      s += conditionsToString(nest, keys, indent);
    } else {
      // condition
      const { fact, value } = nest;
      const operator = operatorToLabelString(nest.operator);

      if (
        typeof value === 'object' &&
        value?.fact &&
        typeof value.fact === 'string'
      ) {
        // column name
        s += `${indent}${withComment(fact)} ${operator} ${withComment(
          value.fact,
        )}\n`;
      } else {
        // static value
        s += `${indent}${withComment(fact)} ${operator} ${value}\n`;
      }
    }
  }
  return s;
}

function getConditionalValues(
  condition: TopLevelCondition,
  facts: { [key: string]: any },
): { [key: string]: any } {
  let obj: { [key: string]: any } = {};

  const nestedList = [];
  if (isAllConditions(condition)) {
    nestedList.push(...condition.all);
  } else if (isAnyConditions(condition)) {
    nestedList.push(...condition.any);
  }
  for (const nest of nestedList) {
    if (isTopLevelCondition(nest)) {
      obj = {
        ...obj,
        ...getConditionalValues(nest, facts),
      };
    } else {
      // condition
      obj[nest.fact] = facts[nest.fact];
      if (
        typeof nest.value === 'object' &&
        nest.value?.fact &&
        typeof nest.value.fact === 'string'
      ) {
        obj[nest.value.fact] = facts[nest.value.fact];
      }
    }
  }
  return obj;
}
