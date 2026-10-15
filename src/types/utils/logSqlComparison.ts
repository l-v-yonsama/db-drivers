import { LogParseDiagnostics } from './index';

/** Options shared by the comparison API and the extension's configuration. */
export type LogSqlComparisonOptions = {
  dialect: 'mysql' | 'postgresql' | 'transactsql' | 'sqlite' | 'plsql';
  equivalence?: SqlEquivalenceOptions;
};

export type SqlEquivalenceOptions = {
  ignoreIdentifierCase?: boolean;
  ignoreSingleTableAlias?: boolean;
  ignoreOrdinaryComments?: boolean;
  ignoreOptimizerHints?: boolean;
  normalizeDateFunctions?: boolean;
  ignoreDateTimeLiteralValues?: boolean;
  removeRedundantWhereParentheses?: boolean;
};

export type LogSqlComparisonIssue = {
  code: string;
  message: string;
};

export type LogSqlSourceRange = {
  startLine: number;
  endLine: number;
};

export type LogSqlComparisonRecord = {
  id: string;
  side: 'before' | 'after';
  startLine: number;
  endLine: number;
  sourceRanges: LogSqlSourceRange[];
  timestamp?: string;
  thread?: string;
  daoClass?: string;
  daoMethod?: string;
  sql?: string;
  rawParameters?: string[];
  meta: { dml: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UNKNOWN'; table?: string };
  matchKey?: string;
  formattedSql?: string;
  equivalentSql?: string;
  issues: LogSqlComparisonIssue[];
};

export type LogSqlComparisonDetail = {
  index: number;
  beforeId?: string;
  afterId?: string;
  sqlMatchLevel: 'FORMATTED_MATCH' | 'EQUIVALENT_MATCH' | 'DIFF' | 'SKIP';
  reason?: string;
  where: {
    status: 'matched' | 'different' | 'notApplicable' | 'notComparable';
    reason?: string;
    onlyBefore?: string[];
    onlyAfter?: string[];
  };
  diffFormattedText?: string;
  diffEquivalentText?: string;
};

export type LogSqlComparisonSummary = {
  total: number;
  beforeSqlCount: number;
  afterSqlCount: number;
  formattedMatched: number;
  equivalentMatched: number;
  unmatched: number;
  skipped: number;
  whereClauseMatched: number;
  skipReasonCounts: Record<string, number>;
};

export type LogSqlComparisonResult = {
  before: LogSqlComparisonRecord[];
  after: LogSqlComparisonRecord[];
  details: LogSqlComparisonDetail[];
  summary: LogSqlComparisonSummary;
  diagnostics: {
    before?: LogParseDiagnostics;
    after?: LogParseDiagnostics;
  };
};
