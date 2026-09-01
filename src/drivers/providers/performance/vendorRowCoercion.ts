import { isRecord, toNum } from '@l-v-yonsama/rdh';


export const asRecord = (v: unknown): Record<string, unknown> | undefined =>
  isRecord(v) && !Array.isArray(v) ? v : undefined;

export const asString = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined;

export const asBoolean = (v: unknown): boolean => v === true;

// Delegates to rdh's toNum() (this driver's existing convention, e.g. RDSBaseDriver.countSql()) rather than reimplementing string/number coercion.
export const asNumber = (v: unknown): number | undefined => {
  if (typeof v !== 'string' && typeof v !== 'number') {
    return undefined;
  }
  const n = toNum(v);
  return n !== undefined && Number.isFinite(n) ? n : undefined;
};

// Some drivers parse timestamp columns into native JS `Date` objects rather than strings (node-postgres does, for timestamp/timestamptz).
export const asIsoDateString = (v: unknown): string | undefined => {
  if (v instanceof Date) {
    return Number.isNaN(v.getTime()) ? undefined : v.toISOString();
  }
  return asString(v);
};

// Some drivers have no default array parser for every array type they support (node-postgres has none for `name[]`, only scalar `name`), so a query that forgets an explicit cast can come back as the raw `{a,b}` array-literal text instead of a JS array.
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
