import {
  createDrawioErDiagram,
  createErDiagram,
  createERDiagramParams,
  createFullSchemaERDiagramParams,
  createSimpleERDiagramParams,
  DbColumn,
  DbSchema,
  DbTable,
} from '../../src';


const buildOrdersCustomersSchema = (): { schema: DbSchema; orders: DbTable; customers: DbTable } => {
  const schema = new DbSchema('public');

  const customers = new DbTable('customers', 'TABLE', 'Customers');
  customers.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
  schema.addChild(customers);

  const orders = new DbTable('orders', 'TABLE', 'Orders');
  orders.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
  orders.addChild(new DbColumn('customer_id', 'integer', { nullable: false }));
  orders.foreignKeys = {
    referenceTo: {
      customer_id: { tableName: 'customers', columnName: 'id', constraintName: 'orders_customer_fk' },
    },
  };
  schema.addChild(orders);
  customers.foreignKeys = {
    referencedFrom: {
      id: { tableName: 'orders', columnName: 'customer_id', constraintName: 'orders_customer_fk' },
    },
  };

  return { schema, orders, customers };
};

describe('createERDiagramParams / createErDiagram (Mermaid)', () => {
  it('builds a relation with cardinality derived from PK/nullability and renders it as Mermaid erDiagram', () => {
    const { schema, orders, customers } = buildOrdersCustomersSchema();
    const params = createERDiagramParams([orders, customers], {
      title: 'Orders',
      items: [
        { tableName: 'orders', columnNames: ['id', 'customer_id'] },
        { tableName: 'customers', columnNames: ['id'] },
      ],
    });

    expect(params.relations).toHaveLength(1);
    expect(params.relations[0]).toMatchObject({
      name: 'orders_customer_fk',
      referencedFrom: { tableName: 'orders', columnName: 'customer_id', cardinality: '>=1' },
      referenceTo: { tableName: 'customers', columnName: 'id', cardinality: '1' },
    });

    const mermaid = createErDiagram(params);
    expect(mermaid).toContain('```mermaid');
    expect(mermaid).toContain('orders {');
    expect(mermaid).toContain('customers {');
    expect(mermaid).toContain('INTEGER id PK');
    // dotted=true (non-identifying): customer_id is not part of a composite PK on orders.
    expect(mermaid).toContain(
      'orders }|..|| customers: "orders_customer_fk"',
    );
    void schema;
  });

  it('deduplicates a foreign key relation proven from both sides (referenceTo and referencedFrom)', () => {
    const { orders, customers } = buildOrdersCustomersSchema();
    const params = createERDiagramParams([orders, customers], {
      title: 'Orders',
      items: [
        { tableName: 'orders', columnNames: ['id', 'customer_id'] },
        { tableName: 'customers', columnNames: ['id'] },
      ],
    });
    // Both orders.foreignKeys.referenceTo and customers.foreignKeys.referencedFrom describe the same constraint - it must appear exactly once, not twice.
    expect(params.relations.filter((r) => r.name === 'orders_customer_fk')).toHaveLength(1);
  });

  // Regression test (found via review): dedup used to key off `constraintName` alone, which silently dropped a composite FK's second+ column pair (they all share one constraint name)
  it('keeps every column pair of a composite FK, not just the first one sharing its constraint name', () => {
    const orderItems = new DbTable('order_items', 'TABLE');
    orderItems.addChild(new DbColumn('order_id', 'integer', { nullable: false }));
    orderItems.addChild(new DbColumn('warehouse_id', 'integer', { nullable: false }));
    const orderWarehouses = new DbTable('order_warehouses', 'TABLE');
    orderWarehouses.addChild(new DbColumn('order_id', 'integer', { key: 'PRI', nullable: false }));
    orderWarehouses.addChild(new DbColumn('warehouse_id', 'integer', { key: 'PRI', nullable: false }));
    orderItems.foreignKeys = {
      referenceTo: {
        order_id: { tableName: 'order_warehouses', columnName: 'order_id', constraintName: 'fk_composite' },
        warehouse_id: { tableName: 'order_warehouses', columnName: 'warehouse_id', constraintName: 'fk_composite' },
      },
    };

    const params = createERDiagramParams([orderItems, orderWarehouses], {
      title: 't',
      items: [
        { tableName: 'order_items', columnNames: ['order_id', 'warehouse_id'] },
        { tableName: 'order_warehouses', columnNames: ['order_id', 'warehouse_id'] },
      ],
    });

    const composite = params.relations.filter((r) => r.name === 'fk_composite');
    expect(composite).toHaveLength(2);
    expect(composite.map((r) => r.referencedFrom.columnName).sort()).toEqual(['order_id', 'warehouse_id']);
  });

  it('does not drop a relation whose constraint name happens to collide with an unrelated table\'s', () => {
    const a = new DbTable('a', 'TABLE');
    a.addChild(new DbColumn('parent_id', 'integer', { nullable: false }));
    const parentOfA = new DbTable('parent_of_a', 'TABLE');
    parentOfA.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    a.foreignKeys = {
      referenceTo: { parent_id: { tableName: 'parent_of_a', columnName: 'id', constraintName: 'fk_parent' } },
    };

    const b = new DbTable('b', 'TABLE');
    b.addChild(new DbColumn('parent_id', 'integer', { nullable: false }));
    const parentOfB = new DbTable('parent_of_b', 'TABLE');
    parentOfB.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    // Same generic constraint name as `a`'s FK, but a genuinely different relation.
    b.foreignKeys = {
      referenceTo: { parent_id: { tableName: 'parent_of_b', columnName: 'id', constraintName: 'fk_parent' } },
    };

    const params = createERDiagramParams([a, parentOfA, b, parentOfB], {
      title: 't',
      items: [
        { tableName: 'a', columnNames: ['parent_id'] },
        { tableName: 'parent_of_a', columnNames: ['id'] },
        { tableName: 'b', columnNames: ['parent_id'] },
        { tableName: 'parent_of_b', columnNames: ['id'] },
      ],
    });

    const named = params.relations.filter((r) => r.name === 'fk_parent');
    expect(named).toHaveLength(2);
    expect(named.map((r) => r.referencedFrom.tableName).sort()).toEqual(['a', 'b']);
  });

  it('createSimpleERDiagramParams pulls in the related table automatically from the schema', () => {
    const { schema, orders } = buildOrdersCustomersSchema();
    const params = createSimpleERDiagramParams(schema, orders);
    expect(params.tableItems.map((item) => item.tableRes.name).sort()).toEqual([
      'customers',
      'orders',
    ]);
    expect(params.relations).toHaveLength(1);
  });

  it('createSimpleERDiagramParams finds the child relation when opened from the referenced parent table', () => {
    const { schema, customers } = buildOrdersCustomersSchema();
    const params = createSimpleERDiagramParams(schema, customers);

    expect(params.tableItems.map((item) => item.tableRes.name).sort()).toEqual([
      'customers',
      'orders',
    ]);
    expect(params.relations).toHaveLength(1);
    expect(params.relations[0].referencedFrom).toMatchObject({
      tableName: 'orders',
      columnName: 'customer_id',
    });
  });

  it('createERDiagramParams resolves a relation available only through referencedFrom metadata', () => {
    const { orders, customers } = buildOrdersCustomersSchema();
    orders.foreignKeys = undefined;

    const params = createERDiagramParams([orders, customers], {
      title: 'Customers',
      items: [
        { tableName: 'customers', columnNames: ['id'] },
        { tableName: 'orders', columnNames: ['id', 'customer_id'] },
      ],
    });

    expect(params.relations).toHaveLength(1);
    expect(params.relations[0].referencedFrom).toMatchObject({
      tableName: 'orders',
      columnName: 'customer_id',
    });
  });

  it('escapes quotes in the YAML title and on both sides of a Mermaid relation', () => {
    const fromTable = new DbTable('order"items', 'TABLE');
    fromTable.addChild(new DbColumn('customer_id', 'integer', { nullable: false }));
    const toTable = new DbTable('customer"records', 'TABLE');
    toTable.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    fromTable.foreignKeys = {
      referenceTo: {
        customer_id: {
          tableName: toTable.name,
          columnName: 'id',
          constraintName: 'orders_customer_fk',
        },
      },
    };

    const mermaid = createErDiagram(
      createERDiagramParams([fromTable, toTable], {
        title: 'Table for "legacy" orders',
        items: [
          { tableName: fromTable.name, columnNames: ['customer_id'] },
          { tableName: toTable.name, columnNames: ['id'] },
        ],
      }),
    );

    expect(mermaid).toContain('title: "Table for \\"legacy\\" orders"');
    expect(mermaid).toContain(
      'order#quot;items }|..|| customer#quot;records: "orders_customer_fk"',
    );
  });

  it('keeps a NOT NULL, non-PK column annotated as "NN" instead of emitting invalid ER syntax', () => {
    const table = new DbTable('widgets', 'TABLE');
    table.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    table.addChild(new DbColumn('sku', 'varchar', { nullable: false }));
    const params = createSimpleERDiagramParams(undefined, table);
    const mermaid = createErDiagram(params);
    expect(mermaid).toContain('VARCHAR sku  "NN"');
  });

  it('createFullSchemaERDiagramParams includes every table in the schema with all of its columns', () => {
    const { schema } = buildOrdersCustomersSchema();
    const params = createFullSchemaERDiagramParams(schema);

    expect(params.title).toBe('public');
    expect(params.tableItems.map((item) => item.tableRes.name).sort()).toEqual([
      'customers',
      'orders',
    ]);
    expect(params.tableItems.find((item) => item.tableRes.name === 'orders')?.columnNames).toEqual([
      'id',
      'customer_id',
    ]);
    expect(params.relations).toHaveLength(1);
  });
});

describe('createDrawioErDiagram', () => {
  it('creates an editable draw.io ER diagram with tables and relationships', () => {
    const { orders, customers } = buildOrdersCustomersSchema();
    const params = createERDiagramParams([orders, customers], {
      title: 'Orders',
      items: [
        { tableName: 'orders', columnNames: ['id', 'customer_id'] },
        { tableName: 'customers', columnNames: ['id'] },
      ],
    });

    const diagram = createDrawioErDiagram(params);

    const ids = [...diagram.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    const counts = ids.reduce<Record<string, number>>((result, id) => {
      result[id] = (result[id] ?? 0) + 1;
      return result;
    }, {});

    expect(diagram).toContain('name="ER Diagram"');
    expect(diagram).toContain('orders_customer_fk');
    expect(diagram).toContain('id="table_0_key_0" value="PK"');
    expect(diagram).toContain('id="table_0_key_1" value="FK NN"');
    expect(diagram).toContain('id="table_0_column_0" value="id: INTEGER"');
    expect(diagram).not.toContain('NOT NULL');
    // draw.io cell ids must be unique within the document.
    expect(Object.entries(counts).filter(([, count]) => count > 1)).toEqual([]);
  });
});
