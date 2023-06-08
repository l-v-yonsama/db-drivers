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
