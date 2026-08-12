import {
  computeAutoLayout,
  disposeAutoLayoutEngine,
  gridFallbackLayout,
  LayoutGraph,
  LayoutResult,
  stableSortGraph,
  validateLayoutResult,
} from '../../src/utils/diagramLayout';

// The cached worker-backed ELK instance (see elkLayoutEngine.ts) owns a real `worker_threads`
// Worker; without disposing it, Jest reports "did not exit one second after the test run has
// completed" because that thread keeps the process alive.
afterAll(() => {
  disposeAutoLayoutEngine();
});

// Covers the common-layer test matrix from misc/automatic-diagram-layout-and-er-migration-plan.md
// section 8.1: simple DAG, multiple sources/sinks, cycles, isolated nodes, compound nodes, ports,
// determinism, and the timeout/error fallback.

const simpleDag = (): LayoutGraph => ({
  id: 'root',
  direction: 'DOWN',
  nodes: [
    { id: 'a', width: 100, height: 50 },
    { id: 'b', width: 100, height: 50 },
    { id: 'c', width: 100, height: 50 },
  ],
  edges: [
    { id: 'e1', source: { nodeId: 'a' }, target: { nodeId: 'b' } },
    { id: 'e2', source: { nodeId: 'b' }, target: { nodeId: 'c' } },
  ],
});

describe('diagramLayout / computeAutoLayout', () => {
  it('lays out a simple DAG with no sibling overlaps', async () => {
    const result = await computeAutoLayout(simpleDag());
    expect(result.usedAutoLayout).toBe(true);
    expect(result.nodes.size).toBe(3);
    const report = validateLayoutResult(simpleDag(), result);
    expect(report.siblingOverlaps).toHaveLength(0);
    expect(report.containmentViolations).toHaveLength(0);
  });

  it('handles multiple sources and multiple sinks', async () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'DOWN',
      nodes: [
        { id: 'src1', width: 80, height: 40 },
        { id: 'src2', width: 80, height: 40 },
        { id: 'mid', width: 80, height: 40 },
        { id: 'sink1', width: 80, height: 40 },
        { id: 'sink2', width: 80, height: 40 },
      ],
      edges: [
        { id: 'e1', source: { nodeId: 'src1' }, target: { nodeId: 'mid' } },
        { id: 'e2', source: { nodeId: 'src2' }, target: { nodeId: 'mid' } },
        { id: 'e3', source: { nodeId: 'mid' }, target: { nodeId: 'sink1' } },
        { id: 'e4', source: { nodeId: 'mid' }, target: { nodeId: 'sink2' } },
      ],
    };
    const result = await computeAutoLayout(graph);
    const report = validateLayoutResult(graph, result);
    expect(report.siblingOverlaps).toHaveLength(0);
  });

  it('does not throw or hang on a cyclic graph', async () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'DOWN',
      nodes: [
        { id: 'a', width: 80, height: 40 },
        { id: 'b', width: 80, height: 40 },
      ],
      edges: [
        { id: 'e1', source: { nodeId: 'a' }, target: { nodeId: 'b' } },
        { id: 'e2', source: { nodeId: 'b' }, target: { nodeId: 'a' } },
      ],
    };
    const result = await computeAutoLayout(graph);
    expect(result.nodes.size).toBe(2);
    expect(result.usedAutoLayout).toBe(true);
  });

  it('places an isolated node without overlapping the rest of the graph', async () => {
    const graph: LayoutGraph = {
      ...simpleDag(),
      nodes: [...simpleDag().nodes, { id: 'orphan', width: 100, height: 50 }],
    };
    const result = await computeAutoLayout(graph);
    expect(result.nodes.has('orphan')).toBe(true);
    const report = validateLayoutResult(graph, result);
    expect(report.siblingOverlaps).toHaveLength(0);
  });

  it('keeps children inside a compound node and siblings apart', async () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'DOWN',
      nodes: [
        { id: 'group', width: 10, height: 10 },
        { id: 'group.child1', width: 80, height: 40, parentId: 'group' },
        { id: 'group.child2', width: 80, height: 40, parentId: 'group' },
      ],
      edges: [
        { id: 'e1', source: { nodeId: 'group.child1' }, target: { nodeId: 'group.child2' } },
      ],
    };
    const result = await computeAutoLayout(graph);
    const report = validateLayoutResult(graph, result);
    expect(report.containmentViolations).toHaveLength(0);
    expect(report.siblingOverlaps).toHaveLength(0);
  });

  it('routes a port-to-port edge to the declared local offsets', async () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'RIGHT',
      nodes: [
        {
          id: 'tableA',
          width: 120,
          height: 60,
          ports: [{ id: 'tableA.col.right', x: 120, y: 30 }],
        },
        {
          id: 'tableB',
          width: 120,
          height: 60,
          ports: [{ id: 'tableB.col.left', x: 0, y: 30 }],
        },
      ],
      edges: [
        {
          id: 'fk',
          source: { nodeId: 'tableA', portId: 'tableA.col.right' },
          target: { nodeId: 'tableB', portId: 'tableB.col.left' },
        },
      ],
    };
    const result = await computeAutoLayout(graph);
    const tableA = result.nodes.get('tableA')!;
    const tableB = result.nodes.get('tableB')!;
    const edge = result.edges.get('fk')!;
    // Within 2px of the declared port offset: ELK nudges the exact attachment point by the
    // port's own (sub-pixel-irrelevant here) width/height, so an exact match isn't guaranteed.
    expect(Math.abs(edge.sourcePoint.x - (tableA.x + 120))).toBeLessThan(2);
    expect(Math.abs(edge.sourcePoint.y - (tableA.y + 30))).toBeLessThan(2);
    expect(Math.abs(edge.targetPoint.x - (tableB.x + 0))).toBeLessThan(2);
    expect(Math.abs(edge.targetPoint.y - (tableB.y + 30))).toBeLessThan(2);
  });

  it('handles a long label and a node with a larger custom size', async () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'DOWN',
      nodes: [
        { id: 'a', width: 400, height: 50 },
        { id: 'b', width: 100, height: 200 },
      ],
      edges: [
        {
          id: 'e1',
          source: { nodeId: 'a' },
          target: { nodeId: 'b' },
          label: 'a very long relationship label describing the dependency kind',
        },
      ],
    };
    const result = await computeAutoLayout(graph);
    expect(result.nodes.get('a')!.width).toBe(400);
    expect(result.nodes.get('b')!.height).toBe(200);
  });

  it('produces the same coordinates across repeated runs on the same input', async () => {
    const graph = simpleDag();
    const run1 = await computeAutoLayout(graph);
    const run2 = await computeAutoLayout(graph);
    expect([...run1.nodes.entries()]).toEqual([...run2.nodes.entries()]);
  });

  it('is independent of the input node/edge array order (stable sort)', async () => {
    const forward = simpleDag();
    const reversed: LayoutGraph = {
      ...forward,
      nodes: [...forward.nodes].reverse(),
      edges: [...forward.edges].reverse(),
    };
    const resultForward = await computeAutoLayout(forward);
    const resultReversed = await computeAutoLayout(reversed);
    expect([...resultForward.nodes.entries()].sort()).toEqual(
      [...resultReversed.nodes.entries()].sort(),
    );
  });

  it('falls back to a grid layout when ELK exceeds the timeout', async () => {
    const result = await computeAutoLayout(simpleDag(), { timeoutMs: 0 });
    expect(result.usedAutoLayout).toBe(false);
    expect(result.nodes.size).toBe(3);
    const report = validateLayoutResult(simpleDag(), result);
    expect(report.siblingOverlaps).toHaveLength(0);
  });

  // Regression test (found via review): a generator's edge-rendering loop keys off
  // `layout.edges.get(id)` being present to decide whether to draw a connector at all - an empty
  // edges map on fallback used to silently drop every dependency/relationship line in the
  // diagram, not just degrade their routing.
  it('still returns an entry per edge when it falls back, so a caller does not silently drop every connector', async () => {
    const graph = simpleDag();
    const result = await computeAutoLayout(graph, { timeoutMs: 0 });
    expect(result.usedAutoLayout).toBe(false);
    expect(result.edges.size).toBe(graph.edges.length);
    graph.edges.forEach((edge) => {
      expect(result.edges.has(edge.id)).toBe(true);
    });
  });
});

describe('diagramLayout / gridFallbackLayout', () => {
  it('lays out nested groups without overlap as a synchronous fallback', () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'DOWN',
      nodes: [
        { id: 'group', width: 10, height: 10 },
        { id: 'group.a', width: 80, height: 40, parentId: 'group' },
        { id: 'group.b', width: 80, height: 40, parentId: 'group' },
        { id: 'standalone', width: 80, height: 40 },
      ],
      edges: [],
    };
    const result = gridFallbackLayout(graph);
    expect(result.usedAutoLayout).toBe(false);
    const report = validateLayoutResult(graph, result);
    expect(report.siblingOverlaps).toHaveLength(0);
    expect(report.containmentViolations).toHaveLength(0);
  });

  it('returns a center-to-center entry for every edge instead of an empty edges map', () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'DOWN',
      nodes: [
        { id: 'a', width: 80, height: 40 },
        { id: 'b', width: 80, height: 40 },
      ],
      edges: [{ id: 'e1', source: { nodeId: 'a' }, target: { nodeId: 'b' } }],
    };
    const result = gridFallbackLayout(graph);
    const edge = result.edges.get('e1');
    expect(edge).toBeDefined();
    expect(edge!.bendPoints).toHaveLength(0);
    const a = result.nodes.get('a')!;
    const b = result.nodes.get('b')!;
    expect(edge!.sourcePoint).toEqual({ x: a.x + a.width / 2, y: a.y + a.height / 2 });
    expect(edge!.targetPoint).toEqual({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
  });
});

describe('diagramLayout / stableSortGraph', () => {
  it('sorts nodes and edges by id', () => {
    const graph: LayoutGraph = {
      id: 'root',
      direction: 'DOWN',
      nodes: [
        { id: 'b', width: 1, height: 1 },
        { id: 'a', width: 1, height: 1 },
      ],
      edges: [
        { id: 'e2', source: { nodeId: 'b' }, target: { nodeId: 'a' } },
        { id: 'e1', source: { nodeId: 'a' }, target: { nodeId: 'b' } },
      ],
    };
    const sorted = stableSortGraph(graph);
    expect(sorted.nodes.map((n) => n.id)).toEqual(['a', 'b']);
    expect(sorted.edges.map((e) => e.id)).toEqual(['e1', 'e2']);
  });
});

describe('diagramLayout / validateLayoutResult', () => {
  // Regression test (found via review): ComputedNodeLayout coordinates are absolute
  // (root-relative, per its own doc comment) for every node, parents included - a parent that
  // isn't sitting at the canvas origin is the normal case (a second top-level group, a nested
  // AZ/Subnet, ...), so containment has to be checked against the parent's own absolute origin,
  // not against 0/0.
  const graph: LayoutGraph = {
    id: 'root',
    direction: 'DOWN',
    nodes: [
      { id: 'group', width: 200, height: 200 },
      { id: 'group.child', width: 50, height: 50, parentId: 'group' },
    ],
    edges: [],
  };

  it('does not flag a child that is genuinely inside a parent positioned away from the origin', () => {
    const result: LayoutResult = {
      nodes: new Map([
        ['group', { id: 'group', x: 500, y: 300, width: 200, height: 200 }],
        // Absolute position: 40px in from the parent's own (500, 300) origin - well inside it.
        ['group.child', { id: 'group.child', x: 540, y: 340, width: 50, height: 50 }],
      ]),
      edges: new Map(),
      usedAutoLayout: true,
    };
    const report = validateLayoutResult(graph, result);
    expect(report.containmentViolations).toHaveLength(0);
  });

  it('still catches a child that genuinely overflows a parent positioned away from the origin', () => {
    const result: LayoutResult = {
      nodes: new Map([
        ['group', { id: 'group', x: 500, y: 300, width: 200, height: 200 }],
        // Absolute position: to the *left* of the parent's own left edge (500) - a real violation.
        ['group.child', { id: 'group.child', x: 460, y: 340, width: 50, height: 50 }],
      ]),
      edges: new Map(),
      usedAutoLayout: true,
    };
    const report = validateLayoutResult(graph, result);
    expect(report.containmentViolations).toEqual([
      { nodeId: 'group.child', parentId: 'group', reason: 'out-of-bounds' },
    ]);
  });
});
