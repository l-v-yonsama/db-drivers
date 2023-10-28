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
  if (!s || len <= 0) {
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

  let extension: string | undefined = undefined;
  if (fileName && fileName.indexOf('.') >= 0) {
    extension = fileName.split('.').pop();
  }
  if (contentType.length === 0 && extension) {
    info.contentType = getType(extension);
    contentType = info.contentType.toLocaleLowerCase();
  }

  if (contentType.startsWith('text/')) {
    info.renderType = 'Text';
    info.isTextValue = true;
    if (contentType.startsWith('text/html')) {
      info.shortLang = 'html';
    } else if (contentType.startsWith('text/css')) {
      info.shortLang = 'css';
    } else if (contentType.startsWith('text/csv')) {
      info.shortLang = 'csv';
    } else if (contentType.startsWith('text/javascript')) {
      info.shortLang = 'js';
    } else if (contentType.startsWith('text/vbscript')) {
      info.shortLang = 'vb';
    } else if (contentType.startsWith('text/xml')) {
      info.shortLang = 'xml';
    } else {
      info.shortLang = 'text';
    }
  } else if (contentType.startsWith('image/')) {
    info.renderType = 'Image';
    if (contentType === 'image/svg+xml') {
      info.isTextValue = true;
      info.shortLang = 'xml';
    }
  } else if (contentType.startsWith('audio/')) {
    info.renderType = 'Audio';
    info.isTextValue = false;
  } else if (contentType.startsWith('video/')) {
    info.renderType = 'Video';
    info.isTextValue = false;
  } else {
    if (contentType.startsWith('application/json')) {
      info.renderType = 'Text';
      info.isTextValue = true;
      info.shortLang = 'json';
    } else if (
      contentType.startsWith('application/javascript') ||
      contentType.startsWith('application/x-javascript')
    ) {
      info.renderType = 'Text';
      info.isTextValue = true;
      info.shortLang = 'js';
    } else if (contentType.startsWith('application/octet')) {
      if (extension === 'ico') {
        info.renderType = 'Image';
        if (contentType === 'image/ico') {
          info.isTextValue = false;
        }
      }
    }
  }

  if (info.isTextValue && info.shortLang === 'text' && extension) {
    if (
      extension.match(
        /(bat|c|cmake|cobol|coffee|cpp|csharp|cs|css|d|diff|docker|fsharp|go|gql|html|http|ini|properties|java|js|json|json5|jsx|less|lua|make|makefile|md|matlab|mermaid|nginx|perl|php|plsql|postcss|ps|ps1|prisma|pug|py|r|rb|rs|sas|sass|scala|scheme|scss|bash|sh|zsh|spl|sql|ssh-config|svelte|tex|tsx|ts|vb|vue|wasm|xml|yaml|yml)/,
      )
    ) {
      info.shortLang = extension;
    }
  }

  return info;
};
