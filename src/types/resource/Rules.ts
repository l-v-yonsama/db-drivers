import { TopLevelCondition } from 'json-rules-engine';

export type TableRule = {
  table: string;
  details: TableRuleDetail[];
};

export type TableRuleDetail = {
  ruleName: string;
  conditions: TopLevelCondition;
  error: {
    column: string;
    limit: number;
  };
};

export type ConditionPropertyParam = {
  valType: 'static' | 'column';
  valColumn: string;
  [key: string]: any;
};

export type RecordRuleValidationResult = {
  tableName: string;
  details: RecordRuleValidationResultDetail[];
};

export type RecordRuleValidationResultDetail = {
  ruleDetail: TableRuleDetail;
  conditionText: string;
  errorRows: {
    rowNo: number;
    conditionValues: { [key: string]: any };
  }[];
};
