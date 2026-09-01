import {
  createDrawioErDiagram,
  createDrawioErDiagramAsync,
  DbColumn,
  DbTable,
  ERDiagramParams,
} from '../../src';
import { disposeAutoLayoutEngine } from '../../src/utils/diagramLayout';


afterAll(() => {
  disposeAutoLayoutEngine();
});

const table = (name: string, comment?: string): DbTable => new DbTable(name, 'TABLE', comment);

describe('createDrawioErDiagramAsync', () => {
  it('produces well-formed draw.io XML and keeps PK/FK/type/comment information', async () => {
    const orders = table('orders', 'Orders');
    orders.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    orders.addChild(new DbColumn('customer_id', 'integer', { nullable: false }, 'FK to customers'));
    orders.foreignKeys = {
      referenceTo: { customer_id: { tableName: 'customers', columnName: 'id', constraintName: 'orders_customer_fk' } },
    };
    const customers = table('customers', 'Customers');
    customers.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));

    const params: ERDiagramParams = {
      title: 'Orders',
      tableItems: [
        { tableRes: orders, columnNames: ['id', 'customer_id'] },
        { tableRes: customers, columnNames: ['id'] },
      ],
      relations: [{
        name: 'orders_customer_fk',
        dotted: true,
        referencedFrom: { tableName: 'orders', columnName: 'customer_id', cardinality: '>=1' },
        referenceTo: { tableName: 'customers', columnName: 'id', cardinality: '1' },
      }],
    };

    const drawio = await createDrawioErDiagramAsync(params);
    expect(drawio).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(drawio.match(/<mxfile/g)).toHaveLength(1);
    expect(drawio).toContain('id="table_0_key_0" value="PK"');
    expect(drawio).toContain('id="table_0_key_1" value="FK NN"');
    expect(drawio).toContain('id="table_0_column_0" value="id: INTEGER"');
    expect(drawio).toContain('orders_customer_fk');
    expect(drawio).toContain('dashed=1;dashPattern=6 6;');
    // Cell ids stay unique.
    const ids = [...drawio.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    const counts = ids.reduce<Record<string, number>>((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {});
    expect(Object.entries(counts).filter(([, count]) => count > 1)).toEqual([]);
  });

  it('connects the FK edge to the declaring/referenced column row, not just the table', async () => {
    const orders = table('orders');
    orders.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    orders.addChild(new DbColumn('note', 'varchar', { nullable: true }));
    orders.addChild(new DbColumn('customer_id', 'integer', { nullable: false }));
    orders.foreignKeys = {
      referenceTo: { customer_id: { tableName: 'customers', columnName: 'id', constraintName: 'fk1' } },
    };
    const customers = table('customers');
    customers.addChild(new DbColumn('note', 'varchar', { nullable: true }));
    customers.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));

    const params: ERDiagramParams = {
      title: 't',
      tableItems: [
        { tableRes: orders, columnNames: ['id', 'note', 'customer_id'] },
        { tableRes: customers, columnNames: ['note', 'id'] },
      ],
      relations: [{
        name: 'fk1',
        dotted: true,
        referencedFrom: { tableName: 'orders', columnName: 'customer_id', cardinality: '>=1' },
        referenceTo: { tableName: 'customers', columnName: 'id', cardinality: '1' },
      }],
    };

    const drawio = await createDrawioErDiagramAsync(params);
    const tableMatch = (id: string): { x: number; y: number; width: number; height: number } => {
      const m = drawio.match(new RegExp(`id="${id}"[^>]*><mxGeometry x="([-\\d.]+)" y="([-\\d.]+)" width="([-\\d.]+)" height="([-\\d.]+)"`));
      if (!m) throw new Error(`cell ${id} not found`);
      return { x: Number(m[1]), y: Number(m[2]), width: Number(m[3]), height: Number(m[4]) };
    };
    const edgeMatch = drawio.match(/id="edge_0"[^>]*style="([^"]*)"/);
    expect(edgeMatch).not.toBeNull();
    const style = edgeMatch![1];
    const exitY = Number(style.match(/exitY=([\d.]+)/)?.[1]);
    const entryY = Number(style.match(/entryY=([\d.]+)/)?.[1]);

    // orders has 3 rows (id, note, customer_id) - customer_id is the 3rd row (index 2 of 3), so its row-center fraction should sit in the back third of the table, not near the top.
    expect(exitY).toBeGreaterThan(0.6);
    // customers has 2 rows (note, id) - id is the 2nd row, so its fraction should be in the back half, clearly below note's row.
    expect(entryY).toBeGreaterThan(0.5);
    void tableMatch;
  });

  it('handles a self-referencing foreign key (e.g. an employee manager_id) without error', async () => {
    const employees = table('employees');
    employees.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    employees.addChild(new DbColumn('manager_id', 'integer', { nullable: true }));
    employees.foreignKeys = {
      referenceTo: { manager_id: { tableName: 'employees', columnName: 'id', constraintName: 'fk_self' } },
    };
    const params: ERDiagramParams = {
      title: 't',
      tableItems: [{ tableRes: employees, columnNames: ['id', 'manager_id'] }],
      relations: [{
        name: 'fk_self',
        dotted: true,
        referencedFrom: { tableName: 'employees', columnName: 'manager_id', cardinality: '0' },
        referenceTo: { tableName: 'employees', columnName: 'id', cardinality: '1' },
      }],
    };
    const drawio = await createDrawioErDiagramAsync(params);
    expect(drawio).toContain('source="table_0" target="table_0"');
    expect(drawio).toContain('fk_self');
  });

  it('handles a mutual/cyclic reference between two tables without error', async () => {
    const orders = table('orders');
    orders.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    orders.addChild(new DbColumn('shipping_address_id', 'integer', { nullable: true }));
    const addresses = table('addresses');
    addresses.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    addresses.addChild(new DbColumn('order_id', 'integer', { nullable: true }));

    const params: ERDiagramParams = {
      title: 't',
      tableItems: [
        { tableRes: orders, columnNames: ['id', 'shipping_address_id'] },
        { tableRes: addresses, columnNames: ['id', 'order_id'] },
      ],
      relations: [
        {
          name: 'fk_order_address',
          dotted: true,
          referencedFrom: { tableName: 'orders', columnName: 'shipping_address_id', cardinality: '0' },
          referenceTo: { tableName: 'addresses', columnName: 'id', cardinality: '1' },
        },
        {
          name: 'fk_address_order',
          dotted: true,
          referencedFrom: { tableName: 'addresses', columnName: 'order_id', cardinality: '0' },
          referenceTo: { tableName: 'orders', columnName: 'id', cardinality: '1' },
        },
      ],
    };
    const drawio = await createDrawioErDiagramAsync(params);
    expect(drawio).toContain('fk_order_address');
    expect(drawio).toContain('fk_address_order');
    expect(drawio.match(/<mxCell id="edge_/g)).toHaveLength(2);
  });

  it('places an independent table with no relations without error', async () => {
    const lonely = table('lonely');
    lonely.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    const params: ERDiagramParams = {
      title: 't',
      tableItems: [{ tableRes: lonely, columnNames: ['id'] }],
      relations: [],
    };
    const drawio = await createDrawioErDiagramAsync(params);
    expect(drawio).toContain('id="table_0"');
    expect(drawio).not.toContain('<mxCell id="edge_');
  });

  it('keeps the same PK/FK/type information as the legacy renderer for the same input', async () => {
    const orders = table('orders', 'Orders');
    orders.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    orders.addChild(new DbColumn('customer_id', 'integer', { nullable: false }));
    orders.foreignKeys = {
      referenceTo: { customer_id: { tableName: 'customers', columnName: 'id', constraintName: 'fk1' } },
    };
    const customers = table('customers', 'Customers');
    customers.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    const params: ERDiagramParams = {
      title: 't',
      tableItems: [
        { tableRes: orders, columnNames: ['id', 'customer_id'] },
        { tableRes: customers, columnNames: ['id'] },
      ],
      relations: [{
        name: 'fk1',
        dotted: true,
        referencedFrom: { tableName: 'orders', columnName: 'customer_id', cardinality: '>=1' },
        referenceTo: { tableName: 'customers', columnName: 'id', cardinality: '1' },
      }],
    };
    const legacy = createDrawioErDiagram(params);
    const auto = await createDrawioErDiagramAsync(params);
    const extractKeysAndTypes = (drawio: string): string[] =>
      [...drawio.matchAll(/id="table_\d+_(?:key|column)_\d+" value="([^"]*)"/g)].map((m) => m[1]).sort();
    expect(extractKeysAndTypes(auto)).toEqual(extractKeysAndTypes(legacy));
  });

  it('leaves each long FK label enough room that it does not land on the neighboring table', async () => {
    const orderDetail = table('order_detail', '受注明細');
    orderDetail.addChild(new DbColumn('order_no', 'integer', { key: 'PRI', nullable: false }));
    orderDetail.addChild(new DbColumn('detail_no', 'integer', { key: 'PRI', nullable: false }));
    const order = table('order', '受注');
    order.addChild(new DbColumn('order_no', 'integer', { key: 'PRI', nullable: false }));
    order.addChild(new DbColumn('customer_no', 'integer', { nullable: false }));
    const customer = table('customer', '顧客');
    customer.addChild(new DbColumn('customer_no', 'integer', { key: 'PRI', nullable: false }));
    customer.addChild(new DbColumn('tel', 'varchar', { nullable: true }));

    const params: ERDiagramParams = {
      title: 't',
      tableItems: [
        { tableRes: orderDetail, columnNames: ['order_no', 'detail_no'] },
        { tableRes: order, columnNames: ['order_no', 'customer_no'] },
        { tableRes: customer, columnNames: ['customer_no', 'tel'] },
      ],
      relations: [
        {
          name: 'order_detail_ibfk_1',
          dotted: false,
          referencedFrom: { tableName: 'order_detail', columnName: 'order_no', cardinality: '>=1' },
          referenceTo: { tableName: 'order', columnName: 'order_no', cardinality: '1' },
        },
        {
          name: 'order_ibfk_1',
          dotted: true,
          referencedFrom: { tableName: 'order', columnName: 'customer_no', cardinality: '>=1' },
          referenceTo: { tableName: 'customer', columnName: 'customer_no', cardinality: '1' },
        },
      ],
    };

    const drawio = await createDrawioErDiagramAsync(params);
    const box = (id: string): { x: number; y: number; width: number; height: number } => {
      const m = drawio.match(new RegExp(`id="${id}"[^>]*><mxGeometry x="([-\\d.]+)" y="([-\\d.]+)" width="([-\\d.]+)" height="([-\\d.]+)"`));
      if (!m) throw new Error(`cell ${id} not found`);
      return { x: Number(m[1]), y: Number(m[2]), width: Number(m[3]), height: Number(m[4]) };
    };
    const tableBoxes = [box('table_0'), box('table_1'), box('table_2')].sort((a, b) => a.x - b.x);

    // Each relation's rendered label text must have enough horizontal room in the gap between whichever two tables it actually sits between, not overlap into a table's own column area.
    for (let i = 0; i < tableBoxes.length - 1; i++) {
      const gap = tableBoxes[i + 1].x - (tableBoxes[i].x + tableBoxes[i].width);
      // "orders_customer_fk: customer_id >=1 → id 1"-shaped labels render well over 200px wide; a gap anywhere near the pre-fix ~60-120px default would fail this.
      expect(gap).toBeGreaterThan(200);
    }
  });

  it('still draws the FK line when its column is excluded from columnNames, attached to the table itself', async () => {
    const orders = table('orders');
    orders.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));
    orders.addChild(new DbColumn('customer_id', 'integer', { nullable: false }));
    const customers = table('customers');
    customers.addChild(new DbColumn('id', 'integer', { key: 'PRI', nullable: false }));

    const params: ERDiagramParams = {
      title: 't',
      tableItems: [
        // customer_id (the FK column) is deliberately left out of columnNames.
        { tableRes: orders, columnNames: ['id'] },
        { tableRes: customers, columnNames: ['id'] },
      ],
      relations: [{
        name: 'fk1',
        dotted: true,
        referencedFrom: { tableName: 'orders', columnName: 'customer_id', cardinality: '>=1' },
        referenceTo: { tableName: 'customers', columnName: 'id', cardinality: '1' },
      }],
    };

    const drawio = await createDrawioErDiagramAsync(params);
    expect(drawio).toContain('fk1');
    expect(drawio).toMatch(/<mxCell id="edge_0"[^>]*source="table_0" target="table_1"/);
  });
});
