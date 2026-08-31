import { buildDynamoDbRdhSummaryInfo } from '../../../src/drivers/aws/dynamoDbRdhSummary';

describe('buildDynamoDbRdhSummaryInfo', () => {
  it('formats a SELECT with no Capacity reported (design doc §11.1)', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 90,
      selectedRows: 38,
    });
    expect(info).toBe('38 items returned • 90 ms • Capacity not reported');
  });

  it('pluralizes a single returned item', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 5,
      selectedRows: 1,
    });
    expect(info).toBe('1 item returned • 5 ms • Capacity not reported');
  });

  it('formats a multi-page SELECT with capacity, requests, and a truncated result', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 1240,
      selectedRows: 1000,
      requestCount: 2,
      retryCount: 0,
      readCapacityUnits: 5,
      hasMoreRows: true,
    });
    expect(info).toBe(
      '1,000 items returned • 1.24 sec • 5 RCU • 2 requests • Result limited; additional items exist',
    );
  });

  it('formats a native Query with a filter pass rate', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 42,
      selectedRows: 25,
      scannedRows: 100,
      readCapacityUnits: 1.5,
    });
    expect(info).toBe(
      '25 returned / 100 evaluated • 42 ms • 1.5 RCU • 25% pass',
    );
  });

  it('appends a named GSI access path', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 42,
      selectedRows: 25,
      readCapacityUnits: 1.5,
      accessPath: {
        type: 'index',
        indexName: 'tenant-status-gsi',
        indexType: 'GSI',
      },
    });
    expect(info).toBe(
      '25 items returned • 42 ms • 1.5 RCU • via GSI "tenant-status-gsi"',
    );
  });

  it('uses a neutral index label when DescribeTable metadata is incomplete', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 42,
      selectedRows: 25,
      accessPath: { type: 'index', indexName: 'custom-index' },
    });
    expect(info).toContain('via index "custom-index"');
  });

  it('omits pass rate when scannedRows is 0', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 0,
      scannedRows: 0,
    });
    expect(info).toBe(
      '0 returned / 0 evaluated • 10 ms • Capacity not reported',
    );
  });

  it('falls back to a plain CU when no read/write split is available', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      capacityUnits: 2.5,
    });
    expect(info).toBe('5 items returned • 10 ms • 2.5 CU');
  });

  it('prefers readCapacityUnits over capacityUnits for a SELECT', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      capacityUnits: 9,
      readCapacityUnits: 3,
    });
    expect(info).toBe('5 items returned • 10 ms • 3 RCU');
  });

  it('shows an explicit 0 RCU rather than "Capacity not reported"', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      readCapacityUnits: 0,
    });
    expect(info).toBe('5 items returned • 10 ms • 0 RCU');
  });

  it('treats an undetermined operation (undefined) as select-like, not a write (2026-08-25 review)', () => {
    // requestPartiql() reaches the formatter with operation: undefined when
    // conditions.rawQueries is true or the statement failed to parse - this
    // must not be silently treated as a write, since it's also the only
    // case where selectedRows can legitimately be reported.
    const info = buildDynamoDbRdhSummaryInfo({
      operation: undefined,
      elapsedTimeMilli: 90,
      selectedRows: 38,
      readCapacityUnits: 2,
    });
    expect(info).toBe('38 items returned • 90 ms • 2 RCU');
  });

  it('treats an unknown/unrecognized operation as select-like, not a write', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'unknown',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      readCapacityUnits: 1,
    });
    expect(info).toBe('5 items returned • 10 ms • 1 RCU');
  });

  it('omits the count segment for a write with no affectedRows (never invents a count)', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'insert',
      elapsedTimeMilli: 12,
      writeCapacityUnits: 1,
    });
    expect(info).toBe('12 ms • 1 WCU');
  });

  it('shows affected-item wording for a write when affectedRows is known', () => {
    const single = buildDynamoDbRdhSummaryInfo({
      operation: 'update',
      elapsedTimeMilli: 12,
      affectedRows: 1,
      writeCapacityUnits: 1,
    });
    expect(single).toBe('1 item affected • 12 ms • 1 WCU');

    const multiple = buildDynamoDbRdhSummaryInfo({
      operation: 'delete',
      elapsedTimeMilli: 12,
      affectedRows: 3,
      writeCapacityUnits: 1,
    });
    expect(multiple).toBe('3 items affected • 12 ms • 1 WCU');
  });

  it('prefers writeCapacityUnits over capacityUnits for a write operation', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'insert',
      elapsedTimeMilli: 12,
      capacityUnits: 9,
      writeCapacityUnits: 1,
    });
    expect(info).toBe('12 ms • 1 WCU');
  });

  it('omits requestCount: 1, retryCount: 0, and hasMoreRows: false as normal-case noise', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      requestCount: 1,
      retryCount: 0,
      hasMoreRows: false,
      readCapacityUnits: 2,
    });
    expect(info).toBe('5 items returned • 10 ms • 2 RCU');
  });

  it('shows a single retry with singular wording, and 2+ retries as plural', () => {
    const single = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      retryCount: 1,
    });
    expect(single).toBe(
      '5 items returned • 10 ms • Capacity not reported • 1 retry',
    );

    const multiple = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      retryCount: 2,
    });
    expect(multiple).toBe(
      '5 items returned • 10 ms • Capacity not reported • 2 retries',
    );
  });

  it('rounds elapsed time in seconds at the 1000ms boundary', () => {
    const underBoundary = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 999,
      selectedRows: 1,
    });
    expect(underBoundary).toBe(
      '1 item returned • 999 ms • Capacity not reported',
    );

    const atBoundary = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 1000,
      selectedRows: 1,
    });
    expect(atBoundary).toBe(
      '1 item returned • 1.00 sec • Capacity not reported',
    );
  });

  it('trims floating-point noise in a fractional Capacity value', () => {
    const info = buildDynamoDbRdhSummaryInfo({
      operation: 'select',
      elapsedTimeMilli: 10,
      selectedRows: 5,
      readCapacityUnits: 4.4999999999,
    });
    expect(info).toBe('5 items returned • 10 ms • 4.5 RCU');
  });
});
