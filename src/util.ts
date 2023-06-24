import dayjs from 'dayjs';
import { DBType } from './types';

export const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

export const toNum = (s: string | undefined): number | undefined => {
  if (s === null || s === undefined || s.trim().length === 0) {
    return undefined;
  }

  const n = Number(s);
  if (isNaN(n)) {
    return undefined;
  }
  return n;
};

export const toBoolean = (
  s: Buffer | string | undefined,
): boolean | undefined => {
  if (s === null || s === undefined) {
    return undefined;
  }
  if (s instanceof Buffer) {
    const buf = s as Buffer;
    return buf.at(0) === 1;
  }
  return 'true' === s.toLowerCase();
};

export const toDate = (
  s: string | number | Date | undefined,
): Date | undefined => {
  if (s === null || s === undefined) {
    return undefined;
  }

  if (typeof s === 'object') {
    if (s instanceof Date) {
      return s;
    }
  }

  if (typeof s === 'number') {
    return new Date(s);
  }

  const r = dayjs(s).toDate();
  return r;
};

export const tolines = (s: string): string[] => {
  return s.replace(/\r\n/, '\n').replace(/\r/, '\n').split(/\n/);
};

export const abbr = (s: string | undefined, len = 10): string | undefined => {
  if (!s) {
    return s;
  }
  if (s.length > len) {
    const half = s.length / 2 - 1;
    return s.substring(0, half) + '..' + s.substring(s.length - half);
  } else {
    return s;
  }
};

export const isAws = (dbType: DBType): boolean => DBType.Aws === dbType;

export const isRDSType = (dbType: DBType): boolean => {
  switch (dbType) {
    case DBType.MySQL:
    case DBType.Postgres:
      return true;
  }
  return false;
};
