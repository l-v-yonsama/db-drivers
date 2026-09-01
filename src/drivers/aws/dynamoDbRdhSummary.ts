// Formats observed DynamoDB summary values without estimating missing fields.

import pluralize from 'pluralize';
import type { RdhDynamoDbAccessPath } from '@l-v-yonsama/rdh';

export type DynamoDbRdhSummaryInfoParams = {
  // Unknown operations use read wording rather than being assumed to be writes.
  operation: string | undefined;
  elapsedTimeMilli: number;
  selectedRows?: number;
  affectedRows?: number;
  // ExecuteStatement does not report this native Query/Scan field.
  scannedRows?: number;
  requestCount?: number;
  retryCount?: number;
  capacityUnits?: number;
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
  hasMoreRows?: boolean;
  accessPath?: RdhDynamoDbAccessPath;
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

// Trim SDK floating-point noise without forcing fixed-width decimals.
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
    return `${formatCount(affectedRows)} ${pluralize(
      'item',
      affectedRows,
    )} affected`;
  }
  if (selectedRows === undefined) return undefined;
  if (scannedRows !== undefined) {
    return `${formatCount(selectedRows)} returned / ${formatCount(
      scannedRows,
    )} evaluated`;
  }
  return `${formatCount(selectedRows)} ${pluralize(
    'item',
    selectedRows,
  )} returned`;
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

// Omits normal-case noise from display text while structured fields retain it.
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
      `${formatCount(params.retryCount)} ${pluralize(
        'retry',
        params.retryCount,
      )}`,
    );
  }

  if (params.hasMoreRows === true) {
    segments.push('Result limited; additional items exist');
  }

  if (params.accessPath?.type === 'index') {
    const indexType = params.accessPath.indexType ?? 'index';
    segments.push(`via ${indexType} "${params.accessPath.indexName}"`);
  }

  return segments.join(' • ');
}
