
/** A fixed anchor point on a node's own boundary (a table's FK column row, an ALB's listener attachment point, ...). */
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
  /** Parent node id for a compound/nested node (a VPC, an AZ, a Subnet, a table is always a leaf). */
  parentId?: string;
  ports?: LayoutPort[];
  /** Per-node ELK layout option overrides (e.g. padding for a container). */
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
  /** Rendered size of `label`, in the same units as node width/height. */
  labelSize?: { width: number; height: number };
  layoutOptions?: Record<string, string>;
};

export type LayoutDirection = 'DOWN' | 'RIGHT' | 'UP' | 'LEFT';

export type LayoutGraph = {
  id: string;
  direction: LayoutDirection;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  layoutOptions?: Record<string, string>;
};

export type LayoutPoint = { x: number; y: number };

export type ComputedNodeLayout = {
  id: string;
  /** Absolute coordinates (root-relative, matching draw.io's coordinate space once the parent node the draw.io cell nests under matches `parentId`). */
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ComputedEdgeLayout = {
  id: string;
  sourcePoint: LayoutPoint;
  targetPoint: LayoutPoint;
  /** Intermediate bend/waypoints between source and target, absolute coordinates, already excluding the source/target points themselves. */
  bendPoints: LayoutPoint[];
};

export type LayoutResult = {
  nodes: Map<string, ComputedNodeLayout>;
  edges: Map<string, ComputedEdgeLayout>;
  /** true when ELK layout succeeded; false when the grid fallback (see normalizeLayout.ts) was used instead, either because ELK threw/timed out or because it was never attempted. */
  usedAutoLayout: boolean;
};

export type LayoutEngineOptions = {
  /** Milliseconds to wait for ELK before falling back to the grid layout. Default: 8000. */
  timeoutMs?: number;
  /** Use a real worker thread (via the optional `web-worker` package) so the layout computation does not block the Node event loop. */
  useWorker?: boolean;
};
