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
