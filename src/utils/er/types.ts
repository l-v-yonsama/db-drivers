import { DbTable } from '../../resource';

export type TableColumn = {
  tableName: string;
  columnName: string;
  cardinality: '0' | '1' | '>=0' | '>=1';
};

export type TableRelation = {
  name: string;
  dotted: boolean;
  referencedFrom: TableColumn;
  referenceTo: TableColumn;
};

export type ERDiagramTableItem = {
  tableRes: DbTable;
  columnNames: string[];
};

export type ERDiagramParams = {
  title: string;
  tableItems: ERDiagramTableItem[];
  relations: TableRelation[];
};

export type ERDiagramSettingItem = {
  tableName: string;
  columnNames: string[];
};

export type ERDiagramOutputFormat = 'Mermaid' | 'Drawio';

export type ERDiagramSettingParams = {
  title: string;
  items: ERDiagramSettingItem[];
  outputFormat?: ERDiagramOutputFormat;
};
