import {
  RecordRuleValidationResult,
  RecordRuleValidationResultDetail,
  ResultSetData,
  RowHelper,
  TableRule,
} from '@l-v-yonsama/rdh';
import { conditionsToString } from '../helpers';

export const getRecordRuleResults = (
  rdh: ResultSetData,
): RecordRuleValidationResult | undefined => {
  const tableRule: TableRule = rdh.meta.tableRule;
  if (tableRule === undefined) {
    return undefined;
  }
  const details: RecordRuleValidationResultDetail[] = [];
  tableRule.details.forEach((detail) => {
    const vDetail: RecordRuleValidationResultDetail = {
      ruleDetail: detail,
      conditionText: conditionsToString(detail.conditions, rdh.keys),
      errorRows: [],
    };
    details.push(vDetail);
    for (let i = 0; i < rdh.rows.length; i++) {
      const row = rdh.rows[i];
      const anno = RowHelper.getFirstRuleAnnotation(row, detail);
      if (anno === undefined) {
        continue;
      }
      vDetail.errorRows.push({
        conditionValues: anno.values.conditionValues,
        rowNo: i + 1,
      });
    }
  });
  return {
    tableName: tableRule.table,
    details,
  };
};
