// eslint-disable-next-line @typescript-eslint/no-require-imports
const ELKConstructor = require('elkjs/lib/elk.bundled.js');
import type {
  ComputedEdgeLayout,
  ComputedNodeLayout,
  LayoutEdge,
  LayoutEngineOptions,
  LayoutGraph,
  LayoutNode,
  LayoutPoint,
  LayoutResult,
} from './types';
import { gridFallbackLayout, stableSortGraph } from './normalizeLayout';

// ELK's own element shapes, kept private to this file - see plan 4.1: no ELK type is allowed to
// leak past `diagramLayout/index.ts`.
type ElkPoint = { x: number; y: number };
type ElkPort = { id: string; x: number; y: number; width: number; height: number };
type ElkEdgeSection = {
  startPoint: ElkPoint;
  endPoint: ElkPoint;
  bendPoints?: ElkPoint[];
};
type ElkExtendedEdge = {
  id: string;
  sources: string[];
  targets: string[];
  labels?: { text: string; width?: number; height?: number }[];
  layoutOptions?: Record<string, string>;
  sections?: ElkEdgeSection[];
};
type ElkNode = {
  id: string;
  x?: number;
  y?: number;
  width: number;
  height: number;
  ports?: ElkPort[];
  layoutOptions?: Record<string, string>;
  children?: ElkNode[];
  edges?: ElkExtendedEdge[];
};

/** Common-layer defaults documented in
 * misc/automatic-diagram-layout-and-er-migration-plan.md section 4.1 "ELK設定方針（初期値）". A
 * caller overrides a specific key through `LayoutGraph.layoutOptions`; these are merged under
 * that override, never replacing it. */
const DEFAULT_LAYOUT_OPTIONS: Record<string, string> = {
  'elk.algorithm': 'layered',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.spacing.nodeNodeBetweenLayers': '60',
  'elk.spacing.nodeNode': '40',
};

const directionToElk = (
  direction: LayoutGraph['direction'],
): string => direction; // ELK accepts 'DOWN' | 'RIGHT' | 'UP' | 'LEFT' verbatim.

/** Finds the lowest node id both `a` and `b` are nested under ('' for "the graph root" when they
 * share no non-root ancestor), so a cross-boundary edge (e.g. a Dependency Graph edge that spans
 * two stacks) is attached at the right level of the ELK tree - the same placement the Phase 1 PoC
 * validated (see the plan's Phase 1 section). */
const lowestCommonAncestor = (
  parentOf: Map<string, string | undefined>,
  a: string,
  b: string,
): string => {
  const ancestorsOfA = new Set<string>();
  let cursor: string | undefined = a;
  while (cursor !== undefined) {
    ancestorsOfA.add(cursor);
    cursor = parentOf.get(cursor);
  }
  cursor = b;
  while (cursor !== undefined) {
    if (ancestorsOfA.has(cursor)) return cursor;
    cursor = parentOf.get(cursor);
  }
  return '';
};

const buildElkTree = (graph: LayoutGraph): ElkNode => {
  const parentOf = new Map<string, string | undefined>();
  graph.nodes.forEach((node) => parentOf.set(node.id, node.parentId));

  const elkNodeById = new Map<string, ElkNode>();
  graph.nodes.forEach((node: LayoutNode) => {
    const hasPorts = (node.ports?.length ?? 0) > 0;
    elkNodeById.set(node.id, {
      id: node.id,
      width: node.width,
      height: node.height,
      ports: node.ports?.map((port) => ({
        id: port.id,
        x: port.x,
        y: port.y,
        width: port.width ?? 1,
        height: port.height ?? 1,
      })),
      layoutOptions: hasPorts
        ? { 'elk.portConstraints': 'FIXED_POS', ...node.layoutOptions }
        : node.layoutOptions,
      children: [],
      edges: [],
    });
  });

  const root: ElkNode = {
    id: graph.id,
    width: 0,
    height: 0,
    children: [],
    edges: [],
    layoutOptions: {
      ...DEFAULT_LAYOUT_OPTIONS,
      'elk.direction': directionToElk(graph.direction),
      ...graph.layoutOptions,
    },
  };
  elkNodeById.set('', root);

  graph.nodes.forEach((node) => {
    const parent = elkNodeById.get(node.parentId ?? '') ?? root;
    parent.children = parent.children ?? [];
    parent.children.push(elkNodeById.get(node.id) as ElkNode);
  });

  graph.edges.forEach((edge: LayoutEdge) => {
    const sourceNodeParent = parentOf.get(edge.source.nodeId);
    const targetNodeParent = parentOf.get(edge.target.nodeId);
    const lca = edge.source.nodeId === edge.target.nodeId
      ? (sourceNodeParent ?? '')
      : lowestCommonAncestor(parentOf, edge.source.nodeId, edge.target.nodeId);
    const container = elkNodeById.get(lca) ?? root;
    container.edges = container.edges ?? [];
    container.edges.push({
      id: edge.id,
      sources: [edge.source.portId ?? edge.source.nodeId],
      targets: [edge.target.portId ?? edge.target.nodeId],
      labels: edge.label
        ? [{
            text: edge.label,
            width: edge.labelSize?.width,
            height: edge.labelSize?.height,
          }]
        : undefined,
      layoutOptions: edge.layoutOptions,
    });
    void targetNodeParent;
  });

  return root;
};

const collectResult = (root: ElkNode): LayoutResult => {
  const nodes = new Map<string, ComputedNodeLayout>();
  const edges = new Map<string, ComputedEdgeLayout>();

  const walkNodes = (elkNode: ElkNode, parentAbsX: number, parentAbsY: number): void => {
    const absX = parentAbsX + (elkNode.x ?? 0);
    const absY = parentAbsY + (elkNode.y ?? 0);
    if (elkNode.id !== root.id) {
      nodes.set(elkNode.id, {
        id: elkNode.id,
        x: absX,
        y: absY,
        width: elkNode.width,
        height: elkNode.height,
      });
    }
    (elkNode.children ?? []).forEach((child) => walkNodes(child, absX, absY));
  };
  walkNodes(root, 0, 0);

  // Edges may be declared at any level of the tree (see lowestCommonAncestor above); their
  // section coordinates from ELK are already relative to that container, so the same
  // parent-offset accumulation used for nodes applies while walking back down to collect them.
  const walkEdges = (elkNode: ElkNode, parentAbsX: number, parentAbsY: number): void => {
    const absX = parentAbsX + (elkNode.x ?? 0);
    const absY = parentAbsY + (elkNode.y ?? 0);
    (elkNode.edges ?? []).forEach((edge) => {
      const section = edge.sections?.[0];
      if (!section) return;
      const toAbs = (point: ElkPoint): LayoutPoint => ({ x: point.x + absX, y: point.y + absY });
      edges.set(edge.id, {
        id: edge.id,
        sourcePoint: toAbs(section.startPoint),
        targetPoint: toAbs(section.endPoint),
        bendPoints: (section.bendPoints ?? []).map(toAbs),
      });
    });
    (elkNode.children ?? []).forEach((child) => walkEdges(child, absX, absY));
  };
  walkEdges(root, 0, 0);

  return { nodes, edges, usedAutoLayout: true };
};

/** Resolves a real Node worker so ELK does not block the caller's event loop - see plan 4.2
 * "Node実行環境でのワーカー配線". Returns `undefined` (and lets ELK fall back to its bundled
 * synchronous fake worker) if `web-worker` cannot be resolved, e.g. in a bundled/browser build
 * that intentionally excludes it. */
const resolveWorkerUrl = (): string | undefined => {
  try {
    require.resolve('web-worker');
    return require.resolve('elkjs/lib/elk-worker.min.js');
  } catch {
    return undefined;
  }
};

// A `workerUrl`-configured ELK instance owns a real `worker_threads` Worker for its whole
// lifetime; creating a fresh one per `runElkLayout()` call would leak one OS thread per diagram
// generated (and, under Jest, leaves the process unable to exit - "Jest did not exit one second
// after the test run has completed" - since nothing ever calls `terminateWorker()`). Both ELK
// instances are therefore cached at module scope and reused; `disposeAutoLayoutEngine()` below
// exists purely so a test suite (or a graceful extension-host shutdown) can close the worker
// thread on demand instead of leaving it dangling.
let cachedWorkerElk: { layout: (g: unknown) => Promise<unknown>; terminateWorker?: () => void } | undefined;
let cachedPlainElk: { layout: (g: unknown) => Promise<unknown> } | undefined;

const getElkInstance = (useWorker: boolean): { layout: (g: unknown) => Promise<unknown>; terminateWorker?: () => void } => {
  if (!useWorker) {
    if (!cachedPlainElk) cachedPlainElk = new ELKConstructor();
    return cachedPlainElk;
  }
  const workerUrl = resolveWorkerUrl();
  if (!workerUrl) {
    if (!cachedPlainElk) cachedPlainElk = new ELKConstructor();
    return cachedPlainElk;
  }
  if (!cachedWorkerElk) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ELK = require('elkjs');
    cachedWorkerElk = new ELK({ workerUrl });
  }
  return cachedWorkerElk;
};

/** Terminates the cached worker-backed ELK instance, if one was ever created. Call this from an
 * `afterAll` in tests, or during graceful shutdown of a long-running host, so the underlying
 * `worker_threads` Worker does not keep the process alive. Safe to call when no worker was ever
 * created (e.g. `useWorker: false` was used throughout). */
export const disposeAutoLayoutEngine = (): void => {
  if (cachedWorkerElk?.terminateWorker) cachedWorkerElk.terminateWorker();
  cachedWorkerElk = undefined;
};

/** Runs ELK layout for `graph` and normalizes the result into the library-agnostic
 * {@link LayoutResult}. Falls back to a deterministic grid (see normalizeLayout.ts) when ELK
 * throws or exceeds `timeoutMs`, so a diagram generator never has to handle a layout failure
 * itself. */
export const runElkLayout = async (
  graph: LayoutGraph,
  options: LayoutEngineOptions = {},
): Promise<LayoutResult> => {
  const sorted = stableSortGraph(graph);
  const timeoutMs = options.timeoutMs ?? 8000;
  const useWorker = options.useWorker ?? true;
  const elk = getElkInstance(useWorker);

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error('ELK layout timed out')), timeoutMs);
  });

  try {
    const elkGraph = buildElkTree(sorted);
    const laidOut = await Promise.race([elk.layout(elkGraph), timeout]);
    return collectResult(laidOut as ElkNode);
  } catch {
    // A hard cancel of a real worker's in-flight computation is only possible by terminating the
    // worker itself (see plan 4.1 "タイムアウト実装上の注意"); the fake synchronous worker has
    // already finished computing (or thrown) by the time we get here regardless. The cached
    // worker is discarded (not just stopped) because a worker killed mid-computation cannot be
    // trusted to still be sane for the next `runElkLayout()` call - `getElkInstance()` spins up a
    // replacement lazily next time.
    disposeAutoLayoutEngine();
    return gridFallbackLayout(sorted);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};
