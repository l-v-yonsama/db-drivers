import { TopLevelCondition } from 'json-rules-engine';
import { Statement } from 'pgsql-ast-parser';
import { DbTable, RdsDatabase } from '../../resource';

export type QNames = {
  tableName: string;
  schemaName?: string;
};

export type QStatement = {
  ast: Statement;
  names: QNames;
};

export type QueryWithBindsResult = {
  query: string;
  binds: any[];
};

export type BindOptions = {
  specifyValuesWithBindParameters: boolean;
  toPositionedParameter?: boolean;
  toPositionalCharacter?: string;
};

export type ToViewDataQueryParams = {
  tableRes: DbTable;
  schemaName?: string;
  conditions?: TopLevelCondition;
  quote?: boolean;
  // toPositionedParameter?: boolean;
  // toPositionalCharacter?: string;
  limit?: number;
  limitAsTop?: boolean;
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
