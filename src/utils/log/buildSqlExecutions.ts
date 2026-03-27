import { SqlLanguage } from 'sql-formatter';
import { formatQuery, parseQuery } from '../../helpers';
import {
  FrameworkName,
  SqlExecutionBuilder,
  SqlExecutionEvent,
  SqlFragment,
} from '../../types';
import { removeSqlComments } from './sql/removeSqlComments';

export function buildSqlExecutions({
  fragments,
  language,
}: {
  fragments: SqlFragment[];
  language?: SqlLanguage;
}): SqlExecutionEvent[] {
  const sqlExecutions: SqlExecutionEvent[] = [];
  const builders = new Map<string, SqlExecutionBuilder>();

  const getBuilder = (thread?: string): SqlExecutionBuilder => {
    const key = thread?.trim() || '__default__';

    let builder = builders.get(key);

    if (!builder) {
      builder = { state: 'idle' };
      builders.set(key, builder);
    }

    return builder;
  };

  const finalizeExecution = (builder: SqlExecutionBuilder): void => {
    if (!builder.current) return;

    const rawSql = builder.current.sql ?? '';

    sqlExecutions.push({
      ...builder.current,
      formattedSql: createFormattedSql({
        rawSql,
        params: builder.current.params,
        framework: builder.current.framework,
        language,
      }),
      params: builder.current.params
        ? builder.current.params.join(',')
        : undefined,
      ...buildExecutionMeta(rawSql, builder.current),
    } as SqlExecutionEvent);

    builder.state = 'idle';
    builder.current = undefined;
  };

  for (const fragment of fragments) {
    const builder = getBuilder(fragment.thread);

    // SQL_SINGLE
    if (fragment.type === 'SQL_SINGLE') {
      const rawSql = fragment.value;

      sqlExecutions.push({
        startLine: calcLine(fragment),
        endLine: calcLine(fragment),
        timestamp: fragment.timestamp,
        thread: fragment.thread,
        sql: rawSql,
        formattedSql: createFormattedSql({
          rawSql,
          framework: fragment.framework,
          language,
        }),
        daoClass: fragment.daoClass,
        daoMethod: fragment.daoMethod,
        framework: fragment.framework,
        ...buildExecutionMeta(rawSql),
      });

      continue;
    }

    // SQL START
    if (fragment.type === 'SQL' || fragment.type === 'FW_ERROR') {
      if (builder.state === 'collecting' && builder.current) {
        finalizeExecution(builder);
      }

      builder.state = 'collecting';
      let sql = '';
      let error: string | undefined = undefined;
      if (fragment.type === 'SQL') {
        sql = fragment.value;
      } else {
        error = fragment.value;
      }

      builder.current = {
        startLine: calcLine(fragment),
        endLine: calcLine(fragment),
        timestamp: fragment.timestamp,
        thread: fragment.thread,
        sql,
        error,
        daoClass: fragment.daoClass,
        daoMethod: fragment.daoMethod,
        framework: fragment.framework,
      };

      continue;
    }

    if (builder.current) {
      builder.current.endLine = calcLine(fragment);
    }

    if (fragment.type === 'SQL_ERROR') {
      if (builder.state === 'collecting' && builder.current) {
        finalizeExecution(builder);
      }

      builder.state = 'collecting';

      builder.current = {
        startLine: calcLine(fragment),
        endLine: calcLine(fragment),
        timestamp: fragment.timestamp,
        thread: fragment.thread,
        sql: '',
        formattedSql: '',
        framework: fragment.framework,
        daoClass: fragment.daoClass,
        daoMethod: fragment.daoMethod,
        error: fragment.value,
        type: 'error',
      };

      continue;
    }

    if (builder.state !== 'collecting' || !builder.current) {
      continue;
    }

    if (fragment.type === 'PARAMS') {
      if (!builder.current.params) {
        builder.current.params = [];
      }
      builder.current.params.push(fragment.value);
    }

    if (fragment.type === 'RESULT') {
      builder.current.result = fragment.value;
      finalizeExecution(builder);
    }

    if (fragment.type === 'SQL_ERROR_DETAIL') {
      builder.current.errorDetail = fragment.value;
      finalizeExecution(builder);
    }
  }

  for (const builder of builders.values()) {
    if (builder.state === 'collecting' && builder.current) {
      finalizeExecution(builder);
    }
  }

  return sqlExecutions;
}

function buildExecutionMeta(
  rawSql: string,
  current?: SqlExecutionEvent,
): Partial<SqlExecutionEvent> {
  if (current && (current.error || current.errorDetail)) {
    return {
      type: 'error',
    };
  }
  try {
    const { ast, names } = parseQuery(rawSql);

    return {
      schema: names?.schemaName,
      table: names?.tableName ?? names?.indexName,
      type: ast?.type ?? 'UNKNOWN',
    };
  } catch (e) {
    return {
      type: 'UNKNOWN',
    };
  }
}

const calcLine = (fragment: SqlFragment): number => {
  return fragment.lineNo + fragment.messageSeq - 1;
};

function createFormattedSql({
  rawSql,
  params,
  framework,
  language,
}: {
  rawSql: string;
  params?: string[];
  framework?: FrameworkName;
  language?: SqlLanguage;
}): string {
  let cleaned = removeSqlComments(rawSql);

  if (params && params.length > 0) {
    switch (framework) {
      case 'MyBatis':
        cleaned = normalizeMyBatisSql(cleaned, params);
        break;
      case 'Hibernate':
        cleaned = normalizeHibernateSql(cleaned, params);
        break;
      case 'SpringJdbc':
        cleaned = normalizeSpringJdbcSql(cleaned, params);
        break;
      default:
        break;
    }
  }
  try {
    return formatQuery(cleaned, { language });
  } catch {
    return cleaned;
  }
}
function normalizeMyBatisSql(sql: string, params: string[]): string {
  const body = params.join(',');

  const tokens = splitMyBatisParams(body);

  const formatted = tokens.map(formatTypedParam);

  return applyParameters(sql, formatted);
}

function normalizeHibernateSql(sql: string, params: string[]): string {
  const values: string[] = [];

  for (const line of params) {
    const m = line.match(/<-\s*\[(.*)\]/);
    if (!m) continue;

    const value = m[1];

    if (value === 'null') {
      values.push('NULL');
      continue;
    }

    if (/^\d+(\.\d+)?$/.test(value)) {
      values.push(value);
    } else {
      values.push(`'${escapeSqlString(value)}'`);
    }
  }

  return applyParameters(sql, values);
}
function normalizeSpringJdbcSql(sql: string, params: string[]): string {
  const values: string[] = [];

  for (const line of params) {
    const m = line.match(/parameter value \[([^\]]*)\]/);
    if (!m) continue;

    const value = m[1];

    if (value === 'null') {
      values.push('NULL');
      continue;
    }

    if (/^\d+(\.\d+)?$/.test(value)) {
      values.push(value);
    } else {
      values.push(`'${escapeSqlString(value)}'`);
    }
  }

  return applyParameters(sql, values);
}

export function splitMyBatisParams(body: string): string[] {
  const result: string[] = [];

  const regex =
    /(null|[\s\S]*?\((?:String|Integer|Long|Short|Byte|Double|Float|Boolean|Timestamp|Date|Time|BigDecimal)\))(?:,\s*)?/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(body)) !== null) {
    result.push(match[1].trim());
  }

  return result;
}

function formatTypedParam(token: string): string {
  if (token === 'null') {
    return 'NULL';
  }

  const cleaned = token.replace(/\r?\n/g, '');

  const typeStart = cleaned.lastIndexOf('(');
  const typeEnd = cleaned.lastIndexOf(')');

  if (typeStart === -1 || typeEnd === -1) {
    return `'${escapeSqlString(cleaned.trim())}'`;
  }

  const value = cleaned.slice(0, typeStart).trim();
  const type = cleaned.slice(typeStart + 1, typeEnd).trim();

  if (value === 'null') {
    return 'NULL';
  }

  if (isNumericType(type)) {
    return value;
  }

  return `'${escapeSqlString(value)}'`;
}
function isNumericType(type: string): boolean {
  return [
    'Integer',
    'Long',
    'Short',
    'Byte',
    'Double',
    'Float',
    'BigDecimal',
  ].includes(type);
}
function applyParameters(sql: string, params: string[]): string {
  let index = 0;

  return sql.replace(/\?/g, () => {
    if (index >= params.length) return '?';

    const value = params[index++];

    return value.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
  });
}
function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}
