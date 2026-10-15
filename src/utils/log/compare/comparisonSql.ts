import { formatQuery, parseQuery, quoteStringLiteral } from '../../../helpers';
import { DBType, LogSqlComparisonDetail, LogSqlComparisonOptions, LogSqlComparisonRecord } from '../../../types';
import { scanSqlBindMarkers } from '../../sqlBindMarkerScanner';
import { effectiveSqlEquivalenceOptions } from './comparisonOptions';
import { applySqlEquivalence, normalizeDateTimeLiteralValue, singleStatementSql, singleTableAlias } from './sqlEquivalence';

type Meta = LogSqlComparisonRecord['meta'];
type Where = string[] | { reason: string } | undefined;
const COMPARISON_DB_TYPES: Record<LogSqlComparisonOptions['dialect'], DBType> = {
  mysql: DBType.MySQL,
  postgresql: DBType.Postgres,
  transactsql: DBType.SQLServer,
  sqlite: DBType.SQLite,
  plsql: DBType.Oracle,
};

/** Reuse the existing query parser and formatter; do not rewrite SQL expressions. */
export function inspectComparisonSql(sql: string, options: LogSqlComparisonOptions): {
  meta: Meta;
  formattedSql: string;
  equivalentSql: string;
  where: Where;
} {
  const dbType = COMPARISON_DB_TYPES[options.dialect];
  const scan = scanSqlBindMarkers({ sql, dbType, markerSyntax: 'question', strict: true });
  if (scan.error) throw new Error(scan.error);

  const rules = effectiveSqlEquivalenceOptions(options.equivalence);
  const text = singleStatementSql(sql, options.dialect);
  const formatOptions = {
    language: options.dialect,
    functionCase: 'preserve' as const,
    dataTypeCase: 'preserve' as const,
    identifierCase: 'preserve' as const,
  };
  const formattedSql = formatQuery(text, formatOptions);
  const parsed = parseQuery(text);
  const alias = rules.ignoreSingleTableAlias ? singleTableAlias(text, options.dialect, parsed?.ast) : undefined;
  const equivalentSql = formatQuery(applySqlEquivalence(text, options.dialect, rules, parsed?.ast), {
    ...formatOptions,
    identifierCase: rules.ignoreIdentifierCase ? 'lower' : 'preserve',
  });
  const kind = parsed?.ast?.type?.toUpperCase();
  const dml: Meta['dml'] = kind === 'SELECT' || kind === 'INSERT' || kind === 'UPDATE' || kind === 'DELETE'
    ? kind : 'UNKNOWN';
  const name = parsed?.names;
  const tableName = dml === 'SELECT' ? name?.tableName?.replace(/\s+AS\s+[A-Za-z_][\w$]*$/i, '') : name?.tableName;
  const parsedTable = tableName ? [name?.schemaName, tableName].filter(Boolean).join('.') : undefined;
  const astTable = dml === 'SELECT' ? primaryTable(parsed?.ast) : undefined;
  // Location-based names preserve spelling, but may include a quoted table's AS alias.
  const table = astTable && parsedTable?.toLowerCase() !== astTable.toLowerCase() ? astTable : parsedTable ?? astTable;
  const meta: Meta = /^\s*WITH\b/i.test(text) ? { dml: 'UNKNOWN' } : { dml, table };
  const expression = (parsed?.ast as any)?.where;
  const where = expression ? predicates(expression, alias, rules.ignoreDateTimeLiteralValues)
    : /\bWHERE\b/i.test(text) ? { reason: 'WHERE clause could not be parsed' } : undefined;
  return { meta, formattedSql, equivalentSql, where };
}

/** Follow only the outer FROM source, not tables inside SELECT expressions. */
function primaryTable(ast: any): string | undefined {
  const source = ast?.type === 'select' ? ast.from?.[0] : undefined;
  if (source?.type === 'table') return source.name?.name
    ? [source.name.schema, source.name.name].filter(Boolean).join('.') : undefined;
  if (source?.type !== 'statement') return undefined;
  const inner = source.statement?.from?.[0];
  if (inner?.type === 'statement') return primaryTable(source.statement);
  return inner?.type === 'table' && inner.name?.name
    ? [inner.name.schema, inner.name.name].filter(Boolean).join('.') : undefined;
}

function reference(expression: any, ignoredAlias?: string): string | undefined {
  if (expression?.type !== 'ref' || typeof expression.name !== 'string') return undefined;
  const table = expression.table?.name;
  return [table?.toLowerCase() === ignoredAlias?.toLowerCase() ? undefined : table, expression.name].filter(Boolean).join('.');
}

function literal(expression: any, ignoreDateTimeLiteralValues: boolean): string | undefined {
  if (expression?.type === 'string') return quoteStringLiteral(ignoreDateTimeLiteralValues
    ? normalizeDateTimeLiteralValue(expression.value) : expression.value);
  if (expression?.type === 'integer' || expression?.type === 'numeric') return String(expression.value);
  if (expression?.type === 'boolean') return expression.value ? 'TRUE' : 'FALSE';
  if (expression?.type === 'null') return 'NULL';
  return undefined;
}

/** Only simple AND-connected predicates are used for the supplementary WHERE result. */
function predicates(expression: any, ignoredAlias: string | undefined, ignoreDateTimeLiteralValues: boolean): Where {
  if (expression?.type === 'binary' && expression.op === 'AND') {
    const left = predicates(expression.left, ignoredAlias, ignoreDateTimeLiteralValues);
    const right = predicates(expression.right, ignoredAlias, ignoreDateTimeLiteralValues);
    if (!Array.isArray(left)) return left;
    if (!Array.isArray(right)) return right;
    return [...left, ...right].sort();
  }
  if (expression?.type === 'binary' && expression.op === 'IN') {
    const column = reference(expression.left, ignoredAlias);
    const expressions = expression.right?.type === 'list' ? expression.right.expressions : [expression.right];
    const values = Array.isArray(expressions) ? expressions.map((item) => literal(item, ignoreDateTimeLiteralValues)) : [];
    if (column && values.length && values.every((value) => value !== undefined)) {
      return [`${column} IN (${[...new Set(values)].sort().join(', ')})`];
    }
    return { reason: expression.right?.type === 'select'
      ? 'IN subquery is not supported' : 'IN requires a column and literal values' };
  }
  if (expression?.type === 'binary' && ['=', '<>', '!=', '<', '>', '<=', '>='].includes(expression.op)) {
    const column = reference(expression.left, ignoredAlias);
    const value = literal(expression.right, ignoreDateTimeLiteralValues);
    return column && value !== undefined ? [`${column} ${expression.op} ${value}`]
      : { reason: 'Comparison requires a column and literal value' };
  }
  if (expression?.type === 'unary' && ['IS NULL', 'IS NOT NULL'].includes(expression.op)) {
    const column = reference(expression.operand, ignoredAlias);
    return column ? [`${column} ${expression.op}`] : { reason: 'IS NULL requires a column' };
  }
  return { reason: expression?.op ? `${expression.op} condition is not supported` : 'WHERE expression is not supported' };
}

export function compareWhere(before: Where, after: Where): LogSqlComparisonDetail['where'] {
  const reasons = [
    before && !Array.isArray(before) ? `Before: ${before.reason}` : undefined,
    after && !Array.isArray(after) ? `After: ${after.reason}` : undefined,
  ].filter(Boolean);
  if (reasons.length) return { status: 'notComparable', reason: reasons.join('; ') };
  if (before === undefined && after === undefined) return { status: 'notApplicable' };
  const onlyAfter = Array.isArray(after) ? [...after] : [];
  const onlyBefore: string[] = [];
  for (const predicate of Array.isArray(before) ? before : []) {
    const index = onlyAfter.indexOf(predicate);
    if (index < 0) onlyBefore.push(predicate);
    else onlyAfter.splice(index, 1);
  }
  return onlyBefore.length || onlyAfter.length
    ? { status: 'different', onlyBefore, onlyAfter }
    : { status: 'matched' };
}
