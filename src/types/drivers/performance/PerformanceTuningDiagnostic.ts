import { UnavailableSectionName } from './PerformanceTuningContext';


export type PerformanceTuningDiagnosticSeverity = 'info' | 'warning';

// Mirrors UnavailableSectionName (PerformanceTuningContext.ts) plus 'collection' for diagnostics that describe the result as a whole (a resolved-table-list truncation, a payload-budget truncation, a database version lookup failure) rather than one specific section.
export type PerformanceTuningDiagnosticScope =
  | 'executionPlan'
  | 'tableDefinition'
  | 'tableStatistics'
  | 'columnStatistics'
  | 'physicalHealth'
  | 'collection';

export type PerformanceTuningDiagnosticCode =
  // A plan node was fully understood but reads from something other than a physical table (a function, VALUES list, CTE, work table, subquery, or a vendor-specific synthetic placeholder) - table DDL/statistics simply do not apply to it.
  | 'NON_TABLE_PLAN_SOURCE'
  // A factual, vendor-reported plan characteristic that is not itself a table-mapping gap (MySQL's temp-table/filesort/join-buffer flags, SQL Server's native per-node Warnings text).
  | 'PLAN_OBSERVATION'
  // A plan node looked like it should map to a real table (or index-only access), but this driver could not resolve one - table-specific context for that node is missing as a result.
  | 'TABLE_MAPPING_FAILED'
  // A Provider section returned data but with a caveat (part of it - a constraint list, an index list, a DDL fetch, a histogram - failed while the rest of the section still succeeded).
  | 'SECTION_COLLECTION_FAILED'
  // Something within limits (columns, indexes, resolved tables, overall payload bytes) was cut down to stay inside a configured/safe maximum.
  | 'COLLECTION_TRUNCATED'
  // The database version could not be retrieved, so version-specific judgement elsewhere is working with one less piece of context.
  | 'DATABASE_VERSION_UNAVAILABLE'
  // A measured table output differed materially from the optimizer estimate.
  | 'CARDINALITY_MISESTIMATE';

export type PerformanceTuningDiagnosticNode = {
  id: string;
  operation: string;
  objectKind?: 'function' | 'cte' | 'subquery' | 'values' | 'workTable' | 'table' | 'index';
  objectName?: string;
};

export type PerformanceTuningDiagnostic = {
  code: PerformanceTuningDiagnosticCode;
  severity: PerformanceTuningDiagnosticSeverity;
  affectsCompleteness: boolean;
  scope: PerformanceTuningDiagnosticScope;

  message: string;

  node?: PerformanceTuningDiagnosticNode;

  schemaName?: string;
  tableName?: string;
  section?: UnavailableSectionName;
  suggestedAction?: string;
  cardinality?: {
    estimatedRows: number;
    actualRows: number;
    actualToEstimatedRatio: number;
    candidatePredicateColumns?: string[];
  };
};
