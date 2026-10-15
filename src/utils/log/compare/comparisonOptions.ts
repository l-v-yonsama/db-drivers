import { LogSqlComparisonOptions, SqlEquivalenceOptions } from '../../../types';

export function effectiveSqlEquivalenceOptions(options?: SqlEquivalenceOptions): Required<SqlEquivalenceOptions> {
  return {
    ignoreIdentifierCase: false,
    ignoreSingleTableAlias: false,
    ignoreOrdinaryComments: true,
    ignoreOptimizerHints: false,
    normalizeDateFunctions: true,
    ignoreDateTimeLiteralValues: false,
    removeRedundantWhereParentheses: true,
    ...options,
  };
}

export function validateLogSqlComparisonOptions(options: LogSqlComparisonOptions): void {
  if (!options || !['mysql', 'postgresql', 'transactsql', 'sqlite', 'plsql'].includes(options.dialect)) {
    throw new Error('Unsupported SQL comparison dialect');
  }
  if (options.equivalence !== undefined && (typeof options.equivalence !== 'object' || options.equivalence === null || Array.isArray(options.equivalence))) {
    throw new Error('Invalid SQL equivalence options');
  }
  for (const [key, value] of Object.entries(options.equivalence ?? {})) {
    if (!(key in effectiveSqlEquivalenceOptions()) || typeof value !== 'boolean') {
      throw new Error(`Invalid SQL equivalence option: ${key}`);
    }
  }
}
