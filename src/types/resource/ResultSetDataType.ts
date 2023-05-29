import { CompareKey } from './CompareKey';

export type RdhMeta = {
  connectionName?: string;
  tableName?: string;
  comment?: string;
  compareKeys?: CompareKey[];
  type?: string;
  [key: string]: any;
};

export type ToStringParam = {
  maxPrintLines?: number;
  withType?: boolean;
  withComment?: boolean;
  keyNames?: string[];
};
