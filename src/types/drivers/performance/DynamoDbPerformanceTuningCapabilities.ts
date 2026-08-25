import { CapabilityStatus } from './PerformanceTuningCapabilities';

// See db-notebook repo's
// misc/specs/dynamodb-performance-tuning-implementation-plan.ja.md §9 for the
// full rationale. Reuses the RDB CapabilityStatus shape (available/message/
// source/requiredPermissions) as-is - it already fits "is this DB product
// implemented" + "what can this specific connection actually read right now"
// for DynamoDB too.
//
// observedRead is special: unlike the other four (which describe read-only
// Describe/GetMetricData capabilities and connection-level availability),
// there is no side-effect-free way to check whether a caller's IAM policy
// allows dynamodb:PartiQLSelect/dynamodb:Query without actually reading data.
// So this capability's `available` only answers "does this driver/statement
// support an observed read at all" (e.g. a write statement never does) -
// never "will the caller's IAM policy allow it". Its `message` must say so
// explicitly; an AccessDenied surfaces only as the result of the user
// actually confirming Run Observed Read, never as a pre-flight capability
// check.
export type DynamoDbPerformanceTuningCapabilities = {
  staticAccessPattern: CapabilityStatus;
  tableDefinition: CapabilityStatus;
  cloudWatchMetrics: CapabilityStatus;
  contributorInsightsStatus: CapabilityStatus;
  observedRead: CapabilityStatus;
};

export type DynamoDbPerformanceTuningAvailabilityParams = {
  tableName: string;
  indexName?: string;
};
