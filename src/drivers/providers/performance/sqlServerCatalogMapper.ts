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

// Row-mapping for SQLServerPerformanceTuningProvider.ts's sys.*/
// information_schema queries. Pure functions (no I/O), same rationale as
// postgresCatalogMapper.ts/mysqlCatalogMapper.ts: catalog output is DB data
// this driver doesn't fully control the shape of, so every access is
// guarded and nothing here throws - an unmappable row is dropped, not a
// reason to fail the whole collection.

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
    // sys.columns.is_nullable comes back as a native JS boolean (mssql maps
    // BIT that way), not 'YES'/'NO' the way information_schema would.
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

// One row per (constraint, column) - PRIMARY KEY/UNIQUE and FOREIGN KEY come
// from two structurally different sys.* joins
// (SQLServerPerformanceTuningProvider.ts's CONSTRAINTS_SQL / FOREIGN_KEYS_SQL),
// but both are normalized to this same shape before reaching here so a
// single grouping function (mirroring mysqlCatalogMapper.mapMysqlConstraintRows'
// one-row-per-column grouping) can handle the combined result.
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

// CHECK constraints are a separate query (sys.check_constraints has no
// column list - a CHECK is a single boolean expression, not column-scoped
// the way PK/UK/FK are). cc.definition is already unwrapped-ish
// ("([amount]>=(0))"), same as MySQL's CHECK_CLAUSE - no prefix stripping
// needed, unlike Postgres's pg_get_constraintdef().
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

// One row per (index, column) from sys.indexes/sys.index_columns - grouped
// in JS for the same reason as constraints above. SQL Server has no
// functional/expression index concept (short of indexing a computed
// column, which is just a regular named column from this query's point of
// view) - IndexColumnDefinition.expression is therefore always left
// undefined, unlike Postgres/MySQL which both populate it for a genuine
// expression key part.
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
        // filter_definition is a SQL Server filtered index's WHERE clause
        // (its equivalent of Postgres's partial-index predicate) - repeated
        // on every row for the same index, so just take it whenever seen.
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

// SQL Server has no SHOW CREATE TABLE equivalent
// (RDSBaseDriver.getTableDDL()'s default throws for this driver - see
// SQLServerDriver.ts, which never overrides supportsShowCreate()) - this
// renders one from the same columns/constraints/indexes already collected
// for the rest of collectTableDefinition(), same approach as Postgres's
// renderPostgresTableDdl() (MySQL didn't need this: SHOW CREATE TABLE
// already gives it a real one).
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

  // A PK/UNIQUE constraint's backing index shares its constraint's name in
  // SQL Server too (sys.key_constraints.name === sys.indexes.name for that
  // constraint) - same dedup rationale as renderPostgresTableDdl().
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

// Two independent queries combined per table (SQLServerPerformanceTuningProvider.ts's
// TABLE_SIZE_SQL / STATS_SQL): row count/byte sizes come from
// sys.partitions/sys.allocation_units (InnoDB-cache-like, periodically
// updated by SQL Server itself, hence estimated:true); last-updated/
// modification count come from sys.dm_db_stats_properties(), which SQL
// Server tracks exactly (estimated:false) - the direct equivalent of
// Postgres's pg_stat_user_tables.last_analyze/n_mod_since_analyze.
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

// SQL Server has no catalog-view equivalent of Postgres's pg_stats or
// MySQL's information_schema.COLUMN_STATISTICS - per-column distinct-count/
// histogram data only exists inside a specific statistics object's own
// histogram, read via sys.dm_db_stats_histogram()/sys.dm_db_stats_properties()
// (SQLServerPerformanceTuningProvider.ts resolves, per requested column,
// the statistics object where that column is the *leading* key - preferring
// a single-column stat over a composite index's auto-created one, the
// direct equivalent of MySQL's SEQ_IN_INDEX = 1 restriction).
//
// distinctCount is derived from the histogram's steps rather than read
// directly (SQL Server doesn't expose one): each step contributes 1 for its
// own range_high_key (if equal_rows > 0, i.e. that value actually occurs)
// plus distinct_range_rows more distinct values strictly between this step
// and the previous one - this is the standard interpretation of a SQL
// Server histogram step, not a guess.
//
// nullFraction is intentionally omitted: this DMF does not separately
// report a null count anywhere in its output, unlike Postgres's
// pg_stats.null_frac or MySQL's histogram JSON's "null-values" - guessing
// one from rows vs. rows_sampled would misrepresent an unrelated sampling
// ratio as a null fraction.
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
    // "MaxDiff" is SQL Server's own documented name for the histogram
    // algorithm every statistics object created without a filter uses -
    // stated as fact, not inferred from the data.
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

// physicalStatsRow: sys.dm_db_index_physical_stats() in 'LIMITED' mode,
// scoped to the heap/clustered index only (index_id IN (0,1)) - same "one
// table, never a full-schema/DETAILED scan" scoping as every other
// collection call here (§9.3). statsRow is the same sys.dm_db_stats_properties
// aggregate mapSqlServerTableStatisticsRow() uses, reused here for
// lastUpdatedAt rather than issuing a third query.
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
