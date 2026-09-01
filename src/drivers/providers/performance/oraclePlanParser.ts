import { PlanTableMapping } from '../../../types/drivers/performance/PerformanceTuningContext';
import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { planUnresolvedDiagnostic } from './performanceTuningDiagnosticHelpers';
import { computeRowEstimateRatio } from './planNodeMath';
import { asNumber, asRecord, asString } from './vendorRowCoercion';

// Parses the rows read from Oracle's PLAN_TABLE after `EXPLAIN PLAN ...

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

// OBJECT_ALIAS renders as `"<alias-or-table-name>"@"<query-block-name>"` (e.g. `"O"@"SEL$1"`, or `"PERF_ORDERS"@"SEL$1"` when no explicit alias was given) - only the first quoted segment is the alias/reference name.
function extractOracleAlias(objectAlias: string | undefined): string | undefined {
  if (!objectAlias) {
    return undefined;
  }
  const match = /^"((?:[^"]|"")*)"@/.exec(objectAlias);
  return match ? match[1].replace(/""/g, '"') : undefined;
}

// Pre-scan (no tree-building, just enough to know what to ask the catalog about) - see OraclePerformanceTuningProvider.collectExecutionPlan() for how the result feeds back into parseOraclePlan()'s `resolutions` param.
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
      // Has a TABLE ACCESS parent - that row already carries the real table name, nothing to resolve for this index row.
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
  diagnostics: PerformanceTuningDiagnostic[];
};

type NodeCtx = {
  mappings: PlanTableMapping[];
  diagnostics: PerformanceTuningDiagnostic[];
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
  const logicalOp = asString(row.OPERATION);
  const options = asString(row.OPTIONS);
  // Oracle's own DBMS_XPLAN.DISPLAY convention: OPERATION and OPTIONS concatenated with a space (e.g. "TABLE ACCESS" + "FULL" -> "TABLE ACCESS FULL") - not a guess, this is the documented rendering.
  const operation = options ? `${logicalOp ?? 'Unknown'} ${options}` : (logicalOp ?? 'Unknown');
  const objectType = asString(row.OBJECT_TYPE);
  const rowIdNum = asNumber(row.ID);
  const childRows = rowIdNum !== undefined ? (childrenOf.get(rowIdNum) ?? []) : [];

  const indexChildRows = childRows.filter((r) => asString(r.OBJECT_TYPE) === 'INDEX');
  // Only merge when unambiguous (exactly one INDEX child) - a bitmap AND/OR plan with several INDEX children is left unmerged rather than arbitrarily picking one.
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
      // Already represented by the parent TABLE row's own mapping above - still decorate this node with relation/index info for an accurate tree, but don't push a second (duplicate) mapping for the same physical table access.
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
        ctx.diagnostics.push({
          code: 'TABLE_MAPPING_FAILED',
          severity: 'warning',
          affectsCompleteness: true,
          scope: 'executionPlan',
          message: `Could not resolve a table for plan node ${id} (index ${indexName}, owner ${owner}).`,
          node: { id, operation, objectKind: 'index', objectName: indexName },
          schemaName: owner,
        });
      }
    }
  }

  const children = childRows.map((childRow) =>
    buildNode(childRow, id, depth + 1, rowsById, childrenOf, resolutions, ctx),
  );

  return {
    id,
    parentId,
    depth,
    operation,
    relation,
    indexName,
    // OPTIONS on a *JOIN operation itself (HASH JOIN/NESTED LOOPS/MERGE JOIN) carries the join kind when it's not a plain inner join (e.g. "RIGHT OUTER", "SEMI", "ANTI"); a plain inner join has OPTIONS = null, and this driver doesn't fabricate the word "INNER" for it.
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

// `rows` is the array of plain row objects OracleDriver.collectPerformanceTuningPlanRows() returns (one row per PLAN_TABLE row for this EXPLAIN PLAN's STATEMENT_ID).
export function parseOraclePlan(
  rows: unknown[],
  resolutions?: Map<string, { schemaName: string; tableName: string }>,
): ParsedOraclePlan {
  const ctx: NodeCtx = { mappings: [], diagnostics: [], counter: 0 };
  const validRows = Array.isArray(rows)
    ? rows.map((r) => asRecord(r)).filter((r): r is OraclePlanRow => r !== undefined)
    : [];

  if (validRows.length === 0) {
    return {
      planNode: { id: 'n0', depth: 0, operation: 'Unknown', children: [] },
      mappings: [],
      diagnostics: [planUnresolvedDiagnostic()],
    };
  }

  const rowsById = byId(validRows);
  const childrenOf = childrenByParent(validRows);
  // The root is the row with no PARENT_ID (PLAN_TABLE's SELECT STATEMENT / INSERT STATEMENT / ...
  const root = validRows.find((r) => asNumber(r.PARENT_ID) === undefined) ?? validRows[0];

  const planNode = buildNode(root, undefined, 0, rowsById, childrenOf, resolutions, ctx);
  return { planNode, mappings: ctx.mappings, diagnostics: ctx.diagnostics };
}
