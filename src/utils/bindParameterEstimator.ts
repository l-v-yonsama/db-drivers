import { GeneralColumnType } from '@l-v-yonsama/rdh';
import { parseQuery } from '../helpers';
import { unwrapQuote } from '../helpers/sql/quote';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import { DBType } from '../types';
import { EstimatedBindParameter, EstimatedBindParameterLocation } from '../types/drivers/EstimatedBindParameter';

// See misc/design/performance-tuning-query-statistics-parameter-input-plan.ja.md
// (db-notebook repo) §6 for the full design. Everything below is
// deliberately best-effort: a Scanner that finds *a* placeholder and, if
// lucky, *a* nearby column - never a guarantee. Callers must be able to add
// or remove rows to correct whatever this gets wrong; nothing here may throw.

/**
 * Finds bind placeholders in `sql` and, where possible, the DB Resource
 * column they most likely bind to. Never throws: on any internal failure it
 * degrades to an empty array rather than blocking the caller's UI.
 */
export function estimateBindParameters(params: {
  dbType: DBType;
  sql: string;
  databaseResource?: RdsDatabase;
}): EstimatedBindParameter[] {
  const { dbType, sql, databaseResource } = params;
  if (!sql || sql.trim() === '') {
    return [];
  }

  try {
    const raw = scanRawMarkers(sql, dbType);
    if (raw.length === 0) {
      return [];
    }
    const ordered = orderMarkers(raw, dbType);
    const lineStartOffsets = buildLineStartOffsets(sql);
    const aliasMap = buildAliasMap({ sql, dbType, databaseResource });

    return ordered.map((occurrence, idx) => {
      const candidate = extractNearbyIdentifier(sql, occurrence);
      const resolved = candidate
        ? resolveColumn({ candidate, aliasMap, databaseResource })
        : undefined;

      return {
        position: idx + 1,
        marker: occurrence.marker,
        location: offsetToLocation(occurrence.offset, lineStartOffsets),
        estimatedColumn: resolved?.qualifiedName,
        estimatedType: resolved?.colType ?? GeneralColumnType.UNKNOWN,
      };
    });
  } catch {
    // Scanner is best-effort only (§6.2/§6.3) - never propagate a parsing
    // failure into the caller's UI. An empty result just means the user
    // starts from a blank Bind Parameters table and adds rows manually.
    return [];
  }
}

// ---------------------------------------------------------------------------
// Marker scanning (§6.2)
// ---------------------------------------------------------------------------

type RawMarkerOccurrence = {
  /** Exact marker text, e.g. `?`, `$1`, `:B1`, `@name`. */
  marker: string;
  /** 0-based char offset of the marker's first character in `sql`. */
  offset: number;
};

// A single left-to-right pass over the SQL text that skips quoted strings,
// quoted identifiers, and comments before ever looking for a marker. Kept
// as our own tokenizer rather than reusing helpers/sql/queryParser.ts: that
// parser normalizes `?` -> `$1` (shifting every later char offset, which
// would corrupt the `location` this function reports) and has no notion of
// Oracle `:name` / SQL Server `@name` syntax at all. See the design doc's
// §6.2 note for the full rationale.
function scanRawMarkers(sql: string, dbType: DBType): RawMarkerOccurrence[] {
  const occurrences: RawMarkerOccurrence[] = [];
  const n = sql.length;
  let i = 0;

  while (i < n) {
    const ch = sql[i];

    // -- comments --------------------------------------------------------
    if (ch === '-' && sql[i + 1] === '-') {
      while (i < n && sql[i] !== '\n') i++;
      continue;
    }
    if (dbType === DBType.MySQL && ch === '#') {
      while (i < n && sql[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && sql[i + 1] === '*') {
      i += 2;
      while (i < n && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      i = Math.min(n, i + 2);
      continue;
    }

    // -- quoted strings / identifiers ------------------------------------
    if (ch === "'") {
      i = skipQuoted(sql, i, "'");
      continue;
    }
    if (ch === '"') {
      i = skipQuoted(sql, i, '"');
      continue;
    }
    if (dbType === DBType.MySQL && ch === '`') {
      i = skipQuoted(sql, i, '`');
      continue;
    }
    if (dbType === DBType.SQLServer && ch === '[') {
      i++;
      while (i < n) {
        if (sql[i] === ']') {
          // SQL Server escapes a closing bracket in an identifier as `]]`.
          if (sql[i + 1] === ']') {
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    // PostgreSQL dollar-quoted strings (`$$...$$` or `$tag$...$tag$`) may
    // contain text that looks like numbered bind markers. Skip the complete
    // literal before considering `$N` markers. `$1` itself is not a valid
    // dollar-quote delimiter, so normal bind detection remains unchanged.
    if (dbType === DBType.Postgres && ch === '$') {
      const delimiter = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(sql.slice(i))?.[0];
      if (delimiter) {
        const close = sql.indexOf(delimiter, i + delimiter.length);
        i = close === -1 ? n : close + delimiter.length;
        continue;
      }
    }

    // -- markers -----------------------------------------------------------
    if (dbType === DBType.MySQL && ch === '?') {
      occurrences.push({ marker: '?', offset: i });
      i++;
      continue;
    }

    if (dbType === DBType.Postgres && ch === '$') {
      // `::` cast and PostgreSQL are unrelated (Postgres binds are `$N`,
      // never `:`), so no separate `::` exclusion is needed here.
      const m = /^\$\d+/.exec(sql.slice(i));
      if (m) {
        occurrences.push({ marker: m[0], offset: i });
        i += m[0].length;
        continue;
      }
    }

    if (dbType === DBType.Oracle && ch === ':') {
      if (sql[i + 1] === '=') {
        // PL/SQL assignment (`:=`), not a bind marker.
        i += 2;
        continue;
      }
      const m = /^:([A-Za-z_][A-Za-z0-9_$#]*|\d+)/.exec(sql.slice(i));
      if (m) {
        occurrences.push({ marker: m[0], offset: i });
        i += m[0].length;
        continue;
      }
    }

    if (dbType === DBType.SQLServer && ch === '@') {
      if (sql[i + 1] === '@') {
        // `@@` system variable (e.g. `@@SPID`, `@@ROWCOUNT`), not a bind.
        i += 2;
        while (i < n && /[A-Za-z0-9_]/.test(sql[i])) i++;
        continue;
      }
      const m = /^@(\d+|[A-Za-z_][A-Za-z0-9_]*)/.exec(sql.slice(i));
      if (m) {
        occurrences.push({ marker: m[0], offset: i });
        i += m[0].length;
        continue;
      }
    }

    i++;
  }

  return occurrences;
}

// Advances past a `quoteChar`-delimited token starting at `start` (which
// must point at the opening quote), honoring the SQL convention of a
// doubled quote char as an escaped literal quote (e.g. `''`, `""`).
function skipQuoted(sql: string, start: number, quoteChar: string): number {
  let i = start + 1;
  const n = sql.length;
  while (i < n) {
    if (sql[i] === quoteChar) {
      if (sql[i + 1] === quoteChar) {
        i += 2;
        continue;
      }
      return i + 1;
    }
    i++;
  }
  return i;
}

// ---------------------------------------------------------------------------
// Ordering / dedup (§6.2's per-Vendor table)
// ---------------------------------------------------------------------------

function orderMarkers(raw: RawMarkerOccurrence[], dbType: DBType): RawMarkerOccurrence[] {
  switch (dbType) {
    case DBType.MySQL:
      // Each `?` is its own bind; appearance order is already ascending.
      return raw;
    case DBType.Postgres:
      return dedupeFirst(raw).sort((a, b) => numericMarkerValue(a.marker) - numericMarkerValue(b.marker));
    case DBType.Oracle:
    case DBType.SQLServer: {
      const deduped = dedupeFirst(raw);
      const numeric = deduped
        .filter((it) => isNumericMarker(it.marker))
        .sort((a, b) => numericMarkerValue(a.marker) - numericMarkerValue(b.marker));
      // Named markers keep first-occurrence order (dedupeFirst already
      // preserves insertion order); numbered markers sort ahead of them -
      // mixing `:1`/`:name` (or `@1`/`@name`) styles in one statement is
      // not a realistic case this needs to order more precisely than that.
      const named = deduped.filter((it) => !isNumericMarker(it.marker));
      return [...numeric, ...named];
    }
    default:
      return [];
  }
}

function dedupeFirst(raw: RawMarkerOccurrence[]): RawMarkerOccurrence[] {
  const seen = new Map<string, RawMarkerOccurrence>();
  for (const occurrence of raw) {
    if (!seen.has(occurrence.marker)) {
      seen.set(occurrence.marker, occurrence);
    }
  }
  return [...seen.values()];
}

function isNumericMarker(marker: string): boolean {
  return /^[:@]\d+$/.test(marker);
}

function numericMarkerValue(marker: string): number {
  return Number(marker.slice(1));
}

// ---------------------------------------------------------------------------
// location (§5.1)
// ---------------------------------------------------------------------------

function buildLineStartOffsets(sql: string): number[] {
  const offsets = [0];
  for (let i = 0; i < sql.length; i++) {
    if (sql[i] === '\n') {
      offsets.push(i + 1);
    }
  }
  return offsets;
}

function offsetToLocation(offset: number, lineStartOffsets: number[]): EstimatedBindParameterLocation {
  let lo = 0;
  let hi = lineStartOffsets.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lineStartOffsets[mid] <= offset) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return { line: lo + 1, column: offset - lineStartOffsets[lo] + 1 };
}

// ---------------------------------------------------------------------------
// Column metadata resolution (§6.3)
// ---------------------------------------------------------------------------

type ColumnCandidate = {
  schemaName?: string;
  /** Either a JOIN alias (`o`) or a bare table name (`orders`). */
  aliasOrTableName?: string;
  columnName: string;
};

type ResolvedColumn = { qualifiedName: string; colType: GeneralColumnType };

type AliasEntry = { schemaName?: string; tableName: string };

// Matches a single, possibly quoted, unqualified identifier. Quoting
// support is intentionally limited to what helpers/sql/quote.ts's
// unwrapQuote() already strips (double quotes) - see §6.3's note that
// identifier quoting here only covers what the existing quote helper
// handles; backtick/bracket-quoted identifiers simply won't match and the
// placeholder is left unresolved, which is an acceptable Scanner miss.
const IDENT_SOURCE = `(?:[A-Za-z_][\\w$#]*|"[^"]*")`;
const QUALIFIED_SOURCE = `${IDENT_SOURCE}(?:\\s*\\.\\s*${IDENT_SOURCE}){0,2}`;
const OP_SOURCE = `=|<>|!=|>=|<=|>|<`;
const NEARBY_WINDOW = 200;

function extractNearbyIdentifier(
  sql: string,
  occurrence: RawMarkerOccurrence,
): ColumnCandidate | undefined {
  const before = sql.slice(Math.max(0, occurrence.offset - NEARBY_WINDOW), occurrence.offset);
  const after = sql.slice(
    occurrence.offset + occurrence.marker.length,
    occurrence.offset + occurrence.marker.length + NEARBY_WINDOW,
  );

  const leftMatch = new RegExp(`(${QUALIFIED_SOURCE})\\s*(?:${OP_SOURCE})\\s*$`).exec(before);
  if (leftMatch) {
    return parseQualifiedIdentifier(leftMatch[1]);
  }

  const rightMatch = new RegExp(`^\\s*(?:${OP_SOURCE})\\s*(${QUALIFIED_SOURCE})`).exec(after);
  if (rightMatch) {
    return parseQualifiedIdentifier(rightMatch[1]);
  }

  return undefined;
}

function parseQualifiedIdentifier(raw: string): ColumnCandidate {
  const parts = raw.split('.').map((part) => unwrapQuote(part.trim()));
  if (parts.length === 3) {
    return { schemaName: parts[0], aliasOrTableName: parts[1], columnName: parts[2] };
  }
  if (parts.length === 2) {
    return { aliasOrTableName: parts[0], columnName: parts[1] };
  }
  return { columnName: parts[0] };
}

function resolveColumn(params: {
  candidate: ColumnCandidate;
  aliasMap: Map<string, AliasEntry>;
  databaseResource?: RdsDatabase;
}): ResolvedColumn | undefined {
  const { candidate, aliasMap, databaseResource } = params;
  if (!databaseResource) {
    return undefined;
  }

  if (candidate.schemaName && candidate.aliasOrTableName) {
    return findColumn(databaseResource, candidate.schemaName, candidate.aliasOrTableName, candidate.columnName);
  }

  if (candidate.aliasOrTableName) {
    const aliasEntry = aliasMap.get(candidate.aliasOrTableName.toLowerCase());
    if (aliasEntry) {
      const resolved = findColumn(databaseResource, aliasEntry.schemaName, aliasEntry.tableName, candidate.columnName);
      if (resolved) {
        return resolved;
      }
    }
    // Not a known alias - try it as a literal, unqualified table name.
    return findColumn(databaseResource, undefined, candidate.aliasOrTableName, candidate.columnName);
  }

  // Bare column name: only resolve if exactly one FROM/JOIN table (from the
  // alias map) has a matching column.
  const referencedTables = uniqueTables(aliasMap);
  const matches = referencedTables
    .map((table) => findColumn(databaseResource, table.schemaName, table.tableName, candidate.columnName))
    .filter((it): it is ResolvedColumn => it !== undefined);
  return matches.length === 1 ? matches[0] : undefined;
}

// Resolves `schemaName.tableName.columnName` (schemaName omitted searches
// every schema, requiring a unique match, per §6.3 rule 2).
function findColumn(
  databaseResource: RdsDatabase,
  schemaName: string | undefined,
  tableName: string,
  columnName: string,
): ResolvedColumn | undefined {
  const schemas = schemaName
    ? [databaseResource.getChildByName(schemaName, true)].filter((it): it is DbSchema => !!it)
    : (databaseResource.children as DbSchema[]);

  const matches: ResolvedColumn[] = [];
  for (const schema of schemas) {
    const table = schema.getChildByName(tableName, true) as DbTable | undefined;
    const column = table?.getChildByName(columnName, true) as DbColumn | undefined;
    if (table && column) {
      matches.push({
        qualifiedName: `${schema.name}.${table.name}.${column.name}`,
        colType: column.colType,
      });
    }
  }
  return matches.length === 1 ? matches[0] : undefined;
}

function uniqueTables(aliasMap: Map<string, AliasEntry>): AliasEntry[] {
  const seen = new Set<string>();
  const result: AliasEntry[] = [];
  for (const entry of aliasMap.values()) {
    const key = `${entry.schemaName ?? ''}.${entry.tableName}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(entry);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// FROM/JOIN alias map (§6.3 step 2)
// ---------------------------------------------------------------------------

function buildAliasMap(params: {
  sql: string;
  dbType: DBType;
  databaseResource?: RdsDatabase;
}): Map<string, AliasEntry> {
  const { sql, dbType } = params;

  // MySQL/PostgreSQL: prefer helpers/sql/queryParser.ts's AST (already used
  // package-wide for table detection) over a hand-rolled FROM/JOIN regex -
  // it already understands quoting/aliasing correctly for these two
  // dialects. Oracle (`:name`) and SQL Server (`@name`) bind syntax isn't
  // normalized by that parser's Postgres-flavored grammar and routinely
  // fails to parse, so they always use the regex fallback below. This is
  // purely an opportunistic assist, never a hard dependency: any parse
  // failure falls through to the same regex fallback every other Vendor
  // uses (see design doc §6.3's note on this).
  if (dbType === DBType.MySQL || dbType === DBType.Postgres) {
    const viaParser = buildAliasMapViaParser(sql);
    if (viaParser && viaParser.size > 0) {
      return viaParser;
    }
  }

  return buildAliasMapViaRegex(sql);
}

function buildAliasMapViaParser(sql: string): Map<string, AliasEntry> | undefined {
  let qst;
  try {
    qst = parseQuery(sql);
  } catch {
    return undefined;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (qst?.ast as any)?.from;
  if (!Array.isArray(from)) {
    return undefined;
  }

  const map = new Map<string, AliasEntry>();
  for (const f of from) {
    if (f?.type !== 'table' || !f.name?.name) {
      continue;
    }
    const entry: AliasEntry = { schemaName: f.name.schema, tableName: f.name.name };
    if (f.name.alias) {
      map.set(String(f.name.alias).toLowerCase(), entry);
    }
    map.set(String(f.name.name).toLowerCase(), entry);
  }
  return map;
}

const NON_ALIAS_KEYWORDS = new Set([
  'ON',
  'WHERE',
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'FULL',
  'OUTER',
  'CROSS',
  'GROUP',
  'ORDER',
  'HAVING',
  'LIMIT',
  'UNION',
  'SET',
  'AS',
  'USING',
  'WITH',
]);

function buildAliasMapViaRegex(sql: string): Map<string, AliasEntry> {
  const map = new Map<string, AliasEntry>();
  const re = new RegExp(
    `\\b(?:FROM|JOIN)\\s+(${QUALIFIED_SOURCE})(?:\\s+(?:AS\\s+)?([A-Za-z_][\\w$#]*))?`,
    'gi',
  );

  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const parts = m[1].split('.').map((part) => unwrapQuote(part.trim()));
    const tableName = parts[parts.length - 1];
    const schemaName = parts.length >= 2 ? parts[0] : undefined;
    const entry: AliasEntry = { schemaName, tableName };

    const alias = m[2];
    if (alias && !NON_ALIAS_KEYWORDS.has(alias.toUpperCase())) {
      map.set(alias.toLowerCase(), entry);
    }
    map.set(tableName.toLowerCase(), entry);
  }
  return map;
}
