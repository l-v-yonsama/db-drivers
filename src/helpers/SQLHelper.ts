// This file is a re-export barrel: SQLHelper.ts's implementation lives in
// ./sql/*.ts, split by responsibility (see readability-maintenance-plan-
// 2026-08-14.md, Phase 3). It exists so existing imports of
// '../helpers/SQLHelper' / './SQLHelper' keep working unchanged.
export { formatQuery, getSqlLanguage } from './sql/formatQuery';
export {
  createUndoChangeSQL,
  toDeleteStatement,
  toInsertStatement,
  toUpdateStatement,
} from './sql/mutationQuery';
export {
  createColumnNames,
  createTableNames,
  toCountRecordsQuery,
  toViewDataNormalizedQuery,
  toViewDataQuery,
  toViewRecordsQuery,
} from './sql/selectQuery';
export {
  hasSetVariableClause,
  isReadOnlyQuery,
  parseQuery,
  separateMultipleQueries,
  toSafeQueryForPgsqlAst,
} from './sql/queryParser';
export {
  normalizePositionedParametersQuery,
  normalizeQuery,
  normalizeSimpleParametersQuery,
} from './sql/parameterNormalizer';
export {
  createTableNameWithSchema,
  needsQuoting,
  wrapBackQuote,
  wrapDoubleQuote,
  wrapQuote,
  wrapSingleQuote,
} from './sql/quote';
export type { QuoteChar } from './sql/quote';
export { toRdsDatabase } from './sql/dynamoConversion';
