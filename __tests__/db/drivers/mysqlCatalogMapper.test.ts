import {
  mapMysqlCheckConstraintRows,
  mapMysqlColumnRow,
  mapMysqlColumnRows,
  mapMysqlColumnStatisticsRow,
  mapMysqlConstraintRows,
  mapMysqlIndexRows,
  mapMysqlPhysicalHealthRow,
  mapMysqlTableStatisticsRow,
} from '../../../src';

// Row shapes below are copied from what `mysql2` actually returns against a
// live MySQL 8.0 instance (see MySQLPerformanceTuningProvider.test.ts's live
// suite), not idealized fixtures - e.g. UPDATE_TIME as a native JS `Date`
// (mysql2 parses TIMESTAMP/DATETIME columns that way), TABLE_ROWS as a
// plain JS number (unlike Postgres's bigint-as-string quirk).

describe('mapMysqlColumnRow(s)', () => {
  it('prefers COLUMN_TYPE (the fuller "as declared" type) over bare DATA_TYPE', () => {
    const column = mapMysqlColumnRow({
      name: 'status',
      data_type: 'varchar',
      column_type: 'varchar(20)',
      is_nullable: 'NO',
      column_default: 'new',
      ordinal_position: 3,
      comment: '',
    });
    expect(column).toEqual({
      columnName: 'status',
      dataType: 'varchar(20)',
      nullable: false,
      defaultExpression: 'new',
      ordinalPosition: 3,
      comment: undefined,
    });
  });

  it('drops a row with no column name', () => {
    expect(mapMysqlColumnRow({ name: null, data_type: 'int' })).toBeUndefined();
  });

  it('maps a full row list, dropping unmappable rows', () => {
    const rows = mapMysqlColumnRows([
      { name: 'id', data_type: 'int', column_type: 'int', is_nullable: 'NO', ordinal_position: 1 },
      { name: null },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].columnName).toBe('id');
  });
});

describe('mapMysqlConstraintRows', () => {
  it('groups (constraint, column) rows into one entry per constraint, ordered by position', () => {
    const constraints = mapMysqlConstraintRows([
      {
        constraint_name: 'PRIMARY',
        constraint_type: 'PRIMARY KEY',
        column_name: 'order_no',
        ordinal_position: 1,
        referenced_schema: null,
        referenced_table: null,
        referenced_column: null,
      },
      {
        constraint_name: 'PRIMARY',
        constraint_type: 'PRIMARY KEY',
        column_name: 'detail_no',
        ordinal_position: 2,
        referenced_schema: null,
        referenced_table: null,
        referenced_column: null,
      },
      {
        constraint_name: 'order_detail_ibfk_1',
        constraint_type: 'FOREIGN KEY',
        column_name: 'order_no',
        ordinal_position: 1,
        referenced_schema: 'test-db',
        referenced_table: 'order',
        referenced_column: 'order_no',
      },
    ]);

    expect(constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraintName: 'PRIMARY',
          type: 'primaryKey',
          columns: ['order_no', 'detail_no'],
        }),
        expect.objectContaining({
          constraintName: 'order_detail_ibfk_1',
          type: 'foreignKey',
          columns: ['order_no'],
          referencedTableName: 'order',
          referencedColumns: ['order_no'],
        }),
      ]),
    );
  });

  it('drops rows with an unrecognized constraint type', () => {
    expect(
      mapMysqlConstraintRows([
        { constraint_name: 'x', constraint_type: 'SPATIAL', column_name: 'g', ordinal_position: 1 },
      ]),
    ).toEqual([]);
  });
});

describe('mapMysqlCheckConstraintRows', () => {
  it('maps CHECK_CLAUSE as-is, already unwrapped (unlike Postgres pg_get_constraintdef)', () => {
    expect(
      mapMysqlCheckConstraintRows([
        { constraint_name: 'perf_orders_chk_1', check_clause: '(`amount` >= 0)' },
      ]),
    ).toEqual([{ constraintName: 'perf_orders_chk_1', type: 'check', checkExpression: '(`amount` >= 0)' }]);
  });
});

describe('mapMysqlIndexRows', () => {
  it('splits plain columns vs a functional (expression) key part, and marks PRIMARY', () => {
    const indexes = mapMysqlIndexRows([
      { index_name: 'PRIMARY', non_unique: 0, seq_in_index: 1, column_name: 'id', expression: null, collation: 'A', index_type: 'BTREE' },
      { index_name: 'idx_perf_orders_customer_status', non_unique: 1, seq_in_index: 1, column_name: 'customer_id', expression: null, collation: 'A', index_type: 'BTREE' },
      { index_name: 'idx_perf_orders_customer_status', non_unique: 1, seq_in_index: 2, column_name: 'status', expression: null, collation: 'A', index_type: 'BTREE' },
      { index_name: 'idx_perf_orders_lower_status', non_unique: 1, seq_in_index: 1, column_name: null, expression: 'lower(`status`)', collation: 'A', index_type: 'BTREE' },
    ]);

    const pk = indexes.find((i) => i.indexName === 'PRIMARY')!;
    expect(pk.primary).toBe(true);
    expect(pk.unique).toBe(true);

    const composite = indexes.find((i) => i.indexName === 'idx_perf_orders_customer_status')!;
    expect(composite.unique).toBe(false);
    expect(composite.columns.map((c) => c.columnName)).toEqual(['customer_id', 'status']);
    // MySQL has neither partial indexes nor INCLUDE columns.
    expect(composite.predicate).toBeUndefined();
    expect(composite.includedColumns).toBeUndefined();

    const functional = indexes.find((i) => i.indexName === 'idx_perf_orders_lower_status')!;
    expect(functional.columns[0].columnName).toBeUndefined();
    expect(functional.columns[0].expression).toContain('lower');
  });

  it('marks a DESC key part from COLLATION = D', () => {
    const [index] = mapMysqlIndexRows([
      { index_name: 'idx', non_unique: 1, seq_in_index: 1, column_name: 'a', expression: null, collation: 'D', index_type: 'BTREE' },
    ]);
    expect(index.columns[0].direction).toBe('desc');
  });
});

describe('mapMysqlTableStatisticsRow', () => {
  it('sums DATA_LENGTH + INDEX_LENGTH into totalBytes, all marked estimated (InnoDB cached stats)', () => {
    const stats = mapMysqlTableStatisticsRow({
      table_rows: 50,
      data_length: 16384,
      index_length: 49152,
      data_free: 0,
      update_time: new Date('2026-08-16T07:54:12.000Z'),
    })!;
    expect(stats.estimatedRowCount).toEqual({
      value: 50,
      estimated: true,
      source: 'information_schema.TABLES.TABLE_ROWS',
      unit: 'rows',
    });
    expect(stats.tableBytes?.value).toBe(16384);
    expect(stats.indexBytes?.value).toBe(49152);
    expect(stats.totalBytes?.value).toBe(65536);
    // No reliable "statistics last computed" source exists for MySQL.
    expect(stats.statisticsUpdatedAt).toBeUndefined();
  });

  it('returns undefined for a missing row (table not found)', () => {
    expect(mapMysqlTableStatisticsRow(undefined)).toBeUndefined();
  });
});

describe('mapMysqlColumnStatisticsRow', () => {
  it('takes distinctCount from CARDINALITY and null/histogram fields from the HISTOGRAM JSON', () => {
    const stats = mapMysqlColumnStatisticsRow(
      'status',
      { column_name: 'status', cardinality: 2 },
      {
        column_name: 'status',
        histogram: {
          buckets: [
            ['base64:type254:bmV3', 0.8],
            ['base64:type254:c2hpcHBlZA==', 1.0],
          ],
          'data-type': 'string',
          'null-values': 0,
          'histogram-type': 'singleton',
          'last-updated': '2026-08-16 07:54:12.889384',
        },
      },
    );
    expect(stats.distinctCount).toEqual({
      value: 2,
      estimated: true,
      source: 'information_schema.STATISTICS.CARDINALITY',
      unit: 'values',
    });
    expect(stats.nullFraction?.value).toBe(0);
    expect(stats.histogramType?.value).toBe('singleton');
    expect(stats.histogramBucketCount?.value).toBe(2);
    // MySQL's "YYYY-MM-DD HH:MM:SS.ffffff" (space-separated, UTC, no
    // timezone) reformatted into a value Date.parse() accepts unambiguously.
    expect(stats.statisticsUpdatedAt?.value).toBe('2026-08-16T07:54:12.889384Z');
  });

  it('still returns a shape (all fields undefined) when neither source has data for this column', () => {
    const stats = mapMysqlColumnStatisticsRow('amount', undefined, undefined);
    expect(stats).toEqual({
      columnName: 'amount',
      distinctCount: undefined,
      nullFraction: undefined,
      histogramType: undefined,
      histogramBucketCount: undefined,
      statisticsUpdatedAt: undefined,
    });
  });
});

describe('mapMysqlPhysicalHealthRow', () => {
  it('reports dataFreeBytes and lastUpdatedAt without a maintenance verdict', () => {
    const health = mapMysqlPhysicalHealthRow({
      data_free: 4096,
      update_time: new Date('2026-08-16T07:54:12.000Z'),
    });
    const byName = Object.fromEntries(health.metrics.map((m) => [m.name, m.value]));
    expect(byName.dataFreeBytes).toBe(4096);
    expect(byName.lastUpdatedAt).toBe('2026-08-16T07:54:12.000Z');
  });

  it('never throws on a missing row', () => {
    expect(mapMysqlPhysicalHealthRow(undefined)).toEqual({ metrics: [] });
  });
});
