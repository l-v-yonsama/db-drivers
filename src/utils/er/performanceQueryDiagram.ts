import {
  ConstraintDefinition,
  IndexDefinition,
  PerformanceTuningContext,
  PlanTableMapping,
  TableTuningContext,
} from '../../types';
import { parseQuery } from '../../helpers/sql/queryParser';

export type PerformanceQueryDiagramResult = {
  /** Mermaid source without a Markdown fence. */
  mermaid: string;
  /** Indexes that participate in the query's predicates, joins, grouping, sorting, or plan access. */
  relevantIndexes: PerformanceQueryRelevantIndex[];
  warnings: string[];
};

export type PerformanceQueryRelevantIndex = {
  schemaName?: string;
  tableName: string;
  alias?: string;
  indexName: string;
  columns: string[];
  includedColumns?: string[];
  unique: boolean;
  primary: boolean;
  relevance: string[];
};

type DiagramEntity = {
  id: string;
  schemaName?: string;
  tableName: string;
  alias?: string;
  table?: TableTuningContext;
  mappings: PlanTableMapping[];
  columnNames: Set<string>;
};

const eq = (left: string | undefined, right: string | undefined): boolean =>
  (left ?? '').toLocaleLowerCase() === (right ?? '').toLocaleLowerCase();

function physicalKey(schemaName: string | undefined, tableName: string): string {
  return `${schemaName?.toLocaleLowerCase() ?? ''}.${tableName.toLocaleLowerCase()}`;
}

function entityKey(mapping: PlanTableMapping): string {
  return `${physicalKey(mapping.schemaName, mapping.tableName)}|${(
    mapping.alias ?? mapping.tableName
  ).toLocaleLowerCase()}`;
}

function safeIdentifier(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_');
  const nonEmpty = sanitized.replace(/^_+|_+$/g, '') || 'TABLE';
  return /^[a-zA-Z_]/.test(nonEmpty) ? nonEmpty : `T_${nonEmpty}`;
}

function escapeQuoted(value: string): string {
  return value.replace(/"/g, '#quot;').replace(/\r?\n/g, ' ');
}

/**
 * Mermaid ER attributes accept only a word for the type. Precision/length is
 * useful in DDL but makes a compact query diagram harder to scan, so retain
 * the base database type (NUMBER, VARCHAR2, TIMESTAMP, ...).
 */
function displayDiagramColumnType(dataType: string | undefined): string {
  const normalized = (dataType ?? 'unknown').trim().toLocaleUpperCase();
  if (/^(CHARACTER\s+VARYING|VARYING\s+CHARACTER)/.test(normalized)) {
    return 'VARCHAR';
  }
  if (/^DOUBLE\s+PRECISION/.test(normalized)) {
    return 'DOUBLE';
  }
  const baseType = normalized.match(/[A-Z][A-Z0-9_]*/)?.[0] ?? 'UNKNOWN';
  return safeIdentifier(baseType);
}

function findTable(
  tables: TableTuningContext[],
  schemaName: string | undefined,
  tableName: string,
): TableTuningContext | undefined {
  const sameName = tables.filter((table) => eq(table.tableName, tableName));
  return sameName.find((table) => eq(table.schemaName, schemaName)) ??
    (sameName.length === 1 ? sameName[0] : undefined);
}

function addColumns(target: Set<string>, values: string[] | undefined): void {
  values?.filter(Boolean).forEach((value) => target.add(value));
}

function buildEntities(context: PerformanceTuningContext, warnings: string[]): DiagramEntity[] {
  const grouped = new Map<string, PlanTableMapping[]>();
  for (const mapping of context.planTableMappings) {
    const key = entityKey(mapping);
    grouped.set(key, [...(grouped.get(key) ?? []), mapping]);
  }

  // A provider can return table context even when a plan-to-table mapping is
  // unavailable. Keep the query diagram useful in that partial-result case.
  if (grouped.size === 0) {
    for (const table of context.tables) {
      grouped.set(physicalKey(table.schemaName, table.tableName), [
        {
          planNodeId: `table:${physicalKey(table.schemaName, table.tableName)}`,
          schemaName: table.schemaName,
          tableName: table.tableName,
        },
      ]);
    }
  }

  const usedIds = new Set<string>();
  return [...grouped.values()].map((mappings) => {
    const first = mappings[0];
    const table = findTable(context.tables, first.schemaName, first.tableName);
    if (!table?.definition) {
      warnings.push(
        `Column definitions were not available for ${[
          first.schemaName,
          first.tableName,
        ].filter(Boolean).join('.')}.`,
      );
    }

    const baseId = safeIdentifier(
      [first.schemaName, first.tableName, first.alias].filter(Boolean).join('_'),
    );
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id.toLocaleLowerCase())) {
      id = `${baseId}_${suffix++}`;
    }
    usedIds.add(id.toLocaleLowerCase());

    const columnNames = new Set<string>();
    for (const mapping of mappings) {
      addColumns(columnNames, mapping.filterColumns);
      addColumns(columnNames, mapping.joinColumns);
      addColumns(columnNames, mapping.groupColumns);
      addColumns(columnNames, mapping.sortColumns);

      const usedIndex = table?.definition?.indexes.find((index) =>
        eq(index.indexName, mapping.indexName),
      );
      usedIndex?.columns.forEach((column) => {
        if (column.columnName) {
          columnNames.add(column.columnName);
        }
      });
      addColumns(columnNames, usedIndex?.includedColumns);
    }
    table?.definition?.constraints.forEach((constraint) => {
      if (
        constraint.type === 'primaryKey' ||
        constraint.type === 'uniqueKey' ||
        constraint.type === 'foreignKey'
      ) {
        addColumns(columnNames, constraint.columns);
      }
    });

    return {
      id,
      schemaName: first.schemaName,
      tableName: first.tableName,
      alias: first.alias,
      table,
      mappings,
      columnNames,
    };
  });
}

function columnKeyMarkers(
  constraints: ConstraintDefinition[],
  columnName: string,
): string | undefined {
  const markers = new Set<string>();
  constraints.forEach((constraint) => {
    if (!constraint.columns?.some((column) => eq(column, columnName))) {
      return;
    }
    if (constraint.type === 'primaryKey') markers.add('PK');
    if (constraint.type === 'foreignKey') markers.add('FK');
    if (constraint.type === 'uniqueKey') markers.add('UK');
  });
  return markers.size > 0 ? [...markers].join(',') : undefined;
}

function renderEntity(entity: DiagramEntity): string[] {
  const lines = [`  ${entity.id} {`];
  const definition = entity.table?.definition;
  const constraints = definition?.constraints ?? [];
  const priority = (columnName: string): number => {
    if (constraints.some((constraint) => constraint.type === 'primaryKey' && constraint.columns?.some((name) => eq(name, columnName)))) {
      return 0;
    }
    if (constraints.some((constraint) => (constraint.type === 'foreignKey' || constraint.type === 'uniqueKey') && constraint.columns?.some((name) => eq(name, columnName)))) {
      return 1;
    }
    if (entity.mappings.some((mapping) => mapping.joinColumns?.some((name) => eq(name, columnName)))) {
      return 2;
    }
    if (entity.mappings.some((mapping) => mapping.filterColumns?.some((name) => eq(name, columnName)))) {
      return 3;
    }
    if (entity.mappings.some((mapping) => [...(mapping.groupColumns ?? []), ...(mapping.sortColumns ?? [])].some((name) => eq(name, columnName)))) {
      return 4;
    }
    return 5;
  };
  const columns = (definition?.columns.filter((column) =>
    [...entity.columnNames].some((name) => eq(name, column.columnName)),
  ) ?? []).sort((left, right) => priority(left.columnName) - priority(right.columnName));

  for (const column of columns) {
    const type = displayDiagramColumnType(column.dataType);
    // Mermaid's ER grammar requires ATTR_WORD here; quoted physical names are
    // parsed as a COMMENT token and make the whole diagram invalid. Keep
    // normal names unchanged and make uncommon quoted/special names safe.
    const attributeName = safeIdentifier(column.columnName);
    const keyMarkers = columnKeyMarkers(definition?.constraints ?? [], column.columnName);
    const notes = [
      !column.nullable ? 'NOT NULL' : undefined,
      entity.mappings.some((mapping) => mapping.filterColumns?.some((name) => eq(name, column.columnName)))
        ? 'WHERE'
        : undefined,
      entity.mappings.some((mapping) => mapping.joinColumns?.some((name) => eq(name, column.columnName)))
        ? 'JOIN'
        : undefined,
      entity.mappings.some((mapping) => mapping.groupColumns?.some((name) => eq(name, column.columnName)))
        ? 'GROUP'
        : undefined,
      entity.mappings.some((mapping) => mapping.sortColumns?.some((name) => eq(name, column.columnName)))
        ? 'SORT'
        : undefined,
    ].filter(Boolean).join(', ');
    lines.push(
      `    ${type} ${attributeName}${keyMarkers ? ` ${keyMarkers}` : ''}${
        notes ? ` "${escapeQuoted(notes)}"` : ''
      }`,
    );
  }
  lines.push('  }');
  return lines;
}

function relationLabel(constraint: ConstraintDefinition): string {
  const columnPairs = (constraint.columns ?? []).map(
    (column, index) => `${column} → ${constraint.referencedColumns?.[index] ?? '?'}`,
  );
  return escapeQuoted(constraint.constraintName ?? (columnPairs.join(', ') || 'FK'));
}

function relationshipColumnKey(
  leftEntityId: string,
  leftColumn: string,
  rightEntityId: string,
  rightColumn: string,
): string {
  return [
    `${leftEntityId.toLocaleLowerCase()}.${leftColumn.toLocaleLowerCase()}`,
    `${rightEntityId.toLocaleLowerCase()}.${rightColumn.toLocaleLowerCase()}`,
  ].sort().join('|');
}

function renderRelationships(
  entities: DiagramEntity[],
  warnings: string[],
): { lines: string[]; relatedColumnPairs: Set<string> } {
  const lines: string[] = [];
  const relatedColumnPairs = new Set<string>();
  const warned = new Set<string>();
  for (const child of entities) {
    const foreignKeys = child.table?.definition?.constraints.filter(
      (constraint) => constraint.type === 'foreignKey' && constraint.referencedTableName,
    ) ?? [];
    for (const foreignKey of foreignKeys) {
      const childCandidates = entities.filter(
        (entity) => physicalKey(entity.schemaName, entity.tableName) === physicalKey(child.schemaName, child.tableName),
      );
      const parentCandidates = entities.filter(
        (entity) => eq(entity.tableName, foreignKey.referencedTableName) &&
          (!foreignKey.referencedSchemaName || eq(entity.schemaName, foreignKey.referencedSchemaName)),
      );

      if (childCandidates.length !== 1 || parentCandidates.length !== 1) {
        const warningKey = `${child.id}:${foreignKey.constraintName ?? foreignKey.referencedTableName}`;
        if (!warned.has(warningKey)) {
          warnings.push(
            `The relationship ${foreignKey.constraintName ?? 'FK'} was not drawn because table aliases make its query-side endpoints ambiguous.`,
          );
          warned.add(warningKey);
        }
        continue;
      }

      const parent = parentCandidates[0];
      addColumns(parent.columnNames, foreignKey.referencedColumns);
      const childColumns = foreignKey.columns ?? [];
      const nullable = childColumns.some((name) =>
        child.table?.definition?.columns.find((column) => eq(column.columnName, name))?.nullable,
      );
      lines.push(
        `  ${child.id} ${nullable ? '}o' : '}|'}--|| ${parent.id} : "${relationLabel(foreignKey)}"`,
      );
      childColumns.forEach((column, index) => {
        const referencedColumn = foreignKey.referencedColumns?.[index];
        if (referencedColumn) {
          relatedColumnPairs.add(
            relationshipColumnKey(child.id, column, parent.id, referencedColumn),
          );
        }
      });
    }
  }
  return { lines, relatedColumnPairs };
}

type SqlJoinColumnPair = {
  leftTable: string;
  leftColumn: string;
  rightTable: string;
  rightColumn: string;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object'
    ? value as Record<string, unknown>
    : undefined;
}

function refParts(value: unknown): { table: string; column: string } | undefined {
  const ref = asRecord(value);
  const table = asRecord(ref?.table)?.name;
  return ref?.type === 'ref' && typeof table === 'string' && typeof ref.name === 'string'
    ? { table, column: ref.name }
    : undefined;
}

function collectEqualityJoinPairs(value: unknown, pairs: SqlJoinColumnPair[]): void {
  const node = asRecord(value);
  if (!node) {
    return;
  }
  if (node.type === 'binary') {
    const left = refParts(node.left);
    const right = refParts(node.right);
    if (node.op === '=' && left && right && !eq(left.table, right.table)) {
      pairs.push({
        leftTable: left.table,
        leftColumn: left.column,
        rightTable: right.table,
        rightColumn: right.column,
      });
    }
    collectEqualityJoinPairs(node.left, pairs);
    collectEqualityJoinPairs(node.right, pairs);
  }
}

function extractSqlJoinPairs(sql: string): SqlJoinColumnPair[] {
  const ast = parseQuery(sql)?.ast;
  if (!ast) {
    return [];
  }
  const pairs: SqlJoinColumnPair[] = [];
  const walk = (value: unknown): void => {
    const node = asRecord(value);
    if (!node) {
      return;
    }
    const join = asRecord(node.join);
    if (join?.on) {
      collectEqualityJoinPairs(join.on, pairs);
    }
    Object.values(node).forEach((child) => {
      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (child !== join) {
        walk(child);
      }
    });
  };
  walk(ast);
  return pairs;
}

function resolveSqlRefEntity(entities: DiagramEntity[], ref: string): DiagramEntity[] {
  return entities.filter((entity) =>
    (entity.alias && eq(entity.alias, ref)) || (!entity.alias && eq(entity.tableName, ref)),
  );
}

function renderSqlJoinRelationships(
  context: PerformanceTuningContext,
  entities: DiagramEntity[],
  relatedColumnPairs: Set<string>,
  warnings: string[],
): string[] {
  const lines: string[] = [];
  const pairs = extractSqlJoinPairs(context.statement.sql);
  for (const pair of pairs) {
    const left = resolveSqlRefEntity(entities, pair.leftTable);
    const right = resolveSqlRefEntity(entities, pair.rightTable);
    if (left.length !== 1 || right.length !== 1 || left[0].id === right[0].id) {
      warnings.push(
        `SQL JOIN ${pair.leftTable}.${pair.leftColumn} = ${pair.rightTable}.${pair.rightColumn} was not drawn because its aliases could not be resolved unambiguously.`,
      );
      continue;
    }
    left[0].columnNames.add(pair.leftColumn);
    right[0].columnNames.add(pair.rightColumn);
    const columnPair = relationshipColumnKey(
      left[0].id,
      pair.leftColumn,
      right[0].id,
      pair.rightColumn,
    );
    if (relatedColumnPairs.has(columnPair)) {
      continue;
    }
    lines.push(
      `  ${left[0].id} }o..o{ ${right[0].id} : "SQL JOIN: ${escapeQuoted(`${pair.leftTable}.${pair.leftColumn} = ${pair.rightTable}.${pair.rightColumn}`)}"`,
    );
    relatedColumnPairs.add(columnPair);
  }
  return lines;
}

function indexRelevance(entity: DiagramEntity, index: IndexDefinition): string[] {
  const relevance = new Set<string>();
  const indexColumns = new Set(
    index.columns.flatMap((column) =>
      column.columnName ? [column.columnName.toLocaleLowerCase()] : [],
    ),
  );
  const touches = (columns: string[] | undefined, label: string): void => {
    if (columns?.some((column) => indexColumns.has(column.toLocaleLowerCase()))) {
      relevance.add(label);
    }
  };
  entity.mappings.forEach((mapping) => {
    if (eq(mapping.indexName, index.indexName)) relevance.add('plan access');
    touches(mapping.filterColumns, 'WHERE');
    touches(mapping.joinColumns, 'JOIN');
    touches(mapping.groupColumns, 'GROUP BY');
    touches(mapping.sortColumns, 'ORDER BY');
  });
  return [...relevance];
}

function indexColumnLabels(index: IndexDefinition): string[] {
  return index.columns.flatMap((column) =>
    column.columnName ? [column.columnName] : column.expression ? [column.expression] : [],
  );
}

function collectRelevantIndexes(entities: DiagramEntity[]): PerformanceQueryRelevantIndex[] {
  const result: PerformanceQueryRelevantIndex[] = [];
  const seen = new Set<string>();
  for (const entity of entities) {
    for (const index of entity.table?.definition?.indexes ?? []) {
      const relevance = indexRelevance(entity, index);
      if (relevance.length === 0) continue;
      const key = `${entity.id.toLocaleLowerCase()}.${index.indexName.toLocaleLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        schemaName: entity.schemaName,
        tableName: entity.tableName,
        alias: entity.alias,
        indexName: index.indexName,
        columns: indexColumnLabels(index),
        includedColumns: index.includedColumns,
        unique: index.unique,
        primary: index.primary === true,
        relevance,
      });
    }
  }
  return result;
}

/**
 * Builds a conservative, query-scoped ER diagram from already collected
 * facts. Declared foreign keys are preferred; simple equality JOINs are also
 * parsed from SQL when both aliased endpoints resolve uniquely. No relation
 * line is guessed from planTableMappings.joinColumns alone.
 */
export function createPerformanceQueryDiagram(
  context: PerformanceTuningContext,
): PerformanceQueryDiagramResult | undefined {
  if (context.tables.length === 0 && context.planTableMappings.length === 0) {
    return undefined;
  }

  const warnings: string[] = [];
  const entities = buildEntities(context, warnings);
  if (entities.length === 0) {
    return undefined;
  }
  const declaredRelationships = renderRelationships(entities, warnings);
  const sqlJoinRelationships = renderSqlJoinRelationships(
    context,
    entities,
    declaredRelationships.relatedColumnPairs,
    warnings,
  );
  const relationshipLines = [...declaredRelationships.lines, ...sqlJoinRelationships];
  if (
    relationshipLines.length === 0 &&
    context.planTableMappings.some((mapping) => (mapping.joinColumns?.length ?? 0) > 0) &&
    !warnings.some((warning) => warning.includes('relationship'))
  ) {
    warnings.push(
      'SQL join columns were collected, but no unambiguous declared foreign-key relationship was available; no relationship line was guessed.',
    );
  }

  const lines = [
    '---',
    `title: ${JSON.stringify('Query structure')}`,
    '---',
    'erDiagram',
    ...entities.flatMap(renderEntity),
    ...relationshipLines,
  ];
  return { mermaid: lines.join('\n'), relevantIndexes: collectRelevantIndexes(entities), warnings };
}
