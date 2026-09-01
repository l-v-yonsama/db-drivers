import {
  anchorFraction,
  computeAutoLayout,
  estimateLabelSize,
  LayoutEdge,
  LayoutNode,
} from '../diagramLayout';
import {
  buildTableLayouts,
  erRelationshipLegendCells,
  relationLabel,
  tableCell,
  wrapErDiagramPage,
  xmlEscape,
} from './erDiagramDrawioGenerator';
import { ERDiagramParams } from './types';

const tableWidth = 280;
const headerHeight = 32;
const rowHeight = 24;

/** One left and one right port per rendered column row, keyed globally as `table_<tableIndex>_<columnName>_<side>` - unique across the whole diagram, as ELK's port ids must be (see diagramLayout/types.ts's LayoutPort doc comment). */
const columnPorts = (
  tableIndex: number,
  columnsData: { name: string }[],
): { id: string; x: number; y: number }[] =>
  columnsData.flatMap((column, rowIndex) => {
    const y = headerHeight + rowIndex * rowHeight + rowHeight / 2;
    return [
      { id: `table_${tableIndex}_${column.name}_left`, x: 0, y },
      { id: `table_${tableIndex}_${column.name}_right`, x: tableWidth, y },
    ];
  });

/** Automatic-layout counterpart of {@link createDrawioErDiagram}. */
export const createDrawioErDiagramAsync = async (params: ERDiagramParams): Promise<string> => {
  const tableLayouts = buildTableLayouts(params);
  const tableIds = new Map<string, string>();
  const tableIndexByName = new Map<string, number>();
  const displayedColumnNamesByIndex = new Map<number, Set<string>>();
  tableLayouts.forEach((layout) => {
    tableIds.set(layout.item.tableRes.name, `table_${layout.index}`);
    tableIndexByName.set(layout.item.tableRes.name, layout.index);
    displayedColumnNamesByIndex.set(layout.index, new Set(layout.columnsData.map((c) => c.name)));
  });

  const layoutNodes: LayoutNode[] = tableLayouts.map((layout) => ({
    id: `table_${layout.index}`,
    width: tableWidth,
    height: layout.height,
    ports: columnPorts(layout.index, layout.columnsData),
  }));

  const layoutEdges: LayoutEdge[] = params.relations
    .map((relation, index): LayoutEdge | undefined => {
      const fromIndex = tableIndexByName.get(relation.referencedFrom.tableName);
      const toIndex = tableIndexByName.get(relation.referenceTo.tableName);
      if (fromIndex === undefined || toIndex === undefined) return undefined;
      const label = relationLabel(relation);
      const fromColumnShown = displayedColumnNamesByIndex.get(fromIndex)?.has(relation.referencedFrom.columnName);
      const toColumnShown = displayedColumnNamesByIndex.get(toIndex)?.has(relation.referenceTo.columnName);
      return {
        id: `edge_${index}`,
        source: {
          nodeId: `table_${fromIndex}`,
          portId: fromColumnShown ? `table_${fromIndex}_${relation.referencedFrom.columnName}_right` : undefined,
        },
        target: {
          nodeId: `table_${toIndex}`,
          portId: toColumnShown ? `table_${toIndex}_${relation.referenceTo.columnName}_left` : undefined,
        },
        label,
        // Without this, ELK treats the label as zero-width and reserves no extra room for it - see estimateLabelSize's doc comment and LayoutEdge.labelSize.
        labelSize: estimateLabelSize(label),
      };
    })
    .filter((edge): edge is LayoutEdge => edge !== undefined);

  const layout = await computeAutoLayout({
    id: 'er-diagram',
    direction: 'RIGHT',
    nodes: layoutNodes,
    edges: layoutEdges,
    layoutOptions: {
      'elk.layered.spacing.nodeNodeBetweenLayers': '30',
    },
  });

  const cells: string[] = [];
  tableLayouts.forEach((tableLayout) => {
    const box = layout.nodes.get(`table_${tableLayout.index}`);
    if (!box) return;
    cells.push(tableCell(
      `table_${tableLayout.index}`,
      tableLayout.item.tableRes.name,
      tableLayout.item.tableRes.comment ?? '',
      tableLayout.columnsData,
      box.x,
      box.y,
      tableWidth,
      box.height,
    ));
  });

  params.relations.forEach((relation, index) => {
    const source = tableIds.get(relation.referencedFrom.tableName);
    const target = tableIds.get(relation.referenceTo.tableName);
    const edge = layout.edges.get(`edge_${index}`);
    if (!source || !target || !edge) return;
    const sourceBox = layout.nodes.get(source);
    const targetBox = layout.nodes.get(target);
    const label = relationLabel(relation);
    const dashed = relation.dotted ? 'dashed=1;dashPattern=6 6;' : '';
    const anchorStyle = layout.usedAutoLayout && sourceBox && targetBox
      ? (function buildAnchorStyle(): string {
          const exit = anchorFraction(edge.sourcePoint, sourceBox);
          const entry = anchorFraction(edge.targetPoint, targetBox);
          return `exitX=${exit.x};exitY=${exit.y};exitDx=0;exitDy=0;entryX=${entry.x};entryY=${entry.y};entryDx=0;entryDy=0;`;
        })()
      : '';
    const pointsXml = layout.usedAutoLayout && edge.bendPoints.length > 0
      ? `<Array as="points">${edge.bendPoints.map((point) => `<mxPoint x="${point.x}" y="${point.y}"/>`).join('')}</Array>`
      : '';
    cells.push(`<mxCell id="edge_${index}" value="${xmlEscape(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#64748b;strokeWidth=2;${dashed}endArrow=block;labelBackgroundColor=#ffffff;${anchorStyle}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry">${pointsXml}<mxPoint as="offset" y="-10"/></mxGeometry></mxCell>`);
  });

  const maxHeight = Math.max(70, ...[...layout.nodes.values()].map((box) => box.y + box.height));
  const legendY = maxHeight + 40;
  cells.push(...erRelationshipLegendCells(legendY));

  return wrapErDiagramPage(cells);
};
