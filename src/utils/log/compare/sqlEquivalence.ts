import { LogSqlComparisonOptions, SqlEquivalenceOptions } from '../../../types';

type Segment = { kind: 'code' | 'comment' | 'quoted'; text: string };

/** Keep quoted values and comments separate from SQL code before applying comparison rules. */
function segments(sql: string, dialect: LogSqlComparisonOptions['dialect']): Segment[] {
  const result: Segment[] = [];
  let codeStart = 0;
  let i = 0;
  const push = (kind: Segment['kind'], end: number): void => {
    if (codeStart < i) result.push({ kind: 'code', text: sql.slice(codeStart, i) });
    result.push({ kind, text: sql.slice(i, end) });
    i = end;
    codeStart = end;
  };
  while (i < sql.length) {
    if ((sql.startsWith('--', i) && (dialect !== 'mysql' || /\s/.test(sql[i + 2] ?? '')))
      || (dialect === 'mysql' && sql[i] === '#')) {
      const newline = sql.slice(i).search(/[\r\n]/);
      push('comment', newline < 0 ? sql.length : i + newline);
      continue;
    }
    if (sql.startsWith('/*', i)) {
      const end = sql.indexOf('*/', i + 2);
      push('comment', end < 0 ? sql.length : end + 2);
      continue;
    }
    if (dialect === 'plsql' && (sql[i] === 'q' || sql[i] === 'Q') && sql[i + 1] === "'" && i + 2 < sql.length
      && (i === 0 || !/[A-Za-z0-9_$#]/.test(sql[i - 1]))) {
      const opening = sql[i + 2];
      const closing = ({ '[': ']', '{': '}', '(': ')', '<': '>' } as Record<string, string>)[opening] ?? opening;
      const end = sql.indexOf(`${closing}'`, i + 3);
      push('quoted', end < 0 ? sql.length : end + 2);
      continue;
    }
    const close = sql[i] === '[' && (dialect === 'transactsql' || dialect === 'sqlite') ? ']'
      : sql[i] === "'" || sql[i] === '"' || (sql[i] === '`' && (dialect === 'mysql' || dialect === 'sqlite')) ? sql[i] : undefined;
    if (close) {
      let end = i + 1;
      while (end < sql.length) {
        if (dialect === 'mysql' && close === "'" && sql[end] === '\\') { end += 2; continue; }
        if (sql[end] === close) {
          if (sql[end + 1] === close) { end += 2; continue; }
          end++;
          break;
        }
        end++;
      }
      push('quoted', end);
      continue;
    }
    if (dialect === 'postgresql' && sql[i] === '$') {
      const delimiter = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(sql.slice(i))?.[0];
      if (delimiter) {
        const end = sql.indexOf(delimiter, i + delimiter.length);
        push('quoted', end < 0 ? sql.length : end + delimiter.length);
        continue;
      }
    }
    i++;
  }
  if (codeStart < sql.length) result.push({ kind: 'code', text: sql.slice(codeStart) });
  return result;
}

/** Reject multiple statements and remove delimiters after the sole statement. */
export function singleStatementSql(sql: string, dialect: LogSqlComparisonOptions['dialect']): string {
  let offset = 0;
  let statementCount = 0;
  let hasContent = false;
  let trailingDelimiters: number[] = [];
  for (const { kind, text } of segments(sql, dialect)) {
    if (kind === 'quoted' || (kind === 'comment' && text.startsWith('/*!'))) {
      hasContent = true;
      trailingDelimiters = [];
    } else if (kind === 'code') {
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ';') {
          if (hasContent) statementCount++;
          hasContent = false;
          trailingDelimiters.push(offset + i);
        } else if (!/\s/.test(text[i])) {
          hasContent = true;
          trailingDelimiters = [];
        }
      }
    }
    offset += text.length;
  }
  if (statementCount + Number(hasContent) > 1) {
    throw new Error('Multiple SQL statements are unsupported');
  }
  return trailingDelimiters.reduceRight((text, index) => text.slice(0, index) + text.slice(index + 1), sql).trim();
}

function blank(text: string): string {
  return text.replace(/[^\r\n]/g, ' ');
}

function transformComments(sql: string, dialect: LogSqlComparisonOptions['dialect'], rules: Required<SqlEquivalenceOptions>): string {
  return segments(sql, dialect).map(({ kind, text }) => {
    if (kind !== 'comment') return text;
    if (text.startsWith('/*!')) return text; // MySQL executable comment
    if (text.startsWith('/*+')) return rules.ignoreOptimizerHints ? blank(text) : text;
    return rules.ignoreOrdinaryComments ? blank(text) : text;
  }).join('');
}

function normalizeDateFunctions(sql: string, dialect: LogSqlComparisonOptions['dialect']): string {
  if (dialect === 'sqlite' || dialect === 'plsql') return sql;
  return segments(sql, dialect).map(({ kind, text }) => kind === 'code'
    ? text.replace(dialect === 'transactsql'
      ? /(?<![.\w])GETDATE\s*\(\s*\)/gi
      : /(?<![.\w])(?:NOW|CURRENT_TIMESTAMP)\s*\(\s*\)/gi, 'CURRENT_TIMESTAMP')
    : text).join('');
}

const comparisonDateTime = '2000-10-10 01:01:01.000';

/** Replace complete, unzoned date-time literal values only. */
export function normalizeDateTimeLiteralValue(value: string): string {
  return /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])[ T](?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?$/.test(value)
    ? comparisonDateTime : value;
}

function normalizeDateTimeLiterals(sql: string, dialect: LogSqlComparisonOptions['dialect']): string {
  return segments(sql, dialect).map(({ kind, text }) => kind === 'quoted' && text.startsWith("'") && text.endsWith("'")
    ? `'${normalizeDateTimeLiteralValue(text.slice(1, -1))}'` : text).join('');
}

/** Remove parentheses only when they enclose the complete WHERE expression. */
function removeRedundantWhereParentheses(sql: string, dialect: LogSqlComparisonOptions['dialect']): string {
  let current = sql;
  let changed = true;
  while (changed) {
    changed = false;
    const mask = segments(current, dialect).map(({ kind, text }) => kind === 'code' ? text : blank(text)).join('');
    const matches = [...mask.matchAll(/(?<![.\w])WHERE\s*\(/gi)];
    for (const match of matches) {
      const open = match.index + match[0].lastIndexOf('(');
      let depth = 0;
      for (let i = open; i < mask.length; i++) {
        if (mask[i] === '(') depth++;
        if (mask[i] !== ')' || --depth !== 0) continue;
        if (!/^\s*(?:$|ORDER\s+BY\b|GROUP\s+BY\b|LIMIT\b|FOR\s+UPDATE\b|RETURNING\b|OFFSET\b|FETCH\b)/i.test(mask.slice(i + 1))) break;
        current = `${current.slice(0, open)} ${current.slice(open + 1, i)} ${current.slice(i + 1)}`;
        changed = true;
        break;
      }
      if (changed) break;
    }
  }
  return current;
}

const identifier = '[A-Za-z_][\\w$]*';

function aliasMask(sql: string, dialect: LogSqlComparisonOptions['dialect'], alias: string): string {
  return segments(sql, dialect).map(({ kind, text }) => {
    if (kind === 'code') return text;
    if (dialect === 'mysql' && kind === 'quoted' && text.startsWith('`')) {
      const name = text.slice(1, -1).replace(/``/g, '`');
      return name.toLowerCase() === alias.toLowerCase() ? text : `\`${blank(text.slice(1, -1))}\``;
    }
    return blank(text);
  }).join('');
}

function aliasDeclaration(mask: string, dialect: LogSqlComparisonOptions['dialect'], alias: string): RegExpExecArray | null {
  const table = dialect === 'mysql' ? `(?:${identifier}|\`(?:\`\`|[^\`])*\`)` : identifier;
  const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const aliasName = dialect === 'mysql' ? `(?:${escapedAlias}|\`${escapedAlias}\`)` : escapedAlias;
  return new RegExp(`\\bFROM\\s+${table}(?:\\s*\\.\\s*${table})?(\\s+(?:AS\\s+)?${aliasName})(?=$|[\\s,;)])`, 'i').exec(mask);
}

/** Accept only one plain FROM table and no nested SELECT. */
export function singleTableAlias(sql: string, dialect: LogSqlComparisonOptions['dialect'], ast: any): string | undefined {
  const source = ast?.type === 'select' && ast.from?.length === 1 ? ast.from[0] : undefined;
  const alias = source?.type === 'table' ? source.name?.alias : undefined;
  if (typeof alias !== 'string' || !new RegExp(`^${identifier}$`).test(alias)) return undefined;
  const ineligibleExpression = (value: any, root = false): boolean => {
    if (!value || typeof value !== 'object') return false;
    if (!root && value.type === 'select') return true;
    if (value.type === 'call' && value.function?.schema?.toLowerCase() === alias.toLowerCase()) return true;
    if (value.type === 'ref' && value.table?.schema?.toLowerCase() === alias.toLowerCase()) return true;
    return Object.values(value).some((child) => ineligibleExpression(child));
  };
  if (ineligibleExpression(ast, true)) return undefined;
  return aliasDeclaration(aliasMask(sql, dialect, alias), dialect, alias) ? alias : undefined;
}

function removeSingleTableAlias(sql: string, dialect: LogSqlComparisonOptions['dialect'], alias: string): string {
  const mask = aliasMask(sql, dialect, alias);
  const declaration = aliasDeclaration(mask, dialect, alias)!;
  const edits = [{ start: declaration.index + declaration[0].length - declaration[1].length, end: declaration.index + declaration[0].length }];
  const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const aliasName = dialect === 'mysql' ? `(?:${escapedAlias}|\`${escapedAlias}\`)` : escapedAlias;
  const references = new RegExp(`(?<![\\w$])${aliasName}\\s*\\.`, 'gi');
  for (const match of mask.matchAll(references)) {
    if (match.index >= declaration.index && match.index < declaration.index + declaration[0].length) continue;
    edits.push({ start: match.index, end: match.index + match[0].length });
  }
  return edits.sort((a, b) => b.start - a.start).reduce((text, { start, end }) =>
    `${text.slice(0, start)} ${text.slice(end)}`, sql);
}

export function applySqlEquivalence(sql: string, dialect: LogSqlComparisonOptions['dialect'], rules: Required<SqlEquivalenceOptions>, ast?: any): string {
  let transformed = transformComments(sql, dialect, rules);
  const alias = rules.ignoreSingleTableAlias ? singleTableAlias(transformed, dialect, ast) : undefined;
  if (alias) transformed = removeSingleTableAlias(transformed, dialect, alias);
  if (rules.normalizeDateFunctions) transformed = normalizeDateFunctions(transformed, dialect);
  if (rules.ignoreDateTimeLiteralValues) transformed = normalizeDateTimeLiterals(transformed, dialect);
  if (rules.removeRedundantWhereParentheses) transformed = removeRedundantWhereParentheses(transformed, dialect);
  return transformed;
}
