import {
  GenerateDiagramParams,
  generateDrawioCfnDependencyGraph,
  generateDrawioCfnDependencyGraphAsync,
} from '../../src';
import { disposeAutoLayoutEngine } from '../../src/utils/diagramLayout';
import testApiLambdaStackTemplate from '../data/cfn/templates/db-drivers-test-api-lambda-stack.json';
import testOrderStackTemplate from '../data/cfn/templates/db-drivers-test-order-stack.json';


afterAll(() => {
  disposeAutoLayoutEngine();
});

const extractSourceTargetKindPairs = (drawio: string): string[] =>
  [...drawio.matchAll(/<mxCell id="dependency_[^"]+" value="([^"]*)"[^>]*source="([^"]+)" target="([^"]+)"/g)]
    .map((match) => `${match[2]}->${match[3]}:${match[1]}`)
    .sort();

const parseGeometries = (
  drawio: string,
): { id: string; parent: string; x: number; y: number; width: number; height: number }[] =>
  [...drawio.matchAll(
    /<mxCell id="(stack_[^"]+)"[^>]*parent="([^"]+)"[^>]*><mxGeometry x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g,
  )].map((m) => ({
    id: m[1],
    parent: m[2],
    x: Number(m[3]),
    y: Number(m[4]),
    width: Number(m[5]),
    height: Number(m[6]),
  }));

describe('generateDrawioCfnDependencyGraphAsync', () => {
  const params: GenerateDiagramParams = {
    mode: 'CfnDependencyGraph',
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

  it('produces well-formed, single-rooted draw.io XML', async () => {
    const drawio = await generateDrawioCfnDependencyGraphAsync(params);
    expect(drawio).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(drawio).toContain('<mxfile');
    expect(drawio.match(/<mxfile/g)).toHaveLength(1);
    expect(drawio).toContain('CfnDependencyGraph');
  });

  it('keeps the same dependency edges (source/target/kind) as the legacy grid renderer', async () => {
    const legacy = generateDrawioCfnDependencyGraph(params);
    const auto = await generateDrawioCfnDependencyGraphAsync(params);
    expect(extractSourceTargetKindPairs(auto)).toEqual(
      extractSourceTargetKindPairs(legacy),
    );
  });

  it('places every resource node inside its own stack group with no sibling overlap', async () => {
    const drawio = await generateDrawioCfnDependencyGraphAsync(params);
    const geometries = parseGeometries(drawio);
    const groups = geometries.filter((g) => g.parent === '1');
    const resources = geometries.filter((g) => g.parent !== '1');

    // Every resource's parent-relative box must fit inside its group's own width/height.
    const groupById = new Map(groups.map((g) => [g.id, g]));
    resources.forEach((resource) => {
      const group = groupById.get(resource.parent);
      expect(group).toBeDefined();
      expect(resource.x).toBeGreaterThanOrEqual(0);
      expect(resource.y).toBeGreaterThanOrEqual(0);
      expect(resource.x + resource.width).toBeLessThanOrEqual(group!.width + 0.5);
      expect(resource.y + resource.height).toBeLessThanOrEqual(group!.height + 0.5);
    });

    // No two resources within the same stack overlap (compared in the stack's own local space, since that's the space their geometry is expressed in).
    const byParent = new Map<string, typeof resources>();
    resources.forEach((r) => byParent.set(r.parent, [...(byParent.get(r.parent) ?? []), r]));
    byParent.forEach((siblings) => {
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

    // The two top-level stack groups themselves must not overlap either.
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i];
        const b = groups[j];
        const overlapsX = a.x < b.x + b.width && b.x < a.x + a.width;
        const overlapsY = a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlapsX && overlapsY).toBe(false);
      }
    }
  });

  it('renders a single stack (no cross-stack edges) without error', async () => {
    const drawio = await generateDrawioCfnDependencyGraphAsync({
      mode: 'CfnDependencyGraph',
      list: [params.list[0]],
    });
    expect(drawio).toContain('stack_0');
    expect(drawio).not.toContain('stack_1');
  });

});
