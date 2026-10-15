import { GeneralColumnType } from '@l-v-yonsama/rdh';
import { parseQuery } from '../helpers';
import { unwrapQuote } from '../helpers/sql/quote';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from '../resource';
import { DBType } from '../types';
import { EstimatedBindParameter, EstimatedBindParameterLocation } from '../types/drivers/EstimatedBindParameter';
import { RawBindMarker, scanSqlBindMarkers } from './sqlBindMarkerScanner';


/** Finds bind placeholders in `sql` and, where possible, the DB Resource column they most likely bind to. */
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
    const raw = scanSqlBindMarkers({ sql, dbType }).markers;
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
    return [];
  }
}

export function resolveTargetTables(params: {
  dbType: DBType;
  sql: string;
}): Array<{ schemaName?: string; tableName: string }> {
  const { dbType, sql } = params;
  if (!sql || sql.trim() === '') {
    return [];
  }
  try {
    return uniqueTables(buildAliasMap({ sql, dbType }));
  } catch {
    return [];
  }
}

export function resolveTableAliasMap(params: {
  dbType: DBType;
  sql: string;
}): Record<string, { schemaName?: string; tableName: string }> {
  const { dbType, sql } = params;
  if (!sql || sql.trim() === '') {
    return {};
  }
  try {
    const aliasMap = buildAliasMap({ sql, dbType });
    const result: Record<string, { schemaName?: string; tableName: string }> = {};
    for (const [key, entry] of aliasMap) {
      result[key] = { schemaName: entry.schemaName, tableName: entry.tableName };
    }
    return result;
  } catch {
    return {};
  }
}


function orderMarkers(raw: RawBindMarker[], dbType: DBType): RawBindMarker[] {
  switch (dbType) {
    case DBType.MySQL:
    case DBType.Aws:
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
      // Named markers keep first-occurrence order (dedupeFirst already preserves insertion order); numbered markers sort ahead of them - mixing `:1`/`:name` (or `@1`/`@name`) styles in one statement is not a realistic case this needs to order more precisely than that.
      const named = deduped.filter((it) => !isNumericMarker(it.marker));
      return [...numeric, ...named];
    }
    default:
      return [];
  }
}

function dedupeFirst(raw: RawBindMarker[]): RawBindMarker[] {
  const seen = new Map<string, RawBindMarker>();
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


type ColumnCandidate = {
  schemaName?: string;
  /** Either a JOIN alias (`o`) or a bare table name (`orders`). */
  aliasOrTableName?: string;
  columnName: string;
};

type ResolvedColumn = { qualifiedName: string; colType: GeneralColumnType };

type AliasEntry = { schemaName?: string; tableName: string };

const IDENT_SOURCE = `(?:[A-Za-z_][\\w$#]*|"[^"]*")`;
const QUALIFIED_SOURCE = `${IDENT_SOURCE}(?:\\s*\\.\\s*${IDENT_SOURCE}){0,2}`;
const OP_SOURCE = `=|<>|!=|>=|<=|>|<`;
const NEARBY_WINDOW = 200;

function extractNearbyIdentifier(
  sql: string,
  occurrence: RawBindMarker,
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

  // Bare column name: only resolve if exactly one FROM/JOIN table (from the alias map) has a matching column.
  const referencedTables = uniqueTables(aliasMap);
  const matches = referencedTables
    .map((table) => findColumn(databaseResource, table.schemaName, table.tableName, candidate.columnName))
    .filter((it): it is ResolvedColumn => it !== undefined);
  return matches.length === 1 ? matches[0] : undefined;
}

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


function buildAliasMap(params: {
  sql: string;
  dbType: DBType;
  databaseResource?: RdsDatabase;
}): Map<string, AliasEntry> {
  const { sql, dbType } = params;

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
