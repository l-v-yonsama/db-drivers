// Phase 7 (misc/automatic-diagram-layout-and-er-migration-plan.md, section 5.4): ELK-backed
// replacement for the legacy 3-column-grid `createDrawioErDiagram`. Tables become compound-free
// leaf nodes sized exactly like the legacy renderer (see buildTableLayouts), FK relations become
// edges pinned to the declaring/referenced column's row via a fixed-position port on each side,
// and ELK's layered algorithm (direction RIGHT) decides table placement and routing instead of
// the legacy fixed 3-per-row grid.
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

/** One left and one right port per rendered column row, keyed globally as
 * `table_<tableIndex>_<columnName>_<side>` - unique across the whole diagram, as ELK's port ids
 * must be (see diagramLayout/types.ts's LayoutPort doc comment). Every column gets both sides
 * regardless of whether it actually participates in a relation, since it is cheap and keeps the
 * port id scheme independent of which relations end up resolvable. */
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

/** Automatic-layout counterpart of {@link createDrawioErDiagram}. Async because
 * {@link computeAutoLayout} is (plan 4.2, 4.4: "draw.io自動レイアウトは非同期APIとする"). Handles
 * self-reference (a table referencing its own PK), mutual/cyclic references between two tables,
 * and independent tables with no relations at all - see __tests__/util/erDiagramAuto.test.ts.
 *
 * A composite FK now gets one `TableRelation`/line per column pair it covers (erDiagramGenerator.ts's
 * `relationKey()` dedupes only an exact table+column+constraint match, not every column sharing a
 * constraint name) - each column still draws its own line rather than one merged constraint-level
 * line; see plan risk table "FK線が多いER図で線が過密になる" for that still-open follow-up. */
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
      // A relation's FK/referenced column is only guaranteed to be *in the schema*, not in this
      // particular diagram's displayed columnNames - createERDiagramParams()/
      // createSimpleERDiagramParams() let a caller select a column subset per table while still
      // resolving relations from the full FK metadata. columnPorts() only creates a port for a
      // displayed column, so pointing at `<column>_right`/`<column>_left` for a column that was
      // filtered out would reference a port ELK never received - which drops the edge outright
      // instead of degrading it. Falling back to the bare table id (no portId) attaches the edge
      // to the table itself, exactly like a table that has no ports at all.
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
        // Without this, ELK treats the label as zero-width and reserves no extra room for it -
        // see estimateLabelSize's doc comment and LayoutEdge.labelSize. An ER relation label
        // ("orders_customer_fk: customer_id >=1 → id 1") is exactly the long-label case that
        // bug produces a visibly broken diagram for: the label lands squarely on top of the
        // neighboring table's own column text instead of in open space between the two tables.
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
      // ELK applies this value on *both* sides of whatever occupies the layer gap (the label,
      // here), so the common layer's default of 60 - tuned for CFN's short unlabeled-or-short
      // kind names - adds 120px on top of the already-generous labelSize reservation above,
      // once a table's FK label is long. 30 still leaves a visible margin around the label
      // (60px total) without stacking a second full CFN-sized gap on top of it.
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
    // A fallback (`layout.usedAutoLayout === false`) only has table centers to offer, not a real
    // column-port anchor (see gridFallbackLayout's doc comment) - forcing exitX/exitY to a
    // center-derived fraction would connect from inside the table instead of a column row, so
    // this leaves anchors/bend points unset and lets draw.io route between the two table shapes
    // on its own instead.
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
    // labelBackgroundColor keeps the label legible even where routing still brings it close to
    // a table; the offset lifts it clear of the line itself instead of sitting centered on top
    // of it - both defense-in-depth on top of the labelSize-aware spacing above, not a
    // substitute for it (see labelSize's doc comment for the actual space-reservation fix).
    cells.push(`<mxCell id="edge_${index}" value="${xmlEscape(label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#64748b;strokeWidth=2;${dashed}endArrow=block;labelBackgroundColor=#ffffff;${anchorStyle}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry">${pointsXml}<mxPoint as="offset" y="-10"/></mxGeometry></mxCell>`);
  });

  const maxHeight = Math.max(70, ...[...layout.nodes.values()].map((box) => box.y + box.height));
  const legendY = maxHeight + 40;
  cells.push(...erRelationshipLegendCells(legendY));

  return wrapErDiagramPage(cells);
};
