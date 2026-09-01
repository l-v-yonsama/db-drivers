import { PlanTableMapping } from '../../../types/drivers/performance/PerformanceTuningContext';
import { PerformanceTuningDiagnostic } from '../../../types/drivers/performance/PerformanceTuningDiagnostic';
import { PlanNode } from '../../../types/drivers/performance/PlanNode';
import { planUnresolvedDiagnostic } from './performanceTuningDiagnosticHelpers';
import { computeRowEstimateRatio } from './planNodeMath';
import { asNumber, asRecord, asString } from './vendorRowCoercion';


// MySQL always backtick-quotes identifiers in `attached_condition`, e.g. "(`test-db`.`perf_orders`.`status` = 'shipped')" - schema/table/column each individually quoted, dot-joined.
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

// MySQL names derived tables / materialized subqueries / UNION results with a synthetic placeholder like "<derived2>", "<subquery3>", "<union1,2>" - never a real table, so a catalog lookup against it would always fail.
export const isSyntheticTableName = (name: string): boolean => /^<.*>$/.test(name);

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
    // actualRows only exists under an EXPLAIN ANALYZE-equivalent, not implemented for MySQL yet - left undefined (never guessed), same as computeRowEstimateRatio() then also resolving to undefined until a real actualRows source exists.
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

// A "container" is query_block or any of its wrapper operations - all four share the same set of mutually-exclusive sub-keys (§ file doc comment above), so one function handles every level of the tree.
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

// `explainRoot` is expected to be the object MySQL's `EXPLAIN FORMAT=JSON ...` returns (already JSON.parse()'d), i.e. `{ query_block: {...} }`.
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
