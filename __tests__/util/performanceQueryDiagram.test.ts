import { PerformanceTuningContext } from '../../src/types';
import { createPerformanceQueryDiagram } from '../../src/utils/er';

function context(): PerformanceTuningContext {
  return {
    formatVersion: 1,
    database: { vendor: 'PostgreSQL', databaseName: 'app' },
    statement: { sql: 'select * from orders o join customers c on c.id = o.customer_id', source: 'editor' },
    executionPlan: { mode: 'estimate', format: 'json' },
    tables: [
      {
        schemaName: 'public',
        tableName: 'orders',
        definition: {
          columns: [
            { columnName: 'id', dataType: 'bigint', nullable: false },
            { columnName: 'customer_id', dataType: 'bigint', nullable: false },
            { columnName: 'status', dataType: 'varchar(20)', nullable: false },
            { columnName: 'unused_payload', dataType: 'text', nullable: true },
          ],
          constraints: [
            { type: 'primaryKey', columns: ['id'], constraintName: 'orders_pkey' },
            {
              type: 'foreignKey',
              columns: ['customer_id'],
              referencedSchemaName: 'public',
              referencedTableName: 'customers',
              referencedColumns: ['id'],
              constraintName: 'orders_customer_fk',
            },
          ],
          indexes: [],
        },
      },
      {
        schemaName: 'public',
        tableName: 'customers',
        definition: {
          columns: [
            { columnName: 'id', dataType: 'bigint', nullable: false },
            { columnName: 'email', dataType: 'varchar(255)', nullable: false },
          ],
          constraints: [
            { type: 'primaryKey', columns: ['id'], constraintName: 'customers_pkey' },
            { type: 'uniqueKey', columns: ['email'], constraintName: 'customers_email_uk' },
          ],
          indexes: [],
        },
      },
    ],
    planTableMappings: [
      {
        planNodeId: 'n1',
        schemaName: 'public',
        tableName: 'orders',
        alias: 'o',
        filterColumns: ['status'],
        joinColumns: ['customer_id'],
      },
      {
        planNodeId: 'n2',
        schemaName: 'public',
        tableName: 'customers',
        alias: 'c',
        joinColumns: ['id'],
      },
    ],
    collection: {
      collectedAt: '2026-08-22T00:00:00.000Z',
      status: 'complete',
      diagnostics: [],
      unavailableSections: [],
    },
  };
}

describe('createPerformanceQueryDiagram', () => {
  it('renders only query-relevant/key columns and an unambiguous declared FK', () => {
    const result = createPerformanceQueryDiagram(context());

    expect(result).toBeDefined();
    expect(result?.mermaid).toContain('erDiagram');
    expect(result?.mermaid).toContain('public_orders_o');
    expect(result?.mermaid).toContain('public_customers_c');
    expect(result?.mermaid).toContain('BIGINT customer_id FK');
    expect(result?.mermaid).toContain('VARCHAR email UK');
    expect(result?.mermaid).toContain('orders_customer_fk');
    expect(result?.mermaid).toContain('--||');
    expect(result?.mermaid).not.toContain('unused_payload');
    expect(result?.warnings).toEqual([]);
  });

  it('keeps self-join aliases separate and refuses to guess an ambiguous FK endpoint', () => {
    const value = context();
    value.tables = [value.tables[0]];
    value.tables[0].definition!.constraints.push({
      type: 'foreignKey',
      columns: ['customer_id'],
      referencedSchemaName: 'public',
      referencedTableName: 'orders',
      referencedColumns: ['id'],
      constraintName: 'orders_parent_fk',
    });
    value.planTableMappings = [
      { ...value.planTableMappings[0], alias: 'child' },
      { ...value.planTableMappings[0], planNodeId: 'n2', alias: 'parent' },
    ];

    const result = createPerformanceQueryDiagram(value);
    expect(result?.mermaid).toContain('public_orders_child');
    expect(result?.mermaid).toContain('public_orders_parent');
    expect(result?.mermaid).not.toContain('orders_parent_fk"');
    expect(result?.warnings.join(' ')).toContain('ambiguous');
  });

  it('draws an AST-resolved SQL join as a dotted relation when no FK is declared', () => {
    const value = context();
    value.tables[0].definition!.constraints = value.tables[0].definition!.constraints.filter(
      (constraint) => constraint.type !== 'foreignKey',
    );
    value.planTableMappings[0].joinColumns = undefined;

    const result = createPerformanceQueryDiagram(value);
    expect(result?.mermaid).toContain('}o..o{');
    expect(result?.mermaid).toContain('SQL JOIN: c.id = o.customer_id');
    expect(result?.mermaid).toContain('BIGINT customer_id');
    expect(result?.warnings).toEqual([]);
  });

  it('returns undefined when no query table facts were collected', () => {
    const value = context();
    value.tables = [];
    value.planTableMappings = [];
    expect(createPerformanceQueryDiagram(value)).toBeUndefined();
  });

  it('uses Mermaid-safe physical names and concise base types', () => {
    const value = context();
    value.tables[0].definition!.columns[2] = {
      columnName: 'Order ID',
      dataType: 'NUMBER(10,0)',
      nullable: false,
    };
    value.tables[0].definition!.columns[1].dataType = 'VARCHAR2(24)';
    value.planTableMappings[0].filterColumns = ['Order ID'];

    const result = createPerformanceQueryDiagram(value);
    expect(result?.mermaid).toContain('NUMBER Order_ID "NOT NULL, WHERE"');
    expect(result?.mermaid).toContain('VARCHAR2 customer_id FK');
    expect(result?.mermaid).not.toContain('NUMBER_10_0');
    expect(result?.mermaid).not.toContain('"Order ID"');
  });
});
