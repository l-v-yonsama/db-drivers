import { SqlLanguage } from 'sql-formatter';
import { quoteStringLiteral } from '../../../helpers/sql/quote';
import { DBType, FrameworkName, SqlExecutionEvent } from '../../../types';
import { scanSqlBindMarkers } from '../../sqlBindMarkerScanner';

type ComparisonIssue = NonNullable<SqlExecutionEvent['comparisonIssues']>[number];

type ComparisonSqlResult = {
  comparisonSql?: string;
  comparisonIssues?: ComparisonIssue[];
};

const issue = (code: string, message: string): ComparisonSqlResult => ({
  comparisonIssues: [{ code, message }],
});

/** Keeps the SQL as logged; formatting and comment removal belong to display only. */
export function createComparisonSql({
  rawSql,
  rawParameters,
  framework,
  language,
}: {
  rawSql: string;
  rawParameters: string[];
  framework?: FrameworkName;
  language?: SqlLanguage;
}): ComparisonSqlResult {
  if (!rawSql.trim()) {
    return issue('missingSql', 'No SQL text could be extracted.');
  }

  const dbType = language === 'postgresql'
    ? DBType.Postgres
    : language === 'transactsql'
      ? DBType.SQLServer
      : language === 'sqlite'
        ? DBType.SQLite
        : language === 'plsql'
          ? DBType.Oracle
          : DBType.MySQL;
  const scanned = scanSqlBindMarkers({
    sql: rawSql,
    dbType,
    markerSyntax: 'question',
    strict: true,
  });
  if (scanned.error) {
    return issue('unsupportedSqlLexing', scanned.error);
  }
  if (dbType === DBType.SQLite && scanned.markers.some((marker) => marker.marker !== '?')) {
    return issue('unresolvedParameters', 'SQLite named or numbered bind values cannot be reconstructed from this log.');
  }
  if (dbType === DBType.Oracle && scanSqlBindMarkers({ sql: rawSql, dbType, strict: true }).markers.length) {
    return issue('unresolvedParameters', 'Oracle named bind values cannot be reconstructed from this log.');
  }
  const offsets = scanned.markers.map((marker) => marker.offset);

  if (offsets.length === 0) {
    return rawParameters.some((parameter) => parameter.trim().length > 0)
      ? issue('extraParameters', 'Parameters were logged but SQL has no placeholders.')
      : { comparisonSql: rawSql };
  }

  if (language === 'postgresql') {
    return issue('ambiguousPlaceholder', 'A question mark may be a PostgreSQL operator.');
  }

  if (rawParameters.length === 0) {
    return issue('missingParameters', 'SQL placeholders have no parameter log.');
  }

  const parsed = parseParameterValues(framework, rawParameters, language);
  if (parsed.error) {
    return issue(parsed.error.code, parsed.error.message);
  }
  if (parsed.values.length !== offsets.length) {
    return issue(
      parsed.values.length < offsets.length ? 'missingParameters' : 'extraParameters',
      `Expected ${offsets.length} SQL parameters, found ${parsed.values.length}.`,
    );
  }

  let sql = '';
  let previous = 0;
  offsets.forEach((offset, index) => {
    sql += rawSql.slice(previous, offset) + parsed.values[index];
    previous = offset + 1;
  });
  return { comparisonSql: sql + rawSql.slice(previous) };
}

type ParsedValues = { values: string[]; error?: ComparisonIssue };
const unsupported = (message: string): ParsedValues => ({
  values: [],
  error: { code: 'unsupportedParameters', message },
});

function parseParameterValues(framework: FrameworkName | undefined, params: string[], language?: SqlLanguage): ParsedValues {
  switch (framework) {
    case 'MyBatis':
      return parseMyBatisValues(params, language);
    case 'Hibernate':
      return parseHibernateValues(params);
    case 'SpringJdbc':
      return parseSpringJdbcValues(params);
    default:
      return unsupported(`Parameter format is not supported for ${framework ?? 'unknown framework'}.`);
  }
}

function parseMyBatisValues(params: string[], language?: SqlLanguage): ParsedValues {
  // Display-only splitMyBatisParams trims values, so it cannot preserve bind literals here.
  const body = params.join(',');
  const pattern = /(null(?=,|$)|[\s\S]*?\([A-Za-z_$][\w.$]*(?:\[\])?\))(?:,\s?)?/g;
  const values: string[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(body)) !== null) {
    if (match.index !== cursor) return unsupported('Unrecognized MyBatis parameter text.');
    cursor = pattern.lastIndex;
    const token = match[1];
    if (token === 'null') {
      values.push('NULL');
      continue;
    }
    const typeStart = token.lastIndexOf('(');
    const type = token.slice(typeStart + 1, -1);
    const value = token.slice(0, typeStart);
    if (isNumericType(type)) {
      const numericValue = value.trim();
      if (!isNumericLiteral(numericValue)) return unsupported(`Invalid ${type} parameter.`);
      values.push(numericValue);
    } else if (type === 'Boolean' || type === 'java.lang.Boolean') {
      const booleanValue = value.trim().toLowerCase();
      if (booleanValue !== 'true' && booleanValue !== 'false') return unsupported('Invalid Boolean parameter.');
      values.push(language === 'transactsql'
        ? booleanValue === 'true' ? '1' : '0'
        : booleanValue.toUpperCase());
    } else if (isQuotedType(type)) {
      values.push(quoteStringLiteral(value));
    } else {
      return unsupported(`Unsupported MyBatis parameter type: ${type}.`);
    }
  }
  if (cursor !== body.length) return unsupported('Unrecognized MyBatis parameter text.');
  return { values };
}

function parseHibernateValues(params: string[]): ParsedValues {
  const values: string[] = [];
  for (const line of params) {
    const match = line.match(/^(?:binding parameter\s*)?\(\d+:([^)]*)\)\s*<-\s*\[([\s\S]*)\]\s*$/)
      ?? line.match(/\bas\s*\[([^\]]+)\]\s*<-\s*\[([\s\S]*)\]\s*$/);
    if (!match) return unsupported('Unrecognized Hibernate parameter text.');
    const [, type, value] = match;
    if (value === 'null') return unsupported('Hibernate null parameter is ambiguous in the log.');
    if (isNumericType(type)) {
      if (!isNumericLiteral(value)) return unsupported(`Invalid ${type} parameter.`);
      values.push(value);
    } else if (isQuotedType(type)) {
      values.push(quoteStringLiteral(value));
    } else {
      return unsupported(`Unsupported Hibernate parameter type: ${type}.`);
    }
  }
  return { values };
}

function parseSpringJdbcValues(params: string[]): ParsedValues {
  const values: string[] = [];
  for (const line of params) {
    const match = line.match(/parameter value \[([\s\S]*?)\], value class \[([^\]]+)\]/);
    if (!match) return unsupported('Unrecognized Spring JDBC parameter text.');
    const [, value, type] = match;
    if (value === 'null') return unsupported('Spring JDBC null parameter is ambiguous in the log.');
    if (isNumericType(type)) {
      if (!isNumericLiteral(value)) return unsupported(`Invalid ${type} parameter.`);
      values.push(value);
    } else if (isQuotedType(type)) {
      values.push(quoteStringLiteral(value));
    } else {
      return unsupported(`Unsupported Spring JDBC parameter type: ${type}.`);
    }
  }
  return { values };
}

function isNumericLiteral(value: string): boolean {
  return /^[-+]?(\d+(\.\d+)?|\.\d+)([eE][-+]?\d+)?$/.test(value);
}

function isNumericType(type: string): boolean {
  return /^(?:Integer|Long|Short|Byte|Double|Float|BigDecimal|BigInteger|INTEGER|BIGINT|SMALLINT|TINYINT|DOUBLE|FLOAT|DECIMAL|NUMERIC|java\.lang\.(?:Integer|Long|Short|Byte|Double|Float)|java\.math\.(?:BigDecimal|BigInteger))$/.test(type);
}

function isQuotedType(type: string): boolean {
  return /^(?:String|Character|Timestamp|Date|Time|LocalDate|LocalTime|LocalDateTime|UUID|VARCHAR|CHAR|TEXT|TIMESTAMP|DATE|TIME|java\.lang\.(?:String|Character)|java\.time\.(?:LocalDate|LocalTime|LocalDateTime)|java\.util\.(?:Date|UUID)|java\.sql\.(?:Date|Time|Timestamp))$/.test(type);
}
