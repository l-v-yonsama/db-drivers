import { buildSqlExecutions, SqlFragment } from '../../src';
import { splitMyBatisParams } from '../../src';

function makeFragment(overrides: Partial<SqlFragment>): SqlFragment {
  return {
    lineNo: 1,
    messageSeq: 1,
    type: 'SQL',
    value: '',
    thread: 'main',
    ...overrides,
  };
}

describe('buildSqlExecutions - error SQL recovery', () => {
  it('recovers the failed SQL from a Doma-style "SQL=[...]" marker in the error detail', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        lineNo: 1,
        messageSeq: 1,
        type: 'SQL_ERROR',
        framework: 'Doma',
        value: 'org.seasar.doma.jdbc.JdbcException',
      }),
      makeFragment({
        lineNo: 2,
        messageSeq: 1,
        type: 'SQL_ERROR_DETAIL',
        framework: 'Doma',
        value:
          'org.h2.jdbc.JdbcSQLSyntaxErrorException: table not found\nTable "USERSS" not found; SQL statement:\nselect id, name from userss wheeer id = 6 [42102-224]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.sql).toBe(
      'select id, name from userss wheeer id = 6',
    );
    expect(execution.formattedSql).toBeTruthy();
  });

  it('recovers the failed SQL from a SpringJdbc-style inline "SQL [...]" marker in the exception message', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        lineNo: 1,
        messageSeq: 1,
        type: 'SQL_ERROR',
        framework: 'SpringJdbc',
        value:
          'org.springframework.dao.DuplicateKeyException: PreparedStatementCallback; SQL [insert into users(id, name) values(?, ?)]; unique constraint violation',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.sql).toBe(
      'insert into users(id, name) values(?, ?)',
    );
  });

  it('recovers the failed SQL from a generic H2 "SQL statement:" continuation line (MyBatis)', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        lineNo: 1,
        messageSeq: 1,
        type: 'SQL_ERROR',
        framework: 'MyBatis',
        value:
          'Table "NOT_EXISTS_TABLE" not found; SQL statement:\nselect * from not_exists_table [42102-224]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.sql).toBe('select * from not_exists_table');
  });

  it('leaves sql empty when no recoverable SQL text is present (e.g. Doma constraint violation with SQL=[])', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        lineNo: 1,
        messageSeq: 1,
        type: 'SQL_ERROR',
        framework: 'Doma',
        value: 'org.seasar.doma.jdbc.UniqueConstraintException',
      }),
      makeFragment({
        lineNo: 2,
        messageSeq: 1,
        type: 'SQL_ERROR_DETAIL',
        framework: 'Doma',
        value:
          'org.h2.jdbc.JdbcSQLIntegrityConstraintViolationException: unique index violation',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.sql).toBe('');
  });
});

describe('buildSqlExecutions - placeholder replacement respects string literals and comments', () => {
  it('does not replace "?" inside single-quoted string literals', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'Hibernate',
        value: "select * from users where message = '?' and id = ?",
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [1] as [BIGINT] <- [5]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).toContain("'?'");
    expect(execution.formattedSql).toMatch(/id\s*=\s*5/);
  });

  it('does not replace "?" inside a LIKE pattern such as \'%?%\'', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'Hibernate',
        value: "select * from users where name like '%?%' and id = ?",
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [1] as [BIGINT] <- [7]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).toContain("'%?%'");
    expect(execution.formattedSql).toMatch(/id\s*=\s*7/);
  });

  it('does not replace "?" that appears inside a comment', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'Hibernate',
        value: 'select * from users where id = ? /* is this a ? */',
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [1] as [BIGINT] <- [9]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).toMatch(/id\s*=\s*9/);
  });

  it('does not treat "--" inside a string literal as a line comment', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'Hibernate',
        value: "select * from t where note = 'a--b' and id = ?",
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [1] as [BIGINT] <- [11]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).toContain("'a--b'");
    expect(execution.formattedSql).toMatch(/id\s*=\s*11/);
  });

  it('does not strip block-comment-like text that lives inside a string literal', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'Hibernate',
        value:
          "select * from t where note = 'contains /* not a comment */ text' and id = ?",
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [1] as [BIGINT] <- [12]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).toContain('not a comment');
    expect(execution.formattedSql).toMatch(/id\s*=\s*12/);
  });
});

describe('buildSqlExecutions - numeric literal detection', () => {
  it('renders negative numbers, exponents and leading-dot decimals without quoting', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'Hibernate',
        value: 'insert into t (a, b, c) values (?, ?, ?)',
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [1] as [INTEGER] <- [-1]',
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [2] as [DOUBLE] <- [.5]',
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'Hibernate',
        value: 'binding parameter [3] as [DOUBLE] <- [1e-3]',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).not.toContain("'-1'");
    expect(execution.formattedSql).not.toContain("'.5'");
    expect(execution.formattedSql).not.toContain("'1e-3'");
  });
});

describe('buildSqlExecutions - SpringJdbc parameter value boundary', () => {
  it('keeps a "]" that is part of the bound value intact', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'SpringJdbc',
        value: 'update users set tags = ? where id = ?',
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'SpringJdbc',
        value:
          'column index 1, parameter value [a]b], value class [java.lang.String], SQL type unknown',
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'SpringJdbc',
        value:
          'column index 2, parameter value [10], value class [java.lang.Integer], SQL type unknown',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).toContain("'a]b'");
    expect(execution.formattedSql).toMatch(/id\s*=\s*10/);
  });
});

describe('splitMyBatisParams', () => {
  it('pattern1', async () => {
    const input =
      'MyBatisCommitUser_,,upd\nated(String), null, 2026-03-16 14:28:24.204(Timestamp), 10(Integer)';
    const result = splitMyBatisParams(input);

    expect(result).toEqual([
      'MyBatisCommitUser_,,upd\nated(String)',
      'null',
      '2026-03-16 14:28:24.204(Timestamp)',
      '10(Integer)',
    ]);
  });

  it('pattern2', async () => {
    const input =
      'MyBatisCommitUser_updated(String), 20(Integer), 2026-03-16 14:28:24.207(Timestamp), 13(Integer)';
    const result = splitMyBatisParams(input);

    expect(result).toEqual([
      'MyBatisCommitUser_updated(String)',
      '20(Integer)',
      '2026-03-16 14:28:24.207(Timestamp)',
      '13(Integer)',
    ]);
  });

  it('does not stop splitting on unknown Java types (LocalDateTime, UUID, BigInteger)', () => {
    const input =
      '2026-03-16T14:28:24.204(LocalDateTime), 550e8400-e29b-41d4-a716-446655440000(UUID), 9999999999999999999(BigInteger), 20(Integer)';
    const result = splitMyBatisParams(input);

    expect(result).toEqual([
      '2026-03-16T14:28:24.204(LocalDateTime)',
      '550e8400-e29b-41d4-a716-446655440000(UUID)',
      '9999999999999999999(BigInteger)',
      '20(Integer)',
    ]);
  });

  it('does not stop splitting on array-typed values such as byte[]', () => {
    const input = '[1, 2, 3](byte[]), MyBatisUser(String)';
    const result = splitMyBatisParams(input);

    expect(result).toEqual(['[1, 2, 3](byte[])', 'MyBatisUser(String)']);
  });
});

describe('buildSqlExecutions - MyBatis unknown type parameters do not break placeholder substitution', () => {
  it('substitutes all placeholders when the Parameters line includes an unknown Java type', () => {
    const fragments: SqlFragment[] = [
      makeFragment({
        type: 'SQL',
        framework: 'MyBatis',
        value: 'insert into t (a, b) values (?, ?)',
      }),
      makeFragment({
        type: 'PARAMS',
        framework: 'MyBatis',
        value:
          '2026-03-16T14:28:24.204(LocalDateTime), 20(Integer)',
      }),
    ];

    const [execution] = buildSqlExecutions({ fragments });

    expect(execution.formattedSql).not.toContain('?');
    expect(execution.formattedSql).toMatch(/20/);
  });
});
