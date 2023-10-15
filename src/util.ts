import dayjs from 'dayjs';
import { getType } from 'mime-lite';
import { ContentTypeInfo, DBType } from './types';

export const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

export const toNum = (s: string | number | undefined): number | undefined => {
  if (s === null || s === undefined) {
    return undefined;
  }
  if (typeof s === 'number') {
    return s;
  }
  if (s.trim().length === 0) {
    return undefined;
  }

  const n = Number(s);
  if (isNaN(n)) {
    return undefined;
  }
  return n;
};

export const toBoolean = (
  s: Buffer | boolean | string | undefined,
): boolean | undefined => {
  if (s === null || s === undefined) {
    return undefined;
  }
  if (typeof s === 'boolean') {
    return s;
  }
  if (s instanceof Buffer) {
    const buf = s as Buffer;
    return buf.at(0) === 1;
  }
  if (s.trim().length === 0) {
    return undefined;
  }
  return (
    't' === s.toLowerCase() ||
    'true' === s.toLowerCase() ||
    '1' === s.toLowerCase()
  );
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
  if (s.trim().length === 0) {
    return undefined;
  }
  if (/^(now|CURRENT_TIMESTAMP)$/i.test(s)) {
    return new Date();
  }
  if (/^(today|CURRENT_DATE)$/i.test(s)) {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
  }

  const r = dayjs(s).toDate();
  return r;
};

export const toTime = (s: string | undefined): string | undefined => {
  if (s === null || s === undefined) {
    return undefined;
  }

  if (s.trim().length === 0) {
    return undefined;
  }

  if ('now' === s.toLowerCase()) {
    return dayjs().format('HH:mm:ss');
  }

  return s;
};

export const tolines = (s: string): string[] => {
  return s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n/);
};

export const eolToSpace = (s: string): string => {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/g, ' ')
    .replace(/ +/g, ' ');
};

export const abbr = (s: string | undefined, len = 10): string | undefined => {
  if (!s) {
    return s;
  }
  if (s.length > len) {
    const half = Math.floor(Math.min(s.length, len) / 2 - 1);
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

export const equalsIgnoreCase = (s1: string, s2: string): boolean => {
  return s1.toLocaleLowerCase() === s2.toLocaleLowerCase();
};

export default function isDate(value: unknown): value is Date {
  if (value == null) {
    return false;
  }

  return (
    value instanceof Date ||
    (typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Date]')
  );
}

export const parseContentType = (params: {
  fileName?: string;
  contentType?: string;
}): ContentTypeInfo => {
  const info: ContentTypeInfo = {
    contentType: params.contentType ?? '',
    isTextValue: true,
    renderType: 'Unknown',
  };

  const fileName = (params.fileName ?? '').toLocaleLowerCase();
  let contentType = (params.contentType ?? '').toLocaleLowerCase();

  if (fileName.length === 0 && contentType.length === 0) {
    return info;
  }

  if (contentType.length === 0 && fileName && fileName.indexOf('.') >= 0) {
    const ext = fileName.split('.').pop();
    info.contentType = getType(ext);
    contentType = info.contentType.toLocaleLowerCase();
  }

  if (contentType.startsWith('text/')) {
    info.renderType = 'Text';
    info.isTextValue = true;
  } else if (contentType.startsWith('image/')) {
    info.renderType = 'Image';
    info.isTextValue = contentType === 'image/svg+xml';
  } else if (contentType.startsWith('audio/')) {
    info.renderType = 'Audio';
    info.isTextValue = false;
  } else if (contentType.startsWith('video/')) {
    info.renderType = 'Video';
    info.isTextValue = false;
  } else {
    if (contentType === 'application/json') {
      info.renderType = 'Text';
      info.isTextValue = true;
    }
  }

  return info;
};
