import { drawioLineLegendCells, xmlEscape } from '../../drawio';
import { TrafficProtectionPathKind } from '../multiAzDeploymentTrafficPathsAndProtection';

export type EdgeKind =
  | 'Ref'
  | 'GetAtt'
  | 'DependsOn'
  | 'ImportValue'
  | 'client'
  | 'egress'
  | 'event'
  | 'data'
  | 'membership'
  | 'permission'
  | 'security';

export const edgeStyles: Record<EdgeKind, { color: string; width: number; dashed?: boolean }> = {
  Ref: { color: '#2563eb', width: 2 },
  GetAtt: { color: '#059669', width: 2, dashed: true },
  DependsOn: { color: '#6b7280', width: 2, dashed: true },
  ImportValue: { color: '#7c3aed', width: 3 },
  client: { color: '#2563eb', width: 2 },
  egress: { color: '#0d9488', width: 2 },
  event: { color: '#ea580c', width: 2, dashed: true },
  data: { color: '#059669', width: 2 },
  membership: { color: '#64748b', width: 2, dashed: true },
  permission: { color: '#7c3aed', width: 2, dashed: true },
  security: { color: '#dc2626', width: 2 },
};

export const displayCidr = (value: string): string => {
  const match = value.match(/^(\d+)_(\d+)_(\d+)_(\d+)_(\d+)$/);
  return match ? `${match[1]}.${match[2]}.${match[3]}.${match[4]}/${match[5]}` : value;
};

export const groupCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent = '1', fill = '#f8fafc', titleAlign: 'center' | 'left' = 'center'): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}" style="swimlane;html=1;rounded=1;horizontal=1;startSize=30;fillColor=${fill};strokeColor=#94a3b8;fontStyle=1;align=${titleAlign};${titleAlign === 'left' ? 'spacingLeft=40;' : ''}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

export const nodeCell = (id: string, label: string, x: number, y: number, width: number, height: number, parent: string, fill = '#ffffff', link = '', topAlign = false): string =>
  `<mxCell id="${id}" value="${xmlEscape(label)}"${link} style="rounded=1;whiteSpace=wrap;html=1;fillColor=${fill};strokeColor=#64748b;spacing=8;${topAlign ? 'verticalAlign=top;align=left;' : ''}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry"/></mxCell>`;

export type EdgeAnchors = {
  exitX: number;
  exitY: number;
  entryX: number;
  entryY: number;
};

export const edgeCell = (
  id: string,
  source: string,
  target: string,
  label: string,
  kind: EdgeKind,
  bidirectional = false,
  points: { x: number; y: number }[] = [],
  anchors?: EdgeAnchors,
): string => {
  const style = edgeStyles[kind];
  const anchorStyle = anchors
    ? `exitX=${anchors.exitX};exitY=${anchors.exitY};exitDx=0;exitDy=0;` +
      `entryX=${anchors.entryX};entryY=${anchors.entryY};entryDx=0;entryDy=0;`
    : '';
  const pointXml = points.length > 0
    ? `<Array as="points">${points.map((point) =>
        `<mxPoint x="${point.x}" y="${point.y}"/>`).join('')}</Array>`
    : '';
  return `<mxCell id="${id}" value="${xmlEscape(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;jumpStyle=arc;jumpSize=12;html=1;labelBackgroundColor=#ffffff;strokeColor=${style.color};strokeWidth=${style.width};${style.dashed ? 'dashed=1;dashPattern=8 8;' : ''}${bidirectional ? 'startArrow=block;' : ''}endArrow=block;${anchorStyle}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry">${pointXml}</mxGeometry></mxCell>`;
};

export const addDependencyLegend = (cells: string[], y: number): void => {
  const items: [string, string, EdgeKind][] = [
    ['Ref', 'Ref', 'Ref'],
    ['GetAtt', 'GetAtt', 'GetAtt'],
    ['DependsOn', 'DependsOn', 'DependsOn'],
    ['ImportValue', 'ImportValue', 'ImportValue'],
  ];
  cells.push(...drawioLineLegendCells({
    title: 'Relationship types',
    x: 40,
    y,
    width: 1100,
    items: items.map(([id, label, kind]) => {
      const style = edgeStyles[kind];
      return { id, label, ...style };
    }),
  }));
};

/** Only lists a legend row for a relationship kind that actually occurs among `usedKinds` - the
 * generated paths for this specific diagram - instead of always listing the full fixed set of
 * seven kinds. A row with zero matching edges (for example "Security protection" when no WAF Web
 * ACL association is proven) sends a reader unfamiliar with the notation hunting for an arrow
 * that was never drawn. */
export const addTrafficProtectionLegend = (
  cells: string[],
  y: number,
  usedKinds: Set<TrafficProtectionPathKind>,
): void => {
  const items: [string, string, EdgeKind, boolean, TrafficProtectionPathKind][] = [
    ['Client', 'Client request / response', 'client', true, 'client-request-response'],
    ['Egress', 'Outbound / return route', 'egress', true, 'egress-return'],
    ['Event', 'Asynchronous event', 'event', false, 'event-delivery'],
    ['Data', 'Explicit data access', 'data', false, 'data-access'],
    ['Membership', 'Resource membership', 'membership', false, 'resource-membership'],
    ['Permission', 'Security-group permission', 'permission', false, 'security-permission'],
    ['Security', 'Security protection', 'security', false, 'security-protection'],
  ];
  const visibleItems = items.filter(([, , , , pathKind]) => usedKinds.has(pathKind));
  if (visibleItems.length === 0) return;
  cells.push(...drawioLineLegendCells({
    title: 'Traffic and protection types',
    x: 40,
    y,
    width: 1100,
    items: visibleItems.map(([id, label, kind, bidirectional]) => {
      const style = edgeStyles[kind];
      return { id, label, bidirectional, ...style };
    }),
  }));
};
