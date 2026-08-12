import {
  ComputedEdgeLayout,
  ComputedNodeLayout,
  LayoutGraph,
  LayoutNode,
  LayoutResult,
} from './types';

/** Rough estimate of a label's rendered pixel size at draw.io's default ~12px sans-serif label
 * font. ELK has no font metrics of its own - an edge `label` passed without a `labelSize` is
 * treated as zero-width and gets zero room reserved for it in the layer-to-layer gap, which is
 * invisible for a short kind name ("Ref", "GetAtt") but silently stamps a long ER relation label
 * ("orders_customer_fk: customer_id >=1 → id 1") on top of the neighboring table (see
 * misc/automatic-diagram-layout-and-er-migration-plan.md's ER Phase 7 follow-up notes). This is
 * intentionally a rough average-character-width estimate, not exact text measurement (no
 * canvas/DOM is available in this package) - erring generous just widens the gap slightly, while
 * erring short reproduces the overlap bug this exists to prevent. */
export const estimateLabelSize = (
  text: string,
  fontSizePx = 12,
): { width: number; height: number } => ({
  width: Math.ceil(text.length * fontSizePx * 0.62) + 16,
  height: Math.ceil(fontSizePx * 1.6),
});

/** Fraction (0..1, clamped) of `point` along `box`'s width/height - turns an absolute point (an
 * ELK-computed edge endpoint, typically) into a draw.io `exitX/exitY`/`entryX/entryY` anchor.
 * Shared by CfnDependencyGraph and the ER draw.io generator (found identically duplicated in
 * both during a cross-cutting review - see misc/automatic-diagram-layout-and-er-migration-plan.md's
 * duplication cleanup notes); pure coordinate math with no draw.io/CFN/ER-specific knowledge, so
 * it belongs in the common layout layer both of them already depend on rather than in either
 * one's own module. */
export const anchorFraction = (
  point: { x: number; y: number },
  box: { x: number; y: number; width: number; height: number },
): { x: number; y: number } => ({
  x: Math.min(1, Math.max(0, box.width === 0 ? 0.5 : (point.x - box.x) / box.width)),
  y: Math.min(1, Math.max(0, box.height === 0 ? 0.5 : (point.y - box.y) / box.height)),
});

/** Returns a copy of `graph` with nodes and edges sorted by id. ELK's layered algorithm is
 * itself deterministic for a fixed input order, but the order the caller happens to iterate a
 * `Map`/object in is not guaranteed across engines or refactors - sorting here is what actually
 * pins the result down input-order-independently, per plan 4.1 item 3. */
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

/** Checks the two invariants the plan's test strategy (8.1/8.2) leans on instead of exact
 * coordinate equality: every child sits inside its parent's box, and siblings never overlap.
 * Root-level nodes (no parentId) are treated as siblings of one another. */
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
        // `a`/`parentBox` are both absolute (root-relative) coordinates - see
        // ComputedNodeLayout's doc comment - so containment has to be checked against the
        // parent's own absolute origin, not against 0/0. A parent sitting anywhere but the
        // canvas origin (true for essentially every non-trivial diagram: a second top-level
        // group, a nested AZ/Subnet, ...) previously made this flag every genuinely-contained
        // child as a violation while potentially missing a real out-of-bounds child whose
        // absolute position happened to still fall under the parent's raw width/height.
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

/** Simple deterministic grid fallback used when ELK fails or times out (plan 4.1 item 5). Lays
 * out each parent's children in a fixed-column grid sized to the widest/tallest child in that
 * group; it does not attempt real edge routing, but it still returns one entry per input edge
 * (source/target node centers, no bend points) - every generator keys its `if (!edge) return`
 * guard off `layout.edges.get(id)` being present, so an *empty* edges map here doesn't just
 * degrade the layout, it silently drops every dependency/relationship line the diagram exists to
 * show (found via review after Phase 7 shipped - see plan 4.1's fallback notes). Callers should
 * check `result.usedAutoLayout` and fall back to plain source/target routing (no bend points, no
 * exit/entry anchors) when it is `false`, letting draw.io's own connector routing take over
 * instead of trusting this fallback's coordinates for precise anchoring. */
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

  // Parents must be sized/placed before children can be positioned relative to them, and a
  // parent's own size depends on its children, so nodes are processed in topological (parent
  // before descendants) order via BFS from the root groups (key === '').
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
      // A compound child's own size is only known after laying out its descendants, so recurse
      // first using a provisional origin, then use the returned size for this cell's placement.
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
    // Centers, not port positions - this fallback does not attempt port-accurate anchoring (see
    // this function's doc comment); callers render these as plain, un-anchored draw.io edges.
    edges.set(edge.id, {
      id: edge.id,
      sourcePoint: { x: source.x + source.width / 2, y: source.y + source.height / 2 },
      targetPoint: { x: target.x + target.width / 2, y: target.y + target.height / 2 },
      bendPoints: [],
    });
  });

  return { nodes, edges, usedAutoLayout: false };
};
