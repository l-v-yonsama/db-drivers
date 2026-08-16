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
  mapOracleCheckConstraintRows,
  mapOracleColumnRows,
  mapOracleColumnStatisticsRow,
  mapOracleConstraintRows,
  mapOracleIndexRows,
  mapOraclePhysicalHealthRow,
  mapOracleTableStatisticsRow,
} from './oracleCatalogMapper';
import { findUnresolvedIndexOnlyAccessKeys, OracleIndexTableKey, parseOraclePlan } from './oraclePlanParser';
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

// Narrow, structural view of OracleDriver - just what this Provider needs,
// same rationale as the other three vendors' Providers: unit-testable with
// a stub, and can't reach past this into connect/disconnect/transactions/UI.
// collectPerformanceTuningPlanRows() is a dedicated method (not the general
// "Explain" feature's explainSqlSub(), which returns DBMS_XPLAN.DISPLAY's
// curated text output, not PLAN_TABLE's raw structured rows this Provider
// needs) - see OracleDriver.ts's doc comment on it. getCurrentSchema() is
// reused as-is (already implemented for the resource-tree feature) rather
// than duplicated, since Oracle has no equivalent of MySQL's "database IS
// the schema" or SQL Server's "'dbo' is almost always right" - the real
// default is genuinely per-connection.
export interface OraclePerformanceTuningDriverAccess {
  requestSql(params: QueryParams): Promise<ResultSetData>;
  getTableDDL(params: { tableName: string; schemaName?: string }): Promise<string>;
  collectPerformanceTuningPlanRows(params: QueryParams): Promise<ResultSetData>;
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
    // Read-only, static capability report - same contract as the other
    // three vendors' Providers (§7: never touches the DB; a per-table
    // permission gap still surfaces later as that table's own
    // unavailableSections entry, not here).
    const capabilities: PerformanceTuningCapabilities = {
      executionPlan: { available: true, source: 'EXPLAIN PLAN / PLAN_TABLE' },
      analyzedExecutionPlan: {
        available: false,
        message: 'Not implemented yet (estimate plans only).',
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

  // Resolves {owner, indexName} pairs findUnresolvedIndexOnlyAccessKeys()
  // found in the raw plan rows to their real {schemaName, tableName} via
  // ALL_INDEXES, batched into one query per distinct owner (almost always
  // exactly one - a plan touching indexes across several schemas is rare).
  // Never throws: a lookup failure just means those keys stay unresolved,
  // which parseOraclePlan() already turns into an honest per-node warning
  // rather than a fabricated table name.
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
            // Oracle folds every unquoted `AS alias` to uppercase - see
            // oracleCatalogMapper.ts's module doc comment.
            const indexName = row.values.INDEX_NAME as string | undefined;
            const tableName = row.values.TABLE_NAME as string | undefined;
            const tableOwner = row.values.TABLE_OWNER as string | undefined;
            if (indexName && tableName) {
              resolutions.set(`${owner}.${indexName}`, { schemaName: tableOwner ?? owner, tableName });
            }
          }
        } catch {
          // Best-effort only - unresolved keys fall through to
          // parseOraclePlan()'s own "could not resolve" warning.
        }
      }),
    );
    return resolutions;
  }

  async collectExecutionPlan(
    params: PerformanceTuningContextParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: PerformanceTuningCallOptions & { timeoutMs: number },
  ): Promise<GeneralResult<VendorExecutionPlan>> {
    if (params.plan?.mode === 'analyze') {
      return {
        ok: false,
        message: 'Analyze mode is not implemented yet for Oracle.',
      };
    }

    // binds are used only to obtain a parameter-specific plan (§4.1); they
    // are never placed anywhere in the returned VendorExecutionPlan.
    const binds = params.plan?.binds?.map((v) => String(v));

    let rdh: ResultSetData;
    try {
      rdh = await this.driver.collectPerformanceTuningPlanRows({
        sql: params.statement.sql,
        conditions: { rawQueries: true, binds },
        meta: { type: 'performanceTuningContext' },
      });
    } catch (e) {
      // Same precedent as the other three vendors: a failed EXPLAIN PLAN is
      // an expected, actionable failure, surfaced with detail.
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        message: `Failed to retrieve the execution plan.${detail ? ` ${detail}` : ''}`,
      };
    }

    const rawRows = rdh.rows.map((r) => r.values);
    const warnings: string[] = [];
    let planNode: VendorExecutionPlan['normalizedPlan'];
    let planTableMappings: VendorExecutionPlan['planTableMappings'] = [];
    try {
      const unresolvedKeys = findUnresolvedIndexOnlyAccessKeys(rawRows);
      const resolutions =
        unresolvedKeys.length > 0 ? await this.resolveIndexOnlyAccessTables(unresolvedKeys) : undefined;
      const parsedPlan = parseOraclePlan(rawRows, resolutions);
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
        // PLAN_TABLE has no single JSON document the way Postgres/MySQL's
        // EXPLAIN does - the flat row list itself is the closest equivalent
        // of "the vendor's own plan output" (§5.2), same as SQL Server's raw.
        raw: rawRows,
        normalizedPlan: planNode,
        // EXPLAIN PLAN never executes the query - no timing available
        // (estimate mode only, same as the other three vendors).
        planningTimeMs: undefined,
        executionTimeMs: undefined,
        warnings,
        planTableMappings,
      },
    };
  }

  // Same rationale as the other three Providers' runCatalogQuery(): an
  // ordinary ALL_*-view error (permission denied, ...) gets a *detailed*
  // message, since it's an expected/actionable failure, not the generic
  // message RDSBaseDriver's exception boundary uses for genuine bugs.
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

  // getTableDDL() throws rather than returning a GeneralResult - wrapped
  // into GeneralResult<string> here (never a bespoke ok/text-or-message
  // union) so its failure can be downgraded to a warning in
  // collectTableDefinition() instead of failing the whole call. See
  // MySQLPerformanceTuningProvider.collectDdl()'s comment for why
  // GeneralResult<T> specifically (this project's strictNullChecks:false
  // breaks control-flow narrowing on ad-hoc discriminated unions).
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
    // ALL_INDEXES carries no "is this the PK's backing index" flag of its
    // own - Oracle always names a PK's backing index identically to the PK
    // constraint itself, so that's cross-referenced here from the
    // constraint list this same call already collected, rather than
    // guessed at inside mapOracleIndexRows() (which has no constraint data
    // to work from).
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

// Every `AS` alias below is UPPERCASE, and every already-bare column
// reference (MODIFICATIONS_SQL/PHYSICAL_HEALTH_SQL/INDEX_TABLE_LOOKUP_SQL)
// relies on Oracle's real catalog column names already being uppercase -
// node-oracledb (and Oracle itself) folds every unquoted identifier,
// aliases included, to uppercase regardless of how this SQL text is
// written, so oracleCatalogMapper.ts's row access must match (see its own
// module doc comment for the live-verified detail).
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
// Self-joined against ALL_CONSTRAINTS/ALL_CONS_COLUMNS a second time
// (aliased rc/rcc) to resolve a FOREIGN KEY's referenced table/column - the
// same pattern OracleDriver.setForinKeys() already uses elsewhere in this
// driver for the resource tree.
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

// A separate query: CHECK constraints (including the auto-generated NOT
// NULL ones mapOracleCheckConstraintRows() filters back out) carry no
// column list of their own in ALL_CONSTRAINTS.
const CHECK_CONSTRAINTS_SQL = `
SELECT CONSTRAINT_NAME AS CONSTRAINT_NAME, SEARCH_CONDITION_VC AS CHECK_CLAUSE
FROM ALL_CONSTRAINTS
WHERE OWNER = :1 AND TABLE_NAME = :2 AND CONSTRAINT_TYPE = 'C'`;

// One row per (index, column); grouped in JS by mapOracleIndexRows(), which
// also splits a function-based index's hidden-system-column key part
// (COLUMN_EXPRESSION from ALL_IND_EXPRESSIONS) from a plain one.
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

// BLOCK_SIZE comes from USER_TABLESPACES (ALL_TABLESPACES/DBA_TABLESPACES
// are not guaranteed readable even with SELECT_CATALOG_ROLE - confirmed
// against a live Oracle 23c Free instance where only USER_TABLESPACES was
// accessible) rather than assumed to be the 8192-byte default; NVL(...,
// 8192) is only a last-resort fallback when even that join misses.
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

// `$COLUMN_PLACEHOLDERS` is substituted with `:3, :4, ...` (one per
// requested column) before this is sent - see collectColumnStatistics().
const COLUMN_STATISTICS_SQL = `
SELECT
  COLUMN_NAME, NUM_DISTINCT, NUM_NULLS,
  NUM_BUCKETS, LAST_ANALYZED, HISTOGRAM,
  AVG_COL_LEN, SAMPLE_SIZE
FROM ALL_TAB_COL_STATISTICS
WHERE OWNER = :1 AND TABLE_NAME = :2 AND COLUMN_NAME IN ($COLUMN_PLACEHOLDERS)`;

const PHYSICAL_HEALTH_SQL = `
SELECT CHAIN_CNT, LAST_ANALYZED
FROM ALL_TABLES WHERE OWNER = :1 AND TABLE_NAME = :2`;

// `$INDEX_NAME_PLACEHOLDERS` is substituted with `:2, :3, ...` (one per
// index name, after the fixed owner bind) - see resolveIndexOnlyAccessTables().
const INDEX_TABLE_LOOKUP_SQL = `
SELECT INDEX_NAME, TABLE_NAME, TABLE_OWNER
FROM ALL_INDEXES
WHERE OWNER = :1 AND INDEX_NAME IN ($INDEX_NAME_PLACEHOLDERS)`;
