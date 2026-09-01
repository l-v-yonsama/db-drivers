import { displayGeneralColumnType } from '@l-v-yonsama/rdh';
import { drawioPage, wrapDrawioPages, xmlEscape } from '../drawio';
import { ERDiagramParams, TableRelation } from './types';

export { xmlEscape };

/** Same text both when telling ELK how much space to reserve for a relation's label (`erDiagramDrawioGeneratorAuto.ts`'s `estimateLabelSize`/`labelSize`) and when actually rendering it here - the two must always agree, or the reserved gap and the rendered text drift apart again. */
export const relationLabel = (relation: TableRelation): string =>
  `${relation.name}: ${relation.referencedFrom.columnName} ${relation.referencedFrom.cardinality} → ${relation.referenceTo.columnName} ${relation.referenceTo.cardinality}`;

export const erRelationshipLegendCells = (legendY: number): string[] => [
  `<mxCell id="legend_title" value="Relationship legend" style="text;html=1;align=left;verticalAlign=middle;fontSize=12;fontStyle=1;fontColor=#475569;" vertex="1" parent="1"><mxGeometry x="40" y="${legendY}" width="180" height="22" as="geometry"/></mxCell>`,
  `<mxCell id="legend_solid_line" style="shape=line;html=1;rounded=0;strokeColor=#64748b;strokeWidth=2;" vertex="1" parent="1"><mxGeometry x="40" y="${legendY + 30}" width="42" height="2" as="geometry"/></mxCell>`,
  `<mxCell id="legend_solid_text" value="Solid: identifying relationship" style="text;html=1;align=left;verticalAlign=middle;fontSize=12;fontColor=#64748b;" vertex="1" parent="1"><mxGeometry x="92" y="${legendY + 19}" width="240" height="22" as="geometry"/></mxCell>`,
  `<mxCell id="legend_dashed_line" style="shape=line;html=1;rounded=0;strokeColor=#64748b;strokeWidth=2;dashed=1;dashPattern=6 6;" vertex="1" parent="1"><mxGeometry x="40" y="${legendY + 60}" width="42" height="2" as="geometry"/></mxCell>`,
  `<mxCell id="legend_dashed_text" value="Dashed: non-identifying relationship" style="text;html=1;align=left;verticalAlign=middle;fontSize=12;fontColor=#64748b;" vertex="1" parent="1"><mxGeometry x="92" y="${legendY + 49}" width="260" height="22" as="geometry"/></mxCell>`,
];

/** The single-page draw.io document wrapper both ER renderers use (fixed `er-diagram`/"ER Diagram" page id/name - unlike the CFN generators, an ER diagram never needs more than one page or a dynamic title). */
export const wrapErDiagramPage = (cells: string[]): string =>
  wrapDrawioPages([drawioPage('er-diagram', 'ER Diagram', cells)]);

export const tableCell = (
  id: string,
  tableName: string,
  comment: string,
  columns: { name: string; key: string; type: string; nullable: boolean }[],
  x: number,
  y: number,
  width: number,
  height: number,
): string => {
  const header = comment ? `${tableName} — ${comment}` : tableName;
  const headerHeight = 32;
  const keyWidth = 68;
  const rowHeight = 24;
  const cells = columns.map((column, index) => {
    const value = `${column.name}: ${column.type}`;
    const rowY = headerHeight + index * rowHeight;
    return [
      `<mxCell id="${id}_key_${index}" value="${xmlEscape(column.key)}" style="text;html=1;align=left;verticalAlign=middle;strokeColor=#c9d7d7;fillColor=none;spacingLeft=8;fontStyle=1;fontSize=12;" vertex="1" parent="${id}"><mxGeometry x="0" y="${rowY}" width="${keyWidth}" height="${rowHeight}" as="geometry"/></mxCell>`,
      `<mxCell id="${id}_column_${index}" value="${xmlEscape(value)}" style="text;html=1;align=left;verticalAlign=middle;strokeColor=#c9d7d7;fillColor=none;spacingLeft=8;" vertex="1" parent="${id}"><mxGeometry x="${keyWidth}" y="${rowY}" width="${width - keyWidth}" height="${rowHeight}" as="geometry"/></mxCell>`,
    ].join('');
  }).join('');
  return `<mxCell id="${id}" value="${xmlEscape(header)}" style="swimlane;html=1;rounded=1;horizontal=1;startSize=${headerHeight};fillColor=#2aaea7;swimlaneFillColor=#f5fbfa;fontColor=#ffffff;strokeColor=#4b8f8d;fontStyle=1;align=center;verticalAlign=middle;whiteSpace=nowrap;overflow=hidden;spacing=8;" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>${cells}`;
};

export type ErTableColumnLayout = {
  name: string;
  key: string;
  type: string;
  nullable: boolean;
};

export type ErTableLayout = {
  item: ERDiagramParams['tableItems'][number];
  index: number;
  columnsData: ErTableColumnLayout[];
  height: number;
};

export const buildTableLayouts = (params: ERDiagramParams): ErTableLayout[] =>
  params.tableItems.map((item, index) => {
    const selectedColumns = item.tableRes.children.filter((column) => item.columnNames.includes(column.name));
    const columnsData: ErTableColumnLayout[] = selectedColumns.map((column) => {
      const isForeignKey = Boolean(item.tableRes.foreignKeys?.referenceTo?.[column.name]);
      const key = column.primaryKey ? 'PK' : isForeignKey ? `FK${column.nullable ? '' : ' NN'}` : column.nullable ? '' : 'NN';
      return {
        name: column.name,
        key,
        type: displayGeneralColumnType(column.colType),
        nullable: column.nullable,
      };
    });
    return {
      item,
      index,
      columnsData,
      height: Math.max(90, 32 + columnsData.length * 24),
    };
  });

export const createDrawioErDiagram = (params: ERDiagramParams): string => {
  const tableWidth = 280;
  const columnGap = 45;
  const rowGap = 35;
  const tableX = 40;
  const tableY = 70;
  const columns = 3;
  const cells: string[] = [];
  const tableIds = new Map<string, string>();
  const tableLayouts = buildTableLayouts(params);

  const rowHeights: number[] = [];
  tableLayouts.forEach((layout) => {
    const rowIndex = Math.floor(layout.index / columns);
    rowHeights[rowIndex] = Math.max(rowHeights[rowIndex] ?? 0, layout.height);
  });
  const rowOffsets = rowHeights.reduce<number[]>((offsets, height, index) => {
    offsets[index] = index === 0 ? tableY : offsets[index - 1] + rowHeights[index - 1] + rowGap;
    return offsets;
  }, []);

  tableLayouts.forEach((layout) => {
    const tableId = `table_${layout.index}`;
    tableIds.set(layout.item.tableRes.name, tableId);
    const x = tableX + (layout.index % columns) * (tableWidth + columnGap);
    const y = rowOffsets[Math.floor(layout.index / columns)];
    cells.push(tableCell(tableId, layout.item.tableRes.name, layout.item.tableRes.comment ?? '', layout.columnsData, x, y, tableWidth, layout.height));
  });

  params.relations.forEach((relation, index) => {
    const source = tableIds.get(relation.referencedFrom.tableName);
    const target = tableIds.get(relation.referenceTo.tableName);
    if (!source || !target) return;
    const label = relationLabel(relation);
    const dashed = relation.dotted ? 'dashed=1;dashPattern=6 6;' : '';
    cells.push(`<mxCell id="edge_${index}" value="${xmlEscape(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#64748b;strokeWidth=2;${dashed}endArrow=block;" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  });

  const diagramHeight = rowHeights.reduce((total, height) => total + height, 0) + Math.max(0, rowHeights.length - 1) * rowGap;
  const legendY = tableY + diagramHeight + 20;
  cells.push(...erRelationshipLegendCells(legendY));

  return wrapErDiagramPage(cells);
};
