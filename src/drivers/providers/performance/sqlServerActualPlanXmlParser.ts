import type { PlanTableMapping, RuntimeObservation } from '../../../types/drivers/performance/PerformanceTuningContext';

// SET STATISTICS XML returns ShowPlan XML rather than a documented
// row-oriented runtime API.  The parser below intentionally recognizes only
// the small, stable subset needed to enrich an already-resolved SHOWPLAN_ALL
// table mapping.  In particular, it matches by the database-reported
// {schema, table, alias, index} identity, never by the two plans' NodeId:
// recompilation, adaptive choices, and extra internal operators mean those
// independently generated trees must not be positionally aligned.

type ActualPlanNode = {
  physicalOp?: string;
  logicalOp?: string;
  relation?: {
    schemaName?: string;
    tableName: string;
    alias?: string;
    indexName?: string;
  };
  actualRowsTotal: number;
  actualRowsReadTotal: number;
  actualExecutionsMax: number;
  hasActualRows: boolean;
  hasActualRowsRead: boolean;
  hasLocalPredicate: boolean;
  children: ActualPlanNode[];
};

export type SqlServerActualPlanTableStat = {
  actualRows?: number;
  tableAccessRows?: number;
  predicateFilterInputRows?: number;
  predicateFilterOutputRows?: number;
  indexName?: string;
};

type XmlAttributes = Record<string, string>;

const BRACKET_SEGMENT = /^\[(.*)\]$/;
const unbracket = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const match = BRACKET_SEGMENT.exec(value);
  return (match ? match[1] : value).replace(/]]/g, ']');
};

function attributesOf(tag: string): XmlAttributes {
  const attributes: XmlAttributes = {};
  // SQL Server's ShowPlan XML consistently double-quotes attributes.  This
  // tokenizer is deliberately narrow: malformed/unfamiliar XML simply
  // yields fewer facts rather than attempting a lossy general XML parse.
  for (const match of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

function finiteNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function rowsPerExecution(node: ActualPlanNode, value: number): number | undefined {
  // ActualRows is cumulative for repeated inner-side executions.  For a
  // parallel operator, each worker normally reports ActualExecutions=1, so
  // using the maximum (not the sum) preserves the plan-wide row count while
  // still normalizing an ordinary nested-loop re-execution.
  return node.actualExecutionsMax > 0 ? value / node.actualExecutionsMax : value;
}

function parseActualPlanTree(xml: string): ActualPlanNode[] {
  const roots: ActualPlanNode[] = [];
  const stack: ActualPlanNode[] = [];
  // A ShowPlan value may be formatted across lines or supplied as one line;
  // tags are all that matter here. XML entities keep literal '<'/'>' out of
  // attribute values, so this deliberately small tokenizer remains safe.
  const tags = xml.match(/<[^>]+>/g) ?? [];
  for (const tag of tags) {
    const closing = /^<\//.test(tag);
    const name = /^<\/?([\w:-]+)/.exec(tag)?.[1];
    if (!name) {
      continue;
    }
    if (closing) {
      if (name === 'RelOp') {
        stack.pop();
      }
      continue;
    }

    const attributes = attributesOf(tag);
    const current = stack[stack.length - 1];
    if (name === 'RelOp') {
      const node: ActualPlanNode = {
        physicalOp: attributes.PhysicalOp,
        logicalOp: attributes.LogicalOp,
        actualRowsTotal: 0,
        actualRowsReadTotal: 0,
        actualExecutionsMax: 0,
        hasActualRows: false,
        hasActualRowsRead: false,
        hasLocalPredicate: false,
        children: [],
      };
      if (current) {
        current.children.push(node);
      } else {
        roots.push(node);
      }
      stack.push(node);
      continue;
    }
    if (!current) {
      continue;
    }
    if (name === 'RunTimeCountersPerThread') {
      const actualRows = finiteNumber(attributes.ActualRows);
      const actualRowsRead = finiteNumber(attributes.ActualRowsRead);
      const actualExecutions = finiteNumber(attributes.ActualExecutions);
      if (actualRows !== undefined) {
        current.actualRowsTotal += actualRows;
        current.hasActualRows = true;
      }
      if (actualRowsRead !== undefined) {
        current.actualRowsReadTotal += actualRowsRead;
        current.hasActualRowsRead = true;
      }
      if (actualExecutions !== undefined) {
        current.actualExecutionsMax = Math.max(current.actualExecutionsMax, actualExecutions);
      }
    } else if (name === 'Object') {
      const tableName = unbracket(attributes.Table);
      if (tableName) {
        current.relation = {
          schemaName: unbracket(attributes.Schema),
          tableName,
          alias: unbracket(attributes.Alias),
          indexName: unbracket(attributes.Index),
        };
      }
    } else if (name === 'Predicate') {
      current.hasLocalPredicate = true;
    }
  }
  return roots;
}

const same = (left: string | undefined, right: string | undefined): boolean =>
  left !== undefined && right !== undefined && left.toLowerCase() === right.toLowerCase();

function resolveMapping(node: ActualPlanNode, mappings: PlanTableMapping[]): PlanTableMapping | undefined {
  if (!node.relation) {
    return undefined;
  }
  const tableMatches = mappings.filter(
    (mapping) =>
      same(mapping.tableName, node.relation?.tableName) &&
      (node.relation.schemaName === undefined || mapping.schemaName === undefined || same(mapping.schemaName, node.relation.schemaName)),
  );
  if (tableMatches.length === 1) {
    return tableMatches[0];
  }
  const aliasMatches = tableMatches.filter((mapping) => same(mapping.alias, node.relation?.alias));
  if (aliasMatches.length === 1) {
    return aliasMatches[0];
  }
  const indexMatches = (aliasMatches.length > 0 ? aliasMatches : tableMatches).filter((mapping) =>
    same(mapping.indexName, node.relation?.indexName),
  );
  return indexMatches.length === 1 ? indexMatches[0] : undefined;
}

function tableNodes(nodes: ActualPlanNode[]): ActualPlanNode[] {
  const found: ActualPlanNode[] = [];
  const visit = (node: ActualPlanNode): void => {
    if (node.relation) {
      found.push(node);
    }
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return found;
}

/**
 * Resolves only a unique actual XML relation to one SHOWPLAN_ALL mapping.
 * `ActualRowsRead` is SQL Server's measured access candidate count, where
 * available; a local `<Predicate>` then gives the measured pass rate via
 * `ActualRowsRead -> ActualRows`.  Without RowsRead, we expose an access
 * count only when there is no local predicate, rather than pretending that
 * post-filter output was the pre-filter candidate set.
 */
export function resolveSqlServerActualPlanTableStats(
  actualPlanXml: string,
  planTableMappings: PlanTableMapping[],
): Map<string, SqlServerActualPlanTableStat> {
  const candidatesByMappingId = new Map<string, ActualPlanNode[]>();
  for (const node of tableNodes(parseActualPlanTree(actualPlanXml))) {
    const mapping = resolveMapping(node, planTableMappings);
    if (mapping) {
      candidatesByMappingId.set(mapping.planNodeId, [...(candidatesByMappingId.get(mapping.planNodeId) ?? []), node]);
    }
  }

  const result = new Map<string, SqlServerActualPlanTableStat>();
  for (const mapping of planTableMappings) {
    const candidates = candidatesByMappingId.get(mapping.planNodeId) ?? [];
    if (candidates.length !== 1) {
      continue;
    }
    const node = candidates[0];
    const actualRows = node.hasActualRows ? rowsPerExecution(node, node.actualRowsTotal) : undefined;
    const actualRowsRead = node.hasActualRowsRead
      ? rowsPerExecution(node, node.actualRowsReadTotal)
      : undefined;
    const tableAccessRows = actualRowsRead ?? (node.hasLocalPredicate ? undefined : actualRows);
    if (actualRows === undefined && tableAccessRows === undefined && !node.relation?.indexName) {
      continue;
    }
    result.set(mapping.planNodeId, {
      actualRows,
      tableAccessRows,
      predicateFilterInputRows: node.hasLocalPredicate ? actualRowsRead : undefined,
      predicateFilterOutputRows: node.hasLocalPredicate ? actualRows : undefined,
      indexName: node.relation?.indexName,
    });
  }
  return result;
}

const columnNames = (xml: string): string[] =>
  [...xml.matchAll(/<Column\b[^>]*\bName="([^"]+)"[^>]*\/>/g)]
    .map((match) => unbracket(match[1]))
    .filter((value): value is string => Boolean(value));

/**
 * Keeps high-signal SQL Server runtime facts when the full STATISTICS XML is
 * omitted from a compact AI request.  These observations are deliberately
 * independent of SHOWPLAN_ALL node IDs and table mappings.
 */
export function extractSqlServerRuntimeObservations(actualPlanXml: string): RuntimeObservation[] {
  const observations: RuntimeObservation[] = [];
  for (const group of actualPlanXml.matchAll(/<MissingIndexGroup\b([^>]*)>([\s\S]*?)<\/MissingIndexGroup>/g)) {
    const impact = finiteNumber(attributesOf(group[1]).Impact);
    const index = /<MissingIndex\b([^>]*)>/i.exec(group[2]);
    if (!index) {
      continue;
    }
    const attributes = attributesOf(index[1]);
    const columns: RuntimeObservation['columns'] = {};
    for (const columnGroup of group[2].matchAll(/<ColumnGroup\b([^>]*)>([\s\S]*?)<\/ColumnGroup>/g)) {
      const usage = attributesOf(columnGroup[1]).Usage?.toLowerCase();
      const names = columnNames(columnGroup[2]);
      if (usage === 'equality') columns.equality = names;
      if (usage === 'inequality') columns.inequality = names;
      if (usage === 'include') columns.include = names;
    }
    observations.push({
      kind: 'missingIndex',
      source: 'SQL Server SET STATISTICS XML MissingIndexGroup',
      label: 'SQL Server missing-index suggestion',
      schemaName: unbracket(attributes.Schema),
      tableName: unbracket(attributes.Table),
      metrics: impact === undefined ? undefined : { impact },
      columns,
    });
  }
  const memoryGrant = /<MemoryGrantInfo\b([^>]*)\/?\s*>/i.exec(actualPlanXml);
  if (memoryGrant) {
    const attributes = attributesOf(memoryGrant[1]);
    const metrics = Object.fromEntries(
      ['RequestedMemory', 'GrantedMemory', 'MaxUsedMemory', 'GrantWarning'].flatMap((key) => {
        const value = key === 'GrantWarning' ? attributes[key] : finiteNumber(attributes[key]);
        return value === undefined ? [] : [[key, value]];
      }),
    );
    if (Object.keys(metrics).length > 0) {
      observations.push({
        kind: 'memoryGrant',
        source: 'SQL Server SET STATISTICS XML MemoryGrantInfo',
        label: 'Memory grant',
        metrics,
      });
    }
  }
  const queryTime = /<QueryTimeStats\b([^>]*)\/?\s*>/i.exec(actualPlanXml);
  if (queryTime) {
    const attributes = attributesOf(queryTime[1]);
    const cpuTimeMs = finiteNumber(attributes.CpuTime);
    const elapsedTimeMs = finiteNumber(attributes.ElapsedTime);
    if (cpuTimeMs !== undefined || elapsedTimeMs !== undefined) {
      observations.push({
        kind: 'timing',
        source: 'SQL Server SET STATISTICS XML QueryTimeStats',
        label: 'Query timing',
        metrics: {
          ...(cpuTimeMs === undefined ? {} : { cpuTimeMs }),
          ...(elapsedTimeMs === undefined ? {} : { elapsedTimeMs }),
        },
      });
    }
  }
  for (const wait of actualPlanXml.matchAll(/<Wait\b([^>]*)\/?\s*>/gi)) {
    const attributes = attributesOf(wait[1]);
    const waitTimeMs = finiteNumber(attributes.WaitTimeMs);
    const waitCount = finiteNumber(attributes.WaitCount);
    const waitType = attributes.WaitType;
    if (!waitType && waitTimeMs === undefined && waitCount === undefined) {
      continue;
    }
    observations.push({
      kind: 'wait',
      source: 'SQL Server SET STATISTICS XML WaitStats',
      label: waitType ? `Wait: ${waitType}` : 'Query wait',
      metrics: {
        ...(waitType === undefined ? {} : { waitType }),
        ...(waitTimeMs === undefined ? {} : { waitTimeMs }),
        ...(waitCount === undefined ? {} : { waitCount }),
      },
    });
  }
  return observations;
}
