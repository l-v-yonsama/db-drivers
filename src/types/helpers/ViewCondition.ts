export type ConditionProperties = {
  fact: string;
  operator: string;
  value: any;
};

export type NestedCondition = ConditionProperties | TopLevelCondition;
export type AllConditions = { all: NestedCondition[] };
export type AnyConditions = { any: NestedCondition[] };
export type TopLevelCondition = AllConditions | AnyConditions;
