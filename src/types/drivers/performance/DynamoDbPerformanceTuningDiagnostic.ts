import { DynamoDbUnavailableSectionName } from './DynamoDbPerformanceTuningContext';

// Stable, structured diagnostics emitted during
// getDynamoDbPerformanceTuningContext() collection - the DynamoDB analogue of
// PerformanceTuningDiagnostic.ts. Kept as its own independent code space
// rather than reusing PerformanceTuningDiagnosticCode: RDB and DynamoDB
// diagnose fundamentally different things (an optimizer plan vs. a static
// access-path classification + Capacity/throttling evidence), and forcing
// them into one enum would make every consumer switch on codes that can
// never actually occur for the Context type it's holding.
//
// Driver-side rule, same as RDB: report a stable `code` plus honest
// technical fields only. Never a conclusion ("add a GSI", "raise Capacity")
// - see db-notebook repo's
// misc/specs/dynamodb-performance-tuning-implementation-plan.ja.md §8 for the
// full inventory this file implements, and §4 for why CloudWatch table-level
// utilization alone never becomes a "this statement caused it" diagnostic.
export type DynamoDbPerformanceTuningDiagnosticSeverity = 'info' | 'warning';

export type DynamoDbPerformanceTuningDiagnosticCode =
  // accessPath resolved to a table-level Scan (no partition key equality/IN
  // guaranteed by the WHERE/KeyCondition boolean tree).
  | 'DYNAMODB_FULL_TABLE_SCAN'
  // accessPath resolved to a Scan against a named index (same rule, index
  // scope).
  | 'DYNAMODB_FULL_INDEX_SCAN'
  // The key condition is satisfied, but the WHERE/FilterExpression also
  // carries at least one non-key predicate that DynamoDB evaluates only
  // after reading each item.
  | 'DYNAMODB_POST_READ_FILTER'
  // The parser could not classify the statement against the decision table
  // (implementation plan §7.2) safely - never defaulted to Scan or Query.
  | 'DYNAMODB_ACCESS_PATTERN_UNRESOLVED'
  // A native Query/Scan observation reported ScannedCount >= 100 and a
  // returned/scanned pass rate below the configured threshold. Never raised
  // for PartiQL (ExecuteStatement has no ScannedCount to compute this from).
  | 'DYNAMODB_HIGH_SCANNED_TO_RETURNED'
  // CloudWatch ReadThrottleEvents > 0 somewhere in the collection window, for
  // the table/index/operation scope this Context targets.
  | 'DYNAMODB_READ_THROTTLING_OBSERVED'
  // CloudWatch ReadKeyRangeThroughputThrottleEvents > 0 - the "hot
  // partition" throttle signal specifically, kept as its own code rather
  // than folded into the general one above because it is the one throttle
  // reason with a distinct remediation shape (partition key design, not
  // Capacity).
  | 'DYNAMODB_KEY_RANGE_THROTTLING_OBSERVED'
  | 'DYNAMODB_PROVISIONED_THROTTLING_OBSERVED'
  | 'DYNAMODB_ON_DEMAND_LIMIT_THROTTLING_OBSERVED'
  | 'DYNAMODB_ACCOUNT_LIMIT_THROTTLING_OBSERVED'
  // Run Observed Read stopped after exactly one API response / a maxEvaluatedItems
  // cap, as designed - informational, not a collection problem.
  | 'DYNAMODB_OBSERVATION_BOUNDED'
  // DescribeTable's ItemCount/TableSizeBytes are being surfaced - both are
  // AWS-documented approximations updated roughly every six hours, never an
  // exact count.
  | 'DYNAMODB_APPROXIMATE_TABLE_METADATA'
  // A CloudWatch GetMetricData call succeeded but returned zero datapoints
  // for the window - distinct from "0 activity"; see
  // DynamoDbCloudWatchSeries.noData.
  | 'DYNAMODB_CLOUDWATCH_NO_DATA'
  // A Describe*/GetMetricData call in the static collection sequence failed
  // (permissions, throttling, timeout, ...) - the corresponding section is
  // also recorded in collection.unavailableSections.
  | 'DYNAMODB_SECTION_COLLECTION_FAILED'
  // Payload/index limits (§7.1) trimmed the Context to stay under
  // maxPayloadBytes.
  | 'DYNAMODB_COLLECTION_TRUNCATED';

export type DynamoDbPerformanceTuningDiagnostic = {
  code: DynamoDbPerformanceTuningDiagnosticCode;
  severity: DynamoDbPerformanceTuningDiagnosticSeverity;
  // Same independence from `severity` as the RDB type: every warning defined
  // above does set this true today, but the two are deliberately not derived
  // from one another.
  affectsCompleteness: boolean;
  scope: DynamoDbUnavailableSectionName | 'collection';
  // Driver-side technical fallback text (English, not localized) - see
  // PerformanceTuningDiagnostic.ts's identical field for the rationale.
  message: string;
  tableName?: string;
  indexName?: string;
  metricName?: string;
};
