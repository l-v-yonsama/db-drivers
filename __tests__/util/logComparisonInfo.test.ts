import {
  buildSqlExecutions,
  LOG_EVENT_SPLIT_PRESETS,
  LogParser,
  SQL_LOG_PARSE_PRESETS,
  SqlFragment,
} from '../../src';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DBType } from '../../src/types';
import { scanSqlBindMarkers } from '../../src/utils/sqlBindMarkerScanner';

function fragment(
  type: SqlFragment['type'],
  value: string,
  framework: SqlFragment['framework'],
  sourceStartLine: number,
  sourceEndLine = sourceStartLine,
): SqlFragment {
  return {
    lineNo: sourceStartLine,
    messageSeq: 1,
    sourceStartLine,
    sourceEndLine,
    thread: 'main',
    framework,
    type,
    value,
  };
}

describe('comparison evidence in SQL extraction', () => {
  it('distinguishes MySQL subtraction from a line comment when scanning binds', () => {
    expect(scanSqlBindMarkers({ sql: 'SELECT 3--? FROM t', dbType: DBType.MySQL }).markers).toEqual([
      { marker: '?', offset: 10 },
    ]);
    expect(scanSqlBindMarkers({ sql: 'SELECT 3-- ? ignored', dbType: DBType.MySQL }).markers).toEqual([]);
  });

  it('retains literal whitespace and source ranges while leaving display SQL intact', () => {
    const rawSql = "select * from t where prompt = '?' and note = ? /* ? */ and id = ?";
    const fragments = [
      fragment('SQL', rawSql, 'MyBatis', 4, 6),
      fragment('PARAMS', "A  B\nC(String), 10(Integer)", 'MyBatis', 7),
      fragment('RESULT', '1', 'MyBatis', 8),
    ];

    const [execution] = buildSqlExecutions({ fragments, withComparisonInfo: true });

    expect(execution.comparisonSql).toBe(
      "select * from t where prompt = '?' and note = 'A  B\nC' /* ? */ and id = 10",
    );
    expect(execution.rawParameters).toEqual(["A  B\nC(String), 10(Integer)"]);
    expect(execution.sourceRanges).toEqual([
      { startLine: 4, endLine: 6 },
      { startLine: 7, endLine: 7 },
    ]);
    expect(execution.startLine).toBe(4);
    expect(execution.endLine).toBe(8);
    expect(execution.formattedSql).toBeTruthy();

    const [normal] = buildSqlExecutions({ fragments });
    expect(normal.comparisonSql).toBeUndefined();
    expect(normal.rawParameters).toBeUndefined();
    expect(normal.sourceRanges).toBeUndefined();
    expect(normal.comparisonIssues).toBeUndefined();
  });

  it('distinguishes SQL NULL from the text null and escapes text quotes', () => {
    const [execution] = buildSqlExecutions({
      withComparisonInfo: true,
      fragments: [
        fragment('SQL', 'insert into t values (?, ?, ?)', 'MyBatis', 1),
        fragment('PARAMS', "null, null(String), O'Brien(String)", 'MyBatis', 2),
      ],
    });

    expect(execution.comparisonSql).toBe("insert into t values (NULL, 'null', 'O''Brien')");
    expect(execution.comparisonIssues).toBeUndefined();
  });

  it('quotes a raw value even when the value itself begins and ends with apostrophes', () => {
    const [execution] = buildSqlExecutions({
      withComparisonInfo: true,
      fragments: [
        fragment('SQL', 'select * from t where value = ?', 'MyBatis', 1),
        fragment('PARAMS', "'abc'(String)", 'MyBatis', 2),
      ],
    });
    expect(execution.comparisonSql).toBe("select * from t where value = '''abc'''");
  });

  it('treats a blank MyBatis Parameters line as no binds when SQL has no placeholders', () => {
    for (const value of ['', '  ']) {
      const [execution] = buildSqlExecutions({
        withComparisonInfo: true,
        fragments: [
          fragment('SQL', 'SELECT * FROM XD_trader WHERE ID = 34', 'MyBatis', 1),
          fragment('PARAMS', value, 'MyBatis', 2),
        ],
      });
      expect(execution.comparisonSql).toBe('SELECT * FROM XD_trader WHERE ID = 34');
      expect(execution.comparisonIssues).toBeUndefined();
    }

    const [unexpectedBind] = buildSqlExecutions({
      withComparisonInfo: true,
      fragments: [
        fragment('SQL', 'SELECT * FROM XD_trader WHERE ID = 34', 'MyBatis', 1),
        fragment('PARAMS', '34(Integer)', 'MyBatis', 2),
      ],
    });
    expect(unexpectedBind.comparisonIssues?.[0].code).toBe('extraParameters');
  });

  it('keeps leading spaces in a logged string parameter', () => {
    const [execution] = buildSqlExecutions({
      withComparisonInfo: true,
      fragments: [
        fragment('SQL', 'select * from t where a = ? and b = ?', 'MyBatis', 1),
        fragment('PARAMS', 'first(String),  second(String)', 'MyBatis', 2),
      ],
    });
    expect(execution.comparisonSql).toBe("select * from t where a = 'first' and b = ' second'");
  });

  it('accepts extra separator spaces before a numeric MyBatis parameter', () => {
    const [execution] = buildSqlExecutions({
      withComparisonInfo: true,
      fragments: [
        fragment('SQL', 'update t set value = ? where id = ?', 'MyBatis', 1),
        fragment('PARAMS', 'text(String),  42(Integer)', 'MyBatis', 2),
      ],
    });
    expect(execution.comparisonSql).toBe("update t set value = 'text' where id = 42");
    expect(execution.comparisonIssues).toBeUndefined();
  });

  it('reconstructs MyBatis Boolean parameters as dialect literals', () => {
    for (const [language, literal] of [['mysql', 'FALSE'], ['transactsql', '0']] as const) {
      const [execution] = buildSqlExecutions({
        withComparisonInfo: true,
        language,
        fragments: [
          fragment('SQL', 'update t set enabled = ? where id = ?', 'MyBatis', 1),
          fragment('PARAMS', 'false(Boolean),  42(Integer)', 'MyBatis', 2),
        ],
      });
      expect(execution.comparisonSql).toBe(`update t set enabled = ${literal} where id = 42`);
      expect(execution.comparisonIssues).toBeUndefined();
    }
  });

  it('does not produce a comparison SQL for missing, excess, or ambiguous binds', () => {
    const cases: Array<{ params: string[]; code: string }> = [
      { params: [], code: 'missingParameters' },
      { params: ['1(Integer), 2(Integer)'], code: 'extraParameters' },
      { params: ['value(Boolean)'], code: 'unsupportedParameters' },
    ];
    for (const { params, code } of cases) {
      const fragments = [fragment('SQL', 'select * from t where id = ?', 'MyBatis', 1)];
      params.forEach((value) => fragments.push(fragment('PARAMS', value, 'MyBatis', 2)));
      const [execution] = buildSqlExecutions({ fragments, withComparisonInfo: true });
      expect(execution.comparisonSql).toBeUndefined();
      expect(execution.comparisonIssues?.[0].code).toBe(code);
    }
  });

  it('preserves interleaved threads and their own parameter evidence', () => {
    const fragments = [
      { ...fragment('SQL', 'select * from t where id = ?', 'Hibernate', 1), thread: 'a' },
      { ...fragment('SQL', 'select * from t where id = ?', 'Hibernate', 2), thread: 'b' },
      { ...fragment('PARAMS', 'binding parameter [1] as [BIGINT] <- [1]', 'Hibernate', 3), thread: 'a' },
      { ...fragment('PARAMS', 'binding parameter [1] as [BIGINT] <- [2]', 'Hibernate', 4), thread: 'b' },
    ];
    const executions = buildSqlExecutions({ fragments, withComparisonInfo: true });
    expect(executions.map((e) => e.comparisonSql)).toEqual([
      'select * from t where id = 1',
      'select * from t where id = 2',
    ]);
    expect(executions.map((e) => e.sourceRanges)).toEqual([
      [{ startLine: 1, endLine: 1 }, { startLine: 3, endLine: 3 }],
      [{ startLine: 2, endLine: 2 }, { startLine: 4, endLine: 4 }],
    ]);
  });

  it('leaves quoted and dollar-quoted question marks untouched', () => {
    const [mysqlExecution] = buildSqlExecutions({
      withComparisonInfo: true,
      fragments: [fragment('SQL', "select '?' as a, `?` as c", 'MyBatis', 1)],
    });
    expect(mysqlExecution.comparisonSql).toBe("select '?' as a, `?` as c");
    const [postgresExecution] = buildSqlExecutions({
      withComparisonInfo: true,
      language: 'postgresql',
      fragments: [fragment('SQL', "select '?' as a, $$?$$ as b", 'MyBatis', 1)],
    });
    expect(postgresExecution.comparisonSql).toBe("select '?' as a, $$?$$ as b");
  });

  it('leaves SQLite quoted identifiers and Oracle alternative literals out of bind markers', () => {
    const [sqliteExecution] = buildSqlExecutions({
      withComparisonInfo: true,
      language: 'sqlite',
      fragments: [
        fragment('SQL', 'select `?`, [?] from t where id = ?', 'MyBatis', 1),
        fragment('PARAMS', '7(Integer)', 'MyBatis', 2),
      ],
    });
    expect(sqliteExecution.comparisonSql).toBe('select `?`, [?] from t where id = 7');

    const [oracleExecution] = buildSqlExecutions({
      withComparisonInfo: true,
      language: 'plsql',
      fragments: [
        fragment('SQL', "update t set note = q'[Bob's ? /* note */]' where id = ?", 'MyBatis', 1),
        fragment('PARAMS', '7(Integer)', 'MyBatis', 2),
      ],
    });
    expect(oracleExecution.comparisonSql).toBe("update t set note = q'[Bob's ? /* note */]' where id = 7");
  });

  it('does not compare Oracle SQL with unresolved named binds', () => {
    const [execution] = buildSqlExecutions({
      withComparisonInfo: true,
      language: 'plsql',
      fragments: [fragment('SQL', 'SELECT * FROM employees WHERE id = :id', 'MyBatis', 1)],
    });
    expect(execution.comparisonSql).toBeUndefined();
    expect(execution.comparisonIssues?.[0].code).toBe('unresolvedParameters');
  });

  it.each([':id', '@id', '$id', '?1'])(
    'does not compare SQLite SQL with an unresolved %s bind',
    (marker) => {
      const [execution] = buildSqlExecutions({
        withComparisonInfo: true,
        language: 'sqlite',
        fragments: [fragment('SQL', `SELECT * FROM users WHERE id = ${marker}`, 'MyBatis', 1)],
      });
      expect(execution.comparisonSql).toBeUndefined();
      expect(execution.comparisonIssues?.[0].code).toBe('unresolvedParameters');
    },
  );

  it('reports an unterminated literal instead of using a partial placeholder scan', () => {
    const [execution] = buildSqlExecutions({
      withComparisonInfo: true,
      fragments: [fragment('SQL', "select * from t where name = 'unfinished ?", 'MyBatis', 1)],
    });
    expect(execution.comparisonSql).toBeUndefined();
    expect(execution.comparisonIssues?.[0].code).toBe('unsupportedSqlLexing');
  });

  it('carries physical lines through the parser for a multiline S2JDBC event', () => {
    const split = LOG_EVENT_SPLIT_PRESETS.Simple.split;
    const { classify, extractors } = SQL_LOG_PARSE_PRESETS.S2Jdbc;
    const parser = new LogParser({ split, classify, extractors });
    const result = parser.parse({
      withComparisonInfo: true,
      logText: [
        '2026-03-12 10:11:22 DEBUG query.AutoSelectImpl - SELECT *',
        'FROM t',
        "WHERE name = 'A  B'",
        '2026-03-12 10:11:23 INFO service - done',
      ].join('\n'),
    });
    expect(result.ok).toBe(true);
    expect(result.sqlExecutions).toHaveLength(1);
    expect(result.sqlExecutions[0].comparisonSql).toContain("'A  B'");
    expect(result.sqlExecutions[0].sourceRanges).toEqual([{ startLine: 1, endLine: 3 }]);
    expect(result.sqlExecutions[0].startLine).toBe(1);
    expect(result.sqlExecutions[0].endLine).toBe(3);
  });

  it('uses the actual line for each expanded event', () => {
    const parser = new LogParser({
      split: LOG_EVENT_SPLIT_PRESETS.Simple.split,
      classify: [{ type: 'SQL_SINGLE', pattern: '^(SELECT|FROM)', expandMessage: true }],
      extractors: [{
        name: 'expanded-sql',
        start: 'SQL_SINGLE',
        steps: [{ type: 'SQL_SINGLE', action: 'captureSql' }],
      }],
    });
    const result = parser.parse({
      withComparisonInfo: true,
      logText: '2026-03-12 10:11:22 DEBUG example - SELECT *\nFROM t',
    });
    expect(result.ok).toBe(true);
    expect(result.sqlExecutions.map((e) => e.sourceRanges)).toEqual([
      [{ startLine: 1, endLine: 1 }],
      [{ startLine: 2, endLine: 2 }],
    ]);
  });

  it('extracts comparison evidence from the existing Seasar and MyBatis fixtures', () => {
    for (const framework of ['S2Jdbc', 'MyBatis'] as const) {
      const logText = readFileSync(join('__tests__', 'data', 'logs', 'parse', `${framework}.log`), 'utf8');
      const { split } = LOG_EVENT_SPLIT_PRESETS.SpringBoot;
      const { classify, extractors } = SQL_LOG_PARSE_PRESETS[framework];
      const result = new LogParser({ split, classify, extractors }).parse({ logText, withComparisonInfo: true });
      expect(result.ok).toBe(true);
      expect(result.sqlExecutions.length).toBeGreaterThan(0);
      expect(result.sqlExecutions.every((execution) => execution.comparisonSql && execution.sourceRanges?.length)).toBe(true);
    }
  });
});
