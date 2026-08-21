import { PerformanceTuningDiagnostic } from './PerformanceTuningDiagnostic';
import { PlanNode } from './PlanNode';

// See misc/design/performance-tuning-context-implementation-plan.ja.md for
// the full rationale behind every field below. In short: this is a
// vendor-neutral snapshot of "why is this one SQL statement slow", built
// from the execution plan outward to only the tables/columns/indexes that
// plan touches. Driver implementations report observed facts and their
// provenance (source, unit, estimated vs. actual); they never return
// conclusions ("run VACUUM") or AI output - that is strictly an upper-layer
// responsibility.
//
// Text fields here (DDL, DEFAULT/CHECK expressions, index predicates, plan
// predicates, the SQL text itself) are exactly what the driver read from the
// database, with no literal-masking step - this matches every other
// AI-facing path already shipped in db-notebook (schema/DDL prompts, "Annotate
// SQL with AI", the RunQueryTool's row results), none of which redact
// literals either. An earlier version of this file added a type-enforced
// masking boundary (`Unsanitized<T>`) specific to this one feature; it was
// removed for being inconsistent with that existing, already-shipped
// posture and for gating on a redactor that didn't exist. If per-field
// literal redaction is ever wanted, it should be designed once, for all
// AI-facing paths, not bolted onto this feature alone.

// Second, optional argument accepted by getPerformanceTuningContext() and
// checkPerformanceTuningContextAvailability(), kept separate from the params
// object itself (mirroring fetch()'s `{ signal }`) since cancellation is a
// call-scoped control concern, not request data that belongs in a saved
// Notebook or an AI payload. Threaded down into
// PerformanceTuningContextProvider so a caller can actually cancel
// in-flight collection once Phase 1 wires in real Provider calls.
export type PerformanceTuningCallOptions = {
  signal?: AbortSignal;
};

export type PerformanceTuningContextParams = {
  databaseName: string;
  schemaName?: string;

  statement: {
    sql: string;
    source: 'statementStatistics' | 'sqlHistory' | 'editor';
    normalizedSql?: string;
    statistics?: SelectedStatementStatistics;
  };

  plan: {
    mode?: 'estimate' | 'analyze'; // default: 'estimate'
    binds?: unknown[]; // used only to obtain a parameter-specific plan; never echoed back
    // Call-scoped only, same rule as `binds`: never copied into
    // PerformanceTuningContext, Full Context JSON, StateStorage, SQL
    // History, telemetry, or logs (misc/design/performance-tuning-query-
    // statistics-parameter-input-plan.ja.md §7.4/§8.1, db-notebook repo).
    // Parallel array to `binds`, same order/length; only SQL Server's
    // named-parameter SHOWPLAN substitution consumes it today.
    bindMarkers?: string[];
    bindMetadata?: Array<{
      type?: string;
      selectivityClass?: string;
    }>;
    allowExecution?: boolean; // required to be true when mode === 'analyze'
    timeoutMs?: number;
  };

  targetTables?: Array<{
    schemaName?: string;
    tableName: string;
  }>;

  // Corrects a plan-reported table name that's actually an alias, keyed by
  // the lowercased alias (or bare table name for an unaliased reference) -
  // see resolveTableAliasMap() (§6.6 of performance-tuning-query-
  // statistics-parameter-input-plan.ja.md, db-notebook repo). Complements
  // targetTables above rather than replacing it: this corrects a table the
  // plan *did* resolve but under the wrong name (MySQL's aliased-table
  // EXPLAIN gap); targetTables adds a table the plan *didn't* resolve at
  // all. Applied uniformly regardless of dbType - a miss here just means
  // the plan's own tableName is used unchanged, which is the common case
  // for every Vendor besides MySQL's aliased queries.
  tableAliasMap?: Record<string, { schemaName?: string; tableName: string }>;

  limits?: {
    maxTables?: number;
    maxColumnsPerTable?: number;
    maxIndexesPerTable?: number;
    maxPayloadBytes?: number;
  };
};

export type DatabaseContext = {
  vendor: string;
  version?: string;
  databaseName: string;
  schemaName?: string;
  environment?: string;
};

export type StatementContext = {
  sql: string;
  source: 'statementStatistics' | 'sqlHistory' | 'editor';
  bindMetadata?: Array<{
    type?: string;
    selectivityClass?: string;
  }>;
};

// Copied verbatim from the caller-selected getStatementStatistics() /
// SQL History row at selection time. This API never re-queries the source
// to refresh it, and never substitutes 0 for a metric the source did not
// have - that would misrepresent SQL History rows as having DB-side stats.
export type WorkloadContext = {
  statementId?: string;
  executionCount?: number;
  totalElapsedTimeMs?: number;
  averageElapsedTimeMs?: number;
  minElapsedTimeMs?: number;
  maxElapsedTimeMs?: number;
  rowsProcessed?: number;
  rowsExamined?: number;
  logicalReads?: number;
  physicalReads?: number;
  statisticsSince?: string;
  lastExecutedAt?: string;
  source?: string;
};

// What the caller passes in via `statement.statistics`; identical shape to
// what ends up in `PerformanceTuningContext.workload` after the API copies it.
export type SelectedStatementStatistics = WorkloadContext;

// A purely factual, computed pointer at the one PlanNode that accounts for
// the most cost/time in a plan - never a verdict ("this is the problem"),
// just "this is where the numbers concentrate" (2026-08-21 follow-up, see
// scripts/performance-lab/aiResults/summary.md's "追加検証(2nd-0821)" /
// Full Context improvement item 5). Motivated by a concrete regression: an
// AI given a real EXPLAIN ANALYZE plan anchored on a secondary
// PLAN_OBSERVATION diagnostic (temp table/filesort - a GROUP BY/ORDER BY
// symptom) instead of the WHERE-clause filtering step that was actually
// dominant. `exclusiveValue` is this node's own contribution with its
// children's contributions subtracted out (see planNodeMath.ts's
// computeExclusiveCost()) - inclusive/cumulative cost trivially always
// maximizes at the plan root in every vendor's plan representation, so it
// would be useless for this purpose.
export type DominantCostPlanNodeRef = {
  planNodeId: string; // cross-references PlanNode.id somewhere in executionPlan.normalizedPlan
  metric: 'actual' | 'estimated'; // which figure decided this
  exclusiveValue: number; // this node's own contribution (ms for 'actual', vendor cost units for 'estimated')
};

// A database-native plan captured while the target SELECT really executed.
// This stays separate from normalizedPlan: PostgreSQL can normalize its
// ANALYZE JSON directly, but MySQL, Oracle, and SQL Server expose their
// runtime evidence as text or XML. Consumers must not infer planNodeId
// correspondence from the artifact's visual/tree order alone.
export type ActualPlanArtifact = {
  source: string;
  format: 'json' | 'text' | 'xml';
  content: string;
};

export type ExecutionPlanContext = {
  mode: 'estimate' | 'analyze';
  format: 'json';
  vendorPlan?: unknown; // the vendor's own plan JSON, as returned by EXPLAIN
  normalizedPlan?: PlanNode;
  planningTimeMs?: number;
  executionTimeMs?: number;
  // Database-native runtime evidence. `normalizedPlan`/planTableMappings
  // may still be estimate-mode topology (MySQL/Oracle/SQL Server); this
  // artifact must therefore never be positionally matched to planNodeIds.
  actualPlan?: ActualPlanArtifact;
  // See DominantCostPlanNodeRef above. Computed by RDSBaseDriver for every
  // vendor from normalizedPlan's estimated/actual costs
  // (planNodeMath.ts's findDominantCostPlanNode()); MySQL additionally
  // resolves this from its actual-plan artifact when analyze mode is on
  // (mysqlActualPlanTextParser.ts), since MySQL's normalizedPlan tree never
  // carries real per-node actual timing the way Postgres's does.
  // `undefined` only when no node in the plan has any usable cost/time data
  // at all.
  dominantCostPlanNode?: DominantCostPlanNodeRef;
};

export type ColumnDefinition = {
  columnName: string;
  dataType: string;
  nullable: boolean;
  defaultExpression?: string;
  ordinalPosition?: number;
  comment?: string;
};

export type ConstraintDefinition = {
  constraintName?: string;
  type: 'primaryKey' | 'uniqueKey' | 'foreignKey' | 'check';
  columns?: string[];
  referencedSchemaName?: string;
  referencedTableName?: string;
  referencedColumns?: string[];
  checkExpression?: string;
};

export type IndexColumnDefinition = {
  columnName?: string;
  expression?: string; // expression / function-based index
  direction?: 'asc' | 'desc';
  prefixLength?: number;
};

export type IndexDefinition = {
  indexName: string;
  unique: boolean;
  primary?: boolean;
  columns: IndexColumnDefinition[];
  includedColumns?: string[];
  predicate?: string; // partial / filtered index predicate
  visible?: boolean;
  enabled?: boolean;
  indexType?: string; // btree, hash, gin, columnstore, ...; kept as the vendor's own term
};

export type PartitioningDefinition = {
  strategy: string; // range, list, hash, ...; kept as the vendor's own term
  columns?: string[];
  partitionCount?: number;
};

export type TableDefinitionContext = {
  ddl?: string; // as returned by the vendor (e.g. SHOW CREATE TABLE / pg_get_*def)
  columns: ColumnDefinition[];
  constraints: ConstraintDefinition[];
  indexes: IndexDefinition[];
  partitioning?: PartitioningDefinition;
};

// Every observed value carries its own provenance instead of one
// estimated/source pair per section: an estimated row count, an exact size
// read via a size function, and an updated-at timestamp from yet another
// catalog view are three different degrees of trust, and collapsing them
// into a single container-level flag would tell the AI they're all equally
// reliable when they are not.
export type MetricValue<T> = {
  value: T;
  estimated: boolean;
  source: string;
  unit?: string;
};

export type ColumnStatisticsContext = {
  columnName: string;
  distinctCount?: MetricValue<number>;
  distinctFraction?: MetricValue<number>;
  nullFraction?: MetricValue<number>;
  averageWidthBytes?: MetricValue<number>;
  correlation?: MetricValue<number>;
  histogramType?: MetricValue<string>;
  histogramBucketCount?: MetricValue<number>;
  statisticsUpdatedAt?: MetricValue<string>;
};

export type TableStatisticsContext = {
  estimatedRowCount?: MetricValue<number>;
  tableBytes?: MetricValue<number>;
  indexBytes?: MetricValue<number>;
  totalBytes?: MetricValue<number>;
  statisticsUpdatedAt?: MetricValue<string>;
  modificationsSinceAnalyze?: MetricValue<number>;
  sampleRows?: MetricValue<number>;
  columns: ColumnStatisticsContext[];
};

// Deliberately not named "garbage"/vacuum-need in any language: Providers
// report observations only (dead tuples, fragmentation, free space, stale
// statistics, ...), never a maintenance verdict. Thresholding against table
// size / workload / vendor quirks is a deterministic upper-layer rule.
export type PhysicalHealthContext = {
  provider: string;
  metrics: Array<{
    name: string;
    value: number | string | boolean | null;
    unit?: string;
    estimated?: boolean;
    description?: string;
  }>;
};

export type TableTuningContext = {
  schemaName?: string;
  tableName: string;
  definition?: TableDefinitionContext;
  statistics?: TableStatisticsContext;
  physicalHealth?: PhysicalHealthContext;
};

export type PlanTableMapping = {
  planNodeId: string;
  schemaName?: string;
  tableName: string;
  alias?: string;
  indexName?: string;
  estimatedRows?: number;
  actualRows?: number;
  rowEstimateRatio?: number;
  // Rows entering the table-local filtering stage, per execution when the
  // vendor reports it. This is intentionally separate from actualRows:
  // actualRows is the node's output, while tableAccessRows is the scanned /
  // index-accessed candidate set before a local Filter removes rows.
  tableAccessRows?: MetricValue<number>;
  // Explicit local Filter input/output counts. Omitted unless one vendor
  // reports both counts for this exact table access; never inferred by
  // aligning visual nodes from an independent actual-plan artifact.
  predicateFilterInputRows?: MetricValue<number>;
  predicateFilterOutputRows?: MetricValue<number>;
  filterColumns?: string[];
  joinColumns?: string[];
  groupColumns?: string[];
  sortColumns?: string[];
  // The independently meaningful selectivity measures are deliberately
  // separate. Both are fractions in [0,1], never percentages.
  // `tableAccessFraction` is the candidate set reached by the table access
  // relative to total table rows. `predicateFilterSelectivity` is the
  // fraction that a local Filter passed (output / input). Either is absent
  // when the vendor did not provide the required count(s).
  tableAccessFraction?: MetricValue<number>;
  predicateFilterSelectivity?: MetricValue<number>;
};

export type UnavailableSectionName =
  | 'executionPlan'
  | 'analyzedExecutionPlan'
  | 'tableDefinition'
  | 'tableStatistics'
  | 'columnStatistics'
  | 'physicalHealth';

export type UnavailableSection = {
  section: UnavailableSectionName;
  schemaName?: string;
  tableName?: string;
  reason: string;
  requiredPermissions?: string[];
};

export type PerformanceTuningContext = {
  formatVersion: 1;

  database: DatabaseContext;
  statement: StatementContext;
  workload?: WorkloadContext;
  executionPlan: ExecutionPlanContext;
  tables: TableTuningContext[];
  planTableMappings: PlanTableMapping[];

  collection: {
    collectedAt: string;
    status: 'complete' | 'partial';
    // Every structured diagnostic collection produced, in provenance order
    // (plan-level diagnostics first, then per-table ones) - the single home
    // that replaced the four separate warning-string arrays this type used
    // to have (ExecutionPlanContext.warnings, TableTuningContext.warnings,
    // this field itself, and PlanNode.warnings). `status` is derived only
    // from this and unavailableSections below (§2.2) - an `info` diagnostic
    // never affects it.
    diagnostics: PerformanceTuningDiagnostic[];
    unavailableSections: UnavailableSection[];
  };
};
