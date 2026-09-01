import { CapabilityStatus } from './PerformanceTuningCapabilities';

// Observed-read availability describes driver support; IAM is verified only by an authorized read.
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
