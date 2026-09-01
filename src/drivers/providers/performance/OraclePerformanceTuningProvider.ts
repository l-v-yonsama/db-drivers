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
import {
  mapOracleCheckConstraintRows,
  mapOracleColumnRows,
  mapOracleColumnStatisticsRow,
  mapOracleConstraintRows,
  mapOracleIndexRows,
  mapOraclePhysicalHealthRow,
  mapOracleTableStatisticsRow,
} from './oracleCatalogMapper';
import { extractOracleRuntimeObservations, resolveOracleActualPlanTableStats } from './oracleActualPlanTextParser';
import { findUnresolvedIndexOnlyAccessKeys, OracleIndexTableKey, parseOraclePlan } from './oraclePlanParser';
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

// Narrow, structural view of OracleDriver - just what this Provider needs, same rationale as the other three vendors' Providers: unit-testable with a stub, and can't reach past this into connect/disconnect/transactions/UI.
export interface OraclePerformanceTuningDriverAccess {
  requestSql(params: QueryParams): Promise<ResultSetData>;
  getTableDDL(params: { tableName: string; schemaName?: string }): Promise<string>;
  collectPerformanceTuningPlanRows(params: QueryParams): Promise<ResultSetData>;
  collectPerformanceTuningActualPlan(
    params: QueryParams,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<ActualPlanArtifact>;
  getCurrentSchema(): Promise<string>;
}

export class OraclePerformanceTuningProvider implements PerformanceTuningContextProvider {
  constructor(private readonly driver: OraclePerformanceTuningDriverAccess) {}

  private async targetSchemaOf(target: { schemaName?: string }): Promise<string> {
    return target.schemaName ?? (await this.driver.getCurrentSchema());
  }

  async checkCapabilities(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params: PerformanceTuningAvailabilityParams,
  ): Promise<GeneralResult<PerformanceTuningCapabilities>> {
    const capabilities: PerformanceTuningCapabilities = {
      executionPlan: { available: true, source: 'EXPLAIN PLAN / PLAN_TABLE' },
      analyzedExecutionPlan: {
        available: true,
        source: 'DBMS_XPLAN.DISPLAY_CURSOR(..., ALLSTATS LAST)',
        requiredPermissions: [
          'permission to execute the target SELECT',
          'SELECT on V$PARAMETER and V$SESSION',
          'access required by DBMS_XPLAN.DISPLAY_CURSOR',
        ],
      },
      tableDefinition: { available: true, source: 'ALL_TAB_COLUMNS / ALL_CONSTRAINTS / ALL_INDEXES' },
      optimizerStatistics: { available: true, source: 'ALL_TABLES / ALL_TAB_COL_STATISTICS / ALL_TAB_MODIFICATIONS' },
      physicalHealth: {
        available: true,
        source: 'ALL_TABLES.CHAIN_CNT',
        message: 'CHAIN_CNT is only refreshed by legacy ANALYZE, not DBMS_STATS.GATHER_TABLE_STATS.',
      },
    };
    return { ok: true, message: '', result: capabilities };
  }

  // Resolves {owner, indexName} pairs findUnresolvedIndexOnlyAccessKeys() found in the raw plan rows to their real {schemaName, tableName} via ALL_INDEXES, batched into one query per distinct owner (almost always exactly one - a plan touching indexes across several schemas is rare).
  private async resolveIndexOnlyAccessTables(
    keys: OracleIndexTableKey[],
  ): Promise<Map<string, { schemaName: string; tableName: string }>> {
    const resolutions = new Map<string, { schemaName: string; tableName: string }>();
    const indexNamesByOwner = new Map<string, string[]>();
    for (const { owner, indexName } of keys) {
      const list = indexNamesByOwner.get(owner) ?? [];
      list.push(indexName);
      indexNamesByOwner.set(owner, list);
    }

    await Promise.all(
      [...indexNamesByOwner.entries()].map(async ([owner, indexNames]) => {
        const placeholders = indexNames.map((_, i) => `:${i + 2}`).join(', ');
        const sql = INDEX_TABLE_LOOKUP_SQL.replace('$INDEX_NAME_PLACEHOLDERS', placeholders);
        try {
          const rdh = await this.driver.requestSql({
            sql,
            conditions: { rawQueries: true, binds: [owner, ...indexNames] },
            meta: { type: 'performanceTuningContext' },
          });
          for (const row of rdh.rows) {
            // Oracle folds every unquoted `AS alias` to uppercase - see oracleCatalogMapper.ts's module doc comment.
            const indexName = row.values.INDEX_NAME as string | undefined;
            const tableName = row.values.TABLE_NAME as string | undefined;
            const tableOwner = row.values.TABLE_OWNER as string | undefined;
            if (indexName && tableName) {
              resolutions.set(`${owner}.${indexName}`, { schemaName: tableOwner ?? owner, tableName });
            }
          }
        } catch {
          // Best-effort only - unresolved keys fall through to parseOraclePlan()'s own "could not resolve" warning.
        }
      }),
    );
    return resolutions;
  }

  async collectExecutionPlan(
    params: PerformanceTuningContextParams,
    options: PerformanceTuningCallOptions & { timeoutMs: number },
  ): Promise<GeneralResult<VendorExecutionPlan>> {
    const binds = params.plan?.binds?.map((v) => String(v));

    let rdh: ResultSetData;
    try {
      rdh = await this.driver.collectPerformanceTuningPlanRows({
        sql: params.statement.sql,
        conditions: { rawQueries: true, binds },
        meta: { type: 'performanceTuningContext' },
      });
    } catch (e) {
      // Same precedent as the other three vendors: a failed EXPLAIN PLAN is an expected, actionable failure, surfaced with detail.
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message: `Failed to retrieve the execution plan.${detail ? ` ${detail}` : ''}`,
      };
    }

    const rawRows = rdh.rows.map((r) => r.values);
    const diagnostics: NonNullable<VendorExecutionPlan['diagnostics']> = [];
    let planNode: VendorExecutionPlan['normalizedPlan'];
    let planTableMappings: VendorExecutionPlan['planTableMappings'] = [];
    try {
      const unresolvedKeys = findUnresolvedIndexOnlyAccessKeys(rawRows);
      const resolutions =
        unresolvedKeys.length > 0 ? await this.resolveIndexOnlyAccessTables(unresolvedKeys) : undefined;
      const parsedPlan = parseOraclePlan(rawRows, resolutions);
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

    // DISPLAY_CURSOR can show a runtime topology different from EXPLAIN PLAN (adaptive choices, bind peeking, and reoptimization).
    const actualPlanTableStats = actualPlan
      ? resolveOracleActualPlanTableStats(actualPlan.content, planTableMappings)
      : undefined;
    if (actualPlanTableStats) {
      planTableMappings = applyActualPlanTableStats(planTableMappings, actualPlanTableStats, {
        tableAccessRows: 'Oracle DBMS_XPLAN ALLSTATS LAST table/index access rows (per start)',
        predicateFilterInputRows: 'Oracle DBMS_XPLAN ALLSTATS LAST index rows before local filter (per start)',
        predicateFilterOutputRows: 'Oracle DBMS_XPLAN ALLSTATS LAST table-access rows after local filter (per start)',
      });
    }

    return {
      ok: true,
      message: '',
      result: {
        raw: rawRows,
        normalizedPlan: planNode,
        // EXPLAIN PLAN never executes the query - no timing available (estimate mode only, same as the other three vendors).
        planningTimeMs: undefined,
        executionTimeMs: undefined,
        actualPlan,
        runtimeObservations: actualPlan ? extractOracleRuntimeObservations(actualPlan.content) : undefined,
        diagnostics,
        planTableMappings,
      },
    };
  }

  // Same rationale as the other three Providers' runCatalogQuery(): an ordinary ALL_*-view error (permission denied, ...) gets a *detailed* message, since it's an expected/actionable failure, not the generic message RDSBaseDriver's exception boundary uses for genuine bugs.
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

  // getTableDDL() throws rather than returning a GeneralResult - wrapped into GeneralResult<string> here (never a bespoke ok/text-or-message union) so its failure can be downgraded to a warning in collectTableDefinition() instead of failing the whole call.
  private async collectDdl(target: PerformanceTuningTableTarget): Promise<GeneralResult<string>> {
    try {
      const text = await this.driver.getTableDDL({
        tableName: target.tableName,
        schemaName: target.schemaName,
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
    const schema = await this.targetSchemaOf(target);
    const binds = [schema, target.tableName];

    const [columnsResult, constraintsResult, checkConstraintsResult, indexesResult, ddl] = await Promise.all([
      this.runCatalogQuery(COLUMNS_SQL, binds, 'columns'),
      this.runCatalogQuery(CONSTRAINTS_SQL, binds, 'constraints'),
      this.runCatalogQuery(CHECK_CONSTRAINTS_SQL, binds, 'check constraints'),
      this.runCatalogQuery(INDEXES_SQL, binds, 'indexes'),
      this.collectDdl(target),
    ]);

    if (!columnsResult.ok) {
      return { ok: false, message: columnsResult.message };
    }

    const columns: ColumnDefinition[] = mapOracleColumnRows(
      columnsResult.result?.rows.map((r) => r.values) ?? [],
    );
    const constraints: ConstraintDefinition[] = [
      ...(constraintsResult.ok
        ? mapOracleConstraintRows(constraintsResult.result?.rows.map((r) => r.values) ?? [])
        : []),
      ...(checkConstraintsResult.ok
        ? mapOracleCheckConstraintRows(checkConstraintsResult.result?.rows.map((r) => r.values) ?? [])
        : []),
    ];
    const pkIndexNames = new Set(
      constraints
        .filter((c) => c.type === 'primaryKey')
        .map((c) => c.constraintName)
        .filter((name): name is string => !!name),
    );
    const indexes: IndexDefinition[] = (
      indexesResult.ok ? mapOracleIndexRows(indexesResult.result?.rows.map((r) => r.values) ?? []) : []
    ).map((idx) => (pkIndexNames.has(idx.indexName) ? { ...idx, primary: true } : idx));

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
    const schema = await this.targetSchemaOf(target);
    const binds = [schema, target.tableName];
    const [sizeResult, modificationsResult] = await Promise.all([
      this.runCatalogQuery(TABLE_SIZE_SQL, binds, 'table statistics'),
      this.runCatalogQuery(MODIFICATIONS_SQL, binds, 'table statistics'),
    ]);
    if (!sizeResult.ok) {
      return { ok: false, message: sizeResult.message };
    }
    const mapped = mapOracleTableStatisticsRow(
      sizeResult.result?.rows[0]?.values,
      modificationsResult.ok ? modificationsResult.result?.rows[0]?.values : undefined,
    );
    if (!mapped) {
      return {
        ok: false,
        message: `Table ${target.schemaName ? `${target.schemaName}.` : ''}${target.tableName} was not found (or is not visible to this connection).`,
      };
    }
    return {
      ok: true,
      message: modificationsResult.ok ? '' : modificationsResult.message,
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
    const schema = await this.targetSchemaOf(target);
    const placeholders = target.columnNames.map((_, i) => `:${i + 3}`).join(', ');
    const sql = COLUMN_STATISTICS_SQL.replace('$COLUMN_PLACEHOLDERS', placeholders);
    const binds = [schema, target.tableName, ...target.columnNames];

    const result = await this.runCatalogQuery(sql, binds, 'column statistics');
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    const byColumn = mapOracleColumnStatisticsRow;
    const rowsByColumn = new Map<string, unknown>();
    for (const row of result.result?.rows ?? []) {
      const columnName = row.values.COLUMN_NAME as string | undefined;
      if (columnName) {
        rowsByColumn.set(columnName, row.values);
      }
    }

    return {
      ok: true,
      message: '',
      result: target.columnNames.map(
        (columnName) => byColumn(rowsByColumn.get(columnName)) ?? { columnName },
      ),
    };
  }

  async collectPhysicalHealth(
    target: PerformanceTuningTableTarget,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCollectionOptions,
  ): Promise<GeneralResult<VendorPhysicalHealth>> {
    const schema = await this.targetSchemaOf(target);
    const result = await this.runCatalogQuery(
      PHYSICAL_HEALTH_SQL,
      [schema, target.tableName],
      'physical health',
    );
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    return { ok: true, message: '', result: mapOraclePhysicalHealthRow(result.result?.rows[0]?.values) };
  }
}

// Every `AS` alias below is UPPERCASE, and every already-bare column reference (MODIFICATIONS_SQL/PHYSICAL_HEALTH_SQL/INDEX_TABLE_LOOKUP_SQL)
const COLUMNS_SQL = `
SELECT
  col.COLUMN_NAME AS NAME,
  col.DATA_TYPE AS DATA_TYPE,
  col.DATA_LENGTH AS DATA_LENGTH,
  col.DATA_PRECISION AS DATA_PRECISION,
  col.DATA_SCALE AS DATA_SCALE,
  col.NULLABLE AS NULLABLE,
  col.DATA_DEFAULT AS COLUMN_DEFAULT,
  col.COLUMN_ID AS ORDINAL_POSITION,
  cm.COMMENTS AS "COMMENT"
FROM ALL_TAB_COLUMNS col
LEFT JOIN ALL_COL_COMMENTS cm
  ON cm.OWNER = col.OWNER AND cm.TABLE_NAME = col.TABLE_NAME AND cm.COLUMN_NAME = col.COLUMN_NAME
WHERE col.OWNER = :1 AND col.TABLE_NAME = :2
ORDER BY col.COLUMN_ID`;

// One row per (constraint, column); grouped in JS by mapOracleConstraintRows().
const CONSTRAINTS_SQL = `
SELECT
  ac.CONSTRAINT_NAME AS CONSTRAINT_NAME,
  ac.CONSTRAINT_TYPE AS CONSTRAINT_TYPE,
  acc.COLUMN_NAME AS COLUMN_NAME,
  acc.POSITION AS POSITION,
  rc.OWNER AS REFERENCED_SCHEMA,
  rc.TABLE_NAME AS REFERENCED_TABLE,
  rcc.COLUMN_NAME AS REFERENCED_COLUMN
FROM ALL_CONSTRAINTS ac
JOIN ALL_CONS_COLUMNS acc ON acc.OWNER = ac.OWNER AND acc.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
LEFT JOIN ALL_CONSTRAINTS rc ON rc.OWNER = ac.R_OWNER AND rc.CONSTRAINT_NAME = ac.R_CONSTRAINT_NAME
LEFT JOIN ALL_CONS_COLUMNS rcc
  ON rcc.OWNER = rc.OWNER AND rcc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME AND rcc.POSITION = acc.POSITION
WHERE ac.OWNER = :1 AND ac.TABLE_NAME = :2 AND ac.CONSTRAINT_TYPE IN ('P','U','R')
ORDER BY ac.CONSTRAINT_NAME, acc.POSITION`;

// A separate query: CHECK constraints (including the auto-generated NOT NULL ones mapOracleCheckConstraintRows() filters back out) carry no column list of their own in ALL_CONSTRAINTS.
const CHECK_CONSTRAINTS_SQL = `
SELECT CONSTRAINT_NAME AS CONSTRAINT_NAME, SEARCH_CONDITION_VC AS CHECK_CLAUSE
FROM ALL_CONSTRAINTS
WHERE OWNER = :1 AND TABLE_NAME = :2 AND CONSTRAINT_TYPE = 'C'`;

// One row per (index, column); grouped in JS by mapOracleIndexRows(), which also splits a function-based index's hidden-system-column key part (COLUMN_EXPRESSION from ALL_IND_EXPRESSIONS) from a plain one.
const INDEXES_SQL = `
SELECT
  i.INDEX_NAME AS INDEX_NAME,
  i.UNIQUENESS AS UNIQUENESS,
  i.INDEX_TYPE AS INDEX_TYPE,
  ic.COLUMN_NAME AS COLUMN_NAME,
  ic.COLUMN_POSITION AS COLUMN_POSITION,
  ic.DESCEND AS DESCEND,
  ie.COLUMN_EXPRESSION AS COLUMN_EXPRESSION
FROM ALL_INDEXES i
JOIN ALL_IND_COLUMNS ic ON ic.INDEX_OWNER = i.OWNER AND ic.INDEX_NAME = i.INDEX_NAME
LEFT JOIN ALL_IND_EXPRESSIONS ie
  ON ie.INDEX_OWNER = i.OWNER AND ie.INDEX_NAME = i.INDEX_NAME AND ie.COLUMN_POSITION = ic.COLUMN_POSITION
WHERE i.OWNER = :1 AND i.TABLE_NAME = :2
ORDER BY i.INDEX_NAME, ic.COLUMN_POSITION`;

const TABLE_SIZE_SQL = `
SELECT
  t.NUM_ROWS AS NUM_ROWS,
  t.BLOCKS AS BLOCKS,
  t.LAST_ANALYZED AS LAST_ANALYZED,
  NVL(ts.BLOCK_SIZE, 8192) AS BLOCK_SIZE,
  (SELECT SUM(NVL(i.LEAF_BLOCKS,0) + NVL(i.BLEVEL,0) + 1)
     FROM ALL_INDEXES i WHERE i.OWNER = t.OWNER AND i.TABLE_NAME = t.TABLE_NAME) AS INDEX_BLOCKS
FROM ALL_TABLES t
LEFT JOIN USER_TABLESPACES ts ON ts.TABLESPACE_NAME = t.TABLESPACE_NAME
WHERE t.OWNER = :1 AND t.TABLE_NAME = :2`;

const MODIFICATIONS_SQL = `
SELECT INSERTS, UPDATES, DELETES
FROM ALL_TAB_MODIFICATIONS
WHERE TABLE_OWNER = :1 AND TABLE_NAME = :2`;

// `$COLUMN_PLACEHOLDERS` is substituted with `:3, :4, ...` (one per requested column) before this is sent - see collectColumnStatistics().
const COLUMN_STATISTICS_SQL = `
SELECT
  s.COLUMN_NAME, s.NUM_DISTINCT, s.NUM_NULLS,
  s.NUM_BUCKETS, s.LAST_ANALYZED, s.HISTOGRAM,
  s.AVG_COL_LEN, s.SAMPLE_SIZE,
  t.NUM_ROWS AS TABLE_NUM_ROWS
FROM ALL_TAB_COL_STATISTICS s
JOIN ALL_TABLES t ON t.OWNER = s.OWNER AND t.TABLE_NAME = s.TABLE_NAME
WHERE s.OWNER = :1 AND s.TABLE_NAME = :2 AND s.COLUMN_NAME IN ($COLUMN_PLACEHOLDERS)`;

const PHYSICAL_HEALTH_SQL = `
SELECT CHAIN_CNT, LAST_ANALYZED
FROM ALL_TABLES WHERE OWNER = :1 AND TABLE_NAME = :2`;

// `$INDEX_NAME_PLACEHOLDERS` is substituted with `:2, :3, ...` (one per index name, after the fixed owner bind) - see resolveIndexOnlyAccessTables().
const INDEX_TABLE_LOOKUP_SQL = `
SELECT INDEX_NAME, TABLE_NAME, TABLE_OWNER
FROM ALL_INDEXES
WHERE OWNER = :1 AND INDEX_NAME IN ($INDEX_NAME_PLACEHOLDERS)`;
