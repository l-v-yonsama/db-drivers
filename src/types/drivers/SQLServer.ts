import { ISqlType } from 'mssql';

export type ResultColumn = {
  index: number;
  name: string;
  length: number;
  type: (() => ISqlType) | ISqlType;
  udt?: any;
  scale?: number | undefined;
  precision?: number | undefined;
  nullable: boolean;
  caseSensitive: boolean;
  identity: boolean;
  readOnly: boolean;
};
