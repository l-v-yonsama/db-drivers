import dayjs from 'dayjs';

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

export const toBoolean = (s: string | undefined): boolean | undefined => {
  if (s === null || s === undefined) {
    return undefined;
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
