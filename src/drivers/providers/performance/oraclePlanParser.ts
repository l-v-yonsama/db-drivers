import { PlanTableMapping } from '../../../types/drivers/performance/PerformanceTuningContext';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { computeRowEstimateRatio } from './planNodeMath';
import { asNumber, asRecord, asString } from './vendorRowCoercion';

// Parses the rows read from Oracle's PLAN_TABLE after `EXPLAIN PLAN ... FOR
// <sql>` (collected by OracleDriver.collectPerformanceTuningPlanRows() into
// plain row objects: ID/PARENT_ID/DEPTH/OPERATION/OPTIONS/OBJECT_OWNER/
// OBJECT_NAME/OBJECT_ALIAS/OBJECT_TYPE/COST/CARDINALITY/BYTES/
// ACCESS_PREDICATES/FILTER_PREDICATES). Everything here is defensive/best-
// effort, same rationale as the other three vendors' parsers: unstructured
// DB output, every access guarded, nothing throws.
//
// Unlike Postgres/MySQL (one JSON document) or even SQL Server (a flat
// rowset whose free-text Argument column needs picking apart),
// PLAN_TABLE is already fully structured/relational - ID/PARENT_ID encode
// the tree directly, and OBJECT_OWNER/OBJECT_NAME/OBJECT_ALIAS/
// ACCESS_PREDICATES/FILTER_PREDICATES are separate typed columns, not text
// to parse. This is the cleanest of the four vendors' raw plan shapes.
//
// One real structural wrinkle: Oracle represents "table access via this
// index" as *two* connected PLAN_TABLE rows - a TABLE ACCESS row (OBJECT_
// TYPE='TABLE', OBJECT_NAME=the table) whose child is a separate INDEX row
// (OBJECT_TYPE='INDEX', OBJECT_NAME=the index) - rather than folding the
// index name into the table row the way Postgres's Index Scan node or SQL
// Server's `OBJECT:(...AS...)` both do in one row. This parser borrows the
// index's name/predicates into the parent TABLE row's own PlanTableMapping
// (via `mergedIndexRow` below) so tuning consumers see one coherent "this
// table, accessed via this index, filtered by these predicates" entry -
// while the INDEX row still also appears as its own PlanNode in the tree,
// faithfully reflecting the real plan shape.
//
// Known limitation - index-only access with no real table name: when the
// optimizer can satisfy a query from an index alone (every referenced
// column is in the index), PLAN_TABLE has *no* TABLE ACCESS row at all for
// that table - only a bare INDEX row, whose own OBJECT_NAME is the index's
// name, not the table's (confirmed against a live Oracle 23c instance).
// `findUnresolvedIndexOnlyAccessKeys()` collects these {owner, indexName}
// pairs so OraclePerformanceTuningProvider can resolve them via one
// supplementary `ALL_INDEXES` lookup before the real parse
// (`parseOraclePlan(rows, resolutions)`); a pair that lookup can't resolve
// degrades honestly to a "could not resolve" warning, same precedent as
// MySQL's alias gap - it never fabricates a table name.

export type OracleIndexTableKey = { owner: string; indexName: string };

type OraclePlanRow = Record<string, unknown>;

const byId = (rows: OraclePlanRow[]): Map<number, OraclePlanRow> => {
  const map = new Map<number, OraclePlanRow>();
  for (const row of rows) {
    const id = asNumber(row.ID);
    if (id !== undefined) {
      map.set(id, row);
    }
  }
  return map;
};

const childrenByParent = (rows: OraclePlanRow[]): Map<number, OraclePlanRow[]> => {
  const map = new Map<number, OraclePlanRow[]>();
  for (const row of rows) {
    const parentId = asNumber(row.PARENT_ID);
    if (parentId === undefined) {
      continue;
    }
    const list = map.get(parentId) ?? [];
    list.push(row);
    map.set(parentId, list);
  }
  return map;
};

// Every table/column reference PLAN_TABLE's ACCESS_PREDICATES/
// FILTER_PREDICATES carry is double-quote-qualified (e.g. `"STATUS"=
// 'shipped'`, `"O"."CUSTOMER_ID"="D"."DEPTNO"`) regardless of how the
// original SQL text quoted it - only the *last* segment in a qualified
// reference sits directly before the operator, same heuristic as the other
// three vendors' predicate-column regexes (bracket/backtick, here
// double-quote). `""` inside a quoted segment is Oracle's own escaping for
// a literal `"`.
const ORACLE_COLUMN_BEFORE_OPERATOR =
  /"((?:[^"]|"")+)"\s*(?:=|<>|!=|<=|>=|<|>|\bIN\b|\bLIKE\b)/gi;

export function extractOraclePredicateColumns(clause: string | undefined): string[] {
  if (!clause) {
    return [];
  }
  const columns = new Set<string>();
  for (const match of clause.matchAll(ORACLE_COLUMN_BEFORE_OPERATOR)) {
    const raw = match[1];
    if (raw) {
      columns.add(raw.replace(/""/g, '"'));
    }
  }
  return [...columns];
}

// OBJECT_ALIAS renders as `"<alias-or-table-name>"@"<query-block-name>"`
// (e.g. `"O"@"SEL$1"`, or `"PERF_ORDERS"@"SEL$1"` when no explicit alias was
// given) - only the first quoted segment is the alias/reference name.
function extractOracleAlias(objectAlias: string | undefined): string | undefined {
  if (!objectAlias) {
    return undefined;
  }
  const match = /^"((?:[^"]|"")*)"@/.exec(objectAlias);
  return match ? match[1].replace(/""/g, '"') : undefined;
}

// Pre-scan (no tree-building, just enough to know what to ask the catalog
// about) - see OraclePerformanceTuningProvider.collectExecutionPlan() for
// how the result feeds back into parseOraclePlan()'s `resolutions` param.
export function findUnresolvedIndexOnlyAccessKeys(rows: unknown[]): OracleIndexTableKey[] {
  const validRows = Array.isArray(rows)
    ? rows.map((r) => asRecord(r)).filter((r): r is OraclePlanRow => r !== undefined)
    : [];
  const rowsById = byId(validRows);
  const seen = new Set<string>();
  const keys: OracleIndexTableKey[] = [];

  for (const row of validRows) {
    if (asString(row.OBJECT_TYPE) !== 'INDEX') {
      continue;
    }
    const parentId = asNumber(row.PARENT_ID);
    const parent = parentId !== undefined ? rowsById.get(parentId) : undefined;
    if (parent && asString(parent.OBJECT_TYPE) === 'TABLE') {
      // Has a TABLE ACCESS parent - that row already carries the real
      // table name, nothing to resolve for this index row.
      continue;
    }
    const owner = asString(row.OBJECT_OWNER);
    const indexName = asString(row.OBJECT_NAME);
    if (!owner || !indexName) {
      continue;
    }
    const key = `${owner}.${indexName}`;
    if (!seen.has(key)) {
      seen.add(key);
      keys.push({ owner, indexName });
    }
  }
  return keys;
}

export type ParsedOraclePlan = {
  planNode: PlanNode;
  mappings: PlanTableMapping[];
  warnings: string[];
};

type NodeCtx = {
  mappings: PlanTableMapping[];
  warnings: string[];
  counter: number;
};

function collectPredicates(
  sources: OraclePlanRow[],
): { predicates: string[]; filterColumns: Set<string> } {
  const predicates: string[] = [];
  const filterColumns = new Set<string>();
  for (const source of sources) {
    for (const label of ['ACCESS_PREDICATES', 'FILTER_PREDICATES'] as const) {
      const clause = asString(source[label]);
      if (clause) {
        predicates.push(clause);
        for (const col of extractOraclePredicateColumns(clause)) {
          filterColumns.add(col);
        }
      }
    }
  }
  return { predicates, filterColumns };
}

function buildNode(
  row: OraclePlanRow,
  parentId: string | undefined,
  depth: number,
  rowsById: Map<number, OraclePlanRow>,
  childrenOf: Map<number, OraclePlanRow[]>,
  resolutions: Map<string, { schemaName: string; tableName: string }> | undefined,
  ctx: NodeCtx,
): PlanNode {
  const id = `n${ctx.counter++}`;
  const objectType = asString(row.OBJECT_TYPE);
  const rowIdNum = asNumber(row.ID);
  const childRows = rowIdNum !== undefined ? (childrenOf.get(rowIdNum) ?? []) : [];

  const indexChildRows = childRows.filter((r) => asString(r.OBJECT_TYPE) === 'INDEX');
  // Only merge when unambiguous (exactly one INDEX child) - a bitmap AND/OR
  // plan with several INDEX children is left unmerged rather than
  // arbitrarily picking one.
  const mergedIndexRow =
    objectType === 'TABLE' && indexChildRows.length === 1 ? indexChildRows[0] : undefined;

  const { predicates, filterColumns } = collectPredicates(
    [row, mergedIndexRow].filter((r): r is OraclePlanRow => r !== undefined),
  );

  const estimatedRows = asNumber(row.CARDINALITY);
  const bytes = asNumber(row.BYTES);

  let relation: PlanNode['relation'];
  let indexName: string | undefined;

  if (objectType === 'TABLE') {
    const schemaName = asString(row.OBJECT_OWNER);
    const tableName = asString(row.OBJECT_NAME);
    const alias = extractOracleAlias(asString(row.OBJECT_ALIAS));
    indexName = mergedIndexRow ? asString(mergedIndexRow.OBJECT_NAME) : undefined;
    if (tableName) {
      relation = { schemaName, tableName, alias: alias && alias !== tableName ? alias : undefined };
      ctx.mappings.push({
        planNodeId: id,
        schemaName,
        tableName,
        alias: relation.alias,
        indexName,
        estimatedRows,
        actualRows: undefined,
        rowEstimateRatio: computeRowEstimateRatio(estimatedRows, undefined),
        filterColumns: filterColumns.size > 0 ? [...filterColumns] : undefined,
      });
    }
  } else if (objectType === 'INDEX') {
    const owner = asString(row.OBJECT_OWNER);
    indexName = asString(row.OBJECT_NAME);
    const alias = extractOracleAlias(asString(row.OBJECT_ALIAS));
    const parentIdNum = asNumber(row.PARENT_ID);
    const parentRow = parentIdNum !== undefined ? rowsById.get(parentIdNum) : undefined;
    const hasTableParent = parentRow && asString(parentRow.OBJECT_TYPE) === 'TABLE';

    if (hasTableParent) {
      // Already represented by the parent TABLE row's own mapping above -
      // still decorate this node with relation/index info for an accurate
      // tree, but don't push a second (duplicate) mapping for the same
      // physical table access.
      const parentTableName = asString(parentRow!.OBJECT_NAME);
      const parentSchemaName = asString(parentRow!.OBJECT_OWNER);
      if (parentTableName) {
        relation = {
          schemaName: parentSchemaName,
          tableName: parentTableName,
          alias: alias && alias !== parentTableName ? alias : undefined,
        };
      }
    } else if (owner && indexName) {
      const resolved = resolutions?.get(`${owner}.${indexName}`);
      if (resolved) {
        relation = {
          schemaName: resolved.schemaName,
          tableName: resolved.tableName,
          alias: alias && alias !== resolved.tableName ? alias : undefined,
        };
        ctx.mappings.push({
          planNodeId: id,
          schemaName: resolved.schemaName,
          tableName: resolved.tableName,
          alias: relation.alias,
          indexName,
          estimatedRows,
          actualRows: undefined,
          rowEstimateRatio: computeRowEstimateRatio(estimatedRows, undefined),
          filterColumns: filterColumns.size > 0 ? [...filterColumns] : undefined,
        });
      } else {
        ctx.warnings.push(`Could not resolve a table for plan node ${id} (index ${indexName}).`);
      }
    }
  }

  const children = childRows.map((childRow) =>
    buildNode(childRow, id, depth + 1, rowsById, childrenOf, resolutions, ctx),
  );

  const logicalOp = asString(row.OPERATION);
  const options = asString(row.OPTIONS);

  return {
    id,
    parentId,
    depth,
    // Oracle's own DBMS_XPLAN.DISPLAY convention: OPERATION and OPTIONS
    // concatenated with a space (e.g. "TABLE ACCESS" + "FULL" ->
    // "TABLE ACCESS FULL") - not a guess, this is the documented rendering.
    operation: options ? `${logicalOp ?? 'Unknown'} ${options}` : (logicalOp ?? 'Unknown'),
    relation,
    indexName,
    // OPTIONS on a *JOIN operation itself (HASH JOIN/NESTED LOOPS/MERGE
    // JOIN) carries the join kind when it's not a plain inner join (e.g.
    // "RIGHT OUTER", "SEMI", "ANTI"); a plain inner join has OPTIONS = null,
    // and this driver doesn't fabricate the word "INNER" for it.
    joinType: logicalOp && /JOIN/i.test(logicalOp) ? options : undefined,
    predicates: predicates.length > 0 ? predicates : undefined,
    estimated: {
      totalCost: asNumber(row.COST),
      rows: estimatedRows,
      width: estimatedRows && estimatedRows > 0 && bytes !== undefined ? bytes / estimatedRows : undefined,
    },
    children,
  };
}

// `rows` is the array of plain row objects
// OracleDriver.collectPerformanceTuningPlanRows() returns (one row per
// PLAN_TABLE row for this EXPLAIN PLAN's STATEMENT_ID). `resolutions` is
// the {owner}.{indexName} -> {schemaName, tableName} map
// OraclePerformanceTuningProvider resolved via ALL_INDEXES for whatever
// findUnresolvedIndexOnlyAccessKeys() found beforehand - omit/pass
// undefined to skip that resolution (every such node then degrades to a
// warning instead of a table).
export function parseOraclePlan(
  rows: unknown[],
  resolutions?: Map<string, { schemaName: string; tableName: string }>,
): ParsedOraclePlan {
  const ctx: NodeCtx = { mappings: [], warnings: [], counter: 0 };
  const validRows = Array.isArray(rows)
    ? rows.map((r) => asRecord(r)).filter((r): r is OraclePlanRow => r !== undefined)
    : [];

  if (validRows.length === 0) {
    return {
      planNode: { id: 'n0', depth: 0, operation: 'Unknown', children: [] },
      mappings: [],
      warnings: ['Failed to resolve tables from the execution plan.'],
    };
  }

  const rowsById = byId(validRows);
  const childrenOf = childrenByParent(validRows);
  // The root is the row with no PARENT_ID (PLAN_TABLE's SELECT STATEMENT /
  // INSERT STATEMENT / ... row, ID = 0, PARENT_ID = null).
  const root = validRows.find((r) => asNumber(r.PARENT_ID) === undefined) ?? validRows[0];

  const planNode = buildNode(root, undefined, 0, rowsById, childrenOf, resolutions, ctx);
  return { planNode, mappings: ctx.mappings, warnings: ctx.warnings };
}
