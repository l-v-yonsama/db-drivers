// Migrated from db-notebook's src/shared/ERDiagram.ts (see
// misc/automatic-diagram-layout-and-er-migration-plan.md, Phase 6). `DbTable` used to be
// imported across the package boundary from `@l-v-yonsama/multi-platform-database-drivers`;
// now that this module lives inside that same package, it references the resource type
// directly - see plan 6.2 "DbSchema、DbTable、DbColumn は同一パッケージ内の型を直接利用する".
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
