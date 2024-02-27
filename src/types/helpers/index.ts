import { TopLevelCondition } from 'json-rules-engine';
import { DbTable, RdsDatabase } from '../../resource';
import { Statement } from 'pgsql-ast-parser';

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
};

export type ToViewDataQueryParams = {
  tableRes: DbTable;
  schemaName?: string;
  conditions?: TopLevelCondition;
  quote?: boolean;
  limit?: number;
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

export type DiffResult = {
  ok: boolean;
  message: string;
  deleted: number;
  inserted: number;
  updated: number;
};

export type DiffToUndoChangesResult = {
  ok: boolean;
  message: string;
  toBeDeleted: {
    conditions: { [key: string]: any };
  }[];
  toBeInserted: {
    values: { [key: string]: any };
  }[];
  toBeUpdated: {
    values: { [key: string]: any };
    conditions: { [key: string]: any };
  }[];
};
