import { QueryCommandInput } from '@aws-sdk/client-dynamodb';
import {
  MetricValue,
  PerformanceTuningContext,
} from './PerformanceTuningContext';
import { DynamoDbPerformanceTuningDiagnostic } from './DynamoDbPerformanceTuningDiagnostic';

// DynamoDB exposes access-pattern evidence rather than an EXPLAIN-style plan.

export type AnyPerformanceTuningContext =
  | PerformanceTuningContext
  | DynamoDbPerformanceTuningContext;

// Preserve compatibility with RDB contexts by discriminating only on DynamoDB's `engine` field.
export function isDynamoDbPerformanceTuningContext(
  context: AnyPerformanceTuningContext,
): context is DynamoDbPerformanceTuningContext {
  return 'engine' in context && context.engine === 'dynamodb';
}

// Access paths are statically classified from key conditions; they are not observed execution plans.

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
  // `unknown` means the parser could not safely classify the statement.
  confidence: 'certain' | 'unknown';
  tableName: string;
  indexName?: string;
  indexType?: 'LSI' | 'GSI';
  partitionKey?: {
    attributeName: string;
    // DynamoDB partition-key conditions support only equality or IN here.
    operator?: '=' | 'IN';
    conditionPresent: boolean;
  };
  sortKey?: {
    attributeName: string;
    operator?: DynamoDbKeyConditionOperator;
    conditionPresent: boolean;
  };
  // Post-read filters are evaluated after read capacity has been consumed.
  postReadFilter: {
    present: boolean;
    attributes: string[];
  };
  projection: {
    // Index queries default to projected attributes, not all table attributes.
    mode: 'allAttributes' | 'allProjectedAttributes' | 'specific';
    allAttributes: boolean;
    attributes: string[];
  };
  consistentRead: 'eventual' | 'strong' | 'unknown';
  // Raw DynamoDB API limit; `resultItemLimit` is the cross-response result cap.
  limit?: number;
  resultItemLimit?: number;
  scanForward?: boolean;
};

// Table and index definitions are normalized directly from DescribeTable.

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
  // Populated only for INCLUDE projections.
  nonKeyAttributes?: string[];
};

// Normalized read/write capacity pair used by provisioned and warm throughput.
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
  // Approximate metadata periodically updated by AWS.
  itemCount?: MetricValue<number>;
  indexSizeBytes?: MetricValue<number>;
  // GSI only; LSIs share the base table's throughput.
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
  // DescribeTable reports key attributes, not a complete column list.
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
  // Key-level Contributor Insights reports are excluded because they may contain sensitive data.
  contributorInsights: DynamoDbContributorInsightsStatus[];
};

// Capacity, rolling workload, and one-off observations remain distinct evidence sources.

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
  // Per-index values are present only when ReturnConsumedCapacity is INDEXES.
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

  // Native Query/Scan history aggregates for the same structural statement.
  readObservationSampleCount?: number;
  evaluatedCountSampleCount?: number;
  totalReturnedItemCount?: number;
  totalEvaluatedItemCount?: number;
  // Computed from aggregate returned/evaluated totals, not averaged sample rates.
  weightedFilterPassRate?: number;
  minFilterPassRate?: number;
  maxFilterPassRate?: number;
  lastFilterPassRate?: number;
  // Number of samples that ended with a continuation token.
  boundedObservationCount?: number;
};

export type DynamoDbReadObservation = {
  source: 'sqlHistory' | 'observedRead';
  observedAt?: string;
  clientElapsedTimeMs?: number;
  requestCount?: number;
  retryCount?: number;
  returnedItemCount?: number;
  // Native Query/Scan only; ExecuteStatement does not return ScannedCount.
  evaluatedItemCount?: number;
  // Returned/evaluated ratio, available only when evaluatedItemCount is positive.
  filterPassRate?: number;
  consumedCapacity?: DynamoDbCapacityBreakdown;
  hasMorePages?: boolean;
  // Compatibility flag indicating that the observation ended before completion.
  bounded: boolean;
  boundDescription?: string;
  // Three-state completeness; optional for compatibility with older observations.
  completeness?: 'complete' | 'bounded' | 'unknown';
};

// Explicit 3/5-run session; completeResult follows pages within safety limits.
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

// CloudWatch data is normalized with scope and window provenance.

export type DynamoDbCloudWatchSeries = {
  metricName: string;
  statistic: string;
  unit?: string;
  scope: 'table' | 'gsi' | 'operation';
  indexName?: string;
  operation?: 'Query' | 'Scan' | 'ExecuteStatement';
  timestamps: string[];
  values: number[];
  // No datapoints means no data, not zero activity.
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

// Collection status records unavailable evidence separately from diagnostics.

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

export type DynamoDbServiceContext = {
  provider: 'AWS';
  service: 'DynamoDB';
  region?: string;
  // Store endpoint kind only; custom URLs may contain sensitive host details.
  endpointKind: 'aws' | 'custom';
  tableName: string;
  indexName?: string;
};

export type DynamoDbStatementContext = {
  language: 'partiql' | 'dynamodb-query';
  // Statement text is verbatim and may contain literals.
  text?: string;
  source: 'sqlHistory' | 'editor';
  kind: 'select' | 'query';
  // Unresolved PartiQL bind markers make observed execution ineligible.
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
    // Partial means required evidence is unavailable or a diagnostic affects completeness.
    status: 'complete' | 'partial';
    diagnostics: DynamoDbPerformanceTuningDiagnostic[];
    unavailableSections: DynamoDbUnavailableSection[];
  };
};

// Runtime values and continuation keys stay in call-scoped options, never the context.

// Structural native Query input without ExpressionAttributeValues.
export type DynamoDbQueryAnalysisInput = {
  tableName: string;
  indexName?: string;
  keyConditionExpression: string;
  filterExpression?: string;
  projectionExpression?: string;
  select?:
    | 'ALL_ATTRIBUTES'
    | 'ALL_PROJECTED_ATTRIBUTES'
    | 'COUNT'
    | 'SPECIFIC_ATTRIBUTES';
  expressionAttributeNames?: Record<string, string>;
  consistentRead?: boolean;
  scanIndexForward?: boolean;
  // Raw per-request DynamoDB Query limit.
  limit?: number;
  // Cap on combined results across Query Panel requests.
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

// Uses the SDK type directly so this types-only module does not depend on driver code.
export type DynamoDbPerformanceTuningCallOptions = {
  signal?: AbortSignal;
  // Used only when observation mode executes a read.
  execution?:
    | { kind: 'partiql'; parameters?: unknown[] }
    | { kind: 'query'; input: QueryCommandInput };
};
