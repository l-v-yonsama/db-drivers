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
  mapMysqlCheckConstraintRows,
  mapMysqlColumnRows,
  mapMysqlColumnStatisticsRow,
  mapMysqlConstraintRows,
  mapMysqlIndexRows,
  mapMysqlPhysicalHealthRow,
  mapMysqlTableStatisticsRow,
} from './mysqlCatalogMapper';
import { resolveMysqlActualPlanTableStats } from './mysqlActualPlanTextParser';
import { parseMysqlPlan } from './mysqlPlanParser';
import { planUnresolvedDiagnostic } from './performanceTuningDiagnosticHelpers';
import { applyActualPlanTableStats } from './planNodeMath';
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

export interface MySQLPerformanceTuningDriverAccess {
  requestSql(params: QueryParams): Promise<ResultSetData>;
  getTableDDL(params: { tableName: string; schemaName?: string }): Promise<string>;
}

// MySQL has no separate schema-vs-database concept the way Postgres does - a "database" *is* the schema information_schema queries key on (TABLE_SCHEMA).
const targetSchemaOf = (target: { databaseName: string; schemaName?: string }): string =>
  target.schemaName ?? target.databaseName;

export class MySQLPerformanceTuningProvider implements PerformanceTuningContextProvider {
  constructor(private readonly driver: MySQLPerformanceTuningDriverAccess) {}

  async checkCapabilities(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: PerformanceTuningAvailabilityParams,
  ): Promise<GeneralResult<PerformanceTuningCapabilities>> {
    const capabilities: PerformanceTuningCapabilities = {
      executionPlan: { available: true, source: 'EXPLAIN FORMAT=JSON' },
      analyzedExecutionPlan: {
        available: true,
        // MySQL has no EXPLAIN ANALYZE FORMAT=JSON, so this is the real EXPLAIN ANALYZE tree text, unparsed, alongside the (always collected) EXPLAIN FORMAT=JSON plan the rest of this Provider resolves tables/diagnostics from.
        source: 'EXPLAIN ANALYZE (tree text, unparsed)',
      },
      tableDefinition: { available: true, source: 'information_schema / SHOW CREATE TABLE' },
      optimizerStatistics: {
        available: true,
        source: 'information_schema.TABLES / STATISTICS / COLUMN_STATISTICS',
        message:
          'Column-level histogram statistics require an explicit ANALYZE TABLE ... UPDATE HISTOGRAM and are commonly absent; STATISTICS.CARDINALITY is used as a fallback for indexed columns.',
      },
      physicalHealth: { available: true, source: 'information_schema.TABLES' },
    };
    return { ok: true, message: '', result: capabilities };
  }

  async collectExecutionPlan(
    params: PerformanceTuningContextParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCallOptions & { timeoutMs: number },
  ): Promise<GeneralResult<VendorExecutionPlan>> {
    const binds = params.plan?.binds?.map((v) => String(v));

    let rdh: ResultSetData;
    try {
      rdh = await this.driver.requestSql({
        sql: `EXPLAIN FORMAT=JSON ${params.statement.sql}`,
        conditions: { rawQueries: true, binds },
        meta: { type: 'performanceTuningContext' },
      });
    } catch (e) {
      // Same precedent as PostgresPerformanceTuningProvider: a failed EXPLAIN is an expected, actionable failure, surfaced with detail.
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message: `Failed to retrieve the execution plan.${detail ? ` ${detail}` : ''}`,
      };
    }

    const rawValue = rdh.rows[0]?.values?.EXPLAIN;
    if (rawValue === undefined) {
      return { ok: false, message: 'EXPLAIN did not return an EXPLAIN result.' };
    }

    let parsed: unknown;
    try {
      parsed = typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
    } catch {
      return { ok: false, message: 'Failed to parse the EXPLAIN JSON output.' };
    }

    // Unlike Postgres's `EXPLAIN (FORMAT JSON)` (which wraps its single result in an array), MySQL's `EXPLAIN FORMAT=JSON` returns the `{ query_block: {...} }` object directly - `parsed` already *is* the explain root, no unwrapping needed.
    const diagnostics: NonNullable<VendorExecutionPlan['diagnostics']> = [];
    let planNode: VendorExecutionPlan['normalizedPlan'];
    let planTableMappings: VendorExecutionPlan['planTableMappings'] = [];
    try {
      const parsedPlan = parseMysqlPlan(parsed);
      planNode = parsedPlan.planNode;
      planTableMappings = parsedPlan.mappings;
      diagnostics.push(...parsedPlan.diagnostics);
    } catch {
      diagnostics.push(planUnresolvedDiagnostic());
    }

    // Analyze mode: MySQL has no EXPLAIN ANALYZE FORMAT=JSON (confirmed empirically - it errors with "doesn't yet support 'EXPLAIN ANALYZE with JSON format'"), so a second, separate query captures the real EXPLAIN ANALYZE tree text as-is rather than normalizing it into PlanNode.
    let actualPlanText: string | undefined;
    if (params.plan?.mode === 'analyze') {
      let analyzeRdh: ResultSetData;
      try {
        analyzeRdh = await this.driver.requestSql({
          sql: `EXPLAIN ANALYZE ${params.statement.sql}`,
          conditions: { rawQueries: true, binds },
          meta: { type: 'performanceTuningContext' },
        });
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        return {
          ok: false,
          message: `Failed to retrieve the analyzed execution plan.${detail ? ` ${detail}` : ''}`,
        };
      }
      const analyzeValue = analyzeRdh.rows[0]?.values?.EXPLAIN;
      actualPlanText = typeof analyzeValue === 'string' ? analyzeValue : undefined;
    }

    // Match text-plan runtime evidence to estimate mappings by table identity, never by the independent trees' positions.
    const actualPlanTableStats = actualPlanText
      ? resolveMysqlActualPlanTableStats(actualPlanText, planTableMappings)
      : undefined;
    const mysqlActualStatsByPlanNodeId = new Map(
      Array.from(actualPlanTableStats?.actualRowsByPlanNodeId ?? []).map(([planNodeId, actualRows]) => {
        const filterRows = actualPlanTableStats?.predicateFilterRowsByPlanNodeId.get(planNodeId);
        return [
          planNodeId,
          {
            actualRows,
            tableAccessRows: actualRows,
            predicateFilterInputRows: filterRows?.inputRows,
            predicateFilterOutputRows: filterRows?.outputRows,
          },
        ] as const;
      }),
    );
    const planTableMappingsWithActualRows = applyActualPlanTableStats(
      planTableMappings,
      mysqlActualStatsByPlanNodeId,
      {
        tableAccessRows: 'MySQL EXPLAIN ANALYZE table-access rows (per loop)',
        predicateFilterInputRows: 'MySQL EXPLAIN ANALYZE child table-access rows (per loop)',
        predicateFilterOutputRows: 'MySQL EXPLAIN ANALYZE Filter rows (per loop)',
      },
    );

    return {
      ok: true,
      message: '',
      result: {
        raw: parsed,
        normalizedPlan: planNode,
        // MySQL's EXPLAIN FORMAT=JSON never includes timing - it doesn't execute the query.
        planningTimeMs: undefined,
        executionTimeMs: undefined,
        actualPlan: actualPlanText
          ? { source: 'EXPLAIN ANALYZE', format: 'text', content: actualPlanText }
          : undefined,
        // `undefined` when nothing resolves - RDSBaseDriver falls back to the generic, estimated-cost-based walk in that case.
        dominantCostPlanNode: actualPlanTableStats?.dominantCostPlanNode,
        diagnostics,
        planTableMappings: planTableMappingsWithActualRows,
      },
    };
  }

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

  // getTableDDL() throws rather than returning a GeneralResult - wrapped into one here (rather than a bespoke ok/text-or-message union) so its failure can be downgraded to a warning in collectTableDefinition() instead of failing the whole call.
  private async collectDdl(target: PerformanceTuningTableTarget): Promise<GeneralResult<string>> {
    try {
      const text = await this.driver.getTableDDL({
        tableName: target.tableName,
        schemaName: targetSchemaOf(target),
      });
      return { ok: true, message: '', result: text };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : String(e) };
    }
  }

  async collectTableDefinition(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorTableDefinition>> {
    const schema = targetSchemaOf(target);
    const binds = [schema, target.tableName];

    const [columnsResult, constraintsResult, checkConstraintsResult, indexesResult, ddl] =
      await Promise.all([
        this.runCatalogQuery(COLUMNS_SQL, binds, 'columns'),
        this.runCatalogQuery(CONSTRAINTS_SQL, binds, 'constraints'),
        this.runCatalogQuery(CHECK_CONSTRAINTS_SQL, binds, 'check constraints'),
        this.runCatalogQuery(INDEXES_SQL, binds, 'indexes'),
        // getTableDDL() throws rather than returning a GeneralResult - a failure here is downgraded to a warning below, same as the other secondary sections, rather than failing the whole call.
        this.collectDdl(target),
      ]);

    if (!columnsResult.ok) {
      return { ok: false, message: columnsResult.message };
    }

    const columns: ColumnDefinition[] = mapMysqlColumnRows(
      columnsResult.result?.rows.map((r) => r.values) ?? [],
    );
    const constraints: ConstraintDefinition[] = [
      ...(constraintsResult.ok
        ? mapMysqlConstraintRows(constraintsResult.result?.rows.map((r) => r.values) ?? [])
        : []),
      ...(checkConstraintsResult.ok
        ? mapMysqlCheckConstraintRows(checkConstraintsResult.result?.rows.map((r) => r.values) ?? [])
        : []),
    ];
    const indexes: IndexDefinition[] = indexesResult.ok
      ? mapMysqlIndexRows(indexesResult.result?.rows.map((r) => r.values) ?? [])
      : [];

    const warnings: string[] = [];
    if (!constraintsResult.ok) {
      warnings.push(constraintsResult.message);
    }
    if (!checkConstraintsResult.ok) {
      warnings.push(checkConstraintsResult.message);
    }
    if (!indexesResult.ok) {
      warnings.push(indexesResult.message);
    }
    if (!ddl.ok) {
      warnings.push(`Failed to collect ddl for this table.${ddl.message ? ` ${ddl.message}` : ''}`);
    }

    if (columns.length === 0) {
      return {
        ok: false,
        message: `Table ${target.schemaName ? `${target.schemaName}.` : ''}${target.tableName} was not found (or is not visible to this connection).`,
      };
    }

    return {
      ok: true,
      message: warnings.join(' '),
      result: { ddl: ddl.ok ? ddl.result : undefined, columns, constraints, indexes },
    };
  }

  async collectTableStatistics(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorTableStatistics>> {
    const result = await this.runCatalogQuery(
      TABLE_STATISTICS_SQL,
      [targetSchemaOf(target), target.tableName],
      'table statistics',
    );
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    const mapped = mapMysqlTableStatisticsRow(result.result?.rows[0]?.values);
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
    const schema = targetSchemaOf(target);
    const placeholders = target.columnNames.map(() => '?').join(', ');
    const binds = [schema, target.tableName, ...target.columnNames];

    const [cardinalityResult, histogramResult] = await Promise.all([
      this.runCatalogQuery(
        CARDINALITY_SQL.replace('$COLUMN_PLACEHOLDERS', placeholders),
        binds,
        'column cardinality',
      ),
      this.runCatalogQuery(
        HISTOGRAM_SQL.replace('$COLUMN_PLACEHOLDERS', placeholders),
        binds,
        'column histogram statistics',
      ),
    ]);
    if (!cardinalityResult.ok) {
      return { ok: false, message: cardinalityResult.message };
    }

    const cardinalityByColumn = new Map<string, unknown>();
    for (const row of cardinalityResult.result?.rows ?? []) {
      const name = row.values.column_name as string | undefined;
      if (name) {
        cardinalityByColumn.set(name, row.values);
      }
    }
    const histogramByColumn = new Map<string, unknown>();
    if (histogramResult.ok) {
      for (const row of histogramResult.result?.rows ?? []) {
        const name = row.values.column_name as string | undefined;
        if (name) {
          histogramByColumn.set(name, row.values);
        }
      }
    }

    return {
      ok: true,
      message: histogramResult.ok ? '' : histogramResult.message,
      result: target.columnNames.map((columnName) =>
        mapMysqlColumnStatisticsRow(
          columnName,
          cardinalityByColumn.get(columnName),
          histogramByColumn.get(columnName),
        ),
      ),
    };
  }

  async collectPhysicalHealth(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorPhysicalHealth>> {
    const result = await this.runCatalogQuery(
      TABLE_STATISTICS_SQL,
      [targetSchemaOf(target), target.tableName],
      'physical health',
    );
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    return { ok: true, message: '', result: mapMysqlPhysicalHealthRow(result.result?.rows[0]?.values) };
  }
}

const COLUMNS_SQL = `
SELECT
  COLUMN_NAME AS name,
  DATA_TYPE AS data_type,
  COLUMN_TYPE AS column_type,
  IS_NULLABLE AS is_nullable,
  COLUMN_DEFAULT AS column_default,
  ORDINAL_POSITION AS ordinal_position,
  COLUMN_COMMENT AS comment
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
ORDER BY ORDINAL_POSITION`;

// One row per (constraint, column); grouped in JS by mapMysqlConstraintRows().
const CONSTRAINTS_SQL = `
SELECT
  tc.CONSTRAINT_NAME AS constraint_name,
  tc.CONSTRAINT_TYPE AS constraint_type,
  kcu.COLUMN_NAME AS column_name,
  kcu.ORDINAL_POSITION AS ordinal_position,
  kcu.REFERENCED_TABLE_SCHEMA AS referenced_schema,
  kcu.REFERENCED_TABLE_NAME AS referenced_table,
  kcu.REFERENCED_COLUMN_NAME AS referenced_column
FROM information_schema.TABLE_CONSTRAINTS tc
JOIN information_schema.KEY_COLUMN_USAGE kcu
  ON kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
  AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
  AND kcu.TABLE_NAME = tc.TABLE_NAME
WHERE tc.TABLE_SCHEMA = ? AND tc.TABLE_NAME = ?
  AND tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
ORDER BY tc.CONSTRAINT_NAME, kcu.ORDINAL_POSITION`;

// A separate query: CHECK_CONSTRAINTS carries no column list at all (MySQL enforces a CHECK as a single boolean expression, not a column-scoped object the way PK/UK/FK are).
const CHECK_CONSTRAINTS_SQL = `
SELECT cc.CONSTRAINT_NAME AS constraint_name, cc.CHECK_CLAUSE AS check_clause
FROM information_schema.CHECK_CONSTRAINTS cc
JOIN information_schema.TABLE_CONSTRAINTS tc
  ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
WHERE cc.CONSTRAINT_SCHEMA = ? AND tc.TABLE_NAME = ?`;

// One row per (index, column); grouped in JS by mapMysqlIndexRows().
const INDEXES_SQL = `
SELECT
  INDEX_NAME AS index_name,
  NON_UNIQUE AS non_unique,
  SEQ_IN_INDEX AS seq_in_index,
  COLUMN_NAME AS column_name,
  EXPRESSION AS expression,
  COLLATION AS collation,
  INDEX_TYPE AS index_type
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
ORDER BY INDEX_NAME, SEQ_IN_INDEX`;

const TABLE_STATISTICS_SQL = `
SELECT TABLE_ROWS AS table_rows, DATA_LENGTH AS data_length, INDEX_LENGTH AS index_length,
  DATA_FREE AS data_free, UPDATE_TIME AS update_time
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`;

// Only SEQ_IN_INDEX = 1: a column's cardinality is only meaningful as "distinct values of this column alone" when it's the leading key part of some index - see mapMysqlColumnStatisticsRow()'s doc comment.
const CARDINALITY_SQL = `
SELECT COLUMN_NAME AS column_name, CARDINALITY AS cardinality
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND SEQ_IN_INDEX = 1
  AND COLUMN_NAME IN ($COLUMN_PLACEHOLDERS)`;

const HISTOGRAM_SQL = `
SELECT COLUMN_NAME AS column_name, HISTOGRAM AS histogram
FROM information_schema.COLUMN_STATISTICS
WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?
  AND COLUMN_NAME IN ($COLUMN_PLACEHOLDERS)`;
