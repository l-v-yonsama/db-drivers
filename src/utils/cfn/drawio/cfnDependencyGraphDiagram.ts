import {
  anchorFraction,
  computeAutoLayout,
  estimateLabelSize,
  LayoutEdge,
  LayoutNode,
} from '../../diagramLayout';
import { drawioPage, pageLink, wrapDrawioPages } from '../../drawio';
import { GenerateDiagramParams } from '../../../types';
import { parseDiagramFiles } from '../diagramFileModel';
import { drawioTemplatePage } from '../drawioXml';
import { addDependencyLegend, edgeCell, groupCell, nodeCell } from './commonCells';

/** Generates an editable draw.io dependency graph. */
export const generateDrawioCfnDependencyGraph = (params: GenerateDiagramParams): string => {
  const files = parseDiagramFiles({ ...params, mode: 'CfnDependencyGraph', viewpoint: 'CloudFormationView', options: { ...params.options, includeOutputs: true, includeParameters: true } });
  const cells: string[] = [];
  const nodeIds = new Map<string, string>();
  let maxHeight = 200;
  // Wide enough for the longest real AWS type name (e.g. "AWS::EC2::VPCGatewayAttachment") to wrap onto two lines instead of overflowing into neighboring cards, with a real routing corridor between adjacent cards so edges/labels do not run across card interiors.
  const columns = 3;
  const nodeWidth = 160;
  const nodeHeight = 80;
  const columnGap = 40;
  const rowGap = 40;
  const groupInset = 20;
  const groupTopInset = 45;
  const groupBottomInset = 20;
  const groupWidth = groupInset * 2 + columns * nodeWidth + (columns - 1) * columnGap;
  const stackGap = 40;
  const stacksPerRow = 3;
  let cursorX = 40;
  let cursorY = 40;
  let rowMaxHeight = 0;
  let columnsInRow = 0;
  files.forEach((file, fileIndex) => {
    if (columnsInRow === stacksPerRow) {
      cursorX = 40;
      cursorY += rowMaxHeight + stackGap;
      rowMaxHeight = 0;
      columnsInRow = 0;
    }
    const groupId = `stack_${fileIndex}`;
    const link = file.templateSource ? pageLink(`template_${fileIndex}`) : '';
    const rows = Math.ceil(file.resouces.length / columns);
    const groupHeight = Math.max(
      220,
      groupTopInset + rows * nodeHeight + Math.max(0, rows - 1) * rowGap + groupBottomInset,
    );
    // The group's own title bar is the file name (file.fileName) - every resource in this stack is enclosed inside it, so which template file a resource came from is always visible at a glance without reading logical IDs.
    cells.push(groupCell(groupId, file.fileName, cursorX, cursorY, groupWidth, groupHeight, '1', '#f8fafc'));
    file.resouces.forEach((logicalId, index) => {
      const id = `stack_${fileIndex}_${logicalId}`;
      nodeIds.set(`${fileIndex}:${logicalId}`, id);
      const resource = file.cfnTemplate.Resources[logicalId];
      const col = index % columns;
      const row = Math.floor(index / columns);
      cells.push(nodeCell(
        id,
        `${logicalId}<br/><font color="#64748b">${resource.Type}</font>`,
        groupInset + col * (nodeWidth + columnGap),
        groupTopInset + row * (nodeHeight + rowGap),
        nodeWidth,
        nodeHeight,
        groupId,
        '#ffffff',
        link,
      ));
    });
    rowMaxHeight = Math.max(rowMaxHeight, groupHeight);
    maxHeight = Math.max(maxHeight, cursorY + groupHeight);
    cursorX += groupWidth + stackGap;
    columnsInRow += 1;
  });
  files.forEach((file, fileIndex) => {
    file.dependencies.forEach((dependency, dependencyIndex) => {
      const source = nodeIds.get(`${fileIndex}:${dependency.from}`);
      const target = nodeIds.get(`${dependency.to.fileIndex ?? fileIndex}:${dependency.to.logicalId}`);
      if (source && target) {
        cells.push(edgeCell(`dependency_${fileIndex}_${dependencyIndex}`, source, target, dependency.to.via ?? 'Ref', dependency.to.via ?? 'Ref'));
      }
    });
  });
  if (params.options?.includeLegend !== false) {
    addDependencyLegend(cells, maxHeight + 30);
  }
  const pages = [drawioPage('cfn-dependency-graph', 'CfnDependencyGraph', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};

export const generateDrawioCfnDependencyGraphAsync = async (
  params: GenerateDiagramParams,
): Promise<string> => {
  const files = parseDiagramFiles({ ...params, mode: 'CfnDependencyGraph', viewpoint: 'CloudFormationView', options: { ...params.options, includeOutputs: true, includeParameters: true } });
  const nodeWidth = 160;
  const nodeHeight = 80;

  const layoutNodes: LayoutNode[] = [];
  const layoutEdges: LayoutEdge[] = [];
  const nodeIds = new Map<string, string>();

  files.forEach((file, fileIndex) => {
    const groupId = `stack_${fileIndex}`;
    // Width/height are placeholders: any LayoutNode with at least one child is sized by ELK from its children, not from these values (see diagramLayout/types.ts).
    layoutNodes.push({
      id: groupId,
      width: 0,
      height: 0,
      // Padding leaves room for the swimlane title bar (groupTopInset=45 in the legacy layout) plus a routing margin that matches the legacy grid's columnGap/rowGap=40.
      layoutOptions: { 'elk.padding': '[top=45,left=20,bottom=20,right=20]' },
    });
    file.resouces.forEach((logicalId) => {
      const id = `${groupId}_${logicalId}`;
      nodeIds.set(`${fileIndex}:${logicalId}`, id);
      layoutNodes.push({ id, width: nodeWidth, height: nodeHeight, parentId: groupId });
    });
  });

  files.forEach((file, fileIndex) => {
    file.dependencies.forEach((dependency, dependencyIndex) => {
      const source = nodeIds.get(`${fileIndex}:${dependency.from}`);
      const target = nodeIds.get(`${dependency.to.fileIndex ?? fileIndex}:${dependency.to.logicalId}`);
      if (source && target) {
        const label = dependency.to.via ?? 'Ref';
        layoutEdges.push({
          id: `dependency_${fileIndex}_${dependencyIndex}`,
          source: { nodeId: source },
          target: { nodeId: target },
          label,
          // See estimateLabelSize's doc comment (drawioApplicationDiagram.ts / erDiagramDrawioGeneratorAuto.ts apply the same fix) - without this ELK reserves zero room for the label.
          labelSize: estimateLabelSize(label),
        });
      }
    });
  });

  const layout = await computeAutoLayout({
    id: 'cfn-dependency-graph',
    direction: 'DOWN',
    nodes: layoutNodes,
    edges: layoutEdges,
  });

  const cells: string[] = [];
  let maxHeight = 200;
  files.forEach((file, fileIndex) => {
    const groupId = `stack_${fileIndex}`;
    const groupBox = layout.nodes.get(groupId);
    if (!groupBox) return;
    const link = file.templateSource ? pageLink(`template_${fileIndex}`) : '';
    cells.push(groupCell(groupId, file.fileName, groupBox.x, groupBox.y, groupBox.width, groupBox.height, '1', '#f8fafc'));
    file.resouces.forEach((logicalId) => {
      const id = `${groupId}_${logicalId}`;
      const box = layout.nodes.get(id);
      if (!box) return;
      const resource = file.cfnTemplate.Resources[logicalId];
      // draw.io node geometry is parent-relative once the cell's `parent` is the group, unlike the edges below (whose `parent` stays "1", the root layer, so their points are absolute).
      cells.push(nodeCell(
        id,
        `${logicalId}<br/><font color="#64748b">${resource.Type}</font>`,
        box.x - groupBox.x,
        box.y - groupBox.y,
        box.width,
        box.height,
        groupId,
        '#ffffff',
        link,
      ));
    });
    maxHeight = Math.max(maxHeight, groupBox.y + groupBox.height);
  });

  files.forEach((file, fileIndex) => {
    file.dependencies.forEach((dependency, dependencyIndex) => {
      const edgeId = `dependency_${fileIndex}_${dependencyIndex}`;
      const source = nodeIds.get(`${fileIndex}:${dependency.from}`);
      const target = nodeIds.get(`${dependency.to.fileIndex ?? fileIndex}:${dependency.to.logicalId}`);
      const edge = layout.edges.get(edgeId);
      if (!source || !target || !edge) return;
      const sourceBox = layout.nodes.get(source);
      const targetBox = layout.nodes.get(target);
      const kind = dependency.to.via ?? 'Ref';
      cells.push(edgeCell(
        edgeId,
        source,
        target,
        kind,
        kind,
        false,
        layout.usedAutoLayout ? edge.bendPoints : [],
        layout.usedAutoLayout && sourceBox && targetBox
          ? {
              exitX: anchorFraction(edge.sourcePoint, sourceBox).x,
              exitY: anchorFraction(edge.sourcePoint, sourceBox).y,
              entryX: anchorFraction(edge.targetPoint, targetBox).x,
              entryY: anchorFraction(edge.targetPoint, targetBox).y,
            }
          : undefined,
      ));
    });
  });

  if (params.options?.includeLegend !== false) {
    addDependencyLegend(cells, maxHeight + 30);
  }
  const pages = [drawioPage('cfn-dependency-graph', 'CfnDependencyGraph', cells)];
  files.forEach((file) => {
    if (file.templateSource) pages.push(drawioTemplatePage(`template_${file.fileIndex}`, file.fileName, file.templateSource));
  });
  return wrapDrawioPages(pages);
};
