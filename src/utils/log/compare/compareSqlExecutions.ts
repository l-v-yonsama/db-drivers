import { diffLines } from 'diff';
import { ExtractedSqlResult, LogSqlComparisonDetail, LogSqlComparisonOptions, LogSqlComparisonRecord, LogSqlComparisonResult, LogSqlComparisonSummary } from '../../../types';
import { validateLogSqlComparisonOptions } from './comparisonOptions';
import { compareWhere, inspectComparisonSql } from './comparisonSql';

type Prepared = { record: LogSqlComparisonRecord; where?: ReturnType<typeof inspectComparisonSql>['where'] };

function prepare(result: ExtractedSqlResult, side: 'before' | 'after', options: LogSqlComparisonOptions): Prepared[] {
  if (!result?.ok || result.stage !== 'sqlExecution') throw new Error(`${side}: successful sqlExecution extraction is required`);
  return result.sqlExecutions
    .filter((execution) => execution.type !== 'error' || Boolean(execution.sql?.trim()))
    .map((execution, order) => ({ execution, order }))
    .sort((a, b) => a.execution.startLine - b.execution.startLine || a.order - b.order)
    .map(({ execution }, order) => {
      const record: LogSqlComparisonRecord = {
        id: `${side}-${order + 1}`,
        side,
        startLine: execution.startLine,
        endLine: execution.endLine,
        sourceRanges: execution.sourceRanges ?? [],
        timestamp: execution.timestamp,
        thread: execution.thread,
        daoClass: execution.daoClass,
        daoMethod: execution.daoMethod,
        sql: execution.comparisonSql,
        rawParameters: execution.rawParameters,
        meta: { dml: 'UNKNOWN' },
        issues: [...(execution.comparisonIssues ?? [])],
      };
      if (!record.sql) {
        if (!record.issues.length) record.issues.push({ code: 'incompleteParameters', message: 'Comparison SQL was not reconstructed' });
        return { record };
      }
      try {
        const inspected = inspectComparisonSql(record.sql, options);
        record.meta = inspected.meta;
        if (record.meta.table) record.matchKey = `${record.meta.dml}:${record.meta.table.toLowerCase()}`;
        record.formattedSql = inspected.formattedSql;
        record.equivalentSql = inspected.equivalentSql;
        if (!record.matchKey) record.issues.push({ code: 'unsupportedSql', message: 'SQL type or primary table is unsupported' });
        return { record, where: inspected.where };
      } catch (error) {
        record.issues.push({ code: 'normalizationFailed', message: error instanceof Error ? error.message : String(error) });
        return { record };
      }
    });
}

function lineDiff(before: string, after: string): string {
  // Compare SQL lines without treating the final newline as a SQL difference.
  const completeLine = (sql: string): string => sql.endsWith('\n') ? sql : `${sql}\n`;
  return diffLines(completeLine(before), completeLine(after)).map((part) => part.value.split('\n').filter((line, i, arr) => i < arr.length - 1 || line.length > 0).map((line) => `${part.added ? '+' : part.removed ? '-' : ' '}${line}`).join('\n')).filter(Boolean).join('\n');
}

/** Compare extracted SQL in physical log order, using CLI-style nearest future key alignment. */
export function compareSqlExecutions(params: { before: ExtractedSqlResult; after: ExtractedSqlResult; options: LogSqlComparisonOptions }): LogSqlComparisonResult {
  validateLogSqlComparisonOptions(params.options);
  const before = prepare(params.before, 'before', params.options);
  const after = prepare(params.after, 'after', params.options);
  const details: LogSqlComparisonDetail[] = [];
  let i = 0;
  let j = 0;
  const push = (b?: Prepared, a?: Prepared, reason?: string): void => {
    const base: LogSqlComparisonDetail = {
      index: details.length + 1,
      beforeId: b?.record.id,
      afterId: a?.record.id,
      sqlMatchLevel: 'SKIP',
      reason,
      where: { status: 'notComparable', reason: reason ? `SQL statements were not paired (${reason})` : 'SQL statements were not paired' },
    };
    if (b?.record.matchKey && b.record.matchKey === a?.record.matchKey) {
      base.sqlMatchLevel = b.record.formattedSql === a.record.formattedSql ? 'FORMATTED_MATCH'
        : b.record.equivalentSql === a.record.equivalentSql ? 'EQUIVALENT_MATCH' : 'DIFF';
      base.reason = undefined;
      base.where = compareWhere(b.where, a.where);
      if (base.sqlMatchLevel !== 'FORMATTED_MATCH') base.diffFormattedText = lineDiff(b.record.formattedSql!, a.record.formattedSql!);
      if (base.sqlMatchLevel === 'DIFF') base.diffEquivalentText = lineDiff(b.record.equivalentSql!, a.record.equivalentSql!);
    }
    details.push(base);
  };
  const badReason = (item: Prepared): string => item.record.issues[0]?.code ??
    (item.record.sql ? 'unsupportedSql' : 'incompleteParameters');
  while (i < before.length || j < after.length) {
    const b = before[i];
    const a = after[j];
    if (b && !b.record.matchKey) { push(b, undefined, badReason(b)); i++; continue; }
    if (a && !a.record.matchKey) { push(undefined, a, badReason(a)); j++; continue; }
    if (!b) { push(undefined, a, 'missingBefore'); j++; continue; }
    if (!a) { push(b, undefined, 'missingAfter'); i++; continue; }
    if (b.record.matchKey === a.record.matchKey) {
      if (b.record.meta.table !== a.record.meta.table) {
        const nextAfterExact = after.findIndex((item, at) => at > j && item.record.matchKey === b.record.matchKey && item.record.meta.table === b.record.meta.table);
        const nextBeforeExact = before.findIndex((item, at) => at > i && item.record.matchKey === a.record.matchKey && item.record.meta.table === a.record.meta.table);
        if (nextAfterExact >= 0 && (nextBeforeExact < 0 || nextAfterExact - j <= nextBeforeExact - i)) {
          push(undefined, a, 'missingBefore'); j++; continue;
        }
        if (nextBeforeExact >= 0) { push(b, undefined, 'missingAfter'); i++; continue; }
      }
      push(b, a); i++; j++; continue;
    }
    const nextAfter = after.findIndex((item, at) => at > j && item.record.matchKey === b.record.matchKey);
    const nextBefore = before.findIndex((item, at) => at > i && item.record.matchKey === a.record.matchKey);
    const distAfter = nextAfter < 0 ? Infinity : nextAfter - j;
    const distBefore = nextBefore < 0 ? Infinity : nextBefore - i;
    if (distAfter < Infinity && distAfter <= distBefore) { push(undefined, a, 'missingBefore'); j++; }
    else if (distBefore < Infinity) { push(b, undefined, 'missingAfter'); i++; }
    else { push(b, a, 'incompatibleKey'); i++; j++; }
  }
  const summary: LogSqlComparisonSummary = {
    total: details.length,
    beforeSqlCount: before.length,
    afterSqlCount: after.length,
    formattedMatched: details.filter((d) => d.sqlMatchLevel === 'FORMATTED_MATCH').length,
    equivalentMatched: details.filter((d) => d.sqlMatchLevel === 'EQUIVALENT_MATCH').length,
    unmatched: details.filter((d) => d.sqlMatchLevel === 'DIFF').length,
    skipped: details.filter((d) => d.sqlMatchLevel === 'SKIP').length,
    whereClauseMatched: details.filter((d) => d.where.status === 'matched').length,
    skipReasonCounts: {},
  };
  for (const detail of details) if (detail.sqlMatchLevel === 'SKIP') {
    const key = detail.reason ?? 'unknown';
    summary.skipReasonCounts[key] = (summary.skipReasonCounts[key] ?? 0) + 1;
  }
  return {
    before: before.map((item) => item.record),
    after: after.map((item) => item.record),
    details,
    summary,
    diagnostics: { before: params.before.diagnostics, after: params.after.diagnostics },
  };
}
