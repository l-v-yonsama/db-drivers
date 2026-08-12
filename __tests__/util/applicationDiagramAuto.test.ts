import {
  GenerateDiagramParams,
  generateDrawioApplicationDiagram,
  generateDrawioApplicationDiagramAsync,
} from '../../src';
import { disposeAutoLayoutEngine } from '../../src/utils/diagramLayout';
import testApiLambdaStackTemplate from '../data/cfn/templates/db-drivers-test-api-lambda-stack.json';
import testOrderStackTemplate from '../data/cfn/templates/db-drivers-test-order-stack.json';

// Phase 4 (misc/automatic-diagram-layout-and-er-migration-plan.md 5.2 / 8.2): the auto-layout
// renderer must keep the same node/relation semantics as the legacy staircase renderer, must
// keep the Ingress -> Compute -> Messaging -> Data ordering as a hard left-to-right constraint,
// and must not regress into overlapping cells.

afterAll(() => {
  disposeAutoLayoutEngine();
});

const params: GenerateDiagramParams = {
  mode: 'ApplicationDiagram',
  list: [
    {
      fileName: 'db-drivers-test-order-stack.json',
      templateJSONString: JSON.stringify(testOrderStackTemplate),
    },
    {
      fileName: 'db-drivers-test-api-lambda-stack.json',
      templateJSONString: JSON.stringify(testApiLambdaStackTemplate),
    },
  ],
};

const extractEdgeLabelsByKindColor = (drawio: string): string[] =>
  [...drawio.matchAll(/<mxCell id="edge_\d+" value="([^"]*)"[^>]*strokeColor=(#[0-9a-f]{6})/g)]
    .map((m) => `${m[1]}|${m[2]}`)
    .sort();

type Geometry = { id: string; parent: string; x: number; y: number; width: number; height: number };

const parseGeometries = (drawio: string): Geometry[] =>
  [...drawio.matchAll(
    /<mxCell id="((?:layer_|node_)[^"]+)"[^>]*parent="([^"]+)"[^>]*><mxGeometry x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g,
  )].map((m) => ({
    id: m[1],
    parent: m[2],
    x: Number(m[3]),
    y: Number(m[4]),
    width: Number(m[5]),
    height: Number(m[6]),
  }));

describe('generateDrawioApplicationDiagramAsync', () => {
  it('produces well-formed draw.io XML', async () => {
    const drawio = await generateDrawioApplicationDiagramAsync(params);
    expect(drawio).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(drawio.match(/<mxfile/g)).toHaveLength(1);
    expect(drawio).toContain('ApplicationDiagram');
  });

  it('keeps the same relation labels/colors as the legacy staircase renderer', async () => {
    const legacy = generateDrawioApplicationDiagram(params);
    const auto = await generateDrawioApplicationDiagramAsync(params);
    expect(extractEdgeLabelsByKindColor(auto)).toEqual(
      extractEdgeLabelsByKindColor(legacy),
    );
  });

  it('keeps every layer group ordered left-to-right as Ingress -> Compute -> Messaging -> Data', async () => {
    const drawio = await generateDrawioApplicationDiagramAsync(params);
    const geometries = parseGeometries(drawio);
    const layerOrder = ['layer_ingress', 'layer_compute', 'layer_messaging', 'layer_data'];
    const present = layerOrder
      .map((id) => geometries.find((g) => g.id === id))
      .filter((g): g is Geometry => Boolean(g));
    expect(present.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < present.length; i++) {
      expect(present[i].x).toBeGreaterThan(present[i - 1].x);
    }
  });

  it('places every node inside its own layer group with no sibling overlap', async () => {
    const drawio = await generateDrawioApplicationDiagramAsync(params);
    const geometries = parseGeometries(drawio);
    const groups = geometries.filter((g) => g.id.startsWith('layer_'));
    const nodesByGroup = new Map<string, Geometry[]>();
    geometries
      .filter((g) => g.id.startsWith('node_') && g.parent.startsWith('layer_'))
      .forEach((g) => nodesByGroup.set(g.parent, [...(nodesByGroup.get(g.parent) ?? []), g]));

    const groupById = new Map(groups.map((g) => [g.id, g]));
    nodesByGroup.forEach((siblings, parentId) => {
      const group = groupById.get(parentId);
      expect(group).toBeDefined();
      siblings.forEach((node) => {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.x + node.width).toBeLessThanOrEqual(group!.width + 0.5);
        expect(node.y + node.height).toBeLessThanOrEqual(group!.height + 0.5);
      });
      for (let i = 0; i < siblings.length; i++) {
        for (let j = i + 1; j < siblings.length; j++) {
          const a = siblings[i];
          const b = siblings[j];
          const overlapsX = a.x < b.x + b.width && b.x < a.x + a.width;
          const overlapsY = a.y < b.y + b.height && b.y < a.y + a.height;
          expect(overlapsX && overlapsY).toBe(false);
        }
      }
    });
  });

  it('still nests a DB Cluster member card instead of drawing a separate top-level card', async () => {
    // Reuses the same membership shape the legacy renderer test fixture exercises: a DBInstance
    // whose DBClusterIdentifier points at a DBCluster in the same stack.
    const clusterParams: GenerateDiagramParams = {
      mode: 'ApplicationDiagram',
      list: [
        {
          fileName: 'db-cluster-stack.json',
          templateJSONString: JSON.stringify({
            Resources: {
              AppDbCluster: { Type: 'AWS::RDS::DBCluster', Properties: {} },
              AppDbInstance: {
                Type: 'AWS::RDS::DBInstance',
                Properties: { DBClusterIdentifier: { Ref: 'AppDbCluster' } },
              },
            },
          }),
        },
      ],
    };
    const drawio = await generateDrawioApplicationDiagramAsync(clusterParams);
    expect(drawio).toMatch(/id="node_f0_AppDbInstance"[^>]*parent="node_f0_AppDbCluster"/);
  });
});
