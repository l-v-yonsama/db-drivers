import { TableDescription } from '@aws-sdk/client-dynamodb';
import {
  DynamoDbPerformanceTuningContextParams,
  DynamoDbPerformanceTuningDriverAccess,
  DynamoDbPerformanceTuningProvider,
  validateDynamoDbPerformanceTuningContext,
} from '../../../src';

const baseTable: TableDescription = {
  TableName: 'orders',
  TableStatus: 'ACTIVE',
  KeySchema: [
    { AttributeName: 'tenantId', KeyType: 'HASH' },
    { AttributeName: 'orderId', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'tenantId', AttributeType: 'S' },
    { AttributeName: 'orderId', AttributeType: 'S' },
    { AttributeName: 'tenantStatus', AttributeType: 'S' },
    { AttributeName: 'createdAt', AttributeType: 'S' },
  ],
  BillingModeSummary: { BillingMode: 'PAY_PER_REQUEST' },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'tenant-status-created-at-gsi',
      KeySchema: [
        { AttributeName: 'tenantStatus', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
      IndexStatus: 'ACTIVE',
    },
  ],
  ItemCount: 30000,
  TableSizeBytes: 1_000_000,
};

function createMockDriver(overrides?: Partial<DynamoDbPerformanceTuningDriverAccess>): DynamoDbPerformanceTuningDriverAccess {
  return {
    region: 'ap-northeast-1',
    endpointKind: 'aws',
    monitoringMode: 'enabled',
    describeTable: jest.fn().mockResolvedValue(baseTable),
    describeTimeToLive: jest.fn().mockResolvedValue({ TimeToLiveStatus: 'DISABLED' }),
    describeContributorInsights: jest.fn().mockResolvedValue({ status: 'DISABLED' }),
    collectCloudWatchMetrics: jest.fn().mockResolvedValue({
      ok: true,
      message: '',
      result: { window: { startTime: '2026-08-24T11:00:00.000Z', endTime: '2026-08-24T12:00:00.000Z', periodSeconds: 60 }, series: [] },
    }),
    observeNativeQueryRead: jest.fn(),
    observePartiqlRead: jest.fn(),
    ...overrides,
  };
}

function partiqlParams(overrides?: Partial<DynamoDbPerformanceTuningContextParams>): DynamoDbPerformanceTuningContextParams {
  return {
    statement: {
      source: 'sqlHistory',
      request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = ?` },
    },
    ...overrides,
  };
}

describe('DynamoDbPerformanceTuningProvider.checkCapabilities', () => {
  it('returns a static, always-available capability report that never claims IAM has been verified for observedRead', async () => {
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver());
    const result = await provider.checkCapabilities({ tableName: 'orders' });
    expect(result.ok).toBe(true);
    expect(result.result?.observedRead.available).toBe(true);
    expect(result.result?.observedRead.message).toMatch(/not pre-verified/i);
  });

  it.each([
    ['cloudWatchNotSelected', /not enabled for this connection/i],
    ['customEndpoint', /outside the scope of local\/custom/i],
  ] as const)('reports monitoring as unavailable when mode is %s', async (monitoringMode, message) => {
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver({ monitoringMode }));
    const result = await provider.checkCapabilities({ tableName: 'orders' });
    expect(result.result?.cloudWatchMetrics).toMatchObject({ available: false, message: expect.stringMatching(message) });
    expect(result.result?.contributorInsightsStatus).toMatchObject({ available: false, message: expect.stringMatching(message) });
  });
});

describe('DynamoDbPerformanceTuningProvider.collect (static mode, PartiQL)', () => {
  it('classifies a table Query and reports a complete collection with no scan diagnostic', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());

    expect(result.ok).toBe(true);
    expect(result.result?.accessPattern.accessPath).toBe('tableQuery');
    expect(result.result?.collection.status).toBe('complete');
    expect(result.result?.collection.diagnostics.some((d) => d.code === 'DYNAMODB_FULL_TABLE_SCAN')).toBe(false);
    expect(driver.describeTable).toHaveBeenCalledWith('orders');
    expect(validateDynamoDbPerformanceTuningContext(result.result)).toEqual([]);
  });

  it('maps PartiQLSelect to the ExecuteStatement CloudWatch operation', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());

    expect(result.ok).toBe(true);
    expect(driver.collectCloudWatchMetrics).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'ExecuteStatement' }),
    );
  });

  it('classifies a table Scan and reports DYNAMODB_FULL_TABLE_SCAN as an info-level-affecting-nothing warning', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({ statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders` } } }),
    );

    expect(result.ok).toBe(true);
    expect(result.result?.accessPattern.accessPath).toBe('tableScan');
    const scanDiag = result.result?.collection.diagnostics.find((d) => d.code === 'DYNAMODB_FULL_TABLE_SCAN');
    expect(scanDiag).toBeDefined();
    expect(scanDiag?.affectsCompleteness).toBe(false);
    // A full-scan warning alone must not flip status to partial.
    expect(result.result?.collection.status).toBe('complete');
  });

  it('classifies against a GSI as indexQuery/indexScan and only queries Contributor Insights for table + GSIs, never LSI', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({
        statement: {
          source: 'sqlHistory',
          request: { kind: 'partiql', text: `SELECT * FROM "orders"."tenant-status-created-at-gsi" WHERE tenantStatus = ?` },
        },
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.result?.accessPattern.accessPath).toBe('indexQuery');
    expect(result.result?.accessPattern.indexType).toBe('GSI');
    // table + the one GSI = 2 calls; never called for an LSI (none defined here).
    expect(driver.describeContributorInsights).toHaveBeenCalledTimes(2);
    expect(driver.describeContributorInsights).toHaveBeenCalledWith('orders', undefined);
    expect(driver.describeContributorInsights).toHaveBeenCalledWith('orders', 'tenant-status-created-at-gsi');
  });

  it('rejects when an explicit target does not match the table/index the statement references', async () => {
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver());
    const result = await provider.collect(partiqlParams({ target: { tableName: 'other-table' } }));
    expect(result.ok).toBe(false);
  });

  it('rejects when DescribeTable fails to resolve the table (no usable context)', async () => {
    const driver = createMockDriver({ describeTable: jest.fn().mockResolvedValue(undefined) });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.ok).toBe(false);
  });

  it('rejects when the statement references an index DescribeTable does not know about', async () => {
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver());
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM "orders"."no-such-index" WHERE x = ?` } },
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects an unparseable PartiQL statement before ever calling DescribeTable', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({ statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `not sql at all` } } }),
    );
    expect(result.ok).toBe(false);
    expect(driver.describeTable).not.toHaveBeenCalled();
  });

  it('sets observationEligibility.allowed to false when the statement has an unresolved bind marker, and true otherwise', async () => {
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver());

    const withMarker = await provider.collect(partiqlParams());
    expect(withMarker.result?.statement.observationEligibility.allowed).toBe(false);
    expect(withMarker.result?.statement.observationEligibility.reason).toBeTruthy();

    const withoutMarker = await provider.collect(
      partiqlParams({ statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = 'literal'` } } }),
    );
    expect(withoutMarker.result?.statement.observationEligibility.allowed).toBe(true);
  });

  it('degrades to partial with an unavailableSections entry when TTL collection throws, but still returns ok:true', async () => {
    const driver = createMockDriver({ describeTimeToLive: jest.fn().mockRejectedValue(new Error('boom')) });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.ok).toBe(true);
    expect(result.result?.collection.status).toBe('partial');
    expect(result.result?.collection.unavailableSections.some((s) => s.tableName === 'orders')).toBe(true);
  });

  it('degrades to partial when CloudWatch collection fails, without failing the whole request', async () => {
    const driver = createMockDriver({ collectCloudWatchMetrics: jest.fn().mockResolvedValue({ ok: false, message: 'AccessDenied' }) });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.ok).toBe(true);
    expect(result.result?.collection.status).toBe('partial');
    expect(result.result?.collection.unavailableSections.some((s) => s.section === 'cloudWatchMetrics')).toBe(true);
    expect(result.result?.cloudWatch).toBeUndefined();
  });

  it.each(['cloudWatchNotSelected', 'customEndpoint'] as const)(
    'skips CloudWatch and Contributor Insights without making collection partial when mode is %s',
    async (monitoringMode) => {
      const driver = createMockDriver({ monitoringMode });
      const provider = new DynamoDbPerformanceTuningProvider(driver);
      const result = await provider.collect(partiqlParams());

      expect(result.ok).toBe(true);
      expect(driver.collectCloudWatchMetrics).not.toHaveBeenCalled();
      expect(driver.describeContributorInsights).not.toHaveBeenCalled();
      expect(result.result?.cloudWatch).toBeUndefined();
      expect(result.result?.table.contributorInsights).toEqual([]);
      expect(result.result?.collection.status).toBe('complete');
      expect(result.result?.collection.unavailableSections).toEqual([]);
      expect(result.result?.collection.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'DYNAMODB_MONITORING_COLLECTION_SKIPPED',
            severity: 'info',
            affectsCompleteness: false,
          }),
        ]),
      );
      expect(validateDynamoDbPerformanceTuningContext(result.result)).toEqual([]);
    },
  );

  it('treats billingMode as PROVISIONED when BillingModeSummary is absent but ProvisionedThroughput is present (a legacy table never switched to on-demand)', async () => {
    const driver = createMockDriver({
      describeTable: jest.fn().mockResolvedValue({
        ...baseTable,
        BillingModeSummary: undefined,
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.ok).toBe(true);
    expect(result.result?.table.billingMode).toBe('PROVISIONED');
  });

  it('leaves billingMode as unknown when both BillingModeSummary and ProvisionedThroughput are absent', async () => {
    const driver = createMockDriver({
      describeTable: jest.fn().mockResolvedValue({
        ...baseTable,
        BillingModeSummary: undefined,
        ProvisionedThroughput: undefined,
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.ok).toBe(true);
    expect(result.result?.table.billingMode).toBe('unknown');
  });

  it('derives a GSI sort key numeric (N) type from the table AttributeDefinitions instead of defaulting every index key to S', async () => {
    const driver = createMockDriver({
      describeTable: jest.fn().mockResolvedValue({
        ...baseTable,
        // createdAt is the GSI's sort key; give it a numeric type here to
        // prove mapIndex() doesn't hardcode 'S'.
        AttributeDefinitions: baseTable.AttributeDefinitions!.map((a) =>
          a.AttributeName === 'createdAt' ? { ...a, AttributeType: 'N' as const } : a,
        ),
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.ok).toBe(true);
    const gsi = result.result?.table.globalSecondaryIndexes.find((i) => i.indexName === 'tenant-status-created-at-gsi');
    expect(gsi?.keySchema.sortKey).toEqual({ attributeName: 'createdAt', attributeType: 'N' });
  });

  it('derives a GSI partition key binary (B) type from the table AttributeDefinitions instead of defaulting every index key to S', async () => {
    const driver = createMockDriver({
      describeTable: jest.fn().mockResolvedValue({
        ...baseTable,
        // tenantStatus is the GSI's partition key; give it a binary type
        // here to prove mapIndex() doesn't hardcode 'S'.
        AttributeDefinitions: baseTable.AttributeDefinitions!.map((a) =>
          a.AttributeName === 'tenantStatus' ? { ...a, AttributeType: 'B' as const } : a,
        ),
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.ok).toBe(true);
    const gsi = result.result?.table.globalSecondaryIndexes.find((i) => i.indexName === 'tenant-status-created-at-gsi');
    expect(gsi?.keySchema.partitionKey).toEqual({ attributeName: 'tenantStatus', attributeType: 'B' });
  });

  it('caps LSI+GSI to a single shared maxIndexes budget rather than maxIndexes per list', async () => {
    const manyIndexesTable: TableDescription = {
      ...baseTable,
      LocalSecondaryIndexes: [
        { IndexName: 'lsi-a', KeySchema: [{ AttributeName: 'tenantId', KeyType: 'HASH' }, { AttributeName: 'orderId', KeyType: 'RANGE' }], Projection: { ProjectionType: 'ALL' } },
        { IndexName: 'lsi-b', KeySchema: [{ AttributeName: 'tenantId', KeyType: 'HASH' }, { AttributeName: 'orderId', KeyType: 'RANGE' }], Projection: { ProjectionType: 'ALL' } },
      ],
      GlobalSecondaryIndexes: [
        { IndexName: 'gsi-a', KeySchema: [{ AttributeName: 'tenantStatus', KeyType: 'HASH' }], Projection: { ProjectionType: 'ALL' }, IndexStatus: 'ACTIVE' },
        { IndexName: 'gsi-b', KeySchema: [{ AttributeName: 'tenantStatus', KeyType: 'HASH' }], Projection: { ProjectionType: 'ALL' }, IndexStatus: 'ACTIVE' },
      ],
    };
    const driver = createMockDriver({ describeTable: jest.fn().mockResolvedValue(manyIndexesTable) });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams({ limits: { maxIndexes: 2 } }));
    expect(result.ok).toBe(true);
    const table = result.result!.table;
    expect(table.localSecondaryIndexes.length + table.globalSecondaryIndexes.length).toBe(2);
    expect(result.result?.collection.diagnostics.some((d) => d.code === 'DYNAMODB_COLLECTION_TRUNCATED')).toBe(true);
  });

  it('keeps the target index within the shared maxIndexes budget even when it would otherwise be dropped', async () => {
    const manyIndexesTable: TableDescription = {
      ...baseTable,
      LocalSecondaryIndexes: [
        { IndexName: 'lsi-a', KeySchema: [{ AttributeName: 'tenantId', KeyType: 'HASH' }, { AttributeName: 'orderId', KeyType: 'RANGE' }], Projection: { ProjectionType: 'ALL' } },
        { IndexName: 'lsi-b', KeySchema: [{ AttributeName: 'tenantId', KeyType: 'HASH' }, { AttributeName: 'orderId', KeyType: 'RANGE' }], Projection: { ProjectionType: 'ALL' } },
      ],
      GlobalSecondaryIndexes: [
        { IndexName: 'gsi-a', KeySchema: [{ AttributeName: 'tenantStatus', KeyType: 'HASH' }], Projection: { ProjectionType: 'ALL' }, IndexStatus: 'ACTIVE' },
      ],
    };
    const driver = createMockDriver({ describeTable: jest.fn().mockResolvedValue(manyIndexesTable) });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM "orders"."lsi-b" WHERE tenantId = ?` } },
        limits: { maxIndexes: 1 },
      }),
    );
    expect(result.ok).toBe(true);
    const table = result.result!.table;
    expect(table.localSecondaryIndexes.map((i) => i.indexName)).toEqual(['lsi-b']);
    expect(table.globalSecondaryIndexes).toEqual([]);
  });

  it('raises a throttling diagnostic when a throttle series has positive values, and CLOUDWATCH_NO_DATA when a series is empty', async () => {
    const driver = createMockDriver({
      collectCloudWatchMetrics: jest.fn().mockResolvedValue({
        ok: true,
        message: '',
        result: {
          window: { startTime: 'x', endTime: 'y', periodSeconds: 60 },
          series: [
            {
              metricName: 'ReadThrottleEvents',
              statistic: 'Sum',
              scope: 'table',
              timestamps: ['2026-08-24T11:59:00.000Z'],
              values: [3],
              noData: false,
              source: 'AWS/DynamoDB',
            },
            {
              metricName: 'ConsumedReadCapacityUnits',
              statistic: 'Sum',
              scope: 'table',
              timestamps: [],
              values: [],
              noData: true,
              source: 'AWS/DynamoDB',
            },
            {
              metricName: 'ReadThrottleEvents',
              statistic: 'Sum',
              scope: 'gsi',
              indexName: 'tenant-status-created-at-gsi',
              timestamps: [],
              values: [],
              noData: true,
              source: 'AWS/DynamoDB',
            },
          ],
        },
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams());
    expect(result.result?.collection.diagnostics.some((d) => d.code === 'DYNAMODB_READ_THROTTLING_OBSERVED')).toBe(true);
    expect(result.result?.collection.diagnostics.some((d) => d.code === 'DYNAMODB_CLOUDWATCH_NO_DATA')).toBe(true);
    expect(
      result.result?.collection.diagnostics.find(
        (d) => d.code === 'DYNAMODB_CLOUDWATCH_NO_DATA' && d.metricName === 'ReadThrottleEvents',
      ),
    ).toMatchObject({ tableName: 'orders', indexName: 'tenant-status-created-at-gsi' });
  });
});

describe('DynamoDbPerformanceTuningProvider.collect (static mode, native Query)', () => {
  it('classifies from the analysis input directly, without needing a target or PartiQL text', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect({
      statement: {
        source: 'sqlHistory',
        request: {
          kind: 'query',
          input: {
            tableName: 'orders',
            keyConditionExpression: '#pk = :pk',
            expressionAttributeNames: { '#pk': 'tenantId', '#p0': 'status' },
            projectionExpression: '#p0',
            resultItemLimit: 100,
          },
        },
      },
    });
    expect(result.ok).toBe(true);
    expect(result.result?.accessPattern.operation).toBe('Query');
    expect(result.result?.accessPattern.accessPath).toBe('tableQuery');
    expect(result.result?.accessPattern.consistentRead).toBe('eventual');
    expect(result.result?.accessPattern.projection).toEqual({
      mode: 'specific',
      allAttributes: false,
      attributes: ['status'],
    });
    expect(result.result?.accessPattern.limit).toBeUndefined();
    expect(result.result?.accessPattern.resultItemLimit).toBe(100);
    expect(result.result?.statement.text).toBeUndefined();
  });

  it('reports an index Query default as all projected attributes, not all table attributes', async () => {
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver());
    const result = await provider.collect({
      statement: {
        source: 'sqlHistory',
        request: {
          kind: 'query',
          input: {
            tableName: 'orders',
            indexName: 'tenant-status-created-at-gsi',
            keyConditionExpression: '#pk = :pk',
            expressionAttributeNames: { '#pk': 'tenantStatus' },
          },
        },
      },
    });

    expect(result.result?.accessPattern.projection).toEqual({
      mode: 'allProjectedAttributes',
      allAttributes: false,
      attributes: [],
    });
  });
});

describe('DynamoDbPerformanceTuningProvider.collect (mode: executeOnce)', () => {
  it('rejects (fail-closed) when allowExecution is not explicitly true, even though execution options are supplied', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = 'literal'` } },
        observation: { mode: 'executeOnce' }, // allowExecution omitted
      }),
      { execution: { kind: 'partiql', parameters: [] } },
    );
    expect(result.ok).toBe(false);
    expect(driver.observePartiqlRead).not.toHaveBeenCalled();
  });

  it('rejects (fail-closed) when allowExecution is explicitly false', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = 'literal'` } },
        observation: { mode: 'executeOnce', allowExecution: false },
      }),
      { execution: { kind: 'partiql', parameters: [] } },
    );
    expect(result.ok).toBe(false);
    expect(driver.observePartiqlRead).not.toHaveBeenCalled();
  });

  it('rejects when execution options are missing', async () => {
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver());
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = 'literal'` } },
        observation: { mode: 'executeOnce', allowExecution: true },
      }),
      {},
    );
    expect(result.ok).toBe(false);
  });

  it('rejects when the statement is not eligible for observation (unresolved bind marker)', async () => {
    const driver = createMockDriver();
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({ observation: { mode: 'executeOnce', allowExecution: true } }),
      { execution: { kind: 'partiql', parameters: [1] } },
    );
    expect(result.ok).toBe(false);
    expect(driver.observePartiqlRead).not.toHaveBeenCalled();
  });

  it('performs the observed read and populates observation on success, flagging DYNAMODB_OBSERVATION_BOUNDED', async () => {
    const driver = createMockDriver({
      observePartiqlRead: jest.fn().mockResolvedValue({
        returnedItemCount: 100,
        scannedItemCount: undefined,
        hasMorePages: true,
        capacityBreakdown: { capacityUnits: 12.5 },
        clientElapsedTimeMs: 42,
        requestCount: 1,
        retryCount: 0,
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = 'literal'` } },
        observation: { mode: 'executeOnce', allowExecution: true },
      }),
      { execution: { kind: 'partiql', parameters: [] } },
    );
    expect(result.ok).toBe(true);
    expect(result.result?.observation?.returnedItemCount).toBe(100);
    expect(result.result?.observation?.source).toBe('observedRead');
    expect(result.result?.observation?.evaluatedItemCount).toBeUndefined(); // PartiQL never carries this
    expect(result.result?.collection.diagnostics.some((d) => d.code === 'DYNAMODB_OBSERVATION_BOUNDED')).toBe(true);
    expect(validateDynamoDbPerformanceTuningContext(result.result)).toEqual([]);
  });

  it('raises DYNAMODB_HIGH_SCANNED_TO_RETURNED for a native Query observation with a low pass rate over the threshold', async () => {
    const driver = createMockDriver({
      observeNativeQueryRead: jest.fn().mockResolvedValue({
        returnedItemCount: 1,
        scannedItemCount: 500,
        hasMorePages: false,
        capacityBreakdown: undefined,
        clientElapsedTimeMs: 10,
        requestCount: 1,
        retryCount: 0,
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      {
        statement: {
          source: 'sqlHistory',
          request: { kind: 'query', input: { tableName: 'orders', keyConditionExpression: 'tenantId = :pk' } },
        },
        observation: { mode: 'executeOnce', allowExecution: true },
      },
      { execution: { kind: 'query', input: {} as never } },
    );
    expect(result.ok).toBe(true);
    expect(result.result?.observation?.filterPassRate).toBeCloseTo(1 / 500);
    expect(result.result?.observation?.evaluatedItemCount).toBe(500);
    expect(result.result?.observation?.completeness).toBe('complete');
    expect(result.result?.observation?.bounded).toBe(false);
    expect(result.result?.collection.diagnostics.some((d) => d.code === 'DYNAMODB_HIGH_SCANNED_TO_RETURNED')).toBe(true);
  });

  it('propagates an observed-read failure as ok:false with a safe message', async () => {
    const driver = createMockDriver({
      observePartiqlRead: jest.fn().mockRejectedValue(Object.assign(new Error('denied'), { name: 'AccessDeniedException' })),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = 'literal'` } },
        observation: { mode: 'executeOnce', allowExecution: true },
      }),
      { execution: { kind: 'partiql', parameters: [] } },
    );
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/access denied/i);
  });
});

describe('DynamoDbPerformanceTuningProvider.collect (mode: executeComplete)', () => {
  it('uses the continuation-aware PartiQL reader and reports a complete observation', async () => {
    const observePartiqlReadComplete = jest.fn().mockResolvedValue({
      returnedItemCount: 38,
      scannedItemCount: undefined,
      hasMorePages: false,
      capacityBreakdown: { capacityUnits: 4.5 },
      clientElapsedTimeMs: 103,
      requestCount: 2,
      retryCount: 0,
    });
    const driver = createMockDriver({ observePartiqlReadComplete });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      partiqlParams({
        statement: { source: 'sqlHistory', request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = 'literal'` } },
        observation: { mode: 'executeComplete', allowExecution: true, maxPages: 10 },
      }),
      { execution: { kind: 'partiql', parameters: [] } },
    );

    expect(result.ok).toBe(true);
    expect(observePartiqlReadComplete).toHaveBeenCalledWith(expect.objectContaining({ maxPages: 10 }));
    expect(result.result?.observation).toMatchObject({
      completeness: 'complete',
      bounded: false,
      requestCount: 2,
      returnedItemCount: 38,
    });
  });

  it('reports incomplete coverage when the complete-result safety limit is reached', async () => {
    const driver = createMockDriver({
      observeNativeQueryReadComplete: jest.fn().mockResolvedValue({
        returnedItemCount: 130,
        scannedItemCount: 1000,
        hasMorePages: true,
        capacityBreakdown: { capacityUnits: 25 },
        clientElapsedTimeMs: 500,
        requestCount: 10,
        retryCount: 0,
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(
      {
        statement: {
          source: 'sqlHistory',
          request: { kind: 'query', input: { tableName: 'orders', keyConditionExpression: 'tenantId = :pk' } },
        },
        observation: { mode: 'executeComplete', allowExecution: true, maxPages: 10, maxEvaluatedItems: 1000 },
      },
      { execution: { kind: 'query', input: {} as never } },
    );

    expect(result.ok).toBe(true);
    expect(result.result?.observation).toMatchObject({ completeness: 'bounded', bounded: true });
    expect(result.result?.collection.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'DYNAMODB_OBSERVATION_BOUNDED' }),
    ]));
  });
});

describe('DynamoDbPerformanceTuningProvider.collect (payload limit)', () => {
  it('truncates CloudWatch datapoints and flags DYNAMODB_COLLECTION_TRUNCATED when over a small maxPayloadBytes', async () => {
    const bigSeries = Array.from({ length: 5 }, (_, seriesIdx) => ({
      metricName: `Metric${seriesIdx}`,
      statistic: 'Sum',
      scope: 'table' as const,
      timestamps: Array.from({ length: 200 }, (_, i) => `2026-08-24T${String(i % 24).padStart(2, '0')}:00:00.000Z`),
      values: Array.from({ length: 200 }, (_, i) => i),
      noData: false,
      source: 'AWS/DynamoDB' as const,
    }));
    const driver = createMockDriver({
      collectCloudWatchMetrics: jest.fn().mockResolvedValue({
        ok: true,
        message: '',
        result: { window: { startTime: 'x', endTime: 'y', periodSeconds: 60 }, series: bigSeries },
      }),
    });
    const provider = new DynamoDbPerformanceTuningProvider(driver);
    const result = await provider.collect(partiqlParams({ limits: { maxPayloadBytes: 4000 } }));

    expect(result.ok).toBe(true);
    expect(result.result?.collection.status).toBe('partial');
    expect(result.result?.collection.diagnostics.some((d) => d.code === 'DYNAMODB_COLLECTION_TRUNCATED')).toBe(true);
    for (const series of result.result?.cloudWatch?.series ?? []) {
      expect(series.timestamps.length).toBeLessThanOrEqual(60);
    }
  });

  it('returns ok:false when the context still exceeds the payload limit after every truncation step', async () => {
    const hugeText = 'x'.repeat(500_000);
    const provider = new DynamoDbPerformanceTuningProvider(createMockDriver());
    const result = await provider.collect(
      partiqlParams({
        statement: {
          source: 'sqlHistory',
          request: { kind: 'partiql', text: `SELECT * FROM orders WHERE tenantId = '${hugeText}'` },
        },
        limits: { maxPayloadBytes: 1000 },
      }),
    );
    expect(result.ok).toBe(false);
  });
});
