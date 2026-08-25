import { DynamoDbPerformanceTuningContext } from '../types';

// Hand-rolled structural/runtime check for the *output* of
// getDynamoDbPerformanceTuningContext() - the DynamoDB analogue of
// performanceTuningContextValidator.ts, same rationale (no schema-validation
// dependency exists in this package; recurses into series/table/collection
// rather than only checking top-level shape). See db-notebook repo's
// misc/specs/dynamodb-performance-tuning-implementation-plan.ja.md §6.5 for
// the specific rules this file enforces (ascending CloudWatch timestamps,
// [0,1] ratios, collection.status derivation) and §13 for the "no Item/bind/
// LastEvaluatedKey ever leaks in" check run again immediately before a DBN
// save.

const UNAVAILABLE_SECTIONS = ['accessPattern', 'tableDefinition', 'cloudWatchMetrics', 'contributorInsights', 'observation'];
const DIAGNOSTIC_SEVERITIES = ['info', 'warning'];
const DIAGNOSTIC_SCOPES = [...UNAVAILABLE_SECTIONS, 'collection'];
const DIAGNOSTIC_CODES = [
  'DYNAMODB_FULL_TABLE_SCAN',
  'DYNAMODB_FULL_INDEX_SCAN',
  'DYNAMODB_POST_READ_FILTER',
  'DYNAMODB_ACCESS_PATTERN_UNRESOLVED',
  'DYNAMODB_HIGH_SCANNED_TO_RETURNED',
  'DYNAMODB_READ_THROTTLING_OBSERVED',
  'DYNAMODB_KEY_RANGE_THROTTLING_OBSERVED',
  'DYNAMODB_PROVISIONED_THROTTLING_OBSERVED',
  'DYNAMODB_ON_DEMAND_LIMIT_THROTTLING_OBSERVED',
  'DYNAMODB_ACCOUNT_LIMIT_THROTTLING_OBSERVED',
  'DYNAMODB_OBSERVATION_BOUNDED',
  'DYNAMODB_APPROXIMATE_TABLE_METADATA',
  'DYNAMODB_CLOUDWATCH_NO_DATA',
  'DYNAMODB_MONITORING_COLLECTION_SKIPPED',
  'DYNAMODB_SECTION_COLLECTION_FAILED',
  'DYNAMODB_COLLECTION_TRUNCATED',
];
const ACCESS_PATHS = ['tableQuery', 'indexQuery', 'tableScan', 'indexScan', 'unknown'];
const OPERATIONS = ['PartiQLSelect', 'Query', 'Scan'];
const CONFIDENCES = ['certain', 'unknown'];
const CONSISTENT_READS = ['eventual', 'strong', 'unknown'];
const BILLING_MODES = ['PROVISIONED', 'PAY_PER_REQUEST', 'unknown'];
const ATTRIBUTE_TYPES = ['S', 'N', 'B'];
const CLOUDWATCH_SCOPES = ['table', 'gsi', 'operation'];
const OBSERVATION_SOURCES = ['sqlHistory', 'observedRead', 'dynamoQueryPanel'];

// Never legitimate anywhere in a DynamoDbPerformanceTuningContext (§6.2,
// §7.4, §13) - a key with one of these names, at any depth, means a value
// leaked in that must never reach an AI prompt, a saved DBN, or a log.
const FORBIDDEN_KEYS = new Set([
  'Item',
  'Items',
  'ExpressionAttributeValues',
  'ExclusiveStartKey',
  'LastEvaluatedKey',
  'NextToken',
  'bind',
  'binds',
  'Parameters',
]);

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isIsoLikeDate = (v: unknown): boolean => typeof v === 'string' && v.length > 0 && !Number.isNaN(Date.parse(v));
const oneOf = (v: unknown, allowed: readonly string[]): boolean => typeof v === 'string' && allowed.includes(v);
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isRatio = (v: unknown): boolean => isFiniteNumber(v) && v >= 0 && v <= 1;

function validateService(service: unknown, errors: string[]): void {
  if (!isPlainObject(service)) {
    errors.push('service is required.');
    return;
  }
  if (service.provider !== 'AWS') errors.push('service.provider must be "AWS".');
  if (service.service !== 'DynamoDB') errors.push('service.service must be "DynamoDB".');
  if (!oneOf(service.endpointKind, ['aws', 'custom'])) errors.push('service.endpointKind must be "aws" or "custom".');
  if (!isNonEmptyString(service.tableName)) errors.push('service.tableName must be a non-empty string.');
  if (service.indexName !== undefined && !isNonEmptyString(service.indexName)) errors.push('service.indexName must be a non-empty string.');
  // §6.2: only endpointKind is kept, never a literal custom endpoint URL.
  if (typeof service.endpoint === 'string' || typeof service.url === 'string') {
    errors.push('service must not carry a literal endpoint/url.');
  }
}

function validateStatement(statement: unknown, errors: string[]): void {
  if (!isPlainObject(statement)) {
    errors.push('statement is required.');
    return;
  }
  if (!oneOf(statement.language, ['partiql', 'dynamodb-query'])) errors.push('statement.language must be "partiql" or "dynamodb-query".');
  if (!oneOf(statement.source, ['sqlHistory', 'editor', 'dynamoQueryPanel'])) {
    errors.push('statement.source must be one of sqlHistory/editor/dynamoQueryPanel.');
  }
  if (!oneOf(statement.kind, ['select', 'query'])) errors.push('statement.kind must be "select" or "query".');
  if (statement.text !== undefined && typeof statement.text !== 'string') errors.push('statement.text must be a string.');
  if (!isPlainObject(statement.observationEligibility)) {
    errors.push('statement.observationEligibility is required.');
  } else if (typeof statement.observationEligibility.allowed !== 'boolean') {
    errors.push('statement.observationEligibility.allowed must be a boolean.');
  }
}

function validateAccessPattern(accessPattern: unknown, errors: string[]): void {
  if (!isPlainObject(accessPattern)) {
    errors.push('accessPattern is required.');
    return;
  }
  if (!oneOf(accessPattern.operation, OPERATIONS)) errors.push(`accessPattern.operation must be one of: ${OPERATIONS.join(', ')}.`);
  if (!oneOf(accessPattern.accessPath, ACCESS_PATHS)) errors.push(`accessPattern.accessPath must be one of: ${ACCESS_PATHS.join(', ')}.`);
  if (!oneOf(accessPattern.confidence, CONFIDENCES)) errors.push(`accessPattern.confidence must be one of: ${CONFIDENCES.join(', ')}.`);
  // §7.2: accessPath and confidence always move together.
  if (accessPattern.confidence === 'unknown' && accessPattern.accessPath !== 'unknown') {
    errors.push('accessPattern.accessPath must be "unknown" whenever confidence is "unknown".');
  }
  if (!isNonEmptyString(accessPattern.tableName)) errors.push('accessPattern.tableName must be a non-empty string.');
  if (!oneOf(accessPattern.consistentRead, CONSISTENT_READS)) {
    errors.push(`accessPattern.consistentRead must be one of: ${CONSISTENT_READS.join(', ')}.`);
  }
  if (!isPlainObject(accessPattern.postReadFilter)) {
    errors.push('accessPattern.postReadFilter is required.');
  } else {
    if (typeof accessPattern.postReadFilter.present !== 'boolean') errors.push('accessPattern.postReadFilter.present must be a boolean.');
    if (!Array.isArray(accessPattern.postReadFilter.attributes)) errors.push('accessPattern.postReadFilter.attributes must be an array.');
  }
  if (!isPlainObject(accessPattern.projection)) {
    errors.push('accessPattern.projection is required.');
  } else {
    if (typeof accessPattern.projection.allAttributes !== 'boolean') errors.push('accessPattern.projection.allAttributes must be a boolean.');
    if (!Array.isArray(accessPattern.projection.attributes)) errors.push('accessPattern.projection.attributes must be an array.');
  }
}

function validateMetricValue(value: unknown, path: string, errors: string[]): void {
  if (value === undefined) return;
  if (!isPlainObject(value)) {
    errors.push(`${path} must be a MetricValue object.`);
    return;
  }
  if (typeof value.value !== 'number') errors.push(`${path}.value must be a number.`);
  if (typeof value.estimated !== 'boolean') errors.push(`${path}.estimated must be a boolean.`);
  if (!isNonEmptyString(value.source)) errors.push(`${path}.source must be a non-empty string.`);
}

function validateKeySchema(keySchema: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(keySchema)) {
    errors.push(`${path} is required.`);
    return;
  }
  const pk = keySchema.partitionKey;
  if (!isPlainObject(pk) || !isNonEmptyString(pk.attributeName) || !oneOf(pk.attributeType, ATTRIBUTE_TYPES)) {
    errors.push(`${path}.partitionKey must have a non-empty attributeName and a valid attributeType.`);
  }
  if (keySchema.sortKey !== undefined) {
    const sk = keySchema.sortKey;
    if (!isPlainObject(sk) || !isNonEmptyString(sk.attributeName) || !oneOf(sk.attributeType, ATTRIBUTE_TYPES)) {
      errors.push(`${path}.sortKey must have a non-empty attributeName and a valid attributeType.`);
    }
  }
}

function validateIndex(index: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(index)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!isNonEmptyString(index.indexName)) errors.push(`${path}.indexName must be a non-empty string.`);
  if (!oneOf(index.indexType, ['LSI', 'GSI'])) errors.push(`${path}.indexType must be "LSI" or "GSI".`);
  validateKeySchema(index.keySchema, `${path}.keySchema`, errors);
  validateMetricValue(index.itemCount, `${path}.itemCount`, errors);
  validateMetricValue(index.indexSizeBytes, `${path}.indexSizeBytes`, errors);
}

function validateTable(table: unknown, errors: string[]): void {
  if (!isPlainObject(table)) {
    errors.push('table is required.');
    return;
  }
  if (!isNonEmptyString(table.tableName)) errors.push('table.tableName must be a non-empty string.');
  if (!oneOf(table.billingMode, BILLING_MODES)) errors.push(`table.billingMode must be one of: ${BILLING_MODES.join(', ')}.`);
  validateKeySchema(table.keySchema, 'table.keySchema', errors);
  if (!Array.isArray(table.attributeDefinitions)) {
    errors.push('table.attributeDefinitions must be an array.');
  } else {
    table.attributeDefinitions.forEach((a, i) => {
      if (!isPlainObject(a) || !isNonEmptyString(a.attributeName) || !oneOf(a.attributeType, ATTRIBUTE_TYPES)) {
        errors.push(`table.attributeDefinitions[${i}] must have a non-empty attributeName and a valid attributeType.`);
      }
    });
  }
  if (!Array.isArray(table.localSecondaryIndexes)) {
    errors.push('table.localSecondaryIndexes must be an array.');
  } else {
    table.localSecondaryIndexes.forEach((i, idx) => validateIndex(i, `table.localSecondaryIndexes[${idx}]`, errors));
  }
  if (!Array.isArray(table.globalSecondaryIndexes)) {
    errors.push('table.globalSecondaryIndexes must be an array.');
  } else {
    table.globalSecondaryIndexes.forEach((i, idx) => validateIndex(i, `table.globalSecondaryIndexes[${idx}]`, errors));
  }
  validateMetricValue(table.itemCount, 'table.itemCount', errors);
  validateMetricValue(table.tableSizeBytes, 'table.tableSizeBytes', errors);
  if (!Array.isArray(table.contributorInsights)) {
    errors.push('table.contributorInsights must be an array.');
  } else {
    table.contributorInsights.forEach((ci, idx) => {
      if (!isPlainObject(ci) || !oneOf(ci.resource, ['table', 'gsi']) || !isNonEmptyString(ci.status)) {
        errors.push(`table.contributorInsights[${idx}] must have resource "table"/"gsi" and a non-empty status.`);
      }
    });
  }
}

function validateObservation(observation: unknown, errors: string[]): void {
  if (observation === undefined) return;
  if (!isPlainObject(observation)) {
    errors.push('observation must be an object.');
    return;
  }
  if (!oneOf(observation.source, OBSERVATION_SOURCES)) errors.push(`observation.source must be one of: ${OBSERVATION_SOURCES.join(', ')}.`);
  if (typeof observation.bounded !== 'boolean') errors.push('observation.bounded must be a boolean.');
  if (observation.filterPassRate !== undefined && !isRatio(observation.filterPassRate)) {
    errors.push('observation.filterPassRate must be a number in [0, 1].');
  }
  // §6.5: filterPassRate is only ever computed when scannedItemCount > 0.
  if (observation.scannedItemCount === undefined && observation.filterPassRate !== undefined) {
    errors.push('observation.filterPassRate must be undefined when scannedItemCount is undefined.');
  }
}

function validateCloudWatchSeries(series: unknown, path: string, errors: string[]): void {
  if (!isPlainObject(series)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!isNonEmptyString(series.metricName)) errors.push(`${path}.metricName must be a non-empty string.`);
  if (!isNonEmptyString(series.statistic)) errors.push(`${path}.statistic must be a non-empty string.`);
  if (!oneOf(series.scope, CLOUDWATCH_SCOPES)) errors.push(`${path}.scope must be one of: ${CLOUDWATCH_SCOPES.join(', ')}.`);
  if (series.source !== 'AWS/DynamoDB') errors.push(`${path}.source must be "AWS/DynamoDB".`);
  if (typeof series.noData !== 'boolean') {
    errors.push(`${path}.noData must be a boolean.`);
  }
  if (!Array.isArray(series.timestamps) || !Array.isArray(series.values)) {
    errors.push(`${path}.timestamps/values must be arrays.`);
    return;
  }
  if (series.timestamps.length !== series.values.length) {
    errors.push(`${path}.timestamps and ${path}.values must have the same length.`);
  }
  if (series.noData === true && series.timestamps.length > 0) {
    errors.push(`${path}.noData must be false whenever timestamps is non-empty.`);
  }
  if (series.noData === false && series.timestamps.length === 0) {
    errors.push(`${path}.noData must be true whenever timestamps is empty.`);
  }
  series.timestamps.forEach((t, i) => {
    if (!isIsoLikeDate(t)) errors.push(`${path}.timestamps[${i}] must be an ISO-like date string.`);
  });
  series.values.forEach((v, i) => {
    if (!isFiniteNumber(v)) errors.push(`${path}.values[${i}] must be a finite number.`);
  });
  for (let i = 1; i < series.timestamps.length; i++) {
    if (Date.parse(series.timestamps[i]) < Date.parse(series.timestamps[i - 1])) {
      errors.push(`${path}.timestamps must be in ascending order.`);
      break;
    }
  }
}

function validateCloudWatch(cloudWatch: unknown, errors: string[]): void {
  if (cloudWatch === undefined) return;
  if (!isPlainObject(cloudWatch)) {
    errors.push('cloudWatch must be an object.');
    return;
  }
  if (!isPlainObject(cloudWatch.window) || !isIsoLikeDate(cloudWatch.window.startTime) || !isIsoLikeDate(cloudWatch.window.endTime)) {
    errors.push('cloudWatch.window.startTime/endTime must be ISO-like date strings.');
  } else if (Date.parse(cloudWatch.window.startTime as string) > Date.parse(cloudWatch.window.endTime as string)) {
    errors.push('cloudWatch.window.startTime must not be after endTime.');
  }
  if (!isPlainObject(cloudWatch.window) || !isFiniteNumber(cloudWatch.window.periodSeconds) || (cloudWatch.window.periodSeconds as number) <= 0) {
    errors.push('cloudWatch.window.periodSeconds must be a positive number.');
  }
  if (!Array.isArray(cloudWatch.series)) {
    errors.push('cloudWatch.series must be an array.');
  } else {
    cloudWatch.series.forEach((s, i) => validateCloudWatchSeries(s, `cloudWatch.series[${i}]`, errors));
  }
}

function validateDiagnostic(diagnostic: unknown, index: number, errors: string[]): void {
  if (!isPlainObject(diagnostic)) {
    errors.push(`collection.diagnostics[${index}] must be an object.`);
    return;
  }
  if (!oneOf(diagnostic.code, DIAGNOSTIC_CODES)) errors.push(`collection.diagnostics[${index}].code is not a known diagnostic code.`);
  if (!oneOf(diagnostic.severity, DIAGNOSTIC_SEVERITIES)) errors.push(`collection.diagnostics[${index}].severity must be "info" or "warning".`);
  if (typeof diagnostic.affectsCompleteness !== 'boolean') errors.push(`collection.diagnostics[${index}].affectsCompleteness must be a boolean.`);
  if (!oneOf(diagnostic.scope, DIAGNOSTIC_SCOPES)) errors.push(`collection.diagnostics[${index}].scope is not a known scope.`);
  if (!isNonEmptyString(diagnostic.message)) errors.push(`collection.diagnostics[${index}].message must be a non-empty string.`);
}

function validateUnavailableSection(section: unknown, index: number, errors: string[]): void {
  if (!isPlainObject(section)) {
    errors.push(`collection.unavailableSections[${index}] must be an object.`);
    return;
  }
  if (!oneOf(section.section, UNAVAILABLE_SECTIONS)) errors.push(`collection.unavailableSections[${index}].section is not a known section.`);
  if (!isNonEmptyString(section.reason)) errors.push(`collection.unavailableSections[${index}].reason must be a non-empty string.`);
}

function validateCollection(collection: unknown, errors: string[]): void {
  if (!isPlainObject(collection)) {
    errors.push('collection is required.');
    return;
  }
  if (!isIsoLikeDate(collection.collectedAt)) errors.push('collection.collectedAt must be an ISO-like date string.');
  if (!oneOf(collection.status, ['complete', 'partial'])) errors.push('collection.status must be "complete" or "partial".');

  const diagnostics = Array.isArray(collection.diagnostics) ? collection.diagnostics : undefined;
  if (!diagnostics) {
    errors.push('collection.diagnostics must be an array.');
  } else {
    diagnostics.forEach((d, i) => validateDiagnostic(d, i, errors));
  }
  const unavailableSections = Array.isArray(collection.unavailableSections) ? collection.unavailableSections : undefined;
  if (!unavailableSections) {
    errors.push('collection.unavailableSections must be an array.');
  } else {
    unavailableSections.forEach((s, i) => validateUnavailableSection(s, i, errors));
  }

  // §6.5: status is 'partial' iff there's an unavailableSection or an
  // affectsCompleteness: true diagnostic - an info diagnostic or a
  // legitimate CloudWatch no-data alone must never flip it.
  if (diagnostics && unavailableSections) {
    const shouldBePartial = unavailableSections.length > 0 || diagnostics.some((d) => isPlainObject(d) && d.affectsCompleteness === true);
    if (shouldBePartial && collection.status !== 'partial') {
      errors.push('collection.status must be "partial" when unavailableSections is non-empty or a diagnostic has affectsCompleteness: true.');
    }
    if (!shouldBePartial && collection.status === 'partial') {
      errors.push('collection.status must not be "partial" when nothing affects completeness.');
    }
  }
}

// §13: Full Context/AI prompt/saved DBN must never carry Item bodies, bind
// values, or pagination cursors - checked structurally, at any depth,
// rather than trusting that every producer of this object got every field
// name right.
function checkNoForbiddenKeys(value: unknown, path: string, errors: string[], depth = 0): void {
  if (depth > 20 || value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => checkNoForbiddenKeys(item, `${path}[${i}]`, errors, depth + 1));
    return;
  }
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const here = path ? `${path}.${key}` : key;
    if (FORBIDDEN_KEYS.has(key)) {
      errors.push(`${here} is a forbidden key and must never appear in a DynamoDbPerformanceTuningContext.`);
      continue;
    }
    checkNoForbiddenKeys(v, here, errors, depth + 1);
  }
}

export function validateDynamoDbPerformanceTuningContext(context: unknown): string[] {
  const errors: string[] = [];

  if (!isPlainObject(context)) {
    return ['context is required.'];
  }
  if (context.formatVersion !== 1) errors.push(`formatVersion must be 1, got ${JSON.stringify(context.formatVersion)}.`);
  if (context.engine !== 'dynamodb') errors.push('engine must be "dynamodb".');

  validateService(context.service, errors);
  validateStatement(context.statement, errors);
  validateAccessPattern(context.accessPattern, errors);
  validateTable(context.table, errors);
  validateObservation(context.observation, errors);
  validateCloudWatch(context.cloudWatch, errors);
  validateCollection(context.collection, errors);
  checkNoForbiddenKeys(context, '', errors);

  return errors;
}

export function isValidDynamoDbPerformanceTuningContext(context: unknown): context is DynamoDbPerformanceTuningContext {
  return validateDynamoDbPerformanceTuningContext(context).length === 0;
}
