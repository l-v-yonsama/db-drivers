import { NodeLocation, parse, Statement } from 'pgsql-ast-parser';
import { QNames, QStatement } from '../../types';
import { FUNCTIONS } from '../constant';
import { stripComment } from './parameterNormalizer';
import { unwrapQuote } from './quote';

const FUNCTION_MATCHER = new RegExp(
  `(${FUNCTIONS.join('|')})\\([^)]+?\\)`,
  'gi',
);

/**
 * Replace query for postgres query parser.
 * select * from table where id > ? => select * from table where id > $1
 * set global general_log = on; => set general_log TO 1;
 */
export const toSafeQueryForPgsqlAst = (query: string): string => {
  let replacedSql = stripComment(query).replace(/\?/g, '$1');
  replacedSql = replacedSql
    .replace(/^\s*(SHOW)\s+FULL\s+(.*)$/i, '$1 $2')
    .replace(/^\s*(SHOW)\s+(\S+).*$/i, '$1 $2')
    .replace(/@@(GLOBAL|SESSION)\./gi, '');
  replacedSql = replacedSql.replace(
    /\s*INTERVAL\s+([\d]+)\s+(\S+)/i,
    " cast('$1 $2' as INTERVAL)",
  );
  replacedSql = replacedSql.replace(
    /\bLIMIT\s+([\d]+)\s*,\s*([\d]+)/i,
    'LIMIT $2 OFFSET $1',
  );
  replacedSql = replacedSql.replace(/\b(SELECT)\s+TOP\s+[\d]+/i, '$1 ');
  replacedSql = replacedSql.replace(/\bLOCK\s+IN\s+(S+)\s+MODE/i, ' ');
  replacedSql = replacedSql.replace(
    /^\s*(SET)(\s+global)?\s+(\S+)\s+=\s+\S+$/i,
    '$1 $3 TO dummy',
  );
  replacedSql = replacedSql.replace(
    /\s*WAITFOR\s+DELAY\s+'([\d:]+)'/i,
    'SELECT pg_sleep(1)',
  );
  replacedSql = replacedSql.replace(/\bWITHIN\s+GROUP\s*\([^)]+?\)/gi, ' ');
  // for sqlite information schema
  replacedSql = replacedSql.replace(/\.\[(notnull|from|table|to)\]/gi, '.a1');
  replacedSql = replacedSql.replace(/\bDATETIME2?\b/gi, 'TIMESTAMP');
  replacedSql = replacedSql.replace(/\bAUTOINCREMENT/gi, '');

  // Unexpected kw_authorization token: "authorization".
  replacedSql = replacedSql.replace(/\b(authorization)/i, '$1_1');

  // replaceTableNameQuotes
  // 角括弧 [] で囲まれたテーブル名をダブルクォート "" に置換
  replacedSql = replacedSql.replace(/\[([^\]]+)\]/g, '"$1"');
  // バッククォート `` で囲まれたテーブル名をダブルクォート "" に置換
  replacedSql = replacedSql.replace(/`([^`]+)`/g, '"$1"');

  replacedSql = replacedSql.replace(/^[ \r\n]+/, '');

  // for dynamoDB
  replacedSql = replacedSql.replace(
    /\bINSERT\s+INTO\s+(.+)\s+VALUE\s+\{[^}]+\}/gim,
    'INSERT INTO $1 VALUES (NULL)',
  );

  return replacedSql.replace(FUNCTION_MATCHER, '1');
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
      const { names, additionalNames } = getQNames(result[0], replacedSql);
      return {
        ast,
        names,
        additionalNames,
      };
    }
  } catch (_) {
    // console.error(_);
    const getTypeWithTable = (): {
      type: 'select' | 'insert' | 'update' | 'delete';
      table: string | null;
    } | null => {
      const rsql = replacedSql.replace(/[\r\n]/gm, ' ');
      // console.log('rsql=', rsql);
      let result = rsql.match(/select\s+.+?\s+FROM\s+(.+?)\s+/i);
      if (result) {
        return { type: 'select', table: unwrapQuote(result[1]) };
      }
      result = rsql.match(/insert\s+into\s+(.+?)\s+/i);
      if (result) {
        return { type: 'insert', table: unwrapQuote(result[1]) };
      }
      result = rsql.match(/update\s+(.+?)\s+(set|remove)\s+/i);
      if (result) {
        return { type: 'update', table: unwrapQuote(result[1]) };
      }
      result = rsql.match(/delete\s+from\s+(.+?)\s+/i);
      if (result) {
        return { type: 'delete', table: unwrapQuote(result[1]) };
      }
      return null;
    };

    const tt = getTypeWithTable();
    if (tt) {
      if (tt.table) {
        return {
          ast: {
            type: tt.type,
          } as any,
          names: {
            tableName: tt.table,
          },
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
