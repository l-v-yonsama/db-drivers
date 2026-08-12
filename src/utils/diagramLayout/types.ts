// Library-agnostic intermediate model for automatic diagram layout (see
// misc/automatic-diagram-layout-and-er-migration-plan.md, section 4.1). No `elk*` type ever
// leaks out of `diagramLayout/` - every generator (CfnDependencyGraph, Application Diagram,
// Multi-AZ, ER) talks to this module only through the types below, so the layout engine
// (currently ELK) can be swapped without touching a single diagram generator.

/** A fixed anchor point on a node's own boundary (a table's FK column row, an ALB's listener
 * attachment point, ...). Coordinates are local to the owning node's top-left corner. Ports are
 * always laid out with `FIXED_POS` semantics - the caller decides the exact row/column position,
 * ELK never moves a port relative to its node. */
export type LayoutPort = {
  id: string;
  /** Local x offset from the node's left edge. */
  x: number;
  /** Local y offset from the node's top edge. */
  y: number;
  width?: number;
  height?: number;
};

export type LayoutNode = {
  id: string;
  width: number;
  height: number;
  /** Parent node id for a compound/nested node (a VPC, an AZ, a Subnet, a table is always a
   * leaf). Omit for a top-level node. */
  parentId?: string;
  ports?: LayoutPort[];
  /** Per-node ELK layout option overrides (e.g. padding for a container). Merged over the
   * graph-level defaults, never replacing them wholesale. */
  layoutOptions?: Record<string, string>;
};

export type LayoutEndpoint = {
  nodeId: string;
  portId?: string;
};

export type LayoutEdge = {
  id: string;
  source: LayoutEndpoint;
  target: LayoutEndpoint;
  label?: string;
  /** Rendered size of `label`, in the same units as node width/height. Without this, ELK treats
   * the label as zero-sized and reserves no room for it - fine for a short kind name ("Ref",
   * "GetAtt", ...) but a long ER relation label ("orders_customer_fk: customer_id >=1 →
   * id 1") then ends up stamped on top of the neighboring node, since the layer gap was sized
   * for node spacing only. Provide this whenever a label's rendered width could plausibly
   * exceed the graph's node-to-node spacing. */
  labelSize?: { width: number; height: number };
  layoutOptions?: Record<string, string>;
};

export type LayoutDirection = 'DOWN' | 'RIGHT' | 'UP' | 'LEFT';

export type LayoutGraph = {
  id: string;
  direction: LayoutDirection;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  /** Graph-level ELK option overrides, merged over the common-layer defaults documented in
   * misc/automatic-diagram-layout-and-er-migration-plan.md 4.1. */
  layoutOptions?: Record<string, string>;
};

export type LayoutPoint = { x: number; y: number };

export type ComputedNodeLayout = {
  id: string;
  /** Absolute coordinates (root-relative, matching draw.io's coordinate space once the parent
   * node the draw.io cell nests under matches `parentId`). */
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ComputedEdgeLayout = {
  id: string;
  sourcePoint: LayoutPoint;
  targetPoint: LayoutPoint;
  /** Intermediate bend/waypoints between source and target, absolute coordinates, already
   * excluding the source/target points themselves. */
  bendPoints: LayoutPoint[];
};

export type LayoutResult = {
  nodes: Map<string, ComputedNodeLayout>;
  edges: Map<string, ComputedEdgeLayout>;
  /** true when ELK layout succeeded; false when the grid fallback (see normalizeLayout.ts) was
   * used instead, either because ELK threw/timed out or because it was never attempted. */
  usedAutoLayout: boolean;
};

export type LayoutEngineOptions = {
  /** Milliseconds to wait for ELK before falling back to the grid layout. Default: 8000. */
  timeoutMs?: number;
  /** Use a real worker thread (via the optional `web-worker` package) so the layout computation
   * does not block the Node event loop. Default: true. See plan 4.2 "Node実行環境でのワーカー配線"
   * for the measured effect of this flag. */
  useWorker?: boolean;
};
