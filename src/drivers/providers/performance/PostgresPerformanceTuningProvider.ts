import { ResultSetData } from '@l-v-yonsama/rdh';
import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  ColumnDefinition,
  ConstraintDefinition,
  IndexDefinition,
  PerformanceTuningCallOptions,
  PerformanceTuningContextParams,
} from '../../../types/drivers/performance/PerformanceTuningContext';
import {
  PerformanceTuningAvailabilityParams,
  PerformanceTuningCapabilities,
} from '../../../types/drivers/performance/PerformanceTuningCapabilities';
import { QueryParams } from '../../../types/drivers/QueryParams';
import {
  mapColumnRows,
  mapColumnStatisticsRows,
  mapConstraintRows,
  mapIndexRows,
  mapPartitioningRow,
  mapPhysicalHealthRow,
  mapTableStatisticsRow,
  renderPostgresTableDdl,
} from './postgresCatalogMapper';
import {
  PerformanceTuningCollectionOptions,
  PerformanceTuningContextProvider,
  PerformanceTuningTableTarget,
  VendorColumnStatistics,
  VendorExecutionPlan,
  VendorPhysicalHealth,
  VendorTableDefinition,
  VendorTableStatistics,
} from './PerformanceTuningContextProvider';
import { extractPlanningTimeMs, parsePostgresPlan } from './postgresPlanParser';

// Narrow, structural view of PostgresDriver - only what this Provider
// actually needs (run a read-only SQL statement against the already-open
// connection). Kept as an interface rather than `import type { PostgresDriver }`
// so this Provider can be unit tested with a stub instead of a real
// connection, and so it can never reach past "run this SQL" into driver
// internals (connect/disconnect, transactions, UI).
export interface PostgresPerformanceTuningDriverAccess {
  requestSql(params: QueryParams): Promise<ResultSetData>;
}

// Every catalog query here takes `(tableName, schemaFilter)` as its first
// two binds, where schemaFilter is `target.schemaName ?? ''` - an empty
// string, not SQL NULL, because QueryConditions.binds is typed `string[]`
// (this driver's binds go through node-postgres' native parameterized
// query support, not client-side substitution, so there's no reason to
// coerce anything except to satisfy that type). Every WHERE clause below
// repeats the same shape: `($2 = '' AND pg_table_is_visible(...)) OR
// ns.nspname = $2` - honor an explicit schema, otherwise fall back to
// whatever's reachable via the connection's current search_path, matching
// how an unqualified table name would resolve in a plain query.
const schemaFilterBinds = (target: { schemaName?: string }): string => target.schemaName ?? '';

// Phase 1 vertical slice. §13 step 4 covered execution plan retrieval and
// plan-driven table/alias/index/predicate-column resolution; this
// (§13 step 5) adds DDL/index, table statistics, column statistics and
// physical health, each scoped to exactly one already-resolved table -
// never a full-schema scan (§9.3).
export class PostgresPerformanceTuningProvider implements PerformanceTuningContextProvider {
  constructor(private readonly driver: PostgresPerformanceTuningDriverAccess) {}

  async checkCapabilities(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: PerformanceTuningAvailabilityParams,
  ): Promise<GeneralResult<PerformanceTuningCapabilities>> {
    // Read-only by design (§7): this never runs EXPLAIN or touches any
    // catalog view, it just reports what this Provider can and can't do.
    // Availability here is static per-Provider capability, not a
    // per-connection permission probe - a permission gap on a specific
    // table still surfaces later as that table's own unavailableSections
    // entry (§4.3), not here.
    const capabilities: PerformanceTuningCapabilities = {
      executionPlan: { available: true, source: 'EXPLAIN (FORMAT JSON)' },
      analyzedExecutionPlan: {
        available: false,
        message: 'Not implemented yet (estimate plans only).',
      },
      tableDefinition: { available: true, source: 'pg_catalog / information_schema' },
      optimizerStatistics: { available: true, source: 'pg_class / pg_stats / pg_stat_user_tables' },
      physicalHealth: { available: true, source: 'pg_stat_user_tables' },
    };
    return { ok: true, message: '', result: capabilities };
  }

  async collectExecutionPlan(
    params: PerformanceTuningContextParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCallOptions & { timeoutMs: number },
  ): Promise<GeneralResult<VendorExecutionPlan>> {
    if (params.plan?.mode === 'analyze') {
      return {
        ok: false,
        message: 'Analyze mode is not implemented yet for PostgreSQL.',
      };
    }

    // binds are used only to obtain a parameter-specific plan (§4.1); they
    // are never placed anywhere in the returned VendorExecutionPlan.
    const binds = params.plan?.binds?.map((v) => String(v));

    let rdh: ResultSetData;
    try {
      rdh = await this.driver.requestSql({
        sql: `EXPLAIN (FORMAT JSON) ${params.statement.sql}`,
        conditions: { rawQueries: true, binds },
        // Identifies this as internal performance-tuning-context collection
        // rather than a user-issued EXPLAIN, so a caller building SQL
        // History off requestSql() results (§6.3: "収集 SQL 自体を SQL
        // History...へ混入させないため、内部実行目的を metadata で識別する")
        // has a stable signal to filter on instead of pattern-matching SQL text.
        meta: { type: 'performanceTuningContext' },
      });
    } catch (e) {
      // A failed EXPLAIN (bad SQL, permission denied, ...) is an expected,
      // actionable failure mode - surfaced with detail, the same way
      // checkStatementStatisticsAvailability() already does elsewhere in
      // this driver, not the generic "unexpected error" message
      // RDSBaseDriver's exception boundary uses for genuine bugs.
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message: `Failed to retrieve the execution plan.${detail ? ` ${detail}` : ''}`,
      };
    }

    const rawValue = rdh.rows[0]?.values?.['QUERY PLAN'];
    if (rawValue === undefined) {
      return { ok: false, message: 'EXPLAIN did not return a QUERY PLAN result.' };
    }

    let parsed: unknown;
    try {
      parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    } catch {
      return { ok: false, message: 'Failed to parse the EXPLAIN JSON output.' };
    }

    // `EXPLAIN (FORMAT JSON)` returns a single-element array; `raw` keeps
    // that shape as-is ("the vendor's EXPLAIN result itself" per §5.2),
    // while table resolution below works off the one explain root.
    const explainRoot = Array.isArray(parsed) ? parsed[0] : parsed;

    // parsePostgresPlan() never throws (every access inside it is guarded),
    // but this still catches a genuinely unexpected bug rather than letting
    // it propagate as a hard collectExecutionPlan() failure - a normalized
    // tree / table mapping we couldn't build is a warning, never a reason
    // to lose the already-retrieved raw plan.
    let planNode: VendorExecutionPlan['normalizedPlan'];
    let planTableMappings: VendorExecutionPlan['planTableMappings'] = [];
    const warnings: string[] = [];
    try {
      const parsedPlan = parsePostgresPlan(explainRoot);
      planNode = parsedPlan.planNode;
      planTableMappings = parsedPlan.mappings;
      warnings.push(...parsedPlan.warnings);
    } catch {
      warnings.push('Failed to resolve tables from the execution plan.');
    }

    return {
      ok: true,
      message: '',
      result: {
        raw: parsed,
        normalizedPlan: planNode,
        planningTimeMs: extractPlanningTimeMs(explainRoot),
        warnings,
        planTableMappings,
      },
    };
  }

  // Failure here is treated the same as an EXPLAIN failure (§9's "expected,
  // actionable failure" precedent): the message includes driver detail
  // (SQL error text) since it's meant to help fix a real permission/setup
  // problem, not a generic "call the extension logs" deflection - that
  // policy is specifically about *unexpected* Provider exceptions crossing
  // the public API boundary (RDSBaseDriver.toPerformanceTuningContextErrorResult()),
  // not about a catalog query returning an ordinary Postgres error.
  private async runCatalogQuery(
    sql: string,
    binds: string[],
    sectionLabel: string,
  ): Promise<GeneralResult<ResultSetData>> {
    try {
      const rdh = await this.driver.requestSql({
        sql,
        conditions: { rawQueries: true, binds },
        meta: { type: 'performanceTuningContext' },
      });
      return { ok: true, message: '', result: rdh };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message: `Failed to collect ${sectionLabel} for this table.${detail ? ` ${detail}` : ''}`,
      };
    }
  }

  async collectTableDefinition(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorTableDefinition>> {
    const binds = [target.tableName, schemaFilterBinds(target)];

    const [columnsResult, constraintsResult, indexesResult, partitioningResult] =
      await Promise.all([
        this.runCatalogQuery(COLUMNS_SQL, binds, 'columns'),
        this.runCatalogQuery(CONSTRAINTS_SQL, binds, 'constraints'),
        this.runCatalogQuery(INDEXES_SQL, binds, 'indexes'),
        this.runCatalogQuery(PARTITIONING_SQL, binds, 'partitioning'),
      ]);

    if (!columnsResult.ok) {
      return { ok: false, message: columnsResult.message };
    }

    const columns: ColumnDefinition[] = mapColumnRows(columnsResult.result?.rows.map((r) => r.values) ?? []);
    const constraints: ConstraintDefinition[] = constraintsResult.ok
      ? mapConstraintRows(constraintsResult.result?.rows.map((r) => r.values) ?? [])
      : [];
    const indexes: IndexDefinition[] = indexesResult.ok
      ? mapIndexRows(indexesResult.result?.rows.map((r) => r.values) ?? [])
      : [];
    const partitioning = partitioningResult.ok
      ? mapPartitioningRow(partitioningResult.result?.rows[0]?.values)
      : undefined;

    const warnings: string[] = [];
    if (!constraintsResult.ok) {
      warnings.push(constraintsResult.message);
    }
    if (!indexesResult.ok) {
      warnings.push(indexesResult.message);
    }
    if (!partitioningResult.ok) {
      warnings.push(partitioningResult.message);
    }

    if (columns.length === 0) {
      return {
        ok: false,
        message: `Table ${target.schemaName ? `${target.schemaName}.` : ''}${target.tableName} was not found (or is not visible to this connection).`,
      };
    }

    const ddl = renderPostgresTableDdl({
      schemaName: target.schemaName,
      tableName: target.tableName,
      columns,
      constraints,
      indexes,
    });

    return {
      ok: true,
      message: warnings.join(' '),
      result: { ddl, columns, constraints, indexes, partitioning },
    };
  }

  async collectTableStatistics(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorTableStatistics>> {
    const result = await this.runCatalogQuery(
      TABLE_STATISTICS_SQL,
      [target.tableName, schemaFilterBinds(target)],
      'table statistics',
    );
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    const mapped = mapTableStatisticsRow(result.result?.rows[0]?.values);
    if (!mapped) {
      return {
        ok: false,
        message: `Table ${target.schemaName ? `${target.schemaName}.` : ''}${target.tableName} was not found (or is not visible to this connection).`,
      };
    }
    return { ok: true, message: '', result: mapped };
  }

  async collectColumnStatistics(
    target: PerformanceTuningTableTarget & { columnNames: string[] },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorColumnStatistics[]>> {
    if (target.columnNames.length === 0) {
      return { ok: true, message: '', result: [] };
    }
    // One placeholder per requested column, appended after the fixed
    // (tableName, schemaFilter) pair - conditions.binds is typed `string[]`
    // (node-postgres parameterized query, not client-side substitution),
    // so this stays a flat list of strings rather than a nested array bind.
    const columnPlaceholders = target.columnNames
      .map((_, i) => `$${i + 3}`)
      .join(', ');
    const sql = COLUMN_STATISTICS_SQL.replace('$COLUMN_PLACEHOLDERS', columnPlaceholders);
    const binds = [target.tableName, schemaFilterBinds(target), ...target.columnNames];

    const result = await this.runCatalogQuery(sql, binds, 'column statistics');
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    return {
      ok: true,
      message: '',
      result: mapColumnStatisticsRows(result.result?.rows.map((r) => r.values) ?? []),
    };
  }

  async collectPhysicalHealth(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorPhysicalHealth>> {
    const result = await this.runCatalogQuery(
      PHYSICAL_HEALTH_SQL,
      [target.tableName, schemaFilterBinds(target)],
      'physical health',
    );
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    return { ok: true, message: '', result: mapPhysicalHealthRow(result.result?.rows[0]?.values) };
  }
}

const COLUMNS_SQL = `
SELECT
  col.column_name AS name,
  col.data_type AS data_type,
  col.udt_name AS udt_name,
  col.is_nullable AS is_nullable,
  col.column_default AS column_default,
  col.ordinal_position AS ordinal_position,
  pg_catalog.col_description(c.oid, col.ordinal_position::int) AS comment
FROM information_schema.columns col
JOIN pg_catalog.pg_class c ON c.relname = col.table_name
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace AND n.nspname = col.table_schema
WHERE col.table_name = $1
  AND (($2 = '' AND pg_table_is_visible(c.oid)) OR col.table_schema = $2)
ORDER BY col.ordinal_position`;

const CONSTRAINTS_SQL = `
SELECT
  con.conname AS constraint_name,
  con.contype AS contype,
  -- ::text matters: pg_attribute.attname is the catalog "name" type, and
  -- node-postgres has no default array parser for name[] (only scalar
  -- name has one) - without the cast this array_agg comes back as its raw
  -- Postgres text literal ("{id}") instead of a JS array.
  (SELECT array_agg(a.attname::text ORDER BY x.n)
     FROM unnest(con.conkey) WITH ORDINALITY AS x(attnum, n)
     JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = x.attnum
  ) AS columns,
  fn.nspname AS referenced_schema,
  fc.relname AS referenced_table,
  (SELECT array_agg(a.attname::text ORDER BY x.n)
     FROM unnest(con.confkey) WITH ORDINALITY AS x(attnum, n)
     JOIN pg_attribute a ON a.attrelid = con.confrelid AND a.attnum = x.attnum
  ) AS referenced_columns,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_class fc ON fc.oid = con.confrelid
LEFT JOIN pg_namespace fn ON fn.oid = fc.relnamespace
WHERE c.relname = $1
  AND (($2 = '' AND pg_table_is_visible(c.oid)) OR n.nspname = $2)
  AND con.contype IN ('p','u','f','c')`;

// Each index's columns are pre-aggregated into one JSON array (json_agg)
// instead of one row per index column, so this stays a single round trip
// per table instead of N+1. Position 1..indnkeyatts are real key columns;
// positions beyond that (up to indnatts) are INCLUDE columns (PG11+) -
// postgresCatalogMapper.mapIndexRow() does that split using n_key_atts.
const INDEXES_SQL = `
SELECT
  i.relname AS index_name,
  ix.indisunique AS is_unique,
  ix.indisprimary AS is_primary,
  ix.indisvalid AS is_valid,
  am.amname AS index_type,
  pg_get_expr(ix.indpred, ix.indrelid) AS predicate,
  ix.indnkeyatts AS n_key_atts,
  (
    SELECT json_agg(
      json_build_object(
        'position', gs.pos,
        'name', CASE WHEN k0.attnum IS NOT NULL AND k0.attnum <> 0 THEN k.attname ELSE NULL END,
        'expression', CASE WHEN k0.attnum IS NULL OR k0.attnum = 0 THEN pg_get_indexdef(ix.indexrelid, gs.pos, true) ELSE NULL END,
        'desc', COALESCE((o.opt & 1) = 1, false)
      ) ORDER BY gs.pos
    )
    FROM generate_series(1, ix.indnatts) AS gs(pos)
    LEFT JOIN LATERAL (SELECT (string_to_array(ix.indkey::text, ' '))[gs.pos]::int2 AS attnum) k0 ON true
    LEFT JOIN pg_attribute k ON k.attrelid = ix.indrelid AND k.attnum = k0.attnum AND k0.attnum <> 0
    LEFT JOIN LATERAL (SELECT NULLIF((string_to_array(ix.indoption::text, ' '))[gs.pos], '')::int AS opt) o ON true
  ) AS columns
FROM pg_index ix
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_am am ON am.oid = i.relam
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE t.relname = $1
  AND (($2 = '' AND pg_table_is_visible(t.oid)) OR n.nspname = $2)
ORDER BY i.relname`;

const PARTITIONING_SQL = `
SELECT
  pt.partstrat AS strategy,
  pg_get_partkeydef(pt.partrelid) AS partition_key_def,
  (SELECT count(*) FROM pg_inherits WHERE inhparent = pt.partrelid) AS partition_count
FROM pg_partitioned_table pt
JOIN pg_class c ON c.oid = pt.partrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = $1
  AND (($2 = '' AND pg_table_is_visible(c.oid)) OR n.nspname = $2)`;

const TABLE_STATISTICS_SQL = `
SELECT
  c.reltuples AS estimated_row_count,
  pg_table_size(c.oid) AS table_bytes,
  pg_indexes_size(c.oid) AS index_bytes,
  pg_total_relation_size(c.oid) AS total_bytes,
  s.n_mod_since_analyze,
  s.last_analyze,
  s.last_autoanalyze
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE c.relname = $1
  AND (($2 = '' AND pg_table_is_visible(c.oid)) OR n.nspname = $2)`;

// `$COLUMN_PLACEHOLDERS` is substituted with `$3, $4, ...` (one per
// requested column) before this is sent - see collectColumnStatistics().
const COLUMN_STATISTICS_SQL = `
SELECT ps.attname, ps.n_distinct, ps.null_frac, ps.avg_width, ps.correlation, c.reltuples
FROM pg_stats ps
JOIN pg_class c ON c.relname = ps.tablename
JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = ps.schemaname
WHERE ps.tablename = $1
  AND (($2 = '' AND pg_table_is_visible(c.oid)) OR ps.schemaname = $2)
  AND ps.attname IN ($COLUMN_PLACEHOLDERS)`;

const PHYSICAL_HEALTH_SQL = `
SELECT
  s.n_live_tup,
  s.n_dead_tup,
  s.n_mod_since_analyze,
  s.last_vacuum,
  s.last_autovacuum,
  s.last_analyze,
  s.last_autoanalyze
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE c.relname = $1
  AND (($2 = '' AND pg_table_is_visible(c.oid)) OR n.nspname = $2)`;
