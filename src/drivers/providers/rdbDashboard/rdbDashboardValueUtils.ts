import { GeneralResult } from '../../../types/drivers/GeneralResult';

type Row = Record<string, unknown>;

export function dashboardBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export function dashboardNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function dashboardSuccess<T>(result: T): GeneralResult<T> {
  return { ok: true, message: '', result };
}

export function dashboardRowValue(row: Row, ...names: string[]): unknown {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(row, name)) return row[name];
  }
  const lowered = new Map(
    Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]),
  );
  for (const name of names) {
    if (lowered.has(name.toLowerCase())) return lowered.get(name.toLowerCase());
  }
  return undefined;
}
