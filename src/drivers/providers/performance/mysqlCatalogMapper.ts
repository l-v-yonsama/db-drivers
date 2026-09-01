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

// Row-mapping for MySQLPerformanceTuningProvider.ts's information_schema queries.

function metric<T>(
  value: T | undefined,
  source: string,
  estimated: boolean,
  unit?: string,
): MetricValue<T> | undefined {
  return value === undefined ? undefined : { value, estimated, source, unit };
}

// --- columns -----------------------------------------------------------

export function mapMysqlColumnRow(row: unknown): ColumnDefinition | undefined {
  const r = asRecord(row);
  const columnName = asString(r?.name);
  if (!r || !columnName) {
    return undefined;
  }
  return {
    columnName,
    dataType: asString(r.column_type) ?? asString(r.data_type) ?? 'unknown',
    nullable: r.is_nullable === 'YES',
    defaultExpression: asString(r.column_default),
    ordinalPosition: asNumber(r.ordinal_position),
    comment: asString(r.comment),
  };
}

export function mapMysqlColumnRows(rows: unknown[]): ColumnDefinition[] {
  return rows.map(mapMysqlColumnRow).filter((c): c is ColumnDefinition => c !== undefined);
}

// --- constraints ---------------------------------------------------------

// One row per (constraint, column) - the same shape TABLE_CONSTRAINTS JOIN KEY_COLUMN_USAGE naturally produces, so this groups in JS rather than fighting MySQL's JSON_ARRAYAGG() (which, unlike Postgres's array_agg(...
const CONSTRAINT_TYPE_BY_RAW: Record<string, ConstraintDefinition['type']> = {
  'PRIMARY KEY': 'primaryKey',
  UNIQUE: 'uniqueKey',
  'FOREIGN KEY': 'foreignKey',
};

export function mapMysqlConstraintRows(rows: unknown[]): ConstraintDefinition[] {
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

// CHECK constraints are a separate query (CHECK_CONSTRAINTS has no column list at all - MySQL's CHECK_CLAUSE is the raw boolean expression, already unwrapped, unlike Postgres's pg_get_constraintdef() which needs the "CHECK (...)" prefix stripped).
export function mapMysqlCheckConstraintRows(rows: unknown[]): ConstraintDefinition[] {
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

// One row per (index, column) from information_schema.STATISTICS - grouped in JS for the same reason as constraints above.
export function mapMysqlIndexRows(rows: unknown[]): IndexDefinition[] {
  type Entry = {
    indexName: string;
    unique: boolean;
    indexType?: string;
    columns: { position: number; column: IndexColumnDefinition }[];
  };
  const byName = new Map<string, Entry>();

  for (const raw of rows) {
    const r = asRecord(raw);
    const indexName = asString(r?.index_name);
    const position = asNumber(r?.seq_in_index);
    if (!r || !indexName || position === undefined) {
      continue;
    }
    let entry = byName.get(indexName);
    if (!entry) {
      entry = {
        indexName,
        unique: asNumber(r.non_unique) === 0,
        indexType: asString(r.index_type),
        columns: [],
      };
      byName.set(indexName, entry);
    }
    const columnName = asString(r.column_name);
    const expression = asString(r.expression);
    entry.columns.push({
      position,
      column: {
        columnName,
        expression: columnName ? undefined : expression,
        // MySQL 8.0+ supports DESC index key parts; COLLATION is 'A' (ascending), 'D' (descending), or NULL (not sorted, e.g. a FULLTEXT/SPATIAL index component).
        direction: asString(r.collation) === 'D' ? 'desc' : 'asc',
      },
    });
  }

  return [...byName.values()].map((entry) => ({
    indexName: entry.indexName,
    unique: entry.unique,
    primary: entry.indexName === 'PRIMARY',
    columns: entry.columns
      .sort((a, b) => a.position - b.position)
      .map((c) => c.column),
    // MySQL has neither INCLUDE columns nor partial/filtered indexes - both permanently undefined for this vendor, not just "not observed yet".
    includedColumns: undefined,
    predicate: undefined,
    indexType: entry.indexType,
  }));
}

// --- table statistics ---------------------------------------------------------

export function mapMysqlTableStatisticsRow(row: unknown): VendorTableStatistics | undefined {
  const r = asRecord(row);
  if (!r) {
    return undefined;
  }
  const dataLength = asNumber(r.data_length);
  const indexLength = asNumber(r.index_length);
  const totalBytes =
    dataLength !== undefined && indexLength !== undefined ? dataLength + indexLength : undefined;

  return {
    estimatedRowCount: metric(asNumber(r.table_rows), 'information_schema.TABLES.TABLE_ROWS', true, 'rows'),
    tableBytes: metric(dataLength, 'information_schema.TABLES.DATA_LENGTH', true, 'bytes'),
    indexBytes: metric(indexLength, 'information_schema.TABLES.INDEX_LENGTH', true, 'bytes'),
    totalBytes: metric(
      totalBytes,
      'information_schema.TABLES.DATA_LENGTH + INDEX_LENGTH',
      true,
      'bytes',
    ),
    // statisticsUpdatedAt/modificationsSinceAnalyze intentionally omitted: MySQL has no information_schema equivalent of Postgres's pg_stat_user_tables.last_analyze/n_mod_since_analyze.
  };
}

// --- column statistics ---------------------------------------------------------

export function estimateDistinctCountFromMysqlHistogram(
  histogram: Record<string, unknown> | undefined,
): number | undefined {
  if (!histogram || !Array.isArray(histogram.buckets)) {
    return undefined;
  }
  const type = asString(histogram['histogram-type']);
  if (type === 'singleton') {
    return histogram.buckets.length;
  }
  if (type === 'equi-height') {
    let total = 0;
    for (const bucket of histogram.buckets) {
      if (!Array.isArray(bucket) || typeof bucket[3] !== 'number') {
        return undefined;
      }
      total += bucket[3];
    }
    return total > 0 ? total : undefined;
  }
  return undefined;
}

export function mapMysqlColumnStatisticsRow(
  columnName: string,
  cardinalityRow: unknown,
  histogramRow: unknown,
): ColumnStatisticsContext {
  const cardinality = asRecord(cardinalityRow);
  const histogram = asRecord(asRecord(histogramRow)?.histogram);

  const cardinalityValue = asNumber(cardinality?.cardinality);
  const distinctCount =
    cardinalityValue !== undefined
      ? metric(cardinalityValue, 'information_schema.STATISTICS.CARDINALITY', true, 'values')
      : metric(
          estimateDistinctCountFromMysqlHistogram(histogram),
          'information_schema.COLUMN_STATISTICS (derived from histogram buckets)',
          true,
          'values',
        );

  return {
    columnName,
    distinctCount,
    nullFraction: histogram
      ? metric(asNumber(histogram['null-values']), 'information_schema.COLUMN_STATISTICS', true)
      : undefined,
    histogramType: histogram
      ? metric(asString(histogram['histogram-type']), 'information_schema.COLUMN_STATISTICS', true)
      : undefined,
    histogramBucketCount: histogram
      ? metric(
          Array.isArray(histogram.buckets) ? histogram.buckets.length : undefined,
          'information_schema.COLUMN_STATISTICS',
          true,
        )
      : undefined,
    statisticsUpdatedAt: histogram
      ? metric(
          asIsoDateStringFromMysql(asString(histogram['last-updated'])),
          'information_schema.COLUMN_STATISTICS',
          false,
        )
      : undefined,
  };
}

// MySQL's histogram JSON stores "last-updated" as "YYYY-MM-DD HH:MM:SS.ffffff" (space-separated, no timezone; recorded in UTC) rather than an ISO 8601 string or a native temporal value - reformat it into something Date.parse()/an AI can read unambiguously.
function asIsoDateStringFromMysql(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const iso = `${value.replace(' ', 'T')}Z`;
  return Number.isNaN(Date.parse(iso)) ? undefined : iso;
}

// --- physical health ---------------------------------------------------------

export function mapMysqlPhysicalHealthRow(row: unknown): VendorPhysicalHealth {
  const r = asRecord(row) ?? {};
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

  push('dataFreeBytes', asNumber(r.data_free), 'bytes', true, 'information_schema.TABLES.DATA_FREE');
  push(
    'lastUpdatedAt',
    asIsoDateString(r.update_time),
    undefined,
    false,
    'information_schema.TABLES.UPDATE_TIME (last DML modification, not last statistics refresh)',
  );

  return { metrics };
}
