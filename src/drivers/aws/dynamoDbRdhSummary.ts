// See db-notebook repo's
// misc/specs/dynamodb-rdh-summary-display-improvement-plan.ja.md §5/§7.1.
//
// Pure formatter for RdhSummary.info of a DynamoDB PartiQL/native Query
// result. Display only - never fetches, estimates, or defaults a value; a
// field that was not actually returned by DynamoDB must reach this function
// as `undefined`, and stays absent from the output rather than being shown
// as 0/false. Callers (AwsDynamoServiceClient.itemsToResultSetData) build
// their local variables once and pass the *same* values both here and to
// ResultSetDataBuilder.setSummary()'s structured fields, so the display text
// and the structured RdhSummary fields can never disagree.

import pluralize from 'pluralize';

export type DynamoDbRdhSummaryInfoParams = {
  // Only 'insert'/'update'/'delete' switch to write-oriented wording
  // (affectedRows wording, Write Capacity priority per §5.3). Everything
  // else - 'select', or undefined for the rare case a caller truly could
  // not classify the statement at all - gets the select-style
  // item-returned/evaluated wording (§5.2) and Read Capacity priority, since
  // that is the only case that can ever actually report `selectedRows`
  // (2026-08-25 review, round 2: an unresolved operation must not be
  // silently treated as a write. AwsDynamoServiceClient.itemsToResultSetData
  // resolves `operation` from parseQuery()/qst when available, falling back
  // to a lightweight text classification - never left undefined just
  // because conditions.rawQueries===true skipped full parsing - so this
  // `undefined` case is now reached only if that fallback itself fails to
  // recognize the statement's leading keyword.)
  operation: string | undefined;
  elapsedTimeMilli: number;
  selectedRows?: number;
  affectedRows?: number;
  // Only ever defined for a native Query/Scan response - PartiQL's
  // ExecuteStatement has no ScannedCount field at all (never estimated).
  scannedRows?: number;
  requestCount?: number;
  retryCount?: number;
  capacityUnits?: number;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
  hasMoreRows?: boolean;
};

const WRITE_OPERATIONS = new Set(['insert', 'update', 'delete']);

function isWriteOperation(operation: string | undefined): boolean {
  return operation !== undefined && WRITE_OPERATIONS.has(operation);
}

function formatElapsed(elapsedTimeMilli: number): string {
  if (elapsedTimeMilli < 1000) {
    return `${Math.round(elapsedTimeMilli)} ms`;
  }
  return `${(elapsedTimeMilli / 1000).toFixed(2)} sec`;
}

function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

// Trims SDK floating-point noise (e.g. 4.4999999999999996) without imposing
// a fixed decimal width on genuinely-fractional Capacity values.
function formatCapacityAmount(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

function formatCountsSegment({
  operation,
  selectedRows,
  affectedRows,
  scannedRows,
}: DynamoDbRdhSummaryInfoParams): string | undefined {
  if (isWriteOperation(operation)) {
    if (affectedRows === undefined) return undefined;
    return `${formatCount(affectedRows)} ${pluralize('item', affectedRows)} affected`;
  }
  if (selectedRows === undefined) return undefined;
  if (scannedRows !== undefined) {
    return `${formatCount(selectedRows)} returned / ${formatCount(scannedRows)} evaluated`;
  }
  return `${formatCount(selectedRows)} ${pluralize('item', selectedRows)} returned`;
}

function formatPassRateSegment({
  operation,
  selectedRows,
  scannedRows,
}: DynamoDbRdhSummaryInfoParams): string | undefined {
  if (isWriteOperation(operation)) return undefined;
  if (selectedRows === undefined || !scannedRows) return undefined;
  const pct = Math.round((selectedRows / scannedRows) * 100);
  return `${pct}% pass`;
}

function formatCapacitySegment({
  operation,
  capacityUnits,
  readCapacityUnits,
  writeCapacityUnits,
}: DynamoDbRdhSummaryInfoParams): string {
  const isWrite = isWriteOperation(operation);
  const primary = isWrite ? writeCapacityUnits : readCapacityUnits;
  const primaryUnit = isWrite ? 'WCU' : 'RCU';
  if (primary !== undefined) {
    return `${formatCapacityAmount(primary)} ${primaryUnit}`;
  }
  if (capacityUnits !== undefined) {
    return `${formatCapacityAmount(capacityUnits)} CU`;
  }
  return 'Capacity not reported';
}

// Builds RdhSummary.info for a DynamoDB SELECT or write result, following
// the field order and per-field visibility rules in the design doc's §5.
// Fields that carry no evidence (undefined, or the "noise" values
// requestCount:1/retryCount:0/hasMoreRows:false) are simply omitted from the
// string - the structured RdhSummary fields still retain their real values
// regardless of what is shown here.
export function buildDynamoDbRdhSummaryInfo(
  params: DynamoDbRdhSummaryInfoParams,
): string {
  const segments: string[] = [];

  const counts = formatCountsSegment(params);
  if (counts !== undefined) segments.push(counts);

  segments.push(formatElapsed(params.elapsedTimeMilli));

  segments.push(formatCapacitySegment(params));

  const passRate = formatPassRateSegment(params);
  if (passRate !== undefined) segments.push(passRate);

  if (params.requestCount !== undefined && params.requestCount >= 2) {
    segments.push(`${formatCount(params.requestCount)} requests`);
  }

  if (params.retryCount !== undefined && params.retryCount >= 1) {
    segments.push(
      `${formatCount(params.retryCount)} ${pluralize('retry', params.retryCount)}`,
    );
  }

  if (params.hasMoreRows === true) {
    segments.push('Result limited; additional items exist');
  }

  return segments.join(' • ');
}
