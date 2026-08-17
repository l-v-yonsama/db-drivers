import {
  mapSqlServerCheckConstraintRows,
  mapSqlServerColumnRow,
  mapSqlServerColumnRows,
  mapSqlServerColumnStatisticsRow,
  mapSqlServerConstraintRows,
  mapSqlServerIndexRows,
  mapSqlServerPhysicalHealthRow,
  mapSqlServerTableStatisticsRow,
  renderSqlServerTableDdl,
} from '../../../src';

// Row shapes below are copied from what `mssql` actually returns against a
// live SQL Server 2022 instance (see SQLServerPerformanceTuningProvider.test.ts's
// live suite), not idealized fixtures - e.g. is_nullable/is_unique/is_primary/
// is_included/is_descending as native JS booleans (mssql maps BIT that
// way), last_updated as a native JS `Date`, and SUM()'d bigint columns
// (row_count/table_bytes/...) coming back as strings.

describe('mapSqlServerColumnRow(s)', () => {
  it('prefers column_type (the fuller "as declared" type built from sys.types/max_length/precision/scale)', () => {
    const column = mapSqlServerColumnRow({
      name: 'status',
      data_type: 'varchar',
      column_type: 'varchar(20)',
      is_nullable: false,
      column_default: "('new')",
      ordinal_position: 3,
      comment: null,
    });
    expect(column).toEqual({
      columnName: 'status',
      dataType: 'varchar(20)',
      nullable: false,
      defaultExpression: "('new')",
      ordinalPosition: 3,
      comment: undefined,
    });
  });

  it('drops a row with no column name', () => {
    expect(mapSqlServerColumnRow({ name: null, data_type: 'int' })).toBeUndefined();
  });

  it('maps a full row list, dropping unmappable rows', () => {
    const rows = mapSqlServerColumnRows([
      { name: 'id', data_type: 'int', column_type: 'int', is_nullable: false, ordinal_position: 1 },
      { name: null },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].columnName).toBe('id');
  });
});

describe('mapSqlServerConstraintRows', () => {
  it('groups PRIMARY KEY/UNIQUE and FOREIGN KEY (constraint, column) rows into one entry per constraint', () => {
    const constraints = mapSqlServerConstraintRows([
      {
        constraint_name: 'PK__order__1',
        constraint_type: 'PRIMARY KEY',
        column_name: 'order_no',
        ordinal_position: 1,
        referenced_schema: null,
        referenced_table: null,
        referenced_column: null,
      },
      {
        constraint_name: 'FK__order_detail__order',
        constraint_type: 'FOREIGN KEY',
        column_name: 'order_no',
        ordinal_position: 1,
        referenced_schema: 'dbo',
        referenced_table: 'order',
        referenced_column: 'order_no',
      },
    ]);

    expect(constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraintName: 'PK__order__1',
          type: 'primaryKey',
          columns: ['order_no'],
        }),
        expect.objectContaining({
          constraintName: 'FK__order_detail__order',
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
      mapSqlServerConstraintRows([
        { constraint_name: 'x', constraint_type: 'SPATIAL', column_name: 'g', ordinal_position: 1 },
      ]),
    ).toEqual([]);
  });
});

describe('mapSqlServerCheckConstraintRows', () => {
  it('maps definition as-is, already unwrapped (unlike Postgres pg_get_constraintdef)', () => {
    expect(
      mapSqlServerCheckConstraintRows([
        { constraint_name: 'CK__perf_orders__amount', check_clause: '([amount]>=(0))' },
      ]),
    ).toEqual([{ constraintName: 'CK__perf_orders__amount', type: 'check', checkExpression: '([amount]>=(0))' }]);
  });
});

describe('mapSqlServerIndexRows', () => {
  it('splits key columns from INCLUDE columns, marks PRIMARY, and reads the filtered-index predicate', () => {
    const indexes = mapSqlServerIndexRows([
      {
        index_name: 'PK__perf_ord__1',
        is_unique: true,
        is_primary: true,
        index_type: 'CLUSTERED',
        predicate: null,
        seq_in_index: 1,
        is_included: false,
        is_descending: false,
        column_id: 1,
        column_name: 'id',
      },
      {
        index_name: 'idx_perf_orders_customer_status',
        is_unique: false,
        is_primary: false,
        index_type: 'NONCLUSTERED',
        predicate: null,
        seq_in_index: 1,
        is_included: false,
        is_descending: false,
        column_id: 1,
        column_name: 'customer_id',
      },
      {
        index_name: 'idx_perf_orders_customer_status',
        is_unique: false,
        is_primary: false,
        index_type: 'NONCLUSTERED',
        predicate: null,
        seq_in_index: 2,
        is_included: false,
        is_descending: false,
        column_id: 2,
        column_name: 'status',
      },
      {
        index_name: 'idx_covering',
        is_unique: false,
        is_primary: false,
        index_type: 'NONCLUSTERED',
        predicate: null,
        seq_in_index: 1,
        is_included: false,
        is_descending: false,
        column_id: 1,
        column_name: 'customer_id',
      },
      {
        index_name: 'idx_covering',
        is_unique: false,
        is_primary: false,
        index_type: 'NONCLUSTERED',
        predicate: null,
        seq_in_index: 0,
        is_included: true,
        is_descending: false,
        column_id: 2,
        column_name: 'amount',
      },
      {
        index_name: 'idx_perf_orders_status_filtered',
        is_unique: false,
        is_primary: false,
        index_type: 'NONCLUSTERED',
        predicate: "([status]='shipped')",
        seq_in_index: 1,
        is_included: false,
        is_descending: false,
        column_id: 1,
        column_name: 'status',
      },
    ]);

    const pk = indexes.find((i) => i.indexName === 'PK__perf_ord__1')!;
    expect(pk.primary).toBe(true);
    expect(pk.unique).toBe(true);

    const composite = indexes.find((i) => i.indexName === 'idx_perf_orders_customer_status')!;
    expect(composite.unique).toBe(false);
    expect(composite.columns.map((c) => c.columnName)).toEqual(['customer_id', 'status']);
    // SQL Server has no functional/expression key parts.
    expect(composite.columns[0].expression).toBeUndefined();

    const covering = indexes.find((i) => i.indexName === 'idx_covering')!;
    expect(covering.columns.map((c) => c.columnName)).toEqual(['customer_id']);
    expect(covering.includedColumns).toEqual(['amount']);

    const filtered = indexes.find((i) => i.indexName === 'idx_perf_orders_status_filtered')!;
    expect(filtered.predicate).toBe("([status]='shipped')");
  });

  it('marks a DESC key part from is_descending = true', () => {
    const [index] = mapSqlServerIndexRows([
      {
        index_name: 'idx',
        is_unique: false,
        is_primary: false,
        index_type: 'NONCLUSTERED',
        predicate: null,
        seq_in_index: 1,
        is_included: false,
        is_descending: true,
        column_id: 1,
        column_name: 'a',
      },
    ]);
    expect(index.columns[0].direction).toBe('desc');
  });
});

describe('renderSqlServerTableDdl', () => {
  it('renders CREATE TABLE + non-constraint-backed indexes, deduping a PK-backed one', () => {
    const ddl = renderSqlServerTableDdl({
      schemaName: 'testdb',
      tableName: 'perf_orders',
      columns: [
        { columnName: 'id', dataType: 'int', nullable: false, ordinalPosition: 1 },
        { columnName: 'status', dataType: 'varchar(20)', nullable: false, ordinalPosition: 2 },
      ],
      constraints: [{ constraintName: 'PK__perf_orders', type: 'primaryKey', columns: ['id'] }],
      indexes: [
        {
          indexName: 'PK__perf_orders',
          unique: true,
          primary: true,
          columns: [{ columnName: 'id', direction: 'asc' }],
        },
        {
          indexName: 'idx_status',
          unique: false,
          primary: false,
          columns: [{ columnName: 'status', direction: 'asc' }],
        },
      ],
    });

    expect(ddl).toContain('CREATE TABLE [testdb].[perf_orders]');
    expect(ddl).toContain('CONSTRAINT [PK__perf_orders] PRIMARY KEY ([id])');
    expect(ddl).toContain('CREATE INDEX [idx_status] ON [testdb].[perf_orders] ([status]);');
    // The PK's own backing index must not be restated as a separate
    // CREATE INDEX line.
    expect(ddl.match(/PK__perf_orders/g)).toHaveLength(1);
  });
});

describe('mapSqlServerTableStatisticsRow', () => {
  it('combines size + stats-properties rows, coercing string-typed SUM() results', () => {
    const stats = mapSqlServerTableStatisticsRow(
      { row_count: '50', table_bytes: '16384', index_bytes: '49152', total_bytes: '65536' },
      { last_updated: new Date('2026-08-16T10:48:06.980Z'), modification_counter: '0' },
    )!;
    expect(stats.estimatedRowCount).toEqual({
      value: 50,
      estimated: true,
      source: 'sys.partitions.rows',
      unit: 'rows',
    });
    expect(stats.tableBytes?.value).toBe(16384);
    expect(stats.indexBytes?.value).toBe(49152);
    expect(stats.totalBytes?.value).toBe(65536);
    expect(stats.statisticsUpdatedAt).toEqual({
      value: '2026-08-16T10:48:06.980Z',
      estimated: false,
      source: 'sys.dm_db_stats_properties.last_updated',
    });
    expect(stats.modificationsSinceAnalyze?.value).toBe(0);
  });

  it('returns undefined for a missing size row (table not found)', () => {
    expect(mapSqlServerTableStatisticsRow(undefined, undefined)).toBeUndefined();
  });
});

describe('mapSqlServerColumnStatisticsRow', () => {
  it('derives distinctCount from histogram steps (equal_rows > 0 counts the step value itself)', () => {
    const stats = mapSqlServerColumnStatisticsRow('status', {
      histogramRows: [
        { step_number: 1, equal_rows: 40, distinct_range_rows: '0' },
        { step_number: 2, equal_rows: 10, distinct_range_rows: '0' },
      ],
      propsRow: { last_updated: new Date('2026-08-16T10:48:06.973Z'), modification_counter: '0' },
    });
    expect(stats.distinctCount).toEqual({
      value: 2,
      estimated: true,
      source: 'sys.dm_db_stats_histogram (derived from steps)',
      unit: 'values',
    });
    expect(stats.histogramType?.value).toBe('MaxDiff');
    expect(stats.histogramBucketCount?.value).toBe(2);
    expect(stats.statisticsUpdatedAt?.value).toBe('2026-08-16T10:48:06.973Z');
  });

  it('adds a distinct value per step for each distinct_range_rows in between', () => {
    const stats = mapSqlServerColumnStatisticsRow('customer_id', {
      histogramRows: [
        { step_number: 1, equal_rows: 5, distinct_range_rows: '0' },
        { step_number: 2, equal_rows: 5, distinct_range_rows: '1' },
      ],
      propsRow: undefined,
    });
    // 2 steps whose own value occurs (equal_rows > 0) + 1 distinct value
    // strictly between them = 3.
    expect(stats.distinctCount?.value).toBe(3);
  });

  it('still returns a shape (all fields undefined) when no statistics object covers this column', () => {
    expect(mapSqlServerColumnStatisticsRow('amount', undefined)).toEqual({ columnName: 'amount' });
  });
});

describe('mapSqlServerPhysicalHealthRow', () => {
  it('reports avgFragmentationPercent/pageCount/lastUpdatedAt without a maintenance verdict', () => {
    const health = mapSqlServerPhysicalHealthRow(
      { avg_fragmentation_in_percent: 0, page_count: '1' },
      { last_updated: new Date('2026-08-16T10:48:06.980Z'), modification_counter: '0' },
    );
    const byName = Object.fromEntries(health.metrics.map((m) => [m.name, m.value]));
    expect(byName.avgFragmentationPercent).toBe(0);
    expect(byName.pageCount).toBe(1);
    expect(byName.lastUpdatedAt).toBe('2026-08-16T10:48:06.980Z');
  });

  it('never throws on a missing row', () => {
    expect(mapSqlServerPhysicalHealthRow(undefined, undefined)).toEqual({ metrics: [] });
  });
});
