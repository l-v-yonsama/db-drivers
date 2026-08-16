import {
  mapOracleCheckConstraintRows,
  mapOracleColumnRow,
  mapOracleColumnRows,
  mapOracleColumnStatisticsRow,
  mapOracleConstraintRows,
  mapOracleIndexRows,
  mapOraclePhysicalHealthRow,
  mapOracleTableStatisticsRow,
} from '../../../src';

// Row shapes below are copied from what `oracledb` actually returns against
// a live Oracle 23c instance (see OraclePerformanceTuningProvider.test.ts's
// live suite) - crucially every key is UPPERCASE, since Oracle folds every
// unquoted identifier (including a query's own `AS alias`) to uppercase,
// unlike Postgres/MySQL/SQL Server. LAST_ANALYZED comes back as a native JS
// `Date`; NUM_ROWS/BLOCKS/etc. as plain JS numbers.

describe('mapOracleColumnRow(s)', () => {
  it('builds NUMBER(p,s)/VARCHAR2(n) from DATA_TYPE + precision/scale/length', () => {
    const column = mapOracleColumnRow({
      NAME: 'AMOUNT',
      DATA_TYPE: 'NUMBER',
      DATA_LENGTH: 22,
      DATA_PRECISION: 10,
      DATA_SCALE: 2,
      NULLABLE: 'Y',
      COLUMN_DEFAULT: null,
      ORDINAL_POSITION: 4,
      COMMENT: null,
    });
    expect(column).toEqual({
      columnName: 'AMOUNT',
      dataType: 'NUMBER(10,2)',
      nullable: true,
      defaultExpression: undefined,
      ordinalPosition: 4,
      comment: undefined,
    });

    const status = mapOracleColumnRow({
      NAME: 'STATUS',
      DATA_TYPE: 'VARCHAR2',
      DATA_LENGTH: 20,
      DATA_PRECISION: null,
      DATA_SCALE: null,
      NULLABLE: 'N',
      COLUMN_DEFAULT: "'new' ",
      ORDINAL_POSITION: 3,
    });
    expect(status?.dataType).toBe('VARCHAR2(20)');
    expect(status?.nullable).toBe(false);
  });

  it('leaves a bare NUMBER (no precision/scale) and an unsized type (DATE) as-is', () => {
    expect(
      mapOracleColumnRow({ NAME: 'ID', DATA_TYPE: 'NUMBER', NULLABLE: 'N' })?.dataType,
    ).toBe('NUMBER');
    expect(
      mapOracleColumnRow({ NAME: 'CREATED_AT', DATA_TYPE: 'DATE', NULLABLE: 'Y' })?.dataType,
    ).toBe('DATE');
  });

  it('drops a row with no column name', () => {
    expect(mapOracleColumnRow({ NAME: null, DATA_TYPE: 'NUMBER' })).toBeUndefined();
  });

  it('maps a full row list, dropping unmappable rows', () => {
    const rows = mapOracleColumnRows([
      { NAME: 'ID', DATA_TYPE: 'NUMBER', NULLABLE: 'N', ORDINAL_POSITION: 1 },
      { NAME: null },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].columnName).toBe('ID');
  });
});

describe('mapOracleConstraintRows', () => {
  it('groups PRIMARY KEY/FOREIGN KEY (constraint, column) rows into one entry per constraint', () => {
    const constraints = mapOracleConstraintRows([
      {
        CONSTRAINT_NAME: 'SYS_C009477',
        CONSTRAINT_TYPE: 'P',
        COLUMN_NAME: 'ID',
        POSITION: 1,
        REFERENCED_SCHEMA: null,
        REFERENCED_TABLE: null,
        REFERENCED_COLUMN: null,
      },
      {
        CONSTRAINT_NAME: 'FK_ORDER_DETAIL_ORDER',
        CONSTRAINT_TYPE: 'R',
        COLUMN_NAME: 'ORDER_NO',
        POSITION: 1,
        REFERENCED_SCHEMA: 'TESTUSER',
        REFERENCED_TABLE: 'ORDER',
        REFERENCED_COLUMN: 'ORDER_NO',
      },
    ]);

    expect(constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ constraintName: 'SYS_C009477', type: 'primaryKey', columns: ['ID'] }),
        expect.objectContaining({
          constraintName: 'FK_ORDER_DETAIL_ORDER',
          type: 'foreignKey',
          columns: ['ORDER_NO'],
          referencedTableName: 'ORDER',
          referencedColumns: ['ORDER_NO'],
        }),
      ]),
    );
  });

  it('drops rows with an unrecognized constraint type', () => {
    expect(
      mapOracleConstraintRows([{ CONSTRAINT_NAME: 'x', CONSTRAINT_TYPE: 'V', COLUMN_NAME: 'g', POSITION: 1 }]),
    ).toEqual([]);
  });
});

describe('mapOracleCheckConstraintRows', () => {
  it('keeps a real CHECK expression as-is', () => {
    expect(
      mapOracleCheckConstraintRows([{ CONSTRAINT_NAME: 'SYS_C009476', CHECK_CLAUSE: 'amount >= 0' }]),
    ).toEqual([{ constraintName: 'SYS_C009476', type: 'check', checkExpression: 'amount >= 0' }]);
  });

  it('filters out an auto-generated NOT NULL check (redundant with the column\'s own nullable flag)', () => {
    expect(
      mapOracleCheckConstraintRows([
        { CONSTRAINT_NAME: 'SYS_C009458', CHECK_CLAUSE: '"ID" IS NOT NULL' },
        { CONSTRAINT_NAME: 'SYS_C009476', CHECK_CLAUSE: 'amount >= 0' },
      ]),
    ).toEqual([{ constraintName: 'SYS_C009476', type: 'check', checkExpression: 'amount >= 0' }]);
  });
});

describe('mapOracleIndexRows', () => {
  it('splits plain columns from a function-based key part (hidden SYS_NC column -> expression)', () => {
    const indexes = mapOracleIndexRows([
      {
        INDEX_NAME: 'IDX_PERF_ORDERS_CUSTOMER_STATUS',
        UNIQUENESS: 'NONUNIQUE',
        INDEX_TYPE: 'NORMAL',
        COLUMN_NAME: 'CUSTOMER_ID',
        COLUMN_POSITION: 1,
        DESCEND: 'ASC',
        COLUMN_EXPRESSION: null,
      },
      {
        INDEX_NAME: 'IDX_PERF_ORDERS_CUSTOMER_STATUS',
        UNIQUENESS: 'NONUNIQUE',
        INDEX_TYPE: 'NORMAL',
        COLUMN_NAME: 'STATUS',
        COLUMN_POSITION: 2,
        DESCEND: 'ASC',
        COLUMN_EXPRESSION: null,
      },
      {
        INDEX_NAME: 'IDX_PERF_ORDERS_LOWER_STATUS',
        UNIQUENESS: 'NONUNIQUE',
        INDEX_TYPE: 'FUNCTION-BASED NORMAL',
        COLUMN_NAME: 'SYS_NC00005$',
        COLUMN_POSITION: 1,
        DESCEND: 'ASC',
        COLUMN_EXPRESSION: 'LOWER("STATUS")',
      },
    ]);

    // primary is always false here - the Provider cross-references the
    // constraint list to set it, mapOracleIndexRows() has no such data.
    const composite = indexes.find((i) => i.indexName === 'IDX_PERF_ORDERS_CUSTOMER_STATUS')!;
    expect(composite.primary).toBe(false);
    expect(composite.columns.map((c) => c.columnName)).toEqual(['CUSTOMER_ID', 'STATUS']);

    const functional = indexes.find((i) => i.indexName === 'IDX_PERF_ORDERS_LOWER_STATUS')!;
    expect(functional.columns[0].columnName).toBeUndefined();
    expect(functional.columns[0].expression).toBe('LOWER("STATUS")');
  });

  it('marks a DESC key part from DESCEND = DESC', () => {
    const [index] = mapOracleIndexRows([
      {
        INDEX_NAME: 'idx',
        UNIQUENESS: 'NONUNIQUE',
        INDEX_TYPE: 'NORMAL',
        COLUMN_NAME: 'A',
        COLUMN_POSITION: 1,
        DESCEND: 'DESC',
        COLUMN_EXPRESSION: null,
      },
    ]);
    expect(index.columns[0].direction).toBe('desc');
  });
});

describe('mapOracleTableStatisticsRow', () => {
  it('converts BLOCKS/INDEX_BLOCKS to bytes via BLOCK_SIZE, and sums modifications', () => {
    const stats = mapOracleTableStatisticsRow(
      { NUM_ROWS: 50, BLOCKS: 5, LAST_ANALYZED: new Date('2026-08-16T11:13:54.000Z'), BLOCK_SIZE: 8192, INDEX_BLOCKS: 10 },
      { INSERTS: 3, UPDATES: 1, DELETES: 0 },
    )!;
    expect(stats.estimatedRowCount).toEqual({ value: 50, estimated: true, source: 'ALL_TABLES.NUM_ROWS', unit: 'rows' });
    expect(stats.tableBytes?.value).toBe(40960);
    expect(stats.indexBytes?.value).toBe(81920);
    expect(stats.totalBytes?.value).toBe(122880);
    expect(stats.statisticsUpdatedAt?.value).toBe('2026-08-16T11:13:54.000Z');
    expect(stats.modificationsSinceAnalyze?.value).toBe(4);
  });

  it('returns undefined for a missing size row (table not found)', () => {
    expect(mapOracleTableStatisticsRow(undefined, undefined)).toBeUndefined();
  });
});

describe('mapOracleColumnStatisticsRow', () => {
  it('reads distinctCount/histogram fields directly from ALL_TAB_COL_STATISTICS', () => {
    const stats = mapOracleColumnStatisticsRow({
      COLUMN_NAME: 'STATUS',
      NUM_DISTINCT: 2,
      NUM_NULLS: 0,
      NUM_BUCKETS: 1,
      LAST_ANALYZED: new Date('2026-08-16T11:13:54.000Z'),
      HISTOGRAM: 'NONE',
      AVG_COL_LEN: 5,
      SAMPLE_SIZE: 50,
    })!;
    expect(stats.distinctCount).toEqual({
      value: 2,
      estimated: true,
      source: 'ALL_TAB_COL_STATISTICS.NUM_DISTINCT',
      unit: 'values',
    });
    expect(stats.nullFraction?.value).toBe(0);
    expect(stats.histogramType?.value).toBe('NONE');
    expect(stats.statisticsUpdatedAt?.value).toBe('2026-08-16T11:13:54.000Z');
  });

  it('returns undefined for a row with no column name', () => {
    expect(mapOracleColumnStatisticsRow(undefined)).toBeUndefined();
  });
});

describe('mapOraclePhysicalHealthRow', () => {
  it('reports chainedRowCount/lastUpdatedAt without a maintenance verdict', () => {
    const health = mapOraclePhysicalHealthRow({
      CHAIN_CNT: 0,
      LAST_ANALYZED: new Date('2026-08-16T11:13:54.000Z'),
    });
    const byName = Object.fromEntries(health.metrics.map((m) => [m.name, m.value]));
    expect(byName.chainedRowCount).toBe(0);
    expect(byName.lastUpdatedAt).toBe('2026-08-16T11:13:54.000Z');
  });

  it('never throws on a missing row', () => {
    expect(mapOraclePhysicalHealthRow(undefined)).toEqual({ metrics: [] });
  });
});
