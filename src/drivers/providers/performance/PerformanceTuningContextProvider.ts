import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  ColumnDefinition,
  ColumnStatisticsContext,
  ActualPlanArtifact,
  ConstraintDefinition,
  DominantCostPlanNodeRef,
  IndexDefinition,
  PartitioningDefinition,
  PerformanceTuningCallOptions,
  PerformanceTuningContextParams,
  PlanTableMapping,
  RuntimeObservation,
  TableStatisticsContext,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';
import {
  PerformanceTuningAvailabilityParams,
  PerformanceTuningCapabilities,
} from '../../../types/drivers/performance/PerformanceTuningCapabilities';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { PerformanceTuningLimits } from '../../../utils/performanceTuningContext';

export type VendorExecutionPlan = {
  raw: unknown;
  planningTimeMs?: number;
  executionTimeMs?: number;
  diagnostics?: PerformanceTuningDiagnostic[];
  planTableMappings?: PlanTableMapping[];
  normalizedPlan?: PlanNode;
  // Database-native runtime evidence. See ExecutionPlanContext.actualPlan.
  actualPlan?: ActualPlanArtifact;
  runtimeObservations?: RuntimeObservation[];
  // See DominantCostPlanNodeRef (PerformanceTuningContext.ts).
  dominantCostPlanNode?: DominantCostPlanNodeRef;
};

export type VendorTableDefinition = {
  ddl?: string;
  columns: ColumnDefinition[];
  constraints: ConstraintDefinition[];
  indexes: IndexDefinition[];
  partitioning?: PartitioningDefinition;
};

export type VendorTableStatistics = Omit<TableStatisticsContext, 'columns'>;

export type VendorColumnStatistics = ColumnStatisticsContext;

export type VendorPhysicalHealthMetric = {
  name: string;
  value: number | string | boolean | null;
  unit?: string;
  estimated?: boolean;
  description?: string;
};

export type VendorPhysicalHealth = {
  metrics: VendorPhysicalHealthMetric[];
};

// Request-scoped identity for a single table collection call.
export type PerformanceTuningTableTarget = {
  databaseName: string;
  schemaName?: string;
  tableName: string;
};

// Threaded through every collection call so a Provider can honor a caller cancellation/timeout and the already-clamped limits from normalizePerformanceTuningContextParams(), instead of re-deriving its own.
export type PerformanceTuningCollectionOptions = PerformanceTuningCallOptions & {
  limits: PerformanceTuningLimits;
  timeoutMs: number;
};

// Per-vendor collection primitives.
export interface PerformanceTuningContextProvider {
  checkCapabilities(
    params: PerformanceTuningAvailabilityParams,
    options?: PerformanceTuningCallOptions,
  ): Promise<GeneralResult<PerformanceTuningCapabilities>>;

  collectExecutionPlan(
    params: PerformanceTuningContextParams,
    options: PerformanceTuningCallOptions & { timeoutMs: number },
  ): Promise<GeneralResult<VendorExecutionPlan>>;

  collectTableDefinition(
    target: PerformanceTuningTableTarget,
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorTableDefinition>>;

  collectTableStatistics(
    target: PerformanceTuningTableTarget,
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorTableStatistics>>;

  collectColumnStatistics(
    target: PerformanceTuningTableTarget & { columnNames: string[] },
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorColumnStatistics[]>>;

  collectPhysicalHealth(
    target: PerformanceTuningTableTarget,
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorPhysicalHealth>>;
}
