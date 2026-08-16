import { isRecord, toNum } from '@l-v-yonsama/rdh';

// Defensive value coercion shared by every vendor's performance-tuning
// catalog/plan parsing (postgresCatalogMapper.ts, postgresPlanParser.ts
// today; MySQL/SQL Server/Oracle providers - §13 step 8 - are expected to
// reuse these too, since raw driver output has the same "untyped, partially
// vendor-quirky" shape regardless of vendor). Catalog/EXPLAIN output is DB
// data we don't fully control the shape of, so every accessor here is
// guarded and none of them throw - an unmappable value is dropped, never a
// reason to fail the whole collection.

export const asRecord = (v: unknown): Record<string, unknown> | undefined =>
  isRecord(v) && !Array.isArray(v) ? v : undefined;

export const asString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined;

export const asBoolean = (v: unknown): boolean => v === true;

// Delegates to rdh's toNum() (this driver's existing convention, e.g.
// RDSBaseDriver.countSql()) rather than reimplementing string/number
// coercion. toNum() itself only accepts `string | number | undefined`, so
// values are filtered to that first - passing e.g. a boolean or nested
// object through would make toNum() call `.trim()` on it and throw, which
// none of these accessors are allowed to do on malformed input.
// Number.isFinite() catches the one gap toNum() leaves open: a numeric
// NaN/Infinity value is returned as-is, unfiltered.
export const asNumber = (v: unknown): number | undefined => {
  if (typeof v !== 'string' && typeof v !== 'number') {
    return undefined;
  }
  const n = toNum(v);
  return n !== undefined && Number.isFinite(n) ? n : undefined;
};

// Some drivers parse timestamp columns into native JS `Date` objects rather
// than strings (node-postgres does, for timestamp/timestamptz).
export const asIsoDateString = (v: unknown): string | undefined => {
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? undefined : v.toISOString();
  }
  return asString(v);
};

// Some drivers have no default array parser for every array type they
// support (node-postgres has none for `name[]`, only scalar `name`), so a
// query that forgets an explicit cast can come back as the raw `{a,b}`
// array-literal text instead of a JS array. This still parses that form as
// a fallback so a forgotten cast degrades to "parsed anyway" instead of
// "silently empty". Doesn't handle quoted/escaped elements (identifiers
// containing a comma, brace or backslash) - good enough for
// table/column/constraint names, which never legitimately contain those.
export const asStringArray = (v: unknown): string[] | undefined => {
  if (Array.isArray(v)) {
    const strings = v.filter((x): x is string => typeof x === 'string');
    return strings.length > 0 ? strings : undefined;
  }
  if (typeof v === 'string' && v.startsWith('{') && v.endsWith('}')) {
    const items = v
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return items.length > 0 ? items : undefined;
  }
  return undefined;
};
