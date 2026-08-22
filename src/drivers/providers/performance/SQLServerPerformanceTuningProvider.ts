import { ResultSetData } from '@l-v-yonsama/rdh';
import { GeneralResult } from '../../../types/drivers/GeneralResult';
import {
  ActualPlanArtifact,
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
import { planUnresolvedDiagnostic } from './performanceTuningDiagnosticHelpers';
import {
  mapSqlServerCheckConstraintRows,
  mapSqlServerColumnRows,
  mapSqlServerColumnStatisticsRow,
  mapSqlServerConstraintRows,
  mapSqlServerIndexRows,
  mapSqlServerPhysicalHealthRow,
  mapSqlServerTableStatisticsRow,
  renderSqlServerTableDdl,
} from './sqlServerCatalogMapper';
import { parseSqlServerPlan } from './sqlServerPlanParser';
import { extractSqlServerRuntimeObservations, resolveSqlServerActualPlanTableStats } from './sqlServerActualPlanXmlParser';
import { computeRowEstimateRatio } from './planNodeMath';
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

// Narrow, structural view of SQLServerDriver - just what this Provider
// needs, same rationale as the Postgres/MySQL equivalents: unit-testable
// with a stub, and can't reach past this into connect/disconnect/
// transactions/UI. collectPerformanceTuningShowplan() is a dedicated method
// (not the general "Explain" feature's explainSqlSub()/EXPLAIN_COLUMNS,
// which intentionally drops the NodeId/Parent columns this Provider needs
// to reconstruct the plan tree) - see SQLServerDriver.ts's doc comment on it.
export interface SQLServerPerformanceTuningDriverAccess {
  requestSql(params: QueryParams): Promise<ResultSetData>;
  collectPerformanceTuningShowplan(
    params: QueryParams,
    bindMarkers?: string[],
  ): Promise<ResultSetData>;
  collectPerformanceTuningActualPlan(
    params: QueryParams,
    bindMarkers?: string[],
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<ActualPlanArtifact>;
}

// SQL Server always has a real schema (unlike MySQL, where "schema" and
// "database" are the same thing) - 'dbo' is what an unqualified reference
// resolves to for the vast majority of connections, matching
// SQLServerDriver's own default-schema handling elsewhere
// (resetDefaultSchema() falls back through connection/user before 'public'
// for Postgres; SQL Server's actual equivalent fallback is 'dbo').
const targetSchemaOf = (target: { schemaName?: string }): string => target.schemaName ?? 'dbo';

export class SQLServerPerformanceTuningProvider implements PerformanceTuningContextProvider {
  constructor(private readonly driver: SQLServerPerformanceTuningDriverAccess) {}

  async checkCapabilities(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: PerformanceTuningAvailabilityParams,
  ): Promise<GeneralResult<PerformanceTuningCapabilities>> {
    // Read-only, static capability report - same contract as the other two
    // vendors' Providers (§7: never touches the DB; a per-table permission
    // gap still surfaces later as that table's own unavailableSections entry).
    const capabilities: PerformanceTuningCapabilities = {
      executionPlan: { available: true, source: 'SET SHOWPLAN_ALL ON' },
      analyzedExecutionPlan: {
        available: true,
        source: 'SET STATISTICS XML ON',
        requiredPermissions: ['SHOWPLAN permission', 'permission to execute the target SELECT'],
      },
      tableDefinition: { available: true, source: 'sys.columns / sys.indexes / sys.check_constraints' },
      optimizerStatistics: {
        available: true,
        source: 'sys.partitions / sys.allocation_units / sys.dm_db_stats_properties',
      },
      physicalHealth: {
        available: true,
        source: 'sys.dm_db_index_physical_stats (LIMITED mode)',
        message: 'Requires VIEW DATABASE STATE (or VIEW SERVER STATE) permission.',
      },
    };
    return { ok: true, message: '', result: capabilities };
  }

  async collectExecutionPlan(
    params: PerformanceTuningContextParams,
    options: PerformanceTuningCallOptions & { timeoutMs: number },
  ): Promise<GeneralResult<VendorExecutionPlan>> {
    // binds are used only to obtain a parameter-specific plan (§4.1); they
    // are never placed anywhere in the returned VendorExecutionPlan. Same
    // for bindMarkers (call-scoped only, per performance-tuning-query-
    // statistics-parameter-input-plan.ja.md §7.4/§8.1, db-notebook repo) -
    // needed so a named parameter (`@customerId`) substitutes correctly
    // instead of falling back to positional `@1`, `@2`, ... substitution.
    const binds = params.plan?.binds?.map((v) => String(v));
    const bindMarkers = params.plan?.bindMarkers;

    let rdh: ResultSetData;
    try {
      rdh = await this.driver.collectPerformanceTuningShowplan(
        {
          sql: params.statement.sql,
          conditions: { rawQueries: true, binds },
          meta: { type: 'performanceTuningContext' },
        },
        bindMarkers,
      );
    } catch (e) {
      // Same precedent as the other two vendors: a failed SHOWPLAN is an
      // expected, actionable failure, surfaced with detail.
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message: `Failed to retrieve the execution plan.${detail ? ` ${detail}` : ''}`,
      };
    }

    if (rdh.rows.length === 0) {
      return { ok: false, message: 'SHOWPLAN did not return any rows.' };
    }

    const rawRows = rdh.rows.map((r) => r.values);
    const diagnostics: NonNullable<VendorExecutionPlan['diagnostics']> = [];
    let planNode: VendorExecutionPlan['normalizedPlan'];
    let planTableMappings: VendorExecutionPlan['planTableMappings'] = [];
    try {
      const parsedPlan = parseSqlServerPlan(rawRows);
      planNode = parsedPlan.planNode;
      planTableMappings = parsedPlan.mappings;
      diagnostics.push(...parsedPlan.diagnostics);
    } catch {
      diagnostics.push(planUnresolvedDiagnostic());
    }

    let actualPlan: ActualPlanArtifact | undefined;
    if (params.plan?.mode === 'analyze') {
      try {
        actualPlan = await this.driver.collectPerformanceTuningActualPlan(
          {
            sql: params.statement.sql,
            conditions: { rawQueries: true, binds },
            meta: { type: 'performanceTuningContext' },
          },
          bindMarkers,
          options,
        );
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        return {
          ok: false,
          message: `Failed to retrieve the actual execution plan.${detail ? ` ${detail}` : ''}`,
        };
      }
    }

    // SET STATISTICS XML is a separately produced runtime tree, so do not
    // correlate it to SHOWPLAN_ALL by NodeId or tree position.  Its Object
    // elements carry the real table/alias/index identity, which permits a
    // conservative one-to-one match to the estimate mapping.  In addition
    // to actual output rows, SQL Server exposes ActualRowsRead for scans;
    // when present alongside a local Predicate it is the factual input for
    // the distinct access-fraction and filter-pass-rate measures.
    const actualPlanTableStats = actualPlan
      ? resolveSqlServerActualPlanTableStats(actualPlan.content, planTableMappings)
      : undefined;
    if (actualPlanTableStats && actualPlanTableStats.size > 0) {
      planTableMappings = planTableMappings.map((mapping) => {
        const stats = actualPlanTableStats.get(mapping.planNodeId);
        if (!stats) {
          return mapping;
        }
        return {
          ...mapping,
          indexName: stats.indexName ?? mapping.indexName,
          actualRows: stats.actualRows,
          rowEstimateRatio: computeRowEstimateRatio(mapping.estimatedRows, stats.actualRows),
          tableAccessRows:
            stats.tableAccessRows === undefined
              ? undefined
              : {
                  value: stats.tableAccessRows,
                  estimated: false,
                  source: 'SQL Server SET STATISTICS XML ActualRowsRead (per execution)',
                },
          predicateFilterInputRows:
            stats.predicateFilterInputRows === undefined
              ? undefined
              : {
                  value: stats.predicateFilterInputRows,
                  estimated: false,
                  source: 'SQL Server SET STATISTICS XML ActualRowsRead before local predicate (per execution)',
                },
          predicateFilterOutputRows:
            stats.predicateFilterOutputRows === undefined
              ? undefined
              : {
                  value: stats.predicateFilterOutputRows,
                  estimated: false,
                  source: 'SQL Server SET STATISTICS XML ActualRows after local predicate (per execution)',
                },
        };
      });
    }

    return {
      ok: true,
      message: '',
      result: {
        // SHOWPLAN_ALL has no single JSON document the way Postgres/MySQL's
        // EXPLAIN does - the flat rowset itself is the closest equivalent of
        // "the vendor's own plan output" (§5.2).
        raw: rawRows,
        normalizedPlan: planNode,
        // SET SHOWPLAN_ALL ON never executes the query - no timing available
        // (estimate mode only, same as the other two vendors).
        planningTimeMs: undefined,
        executionTimeMs: undefined,
        actualPlan,
        runtimeObservations: actualPlan ? extractSqlServerRuntimeObservations(actualPlan.content) : undefined,
        diagnostics,
        planTableMappings,
      },
    };
  }

  // Same rationale as the other two Providers' runCatalogQuery(): an
  // ordinary sys.*/information_schema error (permission denied, ...) gets a
  // *detailed* message, since it's an expected/actionable failure, not the
  // generic message RDSBaseDriver's exception boundary uses for genuine bugs.
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
    const binds = [targetSchemaOf(target), target.tableName];

    const [columnsResult, constraintsResult, foreignKeysResult, checkConstraintsResult, indexesResult] =
      await Promise.all([
        this.runCatalogQuery(COLUMNS_SQL, binds, 'columns'),
        this.runCatalogQuery(CONSTRAINTS_SQL, binds, 'constraints'),
        this.runCatalogQuery(FOREIGN_KEYS_SQL, binds, 'foreign keys'),
        this.runCatalogQuery(CHECK_CONSTRAINTS_SQL, binds, 'check constraints'),
        this.runCatalogQuery(INDEXES_SQL, binds, 'indexes'),
      ]);

    if (!columnsResult.ok) {
      return { ok: false, message: columnsResult.message };
    }

    const columns: ColumnDefinition[] = mapSqlServerColumnRows(
      columnsResult.result?.rows.map((r) => r.values) ?? [],
    );
    const constraints: ConstraintDefinition[] = mapSqlServerConstraintRows([
      ...(constraintsResult.ok ? (constraintsResult.result?.rows.map((r) => r.values) ?? []) : []),
      ...(foreignKeysResult.ok ? (foreignKeysResult.result?.rows.map((r) => r.values) ?? []) : []),
    ]).concat(
      checkConstraintsResult.ok
        ? mapSqlServerCheckConstraintRows(checkConstraintsResult.result?.rows.map((r) => r.values) ?? [])
        : [],
    );
    const indexes: IndexDefinition[] = indexesResult.ok
      ? mapSqlServerIndexRows(indexesResult.result?.rows.map((r) => r.values) ?? [])
      : [];

    const warnings: string[] = [];
    if (!constraintsResult.ok) {
      warnings.push(constraintsResult.message);
    }
    if (!foreignKeysResult.ok) {
      warnings.push(foreignKeysResult.message);
    }
    if (!checkConstraintsResult.ok) {
      warnings.push(checkConstraintsResult.message);
    }
    if (!indexesResult.ok) {
      warnings.push(indexesResult.message);
    }

    if (columns.length === 0) {
      return {
        ok: false,
        message: `Table ${target.schemaName ? `${target.schemaName}.` : ''}${target.tableName} was not found (or is not visible to this connection).`,
      };
    }

    const ddl = renderSqlServerTableDdl({
      schemaName: target.schemaName,
      tableName: target.tableName,
      columns,
      constraints,
      indexes,
    });

    return {
      ok: true,
      message: warnings.join(' '),
      result: { ddl, columns, constraints, indexes },
    };
  }

  async collectTableStatistics(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorTableStatistics>> {
    const binds = [targetSchemaOf(target), target.tableName];
    const [sizeResult, statsResult] = await Promise.all([
      this.runCatalogQuery(TABLE_SIZE_SQL, binds, 'table statistics'),
      this.runCatalogQuery(STATS_SQL, binds, 'table statistics'),
    ]);
    if (!sizeResult.ok) {
      return { ok: false, message: sizeResult.message };
    }
    const mapped = mapSqlServerTableStatisticsRow(
      sizeResult.result?.rows[0]?.values,
      statsResult.ok ? statsResult.result?.rows[0]?.values : undefined,
    );
    if (!mapped) {
      return {
        ok: false,
        message: `Table ${target.schemaName ? `${target.schemaName}.` : ''}${target.tableName} was not found (or is not visible to this connection).`,
      };
    }
    return {
      ok: true,
      message: statsResult.ok ? '' : statsResult.message,
      result: mapped,
    };
  }

  async collectColumnStatistics(
    target: PerformanceTuningTableTarget & { columnNames: string[] },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorColumnStatistics[]>> {
    if (target.columnNames.length === 0) {
      return { ok: true, message: '', result: [] };
    }
    const schema = targetSchemaOf(target);

    // Step 1: resolve, per requested column, the statistics object where
    // that column is the *leading* key (sc.stats_column_id = 1) - preferring
    // whichever has the fewest columns (a single-column stat over a
    // composite index's auto-created one), same rationale as
    // mysqlCatalogMapper's SEQ_IN_INDEX = 1 restriction. A column with no
    // such statistics object (never indexed/never explicitly stat'd) simply
    // has no row here - handled below by mapSqlServerColumnStatisticsRow()
    // returning an all-undefined shape for it, not a failure.
    const placeholders = target.columnNames.map((_, i) => `@${i + 3}`).join(', ');
    const lookupSql = STATS_COLUMN_LOOKUP_SQL.replace('$COLUMN_PLACEHOLDERS', placeholders);
    const lookupResult = await this.runCatalogQuery(
      lookupSql,
      [schema, target.tableName, ...target.columnNames],
      'column statistics',
    );
    if (!lookupResult.ok) {
      return { ok: false, message: lookupResult.message };
    }

    const bestByColumn = new Map<string, number>();
    const bestColumnCount = new Map<string, number>();
    for (const row of lookupResult.result?.rows ?? []) {
      const columnName = row.values.column_name as string | undefined;
      const statsId = row.values.stats_id as number | undefined;
      const columnCount = row.values.column_count as number | undefined;
      if (!columnName || statsId === undefined || columnCount === undefined) {
        continue;
      }
      const existingCount = bestColumnCount.get(columnName);
      if (existingCount === undefined || columnCount < existingCount) {
        bestByColumn.set(columnName, statsId);
        bestColumnCount.set(columnName, columnCount);
      }
    }

    // Step 2: for each resolved statistics object, read its histogram +
    // properties - one small round trip per distinct stats_id (bounded by
    // columnNames.length, itself already clamped by maxColumnsPerTable
    // upstream), same "several small queries, never a full-schema scan"
    // shape as the other two vendors' collectColumnStatistics().
    const warnings: string[] = [];
    const dataByColumn = new Map<string, { histogramRows: unknown[]; propsRow: unknown }>();
    await Promise.all(
      [...bestByColumn.entries()].map(async ([columnName, statsId]) => {
        // QueryConditions.binds is typed `string[]` (this driver's binds go
        // through node-mssql's own req.input(), which parses a numeric
        // string bind back into an int parameter fine - same convention
        // Postgres/MySQL's Providers already follow for their own binds).
        const binds = [schema, target.tableName, String(statsId)];
        const [histResult, propsResult] = await Promise.all([
          this.runCatalogQuery(HISTOGRAM_SQL, binds, 'column histogram statistics'),
          this.runCatalogQuery(STATS_PROPERTIES_SQL, binds, 'column statistics properties'),
        ]);
        if (!histResult.ok) {
          warnings.push(histResult.message);
          return;
        }
        if (!propsResult.ok) {
          warnings.push(propsResult.message);
        }
        dataByColumn.set(columnName, {
          histogramRows: histResult.result?.rows.map((r) => r.values) ?? [],
          propsRow: propsResult.ok ? propsResult.result?.rows[0]?.values : undefined,
        });
      }),
    );

    return {
      ok: true,
      message: warnings.join(' '),
      result: target.columnNames.map((columnName) =>
        mapSqlServerColumnStatisticsRow(columnName, dataByColumn.get(columnName)),
      ),
    };
  }

  async collectPhysicalHealth(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorPhysicalHealth>> {
    const binds = [targetSchemaOf(target), target.tableName];
    const [physicalResult, statsResult] = await Promise.all([
      this.runCatalogQuery(PHYSICAL_HEALTH_SQL, binds, 'physical health'),
      this.runCatalogQuery(STATS_SQL, binds, 'physical health'),
    ]);
    if (!physicalResult.ok) {
      return { ok: false, message: physicalResult.message };
    }
    return {
      ok: true,
      message: statsResult.ok ? '' : statsResult.message,
      result: mapSqlServerPhysicalHealthRow(
        physicalResult.result?.rows[0]?.values,
        statsResult.ok ? statsResult.result?.rows[0]?.values : undefined,
      ),
    };
  }
}

const COLUMNS_SQL = `
SELECT
  c.name AS name,
  ty.name AS data_type,
  CASE
    WHEN ty.name IN ('varchar','char','varbinary','binary') THEN
      ty.name + '(' + CASE WHEN c.max_length = -1 THEN 'max' ELSE CAST(c.max_length AS varchar(10)) END + ')'
    WHEN ty.name IN ('nvarchar','nchar') THEN
      ty.name + '(' + CASE WHEN c.max_length = -1 THEN 'max' ELSE CAST(c.max_length/2 AS varchar(10)) END + ')'
    WHEN ty.name IN ('decimal','numeric') THEN
      ty.name + '(' + CAST(c.precision AS varchar(10)) + ',' + CAST(c.scale AS varchar(10)) + ')'
    WHEN ty.name IN ('datetime2','time','datetimeoffset') THEN
      ty.name + '(' + CAST(c.scale AS varchar(10)) + ')'
    ELSE ty.name
  END AS column_type,
  c.is_nullable AS is_nullable,
  dc.definition AS column_default,
  c.column_id AS ordinal_position,
  CAST(ep.value AS nvarchar(max)) AS comment
FROM sys.columns c
JOIN sys.tables t ON t.object_id = c.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.object_id = c.default_object_id
LEFT JOIN sys.extended_properties ep
  ON ep.major_id = c.object_id AND ep.minor_id = c.column_id AND ep.name = 'MS_Description'
WHERE t.name = @2 AND s.name = @1
ORDER BY c.column_id`;

// One row per (constraint, column); grouped with FOREIGN_KEYS_SQL's rows by
// mapSqlServerConstraintRows(). referenced_schema/referenced_table/
// referenced_column are always NULL here - PRIMARY KEY/UNIQUE never
// reference another table.
const CONSTRAINTS_SQL = `
SELECT
  kc.name AS constraint_name,
  CASE kc.type WHEN 'PK' THEN 'PRIMARY KEY' ELSE 'UNIQUE' END AS constraint_type,
  c.name AS column_name,
  ic.key_ordinal AS ordinal_position,
  NULL AS referenced_schema,
  NULL AS referenced_table,
  NULL AS referenced_column
FROM sys.key_constraints kc
JOIN sys.tables t ON t.object_id = kc.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE t.name = @2 AND s.name = @1
ORDER BY kc.name, ic.key_ordinal`;

const FOREIGN_KEYS_SQL = `
SELECT
  fk.name AS constraint_name,
  'FOREIGN KEY' AS constraint_type,
  pc.name AS column_name,
  fc.constraint_column_id AS ordinal_position,
  rs.name AS referenced_schema,
  rt.name AS referenced_table,
  rc.name AS referenced_column
FROM sys.foreign_keys fk
JOIN sys.tables t ON t.object_id = fk.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.foreign_key_columns fc ON fc.constraint_object_id = fk.object_id
JOIN sys.columns pc ON pc.object_id = fc.parent_object_id AND pc.column_id = fc.parent_column_id
JOIN sys.tables rt ON rt.object_id = fk.referenced_object_id
JOIN sys.schemas rs ON rs.schema_id = rt.schema_id
JOIN sys.columns rc ON rc.object_id = fc.referenced_object_id AND rc.column_id = fc.referenced_column_id
WHERE t.name = @2 AND s.name = @1
ORDER BY fk.name, fc.constraint_column_id`;

// A separate query: sys.check_constraints carries no column list at all
// (same shape as MySQL's CHECK_CONSTRAINTS).
const CHECK_CONSTRAINTS_SQL = `
SELECT cc.name AS constraint_name, cc.definition AS check_clause
FROM sys.check_constraints cc
JOIN sys.tables t ON t.object_id = cc.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.name = @2 AND s.name = @1`;

// One row per (index, column); grouped in JS by mapSqlServerIndexRows(),
// which splits key columns (is_included = 0) from INCLUDE columns
// (is_included = 1). i.name IS NOT NULL excludes the implicit unnamed heap
// "index" (index_id = 0) a table without a clustered index otherwise has.
const INDEXES_SQL = `
SELECT
  i.name AS index_name,
  i.is_unique AS is_unique,
  i.is_primary_key AS is_primary,
  i.type_desc AS index_type,
  i.filter_definition AS predicate,
  ic.key_ordinal AS seq_in_index,
  ic.is_included_column AS is_included,
  ic.is_descending_key AS is_descending,
  ic.index_column_id AS column_id,
  c.name AS column_name
FROM sys.indexes i
JOIN sys.tables t ON t.object_id = i.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE t.name = @2 AND s.name = @1 AND i.name IS NOT NULL
ORDER BY i.name, ic.is_included_column, ic.key_ordinal`;

// Row count/byte sizes via sys.partitions/sys.allocation_units - the same
// catalog join sp_spaceused uses internally. Only IN_ROW_DATA/
// ROW_OVERFLOW_DATA allocation units are counted (a.container_id =
// p.partition_id); LOB_DATA (a large [n]varchar(max)/varbinary(max) column
// stored off-row) is not, so this can undercount a table with large LOB
// columns - an accepted approximation, same spirit as Postgres/MySQL's own
// documented size-estimate caveats (§8 注意事項).
const TABLE_SIZE_SQL = `
SELECT
  SUM(CASE WHEN i.index_id IN (0,1) THEN p.rows ELSE 0 END) AS row_count,
  SUM(CASE WHEN i.index_id IN (0,1) THEN a.used_pages ELSE 0 END) * 8192 AS table_bytes,
  SUM(CASE WHEN i.index_id > 1 THEN a.used_pages ELSE 0 END) * 8192 AS index_bytes,
  SUM(a.used_pages) * 8192 AS total_bytes
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.indexes i ON i.object_id = t.object_id
JOIN sys.partitions p ON p.object_id = i.object_id AND p.index_id = i.index_id
JOIN sys.allocation_units a ON a.container_id = p.partition_id
WHERE t.name = @2 AND s.name = @1`;

// Aggregated across every statistics object on the table (the PK/clustered
// index's auto-created stats plus one per nonclustered index/column stat) -
// MAX(...) for both columns, not one arbitrary stat's own values, so a
// table with several indexes doesn't misreport "unanalyzed" just because
// one particular stat object happens to be older. modification_counter is
// specifically MAX(...), not SUM(...): it's tracked per leading column, so
// a single multi-column UPDATE bumps more than one stat object's counter
// at once - summing them would multi-count that one UPDATE once per stat
// object it happens to touch. MAX still can't perfectly reconstruct "how
// many rows changed" (no stat is guaranteed to cover every modified
// column), but unlike SUM it never inflates beyond what any single real
// stat object observed.
const STATS_SQL = `
SELECT MAX(sp.last_updated) AS last_updated, MAX(sp.modification_counter) AS modification_counter
FROM sys.stats st
CROSS APPLY sys.dm_db_stats_properties(st.object_id, st.stats_id) sp
WHERE st.object_id = OBJECT_ID(QUOTENAME(@1) + '.' + QUOTENAME(@2))`;

// 'LIMITED' mode (page-count/fragmentation from existing metadata, no table
// scan) rather than 'DETAILED' - §9.3's "never a full-schema/heavy scan"
// applies here too. Scoped to index_id IN (0,1) (heap/clustered) only, the
// table-level equivalent of Postgres's pg_stat_user_tables row - a
// nonclustered index's own fragmentation isn't surfaced separately here.
const PHYSICAL_HEALTH_SQL = `
SELECT avg_fragmentation_in_percent, page_count
FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID(QUOTENAME(@1) + '.' + QUOTENAME(@2)), NULL, NULL, 'LIMITED')
WHERE index_id IN (0,1)`;

// Step 1 of collectColumnStatistics(): for each requested column
// ($COLUMN_PLACEHOLDERS, substituted with `@3, @4, ...`), every statistics
// object where that column is the *leading* key (stats_column_id = 1),
// plus how many columns that stat covers in total - the Provider picks the
// smallest (a single-column stat over a composite index's auto-created one).
const STATS_COLUMN_LOOKUP_SQL = `
SELECT
  c.name AS column_name,
  sc.stats_id AS stats_id,
  (SELECT COUNT(*) FROM sys.stats_columns sc2 WHERE sc2.object_id = sc.object_id AND sc2.stats_id = sc.stats_id) AS column_count
FROM sys.stats_columns sc
JOIN sys.columns c ON c.object_id = sc.object_id AND c.column_id = sc.column_id
JOIN sys.tables t ON t.object_id = sc.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE t.name = @2 AND s.name = @1 AND sc.stats_column_id = 1
  AND c.name IN ($COLUMN_PLACEHOLDERS)`;

// Step 2: histogram steps / last-updated+modification-count for one
// specific stats_id (@3, resolved by STATS_COLUMN_LOOKUP_SQL above) -
// sys.dm_db_stats_histogram()/sys.dm_db_stats_properties() are SQL Server
// 2016 SP1+ DMFs, the only place this per-column data is ever exposed.
const HISTOGRAM_SQL = `
SELECT step_number, equal_rows, distinct_range_rows
FROM sys.dm_db_stats_histogram(OBJECT_ID(QUOTENAME(@1) + '.' + QUOTENAME(@2)), @3)`;

const STATS_PROPERTIES_SQL = `
SELECT last_updated, modification_counter
FROM sys.dm_db_stats_properties(OBJECT_ID(QUOTENAME(@1) + '.' + QUOTENAME(@2)), @3)`;
