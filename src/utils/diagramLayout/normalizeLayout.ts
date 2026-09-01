import {
  ComputedEdgeLayout,
  ComputedNodeLayout,
  LayoutGraph,
  LayoutNode,
  LayoutResult,
} from './types';

export const estimateLabelSize = (
  text: string,
  fontSizePx = 12,
): { width: number; height: number } => ({
  width: Math.ceil(text.length * fontSizePx * 0.62) + 16,
  height: Math.ceil(fontSizePx * 1.6),
});

export const anchorFraction = (
  point: { x: number; y: number },
  box: { x: number; y: number; width: number; height: number },
): { x: number; y: number } => ({
  x: Math.min(1, Math.max(0, box.width === 0 ? 0.5 : (point.x - box.x) / box.width)),
  y: Math.min(1, Math.max(0, box.height === 0 ? 0.5 : (point.y - box.y) / box.height)),
});

/** Returns a copy of `graph` with nodes and edges sorted by id. */
export const stableSortGraph = (graph: LayoutGraph): LayoutGraph => ({
  ...graph,
  nodes: [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id)),
  edges: [...graph.edges].sort((a, b) => a.id.localeCompare(b.id)),
});

export type ContainmentViolation = {
  nodeId: string;
  parentId: string;
  reason: 'out-of-bounds';
};

export type OverlapViolation = {
  nodeId: string;
  otherNodeId: string;
};

export type LayoutValidationReport = {
  containmentViolations: ContainmentViolation[];
  siblingOverlaps: OverlapViolation[];
};

/** Checks the two invariants the plan's test strategy (8.1/8.2) leans on instead of exact coordinate equality: every child sits inside its parent's box, and siblings never overlap. */
export const validateLayoutResult = (
  graph: LayoutGraph,
  result: LayoutResult,
): LayoutValidationReport => {
  const containmentViolations: ContainmentViolation[] = [];
  const siblingOverlaps: OverlapViolation[] = [];
  const childrenByParent = new Map<string, LayoutNode[]>();
  graph.nodes.forEach((node) => {
    const key = node.parentId ?? '';
    childrenByParent.set(key, [...(childrenByParent.get(key) ?? []), node]);
  });

  childrenByParent.forEach((siblings, parentKey) => {
    const parentBox = parentKey ? result.nodes.get(parentKey) : undefined;
    for (let i = 0; i < siblings.length; i++) {
      const a = result.nodes.get(siblings[i].id);
      if (!a) continue;
      if (parentBox) {
        // `a`/`parentBox` are both absolute (root-relative) coordinates - see ComputedNodeLayout's doc comment - so containment has to be checked against the parent's own absolute origin, not against 0/0.
        const withinX = a.x >= parentBox.x - 0.01 && a.x + a.width <= parentBox.x + parentBox.width + 0.01;
        const withinY = a.y >= parentBox.y - 0.01 && a.y + a.height <= parentBox.y + parentBox.height + 0.01;
        if (!withinX || !withinY) {
          containmentViolations.push({
            nodeId: siblings[i].id,
            parentId: parentKey,
            reason: 'out-of-bounds',
          });
        }
      }
      for (let j = i + 1; j < siblings.length; j++) {
        const b = result.nodes.get(siblings[j].id);
        if (!b) continue;
        const overlapsX = a.x < b.x + b.width && b.x < a.x + a.width;
        const overlapsY = a.y < b.y + b.height && b.y < a.y + a.height;
        if (overlapsX && overlapsY) {
          siblingOverlaps.push({ nodeId: siblings[i].id, otherNodeId: siblings[j].id });
        }
      }
    }
  });

  return { containmentViolations, siblingOverlaps };
};

/** Deterministic grid fallback for ELK failures or timeouts. */
export const gridFallbackLayout = (graph: LayoutGraph): LayoutResult => {
  const nodes = new Map<string, ComputedNodeLayout>();
  const sorted = stableSortGraph(graph);
  const childrenByParent = new Map<string, LayoutNode[]>();
  sorted.nodes.forEach((node) => {
    const key = node.parentId ?? '';
    childrenByParent.set(key, [...(childrenByParent.get(key) ?? []), node]);
  });

  const GAP = 40;
  const COLUMNS = 3;

  // Parents must be sized/placed before children can be positioned relative to them, and a parent's own size depends on its children, so nodes are processed in topological (parent before descendants) order via BFS from the root groups (key === '').
  const layoutGroup = (parentKey: string, originX: number, originY: number): {
    width: number;
    height: number;
  } => {
    const children = childrenByParent.get(parentKey) ?? [];
    let cursorX = 0;
    let cursorY = 0;
    let rowHeight = 0;
    let maxX = 0;
    children.forEach((child, index) => {
      if (index > 0 && index % COLUMNS === 0) {
        cursorX = 0;
        cursorY += rowHeight + GAP;
        rowHeight = 0;
      }
      // A compound child's own size is only known after laying out its descendants, so recurse first using a provisional origin, then use the returned size for this cell's placement.
      const childHasChildren = (childrenByParent.get(child.id) ?? []).length > 0;
      const size = childHasChildren
        ? layoutGroup(child.id, originX + cursorX, originY + cursorY)
        : { width: child.width, height: child.height };
      nodes.set(child.id, {
        id: child.id,
        x: originX + cursorX,
        y: originY + cursorY,
        width: size.width,
        height: size.height,
      });
      cursorX += size.width + GAP;
      rowHeight = Math.max(rowHeight, size.height);
      maxX = Math.max(maxX, cursorX - GAP);
    });
    return { width: Math.max(maxX, 1), height: cursorY + rowHeight };
  };

  layoutGroup('', 0, 0);

  const edges = new Map<string, ComputedEdgeLayout>();
  graph.edges.forEach((edge) => {
    const source = nodes.get(edge.source.nodeId);
    const target = nodes.get(edge.target.nodeId);
    if (!source || !target) return;
    // Centers, not port positions - this fallback does not attempt port-accurate anchoring (see this function's doc comment); callers render these as plain, un-anchored draw.io edges.
    edges.set(edge.id, {
      id: edge.id,
      sourcePoint: { x: source.x + source.width / 2, y: source.y + source.height / 2 },
      targetPoint: { x: target.x + target.width / 2, y: target.y + target.height / 2 },
      bendPoints: [],
    });
  });

  return { nodes, edges, usedAutoLayout: false };
};
