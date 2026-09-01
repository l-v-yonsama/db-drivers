import type { PlanTableMapping, RuntimeObservation } from '../../../types/drivers/performance/PerformanceTuningContext';

// DBMS_XPLAN.DISPLAY_CURSOR(..., 'ALLSTATS LAST') is a human-oriented text table, not a stable machine API.

type OracleActualPlanNode = {
  id: number;
  depth: number;
  operation: string;
  name?: string;
  starts?: number;
  actualRows?: number;
  elapsedMs?: number;
  buffers?: number;
  children: OracleActualPlanNode[];
};

export type OracleActualPlanTableStat = {
  actualRows?: number;
  tableAccessRows?: number;
  predicateFilterInputRows?: number;
  predicateFilterOutputRows?: number;
  indexName?: string;
};

function parseDisplayNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const match = /^([0-9]+(?:\.[0-9]+)?)([KMGTP])?$/i.exec(value.replace(/,/g, '').trim());
  if (!match) {
    return undefined;
  }
  const valueAsNumber = Number(match[1]);
  const multiplier =
    match[2]?.toUpperCase() === 'K'
      ? 1_000
      : match[2]?.toUpperCase() === 'M'
        ? 1_000_000
        : match[2]?.toUpperCase() === 'G'
          ? 1_000_000_000
          : match[2]?.toUpperCase() === 'T'
            ? 1_000_000_000_000
            : match[2]?.toUpperCase() === 'P'
              ? 1_000_000_000_000_000
              : 1;
  return Number.isFinite(valueAsNumber) ? valueAsNumber * multiplier : undefined;
}

function parseElapsedMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  // DBMS_XPLAN commonly prints HH:MI:SS.FF (optionally prefixed by days).
  const match = /^\+?(?:(\d+):)?(\d{2}):(\d{2})(?:\.(\d+))?$/.exec(value.trim());
  if (!match) return undefined;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = Number(`0.${match[4] ?? '0'}`) * 1_000;
  const result = ((hours * 60 + minutes) * 60 + seconds) * 1_000 + milliseconds;
  return Number.isFinite(result) ? result : undefined;
}

function cellsOf(line: string): string[] | undefined {
  if (!line.trimStart().startsWith('|')) {
    return undefined;
  }
  const cells = line.split('|');
  return cells.length >= 3 ? cells.slice(1, -1) : undefined;
}

function buildActualPlanTree(content: string): OracleActualPlanNode[] {
  const lines = content.split(/\r?\n/);
  let headings: string[] | undefined;
  const flatNodes: Array<Omit<OracleActualPlanNode, 'depth' | 'children'> & { rawDepth: number }> = [];

  for (const line of lines) {
    const cells = cellsOf(line);
    if (!cells) {
      continue;
    }
    const trimmedCells = cells.map((cell) => cell.trim());
    if (!headings) {
      if (trimmedCells.some((cell) => /^id$/i.test(cell)) && trimmedCells.some((cell) => /^operation$/i.test(cell))) {
        headings = trimmedCells.map((cell) => cell.toLowerCase());
      }
      continue;
    }

    const idIndex = headings.indexOf('id');
    const operationIndex = headings.indexOf('operation');
    const startsIndex = headings.indexOf('starts');
    const actualRowsIndex = headings.indexOf('a-rows');
    const elapsedIndex = headings.indexOf('a-time');
    const buffersIndex = headings.indexOf('buffers');
    const nameIndex = headings.indexOf('name');
    const id = parseDisplayNumber(trimmedCells[idIndex]?.replace(/^\*\s*/, ''));
    const operationCell = cells[operationIndex];
    if (id === undefined || !operationCell) {
      continue;
    }
    const operation = operationCell.trim();
    if (!operation) {
      continue;
    }
    const rawDepth = operationCell.length - operationCell.trimStart().length;
    flatNodes.push({
      id,
      rawDepth,
      operation,
      name: nameIndex >= 0 ? trimmedCells[nameIndex] || undefined : undefined,
      starts: startsIndex >= 0 ? parseDisplayNumber(trimmedCells[startsIndex]) : undefined,
      actualRows: actualRowsIndex >= 0 ? parseDisplayNumber(trimmedCells[actualRowsIndex]) : undefined,
      elapsedMs: elapsedIndex >= 0 ? parseElapsedMs(trimmedCells[elapsedIndex]) : undefined,
      buffers: buffersIndex >= 0 ? parseDisplayNumber(trimmedCells[buffersIndex]) : undefined,
    });
  }

  if (flatNodes.length === 0) {
    return [];
  }
  const baseDepth = Math.min(...flatNodes.map((node) => node.rawDepth));
  const roots: OracleActualPlanNode[] = [];
  const stack: OracleActualPlanNode[] = [];
  for (const { rawDepth, ...flatNode } of flatNodes) {
    const node: OracleActualPlanNode = {
      ...flatNode,
      depth: rawDepth - baseDepth,
      children: [],
    };
    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
    stack.push(node);
  }
  return roots;
}

function flattenNodes(nodes: OracleActualPlanNode[]): OracleActualPlanNode[] {
  return nodes.flatMap((node) => [node, ...flattenNodes(node.children)]);
}

/** Extracts a compact, unambiguous runtime summary from DISPLAY_CURSOR. */
export function extractOracleRuntimeObservations(actualPlanText: string): RuntimeObservation[] {
  const nodes = flattenNodes(buildActualPlanTree(actualPlanText));
  const candidates = nodes.filter(
    (node) => node.actualRows !== undefined || node.buffers !== undefined || node.elapsedMs !== undefined,
  );
  if (candidates.length === 0) return [];
  // A relation-bearing operation is more actionable than SELECT STATEMENT or a generic join/root with the same cumulative counters.
  const relationCandidates = candidates.filter((node) => node.name);
  const dominant = (relationCandidates.length > 0 ? relationCandidates : candidates).reduce((best, node) => {
    const bestScore = (best.buffers ?? 0) || (best.elapsedMs ?? 0) || (best.actualRows ?? 0);
    const score = (node.buffers ?? 0) || (node.elapsedMs ?? 0) || (node.actualRows ?? 0);
    return score > bestScore ? node : best;
  });
  return [
    {
      kind: 'runtimeOperation',
      source: 'Oracle DBMS_XPLAN.DISPLAY_CURSOR ALLSTATS LAST',
      label: 'Dominant runtime operation',
      operation: dominant.operation,
      tableName: dominant.name,
      metrics: {
        ...(dominant.starts === undefined ? {} : { starts: dominant.starts }),
        ...(dominant.actualRows === undefined ? {} : { actualRows: dominant.actualRows }),
        ...(dominant.elapsedMs === undefined ? {} : { elapsedMs: dominant.elapsedMs }),
        ...(dominant.buffers === undefined ? {} : { buffers: dominant.buffers }),
      },
    },
  ];
}

function filterOperationIds(content: string): Set<number> {
  const ids = new Set<number>();
  for (const line of content.split(/\r?\n/)) {
    const match = /^\s*(\d+)\s*-\s*filter\s*\(/i.exec(line);
    if (match) {
      ids.add(Number(match[1]));
    }
  }
  return ids;
}

function rowsPerExecution(rows: number | undefined, starts: number | undefined): number | undefined {
  if (rows === undefined) {
    return undefined;
  }
  return starts && starts > 0 ? rows / starts : rows;
}

function collectTableAccessNodes(nodes: OracleActualPlanNode[]): OracleActualPlanNode[] {
  const found: OracleActualPlanNode[] = [];
  const visit = (node: OracleActualPlanNode): void => {
    if (/^TABLE ACCESS\b/i.test(node.operation) && node.name) {
      found.push(node);
    }
    node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return found;
}

// An INDEX FAST FULL SCAN can be the physical relation access itself (for example COUNT(*) can be satisfied from an index) and therefore have no TABLE ACCESS parent in DISPLAY_CURSOR.
function collectStandaloneIndexAccessNodes(nodes: OracleActualPlanNode[]): OracleActualPlanNode[] {
  const found: OracleActualPlanNode[] = [];
  const visit = (node: OracleActualPlanNode, belowTableAccess: boolean): void => {
    const isTableAccess = /^TABLE ACCESS\b/i.test(node.operation);
    if (!belowTableAccess && !isTableAccess && /^INDEX\b/i.test(node.operation) && node.name) {
      found.push(node);
    }
    node.children.forEach((child) => visit(child, belowTableAccess || isTableAccess));
  };
  nodes.forEach((node) => visit(node, false));
  return found;
}

/** Resolves only a one-to-one table-name match between DISPLAY_CURSOR's runtime table access and the structured PLAN_TABLE mapping. */
export function resolveOracleActualPlanTableStats(
  actualPlanText: string,
  planTableMappings: PlanTableMapping[],
): Map<string, OracleActualPlanTableStat> {
  const actualPlanNodes = buildActualPlanTree(actualPlanText);
  const actualNodes = collectTableAccessNodes(actualPlanNodes);
  const standaloneIndexNodes = collectStandaloneIndexAccessNodes(actualPlanNodes);
  const filterIds = filterOperationIds(actualPlanText);
  const mappingsByTable = new Map<string, PlanTableMapping[]>();
  for (const mapping of planTableMappings) {
    const key = mapping.tableName.toLowerCase();
    mappingsByTable.set(key, [...(mappingsByTable.get(key) ?? []), mapping]);
  }

  const nodesByMappingId = new Map<string, OracleActualPlanNode[]>();
  for (const node of actualNodes) {
    const candidates = mappingsByTable.get(node.name!.toLowerCase()) ?? [];
    if (candidates.length === 1) {
      const mapping = candidates[0];
      nodesByMappingId.set(mapping.planNodeId, [...(nodesByMappingId.get(mapping.planNodeId) ?? []), node]);
    }
  }

  // Index-only operations have no table name in DISPLAY_CURSOR, but are safe to attach when exactly one existing PLAN_TABLE mapping uses that index.
  const mappingsByIndex = new Map<string, PlanTableMapping[]>();
  for (const mapping of planTableMappings) {
    if (!mapping.indexName) continue;
    const key = mapping.indexName.toLowerCase();
    mappingsByIndex.set(key, [...(mappingsByIndex.get(key) ?? []), mapping]);
  }
  for (const node of standaloneIndexNodes) {
    const candidates = mappingsByIndex.get(node.name!.toLowerCase()) ?? [];
    if (candidates.length === 1) {
      const mapping = candidates[0];
      nodesByMappingId.set(mapping.planNodeId, [...(nodesByMappingId.get(mapping.planNodeId) ?? []), node]);
    }
  }

  const result = new Map<string, OracleActualPlanTableStat>();
  for (const mapping of planTableMappings) {
    const candidates = nodesByMappingId.get(mapping.planNodeId) ?? [];
    if (candidates.length !== 1) {
      continue;
    }
    const node = candidates[0];
    const actualRows = rowsPerExecution(node.actualRows, node.starts);
    const isStandaloneIndexAccess = standaloneIndexNodes.includes(node);
    const indexChildren = node.children.filter((child) => /^INDEX\b/i.test(child.operation));
    const indexChild = indexChildren.length === 1 ? indexChildren[0] : undefined;
    const indexRows = indexChild ? rowsPerExecution(indexChild.actualRows, indexChild.starts) : undefined;
    const hasLocalFilter = filterIds.has(node.id);
    const tableAccessRows = isStandaloneIndexAccess
      ? undefined
      : indexRows ?? (hasLocalFilter ? undefined : actualRows);

    if (actualRows === undefined && tableAccessRows === undefined && !indexChild?.name && !node.name) {
      continue;
    }
    result.set(mapping.planNodeId, {
      actualRows,
      tableAccessRows,
      predicateFilterInputRows: hasLocalFilter && !isStandaloneIndexAccess ? indexRows : undefined,
      predicateFilterOutputRows: hasLocalFilter ? actualRows : undefined,
      indexName: isStandaloneIndexAccess ? node.name : indexChild?.name,
    });
  }
  return result;
}
