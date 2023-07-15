import { RowHelper } from '../resource';
import { RdhKey, ResultSetData, TableRuleDetail } from '../types';
import {
  AllConditions,
  AnyConditions,
  Engine,
  TopLevelCondition,
} from 'json-rules-engine';

function isAllConditions(item: any): item is AllConditions {
  return item.all && item.all.length !== undefined;
}
function isAnyConditions(item: any): item is AnyConditions {
  return item.any && item.any.length !== undefined;
}
function isTopLevelCondition(item: any): item is TopLevelCondition {
  return isAllConditions(item) || isAnyConditions(item);
}

const OPERATORS = [
  { label: '-', value: '' },
  { label: 'IS NULL', value: 'isNull' },
  { label: 'IS NOT NULL', value: 'isNotNull' },
  { label: 'IS NIL', value: 'isNil' },
  { label: 'IS NOT NIL', value: 'isNotNil' },
  { label: '=', value: 'equal' },
  { label: '≠', value: 'notEqual' },
  { label: '<', value: 'lessThan' },
  { label: '≦', value: 'lessThanInclusive' },
  { label: '>', value: 'greaterThan' },
  { label: '≧', value: 'greaterThanInclusive' },
  { label: 'STARTS WITH', value: 'startsWith' },
  { label: 'ENDS WITH', value: 'endsWith' },
  { label: '∈ (IN)', value: 'in' },
  { label: '∉ (NOT IN)', value: 'notIn' },
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
    const v = (factValue ?? '').toString();
    if (v.length === 0) {
      return false;
    }
    return v.startsWith(jsonValue.toString());
  });
  engine.addOperator('endsWith', (factValue, jsonValue) => {
    const v = (factValue ?? '').toString();
    if (v.length === 0) {
      return false;
    }
    return v.endsWith(jsonValue.toString());
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
  } else {
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
      const operator = OPERATORS.find((it) => it.value === nest.operator).label;

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
  let obj = {};

  const nestedList = isAllConditions(condition) ? condition.all : condition.any;
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
