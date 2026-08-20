import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  ColumnDefinition,
  ColumnStatisticsContext,
  ConstraintDefinition,
  IndexDefinition,
  PartitioningDefinition,
  PerformanceTuningCallOptions,
  PerformanceTuningContextParams,
  PlanTableMapping,
  TableStatisticsContext,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';
import {
  PerformanceTuningAvailabilityParams,
  PerformanceTuningCapabilities,
} from '../../../types/drivers/performance/PerformanceTuningCapabilities';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { PerformanceTuningLimits } from '../../../utils/performanceTuningContext';

// Vendor-side collection shapes, prior to RDSBaseDriver applying common
// units/limits (§6.1). These mirror the public context types field-for-field
// on purpose: no literal-masking boundary is applied here, matching every
// other AI-facing path already shipped in db-notebook (see the note at the
// top of PerformanceTuningContext.ts).
export type VendorExecutionPlan = {
  raw: unknown;
  planningTimeMs?: number;
  executionTimeMs?: number;
  // Structured diagnostics the plan parser produced while walking the plan
  // (implementation plan §4.4) - a node that reads from a
  // non-table source, an unresolved table mapping, a vendor-reported plan
  // observation, ... RDSBaseDriver folds these into
  // PerformanceTuningContext.collection.diagnostics rather than this type
  // carrying its own separate warnings array.
  diagnostics?: PerformanceTuningDiagnostic[];
  // Table/alias/index/predicate-column resolution, computed by the Provider
  // directly from its own vendor-specific plan JSON (§10 Phase 1). Already
  // in the common `PlanTableMapping` shape - no vendor-specific mapping type
  // exists because there's nothing vendor-specific left once resolved.
  planTableMappings?: PlanTableMapping[];
  // Vendor plan normalized into the common, vendor-neutral tree (§10 Phase
  // 2). Built from the same walk as planTableMappings above, so node IDs
  // line up between the two (a mapping's planNodeId always matches a node
  // somewhere in this tree).
  normalizedPlan?: PlanNode;
  // See ExecutionPlanContext.actualPlanText - MySQL-only today.
  actualPlanText?: string;
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

// Request-scoped identity for a single table collection call. databaseName
// is required (not inherited from "whatever the connection is currently
// pointed at") because SQL Server/MySQL connections can have a mutable
// current-database, and a stale/ambient value would silently collect a
// same-named table in the wrong database.
export type PerformanceTuningTableTarget = {
  databaseName: string;
  schemaName?: string;
  tableName: string;
};

// Threaded through every collection call so a Provider can honor a caller
// cancellation/timeout and the already-clamped limits from
// normalizePerformanceTuningContextParams(), instead of re-deriving its own.
// `RDSBaseDriver` always enforces `timeoutMs` itself (a call that doesn't
// resolve in time is treated as failed regardless of what the Provider
// does), so a Provider is never required to also implement server-side
// query cancellation to honor it - but one that can (e.g. issuing its own
// statement-level timeout) should use this value rather than hard-coding one.
export type PerformanceTuningCollectionOptions = PerformanceTuningCallOptions & {
  limits: PerformanceTuningLimits;
  timeoutMs: number;
};

// Per-vendor collection primitives. A Provider only talks to the
// already-connected Driver's read APIs - it does not open/close
// connections, call AI, or touch UI. RDSBaseDriver.getPerformanceTuningContext()
// orchestrates calls into this interface (validate -> capability -> plan ->
// target resolution -> table sections -> normalize -> validate schema) so
// vendor code never duplicates that sequencing, and is responsible for
// converting a thrown Provider exception into a GeneralResult before it
// crosses the public API boundary.
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
