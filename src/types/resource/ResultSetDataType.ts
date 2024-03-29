import { QueryConditions } from '../drivers';
import { CellAnnotation } from './Annonations';
import { CodeItem } from './CodeResolverTypes';
import { CompareKey } from './CompareKey';
import { GeneralColumnType } from './GeneralColumnType';
import { TableRule } from './Rules';

export type RdhMeta = {
  connectionName?: string;
  schemaName?: string;
  tableName?: string;
  comment?: string;
  compareKeys?: CompareKey[];
  type?: string;
  tableRule?: TableRule;
  ruleViolationSummary?: {
    [ruleName: string]: number;
  };
  codeItems?: CodeItem[];
  editable?: boolean;
  [key: string]: any;
};

export type ToStringParam = {
  maxPrintLines?: number;
  maxCellValueLength?: number;
  withType?: boolean;
  withComment?: boolean;
  withRowNo?: boolean;
  withCodeLabel?: boolean;
  withRuleViolation?: boolean;
  keyNames?: string[];
};

export type SampleClassPair = {
  clazzValue: any;
  sampleValues: any[];
};

export type SampleGroupByClass = {
  readonly clazzKey: string;
  readonly sampleKeys: string[];
  pairs: SampleClassPair[];
  is_shuffled: boolean;
};

export type MergedCell = {
  row: number;
  col: number;
  rowspan: number;
  colspan: number;
};

export type RdhKey = {
  name: string;
  comment: string;
  type: GeneralColumnType;
  width?: number;
  required?: boolean;
  align?: 'left' | 'center' | 'right';
  meta?: {
    is_image?: boolean;
    is_hyperlink?: boolean;
    [key: string]: any;
  };
};

export type RdhRowMeta = { [key: string]: CellAnnotation[] };

export type RdhRow = {
  readonly meta: RdhRowMeta;
  readonly values: { [key: string]: any };
};

export type RdhSummary = {
  info: string;
  elapsedTimeMilli: number;
  selectedRows?: number;
  affectedRows?: number;
  insertId?: number;
  changedRows?: number;
};

export type ResultSetData = {
  readonly created: Date;
  readonly keys: RdhKey[];
  readonly rows: RdhRow[];
  readonly meta: RdhMeta;
  summary?: RdhSummary;
  queryConditions?: QueryConditions;
  sqlStatement?: string | undefined;
  shuffledIndexes?: number[];
  shuffledNextCounter?: number;
  mergeCells?: MergedCell[];
};

export const isResultSetData = (item: any): item is ResultSetData =>
  item.created && item.keys && item.rows && item.meta;
