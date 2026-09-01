import {
  ColumnDefinition,
  ColumnStatisticsContext,
  ConstraintDefinition,
  IndexColumnDefinition,
  IndexDefinition,
  MetricValue,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import { VendorPhysicalHealth, VendorTableStatistics } from './PerformanceTuningContextProvider';
import { asIsoDateString, asNumber, asRecord, asString } from './vendorRowCoercion';

// Row-mapping for SQLServerPerformanceTuningProvider.ts's sys.*/ information_schema queries.

function metric<T>(
  value: T | undefined,
  source: string,
  estimated: boolean,
  unit?: string,
): MetricValue<T> | undefined {
  return value === undefined ? undefined : { value, estimated, source, unit };
}

// --- columns -----------------------------------------------------------

export function mapSqlServerColumnRow(row: unknown): ColumnDefinition | undefined {
  const r = asRecord(row);
  const columnName = asString(r?.name);
  if (!r || !columnName) {
    return undefined;
  }
  return {
    columnName,
    dataType: asString(r.column_type) ?? asString(r.data_type) ?? 'unknown',
    // sys.columns.is_nullable comes back as a native JS boolean (mssql maps BIT that way), not 'YES'/'NO' the way information_schema would.
    nullable: r.is_nullable === true,
    defaultExpression: asString(r.column_default),
    ordinalPosition: asNumber(r.ordinal_position),
    comment: asString(r.comment),
  };
}

export function mapSqlServerColumnRows(rows: unknown[]): ColumnDefinition[] {
  return rows.map(mapSqlServerColumnRow).filter((c): c is ColumnDefinition => c !== undefined);
}

// --- constraints ---------------------------------------------------------

const CONSTRAINT_TYPE_BY_RAW: Record<string, ConstraintDefinition['type']> = {
  'PRIMARY KEY': 'primaryKey',
  UNIQUE: 'uniqueKey',
  'FOREIGN KEY': 'foreignKey',
};

export function mapSqlServerConstraintRows(rows: unknown[]): ConstraintDefinition[] {
  type Entry = {
    constraintName: string;
    type: ConstraintDefinition['type'];
    columns: { position: number; name: string }[];
    referencedSchemaName?: string;
    referencedTableName?: string;
    referencedColumns: { position: number; name: string }[];
  };
  const byName = new Map<string, Entry>();

  for (const raw of rows) {
    const r = asRecord(raw);
    const constraintName = asString(r?.constraint_name);
    const rawType = asString(r?.constraint_type);
    const type = rawType ? CONSTRAINT_TYPE_BY_RAW[rawType] : undefined;
    const columnName = asString(r?.column_name);
    const position = asNumber(r?.ordinal_position);
    if (!r || !constraintName || !type || !columnName || position === undefined) {
      continue;
    }
    let entry = byName.get(constraintName);
    if (!entry) {
      entry = {
        constraintName,
        type,
        columns: [],
        referencedSchemaName: asString(r.referenced_schema),
        referencedTableName: asString(r.referenced_table),
        referencedColumns: [],
      };
      byName.set(constraintName, entry);
    }
    entry.columns.push({ position, name: columnName });
    const referencedColumnName = asString(r.referenced_column);
    if (referencedColumnName) {
      entry.referencedColumns.push({ position, name: referencedColumnName });
    }
  }

  const byPosition = (a: { position: number }, b: { position: number }): number => a.position - b.position;

  return [...byName.values()].map((entry) => ({
    constraintName: entry.constraintName,
    type: entry.type,
    columns: entry.columns.sort(byPosition).map((c) => c.name),
    referencedSchemaName: entry.referencedSchemaName,
    referencedTableName: entry.referencedTableName,
    referencedColumns:
      entry.referencedColumns.length > 0
        ? entry.referencedColumns.sort(byPosition).map((c) => c.name)
        : undefined,
  }));
}

// CHECK constraints are a separate query (sys.check_constraints has no column list - a CHECK is a single boolean expression, not column-scoped the way PK/UK/FK are).
export function mapSqlServerCheckConstraintRows(rows: unknown[]): ConstraintDefinition[] {
  return rows
    .map((raw): ConstraintDefinition | undefined => {
      const r = asRecord(raw);
      const constraintName = asString(r?.constraint_name);
      const checkExpression = asString(r?.check_clause);
      if (!r || !constraintName) {
        return undefined;
      }
      return { constraintName, type: 'check', checkExpression };
    })
    .filter((c): c is ConstraintDefinition => c !== undefined);
}

// --- indexes ---------------------------------------------------------

// One row per (index, column) from sys.indexes/sys.index_columns - grouped in JS for the same reason as constraints above.
export function mapSqlServerIndexRows(rows: unknown[]): IndexDefinition[] {
  type Entry = {
    indexName: string;
    unique: boolean;
    primary: boolean;
    indexType?: string;
    predicate?: string;
    keyColumns: { position: number; column: IndexColumnDefinition }[];
    includedColumns: { position: number; name: string }[];
  };
  const byName = new Map<string, Entry>();

  for (const raw of rows) {
    const r = asRecord(raw);
    const indexName = asString(r?.index_name);
    const columnName = asString(r?.column_name);
    if (!r || !indexName || !columnName) {
      continue;
    }
    let entry = byName.get(indexName);
    if (!entry) {
      entry = {
        indexName,
        unique: r.is_unique === true,
        primary: r.is_primary === true,
        indexType: asString(r.index_type),
        // filter_definition is a SQL Server filtered index's WHERE clause (its equivalent of Postgres's partial-index predicate) - repeated on every row for the same index, so just take it whenever seen.
        predicate: asString(r.predicate),
        keyColumns: [],
        includedColumns: [],
      };
      byName.set(indexName, entry);
    }
    if (r.is_included === true) {
      entry.includedColumns.push({ position: asNumber(r.column_id) ?? 0, name: columnName });
    } else {
      entry.keyColumns.push({
        position: asNumber(r.seq_in_index) ?? 0,
        column: {
          columnName,
          direction: r.is_descending === true ? 'desc' : 'asc',
        },
      });
    }
  }

  const byPosition = (a: { position: number }, b: { position: number }): number => a.position - b.position;

  return [...byName.values()].map((entry) => ({
    indexName: entry.indexName,
    unique: entry.unique,
    primary: entry.primary,
    columns: entry.keyColumns.sort(byPosition).map((c) => c.column),
    includedColumns:
      entry.includedColumns.length > 0
        ? entry.includedColumns.sort(byPosition).map((c) => c.name)
        : undefined,
    predicate: entry.predicate,
    indexType: entry.indexType,
  }));
}

// --- DDL -----------------------------------------------------------------

const CONSTRAINT_DDL_KEYWORD: Record<ConstraintDefinition['type'], string> = {
  primaryKey: 'PRIMARY KEY',
  uniqueKey: 'UNIQUE',
  foreignKey: 'FOREIGN KEY',
  check: 'CHECK',
};

export function renderSqlServerTableDdl(params: {
  schemaName?: string;
  tableName: string;
  columns: ColumnDefinition[];
  constraints: ConstraintDefinition[];
  indexes: IndexDefinition[];
}): string {
  const { schemaName, tableName, columns, constraints, indexes } = params;
  const qualifiedName = schemaName ? `[${schemaName}].[${tableName}]` : `[${tableName}]`;

  const columnLines = columns.map((col) => {
    let line = `  [${col.columnName}] ${col.dataType}`;
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
    const name = c.constraintName ? `CONSTRAINT [${c.constraintName}] ` : '';
    if (c.type === 'check') {
      return `  ${name}${keyword} (${c.checkExpression ?? ''})`;
    }
    if (c.type === 'foreignKey') {
      const ref = c.referencedTableName
        ? ` REFERENCES ${c.referencedSchemaName ? `[${c.referencedSchemaName}].` : ''}[${c.referencedTableName}](${(c.referencedColumns ?? []).map((n) => `[${n}]`).join(', ')})`
        : '';
      return `  ${name}${keyword} (${(c.columns ?? []).map((n) => `[${n}]`).join(', ')})${ref}`;
    }
    return `  ${name}${keyword} (${(c.columns ?? []).map((n) => `[${n}]`).join(', ')})`;
  });

  const tableDdl = `CREATE TABLE ${qualifiedName} (\n${[...columnLines, ...constraintLines].join(',\n')}\n);`;

  // A PK/UNIQUE constraint's backing index shares its constraint's name in SQL Server too (sys.key_constraints.name === sys.indexes.name for that constraint) - same dedup rationale as renderPostgresTableDdl().
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
        .map((c) => `[${c.columnName ?? c.expression ?? ''}]${c.direction === 'desc' ? ' DESC' : ''}`)
        .join(', ');
      const include = idx.includedColumns?.length
        ? ` INCLUDE (${idx.includedColumns.map((n) => `[${n}]`).join(', ')})`
        : '';
      const where = idx.predicate ? ` WHERE ${idx.predicate}` : '';
      return `CREATE ${uniqueKeyword}INDEX [${idx.indexName}] ON ${qualifiedName} (${cols})${include}${where};`;
    });

  return [tableDdl, ...indexDdls].join('\n');
}

// --- table statistics ---------------------------------------------------------

export function mapSqlServerTableStatisticsRow(
  sizeRow: unknown,
  statsRow: unknown,
): VendorTableStatistics | undefined {
  const size = asRecord(sizeRow);
  if (!size) {
    return undefined;
  }
  const stats = asRecord(statsRow);

  return {
    estimatedRowCount: metric(asNumber(size.row_count), 'sys.partitions.rows', true, 'rows'),
    tableBytes: metric(asNumber(size.table_bytes), 'sys.allocation_units (heap/clustered)', true, 'bytes'),
    indexBytes: metric(asNumber(size.index_bytes), 'sys.allocation_units (nonclustered)', true, 'bytes'),
    totalBytes: metric(asNumber(size.total_bytes), 'sys.allocation_units', true, 'bytes'),
    statisticsUpdatedAt: metric(
      asIsoDateString(stats?.last_updated),
      'sys.dm_db_stats_properties.last_updated',
      false,
    ),
    modificationsSinceAnalyze: metric(
      asNumber(stats?.modification_counter),
      'sys.dm_db_stats_properties.modification_counter',
      false,
    ),
  };
}

// --- column statistics ---------------------------------------------------------

export function mapSqlServerColumnStatisticsRow(
  columnName: string,
  data: { histogramRows: unknown[]; propsRow: unknown } | undefined,
): ColumnStatisticsContext {
  if (!data) {
    return { columnName };
  }
  const steps = data.histogramRows
    .map((row) => asRecord(row))
    .filter((r): r is Record<string, unknown> => r !== undefined);

  const distinctCount =
    steps.length > 0
      ? steps.reduce((sum, s) => {
          const equalRows = asNumber(s.equal_rows) ?? 0;
          const distinctRangeRows = asNumber(s.distinct_range_rows) ?? 0;
          return sum + (equalRows > 0 ? 1 : 0) + distinctRangeRows;
        }, 0)
      : undefined;

  const props = asRecord(data.propsRow);

  return {
    columnName,
    distinctCount: metric(distinctCount, 'sys.dm_db_stats_histogram (derived from steps)', true, 'values'),
    // "MaxDiff" is SQL Server's own documented name for the histogram algorithm every statistics object created without a filter uses - stated as fact, not inferred from the data.
    histogramType: steps.length > 0 ? metric('MaxDiff', 'sys.dm_db_stats_histogram', true) : undefined,
    histogramBucketCount: metric(
      steps.length > 0 ? steps.length : undefined,
      'sys.dm_db_stats_histogram',
      true,
    ),
    statisticsUpdatedAt: metric(
      asIsoDateString(props?.last_updated),
      'sys.dm_db_stats_properties.last_updated',
      false,
    ),
  };
}

// --- physical health ---------------------------------------------------------

export function mapSqlServerPhysicalHealthRow(
  physicalStatsRow: unknown,
  statsRow: unknown,
): VendorPhysicalHealth {
  const physical = asRecord(physicalStatsRow) ?? {};
  const stats = asRecord(statsRow);
  const metrics: VendorPhysicalHealth['metrics'] = [];
  const push = (
    name: string,
    value: number | string | boolean | null | undefined,
    unit: string | undefined,
    estimated: boolean,
    description?: string,
  ): void => {
    if (value === undefined) {
      return;
    }
    metrics.push({ name, value, unit, estimated, description });
  };

  push(
    'avgFragmentationPercent',
    asNumber(physical.avg_fragmentation_in_percent),
    'percent',
    false,
    'sys.dm_db_index_physical_stats (LIMITED mode, heap/clustered index)',
  );
  push('pageCount', asNumber(physical.page_count), 'pages', false, 'sys.dm_db_index_physical_stats');
  push(
    'lastUpdatedAt',
    asIsoDateString(stats?.last_updated),
    undefined,
    false,
    'sys.dm_db_stats_properties.last_updated (last statistics refresh, not last DML)',
  );

  return { metrics };
}
