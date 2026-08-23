import { NodeLocation, parse, Statement } from 'pgsql-ast-parser';
import { QNames, QStatement } from '../../types';
import { FUNCTIONS } from '../constant';
import { unwrapQuote } from './quote';

const FUNCTION_MATCHER = new RegExp(
  `(${FUNCTIONS.join('|')})\\([^)]+?\\)`,
  'gi',
);

type SqlReplacementRule = {
  name: string;
  dialects: string;
  purpose: string;
  apply: (sql: string) => string;
};

/**
 * Applies a transformation only to SQL code. String literals and quoted
 * identifiers are retained verbatim, while comments become whitespace so
 * that they cannot affect parsing or replacement rules.
 */
const transformSqlCode = (
  sql: string,
  transform: (code: string) => string,
): string => {
  const output: string[] = [];
  const literals: Array<{ placeholder: string; value: string }> = [];
  let codeStart = 0;
  let i = 0;

  const flushCode = (end: number): void => {
    if (end > codeStart) {
      output.push(sql.slice(codeStart, end));
    }
  };
  const whitespaceForComment = (comment: string): string =>
    comment.replace(/[^\r\n]/g, ' ');
  const readQuoted = (quote: string, close: string): number => {
    let cursor = i + 1;
    while (cursor < sql.length) {
      if (sql[cursor] === '\\') {
        cursor += 2;
      } else if (sql[cursor] === close) {
        if (quote !== '[' && sql[cursor + 1] === close) {
          cursor += 2;
        } else {
          return cursor + 1;
        }
      } else {
        cursor++;
      }
    }
    return sql.length;
  };

  while (i < sql.length) {
    if (sql.startsWith('--', i) || sql[i] === '#') {
      const lineBreak = sql.slice(i).search(/[\r\n]/);
      const commentEnd = lineBreak === -1 ? sql.length : i + lineBreak;
      flushCode(i);
      output.push(whitespaceForComment(sql.slice(i, commentEnd)));
      i = commentEnd;
      codeStart = i;
      continue;
    }
    if (sql.startsWith('/*', i)) {
      const close = sql.indexOf('*/', i + 2);
      const commentEnd = close === -1 ? sql.length : close + 2;
      flushCode(i);
      output.push(whitespaceForComment(sql.slice(i, commentEnd)));
      i = commentEnd;
      codeStart = i;
      continue;
    }
    if (sql[i] === "'" || sql[i] === '"') {
      const end = readQuoted(sql[i], sql[i]);
      flushCode(i);
      const placeholder = `__sql_literal_${literals.length}__`;
      literals.push({ placeholder, value: sql.slice(i, end) });
      output.push(placeholder);
      i = end;
      codeStart = i;
      continue;
    }
    if (sql[i] === '`' || sql[i] === '[') {
      const end = readQuoted(sql[i], sql[i] === '[' ? ']' : '`');
      flushCode(i);
      const name = sql.slice(i + 1, Math.max(i + 1, end - 1));
      output.push(`"${name.replace(/"/g, '""')}"`);
      i = end;
      codeStart = i;
      continue;
    }
    i++;
  }
  flushCode(sql.length);
  let transformed = transform(output.join(''));
  for (const { placeholder, value } of literals) {
    transformed = transformed.split(placeholder).join(value);
  }
  return transformed;
};

const SQL_REPLACEMENT_RULES: SqlReplacementRule[] = [
  {
    name: 'question-mark-bind',
    dialects: 'MySQL, SQLite',
    purpose: 'Convert positional bind markers to PostgreSQL syntax.',
    apply: (sql) => sql.replace(/\?/g, '$1'),
  },
  {
    name: 'oracle-named-bind',
    dialects: 'Oracle',
    purpose:
      'Convert named bind markers while retaining casts and assignments.',
    apply: (sql) =>
      sql.replace(/(?<!:):([A-Za-z_$][\w$]*)\b(?!\s*=)/g, () => '$1'),
  },
  {
    name: 'sql-server-named-bind',
    dialects: 'SQL Server',
    purpose: 'Convert local variables without changing @@ system variables.',
    apply: (sql) => sql.replace(/(?<!@)@([A-Za-z_$][\w$]*)\b/g, () => '$1'),
  },
  {
    name: 'show-variants',
    dialects: 'MySQL',
    purpose: 'Reduce SHOW variants to PostgreSQL-parser-friendly form.',
    apply: (sql) =>
      sql
        .replace(/^\s*(SHOW)\s+FULL\s+(.*)$/i, '$1 $2')
        .replace(/^\s*(SHOW)\s+(\S+).*$/i, '$1 $2'),
  },
  {
    name: 'mysql-system-variable',
    dialects: 'MySQL',
    purpose: 'Remove unsupported GLOBAL and SESSION qualifiers.',
    apply: (sql) => sql.replace(/@@(GLOBAL|SESSION)\./gi, ''),
  },
  {
    name: 'interval-literal',
    dialects: 'MySQL',
    purpose: 'Convert MySQL interval literals to a PostgreSQL cast.',
    apply: (sql) =>
      sql.replace(
        /\s*INTERVAL\s+([\d]+)\s+(\S+)/i,
        " cast('$1 $2' as INTERVAL)",
      ),
  },
  {
    name: 'limit-offset',
    dialects: 'MySQL',
    purpose: 'Convert LIMIT offset,count to LIMIT count OFFSET offset.',
    apply: (sql) =>
      sql.replace(/\bLIMIT\s+([\d]+)\s*,\s*([\d]+)/i, 'LIMIT $2 OFFSET $1'),
  },
  {
    name: 'select-top',
    dialects: 'SQL Server',
    purpose: 'Remove unsupported TOP for structural parsing.',
    apply: (sql) => sql.replace(/\b(SELECT)\s+TOP\s+[\d]+/i, '$1 '),
  },
  {
    name: 'lock-in-mode',
    dialects: 'MySQL',
    purpose: 'Remove MySQL locking suffix for structural parsing.',
    apply: (sql) => sql.replace(/\bLOCK\s+IN\s+(\S+)\s+MODE/i, ' '),
  },
  {
    name: 'set-global',
    dialects: 'MySQL',
    purpose: 'Convert simple SET GLOBAL statements to PostgreSQL syntax.',
    apply: (sql) =>
      sql.replace(
        /^\s*(SET)(\s+global)?\s+(\S+)\s+=\s+\S+$/i,
        '$1 $3 TO dummy',
      ),
  },
  {
    name: 'waitfor-delay',
    dialects: 'SQL Server',
    purpose: 'Replace WAITFOR DELAY with a parser-supported statement.',
    apply: (sql) =>
      sql.replace(
        /\s*WAITFOR\s+DELAY\s+(?:'[\d:]+'|__sql_literal_\d+__)/i,
        'SELECT pg_sleep(1)',
      ),
  },
  {
    name: 'within-group',
    dialects: 'SQL Server, Oracle',
    purpose: 'Remove unsupported ordered-set clause for structural parsing.',
    apply: (sql) => sql.replace(/\bWITHIN\s+GROUP\s*\([^)]+?\)/gi, ' '),
  },
  {
    name: 'sqlite-information-schema-name',
    dialects: 'SQLite',
    purpose: 'Rename parser-reserved information-schema columns.',
    apply: (sql) => sql.replace(/\.\[(notnull|from|table|to)\]/gi, '.a1'),
  },
  {
    name: 'datetime-type',
    dialects: 'SQL Server',
    purpose: 'Convert DATETIME and DATETIME2 to TIMESTAMP.',
    apply: (sql) => sql.replace(/\bDATETIME2?\b/gi, 'TIMESTAMP'),
  },
  {
    name: 'autoincrement',
    dialects: 'SQLite',
    purpose: 'Remove unsupported AUTOINCREMENT modifier.',
    apply: (sql) => sql.replace(/\bAUTOINCREMENT/gi, ''),
  },
  {
    name: 'authorization-keyword',
    dialects: 'All',
    purpose: 'Avoid a parser-reserved authorization token.',
    apply: (sql) => sql.replace(/\b(authorization)/i, '$1_1'),
  },
  {
    name: 'dynamodb-value-object',
    dialects: 'DynamoDB PartiQL',
    purpose: 'Convert PartiQL VALUE object inserts to VALUES syntax.',
    apply: (sql) =>
      sql.replace(
        /\bINSERT\s+INTO\s+(.+)\s+VALUE\s+\{[^}]+\}/gim,
        'INSERT INTO $1 VALUES (NULL)',
      ),
  },
  {
    name: 'known-functions',
    dialects: 'All',
    purpose: 'Replace unsupported known function calls with a constant.',
    apply: (sql) => sql.replace(FUNCTION_MATCHER, '1'),
  },
];

/**
 * Replace query for postgres query parser.
 * select * from table where id > ? => select * from table where id > $1
 * set global general_log = on; => set general_log TO 1;
 */
export const toSafeQueryForPgsqlAst = (query: string): string => {
  let replacedSql = transformSqlCode(query, (code) => code);
  for (const rule of SQL_REPLACEMENT_RULES) {
    replacedSql = transformSqlCode(replacedSql, rule.apply);
  }
  return replacedSql.replace(/^[ \r\n]+/, '');
};

export const hasSetVariableClause = (sql: string): boolean => {
  if (sql.match(/\bSET\s+(VAR|VARIABLE)\s+\w+\s*=\s*['"\w]+;?/gi)) {
    return true;
  }
  if (sql.match(/\bSET\s+@\w+\s*=\s*['"\w]+;?/gi)) {
    return true;
  }
  return false;
};

/**
 * Parse query
 * All parse results are in lowercase.
 * @param sql
 * @returns parse result
 */
export const parseQuery = (sql: string): QStatement | undefined => {
  const replacedSql = toSafeQueryForPgsqlAst(sql);
  if (replacedSql.toLocaleLowerCase().startsWith('pragma')) {
    return {
      ast: {
        type: 'pragma',
      } as any,
      names: undefined,
    };
  }
  try {
    const result = parse(replacedSql, { locationTracking: true });
    if (result && result.length) {
      let ast = result[0];
      if (ast.type === 'with recursive' || ast.type === 'with') {
        ast = ast.in;
      }
      const { names, additionalNames } = getQNames(ast, replacedSql);
      return {
        ast,
        names,
        additionalNames,
      };
    }
  } catch (_) {
    const tt = getFallbackStatement(replacedSql);
    if (tt) {
      if (tt.names) {
        return {
          ast: {
            type: tt.type,
          } as any,
          names: tt.names,
        };
      }
      return {
        ast: {
          type: tt.type,
        } as any,
        names: undefined,
      };
    }

    // console.log('sql=', sql);
    // console.log('replacedSql=', replacedSql);
    // console.error(_);
    // do nothing.
  }
  return undefined;
};

const FALLBACK_IDENTIFIER_PART = '(?:"(?:[^"]|"")+"|[A-Za-z_][\\w$]*)';
const FALLBACK_QUALIFIED_IDENTIFIER = `${FALLBACK_IDENTIFIER_PART}(?:\\s*\\.\\s*${FALLBACK_IDENTIFIER_PART}){0,2}`;

const splitQualifiedIdentifier = (identifier: string): string[] => {
  const parts: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier[i];
    if (char === '"') {
      current += char;
      if (quoted && identifier[i + 1] === '"') {
        current += identifier[++i];
      } else {
        quoted = !quoted;
      }
    } else if (char === '.' && !quoted) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
};

const toFallbackQNames = (identifier: string): QNames | undefined => {
  const parts = splitQualifiedIdentifier(identifier).map((part) =>
    unwrapQuote(part).replace(/""/g, '"'),
  );
  const tableName = parts.at(-1);
  if (!tableName) {
    return undefined;
  }
  return {
    tableName,
    schemaName: parts.length > 1 ? parts.at(-2) : undefined,
  };
};

const getFallbackStatement = (
  sql: string,
):
  | {
      type: 'select' | 'insert' | 'update' | 'delete';
      names?: QNames;
    }
  | undefined => {
  const rsql = sql.replace(/[\r\n]/g, ' ');
  const findIdentifier = (pattern: string): QNames | undefined => {
    const result = rsql.match(new RegExp(pattern, 'i'));
    return result?.[1] ? toFallbackQNames(result[1]) : undefined;
  };

  const patterns: Array<{
    type: 'select' | 'insert' | 'update' | 'delete';
    pattern: string;
  }> = [
    {
      type: 'select',
      pattern: `\\bselect\\b[\\s\\S]*?\\bfrom\\s+(${FALLBACK_QUALIFIED_IDENTIFIER})(?=\\s|,|;|$|\\))`,
    },
    {
      type: 'insert',
      pattern: `\\binsert\\s+into\\s+(${FALLBACK_QUALIFIED_IDENTIFIER})(?=\\s|\\(|;|$)`,
    },
    {
      type: 'update',
      pattern: `\\bupdate\\s+(${FALLBACK_QUALIFIED_IDENTIFIER})\\s+(?:set|remove)\\b`,
    },
    {
      type: 'delete',
      pattern: `\\bdelete\\s+from\\s+(${FALLBACK_QUALIFIED_IDENTIFIER})(?=\\s|;|$)`,
    },
  ];
  for (const { type, pattern } of patterns) {
    const names = findIdentifier(pattern);
    if (names) {
      return { type, names };
    }
  }
  return undefined;
};

const READ_ONLY_STATEMENT_TYPES = new Set<string>([
  'select',
  'show',
  'union',
  'union all',
  'values',
]);

/**
 * Determine whether the given SQL statement is read-only
 * (e.g. SELECT/SHOW, or a PRAGMA read), as opposed to a statement
 * that modifies data or schema (INSERT/UPDATE/DELETE/DDL/PRAGMA assignment, etc).
 * @param sql
 * @returns true if the statement is select/show/union/values, or a PRAGMA read
 */
export const isReadOnlyQuery = (sql: string): boolean => {
  const qst = parseQuery(sql);
  const type: string | undefined = qst?.ast?.type;
  if (!type) {
    return false;
  }
  if (type === 'pragma') {
    return !/\bpragma\s+[a-zA-Z0-9\-_.()]+\s*=\s*.+/i.test(sql);
  }
  return READ_ONLY_STATEMENT_TYPES.has(type);
};

export const separateMultipleQueries = (text: string): string[] => {
  const quotePattern1 = /('(.*?)(?<!\\)')/; // Handles single, double quotes
  const quotePattern2 = /("(.*?)(?<!\\)")/; // Handles single, double quotes
  const commentPattern = /--.*?(?=[\r\n]|$)|\/\*[\s\S]*?\*\//; // Handles single line and multi-line comments
  const delimiterPattern = /;/;

  const queries: string[] = [];
  let currentToken: string[] = [];

  // Aggregate regex pattern
  const pattern = new RegExp(
    `(${quotePattern1.source}|${quotePattern2.source}|${commentPattern.source}|${delimiterPattern.source}|[\r\n]+|.)`,
    'g',
  );

  text.match(pattern)?.forEach((token) => {
    if (token === ';') {
      if (currentToken.length > 0) {
        queries.push(currentToken.join('').trim());
        currentToken = [];
      }
    } else {
      currentToken.push(token);
    }
  });

  if (currentToken.length > 0) {
    queries.push(currentToken.join('').trim());
  }

  return queries.filter((it) => it.replace(/[\r\n]+/g, ' ').trim().length > 0);
};

const getQNames = (
  ast: Statement,
  sql: string,
): {
  names?: QNames;
  additionalNames?: QNames[];
} => {
  const ret = {
    names: undefined,
    additionalNames: undefined,
  };
  const qnames: QNames[] = [];
  if (ast) {
    // console.log('ast=', JSON.stringify(ast, null, 2));
    switch (ast.type) {
      case 'select':
        if (ast.from) {
          ast.from
            .filter((from) => from.type === 'table')
            .forEach((from) => {
              const fromName = from['name'] as any;
              qnames.push(
                createQNamesUsingLocation({
                  schemaName: fromName.schema,
                  tableName: fromName.name,
                  location: fromName._location,
                  sql,
                }),
              );
            });
        }
        break;
      case 'insert':
        qnames.push(
          createQNamesUsingLocation({
            schemaName: ast.into.schema,
            tableName: ast.into.name,
            location: ast.into._location,
            sql,
          }),
        );
        break;
      case 'update':
        qnames.push(
          createQNamesUsingLocation({
            schemaName: ast.table.schema,
            tableName: ast.table.name,
            location: ast.table._location,
            sql,
          }),
        );
        break;
      case 'delete':
        qnames.push(
          createQNamesUsingLocation({
            schemaName: ast.from.schema,
            tableName: ast.from.name,
            location: ast.from._location,
            sql,
          }),
        );
        break;
    }
  }
  if (qnames.length > 0) {
    ret.names = qnames[0];
    if (qnames.length > 1) {
      ret.additionalNames = qnames.slice(1);
    }
  }
  return ret;
};

const createQNamesUsingLocation = ({
  tableName,
  schemaName,
  location,
  sql,
}: {
  tableName: string;
  schemaName?: string;
  location?: NodeLocation;
  sql: string;
}): QNames => {
  if (location) {
    const qname = sql.substring(location.start, location.end);
    if (schemaName) {
      const names = qname.split('.');
      if (names.length >= 2) {
        return {
          schemaName: unwrapQuote(names[0]),
          tableName: unwrapQuote(names[1]),
        };
      }
    } else {
      return {
        schemaName: undefined,
        tableName: unwrapQuote(qname),
      };
    }
  }

  return {
    tableName,
    schemaName,
  };
};
