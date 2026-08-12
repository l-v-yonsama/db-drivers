// Public surface of the common automatic-layout layer described in
// misc/automatic-diagram-layout-and-er-migration-plan.md section 4.1. Every diagram generator
// (CfnDependencyGraph, Application Diagram, Multi-AZ, ER) imports only from here - never
// directly from elkLayoutEngine.ts - so the ELK dependency stays swappable in one place.
export type {
  ComputedEdgeLayout,
  ComputedNodeLayout,
  LayoutDirection,
  LayoutEdge,
  LayoutEndpoint,
  LayoutEngineOptions,
  LayoutGraph,
  LayoutNode,
  LayoutPoint,
  LayoutPort,
  LayoutResult,
} from './types';
export {
  disposeAutoLayoutEngine,
  runElkLayout as computeAutoLayout,
} from './elkLayoutEngine';
export {
  anchorFraction,
  estimateLabelSize,
  gridFallbackLayout,
  stableSortGraph,
  validateLayoutResult,
} from './normalizeLayout';
export type {
  ContainmentViolation,
  LayoutValidationReport,
  OverlapViolation,
} from './normalizeLayout';
