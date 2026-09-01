export const xmlEscape = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export const drawioPage = (id: string, name: string, cells: string[], rootId = '0', layerId = '1'): string => [
  `<diagram id="${xmlEscape(id)}" name="${xmlEscape(name)}">`,
  '<mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1000" math="0" shadow="0">',
  `<root><mxCell id="${rootId}"/><mxCell id="${layerId}" parent="${rootId}"/>${cells.join('')}</root>`,
  '</mxGraphModel>',
  '</diagram>',
].join('');

export const wrapDrawioPages = (pages: string[]): string => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<mxfile host="app.diagrams.net" modified="2026-08-07T00:00:00.000Z" agent="db-drivers" version="24.7.17">',
  ...pages,
  '</mxfile>',
].join('');

export const pageLink = (pageId: string): string => ` link="#${xmlEscape(pageId)}"`;

export type DrawioLineLegendItem = {
  id: string;
  label: string;
  color: string;
  width: number;
  dashed?: boolean;
  bidirectional?: boolean;
};

type DrawioLineLegendParams = {
  id?: string;
  title: string;
  x: number;
  y: number;
  width: number;
  items: DrawioLineLegendItem[];
  parent?: string;
  jumpSize?: number;
};

/** Renders relationship legends as real edge samples followed by plain text labels. */
export const drawioLineLegendCells = ({
  id = 'legend',
  title,
  x,
  y,
  width,
  items,
  parent = '1',
  jumpSize = 12,
}: DrawioLineLegendParams): string[] => {
  const height = 135;
  const horizontalPadding = 15;
  const slotWidth = (width - horizontalPadding * 2) / items.length;
  const lineStartOffset = 10;
  const lineLength = Math.min(85, slotWidth * 0.38);
  const labelGap = 10;
  const labelWidth = slotWidth - lineStartOffset - lineLength - labelGap - 5;
  const cells = [
    `<mxCell id="${id}" value="${xmlEscape(title)}" style="swimlane;html=1;rounded=1;horizontal=1;startSize=30;fillColor=#f8fafc;strokeColor=#94a3b8;fontStyle=1;" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`,
  ];

  items.forEach((item, index) => {
    const slotX = horizontalPadding + index * slotWidth;
    cells.push(
      `<mxCell id="${id}_${item.id}_line" value="" style="edgeStyle=none;rounded=0;jumpStyle=arc;jumpSize=${jumpSize};html=1;strokeColor=${item.color};strokeWidth=${item.width};${item.dashed ? 'dashed=1;dashPattern=8 8;' : ''}${item.bidirectional ? 'startArrow=block;' : ''}endArrow=block;" edge="1" parent="${id}"><mxGeometry relative="1" as="geometry"><mxPoint x="${slotX + lineStartOffset}" y="70" as="sourcePoint"/><mxPoint x="${slotX + lineStartOffset + lineLength}" y="70" as="targetPoint"/></mxGeometry></mxCell>`,
    );
    cells.push(
      `<mxCell id="${id}_${item.id}_label" value="${xmlEscape(item.label)}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;" vertex="1" parent="${id}"><mxGeometry x="${slotX + lineStartOffset + lineLength + labelGap}" y="45" width="${labelWidth}" height="50" as="geometry"/></mxCell>`,
    );
  });

  return cells;
};
