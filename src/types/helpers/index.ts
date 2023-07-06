import { DbTable, RdsDatabase } from '../../resource';

export type QueryWithBinds = {
  query: string;
  binds: any[];
};

export type ToViewDataQueryParams = {
  tableRes: DbTable;
  schemaName?: string;
  toPositionedParameter?: boolean;
  conditions?: {
    andOr: 'and' | 'or';
    items: ViewConditionItem[];
  };
  quote?: boolean;
};

export type ViewConditionItemOperator =
  | MultipleValueConditionItemOperator
  | SingleValueConditionItemOperator
  | NoValueConditionItemOperator;

export type MultipleValueConditionItemOperator = 'in' | 'notIn';

export type SingleValueConditionItemOperator =
  | 'equal'
  | 'notEqual'
  | 'lessThan'
  | 'lessThanInclusive'
  | 'greaterThan'
  | 'greaterThanInclusive'
  | 'like'
  | 'notLike';

export type NoValueConditionItemOperator = 'isNull' | 'isNotNull';

export type ViewConditionItem =
  | MultipleValueViewConditionItem
  | SingleValueViewConditionItem
  | NoValueViewConditionItem;

export type MultipleValueViewConditionItem = {
  column: string;
  operator: MultipleValueConditionItemOperator;
  values: string[];
};

export type SingleValueViewConditionItem = {
  column: string;
  operator: SingleValueConditionItemOperator;
  value: string;
};

export type NoValueViewConditionItem = {
  column: string;
  operator: NoValueConditionItemOperator;
};

export enum ProposalKind {
  Schema = 0,
  Table = 1,
  Column = 2,
  ReservedWord = 3,
}

export type Proposal = {
  label: string;
  kind: ProposalKind;
  detail?: string;
  desc?: string;
};

export type ProposalParams = {
  sql: string;
  lastChar: string;
  keyword: string;
  parentWord?: string;
  db?: RdsDatabase;
};

export type ResourcePosition = {
  name: string;
  kind: ProposalKind;
  comment?: string;
  offset: number;
  length: number;
};

export type ResourcePositionParams = {
  sql: string;
  db?: RdsDatabase;
};

export type BindParamPosition = {
  firstPosition: number;
  numOfBinds: number;
  kind: 'single' | 'multiple';
};
