// Two-stage support model, mirroring StatementStatistics.ts:
//  - supportsGetPerformanceTuningContext() answers "is this DB product
//    implemented at all", statically, without a connection.
//  - checkPerformanceTuningContextAvailability() answers "what can this
//    specific connection actually read right now", as a read-only diagnostic
//    (permissions, extensions, Query Store state, statistics views, ...).
export type CapabilityStatus = {
  available: boolean;
  message?: string;
  source?: string;
  requiredPermissions?: string[];
};

export type PerformanceTuningCapabilities = {
  executionPlan: CapabilityStatus;
  analyzedExecutionPlan: CapabilityStatus;
  tableDefinition: CapabilityStatus;
  optimizerStatistics: CapabilityStatus;
  physicalHealth: CapabilityStatus;
};

export type PerformanceTuningAvailabilityParams = {
  databaseName: string;
  schemaName?: string;
};
