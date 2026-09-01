import { PerformanceTuningDiagnostic } from './PerformanceTuningDiagnostic';
import { PlanNode } from './PlanNode';


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
  // The driver classifies the statement once, before plan collection.
  kind?: 'select' | 'insert' | 'update' | 'delete' | 'other';
  analyzeEligibility?: {
    allowed: boolean;
    reason?: string;
  };
  bindMetadata?: Array<{
    type?: string;
    selectivityClass?: string;
  }>;
};

// Copied verbatim from the caller-selected getStatementStatistics() / SQL History row at selection time.
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

// What the caller passes in via `statement.statistics`; identical shape to what ends up in `PerformanceTuningContext.workload` after the API copies it.
export type SelectedStatementStatistics = WorkloadContext;

// A deliberately-triggered, short benchmark is different evidence from the rolling workload above.
export type PerformanceTuningBenchmarkSample = {
  run: number;
  clientElapsedTimeMs: number;
  returnedRowCount?: number;
};

export type PerformanceTuningBenchmarkSession = {
  startedAt: string;
  completedAt: string;
  requestedRuns: 3 | 5;
  completedRuns: number;
  samples: PerformanceTuningBenchmarkSample[];
  medianClientElapsedTimeMs: number;
  averageClientElapsedTimeMs: number;
  minClientElapsedTimeMs: number;
  maxClientElapsedTimeMs: number;
  planCollectedBeforeBenchmark: true;
  source: 'performanceTuningBenchmark';
};

export type DominantCostPlanNodeRef = {
  planNodeId: string; // cross-references PlanNode.id somewhere in executionPlan.normalizedPlan
  metric: 'actual' | 'estimated'; // which figure decided this
  exclusiveValue: number; // this node's own contribution (ms for 'actual', vendor cost units for 'estimated')
};

// A database-native plan captured while the target SELECT really executed.
export type ActualPlanArtifact = {
  source: string;
  format: 'json' | 'text' | 'xml';
  content: string;
};

// A small, vendor-neutral summary extracted from a native actual-plan artifact.
export type RuntimeObservation = {
  kind: 'runtimeOperation' | 'missingIndex' | 'memoryGrant' | 'timing' | 'wait';
  source: string;
  label: string;
  detail?: string;
  schemaName?: string;
  tableName?: string;
  operation?: string;
  metrics?: Record<string, number | string>;
  columns?: {
    equality?: string[];
    inequality?: string[];
    include?: string[];
  };
};

export type ExecutionPlanContext = {
  mode: 'estimate' | 'analyze';
  format: 'json';
  vendorPlan?: unknown; // the vendor's own plan JSON, as returned by EXPLAIN
  normalizedPlan?: PlanNode;
  planningTimeMs?: number;
  executionTimeMs?: number;
  // Database-native runtime evidence.
  actualPlan?: ActualPlanArtifact;
  // Runtime facts extracted conservatively from actualPlan.
  runtimeObservations?: RuntimeObservation[];
  // See DominantCostPlanNodeRef above.
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

// Deliberately not named "garbage"/vacuum-need in any language: Providers report observations only (dead tuples, fragmentation, free space, stale statistics, ...), never a maintenance verdict.
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
  // Rows entering the table-local filtering stage, per execution when the vendor reports it.
  tableAccessRows?: MetricValue<number>;
  // Explicit local Filter input/output counts.
  predicateFilterInputRows?: MetricValue<number>;
  predicateFilterOutputRows?: MetricValue<number>;
  filterColumns?: string[];
  joinColumns?: string[];
  groupColumns?: string[];
  sortColumns?: string[];
  // The independently meaningful selectivity measures are deliberately separate.
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
  benchmark?: PerformanceTuningBenchmarkSession;
  executionPlan: ExecutionPlanContext;
  tables: TableTuningContext[];
  planTableMappings: PlanTableMapping[];

  collection: {
    collectedAt: string;
    status: 'complete' | 'partial';
    diagnostics: PerformanceTuningDiagnostic[];
    unavailableSections: UnavailableSection[];
  };
};
