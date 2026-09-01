import * as fs from 'fs';
import * as path from 'path';
import {
  GenerateDiagramParams,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtection,
  generateDrawioMultiAzDeploymentTrafficPathsAndProtectionAsync,
  parseCfnYamlTemplate,
} from '../../src';
import { disposeAutoLayoutEngine } from '../../src/utils/diagramLayout';


afterAll(() => {
  disposeAutoLayoutEngine();
});

const FIXTURES_DIR = path.join(__dirname, '../data/cfn');
const readYamlFixture = (relativePath: string): string =>
  fs.readFileSync(path.join(FIXTURES_DIR, relativePath), 'utf-8');

const params: GenerateDiagramParams = {
  mode: 'MultiAzDeploymentTrafficPathsAndProtection',
  list: [
    {
      fileName: 'standard-web-application.yaml',
      templateJSONString: JSON.stringify(
        parseCfnYamlTemplate(readYamlFixture('validation/standard-web-application.yaml')),
      ),
    },
  ],
};

const extractPathSourceTargetKind = (drawio: string): string[] =>
  [...drawio.matchAll(/<mxCell id="path_\d+_([a-z-]+)"[^>]*source="([^"]+)" target="([^"]+)"/g)]
    .map((m) => `${m[2]}->${m[3]}:${m[1]}`)
    .sort();

type Geometry = { id: string; parent: string; x: number; y: number; width: number; height: number };
const parseGeometries = (drawio: string): Geometry[] =>
  [...drawio.matchAll(
    /<mxCell id="([^"]+)"[^>]*parent="([^"]+)"[^>]*><mxGeometry x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g,
  )].map((m) => ({
    id: m[1],
    parent: m[2],
    x: Number(m[3]),
    y: Number(m[4]),
    width: Number(m[5]),
    height: Number(m[6]),
  }));

describe('generateDrawioMultiAzDeploymentTrafficPathsAndProtectionAsync', () => {
  it('produces well-formed draw.io XML', async () => {
    const drawio = await generateDrawioMultiAzDeploymentTrafficPathsAndProtectionAsync(params);
    expect(drawio).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(drawio.match(/<mxfile/g)).toHaveLength(1);
    // xmlEscape() turns "&" into "&amp;" in the page name, so match around it rather than through it.
    expect(drawio).toContain('Multi-AZ Deployment, Traffic Paths');
    expect(drawio).toContain('Protection');
  });

  const extractGroupCells = (drawio: string): string[] =>
    [...drawio.matchAll(/<mxCell id="([^"]+)" value="([^"]+)" style="swimlane;[^"]*"[^>]*><mxGeometry x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g)]
      .map((m) => m.slice(1).join('|'))
      .sort();

  it('keeps every VPC/AZ/Subnet/regional/standalone group box byte-identical to the legacy renderer', async () => {
    const legacy = generateDrawioMultiAzDeploymentTrafficPathsAndProtection(params);
    const auto = await generateDrawioMultiAzDeploymentTrafficPathsAndProtectionAsync(params);
    expect(extractGroupCells(auto)).toEqual(extractGroupCells(legacy));
    expect(extractGroupCells(legacy).some((row) => row.includes('Public Subnet 10.80.0.0/24'))).toBe(true);
  });

  it('keeps the same traffic/protection paths (source/target/kind) as the legacy renderer', async () => {
    const legacy = generateDrawioMultiAzDeploymentTrafficPathsAndProtection(params);
    const auto = await generateDrawioMultiAzDeploymentTrafficPathsAndProtectionAsync(params);
    expect(extractPathSourceTargetKind(auto)).toEqual(extractPathSourceTargetKind(legacy));
  });

  it('keeps every subnet resource inside its own (unchanged-size) subnet box with no sibling overlap', async () => {
    const drawio = await generateDrawioMultiAzDeploymentTrafficPathsAndProtectionAsync(params);
    const geometries = parseGeometries(drawio);
    const subnetBoxes = new Map(
      geometries.filter((g) => /_f\d+_\w+$/.test(g.id) && g.id.includes('_az_')).map((g) => [g.id, g]),
    );
    const byParent = new Map<string, Geometry[]>();
    geometries
      .filter((g) => g.id.startsWith('node_') && subnetBoxes.has(g.parent))
      .forEach((g) => byParent.set(g.parent, [...(byParent.get(g.parent) ?? []), g]));

    expect(byParent.size).toBeGreaterThan(0);
    byParent.forEach((siblings, parentId) => {
      const box = subnetBoxes.get(parentId)!;
      siblings.forEach((node) => {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.y).toBeGreaterThanOrEqual(0);
        expect(node.x + node.width).toBeLessThanOrEqual(box.width + 0.5);
        expect(node.y + node.height).toBeLessThanOrEqual(box.height + 0.5);
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
});
