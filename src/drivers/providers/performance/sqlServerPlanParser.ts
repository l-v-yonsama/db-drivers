import { PlanTableMapping } from '../../../types/drivers/performance/PerformanceTuningContext';
import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { planUnresolvedDiagnostic } from './performanceTuningDiagnosticHelpers';
import { computeRowEstimateRatio } from './planNodeMath';
import { asNumber, asRecord, asString } from './vendorRowCoercion';

// Parses the rowset `SET SHOWPLAN_ALL ON` produces (already collected by SQLServerDriver.collectPerformanceTuningShowplan() into plain row objects).

// SQL Server always bracket-quotes identifiers, e.g. "[testdb].[perf].[perf_orders].[idx_perf_orders_status]" - `]]` inside a bracketed segment is SQL Server's own escaping for a literal `]`.
const BRACKET_SEGMENT = /\[((?:[^\]]|\]\])*)\]/g;
const unescapeBracket = (s: string): string => s.replace(/\]\]/g, ']');

const ARGUMENT_EXCERPT_MAX_LENGTH = 160;
const argumentExcerpt = (argument: string): string =>
  argument.length > ARGUMENT_EXCERPT_MAX_LENGTH
    ? `${argument.slice(0, ARGUMENT_EXCERPT_MAX_LENGTH)}...`
    : argument;

// Matches the `OBJECT:(...)` clause every table-accessing operator's Argument carries: a dot-joined chain of `[database].[schema].[table]` (heap) or `[database].[schema].[table].[index]` (an index/PK/constraint name), optionally followed by `AS [alias]` when the query aliased it.
const OBJECT_CLAUSE =
  /OBJECT:\(((?:\[(?:[^\]]|\]\])*\])(?:\.\[(?:[^\]]|\]\])*\])*)(?:\s+AS\s+\[((?:[^\]]|\]\])*)\])?\)/;

type SqlServerObjectRef = {
  schemaName?: string;
  tableName: string;
  indexName?: string;
  alias?: string;
};

function extractObjectClause(argument: string | undefined): SqlServerObjectRef | undefined {
  if (!argument) {
    return undefined;
  }
  const match = OBJECT_CLAUSE.exec(argument);
  if (!match) {
    return undefined;
  }
  const segments = [...match[1].matchAll(BRACKET_SEGMENT)].map((m) => unescapeBracket(m[1]));
  // [database].[schema].[table] or [database].[schema].[table].[index] - fewer than 3 segments is nothing this driver has observed; degrade to "no object resolved" rather than guess at a shorter chain's meaning.
  if (segments.length < 3) {
    return undefined;
  }
  const [, schemaName, tableName, indexName] = segments;
  return {
    schemaName,
    tableName,
    indexName: segments.length >= 4 ? indexName : undefined,
    alias: match[2] !== undefined ? unescapeBracket(match[2]) : undefined,
  };
}

function extractLabeledClause(argument: string | undefined, label: string): string | undefined {
  if (!argument) {
    return undefined;
  }
  const marker = `${label}:(`;
  const start = argument.indexOf(marker);
  if (start === -1) {
    return undefined;
  }
  let depth = 0;
  for (let i = start + marker.length - 1; i < argument.length; i++) {
    const ch = argument[i];
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) {
        return argument.slice(start + marker.length, i);
      }
    }
  }
  // Unbalanced (shouldn't happen for real SHOWPLAN_ALL output) - degrade to "couldn't extract" rather than returning a truncated/wrong substring.
  return undefined;
}

const SQLSERVER_COLUMN_BEFORE_OPERATOR =
  /\[((?:[^\]]|\]\])+)\]\s*(?:=|<>|!=|<=|>=|<|>|\bIN\b|\bLIKE\b)/gi;

export function extractSqlServerPredicateColumns(clause: string | undefined): string[] {
  if (!clause) {
    return [];
  }
  const columns = new Set<string>();
  for (const match of clause.matchAll(SQLSERVER_COLUMN_BEFORE_OPERATOR)) {
    const raw = match[1];
    if (raw) {
      columns.add(unescapeBracket(raw));
    }
  }
  return [...columns];
}

export type ParsedSqlServerPlan = {
  planNode: PlanNode;
  mappings: PlanTableMapping[];
  diagnostics: PerformanceTuningDiagnostic[];
};

type ShowplanRow = Record<string, unknown>;

type NodeCtx = {
  mappings: PlanTableMapping[];
  diagnostics: PerformanceTuningDiagnostic[];
  counter: number;
};

function buildTree(rows: ShowplanRow[]): {
  roots: ShowplanRow[];
  childrenByParent: Map<number, ShowplanRow[]>;
} {
  const childrenByParent = new Map<number, ShowplanRow[]>();
  const roots: ShowplanRow[] = [];
  for (const row of rows) {
    const parent = asNumber(row.Parent) ?? 0;
    if (parent === 0) {
      roots.push(row);
    } else {
      const list = childrenByParent.get(parent) ?? [];
      list.push(row);
      childrenByParent.set(parent, list);
    }
  }
  const byNodeId = (a: ShowplanRow, b: ShowplanRow): number =>
    (asNumber(a.NodeId) ?? 0) - (asNumber(b.NodeId) ?? 0);
  roots.sort(byNodeId);
  for (const list of childrenByParent.values()) {
    list.sort(byNodeId);
  }
  return { roots, childrenByParent };
}

function buildNode(
  row: ShowplanRow,
  parentId: string | undefined,
  depth: number,
  childrenByParent: Map<number, ShowplanRow[]>,
  ctx: NodeCtx,
): PlanNode {
  const id = `n${ctx.counter++}`;
  const operation = asString(row.PhysicalOp) ?? asString(row.Type) ?? 'Unknown';
  const argument = asString(row.Argument);
  const objectRef = extractObjectClause(argument);
  const whereClause = extractLabeledClause(argument, 'WHERE');
  const seekClause = extractLabeledClause(argument, 'SEEK');
  const predicates = [whereClause, seekClause].filter((p): p is string => !!p);

  const filterColumns = new Set<string>();
  for (const clause of predicates) {
    for (const col of extractSqlServerPredicateColumns(clause)) {
      filterColumns.add(col);
    }
  }

  const estimatedRows = asNumber(row.EstimateRows);

  if (objectRef) {
    // SET STATISTICS XML is captured separately in analyze mode, but its XML has not yet been normalized and safely matched to this SHOWPLAN_ALL mapping.
    ctx.mappings.push({
      planNodeId: id,
      schemaName: objectRef.schemaName,
      tableName: objectRef.tableName,
      alias: objectRef.alias,
      indexName: objectRef.indexName,
      estimatedRows,
      actualRows: undefined,
      rowEstimateRatio: computeRowEstimateRatio(estimatedRows, undefined),
      filterColumns: filterColumns.size > 0 ? [...filterColumns] : undefined,
    });
  } else if (argument && argument.includes('OBJECT:(')) {
    // An OBJECT:(...) clause is present but this parser couldn't make sense of it (unexpected shape) - honest degrade, never guess at a table.
    ctx.diagnostics.push({
      code: 'TABLE_MAPPING_FAILED',
      severity: 'warning',
      affectsCompleteness: true,
      scope: 'executionPlan',
      message: `Could not resolve a table for plan node ${id}. Argument: ${argumentExcerpt(argument)}`,
      node: { id, operation },
    });
  }

  const logicalOp = asString(row.LogicalOp);
  const warningsText = asString(row.Warnings);
  if (warningsText) {
    // SQL Server's own native SHOWPLAN_ALL `Warnings` column (e.g. "NO STATS: (...)") - a fact the optimizer itself reported about this node, not a driver-side collection gap, so this is information rather than a warning, same rationale as MySQL's temp-table/filesort flags.
    ctx.diagnostics.push({
      code: 'PLAN_OBSERVATION',
      severity: 'info',
      affectsCompleteness: false,
      scope: 'executionPlan',
      message: warningsText,
      node: { id, operation },
    });
  }

  const childRows = childrenByParent.get(asNumber(row.NodeId) ?? -1) ?? [];
  const children = childRows.map((childRow) =>
    buildNode(childRow, id, depth + 1, childrenByParent, ctx),
  );

  return {
    id,
    parentId,
    depth,
    operation,
    relation: objectRef
      ? { schemaName: objectRef.schemaName, tableName: objectRef.tableName, alias: objectRef.alias }
      : undefined,
    indexName: objectRef?.indexName,
    // LogicalOp is populated for every row (e.g. "Table Scan", "Aggregate"), not just joins - only surface it as joinType when it actually reads as one, matching Postgres/MySQL's joinType semantics ("Inner"/"Left Outer"/...), not every operator's logical name.
    joinType: logicalOp && /join/i.test(logicalOp) ? logicalOp : undefined,
    predicates: predicates.length > 0 ? predicates : undefined,
    estimated: {
      totalCost: asNumber(row.TotalSubtreeCost),
      rows: estimatedRows,
      width: asNumber(row.AvgRowSize),
    },
    children,
  };
}

// `rows` is the array of plain row objects SQLServerDriver.collectPerformanceTuningShowplan() returns (one row per SHOWPLAN_ALL rowset row - StmtText/StmtId/NodeId/Parent/PhysicalOp/ LogicalOp/Argument/.../EstimateRows/.../Warnings/Type/.../ EstimateExecutions).
export function parseSqlServerPlan(rows: unknown[]): ParsedSqlServerPlan {
  const ctx: NodeCtx = { mappings: [], diagnostics: [], counter: 0 };
  const validRows = Array.isArray(rows)
    ? rows.map((r) => asRecord(r)).filter((r): r is ShowplanRow => r !== undefined)
    : [];

  if (validRows.length === 0) {
    return {
      planNode: { id: 'n0', depth: 0, operation: 'Unknown', children: [] },
      mappings: [],
      diagnostics: [planUnresolvedDiagnostic()],
    };
  }

  const { roots, childrenByParent } = buildTree(validRows);
  if (roots.length === 0) {
    return {
      planNode: { id: 'n0', depth: 0, operation: 'Unknown', children: [] },
      mappings: ctx.mappings,
      diagnostics: [...ctx.diagnostics, planUnresolvedDiagnostic()],
    };
  }

  if (roots.length === 1) {
    const planNode = buildNode(roots[0], undefined, 0, childrenByParent, ctx);
    return { planNode, mappings: ctx.mappings, diagnostics: ctx.diagnostics };
  }

  // A multi-statement batch produces more than one Parent = 0 row - wrap them under one synthetic root so the tree stays single-rooted like every other vendor's PlanNode, same rationale as mysqlPlanParser's "Materialized Subquery" wrapper node.
  const id = `n${ctx.counter++}`;
  const children = roots.map((row) => buildNode(row, id, 1, childrenByParent, ctx));
  return {
    planNode: { id, depth: 0, operation: 'Batch', children },
    mappings: ctx.mappings,
    diagnostics: ctx.diagnostics,
  };
}
