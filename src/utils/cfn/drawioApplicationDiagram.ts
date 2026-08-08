import { GenerateDiagramParams } from '../../types';
import { parseDiagramFiles } from './diagramFileModel';
import { drawioPage, drawioTemplatePage, pageLink, wrapDrawioPages } from './drawioXml';
import {
  ApplicationRelationKind,
  extractApplicationRelations,
  getApplicationIngressRoutes,
  getApplicationNodes,
} from './applicationRelations';

type DrawioStyle = {
  color: string;
  width: number;
  dashed?: boolean;
};

type NodeLayout = {
  layerIndex: number;
  rowIndex: number;
  left: number;
  top: number;
};

const relationStyles: Record<ApplicationRelationKind, DrawioStyle> = {
  'runtime-call': { color: '#2563eb', width: 2 },
  'event-delivery': { color: '#d97706', width: 2, dashed: true },
  'data-access': { color: '#059669', width: 2 },
  'data-read': { color: '#059669', width: 2 },
  'data-write': { color: '#7c3aed', width: 3 },
  'network-route': { color: '#0891b2', width: 2, dashed: true },
};

const layerTitles = ['Ingress', 'Compute', 'Messaging', 'Data'] as const;
const layerColors: Record<(typeof layerTitles)[number], string> = {
  Ingress: '#dbeafe',
  Compute: '#dcfce7',
  Messaging: '#fef3c7',
  Data: '#ede9fe',
};

const nodeTop = 40;
const nodeLeft = 15;
const nodeWidth = 200;
const nodeHeight = 65;
// Edge labels are rendered between vertically adjacent nodes. Keep at least four draw.io
// grid rows free so the label and arrowhead do not overlap either node.
const nodeVerticalGap = 50;
const nodePitch = nodeHeight + nodeVerticalGap;
const layerTop = 40;
const layerWidth = 230;
// A small offset makes corresponding rows form a staircase while preserving a common
// horizontal routing corridor inside each 50px row gap.
const layerStairStep = 10;
const layerBottomPadding = 35;
const layerHeight = (nodeCount: number, layerIndex: number): number => Math.max(
  150,
  nodeTop
    + layerIndex * layerStairStep
    + nodeCount * nodeHeight
    + Math.max(0, nodeCount - 1) * nodeVerticalGap
    + layerBottomPadding,
);

const nodeCenterY = (layout: NodeLayout): number => layout.top + nodeHeight / 2;

/** Returns explicit global waypoints that keep connectors out of component rectangles.
 * Line-to-line crossings are intentionally allowed and made visible with draw.io line jumps. */
const edgeWaypoints = (
  source: NodeLayout,
  target: NodeLayout,
): Array<{ x: number; y: number }> => {
  if (source.layerIndex === target.layerIndex) {
    if (Math.abs(source.rowIndex - target.rowIndex) <= 1) return [];
    const channelX = source.left + nodeWidth + 20;
    return [
      { x: channelX, y: nodeCenterY(source) },
      { x: channelX, y: nodeCenterY(target) },
    ];
  }

  const goingRight = target.left > source.left;
  if (Math.abs(source.layerIndex - target.layerIndex) === 1) {
    const sourceSide = goingRight ? source.left + nodeWidth : source.left;
    const targetSide = goingRight ? target.left : target.left + nodeWidth;
    const channelX = (sourceSide + targetSide) / 2;
    return [
      { x: channelX, y: nodeCenterY(source) },
      { x: channelX, y: nodeCenterY(target) },
    ];
  }

  // All four layers share a clear horizontal band because the maximum staircase offset
  // (30px) is smaller than nodeVerticalGap (50px). Route long edges through the band after
  // the upper of the source/target rows so intermediate-layer nodes are not crossed.
  const corridorRow = Math.min(source.rowIndex, target.rowIndex);
  const maximumLayerOffset = (layerTitles.length - 1) * layerStairStep;
  const corridorY = layerTop
    + nodeTop
    + maximumLayerOffset
    + corridorRow * nodePitch
    + nodeHeight
    + (nodeVerticalGap - maximumLayerOffset) / 2;
  return [
    {
      x: goingRight ? source.left + nodeWidth + 20 : source.left - 20,
      y: corridorY,
    },
    {
      x: goingRight ? target.left - 20 : target.left + nodeWidth + 20,
      y: corridorY,
    },
  ];
};

const xmlEscape = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const visibleNodeTypes = new Set([
  'AWS::ApiGateway::Resource',
  'AWS::ApiGateway::Method',
  'AWS::ApiGatewayV2::Route',
  'AWS::ApiGatewayV2::Integration',
]);

/** Generates an editable, uncompressed diagrams.net XML document for the simplified
 * application view. This intentionally targets ApplicationDiagram only; network topology
 * and raw CloudFormation dependency graphs remain Mermaid outputs for now. */
export const generateDrawioApplicationDiagram = (
  params: GenerateDiagramParams,
): string => {
  const files = parseDiagramFiles({
    ...params,
    options: { ...params.options, includeOutputs: true, includeParameters: true },
  });
  const allNodes = getApplicationNodes(files);
  const nodes = allNodes.filter((node) => !visibleNodeTypes.has(node.type));
  const gatewayByFile = new Map<number, string>();
  nodes.forEach((node) => {
    if (node.type === 'AWS::ApiGateway::RestApi' || node.type === 'AWS::ApiGatewayV2::Api') {
      gatewayByFile.set(node.fileIndex, node.id);
    }
  });
  const aliases = new Map(allNodes.map((node) => [
    node.id,
    visibleNodeTypes.has(node.type)
      ? gatewayByFile.get(node.fileIndex) ?? node.id
      : node.id,
  ]));
  const relations = extractApplicationRelations(files)
    .map((relation) => ({
      ...relation,
      from: aliases.get(relation.from) ?? relation.from,
      to: aliases.get(relation.to) ?? relation.to,
    }))
    .filter((relation) => relation.from !== relation.to);
  const ingressRoutes = getApplicationIngressRoutes(files);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const labelCounts = new Map<string, number>();
  nodes.forEach((node) => labelCounts.set(node.label, (labelCounts.get(node.label) ?? 0) + 1));

  const cells: string[] = [];
  const nodeCellIds = new Map<string, string>();
  const nodeLayouts = new Map<string, NodeLayout>();
  const layerX: Record<(typeof layerTitles)[number], number> = {
    Ingress: 40,
    Compute: 330,
    Messaging: 620,
    Data: 910,
  };
  const layerNodes = new Map<(typeof layerTitles)[number], typeof nodes[number][]>();

  layerTitles.forEach((title) => {
    const layer = title.toLowerCase() as typeof nodes[number]['layer'];
    layerNodes.set(title, nodes.filter((node) => node.layer === layer));
  });

  layerTitles.forEach((title, layerIndex) => {
    const items = layerNodes.get(title) ?? [];
    if (items.length === 0) return;
    const groupId = `layer_${title.toLowerCase()}`;
    const groupHeight = layerHeight(items.length, layerIndex);
    cells.push(
      `<mxCell id="${groupId}" value="${title}" style="swimlane;html=1;rounded=1;horizontal=1;startSize=30;fillColor=${layerColors[title]};strokeColor=#94a3b8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="${layerX[title]}" y="${layerTop}" width="${layerWidth}" height="${groupHeight}" as="geometry"/></mxCell>`,
    );
    items.forEach((node, index) => {
      const cellId = `node_${node.id}`;
      nodeCellIds.set(node.id, cellId);
      const y = nodeTop + layerIndex * layerStairStep + index * nodePitch;
      nodeLayouts.set(node.id, {
        layerIndex,
        rowIndex: index,
        left: layerX[title] + nodeLeft,
        top: layerTop + y,
      });
      const stackSuffix = (labelCounts.get(node.label) ?? 0) > 1 ? ` (${node.fileName})` : '';
      const routes = ingressRoutes.get(node.id)?.map((route) => `<br/>${route}`).join('') ?? '';
      const label = `${node.label}${stackSuffix}${routes}<br/><font color="#64748b">${node.type}</font>`;
      cells.push(
        `<mxCell id="${cellId}" value="${xmlEscape(label)}"${files[node.fileIndex].templateSource ? pageLink(`template_${node.fileIndex}`) : ''} style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#64748b;spacing=8;" vertex="1" parent="${groupId}"><mxGeometry x="${nodeLeft}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" as="geometry"/></mxCell>`,
      );
    });
  });

  const legendY = 80 + Math.max(...layerTitles.map((title, layerIndex) => {
    const count = layerNodes.get(title)?.length ?? 0;
    return layerHeight(count, layerIndex);
  }));
  if (params.options?.includeLegend !== false) {
    cells.push(
      `<mxCell id="legend" value="Relationship types" style="swimlane;html=1;rounded=1;horizontal=1;startSize=30;fillColor=#f8fafc;strokeColor=#94a3b8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="${legendY}" width="1100" height="145" as="geometry"/></mxCell>`,
    );
    const legendItems: [string, string, ApplicationRelationKind][] = [
      ['legend_runtime', 'Blue solid: Runtime call', 'runtime-call'],
      ['legend_event', 'Orange dashed: Event delivery', 'event-delivery'],
      ['legend_access', 'Green solid: Data access', 'data-access'],
      ['legend_network', 'Cyan dashed: Network route', 'network-route'],
    ];
    legendItems.forEach(([id, label, kind], index) => {
      const style = relationStyles[kind];
      cells.push(
        `<mxCell id="${id}" value="${label}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=${style.color};strokeWidth=${style.width};${style.dashed ? 'dashed=1;dashPattern=8 8;' : ''}" vertex="1" parent="legend"><mxGeometry x="15" y="45" width="205" height="65" as="geometry"/></mxCell>`,
      );
      // Move all legend entries horizontally inside the group.
      cells[cells.length - 1] = cells[cells.length - 1].replace('x="15"', `x="${15 + index * 215}"`);
    });
  }

  relations.forEach((relation, index) => {
    const source = nodeCellIds.get(relation.from);
    const target = nodeCellIds.get(relation.to);
    if (!source || !target) return;
    const style = relationStyles[relation.kind];
    const sourceLayout = nodeLayouts.get(relation.from);
    const targetLayout = nodeLayouts.get(relation.to);
    const waypoints = sourceLayout && targetLayout
      ? edgeWaypoints(sourceLayout, targetLayout)
      : [];
    const geometry = waypoints.length > 0
      ? `<mxGeometry relative="1" as="geometry"><Array as="points">${waypoints.map((point) => `<mxPoint x="${point.x}" y="${point.y}"/>`).join('')}</Array></mxGeometry>`
      : '<mxGeometry relative="1" as="geometry"/>';
    cells.push(
      `<mxCell id="edge_${index}" value="${xmlEscape(relation.label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;jumpStyle=arc;jumpSize=8;html=1;strokeColor=${style.color};strokeWidth=${style.width};${style.dashed ? 'dashed=1;dashPattern=8 8;' : ''}endArrow=block;" edge="1" parent="1" source="${source}" target="${target}">${geometry}</mxCell>`,
    );
  });

  const pages = [drawioPage('cfn-application', 'ApplicationDiagram', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};
