import { aggregateConsumedCapacity, DynamoDbExecutionMetaTracker } from '../../../src';

// The live AwsDynamoDriver.test.ts suite against LocalStack exercises
// aggregateConsumedCapacity()'s `table` path for real (Scan/Query with
// ReturnConsumedCapacity: 'INDEXES'), but this LocalStack version never
// populates a LocalSecondaryIndexes/GlobalSecondaryIndexes breakdown even
// when queried via an index, and never populates ConsumedCapacity at all for
// PartiQL ExecuteStatement. These unit tests cover that unexercised ground
// with synthetic SDK-shaped responses instead.

describe('aggregateConsumedCapacity', () => {
  it('returns undefined when every response is undefined', () => {
    expect(aggregateConsumedCapacity([undefined, undefined])).toBeUndefined();
  });

  it('returns undefined for an empty array', () => {
    expect(aggregateConsumedCapacity([])).toBeUndefined();
  });

  it('sums the top-level CapacityUnits/Read/Write across pages', () => {
    const result = aggregateConsumedCapacity([
      { CapacityUnits: 2, ReadCapacityUnits: 2 },
      { CapacityUnits: 3, ReadCapacityUnits: 3 },
    ]);
    expect(result).toEqual({
      capacityUnits: 5,
      readCapacityUnits: 5,
      writeCapacityUnits: undefined,
    });
  });

  it('keeps readCapacityUnits/writeCapacityUnits undefined (not 0) when no response ever reported them', () => {
    const result = aggregateConsumedCapacity([{ CapacityUnits: 4 }, { CapacityUnits: 6 }]);
    expect(result).toEqual({ capacityUnits: 10, readCapacityUnits: undefined, writeCapacityUnits: undefined });
  });

  it('sums the table-level breakdown across pages', () => {
    const result = aggregateConsumedCapacity([
      { CapacityUnits: 1, Table: { CapacityUnits: 1, ReadCapacityUnits: 1 } },
      { CapacityUnits: 1, Table: { CapacityUnits: 1, ReadCapacityUnits: 1 } },
    ]);
    expect(result?.table).toEqual({ capacityUnits: 2, readCapacityUnits: 2, writeCapacityUnits: undefined });
  });

  it('sums a GSI breakdown keyed by index name across pages, independent of other GSIs/LSIs', () => {
    const result = aggregateConsumedCapacity([
      {
        CapacityUnits: 3,
        GlobalSecondaryIndexes: {
          'email-gsi': { CapacityUnits: 2 },
          'other-gsi': { CapacityUnits: 1 },
        },
      },
      {
        CapacityUnits: 1,
        GlobalSecondaryIndexes: {
          'email-gsi': { CapacityUnits: 1 },
        },
      },
    ]);
    expect(result?.globalSecondaryIndexes).toEqual({
      'email-gsi': { capacityUnits: 3, readCapacityUnits: undefined, writeCapacityUnits: undefined },
      'other-gsi': { capacityUnits: 1, readCapacityUnits: undefined, writeCapacityUnits: undefined },
    });
    expect(result?.localSecondaryIndexes).toBeUndefined();
  });

  it('sums an LSI breakdown keyed by index name, separate from globalSecondaryIndexes', () => {
    const result = aggregateConsumedCapacity([
      { CapacityUnits: 2, LocalSecondaryIndexes: { 'created-at-lsi': { CapacityUnits: 2 } } },
    ]);
    expect(result?.localSecondaryIndexes).toEqual({
      'created-at-lsi': { capacityUnits: 2, readCapacityUnits: undefined, writeCapacityUnits: undefined },
    });
    expect(result?.globalSecondaryIndexes).toBeUndefined();
  });

  it('omits table/localSecondaryIndexes/globalSecondaryIndexes entirely when no response reported them (TOTAL mode)', () => {
    const result = aggregateConsumedCapacity([{ CapacityUnits: 5 }]);
    expect(result?.table).toBeUndefined();
    expect(result?.localSecondaryIndexes).toBeUndefined();
    expect(result?.globalSecondaryIndexes).toBeUndefined();
  });
});

describe('DynamoDbExecutionMetaTracker', () => {
  it('sums requestCount/retryCount across recorded responses', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    tracker.recordResponse({ $metadata: { attempts: 1 } });
    tracker.recordResponse({ $metadata: { attempts: 3 } }); // 2 retries
    const meta = tracker.build(false);
    expect(meta.requestCount).toBe(2);
    expect(meta.retryCount).toBe(2);
  });

  it('defaults attempts to 1 (no retry) when $metadata is absent', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    tracker.recordResponse({});
    expect(tracker.build(false).retryCount).toBe(0);
  });

  it('never goes negative even if attempts is reported as 0', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    tracker.recordResponse({ $metadata: { attempts: 0 } });
    expect(tracker.build(false).retryCount).toBe(0);
  });

  it('only sums Count/ScannedCount when trackNativeCounts is passed (never for PartiQL)', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    tracker.recordResponse({ Count: 10, ScannedCount: 100 }); // no trackNativeCounts -> ignored
    tracker.recordResponse({ Count: 5, ScannedCount: 50 }, { trackNativeCounts: true });
    const meta = tracker.build(false);
    expect(meta.reportedCount).toBe(5);
    expect(meta.scannedCount).toBe(50);
  });

  it('leaves scannedCount/reportedCount undefined when trackNativeCounts is never used', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    tracker.recordResponse({});
    const meta = tracker.build(false);
    expect(meta.scannedCount).toBeUndefined();
    expect(meta.reportedCount).toBeUndefined();
  });

  it('passes hasMorePages through from build() unchanged', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    expect(tracker.build(true).hasMorePages).toBe(true);
    expect(tracker.build(false).hasMorePages).toBe(false);
  });

  it('aggregates ConsumedCapacity from every recorded response into capacityBreakdown', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    tracker.recordResponse({ ConsumedCapacity: { CapacityUnits: 1, Table: { CapacityUnits: 1 } } });
    tracker.recordResponse({ ConsumedCapacity: { CapacityUnits: 2, Table: { CapacityUnits: 2 } } });
    const meta = tracker.build(false);
    expect(meta.capacityBreakdown?.capacityUnits).toBe(3);
    expect(meta.capacityBreakdown?.table?.capacityUnits).toBe(3);
  });

  it('leaves capacityBreakdown undefined when no response ever carried ConsumedCapacity', () => {
    const tracker = new DynamoDbExecutionMetaTracker();
    tracker.recordResponse({});
    tracker.recordResponse({});
    expect(tracker.build(false).capacityBreakdown).toBeUndefined();
  });
});
