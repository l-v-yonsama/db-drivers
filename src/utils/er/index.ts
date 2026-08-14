// Public surface of the ER diagram generation feature migrated from db-notebook (see
// misc/automatic-diagram-layout-and-er-migration-plan.md, Phase 6/7). Curated the same way as
// ../cfn/index.ts - a helper newly split out into its own module stays an implementation detail
// unless explicitly re-exported here.
export type {
  ERDiagramOutputFormat,
  ERDiagramParams,
  ERDiagramSettingItem,
  ERDiagramSettingParams,
  ERDiagramTableItem,
  TableColumn,
  TableRelation,
} from './types';
export {
  createErDiagram,
  createERDiagramParams,
  createFullSchemaERDiagramParams,
  createSimpleERDiagramParams,
} from './erDiagramGenerator';
export { createDrawioErDiagram } from './erDiagramDrawioGenerator';
export { createDrawioErDiagramAsync } from './erDiagramDrawioGeneratorAuto';
