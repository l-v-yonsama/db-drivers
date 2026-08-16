import {
  mapColumnRows,
  mapColumnStatisticsRows,
  mapConstraintRows,
  mapIndexRows,
  mapPartitioningRow,
  mapPhysicalHealthRow,
  mapTableStatisticsRow,
  renderPostgresTableDdl,
} from '../../../src';

// Row shapes below are copied verbatim from queries run against a live
// PostgreSQL 14 (`__tests__/setup/postgres.ts`'s `perf_orders` fixture),
// not hand-guessed - see the design doc §0 log for the validation session.
describe('postgresCatalogMapper', () => {
  describe('mapColumnRows', () => {
    it('maps a plain column and substitutes udt_name for USER-DEFINED/ARRAY types', () => {
      const rows = [
        {
          name: 'id',
          data_type: 'integer',
          udt_name: 'int4',
          is_nullable: 'NO',
          column_default: "nextval('perf_orders_id_seq'::regclass)",
          ordinal_position: 1,
          comment: null,
        },
        {
          name: 'clothes_size',
          data_type: 'USER-DEFINED',
          udt_name: 'clothessize',
          is_nullable: 'YES',
          column_default: null,
          ordinal_position: 2,
          comment: 'enum column',
        },
      ];

      expect(mapColumnRows(rows)).toEqual([
        {
          columnName: 'id',
          dataType: 'integer',
          nullable: false,
          defaultExpression: "nextval('perf_orders_id_seq'::regclass)",
          ordinalPosition: 1,
          comment: undefined,
        },
        {
          columnName: 'clothes_size',
          dataType: 'clothessize',
          nullable: true,
          defaultExpression: undefined,
          ordinalPosition: 2,
          comment: 'enum column',
        },
      ]);
    });

    it('drops unmappable rows instead of throwing', () => {
      expect(mapColumnRows([null, {}, 'not a row', undefined])).toEqual([]);
    });
  });

  describe('mapConstraintRows', () => {
    it('maps PK, FK and CHECK constraints, extracting the CHECK expression', () => {
      const rows = [
        {
          constraint_name: 'perf_orders_pkey',
          contype: 'p',
          columns: ['id'],
          referenced_schema: null,
          referenced_table: null,
          referenced_columns: null,
          definition: 'PRIMARY KEY (id)',
        },
        {
          constraint_name: 'order_detail_order_no_fkey',
          contype: 'f',
          columns: ['order_no'],
          referenced_schema: 'public',
          referenced_table: 'order1',
          referenced_columns: ['order_no'],
          definition: 'FOREIGN KEY (order_no) REFERENCES order1(order_no)',
        },
        {
          constraint_name: 'perf_orders_amount_check',
          contype: 'c',
          columns: ['amount'],
          referenced_schema: null,
          referenced_table: null,
          referenced_columns: null,
          definition: 'CHECK ((amount >= (0)::numeric))',
        },
      ];

      const mapped = mapConstraintRows(rows);
      expect(mapped).toHaveLength(3);
      expect(mapped[0]).toMatchObject({ type: 'primaryKey', columns: ['id'] });
      expect(mapped[1]).toMatchObject({
        type: 'foreignKey',
        referencedTableName: 'order1',
        referencedColumns: ['order_no'],
      });
      expect(mapped[2]).toMatchObject({
        type: 'check',
        checkExpression: '(amount >= (0)::numeric)',
      });
    });

    it('drops a row with an unrecognized contype instead of throwing', () => {
      expect(mapConstraintRows([{ constraint_name: 'x', contype: 't' }])).toEqual([]);
    });
  });

  describe('mapIndexRows', () => {
    it('splits key columns from INCLUDE columns using n_key_atts', () => {
      const rows = [
        {
          index_name: 'idx_perf_orders_include',
          is_unique: false,
          is_primary: false,
          index_type: 'btree',
          predicate: null,
          n_key_atts: 1,
          columns: [
            { position: 1, name: 'customer_id', expression: null, desc: false },
            { position: 2, name: 'status', expression: null, desc: false },
            { position: 3, name: 'amount', expression: null, desc: false },
          ],
        },
      ];

      expect(mapIndexRows(rows)).toEqual([
        {
          indexName: 'idx_perf_orders_include',
          unique: false,
          primary: false,
          columns: [{ columnName: 'customer_id', expression: undefined, direction: 'asc' }],
          includedColumns: ['status', 'amount'],
          predicate: undefined,
          enabled: undefined,
          indexType: 'btree',
        },
      ]);
    });

    it('maps an expression index and a DESC column', () => {
      const rows = [
        {
          index_name: 'idx_perf_orders_lower_status',
          is_unique: false,
          is_primary: false,
          index_type: 'btree',
          predicate: null,
          n_key_atts: 1,
          columns: [{ position: 1, name: null, expression: 'lower(status::text)', desc: false }],
        },
        {
          index_name: 'idx_customer_age_desc',
          is_unique: false,
          is_primary: false,
          index_type: 'btree',
          predicate: null,
          n_key_atts: 1,
          columns: [{ position: 1, name: 'age', expression: null, desc: true }],
        },
      ];

      const mapped = mapIndexRows(rows);
      expect(mapped[0].columns).toEqual([
        { columnName: undefined, expression: 'lower(status::text)', direction: 'asc' },
      ]);
      expect(mapped[1].columns).toEqual([
        { columnName: 'age', expression: undefined, direction: 'desc' },
      ]);
    });

    it('maps a partial index predicate and a primary/unique index', () => {
      const rows = [
        {
          index_name: 'idx_perf_orders_status_partial',
          is_unique: false,
          is_primary: false,
          index_type: 'btree',
          predicate: "((status)::text = 'shipped'::text)",
          n_key_atts: 1,
          columns: [{ position: 1, name: 'status', expression: null, desc: false }],
        },
        {
          index_name: 'perf_orders_pkey',
          is_unique: true,
          is_primary: true,
          index_type: 'btree',
          predicate: null,
          n_key_atts: 1,
          columns: [{ position: 1, name: 'id', expression: null, desc: false }],
        },
      ];

      const mapped = mapIndexRows(rows);
      expect(mapped[0].predicate).toBe("((status)::text = 'shipped'::text)");
      expect(mapped[1]).toMatchObject({ unique: true, primary: true });
    });

    it('drops a row without an index name instead of throwing', () => {
      expect(mapIndexRows([{ columns: [] }, null])).toEqual([]);
    });
  });

  describe('mapPartitioningRow', () => {
    it('extracts strategy and columns from pg_get_partkeydef output', () => {
      expect(
        mapPartitioningRow({
          strategy: 'r',
          partition_key_def: 'RANGE (order_date)',
          partition_count: 4,
        }),
      ).toEqual({ strategy: 'r', columns: ['order_date'], partitionCount: 4 });
    });

    it('returns undefined for a non-partitioned table (no strategy row)', () => {
      expect(mapPartitioningRow(undefined)).toBeUndefined();
      expect(mapPartitioningRow({})).toBeUndefined();
    });
  });

  describe('mapTableStatisticsRow', () => {
    it('wraps every field in a MetricValue with its own source/estimated/unit', () => {
      // node-postgres parses timestamptz columns into Date objects, and
      // pg_table_size()/friends return bigint as a string (precision
      // safety) - both are exercised here, not just the "nice" JS-native
      // number/string case.
      const result = mapTableStatisticsRow({
        estimated_row_count: 50,
        table_bytes: '8192',
        index_bytes: 65536,
        total_bytes: 73728,
        n_mod_since_analyze: 50,
        last_analyze: new Date('2026-08-16T06:51:39.276Z'),
        last_autoanalyze: null,
      });

      expect(result?.estimatedRowCount).toEqual({
        value: 50,
        estimated: true,
        source: 'pg_class.reltuples',
        unit: 'rows',
      });
      expect(result?.tableBytes).toEqual({
        value: 8192,
        estimated: false,
        source: 'pg_table_size',
        unit: 'bytes',
      });
      expect(result?.statisticsUpdatedAt).toEqual({
        value: '2026-08-16T06:51:39.276Z',
        estimated: false,
        source: 'pg_stat_user_tables.last_analyze',
        unit: undefined,
      });
    });
  });

  describe('mapColumnStatisticsRows', () => {
    it('converts a non-negative n_distinct to an absolute distinctCount', () => {
      const [status] = mapColumnStatisticsRows([
        {
          attname: 'status',
          n_distinct: 2,
          null_frac: 0,
          avg_width: 5,
          correlation: 0.5689796,
          reltuples: 50,
        },
      ]);
      expect(status.distinctCount).toEqual({
        value: 2,
        estimated: true,
        source: 'pg_stats.n_distinct',
        unit: 'values',
      });
      expect(status.distinctFraction?.value).toBeCloseTo(2 / 50);
    });

    it('converts a negative n_distinct (scales with row count) to a fraction and back to a count', () => {
      const [customerId] = mapColumnStatisticsRows([
        {
          attname: 'customer_id',
          n_distinct: -1,
          null_frac: 0,
          avg_width: 4,
          correlation: 1,
          reltuples: 50,
        },
      ]);
      expect(customerId.distinctFraction).toEqual({
        value: 1,
        estimated: true,
        source: 'pg_stats.n_distinct',
        unit: undefined,
      });
      expect(customerId.distinctCount?.value).toBe(50);
    });

    it('drops a row without a column name instead of throwing', () => {
      expect(mapColumnStatisticsRows([{ n_distinct: 1 }])).toEqual([]);
    });
  });

  describe('mapPhysicalHealthRow', () => {
    it('computes deadTupleRatio only when both live and dead tuples are known', () => {
      const result = mapPhysicalHealthRow({
        n_live_tup: 90,
        n_dead_tup: 10,
        n_mod_since_analyze: 5,
        last_vacuum: null,
        last_autovacuum: new Date('2026-08-16T00:00:00.000Z'),
        last_analyze: null,
        last_autoanalyze: null,
      });

      const byName = Object.fromEntries(result.metrics.map((m) => [m.name, m]));
      expect(byName.liveTuples.value).toBe(90);
      expect(byName.deadTuples.value).toBe(10);
      expect(byName.deadTupleRatio.value).toBeCloseTo(0.1);
      expect(byName.lastAutovacuum.value).toBe('2026-08-16T00:00:00.000Z');
      expect(byName.lastVacuum).toBeUndefined();
    });

    it('never throws for missing/malformed input and omits absent metrics', () => {
      expect(mapPhysicalHealthRow(undefined)).toEqual({ metrics: [] });
      expect(mapPhysicalHealthRow({}).metrics.find((m) => m.name === 'deadTupleRatio')).toBeUndefined();
    });
  });

  describe('renderPostgresTableDdl', () => {
    it('renders columns, constraints and non-constraint-backed indexes without duplication', () => {
      const ddl = renderPostgresTableDdl({
        schemaName: 'public',
        tableName: 'perf_orders',
        columns: [
          { columnName: 'id', dataType: 'integer', nullable: false },
          { columnName: 'amount', dataType: 'numeric(10,2)', nullable: true },
        ],
        constraints: [
          { constraintName: 'perf_orders_pkey', type: 'primaryKey', columns: ['id'] },
          {
            constraintName: 'perf_orders_amount_check',
            type: 'check',
            checkExpression: '(amount >= (0)::numeric)',
          },
        ],
        indexes: [
          {
            indexName: 'perf_orders_pkey', // constraint-backed - must not be restated
            unique: true,
            primary: true,
            columns: [{ columnName: 'id', direction: 'asc' }],
          },
          {
            indexName: 'idx_perf_orders_status_partial',
            unique: false,
            columns: [{ columnName: 'status', direction: 'asc' }],
            predicate: "((status)::text = 'shipped'::text)",
          },
        ],
      });

      expect(ddl).toContain('CREATE TABLE public.perf_orders (');
      expect(ddl).toContain('CONSTRAINT perf_orders_pkey PRIMARY KEY (id)');
      expect(ddl).toContain('CHECK ((amount >= (0)::numeric))');
      expect(ddl).toContain(
        "CREATE INDEX idx_perf_orders_status_partial ON public.perf_orders (status) WHERE ((status)::text = 'shipped'::text);",
      );
      // The PK-backed index must appear exactly once (inside the CONSTRAINT
      // clause), not a second time as its own CREATE UNIQUE INDEX.
      expect(ddl.match(/perf_orders_pkey/g)).toHaveLength(1);
    });
  });
});
