import {
  DbDynamoTable,
  DYNAMODB_OPERATION_SELECTOR_ID,
  DynamoDbMetricServiceAdapter,
  fromJson,
  resolveDynamoDbBillingMode,
} from '../../../src';

describe('resolveDynamoDbBillingMode', () => {
  it.each([
    [{ billingMode: 'PROVISIONED' }, 'PROVISIONED'],
    [{ billingMode: 'PAY_PER_REQUEST' }, 'PAY_PER_REQUEST'],
    [{ readCapacityUnits: 0 }, 'PROVISIONED'],
    [{ writeCapacityUnits: 0 }, 'PROVISIONED'],
    [{}, 'unknown'],
  ] as const)('normalizes %j to %s', (input, expected) => {
    expect(resolveDynamoDbBillingMode(input)).toBe(expected);
  });
});

describe('DynamoDB dashboard capability', () => {
  it('round-trips on a DynamoDB table resource', () => {
    const table = new DbDynamoTable('orders', { lsi: [], gsi: [] });

    expect(table.capabilities?.dashboards).toEqual([
      {
        dashboardId: 'aws-cloudwatch-metrics',
        providerId: 'aws.dynamodb.table',
      },
    ]);
    expect(fromJson(JSON.parse(table.toJsonStringify())).capabilities).toEqual(
      table.capabilities,
    );
  });
});

describe('DynamoDbMetricServiceAdapter', () => {
  it('uses the legacy provisioned fallback and expands all GSI dimensions', async () => {
    const adapter = new DynamoDbMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 5,
        gsi: [
          {
            IndexName: 'by-status',
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 2,
          },
          {
            IndexName: 'by-customer',
            ReadCapacityUnits: 4,
            WriteCapacityUnits: 1,
          },
        ],
      },
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const panels = dashboard.tabs[0].panels;
    const consumed = panels.find((panel) => panel.id === 'consumed-capacity')!;
    const limits = panels.find((panel) => panel.id === 'capacity-limits')!;

    expect(target.variant).toBe('provisioned');
    expect(consumed.queries).toHaveLength(6);
    expect(limits.queries).toHaveLength(6);
    expect(
      consumed.queries
        .flatMap((item) => item.dimensions)
        .filter((item) => item.Name === 'GlobalSecondaryIndexName')
        .map((item) => item.Value),
    ).toEqual(['by-status', 'by-status', 'by-customer', 'by-customer']);
    expect(
      limits.queries.every((item) => item.metricName.startsWith('Provisioned')),
    ).toBe(true);
    expect(consumed.caveat).toContain('not the capacity consumed by one');
  });

  it('shows only explicit on-demand limits and keeps custom endpoint policy', async () => {
    const adapter = new DynamoDbMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'events',
      region: 'us-east-1',
      endpoint: 'http://127.0.0.1:4566',
      attributes: {
        BillingMode: 'PAY_PER_REQUEST',
        OnDemandMaxReadRequestUnits: 100,
        gsi: [{ IndexName: 'by-type', OnDemandMaxWriteRequestUnits: 50 }],
      },
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const limits = dashboard.tabs[0].panels.find(
      (panel) => panel.id === 'capacity-limits',
    )!;

    expect(target.endpoint.endpoint).toBe('http://127.0.0.1:4566');
    expect(target.variant).toBe('pay_per_request');
    expect(limits.queries.map((item) => item.metricName)).toEqual([
      'OnDemandMaxReadRequestUnits',
      'OnDemandMaxWriteRequestUnits',
    ]);
  });

  it('re-resolves operation panels through the generic selector contract', async () => {
    const adapter = new DynamoDbMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'orders',
      region: 'ap-northeast-1',
      attributes: { BillingMode: 'PAY_PER_REQUEST', gsi: [] },
    });
    const queryDashboard = await adapter.resolveDashboard(target, {});
    const partiqlDashboard = await adapter.resolveDashboard(target, {
      [DYNAMODB_OPERATION_SELECTOR_ID]: 'ExecuteStatement',
    });
    const queryPanels = queryDashboard.tabs[0].panels;
    const partiqlPanels = partiqlDashboard.tabs[0].panels;
    const latency = partiqlPanels.find(
      (panel) => panel.id === 'request-latency',
    )!;

    expect(queryPanels.map((panel) => panel.id)).toContain('returned-items');
    expect(partiqlPanels.map((panel) => panel.id)).not.toContain(
      'returned-items',
    );
    expect(
      latency.queries.every((item) =>
        item.dimensions.some(
          (dimension) =>
            dimension.Name === 'Verb' && dimension.Value === 'PartiQLSelect',
        ),
      ),
    ).toBe(true);
    expect(queryDashboard.tabs[0].selectors[0].value).toBe('Query');
    expect(partiqlDashboard.tabs[0].selectors[0].value).toBe(
      'ExecuteStatement',
    );
  });

  it('adds the collapsed TTL lifecycle panel only for an enabled table', async () => {
    const adapter = new DynamoDbMetricServiceAdapter();
    const target = await adapter.resolveTarget({
      resourceKey: 'runtime-key',
      displayName: 'sessions',
      region: 'ap-northeast-1',
      attributes: {
        BillingMode: 'PAY_PER_REQUEST',
        gsi: [],
        ttl: { TimeToLiveStatus: 'ENABLED', AttributeName: 'expiresAt' },
      },
    });
    const dashboard = await adapter.resolveDashboard(target, {});
    const ttl = dashboard.tabs[0].panels.find(
      (panel) => panel.id === 'ttl-deletions',
    );

    expect(ttl?.collapsedByDefault).toBe(true);
    expect(ttl?.queries[0].metricName).toBe('TimeToLiveDeletedItemCount');
  });
});
