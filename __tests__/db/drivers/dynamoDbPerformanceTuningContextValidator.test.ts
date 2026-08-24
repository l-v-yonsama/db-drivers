import { DynamoDbPerformanceTuningContext, validateDynamoDbPerformanceTuningContext } from '../../../src';

function baseContext(): DynamoDbPerformanceTuningContext {
  return {
    formatVersion: 1,
    engine: 'dynamodb',
    service: { provider: 'AWS', service: 'DynamoDB', endpointKind: 'aws', tableName: 'orders' },
    statement: {
      language: 'partiql',
      text: 'SELECT * FROM orders WHERE tenantId = ?',
      source: 'sqlHistory',
      kind: 'select',
      observationEligibility: { allowed: false, reason: 'unresolved marker' },
    },
    accessPattern: {
      operation: 'PartiQLSelect',
      accessPath: 'tableQuery',
      confidence: 'certain',
      tableName: 'orders',
      postReadFilter: { present: false, attributes: [] },
      projection: { allAttributes: true, attributes: [] },
      consistentRead: 'unknown',
    },
    table: {
      tableName: 'orders',
      billingMode: 'PAY_PER_REQUEST',
      keySchema: { partitionKey: { attributeName: 'tenantId', attributeType: 'S' } },
      attributeDefinitions: [{ attributeName: 'tenantId', attributeType: 'S' }],
      localSecondaryIndexes: [],
      globalSecondaryIndexes: [],
      contributorInsights: [],
    },
    collection: { collectedAt: new Date().toISOString(), status: 'complete', diagnostics: [], unavailableSections: [] },
  };
}

describe('validateDynamoDbPerformanceTuningContext', () => {
  it('accepts a minimal well-formed context', () => {
    expect(validateDynamoDbPerformanceTuningContext(baseContext())).toEqual([]);
  });

  it('accepts a fuller context with cloudWatch/observation/workload populated', () => {
    const ctx = baseContext();
    ctx.observation = {
      source: 'observedRead',
      returnedItemCount: 10,
      scannedItemCount: 20,
      filterPassRate: 0.5,
      bounded: true,
    };
    ctx.workload = { executionCount: 3 };
    ctx.cloudWatch = {
      window: { startTime: '2026-08-24T11:00:00.000Z', endTime: '2026-08-24T12:00:00.000Z', periodSeconds: 60 },
      series: [
        {
          metricName: 'ConsumedReadCapacityUnits',
          statistic: 'Sum',
          scope: 'table',
          timestamps: ['2026-08-24T11:59:00.000Z', '2026-08-24T12:00:00.000Z'],
          values: [1, 2],
          noData: false,
          source: 'AWS/DynamoDB',
        },
      ],
    };
    expect(validateDynamoDbPerformanceTuningContext(ctx)).toEqual([]);
  });

  it('rejects a non-object', () => {
    expect(validateDynamoDbPerformanceTuningContext(null)).toEqual(['context is required.']);
    expect(validateDynamoDbPerformanceTuningContext('x')).toEqual(['context is required.']);
  });

  it('rejects the wrong formatVersion or engine', () => {
    const ctx: any = baseContext();
    ctx.formatVersion = 2;
    ctx.engine = 'rdb';
    const errors = validateDynamoDbPerformanceTuningContext(ctx);
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/formatVersion/), expect.stringMatching(/engine/)]));
  });

  it('rejects a service carrying a literal endpoint/url', () => {
    const ctx: any = baseContext();
    ctx.service.url = 'http://127.0.0.1:6800';
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('endpoint/url'))).toBe(true);
  });

  it('rejects accessPath !== "unknown" when confidence is "unknown"', () => {
    const ctx: any = baseContext();
    ctx.accessPattern.confidence = 'unknown';
    ctx.accessPattern.accessPath = 'tableScan';
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('must be "unknown" whenever confidence'))).toBe(true);
  });

  it('rejects a filterPassRate outside [0, 1]', () => {
    const ctx: any = baseContext();
    ctx.observation = { source: 'observedRead', returnedItemCount: 1, scannedItemCount: 1, filterPassRate: 1.5, bounded: true };
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('filterPassRate'))).toBe(true);
  });

  it('rejects a filterPassRate present without scannedItemCount', () => {
    const ctx: any = baseContext();
    ctx.observation = { source: 'observedRead', returnedItemCount: 1, filterPassRate: 0.5, bounded: true };
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('undefined when scannedItemCount'))).toBe(true);
  });

  it('rejects mismatched CloudWatch timestamps/values lengths', () => {
    const ctx: any = baseContext();
    ctx.cloudWatch = {
      window: { startTime: '2026-08-24T11:00:00.000Z', endTime: '2026-08-24T12:00:00.000Z', periodSeconds: 60 },
      series: [{ metricName: 'X', statistic: 'Sum', scope: 'table', timestamps: ['2026-08-24T11:00:00.000Z'], values: [], noData: false, source: 'AWS/DynamoDB' }],
    };
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('same length'))).toBe(true);
  });

  it('rejects descending CloudWatch timestamps', () => {
    const ctx: any = baseContext();
    ctx.cloudWatch = {
      window: { startTime: '2026-08-24T11:00:00.000Z', endTime: '2026-08-24T12:00:00.000Z', periodSeconds: 60 },
      series: [
        {
          metricName: 'X',
          statistic: 'Sum',
          scope: 'table',
          timestamps: ['2026-08-24T12:00:00.000Z', '2026-08-24T11:00:00.000Z'],
          values: [1, 2],
          noData: false,
          source: 'AWS/DynamoDB',
        },
      ],
    };
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('ascending order'))).toBe(true);
  });

  it('rejects noData: true alongside non-empty timestamps, and noData: false alongside empty timestamps', () => {
    const wrongTrue: any = baseContext();
    wrongTrue.cloudWatch = {
      window: { startTime: '2026-08-24T11:00:00.000Z', endTime: '2026-08-24T12:00:00.000Z', periodSeconds: 60 },
      series: [{ metricName: 'X', statistic: 'Sum', scope: 'table', timestamps: ['2026-08-24T11:00:00.000Z'], values: [1], noData: true, source: 'AWS/DynamoDB' }],
    };
    expect(validateDynamoDbPerformanceTuningContext(wrongTrue).some((e) => e.includes('noData must be false'))).toBe(true);

    const wrongFalse: any = baseContext();
    wrongFalse.cloudWatch = {
      window: { startTime: '2026-08-24T11:00:00.000Z', endTime: '2026-08-24T12:00:00.000Z', periodSeconds: 60 },
      series: [{ metricName: 'X', statistic: 'Sum', scope: 'table', timestamps: [], values: [], noData: false, source: 'AWS/DynamoDB' }],
    };
    expect(validateDynamoDbPerformanceTuningContext(wrongFalse).some((e) => e.includes('noData must be true'))).toBe(true);
  });

  it('cross-checks collection.status against unavailableSections/affectsCompleteness diagnostics', () => {
    const shouldBePartial: any = baseContext();
    shouldBePartial.collection.status = 'complete';
    shouldBePartial.collection.unavailableSections = [{ section: 'cloudWatchMetrics', reason: 'denied' }];
    expect(validateDynamoDbPerformanceTuningContext(shouldBePartial).some((e) => e.includes('must be "partial"'))).toBe(true);

    const shouldBeComplete: any = baseContext();
    shouldBeComplete.collection.status = 'partial';
    expect(validateDynamoDbPerformanceTuningContext(shouldBeComplete).some((e) => e.includes('must not be "partial"'))).toBe(true);
  });

  it('an info diagnostic alone (affectsCompleteness: false) does not require status: partial', () => {
    const ctx: any = baseContext();
    ctx.collection.status = 'complete';
    ctx.collection.diagnostics = [
      { code: 'DYNAMODB_APPROXIMATE_TABLE_METADATA', severity: 'info', affectsCompleteness: false, scope: 'tableDefinition', message: 'x' },
    ];
    expect(validateDynamoDbPerformanceTuningContext(ctx)).toEqual([]);
  });

  it('rejects an unrecognized diagnostic code', () => {
    const ctx: any = baseContext();
    ctx.collection.diagnostics = [{ code: 'NOT_A_REAL_CODE', severity: 'info', affectsCompleteness: false, scope: 'collection', message: 'x' }];
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('not a known diagnostic code'))).toBe(true);
  });

  it.each(['Item', 'Items', 'ExpressionAttributeValues', 'LastEvaluatedKey', 'ExclusiveStartKey', 'NextToken', 'bind', 'binds', 'Parameters'])(
    'rejects a forbidden key "%s" appearing anywhere in the context, at any depth',
    (forbiddenKey) => {
      const ctx: any = baseContext();
      ctx.table[forbiddenKey] = 'leaked';
      expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes(forbiddenKey))).toBe(true);
    },
  );

  it('finds a forbidden key nested deep inside an array', () => {
    const ctx: any = baseContext();
    ctx.table.globalSecondaryIndexes = [{ indexName: 'i', indexType: 'GSI', keySchema: { partitionKey: { attributeName: 'a', attributeType: 'S' } }, Items: [{ a: 1 }] }];
    expect(validateDynamoDbPerformanceTuningContext(ctx).some((e) => e.includes('Items'))).toBe(true);
  });
});
