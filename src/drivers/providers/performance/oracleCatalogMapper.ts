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

// Row-mapping for OraclePerformanceTuningProvider.ts's ALL_* dictionary
// view queries. Pure functions (no I/O), same rationale as the other three
// vendors' catalog mappers: catalog output is DB data this driver doesn't
// fully control the shape of, so every access is guarded and nothing here
// throws - an unmappable row is dropped, not a reason to fail the whole
// collection.
//
// Every property access below is UPPERCASE, unlike the other three
// vendors' mappers: node-oracledb (and Oracle itself) folds every unquoted
// identifier - including a query's own `AS alias` - to uppercase, so a
// `SELECT ... AS name` still comes back keyed `NAME`, not `name` (confirmed
// against a live Oracle 23c instance; this bit Postgres/MySQL/SQL Server
// none of which do this). OraclePerformanceTuningProvider.ts's own SQL
// constants use UPPERCASE `AS` aliases to match, rather than fighting this
// with quoted-lowercase aliases (`AS "name"`) - same convention this file's
// OracleDriver.ts already uses elsewhere (getTables()/setColumns() etc.).

function metric<T>(
  value: T | undefined,
  source: string,
  estimated: boolean,
  unit?: string,
): MetricValue<T> | undefined {
  return value === undefined ? undefined : { value, estimated, source, unit };
}

// --- columns -----------------------------------------------------------

// ALL_TAB_COLUMNS has no single "as declared" type text the way MySQL's
// COLUMN_TYPE or SQL Server's sys.types-derived string do - this builds one
// from DATA_TYPE + DATA_PRECISION/DATA_SCALE (NUMBER) or DATA_LENGTH
// (VARCHAR2/CHAR/NVARCHAR2/NCHAR/RAW), matching how Oracle itself renders a
// column's type in DBMS_METADATA.GET_DDL output. Every other type
// (DATE/CLOB/BLOB/TIMESTAMP/...) has no meaningful length/precision
// qualifier and is left as the bare DATA_TYPE.
const SIZED_TEXT_TYPES = new Set(['VARCHAR2', 'CHAR', 'NVARCHAR2', 'NCHAR', 'RAW']);

function buildOracleDataType(row: Record<string, unknown>): string {
  const dataType = asString(row.DATA_TYPE) ?? 'UNKNOWN';
  const precision = asNumber(row.DATA_PRECISION);
  const scale = asNumber(row.DATA_SCALE);
  const length = asNumber(row.DATA_LENGTH);

  if (dataType === 'NUMBER') {
    if (precision !== undefined && scale !== undefined) {
      return `NUMBER(${precision},${scale})`;
    }
    if (precision !== undefined) {
      return `NUMBER(${precision})`;
    }
    return 'NUMBER';
  }
  if (SIZED_TEXT_TYPES.has(dataType) && length !== undefined) {
    return `${dataType}(${length})`;
  }
  return dataType;
}

export function mapOracleColumnRow(row: unknown): ColumnDefinition | undefined {
  const r = asRecord(row);
  const columnName = asString(r?.NAME);
  if (!r || !columnName) {
    return undefined;
  }
  return {
    columnName,
    dataType: buildOracleDataType(r),
    nullable: r.NULLABLE === 'Y',
    defaultExpression: asString(r.COLUMN_DEFAULT),
    ordinalPosition: asNumber(r.ORDINAL_POSITION),
    comment: asString(r.COMMENT),
  };
}

export function mapOracleColumnRows(rows: unknown[]): ColumnDefinition[] {
  return rows.map(mapOracleColumnRow).filter((c): c is ColumnDefinition => c !== undefined);
}

// --- constraints ---------------------------------------------------------

// One row per (constraint, column) - PRIMARY KEY/UNIQUE/FOREIGN KEY are all
// one query in OraclePerformanceTuningProvider.ts (ALL_CONSTRAINTS JOIN
// ALL_CONS_COLUMNS, self-joined for the referenced side), grouped here the
// same way as the other three vendors' constraint mappers.
const CONSTRAINT_TYPE_BY_RAW: Record<string, ConstraintDefinition['type']> = {
  P: 'primaryKey',
  U: 'uniqueKey',
  R: 'foreignKey',
};

export function mapOracleConstraintRows(rows: unknown[]): ConstraintDefinition[] {
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
    const constraintName = asString(r?.CONSTRAINT_NAME);
    const rawType = asString(r?.CONSTRAINT_TYPE);
    const type = rawType ? CONSTRAINT_TYPE_BY_RAW[rawType] : undefined;
    const columnName = asString(r?.COLUMN_NAME);
    const position = asNumber(r?.POSITION);
    if (!r || !constraintName || !type || !columnName || position === undefined) {
      continue;
    }
    let entry = byName.get(constraintName);
    if (!entry) {
      entry = {
        constraintName,
        type,
        columns: [],
        referencedSchemaName: asString(r.REFERENCED_SCHEMA),
        referencedTableName: asString(r.REFERENCED_TABLE),
        referencedColumns: [],
      };
      byName.set(constraintName, entry);
    }
    entry.columns.push({ position, name: columnName });
    const referencedColumnName = asString(r.REFERENCED_COLUMN);
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

// A column's NOT NULL is represented as its own auto-generated CHECK
// constraint in Oracle (CONSTRAINT_TYPE = 'C', SEARCH_CONDITION_VC =
// `"COL" IS NOT NULL`) - redundant with that column's own `nullable` flag
// already reported by mapOracleColumnRow(), so it's filtered out here
// rather than surfaced as a second, confusing "constraint". A real CHECK
// (e.g. `amount >= 0`) never matches this exact shape.
const AUTO_NOT_NULL_CHECK = /^"[^"]+"\s+IS\s+NOT\s+NULL$/i;

export function mapOracleCheckConstraintRows(rows: unknown[]): ConstraintDefinition[] {
  return rows
    .map((raw): ConstraintDefinition | undefined => {
      const r = asRecord(raw);
      const constraintName = asString(r?.CONSTRAINT_NAME);
      const checkExpression = asString(r?.CHECK_CLAUSE);
      if (!r || !constraintName || !checkExpression || AUTO_NOT_NULL_CHECK.test(checkExpression)) {
        return undefined;
      }
      return { constraintName, type: 'check', checkExpression };
    })
    .filter((c): c is ConstraintDefinition => c !== undefined);
}

// --- indexes ---------------------------------------------------------

// One row per (index, column) from ALL_INDEXES/ALL_IND_COLUMNS (+
// ALL_IND_EXPRESSIONS for a function-based index's expression text) -
// grouped in JS for the same reason as the other three vendors. A
// function-based index's key part has a system-generated hidden column
// name (`SYS_NC00005$`-style) in ALL_IND_COLUMNS.COLUMN_NAME instead of a
// real one - `isHiddenSystemColumn()` detects that so the expression text
// (not the meaningless hidden name) is what ends up in
// IndexColumnDefinition.expression, mirroring how Postgres/MySQL both split
// `name` vs `expression` for their own functional index key parts.
const isHiddenSystemColumn = (name: string): boolean => /^SYS_NC\d+\$$/.test(name);

export function mapOracleIndexRows(rows: unknown[]): IndexDefinition[] {
  type Entry = {
    indexName: string;
    unique: boolean;
    indexType?: string;
    columns: { position: number; column: IndexColumnDefinition }[];
  };
  const byName = new Map<string, Entry>();

  for (const raw of rows) {
    const r = asRecord(raw);
    const indexName = asString(r?.INDEX_NAME);
    const position = asNumber(r?.COLUMN_POSITION);
    const rawColumnName = asString(r?.COLUMN_NAME);
    if (!r || !indexName || position === undefined || !rawColumnName) {
      continue;
    }
    let entry = byName.get(indexName);
    if (!entry) {
      entry = {
        indexName,
        unique: asString(r.UNIQUENESS) === 'UNIQUE',
        indexType: asString(r.INDEX_TYPE),
        columns: [],
      };
      byName.set(indexName, entry);
    }
    const expression = asString(r.COLUMN_EXPRESSION);
    const hidden = isHiddenSystemColumn(rawColumnName);
    entry.columns.push({
      position,
      column: {
        columnName: hidden ? undefined : rawColumnName,
        expression: hidden ? expression : undefined,
        direction: asString(r.DESCEND) === 'DESC' ? 'desc' : 'asc',
      },
    });
  }

  return [...byName.values()].map((entry) => ({
    indexName: entry.indexName,
    unique: entry.unique,
    // Oracle auto-creates a PK's backing unique index with the constraint's
    // own name (SYS_C###### unless explicitly named) - there is no direct
    // "is this the PK's index" flag on ALL_INDEXES itself, so `primary` is
    // left for the Provider to set by cross-referencing the constraint list
    // it already collected in the same call, not guessed here from the name.
    primary: false,
    columns: entry.columns
      .sort((a, b) => a.position - b.position)
      .map((c) => c.column),
    // Oracle has no INCLUDE-column concept; partial/filtered indexes don't
    // exist either (short of a function-based index on a CASE expression,
    // which this driver doesn't attempt to detect as "partial").
    includedColumns: undefined,
    predicate: undefined,
    indexType: entry.indexType,
  }));
}

// --- table statistics ---------------------------------------------------------

// row/dataBytes/indexBytes come from ALL_TABLES.BLOCKS and a
// ALL_INDEXES.LEAF_BLOCKS+BLEVEL+1 sum (both in block units, converted to
// bytes via the table's own tablespace BLOCK_SIZE - see TABLE_SIZE_SQL) -
// both DBMS_STATS-refreshed and therefore estimated, same spirit as
// Postgres/MySQL/SQL Server's own size approximations. statisticsUpdatedAt/
// modificationsSinceAnalyze come from LAST_ANALYZED (exact) and
// ALL_TAB_MODIFICATIONS (Oracle's own DML-since-last-gather tracker, the
// direct equivalent of Postgres's n_mod_since_analyze).
export function mapOracleTableStatisticsRow(
  sizeRow: unknown,
  modificationsRow: unknown,
): VendorTableStatistics | undefined {
  const size = asRecord(sizeRow);
  if (!size) {
    return undefined;
  }
  const blockSize = asNumber(size.BLOCK_SIZE) ?? 8192;
  const blocks = asNumber(size.BLOCKS);
  const indexBlocks = asNumber(size.INDEX_BLOCKS);
  const tableBytes = blocks !== undefined ? blocks * blockSize : undefined;
  const indexBytes = indexBlocks !== undefined ? indexBlocks * blockSize : undefined;
  const totalBytes =
    tableBytes !== undefined && indexBytes !== undefined ? tableBytes + indexBytes : undefined;

  const modifications = asRecord(modificationsRow);
  const inserts = asNumber(modifications?.INSERTS) ?? 0;
  const updates = asNumber(modifications?.UPDATES) ?? 0;
  const deletes = asNumber(modifications?.DELETES) ?? 0;

  return {
    estimatedRowCount: metric(asNumber(size.NUM_ROWS), 'ALL_TABLES.NUM_ROWS', true, 'rows'),
    tableBytes: metric(tableBytes, 'ALL_TABLES.BLOCKS * block size', true, 'bytes'),
    indexBytes: metric(indexBytes, 'ALL_INDEXES.LEAF_BLOCKS/BLEVEL * block size', true, 'bytes'),
    totalBytes: metric(totalBytes, 'ALL_TABLES.BLOCKS + ALL_INDEXES (blocks) * block size', true, 'bytes'),
    statisticsUpdatedAt: metric(asIsoDateString(size.LAST_ANALYZED), 'ALL_TABLES.LAST_ANALYZED', false),
    modificationsSinceAnalyze: modifications
      ? metric(inserts + updates + deletes, 'ALL_TAB_MODIFICATIONS (INSERTS+UPDATES+DELETES)', false)
      : undefined,
  };
}

// --- column statistics ---------------------------------------------------------

// ALL_TAB_COL_STATISTICS is a direct per-column catalog view (unlike SQL
// Server, which has no such view and must derive distinctCount from a
// histogram DMF instead) - the closest counterpart to Postgres's pg_stats.
export function mapOracleColumnStatisticsRow(row: unknown): ColumnStatisticsContext | undefined {
  const r = asRecord(row);
  const columnName = asString(r?.COLUMN_NAME);
  if (!r || !columnName) {
    return undefined;
  }
  // NUM_NULLS is the *whole column's* null count, not scaled to whatever
  // sample DBMS_STATS actually analyzed - SAMPLE_SIZE is that sample's row
  // count, which can be smaller than the table's real row count, so
  // NUM_NULLS / SAMPLE_SIZE can come out above 1 for a sampled (not
  // FULLSCAN) stats gather. TABLE_NUM_ROWS (ALL_TABLES.NUM_ROWS, joined in
  // by COLUMN_STATISTICS_SQL) is the correct denominator - the same
  // population NUM_NULLS was counted against.
  const numRows = asNumber(r.TABLE_NUM_ROWS);
  const numNulls = asNumber(r.NUM_NULLS);

  return {
    columnName,
    distinctCount: metric(asNumber(r.NUM_DISTINCT), 'ALL_TAB_COL_STATISTICS.NUM_DISTINCT', true, 'values'),
    nullFraction:
      numRows !== undefined && numRows > 0 && numNulls !== undefined
        ? metric(numNulls / numRows, 'ALL_TAB_COL_STATISTICS.NUM_NULLS / ALL_TABLES.NUM_ROWS', true)
        : undefined,
    averageWidthBytes: metric(asNumber(r.AVG_COL_LEN), 'ALL_TAB_COL_STATISTICS.AVG_COL_LEN', true, 'bytes'),
    // HISTOGRAM is Oracle's own real histogram-kind name (e.g. 'NONE',
    // 'FREQUENCY', 'HYBRID', 'TOP-FREQUENCY', 'HEIGHT BALANCED') - stated as
    // fact, not inferred.
    histogramType: metric(asString(r.HISTOGRAM), 'ALL_TAB_COL_STATISTICS.HISTOGRAM', true),
    histogramBucketCount: metric(asNumber(r.NUM_BUCKETS), 'ALL_TAB_COL_STATISTICS.NUM_BUCKETS', true),
    statisticsUpdatedAt: metric(
      asIsoDateString(r.LAST_ANALYZED),
      'ALL_TAB_COL_STATISTICS.LAST_ANALYZED',
      false,
    ),
  };
}

export function mapOracleColumnStatisticsRows(rows: unknown[]): ColumnStatisticsContext[] {
  return rows
    .map(mapOracleColumnStatisticsRow)
    .filter((c): c is ColumnStatisticsContext => c !== undefined);
}

// --- physical health ---------------------------------------------------------

export function mapOraclePhysicalHealthRow(row: unknown): VendorPhysicalHealth {
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

  // CHAIN_CNT (row chaining/migration count) is Oracle's closest analog to
  // Postgres's dead-tuple/bloat metrics - but it's only ever populated by a
  // legacy `ANALYZE TABLE ... COMPUTE/ESTIMATE STATISTICS`, not by
  // `DBMS_STATS.GATHER_TABLE_STATS` (the modern, recommended stats-gathering
  // path this Provider otherwise relies on throughout) - so this is
  // commonly stale/zero on a table whose statistics were only ever gathered
  // via DBMS_STATS, and the description says so rather than implying a
  // guaranteed-fresh count.
  push(
    'chainedRowCount',
    asNumber(r.CHAIN_CNT),
    'rows',
    true,
    'ALL_TABLES.CHAIN_CNT (only refreshed by legacy ANALYZE, not DBMS_STATS.GATHER_TABLE_STATS)',
  );
  push('lastUpdatedAt', asIsoDateString(r.LAST_ANALYZED), undefined, false, 'ALL_TABLES.LAST_ANALYZED');

  return { metrics };
}
