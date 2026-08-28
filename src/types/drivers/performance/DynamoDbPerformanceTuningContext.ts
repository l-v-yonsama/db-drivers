import { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { MetricValue, PerformanceTuningContext } from './PerformanceTuningContext';
import { DynamoDbPerformanceTuningDiagnostic } from './DynamoDbPerformanceTuningDiagnostic';

// See db-notebook repo's
// misc/specs/dynamodb-performance-tuning-implementation-plan.ja.md for the
// full rationale behind every field below. In short: DynamoDB has no public
// EXPLAIN-equivalent execution plan, so this is NOT a parallel "plan" type -
// it is a static access-path classification (derived from the statement's
// key condition against the table/index key schema, never executed data)
// plus optional workload/observation/CloudWatch evidence. RDB's
// PerformanceTuningContext is left completely untouched; this is a sibling
// type, joined only by the union below and by the UI/AI/report shell layer
// (§6.1 - "RDB の『実行計画』と DynamoDB の『アクセスパターン』を同じ概念と
// して扱わない").

export type AnyPerformanceTuningContext =
  | PerformanceTuningContext
  | DynamoDbPerformanceTuningContext;

// Adding a required discriminator to the RDB type would break existing saved
// DBN files, test fixtures, and external consumers (§6.1) - so the guard
// instead keys off `engine`, a field that only ever exists on the DynamoDB
// side.
export function isDynamoDbPerformanceTuningContext(
  context: AnyPerformanceTuningContext,
): context is DynamoDbPerformanceTuningContext {
  return 'engine' in context && context.engine === 'dynamodb';
}

// ---------------------------------------------------------------------------
// Access pattern (§6.3) - a static classification, not a plan. `accessPath`
// is decided purely from whether the partition key is guaranteed compared
// with `=`/`IN` somewhere the WHERE/KeyCondition boolean tree cannot escape
// (AND-conjunct, or an OR-group where every branch is an equality on the
// same partition key) - see dynamoPartiqlAccessPattern.ts for the algorithm.
// `tableQuery`/`indexQuery` therefore mean "this statement, run as written,
// is guaranteed by AWS's own PartiQL/Query semantics to be a Query", not "we
// observed a Query".
// ---------------------------------------------------------------------------

export type DynamoDbAccessPath =
  | 'tableQuery'
  | 'indexQuery'
  | 'tableScan'
  | 'indexScan'
  | 'unknown';

export type DynamoDbKeyConditionOperator =
  | '='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'BETWEEN'
  | 'begins_with';

export type DynamoDbAccessPattern = {
  operation: 'PartiQLSelect' | 'Query' | 'Scan';
  accessPath: DynamoDbAccessPath;
  // 'unknown' whenever the parser could not safely classify the statement
  // (DYNAMODB_ACCESS_PATTERN_UNRESOLVED) - accessPath is 'unknown' in that
  // case too; the two always move together.
  confidence: 'certain' | 'unknown';
  tableName: string;
  indexName?: string;
  indexType?: 'LSI' | 'GSI';
  partitionKey?: {
    attributeName: string;
    // '=' | 'IN' is what actually grants a Query; other comparison operators
    // are structurally impossible for a partition key condition (DynamoDB's
    // own API/PartiQL grammar), so this field only ever holds those two when
    // present at all.
    operator?: '=' | 'IN';
    conditionPresent: boolean;
  };
  sortKey?: {
    attributeName: string;
    operator?: DynamoDbKeyConditionOperator;
    conditionPresent: boolean;
  };
  // Attributes compared/filtered outside the key condition - evaluated by
  // DynamoDB only after each item is already read (§4's "重要な制約":
  // Capacity is already spent by the time this filter runs).
  postReadFilter: {
    present: boolean;
    attributes: string[];
  };
  projection: {
    // Describes the actual DynamoDB projection semantics. In particular,
    // an index Query with no Select/ProjectionExpression uses
    // ALL_PROJECTED_ATTRIBUTES, which is not the same as all table
    // attributes.
    mode: 'allAttributes' | 'allProjectedAttributes' | 'specific';
    allAttributes: boolean;
    attributes: string[];
  };
  consistentRead: 'eventual' | 'strong' | 'unknown';
  // Raw DynamoDB statement/API Limit. This is intentionally distinct from
  // resultItemLimit, which is the Query Panel's cross-response result cap.
  limit?: number;
  resultItemLimit?: number;
  scanForward?: boolean;
};

// ---------------------------------------------------------------------------
// Table / index definition (§6.4). Built directly from DescribeTable's
// response shape (normalized into this driver-neutral form), never from
// AwsDynamoTableAttributes - that resource-tree type keeps its own
// independent evolution (see AwsDynamoTableAttributes.ts).
// ---------------------------------------------------------------------------

export type DynamoDbAttributeType = 'S' | 'N' | 'B';

export type DynamoDbKeyAttribute = {
  attributeName: string;
  attributeType: DynamoDbAttributeType;
};

export type DynamoDbKeySchema = {
  partitionKey: DynamoDbKeyAttribute;
  sortKey?: DynamoDbKeyAttribute;
};

export type DynamoDbProjection = {
  projectionType: 'ALL' | 'KEYS_ONLY' | 'INCLUDE' | 'unknown';
  // Only meaningful (and only ever populated) when projectionType is
  // 'INCLUDE'.
  nonKeyAttributes?: string[];
};

// A single read+write Capacity pair. Used both for a table/index's
// provisioned setting and (normalized to the same shape - see
// dynamoDbCapacity.ts) for its warm throughput, even though DescribeTable
// reports those under different raw field names.
export type DynamoDbThroughput = {
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
};

export type DynamoDbIndexContext = {
  indexName: string;
  indexType: 'LSI' | 'GSI';
  status?: string;
  keySchema: DynamoDbKeySchema;
  projection: DynamoDbProjection;
  // Approximate, updated roughly every six hours by AWS - see
  // DYNAMODB_APPROXIMATE_TABLE_METADATA.
  itemCount?: MetricValue<number>;
  indexSizeBytes?: MetricValue<number>;
  // GSI only - an LSI always shares the base table's throughput and never
  // reports its own.
  provisionedThroughput?: DynamoDbThroughput;
  onDemandThroughput?: {
    maxReadRequestUnits?: number;
    maxWriteRequestUnits?: number;
  };
  warmThroughput?: DynamoDbThroughput;
};

export type DynamoDbContributorInsightsStatus = {
  resource: 'table' | 'gsi';
  status: string;
  mode?: string;
  indexName?: string;
};

export type DynamoDbTableContext = {
  tableName: string;
  status?: string;
  billingMode: 'PROVISIONED' | 'PAY_PER_REQUEST' | 'unknown';
  keySchema: DynamoDbKeySchema;
  // Only the table/index key attributes - NOT every attribute the table can
  // hold (DynamoDB is schemaless outside of keys; DescribeTable itself never
  // reports non-key attributes). Documented here, in the Preview, and in the
  // AI prompt so nobody mistakes this for a full column list.
  attributeDefinitions: DynamoDbKeyAttribute[];
  localSecondaryIndexes: DynamoDbIndexContext[];
  globalSecondaryIndexes: DynamoDbIndexContext[];
  provisionedThroughput?: DynamoDbThroughput;
  onDemandThroughput?: {
    maxReadRequestUnits?: number;
    maxWriteRequestUnits?: number;
  };
  warmThroughput?: DynamoDbThroughput;
  itemCount?: MetricValue<number>;
  tableSizeBytes?: MetricValue<number>;
  tableClass?: string;
  ttl?: { status: string; attributeName?: string };
  // Status/mode only - v1 never fetches a Contributor Insights key report
  // (§4's "Contributor Insights の key 値は機微情報になり得る").
  contributorInsights: DynamoDbContributorInsightsStatus[];
};

// ---------------------------------------------------------------------------
// Capacity / workload / observation (§6.5). A single request's Consumed
// Capacity breakdown, the rolling SQL-History-derived workload summary, and
// the optional single confirmed observed read - three different degrees of
// evidence, kept as three different optional Context fields rather than
// collapsed into one (mirrors RDB's own MetricValue.estimated-per-field
// philosophy: don't let the AI treat a one-off observation and a rolling
// average as equally authoritative).
// ---------------------------------------------------------------------------

export type DynamoDbCapacityAmount = {
  capacityUnits?: number;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
};

export type DynamoDbCapacityBreakdown = {
  capacityUnits?: number;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
  table?: DynamoDbCapacityAmount;
  // Keyed by index name - only populated when ReturnConsumedCapacity:
  // 'INDEXES' actually reported a per-index breakdown (Run Observed Read
  // only; ordinary Query/Scan/PartiQL execution still uses 'TOTAL').
  localSecondaryIndexes?: Record<string, DynamoDbCapacityAmount>;
  globalSecondaryIndexes?: Record<string, DynamoDbCapacityAmount>;
};

export type DynamoDbWorkloadContext = {
  executionCount?: number;
  totalClientElapsedTimeMs?: number;
  averageClientElapsedTimeMs?: number;
  maxClientElapsedTimeMs?: number;
  lastClientElapsedTimeMs?: number;
  capacitySampleCount?: number;
  totalCapacityUnits?: number;
  averageCapacityUnits?: number;
  maxCapacityUnits?: number;
  lastCapacityUnits?: number;
  lastReturnedItemCount?: number;
  lastEvaluatedItemCount?: number;
  source?: string;
  lastExecutedAt?: string;

  // Rolling aggregate built from SQL History's repeated-execution stats for
  // the same structural statement (query panel history/performance plan
  // §7.3/§9.2) - a different degree of evidence than `observation` below
  // (one recent execution) or a CloudWatch series (server-side, unscoped to
  // this one statement). Only ever populated for native Query/Scan history,
  // since evaluatedItemCount/filterPassRate have no PartiQL equivalent.
  readObservationSampleCount?: number;
  evaluatedCountSampleCount?: number;
  totalReturnedItemCount?: number;
  totalEvaluatedItemCount?: number;
  // returned/evaluated computed across the *sums* above, not an average of
  // per-sample rates - see design doc §7.3's "weighted pass rate は保存せ
  // ず...から算出する".
  weightedFilterPassRate?: number;
  minFilterPassRate?: number;
  maxFilterPassRate?: number;
  lastFilterPassRate?: number;
  // Count of samples where continuationTokenPresent === true - i.e. samples
  // that did not observe the statement's full result (design doc §7.3).
  boundedObservationCount?: number;
};

export type DynamoDbReadObservation = {
  source: 'sqlHistory' | 'observedRead';
  observedAt?: string;
  clientElapsedTimeMs?: number;
  requestCount?: number;
  retryCount?: number;
  returnedItemCount?: number;
  // Only ever set for a native Query/Scan observation. ExecuteStatement's
  // response has no ScannedCount field at all (AWS API fact, not a
  // collection gap) - a PartiQL observation must leave this undefined,
  // never 0 or an estimate.
  evaluatedItemCount?: number;
  // returned / evaluated, computed only when evaluatedItemCount > 0. Always
  // undefined for a PartiQL observation, for the same reason as above.
  filterPassRate?: number;
  consumedCapacity?: DynamoDbCapacityBreakdown;
  hasMorePages?: boolean;
  // true whenever this observation was deliberately cut short (Run Observed
  // Read's 1-response/maxEvaluatedItems cap) rather than reflecting the
  // statement's full result. Kept as the compatibility field alongside the
  // more expressive `completeness` below (query panel history/performance
  // plan §9.1) - existing readers of `bounded` alone keep working.
  bounded: boolean;
  boundDescription?: string;
  // 'complete': every matching item was evaluated (no continuation token
  // remained). 'bounded': evaluation was deliberately or structurally cut
  // short (Run Observed Read, or a native Query/Scan history sample whose
  // LastEvaluatedKey/NextToken was present) - same fact `bounded: true`
  // reports, just named for a 3-way state. 'unknown': completeness could
  // not be determined at all (e.g. an older history entry saved before this
  // field existed) - callers must not treat 'unknown' as 'complete'.
  // Optional so existing constructors that only ever set `bounded` remain
  // valid; a caller that can determine this should always set both fields
  // consistently.
  completeness?: 'complete' | 'bounded' | 'unknown';
};

// An explicitly-triggered 3/5-run session. `page` measures one safely bounded
// API response; `completeResult` follows continuation tokens up to hard safety
// caps and records bounded when those caps stop it before completion.
export type DynamoDbBenchmarkSample = {
  run: number;
  clientElapsedTimeMs: number;
  requestCount?: number;
  retryCount?: number;
  returnedItemCount?: number;
  evaluatedItemCount?: number;
  filterPassRate?: number;
  consumedCapacity?: DynamoDbCapacityBreakdown;
  completeness: 'complete' | 'bounded' | 'unknown';
};

export type DynamoDbBenchmarkSession = {
  startedAt: string;
  completedAt: string;
  requestedRuns: 3 | 5;
  completedRuns: number;
  samples: DynamoDbBenchmarkSample[];
  medianClientElapsedTimeMs: number;
  averageClientElapsedTimeMs: number;
  minClientElapsedTimeMs: number;
  maxClientElapsedTimeMs: number;
  medianConsumedReadCapacityUnits?: number;
  averageConsumedReadCapacityUnits?: number;
  medianReturnedItemCount?: number;
  medianEvaluatedItemCount?: number;
  mode?: 'page' | 'completeResult';
  completeness?: 'complete' | 'bounded' | 'unknown' | 'mixed';
  boundDescription?: string;
  source: 'performanceTuningBenchmark';
};

// ---------------------------------------------------------------------------
// CloudWatch (§6.5, §7.3). Normalized into named series with explicit
// provenance (window/scope/operation) - never the raw GetMetricData
// response - so a consumer can never mistake a table-wide, period-summed
// series for evidence about the one statement in `statement`.
// ---------------------------------------------------------------------------

export type DynamoDbCloudWatchSeries = {
  metricName: string;
  statistic: string;
  unit?: string;
  scope: 'table' | 'gsi' | 'operation';
  indexName?: string;
  operation?: 'Query' | 'Scan' | 'ExecuteStatement';
  timestamps: string[];
  values: number[];
  // A CloudWatch response with zero datapoints is not the same fact as "0
  // activity" (§7.3) - always check this before reading `values` as zeros.
  noData: boolean;
  source: 'AWS/DynamoDB';
};

export type DynamoDbCloudWatchContext = {
  window: {
    startTime: string;
    endTime: string;
    periodSeconds: number;
  };
  series: DynamoDbCloudWatchSeries[];
};

// ---------------------------------------------------------------------------
// Collection status (§6.2's collection block, §6.5's validator rules)
// ---------------------------------------------------------------------------

export type DynamoDbUnavailableSectionName =
  | 'accessPattern'
  | 'tableDefinition'
  | 'cloudWatchMetrics'
  | 'contributorInsights'
  | 'observation';

export type DynamoDbUnavailableSection = {
  section: DynamoDbUnavailableSectionName;
  tableName?: string;
  indexName?: string;
  reason: string;
  requiredPermissions?: string[];
};

// ---------------------------------------------------------------------------
// The Context itself (§6.2)
// ---------------------------------------------------------------------------

export type DynamoDbServiceContext = {
  provider: 'AWS';
  service: 'DynamoDB';
  region?: string;
  // Only the kind is kept - never the literal custom endpoint URL, which can
  // carry a hostname/port an operator considers sensitive (§6.2).
  endpointKind: 'aws' | 'custom';
  tableName: string;
  indexName?: string;
};

export type DynamoDbStatementContext = {
  language: 'partiql' | 'dynamodb-query';
  // Kept verbatim, unmasked, exactly like RDB's statement.sql (see the note
  // at the top of PerformanceTuningContext.ts) - Preview/Copy Prompt/AI/
  // report all label this text as possibly containing literals.
  text?: string;
  source: 'sqlHistory' | 'editor';
  kind: 'select' | 'query';
  // The single source of truth for whether Run Observed Read may run at all
  // (§7.1, §7.4). v1 sets allowed: false whenever `text` still contains an
  // unresolved `?` PartiQL bind marker (bindParameterEstimator's DBType.Aws
  // support) - DynamoDB has no Bind Parameters Panel equivalent in v1, so
  // there is deliberately no later point where this can become true again
  // for the same Context.
  observationEligibility: {
    allowed: boolean;
    reason?: string;
  };
};

export type DynamoDbPerformanceTuningContext = {
  formatVersion: 1;
  engine: 'dynamodb';

  service: DynamoDbServiceContext;
  statement: DynamoDbStatementContext;

  accessPattern: DynamoDbAccessPattern;
  benchmark?: DynamoDbBenchmarkSession;
  table: DynamoDbTableContext;
  workload?: DynamoDbWorkloadContext;
  observation?: DynamoDbReadObservation;
  cloudWatch?: DynamoDbCloudWatchContext;

  collection: {
    collectedAt: string;
    // 'partial' iff unavailableSections.length > 0 or an
    // affectsCompleteness: true diagnostic is present - an informational
    // diagnostic or a legitimate CloudWatch no-data alone never flips this.
    status: 'complete' | 'partial';
    diagnostics: DynamoDbPerformanceTuningDiagnostic[];
    unavailableSections: DynamoDbUnavailableSection[];
  };
};

// ---------------------------------------------------------------------------
// Params / call-scoped data (§6.6). Values (PartiQL parameters,
// ExpressionAttributeValues, ExclusiveStartKey/LastEvaluatedKey) never enter
// this type or DynamoDbPerformanceTuningContext - see
// DynamoDbPerformanceTuningCallOptions below for where they actually travel.
// ---------------------------------------------------------------------------

// Structural-only mirror of a native Query call: expression strings and
// names, never ExpressionAttributeValues. Field names intentionally match
// AwsDynamoServiceClient.ts's QueryItemsAtClientInputParams closely enough
// that a caller building one from the other is mechanical.
export type DynamoDbQueryAnalysisInput = {
  tableName: string;
  indexName?: string;
  keyConditionExpression: string;
  filterExpression?: string;
  projectionExpression?: string;
  select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'COUNT' | 'SPECIFIC_ATTRIBUTES';
  expressionAttributeNames?: Record<string, string>;
  consistentRead?: boolean;
  scanIndexForward?: boolean;
  // Raw DynamoDB Query API Limit. Query Panel callers must not put their
  // cross-response result cap here; use resultItemLimit instead.
  limit?: number;
  // The cap on items retained in the *combined* result across however many
  // Query requests the panel issues, not a single API call's raw `Limit`
  // (query panel history/performance plan §6.3). A caller building this
  // input from AwsDynamoServiceClient.queryItemsAtClient()'s own params
  // should use this field rather than `limit`.
  resultItemLimit?: number;
};

export type DynamoDbPerformanceTuningContextParams = {
  statement: {
    source: 'sqlHistory' | 'editor';
    request:
      | { kind: 'partiql'; text: string }
      | { kind: 'query'; input: DynamoDbQueryAnalysisInput };
    workload?: DynamoDbWorkloadContext;
    previousObservation?: DynamoDbReadObservation;
  };
  target?: { tableName: string; indexName?: string };
  metrics?: { lookbackMinutes?: number; periodSeconds?: number };
  observation?: {
    mode?: 'static' | 'executeOnce' | 'executeComplete';
    allowExecution?: boolean;
    maxEvaluatedItems?: number;
    maxPages?: number;
    timeoutMs?: number;
  };
  limits?: { maxPayloadBytes?: number; maxIndexes?: number };
};

// Same shape as AwsDynamoServiceClient.ts's own QueryItemsAtClientInputParams
// (= the AWS SDK's QueryCommandInput) - imported directly from the SDK
// rather than re-exported from that driver module, so this types-only file
// never depends on driver implementation code.
export type DynamoDbPerformanceTuningCallOptions = {
  signal?: AbortSignal;
  // Referenced only when observation.mode === 'executeOnce'; ignored (never
  // read) in static mode even if a caller supplies it.
  execution?:
    | { kind: 'partiql'; parameters?: unknown[] }
    | { kind: 'query'; input: QueryCommandInput };
};
