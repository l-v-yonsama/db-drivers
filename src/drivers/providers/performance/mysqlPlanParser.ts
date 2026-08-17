import { PlanTableMapping } from '../../../types/drivers/performance/PerformanceTuningContext';
import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { planUnresolvedDiagnostic } from './performanceTuningDiagnosticHelpers';
import { computeRowEstimateRatio } from './planNodeMath';
import { asNumber, asRecord, asString } from './vendorRowCoercion';

// Parses the object MySQL's `EXPLAIN FORMAT=JSON` returns (already
// JSON.parse()'d by the caller). Everything here is defensive/best-effort,
// same rationale as postgresPlanParser.ts: unstructured DB output, every
// access guarded, nothing throws.
//
// MySQL's JSON shape is structurally very different from Postgres's uniform
// `Plan { Plans: [...] }` recursion - there is no single "plan node" key.
// A `query_block` (the root, and recursively every subquery/derived table)
// contains at most one of these mutually-exclusive operation containers:
//   - `table`: a single table access (scan/index lookup)
//   - `nested_loop`: an array of `{ table: {...} }` entries (MySQL's default
//     join strategy - a flat sequence of table accesses, not a binary join
//     tree the way Postgres represents Hash/Merge/Nested Loop Join)
//   - `grouping_operation` / `ordering_operation` / `duplicates_removal`:
//     each wraps another operation container of this same shape, adding
//     `using_temporary_table`/`using_filesort` flags
//   - `union_result`: `query_specifications[].query_block` per UNION branch
// This walker treats a "container" (query_block, or any of the wrappers
// above) as one recursive shape, and only `table` bottoms out into an
// actual scan/lookup node. Not modeled (degrades to "no mapping/warning
// only if the whole tree yields nothing", never throws): window functions,
// semijoin/antijoin details, `attached_subqueries`,
// `optimized_away_subqueries` - MySQL's JSON EXPLAIN surface is large and
// version-dependent; this covers the shapes that actually show up for
// ordinary SELECT/JOIN/GROUP BY/ORDER BY/UNION queries.
//
// Known limitation - aliased tables: when a query aliases a table
// (`FROM orders o`), MySQL's JSON EXPLAIN reports `table_name: "o"` - the
// *alias*, not the real table name - and there is no separate field
// carrying the original name anywhere in the JSON (confirmed against a
// live MySQL 8.0 instance; not something a defensive coercion can recover).
// A catalog lookup against that literal alias will simply not find a table
// and report the usual "not found" unavailableSections entry. The
// sanctioned workaround is `PerformanceTuningContextParams.targetTables`
// (§4.1) - RDSBaseDriver.getPerformanceTuningContext() unions those in
// alongside whatever the plan itself resolved.
//
// `planNodeId`/`PlanNode.id` are assigned depth-first ("n0", "n1", ...) by
// one shared counter across the whole walk, exactly like
// postgresPlanParser.ts, so PlanNode.id and PlanTableMapping.planNodeId
// never drift apart.

// MySQL always backtick-quotes identifiers in `attached_condition`, e.g.
// "(`test-db`.`perf_orders`.`status` = 'shipped')" - schema/table/column
// each individually quoted, dot-joined. Postgres's plain-identifier regex
// (postgresPlanParser.ts) would not match these at all, so this is a
// separate, MySQL-specific heuristic rather than a shared one: match a
// backtick-quoted segment immediately followed by a comparison operator -
// only the *last* segment in a qualified reference sits directly before
// the operator, so this naturally yields the bare column name without a
// separate "strip the qualifier" step. `` inside a quoted segment is
// MySQL's own backtick-escaping (like `` `` `` -> a literal backtick).
const MYSQL_COLUMN_BEFORE_OPERATOR =
  /`((?:[^`]|``)+)`\s*(?:=|<>|!=|<=|>=|<|>|\bIN\b|\bLIKE\b)/gi;

export function extractMysqlPredicateColumns(predicate: string | undefined): string[] {
  if (!predicate) {
    return [];
  }
  const columns = new Set<string>();
  for (const match of predicate.matchAll(MYSQL_COLUMN_BEFORE_OPERATOR)) {
    const raw = match[1];
    if (raw) {
      columns.add(raw.replace(/``/g, '`'));
    }
  }
  return [...columns];
}

// MySQL names derived tables / materialized subqueries / UNION results with
// a synthetic placeholder like "<derived2>", "<subquery3>", "<union1,2>" -
// never a real table, so a catalog lookup against it would always fail.
const isSyntheticTableName = (name: string): boolean => /^<.*>$/.test(name);

export type ParsedMysqlPlan = {
  planNode: PlanNode;
  mappings: PlanTableMapping[];
  diagnostics: PerformanceTuningDiagnostic[];
};

type NodeContext = {
  mappings: PlanTableMapping[];
  diagnostics: PerformanceTuningDiagnostic[];
  counter: number;
};

// using_temporary_table/using_filesort/using_join_buffer are factual,
// vendor-reported plan characteristics, not performance verdicts (a
// temp table or filesort is not automatically a problem) - reported as
// PLAN_OBSERVATION information, attributed to the node that carried the
// flag (§3.1/§4.2 of the diagnostics-display design doc).
const planObservationsFromFlags = (
  node: Record<string, unknown>,
  id: string,
  operation: string,
): PerformanceTuningDiagnostic[] => {
  const observations: PerformanceTuningDiagnostic[] = [];
  const push = (message: string): void => {
    observations.push({
      code: 'PLAN_OBSERVATION',
      severity: 'info',
      affectsCompleteness: false,
      scope: 'executionPlan',
      message,
      node: { id, operation },
    });
  };
  if (node.using_temporary_table === true) {
    push('Uses a temporary table.');
  }
  if (node.using_filesort === true) {
    push('Uses filesort.');
  }
  const joinBuffer = asString(node.using_join_buffer);
  if (joinBuffer) {
    push(`Uses a join buffer (${joinBuffer}).`);
  }
  return observations;
};

function visitTable(tableValue: unknown, parentId: string | undefined, depth: number, ctx: NodeContext): PlanNode | undefined {
  const table = asRecord(tableValue);
  if (!table) {
    return undefined;
  }
  const id = `n${ctx.counter++}`;
  const operation = asString(table.access_type) ?? 'table';
  const rawTableName = asString(table.table_name);
  const synthetic = rawTableName ? isSyntheticTableName(rawTableName) : false;

  const usedKeyParts = Array.isArray(table.used_key_parts)
    ? table.used_key_parts.filter((c): c is string => typeof c === 'string')
    : [];
  const attachedCondition = asString(table.attached_condition);
  const filterColumns = new Set<string>([
    ...usedKeyParts,
    ...extractMysqlPredicateColumns(attachedCondition),
  ]);

  const estimatedRows = asNumber(table.rows_produced_per_join) ?? asNumber(table.rows_examined_per_scan);
  const indexName = asString(table.key);

  if (rawTableName && !synthetic) {
    // actualRows only exists under an EXPLAIN ANALYZE-equivalent, not
    // implemented for MySQL yet - left undefined (never guessed), same as
    // computeRowEstimateRatio() then also resolving to undefined until a
    // real actualRows source exists.
    const actualRows: number | undefined = undefined;
    ctx.mappings.push({
      planNodeId: id,
      tableName: rawTableName,
      indexName,
      estimatedRows,
      actualRows,
      rowEstimateRatio: computeRowEstimateRatio(estimatedRows, actualRows),
      filterColumns: filterColumns.size > 0 ? [...filterColumns] : undefined,
    });
  } else if (rawTableName) {
    // A derived table / materialized subquery / UNION result placeholder
    // (`<derivedN>`/`<subqueryN>`/`<unionN,M>`) - fully understood, not a
    // mapping failure: there was never a real table here to attach
    // DDL/statistics to, only its own contents
    // (materialized_from_subquery.query_block below), which are still
    // walked and may themselves resolve real tables. Reported as
    // information, not a warning (§4.2) - `objectKind: 'subquery'` covers
    // every one of MySQL's synthetic placeholder kinds (derived table,
    // materialized subquery, UNION result), none of which map cleanly onto
    // the other, more specific objectKind values.
    ctx.diagnostics.push({
      code: 'NON_TABLE_PLAN_SOURCE',
      severity: 'info',
      affectsCompleteness: false,
      scope: 'executionPlan',
      message: `Plan node ${id} (${rawTableName}) reads from a synthetic derived/subquery/union result, not a physical table; table definitions and statistics do not apply to it.`,
      node: { id, operation, objectKind: 'subquery', objectName: rawTableName },
    });
  }

  ctx.diagnostics.push(...planObservationsFromFlags(table, id, operation));

  const children: PlanNode[] = [];
  const materialized = asRecord(table.materialized_from_subquery);
  const materializedQueryBlock = materialized ? asRecord(materialized.query_block) : undefined;
  if (materializedQueryBlock) {
    const wrapperId = `n${ctx.counter++}`;
    const subChild = visitContainer(materializedQueryBlock, wrapperId, depth + 2, ctx);
    children.push({
      id: wrapperId,
      parentId: id,
      depth: depth + 1,
      operation: 'Materialized Subquery',
      children: subChild ? [subChild] : [],
    });
  }

  return {
    id,
    parentId,
    depth,
    operation,
    relation:
      rawTableName && !synthetic
        ? { tableName: rawTableName }
        : undefined,
    indexName,
    predicates: attachedCondition ? [attachedCondition] : undefined,
    estimated: {
      totalCost: asNumber(asRecord(table.cost_info)?.prefix_cost),
      rows: estimatedRows,
    },
    children,
  };
}

// A "container" is query_block or any of its wrapper operations - all four
// share the same set of mutually-exclusive sub-keys (§ file doc comment
// above), so one function handles every level of the tree.
function visitContainer(
  containerValue: unknown,
  parentId: string | undefined,
  depth: number,
  ctx: NodeContext,
): PlanNode | undefined {
  const container = asRecord(containerValue);
  if (!container) {
    return undefined;
  }

  if (container.table !== undefined) {
    return visitTable(container.table, parentId, depth, ctx);
  }

  if (Array.isArray(container.nested_loop)) {
    const id = `n${ctx.counter++}`;
    const children: PlanNode[] = [];
    for (const entry of container.nested_loop) {
      const entryRecord = asRecord(entry);
      const child = entryRecord ? visitTable(entryRecord.table, id, depth + 1, ctx) : undefined;
      if (child) {
        children.push(child);
      }
    }
    return { id, parentId, depth, operation: 'Nested Loop', children };
  }

  const wrapperKeys = [
    ['grouping_operation', 'Group By'],
    ['ordering_operation', 'Order By'],
    ['duplicates_removal', 'Duplicates Removal'],
  ] as const;
  for (const [key, operation] of wrapperKeys) {
    const wrapped = container[key];
    if (wrapped !== undefined) {
      const id = `n${ctx.counter++}`;
      const wrappedRecord = asRecord(wrapped);
      if (wrappedRecord) {
        ctx.diagnostics.push(...planObservationsFromFlags(wrappedRecord, id, operation));
      }
      const child = visitContainer(wrapped, id, depth + 1, ctx);
      return {
        id,
        parentId,
        depth,
        operation,
        children: child ? [child] : [],
      };
    }
  }

  const unionResult = asRecord(container.union_result);
  if (unionResult) {
    const id = `n${ctx.counter++}`;
    const specs = Array.isArray(unionResult.query_specifications)
      ? unionResult.query_specifications
      : [];
    const children: PlanNode[] = [];
    for (const spec of specs) {
      const specRecord = asRecord(spec);
      const queryBlock = specRecord ? specRecord.query_block : undefined;
      const child = visitContainer(queryBlock, id, depth + 1, ctx);
      if (child) {
        children.push(child);
      }
    }
    return { id, parentId, depth, operation: 'Union Result', children };
  }

  // A container with none of the recognized keys - e.g. `{ "message":
  // "Impossible WHERE" }` for a query the optimizer proved returns no rows.
  // Not a failure: a factual, vendor-reported plan-level observation
  // (§3.1), represented as both a leaf node and a PLAN_OBSERVATION
  // diagnostic rather than silently vanishing or only living on the node.
  const message = asString(container.message);
  if (message) {
    const id = `n${ctx.counter++}`;
    ctx.diagnostics.push({
      code: 'PLAN_OBSERVATION',
      severity: 'info',
      affectsCompleteness: false,
      scope: 'executionPlan',
      message,
      node: { id, operation: 'Message' },
    });
    return { id, parentId, depth, operation: 'Message', children: [] };
  }

  return undefined;
}

// `explainRoot` is expected to be the object MySQL's `EXPLAIN FORMAT=JSON
// ...` returns (already JSON.parse()'d), i.e. `{ query_block: {...} }`.
export function parseMysqlPlan(explainRoot: unknown): ParsedMysqlPlan {
  const ctx: NodeContext = { mappings: [], diagnostics: [], counter: 0 };
  const queryBlock = asRecord(explainRoot)?.query_block;
  const planNode = visitContainer(queryBlock, undefined, 0, ctx);

  return {
    planNode: planNode ?? { id: 'n0', depth: 0, operation: 'Unknown', children: [] },
    mappings: ctx.mappings,
    diagnostics: planNode ? ctx.diagnostics : [...ctx.diagnostics, planUnresolvedDiagnostic()],
  };
}
