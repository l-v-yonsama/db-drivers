import {
  ColumnDefinition,
  ColumnStatisticsContext,
  ConstraintDefinition,
  IndexColumnDefinition,
  IndexDefinition,
  MetricValue,
  PartitioningDefinition,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import { VendorPhysicalHealth, VendorTableStatistics } from './PerformanceTuningContextProvider';
import { asBoolean, asIsoDateString, asNumber, asRecord, asString, asStringArray } from './vendorRowCoercion';

// Row-mapping for src/drivers/providers/performance/PostgresPerformanceTuningProvider.ts's catalog queries.

function metric<T>(
  value: T | undefined,
  source: string,
  estimated: boolean,
  unit?: string,
): MetricValue<T> | undefined {
  return value === undefined ? undefined : { value, estimated, source, unit };
}

// --- columns -----------------------------------------------------------

// information_schema.columns reports generic placeholders for types it doesn't have a standard SQL name for: 'USER-DEFINED' (enums, domains, composite types) and 'ARRAY'.
export function mapColumnRow(row: unknown): ColumnDefinition | undefined {
  const r = asRecord(row);
  const columnName = asString(r?.name);
  if (!r || !columnName) {
    return undefined;
  }
  const rawDataType = asString(r.data_type) ?? 'unknown';
  const udtName = asString(r.udt_name);
  const dataType =
    (rawDataType === 'USER-DEFINED' || rawDataType === 'ARRAY') && udtName
      ? udtName
      : rawDataType;

  return {
    columnName,
    dataType,
    nullable: r.is_nullable === 'YES',
    defaultExpression: asString(r.column_default),
    ordinalPosition: asNumber(r.ordinal_position),
    comment: asString(r.comment),
  };
}

export function mapColumnRows(rows: unknown[]): ColumnDefinition[] {
  return rows.map(mapColumnRow).filter((c): c is ColumnDefinition => c !== undefined);
}

// --- constraints ---------------------------------------------------------

const CONSTRAINT_TYPE_BY_CONTYPE: Record<string, ConstraintDefinition['type']> = {
  p: 'primaryKey',
  u: 'uniqueKey',
  f: 'foreignKey',
  c: 'check',
};

// pg_get_constraintdef() on a CHECK constraint returns the whole clause, e.g. "CHECK ((amount >= (0)::numeric))" - this keeps just the boolean expression Postgres itself already parenthesized, rather than re-deriving it by hand.
function extractCheckExpression(definition: string | undefined): string | undefined {
  if (!definition) {
    return undefined;
  }
  const match = definition.match(/^CHECK\s*\(([\s\S]*)\)$/i);
  return match ? match[1] : definition;
}

export function mapConstraintRow(row: unknown): ConstraintDefinition | undefined {
  const r = asRecord(row);
  const contype = asString(r?.contype);
  const type = contype ? CONSTRAINT_TYPE_BY_CONTYPE[contype] : undefined;
  if (!r || !type) {
    return undefined;
  }
  const definition = asString(r.definition);

  return {
    constraintName: asString(r.constraint_name),
    type,
    columns: asStringArray(r.columns),
    referencedSchemaName: asString(r.referenced_schema),
    referencedTableName: asString(r.referenced_table),
    referencedColumns: asStringArray(r.referenced_columns),
    checkExpression: type === 'check' ? extractCheckExpression(definition) : undefined,
  };
}

export function mapConstraintRows(rows: unknown[]): ConstraintDefinition[] {
  return rows
    .map(mapConstraintRow)
    .filter((c): c is ConstraintDefinition => c !== undefined);
}

// --- indexes ---------------------------------------------------------

type IndexColumnEntry = {
  position: number;
  name?: string;
  expression?: string;
  desc: boolean;
};

function parseIndexColumnEntries(raw: unknown): IndexColumnEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const entries: IndexColumnEntry[] = [];
  for (const item of raw) {
    const r = asRecord(item);
    const position = asNumber(r?.position);
    if (!r || position === undefined) {
      continue;
    }
    entries.push({
      position,
      name: asString(r.name),
      expression: asString(r.expression),
      desc: asBoolean(r.desc),
    });
  }
  return entries.sort((a, b) => a.position - b.position);
}

// `columns` is expected to already be a parsed JSON array (from a `json_agg(...)` catalog query), one entry per index column position 1..n_atts: `{ position, name?, expression?, desc }` - `name` is set for a plain column, `expression` for a function-based one, never both.
export function mapIndexRow(row: unknown): IndexDefinition | undefined {
  const r = asRecord(row);
  const indexName = asString(r?.index_name);
  if (!r || !indexName) {
    return undefined;
  }

  const entries = parseIndexColumnEntries(r.columns);
  const nKeyAtts = asNumber(r.n_key_atts) ?? entries.length;

  const columns: IndexColumnDefinition[] = entries
    .filter((e) => e.position <= nKeyAtts)
    .map((e) => ({
      columnName: e.name,
      expression: e.expression,
      direction: e.desc ? 'desc' : 'asc',
    }));

  const includedColumns = entries
    .filter((e) => e.position > nKeyAtts && e.name)
    .map((e) => e.name as string);

  return {
    indexName,
    unique: asBoolean(r.is_unique),
    primary: asBoolean(r.is_primary),
    columns,
    includedColumns: includedColumns.length > 0 ? includedColumns : undefined,
    predicate: asString(r.predicate),
    enabled: r.is_valid === undefined ? undefined : asBoolean(r.is_valid),
    indexType: asString(r.index_type),
  };
}

export function mapIndexRows(rows: unknown[]): IndexDefinition[] {
  return rows.map(mapIndexRow).filter((i): i is IndexDefinition => i !== undefined);
}

// --- partitioning ---------------------------------------------------------

export function mapPartitioningRow(row: unknown): PartitioningDefinition | undefined {
  const r = asRecord(row);
  const strategy = asString(r?.strategy);
  if (!r || !strategy) {
    return undefined;
  }
  // pg_get_partkeydef() returns e.g. "RANGE (order_date)" / "LIST (status)" - the column list is everything inside the first (...).
  const columnsMatch = asString(r.partition_key_def)?.match(/\(([^)]*)\)/);
  const columns = columnsMatch
    ? columnsMatch[1]
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
    : undefined;

  return {
    strategy,
    columns: columns && columns.length > 0 ? columns : undefined,
    partitionCount: asNumber(r.partition_count),
  };
}

// --- table / column statistics ---------------------------------------------------------

export function mapTableStatisticsRow(row: unknown): VendorTableStatistics | undefined {
  const r = asRecord(row);
  if (!r) {
    return undefined;
  }
  return {
    estimatedRowCount: metric(asNumber(r.estimated_row_count), 'pg_class.reltuples', true, 'rows'),
    tableBytes: metric(asNumber(r.table_bytes), 'pg_table_size', false, 'bytes'),
    indexBytes: metric(asNumber(r.index_bytes), 'pg_indexes_size', false, 'bytes'),
    totalBytes: metric(asNumber(r.total_bytes), 'pg_total_relation_size', false, 'bytes'),
    statisticsUpdatedAt: metric(
      asIsoDateString(r.last_analyze) ?? asIsoDateString(r.last_autoanalyze),
      asIsoDateString(r.last_analyze)
        ? 'pg_stat_user_tables.last_analyze'
        : 'pg_stat_user_tables.last_autoanalyze',
      false,
    ),
    modificationsSinceAnalyze: metric(
      asNumber(r.n_mod_since_analyze),
      'pg_stat_user_tables.n_mod_since_analyze',
      true,
      'rows',
    ),
  };
}

export function mapColumnStatisticsRow(row: unknown): ColumnStatisticsContext | undefined {
  const r = asRecord(row);
  const columnName = asString(r?.attname);
  if (!r || !columnName) {
    return undefined;
  }

  const nDistinct = asNumber(r.n_distinct);
  const rowCount = asNumber(r.reltuples);
  // pg_stats.n_distinct is dual-purpose (Postgres docs, "pg_stats"): >= 0 is an absolute estimated distinct count; < 0 is -(distinct/rows), i.e. a fraction that scales with table size (e.g. -1 means "every value is unique").
  let distinctCount: MetricValue<number> | undefined;
  let distinctFraction: MetricValue<number> | undefined;
  if (nDistinct !== undefined) {
    if (nDistinct >= 0) {
      distinctCount = metric(nDistinct, 'pg_stats.n_distinct', true, 'values');
      if (rowCount && rowCount > 0) {
        distinctFraction = metric(nDistinct / rowCount, 'pg_stats.n_distinct', true);
      }
    } else {
      const fraction = -nDistinct;
      distinctFraction = metric(fraction, 'pg_stats.n_distinct', true);
      if (rowCount && rowCount > 0) {
        distinctCount = metric(Math.round(fraction * rowCount), 'pg_stats.n_distinct', true, 'values');
      }
    }
  }

  return {
    columnName,
    distinctCount,
    distinctFraction,
    nullFraction: metric(asNumber(r.null_frac), 'pg_stats.null_frac', true),
    averageWidthBytes: metric(asNumber(r.avg_width), 'pg_stats.avg_width', true, 'bytes'),
    correlation: metric(asNumber(r.correlation), 'pg_stats.correlation', true),
  };
}

export function mapColumnStatisticsRows(rows: unknown[]): ColumnStatisticsContext[] {
  return rows
    .map(mapColumnStatisticsRow)
    .filter((c): c is ColumnStatisticsContext => c !== undefined);
}

export function mapPhysicalHealthRow(row: unknown): VendorPhysicalHealth {
  const r = asRecord(row) ?? {};
  const liveTuples = asNumber(r.n_live_tup);
  const deadTuples = asNumber(r.n_dead_tup);

  const metrics: VendorPhysicalHealth['metrics'] = [];
  const push = (
    name: string,
    value: number | string | boolean | null | undefined,
    unit?: string,
    estimated = true,
    description?: string,
  ): void => {
    if (value === undefined) {
      return;
    }
    metrics.push({ name, value, unit, estimated, description });
  };

  push('liveTuples', liveTuples, 'rows', true, 'pg_stat_user_tables.n_live_tup');
  push('deadTuples', deadTuples, 'rows', true, 'pg_stat_user_tables.n_dead_tup');
  if (liveTuples !== undefined && deadTuples !== undefined && liveTuples + deadTuples > 0) {
    push(
      'deadTupleRatio',
      deadTuples / (liveTuples + deadTuples),
      undefined,
      true,
      'n_dead_tup / (n_live_tup + n_dead_tup)',
    );
  }
  push(
    'modificationsSinceAnalyze',
    asNumber(r.n_mod_since_analyze),
    'rows',
    true,
    'pg_stat_user_tables.n_mod_since_analyze',
  );
  push('lastVacuum', asIsoDateString(r.last_vacuum), undefined, false, 'pg_stat_user_tables.last_vacuum');
  push(
    'lastAutovacuum',
    asIsoDateString(r.last_autovacuum),
    undefined,
    false,
    'pg_stat_user_tables.last_autovacuum',
  );
  push(
    'lastAnalyze',
    asIsoDateString(r.last_analyze),
    undefined,
    false,
    'pg_stat_user_tables.last_analyze',
  );
  push(
    'lastAutoanalyze',
    asIsoDateString(r.last_autoanalyze),
    undefined,
    false,
    'pg_stat_user_tables.last_autoanalyze',
  );

  return { metrics };
}

// --- DDL rendering ---------------------------------------------------------

const CONSTRAINT_DDL_KEYWORD: Record<ConstraintDefinition['type'], string> = {
  primaryKey: 'PRIMARY KEY',
  uniqueKey: 'UNIQUE',
  foreignKey: 'FOREIGN KEY',
  check: 'CHECK',
};

// Not a pg_dump replica: no storage parameters, no owner/grants, no sequence definitions.
export function renderPostgresTableDdl(params: {
  schemaName?: string;
  tableName: string;
  columns: ColumnDefinition[];
  constraints: ConstraintDefinition[];
  indexes: IndexDefinition[];
}): string {
  const { schemaName, tableName, columns, constraints, indexes } = params;
  const qualifiedName = schemaName ? `${schemaName}.${tableName}` : tableName;

  const columnLines = columns.map((col) => {
    let line = `  ${col.columnName} ${col.dataType}`;
    if (!col.nullable) {
      line += ' NOT NULL';
    }
    if (col.defaultExpression) {
      line += ` DEFAULT ${col.defaultExpression}`;
    }
    return line;
  });

  const constraintLines = constraints.map((c) => {
    const keyword = CONSTRAINT_DDL_KEYWORD[c.type];
    const name = c.constraintName ? `CONSTRAINT ${c.constraintName} ` : '';
    if (c.type === 'check') {
      return `  ${name}${keyword} (${c.checkExpression ?? ''})`;
    }
    if (c.type === 'foreignKey') {
      const ref = c.referencedTableName
        ? ` REFERENCES ${c.referencedSchemaName ? `${c.referencedSchemaName}.` : ''}${c.referencedTableName}(${(c.referencedColumns ?? []).join(', ')})`
        : '';
      return `  ${name}${keyword} (${(c.columns ?? []).join(', ')})${ref}`;
    }
    return `  ${name}${keyword} (${(c.columns ?? []).join(', ')})`;
  });

  const tableDdl = `CREATE TABLE ${qualifiedName} (\n${[...columnLines, ...constraintLines].join(',\n')}\n);`;

  const constraintBackedIndexNames = new Set(
    constraints
      .filter((c) => c.type === 'primaryKey' || c.type === 'uniqueKey')
      .map((c) => c.constraintName)
      .filter((name): name is string => !!name),
  );
  const indexDdls = indexes
    .filter((idx) => !constraintBackedIndexNames.has(idx.indexName))
    .map((idx) => {
      const uniqueKeyword = idx.unique ? 'UNIQUE ' : '';
      const cols = idx.columns
        .map((c) => `${c.columnName ?? c.expression ?? ''}${c.direction === 'desc' ? ' DESC' : ''}`)
        .join(', ');
      const include = idx.includedColumns?.length
        ? ` INCLUDE (${idx.includedColumns.join(', ')})`
        : '';
      const where = idx.predicate ? ` WHERE ${idx.predicate}` : '';
      return `CREATE ${uniqueKeyword}INDEX ${idx.indexName} ON ${qualifiedName} (${cols})${include}${where};`;
    });

  return [tableDdl, ...indexDdls].join('\n');
}
