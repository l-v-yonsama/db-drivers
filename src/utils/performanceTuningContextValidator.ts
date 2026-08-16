import { PerformanceTuningContext } from '../types';
import { VALID_PLAN_MODES, VALID_STATEMENT_SOURCES } from './performanceTuningContext';

const COLLECTION_STATUSES = ['complete', 'partial'];
const UNAVAILABLE_SECTIONS = [
  'executionPlan',
  'analyzedExecutionPlan',
  'tableDefinition',
  'tableStatistics',
  'columnStatistics',
  'physicalHealth',
];

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0;

const isIsoLikeDate = (v: unknown): boolean =>
  typeof v === 'string' && v.length > 0 && !Number.isNaN(Date.parse(v));

const oneOf = (v: unknown, allowed: readonly string[]): boolean =>
  typeof v === 'string' && allowed.includes(v);

// A MetricValue<T> field is optional everywhere it appears, but when
// present it must carry real provenance (§5.4/§5.5's whole point) - a bare
// number or string in its place is exactly the "one estimated/source per
// section" regression MetricValue<T> replaced.
const validateMetricValue = (
  value: unknown,
  path: string,
  valueType: 'number' | 'string',
  errors: string[],
): void => {
  if (value === undefined) {
    return;
  }
  if (!isPlainObject(value)) {
    errors.push(`${path} must be a MetricValue object.`);
    return;
  }
  if (typeof value.value !== valueType) {
    errors.push(`${path}.value must be a ${valueType}.`);
  }
  if (typeof value.estimated !== 'boolean') {
    errors.push(`${path}.estimated must be a boolean.`);
  }
  if (!isNonEmptyString(value.source)) {
    errors.push(`${path}.source must be a non-empty string.`);
  }
  if (value.unit !== undefined && typeof value.unit !== 'string') {
    errors.push(`${path}.unit must be a string.`);
  }
};

const validateDatabase = (database: unknown, errors: string[]): void => {
  if (!isPlainObject(database)) {
    errors.push('database is required.');
    return;
  }
  if (!isNonEmptyString(database.vendor)) {
    errors.push('database.vendor must be a non-empty string.');
  }
  if (!isNonEmptyString(database.databaseName)) {
    errors.push('database.databaseName must be a non-empty string.');
  }
};

const validateStatement = (statement: unknown, errors: string[]): void => {
  if (!isPlainObject(statement)) {
    errors.push('statement is required.');
    return;
  }
  if (!isNonEmptyString(statement.sql)) {
    errors.push('statement.sql must be a non-empty string.');
  }
  if (!oneOf(statement.source, VALID_STATEMENT_SOURCES)) {
    errors.push(
      `statement.source must be one of: ${VALID_STATEMENT_SOURCES.join(', ')}.`,
    );
  }
};

// Recurses into every child, not just the top node - a normalizedPlan with
// a well-shaped root but a garbage leaf three levels down is exactly the
// kind of "looks right at a glance" break this validator exists to catch
// (see the module doc comment below).
const validatePlanNode = (node: unknown, path: string, errors: string[]): void => {
  if (!isPlainObject(node)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!isNonEmptyString(node.id)) {
    errors.push(`${path}.id must be a non-empty string.`);
  }
  if (typeof node.depth !== 'number') {
    errors.push(`${path}.depth must be a number.`);
  }
  if (!isNonEmptyString(node.operation)) {
    errors.push(`${path}.operation must be a non-empty string.`);
  }
  if (!Array.isArray(node.children)) {
    errors.push(`${path}.children must be an array.`);
  } else {
    node.children.forEach((child, index) =>
      validatePlanNode(child, `${path}.children[${index}]`, errors),
    );
  }
};

const validateExecutionPlan = (plan: unknown, errors: string[]): void => {
  if (!isPlainObject(plan)) {
    errors.push('executionPlan is required.');
    return;
  }
  if (!oneOf(plan.mode, VALID_PLAN_MODES)) {
    errors.push(
      `executionPlan.mode must be one of: ${VALID_PLAN_MODES.join(', ')}.`,
    );
  }
  if (plan.format !== 'json') {
    errors.push("executionPlan.format must be 'json'.");
  }
  if (!Array.isArray(plan.warnings)) {
    errors.push('executionPlan.warnings must be an array.');
  }
  if (plan.normalizedPlan !== undefined) {
    validatePlanNode(plan.normalizedPlan, 'executionPlan.normalizedPlan', errors);
  }
};

const validateTable = (table: unknown, index: number, errors: string[]): void => {
  const path = `tables[${index}]`;
  if (!isPlainObject(table)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!isNonEmptyString(table.tableName)) {
    errors.push(`${path}.tableName must be a non-empty string.`);
  }
  if (!Array.isArray(table.warnings)) {
    errors.push(`${path}.warnings must be an array.`);
  }

  const statistics = table.statistics;
  if (statistics !== undefined) {
    if (!isPlainObject(statistics)) {
      errors.push(`${path}.statistics must be an object.`);
    } else {
      validateMetricValue(
        statistics.estimatedRowCount,
        `${path}.statistics.estimatedRowCount`,
        'number',
        errors,
      );
      validateMetricValue(
        statistics.tableBytes,
        `${path}.statistics.tableBytes`,
        'number',
        errors,
      );
      validateMetricValue(
        statistics.statisticsUpdatedAt,
        `${path}.statistics.statisticsUpdatedAt`,
        'string',
        errors,
      );
      if (!Array.isArray(statistics.columns)) {
        errors.push(`${path}.statistics.columns must be an array.`);
      } else {
        statistics.columns.forEach((column, columnIndex) => {
          const columnPath = `${path}.statistics.columns[${columnIndex}]`;
          if (!isPlainObject(column) || !isNonEmptyString(column.columnName)) {
            errors.push(`${columnPath}.columnName must be a non-empty string.`);
            return;
          }
          validateMetricValue(
            column.distinctCount,
            `${columnPath}.distinctCount`,
            'number',
            errors,
          );
          validateMetricValue(
            column.nullFraction,
            `${columnPath}.nullFraction`,
            'number',
            errors,
          );
        });
      }
    }
  }

  const definition = table.definition;
  if (definition !== undefined) {
    if (!isPlainObject(definition)) {
      errors.push(`${path}.definition must be an object.`);
    } else {
      if (!Array.isArray(definition.columns)) {
        errors.push(`${path}.definition.columns must be an array.`);
      }
      if (!Array.isArray(definition.constraints)) {
        errors.push(`${path}.definition.constraints must be an array.`);
      }
      if (!Array.isArray(definition.indexes)) {
        errors.push(`${path}.definition.indexes must be an array.`);
      }
    }
  }
};

const validatePlanTableMapping = (
  mapping: unknown,
  index: number,
  errors: string[],
): void => {
  const path = `planTableMappings[${index}]`;
  if (!isPlainObject(mapping)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!isNonEmptyString(mapping.planNodeId)) {
    errors.push(`${path}.planNodeId must be a non-empty string.`);
  }
  if (!isNonEmptyString(mapping.tableName)) {
    errors.push(`${path}.tableName must be a non-empty string.`);
  }
};

const validateUnavailableSection = (
  section: unknown,
  index: number,
  errors: string[],
): void => {
  const path = `collection.unavailableSections[${index}]`;
  if (!isPlainObject(section)) {
    errors.push(`${path} must be an object.`);
    return;
  }
  if (!oneOf(section.section, UNAVAILABLE_SECTIONS)) {
    errors.push(
      `${path}.section must be one of: ${UNAVAILABLE_SECTIONS.join(', ')}.`,
    );
  }
  if (!isNonEmptyString(section.reason)) {
    errors.push(`${path}.reason must be a non-empty string.`);
  }
};

const validateCollection = (collection: unknown, errors: string[]): void => {
  if (!isPlainObject(collection)) {
    errors.push('collection is required.');
    return;
  }
  if (!isIsoLikeDate(collection.collectedAt)) {
    errors.push('collection.collectedAt must be a parseable date string.');
  }
  if (!oneOf(collection.status, COLLECTION_STATUSES)) {
    errors.push(
      `collection.status must be one of: ${COLLECTION_STATUSES.join(', ')}.`,
    );
  }
  if (!Array.isArray(collection.warnings)) {
    errors.push('collection.warnings must be an array.');
  }
  if (!Array.isArray(collection.unavailableSections)) {
    errors.push('collection.unavailableSections must be an array.');
  } else {
    collection.unavailableSections.forEach((section, index) =>
      validateUnavailableSection(section, index, errors),
    );
  }
};

// Hand-rolled structural/runtime check for the *output* of
// getPerformanceTuningContext() - deliberately not a full JSON Schema
// library (no schema-validation dependency exists in this package yet;
// see §10 Phase 0 "JSON Schema または runtime validator"). Recurses into
// tables/planTableMappings/collection rather than only checking their
// top-level shape, so a context with e.g. `tables: [null]` or
// `collectedAt: 'not-a-date'` is caught here instead of reaching an AI
// prompt as a half-shaped object that merely happened to have the right
// top-level keys.
export function validatePerformanceTuningContext(context: unknown): string[] {
  const errors: string[] = [];

  if (!isPlainObject(context)) {
    return ['context is required.'];
  }

  if (context.formatVersion !== 1) {
    errors.push(
      `formatVersion must be 1, got ${JSON.stringify(context.formatVersion)}.`,
    );
  }

  validateDatabase(context.database, errors);
  validateStatement(context.statement, errors);
  validateExecutionPlan(context.executionPlan, errors);

  if (!Array.isArray(context.tables)) {
    errors.push('tables must be an array.');
  } else {
    context.tables.forEach((table, index) => validateTable(table, index, errors));
  }

  if (!Array.isArray(context.planTableMappings)) {
    errors.push('planTableMappings must be an array.');
  } else {
    context.planTableMappings.forEach((mapping, index) =>
      validatePlanTableMapping(mapping, index, errors),
    );
  }

  validateCollection(context.collection, errors);

  return errors;
}

export function isValidPerformanceTuningContext(
  context: unknown,
): context is PerformanceTuningContext {
  return validatePerformanceTuningContext(context).length === 0;
}
