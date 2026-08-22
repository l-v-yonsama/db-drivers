import { UnavailableSectionName } from './PerformanceTuningContext';

// Stable, structured diagnostics emitted during getPerformanceTuningContext()
// collection - the replacement for the free-text warning strings that used
// to be scattered across four different places (ExecutionPlanContext.warnings,
// TableTuningContext.warnings, PerformanceTuningContext.collection.warnings,
// PlanNode.warnings). See
// misc/design/performance-tuning-context-implementation-plan.ja.md §4.4 for the full
// rationale and diagnostic inventory - every call site in the four plan parsers and
// RDSBaseDriver that used to push a warning string now pushes one of the
// PerformanceTuningDiagnostic shapes documented in the table below instead.
//
// The driver layer's job stops at reporting a stable `code` plus honest
// technical fields - it never decides what a beginner-facing message should
// say, never groups same-code diagnostics together, and never decides
// whether a situation is "actionable" beyond the info/warning split below
// (§4.4). All of that is db-notebook's (or any other consumer's)
// responsibility. `message` exists purely as an English technical fallback
// so an unrecognized `code` still carries information instead of vanishing
// from a UI built against an older version of this package (§4.4).
//
// ---------------------------------------------------------------------------
// Diagnostic inventory (implementation plan §4.4)
// ---------------------------------------------------------------------------
// Situation                                          | code                    | severity | affectsCompleteness
// ----------------------------------------------------|-------------------------|----------|---------------------
// Postgres Function/Values/CTE/WorkTable/Subquery Scan | NON_TABLE_PLAN_SOURCE   | info     | false
// Postgres scan with no relation, not a known non-table| TABLE_MAPPING_FAILED    | warning  | true
//   scan operation (e.g. an unrecognized future node type)
// Postgres plan root itself unparseable (defensive,     | TABLE_MAPPING_FAILED    | warning  | true
//   "shouldn't happen" guard - no wellformed node exists)
// MySQL <derivedN>/<subqueryN>/<unionN,M> synthetic node| NON_TABLE_PLAN_SOURCE   | info     | false
// MySQL using_temporary_table / using_filesort /        | PLAN_OBSERVATION        | info     | false
//   using_join_buffer flags
// MySQL plan root itself unparseable (defensive)        | TABLE_MAPPING_FAILED    | warning  | true
// SQL Server OBJECT:(...) present but unparseable        | TABLE_MAPPING_FAILED    | warning  | true
// SQL Server native SHOWPLAN_ALL `Warnings` column        | PLAN_OBSERVATION        | info     | false
//   (e.g. "NO STATS: (...)") - a vendor-reported plan fact,
//   not a driver-side collection gap
// SQL Server plan root itself unparseable (defensive)    | TABLE_MAPPING_FAILED    | warning  | true
// Oracle index-only access unresolved via ALL_INDEXES     | TABLE_MAPPING_FAILED    | warning  | true
// Oracle plan root itself unparseable (defensive)         | TABLE_MAPPING_FAILED    | warning  | true
// Any vendor: MySQL table alias that failed catalog        | TABLE_MAPPING_FAILED    | warning  | true
//   lookup (tableDefinition/tableStatistics "not found") -
//   carries a suggestedAction pointing at targetTables,
//   in addition to (not instead of) the usual
//   unavailableSections entry for that section
// Any vendor: Provider succeeded with a caveat message     | SECTION_COLLECTION_FAILED | warning | true
//   (constraints/indexes/DDL/histogram/etc partially failed
//   but the section as a whole still returned data)
// Any vendor: per-table columns/indexes truncated to the    | COLLECTION_TRUNCATED   | warning  | true
//   configured limit
// Any vendor: resolved-table list truncated to maxTables     | COLLECTION_TRUNCATED   | warning  | true
// Any vendor: result truncated (or still oversized) to fit    | COLLECTION_TRUNCATED   | warning  | true
//   maxPayloadBytes
// Any vendor: database version could not be retrieved          | DATABASE_VERSION_UNAVAILABLE | warning | true
//
// A genuine "this section/table is unavailable" fact (permission denied,
// table not found, timed out, cancelled, dropped for payload budget) is
// recorded in collection.unavailableSections, not duplicated here as a
// diagnostic with the same reason string (§4.4) - the one documented
// exception is the MySQL-alias row above, which adds a suggestedAction that
// unavailableSections' own shape has no field for, rather than repeating the
// same reason text.
// ---------------------------------------------------------------------------

export type PerformanceTuningDiagnosticSeverity = 'info' | 'warning';

// Mirrors UnavailableSectionName (PerformanceTuningContext.ts) plus
// 'collection' for diagnostics that describe the result as a whole (a
// resolved-table-list truncation, a payload-budget truncation, a database
// version lookup failure) rather than one specific section.
export type PerformanceTuningDiagnosticScope =
  | 'executionPlan'
  | 'tableDefinition'
  | 'tableStatistics'
  | 'columnStatistics'
  | 'physicalHealth'
  | 'collection';

export type PerformanceTuningDiagnosticCode =
  // A plan node was fully understood but reads from something other than a
  // physical table (a function, VALUES list, CTE, work table, subquery, or
  // a vendor-specific synthetic placeholder) - table DDL/statistics simply
  // do not apply to it. Never affects completeness.
  | 'NON_TABLE_PLAN_SOURCE'
  // A factual, vendor-reported plan characteristic that is not itself a
  // table-mapping gap (MySQL's temp-table/filesort/join-buffer flags, SQL
  // Server's native per-node Warnings text). Observation only - this driver
  // never judges whether it is actually a performance problem.
  | 'PLAN_OBSERVATION'
  // A plan node looked like it should map to a real table (or index-only
  // access), but this driver could not resolve one - table-specific context
  // for that node is missing as a result.
  | 'TABLE_MAPPING_FAILED'
  // A Provider section returned data but with a caveat (part of it - a
  // constraint list, an index list, a DDL fetch, a histogram - failed while
  // the rest of the section still succeeded).
  | 'SECTION_COLLECTION_FAILED'
  // Something within limits (columns, indexes, resolved tables, overall
  // payload bytes) was cut down to stay inside a configured/safe maximum.
  | 'COLLECTION_TRUNCATED'
  // The database version could not be retrieved, so version-specific
  // judgement elsewhere is working with one less piece of context.
  | 'DATABASE_VERSION_UNAVAILABLE'
  // A measured table output differed materially from the optimizer estimate.
  // This is factual evidence for considering statistics/cardinality work in
  // addition to access-path changes; it is not a collection failure.
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
  // Whether this diagnostic alone should turn collection.status 'partial'
  // (§4.4) - kept independent of `severity` on purpose: an `info` diagnostic
  // is always false, but not every `warning` necessarily has to be true were
  // this ever reused for a lower-stakes warning in the future. Every
  // warning currently defined in this package does set it true.
  affectsCompleteness: boolean;
  scope: PerformanceTuningDiagnosticScope;

  // Driver-side technical fallback text (English, not localized). Required
  // so a UI encountering an unrecognized `code` still has something to show
  // instead of silently dropping the diagnostic (§4.4).
  message: string;

  node?: PerformanceTuningDiagnosticNode;

  schemaName?: string;
  tableName?: string;
  // Set only when this diagnostic corresponds to one specific well-known
  // collection section (mirrors `scope` whenever `scope` is not
  // 'collection') - left undefined for diagnostics about the result as a
  // whole (table-list/payload truncation, version lookup), which are not
  // about any single section. Reuses PerformanceTuningContext.ts's own
  // UnavailableSectionName (rather than a second, separately-maintained
  // literal union) so the two never drift apart; this creates a type-only
  // circular import between the two sibling files, which is fine - neither
  // exists at runtime, and this project's tsconfig has isolatedModules off.
  section?: UnavailableSectionName;
  suggestedAction?: string;
  cardinality?: {
    estimatedRows: number;
    actualRows: number;
    actualToEstimatedRatio: number;
    candidatePredicateColumns?: string[];
  };
};
