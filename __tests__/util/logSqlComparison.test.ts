import { compareSqlExecutions, ExtractedSqlResult, LogSqlComparisonOptions, SqlExecutionEvent } from '../../src';

function extracted(sqls: Array<string | undefined>, lines?: number[]): ExtractedSqlResult {
  return {
    ok: true,
    stage: 'sqlExecution',
    logEvents: [],
    sqlExecutions: sqls.map((comparisonSql, index): SqlExecutionEvent => ({
      startLine: lines?.[index] ?? index + 1,
      endLine: lines?.[index] ?? index + 1,
      comparisonSql,
      sourceRanges: [{ startLine: lines?.[index] ?? index + 1, endLine: lines?.[index] ?? index + 1 }],
    })),
    inputSummary: {} as ExtractedSqlResult['inputSummary'],
    outputSummary: {} as ExtractedSqlResult['outputSummary'],
    elapsedTimeMilli: { split: 0, total: 0 },
  };
}

const compare = (before: Array<string | undefined>, after: Array<string | undefined>, equivalence?: LogSqlComparisonOptions['equivalence']) => compareSqlExecutions({ before: extracted(before), after: extracted(after), options: { dialect: 'mysql', equivalence } });

describe('SQL log comparison', () => {
  it('distinguishes formatting matches from literal changes', () => {
    const result = compare(
      ["SELECT * FROM t WHERE name = 'alice'", "select * from t where name='A  B'", 'select a.id from a'],
      ["SELECT * FROM t WHERE name = 'alice'", "SELECT * FROM t WHERE name = 'A B'", 'select b.id from a'],
    );
    expect(result.details.map((d) => d.sqlMatchLevel)).toEqual(['FORMATTED_MATCH', 'DIFF', 'DIFF']);
    expect(result.summary).toMatchObject({ formattedMatched: 1, unmatched: 2, skipped: 0 });
    const normalized = compare(['select * from t where id=1'], ['SELECT * FROM t WHERE id = 1;']);
    expect(normalized.details[0].sqlMatchLevel).toBe('FORMATTED_MATCH');
    const trailingComment = compare(['SELECT * FROM t'], ['SELECT * FROM t; -- end of statement']);
    expect(trailingComment.details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(trailingComment.details[0].reason).toBeUndefined();
  });

  it('shows an unchanged WHERE predicate as context when the other SQL adds LIMIT', () => {
    const result = compare(
      ['SELECT id FROM t WHERE id = 1'],
      ['SELECT * FROM t WHERE id = 1 LIMIT 1'],
    );
    expect(result.details[0].where.status).toBe('matched');
    expect(result.details[0].sqlMatchLevel).toBe('DIFF');
    expect(result.details[0].diffEquivalentText).toMatch(/^ {3}id = 1$/m);
    expect(result.details[0].diffEquivalentText).not.toMatch(/^[+-]\s+id = 1$/m);
    expect(result.details[0].diffEquivalentText).toContain('+LIMIT');
  });

  it('retains schema qualifiers and quoted identifiers', () => {
    expect(compare(['select * from a.t'], ['select * from b.t']).details.map((d) => d.reason)).toEqual(['incompatibleKey']);
    const quoted = compare(['select * from `A`'], ['select * from `a`']);
    expect(quoted.details[0].reason).toBeUndefined();
    expect(quoted.details[0].sqlMatchLevel).toBe('DIFF');
  });

  it('uses the existing query parser for dialect-specific table names', () => {
    const cases = [
      { dialect: 'postgresql' as const, sql: 'SELECT * FROM "audit"."event log"', table: 'audit.event log' },
      { dialect: 'transactsql' as const, sql: 'SELECT TOP 10 * FROM [sales].[order items]', table: 'sales.order items' },
      { dialect: 'sqlite' as const, sql: 'SELECT * FROM `main`.`orders` WHERE id = 1 LIMIT 1', table: 'main.orders' },
      { dialect: 'plsql' as const, sql: 'SELECT * FROM "HR"."EMPLOYEES" WHERE employee_id = 1 FETCH FIRST 1 ROWS ONLY', table: 'HR.EMPLOYEES' },
    ];
    for (const { dialect, sql, table } of cases) {
      const result = compareSqlExecutions({ before: extracted([sql]), after: extracted([sql]), options: { dialect } });
      expect(result.before[0].meta).toEqual({ dml: 'SELECT', table });
      expect(result.details[0].sqlMatchLevel).toBe('FORMATTED_MATCH');
    }
  });

  it('pairs SQLite INSERT OR REPLACE statements while retaining their SQL text', () => {
    const sql = "INSERT OR REPLACE INTO users (id, name) VALUES (1, 'Alice')";
    const result = compareSqlExecutions({ before: extracted([sql]), after: extracted([sql]), options: { dialect: 'sqlite' } });
    expect(result.before[0].meta).toEqual({ dml: 'INSERT', table: 'users' });
    expect(result.details[0].sqlMatchLevel).toBe('FORMATTED_MATCH');
    expect(result.before[0].formattedSql).toContain('OR REPLACE');
  });

  it('uses the first table inside a derived FROM, not a scalar subquery table', () => {
    const before = 'select * from (select (select count(*) from audit) as n, t.id from orders t) x';
    const after = 'SELECT * FROM (SELECT (SELECT count(*) FROM audit) AS n, t.id FROM orders t) x';
    const result = compare([before], [after]);
    expect(result.before[0].meta).toEqual({ dml: 'SELECT', table: 'orders' });
    expect(result.details[0].sqlMatchLevel).toBe('FORMATTED_MATCH');
  });

  it('aligns by nearest future key and consumes every record once', () => {
    const result = compare(['select * from a', 'select * from b'], ['select * from x', 'select * from a', 'select * from b']);
    expect(result.details.map((d) => [d.beforeId, d.afterId, d.reason])).toEqual([
      [undefined, 'after-1', 'missingBefore'],
      ['before-1', 'after-2', undefined],
      ['before-2', 'after-3', undefined],
    ]);
    expect(result.details.flatMap((d) => [d.beforeId, d.afterId].filter(Boolean)).sort()).toEqual(['after-1', 'after-2', 'after-3', 'before-1', 'before-2']);
  });

  it('uses the new side when future distances tie', () => {
    const result = compare(['select * from a', 'select * from b'], ['select * from b', 'select * from a']);
    expect(result.details.map((d) => d.reason)).toEqual(['missingBefore', undefined, 'missingAfter']);
  });

  it('pairs repeated keys in order, even if a later SQL would match exactly', () => {
    const result = compare(['select * from t where id=1', 'select * from t where id=2'], ['select * from t where id=2']);
    expect(result.details.map((d) => d.sqlMatchLevel)).toEqual(['DIFF', 'SKIP']);
  });

  it('does not pair unsupported or incomplete SQL', () => {
    const result = compare(['CALL p()', undefined, 'select 1'], ['CALL p()', 'select 1']);
    expect(result.summary.skipped).toBe(5);
    expect(result.summary.skipReasonCounts.unsupportedSql).toBe(4);
    expect(result.summary.skipReasonCounts.incompleteParameters).toBe(1);
    const missingBind = extracted([undefined]);
    missingBind.sqlExecutions[0].comparisonIssues = [{ code: 'missingParameters', message: 'No parameter log.' }];
    const specific = compareSqlExecutions({ before: missingBind, after: extracted([]), options: { dialect: 'mysql' } });
    expect(specific.details[0].reason).toBe('missingParameters');
  });

  it('does not count an error-only event as an executed SQL statement', () => {
    const before = extracted(['select * from t']);
    const after = extracted(['select * from t', undefined]);
    after.sqlExecutions[1].type = 'error';
    after.sqlExecutions[1].error = 'SQL execution failed';
    const result = compareSqlExecutions({ before, after, options: { dialect: 'mysql' } });
    expect(result.summary).toMatchObject({ beforeSqlCount: 1, afterSqlCount: 1, formattedMatched: 1, skipped: 0 });
    expect(result.after).toHaveLength(1);
  });

  it('compares simple AND predicates as a multiset and marks complex WHERE incomparable', () => {
    const same = compare(['select * from t where a=1 and b=2 and a=1'], ['select * from t where b=2 and a=1 and a=1']);
    expect(same.details[0].sqlMatchLevel).toBe('DIFF');
    expect(same.details[0].where.status).toBe('matched');
    const missing = compare(['select * from t where a=1 and a=1'], ['select * from t where a=1']);
    expect(missing.details[0].where).toMatchObject({ status: 'different', onlyBefore: ['a = 1'] });
    expect(compare(['select * from t where a=1 or b=2'], ['select * from t where a=1']).details[0].where).toEqual({
      status: 'notComparable', reason: 'Before: OR condition is not supported',
    });
  });

  it('compares literal IN lists without depending on their order', () => {
    const userCase = compare(
      ['SELECT T1_.ID FROM `present_order` T1_ WHERE (T1_.ID IN (601)) FOR UPDATE'],
      ['SELECT * FROM present_order WHERE id IN (601) FOR UPDATE'],
      { ignoreSingleTableAlias: true },
    );
    expect(userCase.details[0].where).toEqual({ status: 'matched' });
    const reordered = compare(
      ["SELECT * FROM t WHERE id IN (2, 1, 2) AND state = 'open'"],
      ["SELECT * FROM t WHERE state = 'open' AND id IN (1, 2)"],
    );
    expect(reordered.details[0].where).toEqual({ status: 'matched' });
    const changed = compare(['SELECT * FROM t WHERE id IN (1, 2)'], ['SELECT * FROM t WHERE id IN (1, 3)']);
    expect(changed.details[0].where).toMatchObject({
      status: 'different', onlyBefore: ['id IN (1, 2)'], onlyAfter: ['id IN (1, 3)'],
    });
  });

  it('explains why unsupported WHERE expressions cannot be compared', () => {
    const subquery = compare(
      ['SELECT * FROM t WHERE id IN (SELECT id FROM other_table)'],
      ['SELECT * FROM t WHERE id IN (1)'],
    );
    expect(subquery.details[0].where).toEqual({
      status: 'notComparable', reason: 'Before: IN subquery is not supported',
    });
    const expression = compare(
      ['SELECT * FROM t WHERE LOWER(name) = \'x\''],
      ['SELECT * FROM t WHERE name = \'x\''],
    );
    expect(expression.details[0].where).toEqual({
      status: 'notComparable', reason: 'Before: Comparison requires a column and literal value',
    });
    const mixed = compare(
      ['SELECT * FROM t WHERE id = 1 AND id IN (SELECT id FROM other_table)'],
      ['SELECT * FROM t WHERE id = 1'],
    );
    expect(mixed.details[0].where).toEqual({
      status: 'notComparable', reason: 'Before: IN subquery is not supported',
    });
  });

  it('orders source SQL by physical line and carries diagnostics', () => {
    const before = extracted(['select * from b', 'select * from a'], [20, 2]);
    before.diagnostics = { unmatchedEventCount: 1, unmatchedEventStartLines: [50] };
    const result = compareSqlExecutions({ before, after: extracted(['select * from a', 'select * from b']), options: { dialect: 'mysql' } });
    expect(result.before.map((r) => r.startLine)).toEqual([2, 20]);
    expect(result.details.map((d) => d.sqlMatchLevel)).toEqual(['FORMATTED_MATCH', 'FORMATTED_MATCH']);
    expect(result.diagnostics.before).toEqual(before.diagnostics);
  });

  it('normalizes equivalent date functions by default but keeps optimizer hints', () => {
    const before = extracted(['select * from t where created_at=NOW()']);
    const after = extracted(['select * from t where created_at=CURRENT_TIMESTAMP']);
    expect(compareSqlExecutions({ before, after, options: { dialect: 'mysql' } }).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(compareSqlExecutions({ before, after, options: { dialect: 'mysql', equivalence: { normalizeDateFunctions: false } } }).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(['select * from t /*+ INDEX(t idx) */'], ['select * from t']).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(["select * from t where x='NOW()'"], ["select * from t where x='CURRENT_TIMESTAMP'"]).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(['select * from t where x=CURRENT_DATE'], ['select * from t where x=NOW()']).details[0].sqlMatchLevel).toBe('DIFF');
    const sqlServer = compareSqlExecutions({ before: extracted(['select * from t where created_at=GETDATE()']), after: extracted(['select * from t where created_at=CURRENT_TIMESTAMP']), options: { dialect: 'transactsql' } });
    expect(sqlServer.details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    for (const dialect of ['sqlite', 'plsql'] as const) {
      const result = compareSqlExecutions({ before, after, options: { dialect } });
      expect(result.details[0].sqlMatchLevel).toBe('DIFF');
    }
  });

  it('ignores complete date-time literal values only when enabled', () => {
    const before = "UPDATE t SET updated_at = '2026-10-12 10:01:00.123' WHERE expires_at < '2026-10-12 10:01:01'";
    const after = "UPDATE t SET updated_at = '2026-10-12 10:02:00.456' WHERE expires_at < '2026-10-12 10:02:01.000'";
    const defaultResult = compare([before], [after]);
    expect(defaultResult.details[0]).toMatchObject({ sqlMatchLevel: 'DIFF', where: { status: 'different' } });
    const result = compare([before], [after], { ignoreDateTimeLiteralValues: true });
    expect(result.details[0]).toMatchObject({ sqlMatchLevel: 'EQUIVALENT_MATCH', where: { status: 'matched' } });
    expect(result.before[0].formattedSql).toContain('2026-10-12 10:01:00.123');
    expect(result.after[0].formattedSql).toContain('2026-10-12 10:02:00.456');
    expect(result.before[0].equivalentSql).toContain('2000-10-10 01:01:01.000');
    expect(result.before[0].equivalentSql).toBe(result.after[0].equivalentSql);
  });

  it('keeps date-only values, ordinary strings, and comments distinct', () => {
    const before = "INSERT INTO t (created_at) VALUES ('2026-10-12 10:01:00')";
    const after = "INSERT INTO t (created_at) VALUES ('2026-10-12 10:02:00.123')";
    expect(compare([before], [after], { ignoreDateTimeLiteralValues: true }).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(compare(["SELECT * FROM t WHERE day = '2026-10-12'"], ["SELECT * FROM t WHERE day = '2026-10-13'"],
      { ignoreDateTimeLiteralValues: true }).details[0].where.status).toBe('different');
    expect(compare(["SELECT * FROM t WHERE note = 'at 2026-10-12 10:01:00'"],
      ["SELECT * FROM t WHERE note = 'at 2026-10-12 10:02:00'"],
      { ignoreDateTimeLiteralValues: true }).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(["SELECT * FROM t /* 2026-10-12 10:01:00 */"], ["SELECT * FROM t /* 2026-10-12 10:02:00 */"],
      { ignoreDateTimeLiteralValues: true, ignoreOrdinaryComments: false }).details[0].sqlMatchLevel).toBe('DIFF');
  });

  it('normalizes only complete WHERE parentheses by default', () => {
    expect(compare(['select * from t WHERE (id = 112) FOR UPDATE'], ['select * from t WHERE id = 112 FOR UPDATE']).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(compare(['select * from t WHERE (id = 112)'], ['select * from t WHERE id = 112'], { removeRedundantWhereParentheses: false }).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(['select * from t WHERE (a = 1) OR b = 2'], ['select * from t WHERE a = 1 OR b = 2']).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(["select * from t WHERE (name = 'x)')"], ["select * from t WHERE name = 'x)'"]).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
  });

  it('applies comment rules separately and preserves executable comments', () => {
    expect(compare(['select * from t /* note */'], ['select * from t']).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(compare(['select * from t /* note */'], ['select * from t'], { ignoreOrdinaryComments: false }).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(['select * from t /* note */'], ['select * from t'], { ignoreOrdinaryComments: true }).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(compare(['select * from t /*+ INDEX(t idx) */'], ['select * from t'], { ignoreOrdinaryComments: true }).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(['select * from t /*+ INDEX(t idx) */'], ['select * from t'], { ignoreOptimizerHints: true }).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(compare(['select * from t /*! WHERE id = 1 */'], ['select * from t'], { ignoreOrdinaryComments: true, ignoreOptimizerHints: true }).details[0].sqlMatchLevel).toBe('DIFF');
  });

  it('pairs table names regardless of case, then applies the identifier case rule to comparison', () => {
    const strict = compare(['select ID from Users'], ['select id from users']);
    expect(strict.before[0].matchKey).toBe('SELECT:users');
    expect(strict.after[0].matchKey).toBe('SELECT:users');
    expect(strict.details[0].sqlMatchLevel).toBe('DIFF');
    expect(strict.details[0].reason).toBeUndefined();
    expect(compare(['select ID from Users'], ['select id from users'], { ignoreIdentifierCase: true }).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(compare(['select `ID` from `Users`'], ['select `id` from `users`'], { ignoreIdentifierCase: true }).details[0].sqlMatchLevel).toBe('DIFF');
  });

  it('ignores a single table alias throughout equivalent SQL when enabled', () => {
    const before = 'SELECT T1_.ID, T1_.NAME FROM seller T1_ WHERE T1_.ID = 1 ORDER BY T1_.NAME';
    const after = 'SELECT ID, NAME FROM seller WHERE ID = 1 ORDER BY NAME';
    expect(compare([before], [after]).details[0].sqlMatchLevel).toBe('DIFF');
    const result = compare([before], [after], { ignoreSingleTableAlias: true });
    expect(result.details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(result.details[0].where.status).toBe('matched');
    expect(result.before[0].formattedSql).toContain('T1_.ID');
    expect(result.before[0].equivalentSql).toBe(result.after[0].equivalentSql);
    expect(compare(['SELECT t.* FROM seller AS t'], ['SELECT * FROM seller'], { ignoreSingleTableAlias: true }).details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    const sameAsSchema = compare(['SELECT t.id FROM t.seller AS t WHERE t.id = 1'],
      ['SELECT id FROM t.seller WHERE id = 1'], { ignoreSingleTableAlias: true });
    expect(sameAsSchema.details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(sameAsSchema.before[0].equivalentSql).toContain('t.seller');
  });

  it('removes single-table aliases from backtick-quoted MySQL tables and aliases', () => {
    const cases = [
      [
        'SELECT t.id FROM `tm5` AS t WHERE t.id = 1 ORDER BY t.id',
        'SELECT id FROM `tm5` WHERE id = 1 ORDER BY id',
        'tm5',
      ],
      [
        'SELECT `t`.id FROM `tm5` AS `t` WHERE `t`.id = 1 ORDER BY `t`.id',
        'SELECT id FROM `tm5` WHERE id = 1 ORDER BY id',
        'tm5',
      ],
      [
        'SELECT t.id FROM `db`.`tm5` AS t WHERE t.id = 1 ORDER BY t.id',
        'SELECT id FROM `db`.`tm5` WHERE id = 1 ORDER BY id',
        'db.tm5',
      ],
      [
        'SELECT t.id FROM `order items` t WHERE t.id = 1',
        'SELECT id FROM `order items` WHERE id = 1',
        'order items',
      ],
    ];
    for (const [before, after, table] of cases) {
      const result = compare([before], [after], { ignoreSingleTableAlias: true });
      expect(result.before[0].meta.table).toBe(table);
      expect(result.after[0].meta.table).toBe(table);
      expect(result.details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
      expect(result.before[0].equivalentSql).toBe(result.after[0].equivalentSql);
      expect(result.before[0].equivalentSql).not.toMatch(/\bAS\s*(?:WHERE|ORDER BY)/);
    }
    const quotedColumn = compare(
      ["SELECT `t.id`, t.id FROM `tm5` t WHERE t.name = 't.id'"],
      ["SELECT `t.id`, id FROM `tm5` WHERE name = 't.id'"],
      { ignoreSingleTableAlias: true },
    );
    expect(quotedColumn.details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(quotedColumn.before[0].equivalentSql).toContain('`t.id`');
    expect(quotedColumn.before[0].equivalentSql).toContain("'t.id'");
  });

  it('keeps aliases in joins and nested queries, and protects literals', () => {
    const options = { ignoreSingleTableAlias: true };
    expect(compare(['SELECT t.id FROM seller t JOIN item i ON t.id = i.seller_id'],
      ['SELECT id FROM seller JOIN item i ON seller.id = i.seller_id'], options).details[0].sqlMatchLevel).toBe('DIFF');
    expect(compare(['SELECT t.id FROM seller t WHERE EXISTS (SELECT 1 FROM item i WHERE i.seller_id = t.id)'],
      ['SELECT id FROM seller WHERE EXISTS (SELECT 1 FROM item i WHERE i.seller_id = seller.id)'], options).details[0].sqlMatchLevel).toBe('DIFF');
    const literal = compare(["SELECT t.id FROM seller t WHERE t.name = 't.id'"],
      ["SELECT id FROM seller WHERE name = 't.id'"], options);
    expect(literal.details[0].sqlMatchLevel).toBe('EQUIVALENT_MATCH');
    expect(literal.before[0].equivalentSql).toContain("'t.id'");
    expect(compare(['SELECT t.foo() FROM seller t'], ['SELECT foo() FROM seller'], options).details[0].sqlMatchLevel).toBe('DIFF');
  });

  it('prefers an exact table spelling when more than one case-insensitive candidate exists', () => {
    const laterAfter = compare(['select * from SELLER'], ['select * from seller', 'select * from SELLER']);
    expect(laterAfter.details.map((d) => [d.beforeId, d.afterId, d.reason])).toEqual([
      [undefined, 'after-1', 'missingBefore'],
      ['before-1', 'after-2', undefined],
    ]);
    const laterBefore = compare(['select * from seller', 'select * from SELLER'], ['select * from SELLER']);
    expect(laterBefore.details.map((d) => [d.beforeId, d.afterId, d.reason])).toEqual([
      ['before-1', undefined, 'missingAfter'],
      ['before-2', 'after-1', undefined],
    ]);
  });

  it('skips malformed or multiple statements instead of treating their prefix as comparable', () => {
    const result = compare(["select * from t where name='unfinished", 'select * from t; delete from t'], ['select * from t']);
    expect(result.before.map((record) => record.issues[0]?.code)).toEqual(['normalizationFailed', 'normalizationFailed']);
    expect(result.summary.skipped).toBe(3);
  });
});
