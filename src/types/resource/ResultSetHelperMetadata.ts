import { CompareKey } from './CompareKey';

export type RdhMeta = {
  connectionName?: string;
  tableName?: string;
  compareKeys?: CompareKey[];
  type?: string;
  [key: string]: any;
};
