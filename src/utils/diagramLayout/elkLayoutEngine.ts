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

// Keep ELK-specific element shapes private to this file.
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

  // Edges may be declared at any level of the tree (see lowestCommonAncestor above); their section coordinates from ELK are already relative to that container, so the same parent-offset accumulation used for nodes applies while walking back down to collect them.
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

/** Resolves a Node worker so ELK does not block the event loop. */
const resolveWorkerUrl = (): string | undefined => {
  try {
    require.resolve('web-worker');
    return require.resolve('elkjs/lib/elk-worker.min.js');
  } catch {
    return undefined;
  }
};

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

/** Terminates the cached worker-backed ELK instance, if one was ever created. */
export const disposeAutoLayoutEngine = (): void => {
  if (cachedWorkerElk?.terminateWorker) cachedWorkerElk.terminateWorker();
  cachedWorkerElk = undefined;
};

/** Runs ELK layout for `graph` and normalizes the result into the library-agnostic {@link LayoutResult}. */
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
    // Terminate the worker to cancel an in-flight layout.
    disposeAutoLayoutEngine();
    return gridFallbackLayout(sorted);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};
