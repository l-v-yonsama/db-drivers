import { DBType } from '../types';

export type RawBindMarker = {
  marker: string;
  /** Zero-based offset in the original SQL. */
  offset: number;
};

export type SqlBindMarkerScan = {
  markers: RawBindMarker[];
  error?: string;
};

/** Finds bind markers outside SQL comments, string literals and quoted identifiers. */
export function scanSqlBindMarkers({
  sql,
  dbType,
  markerSyntax = 'database',
  strict = false,
}: {
  sql: string;
  dbType: DBType;
  /** JDBC log SQL may use `?` even when the database's native marker differs. */
  markerSyntax?: 'database' | 'question';
  /** Report unterminated quoted regions instead of accepting a partial scan. */
  strict?: boolean;
}): SqlBindMarkerScan {
  const markers: RawBindMarker[] = [];
  const n = sql.length;
  let i = 0;

  while (i < n) {
    const ch = sql[i];

    if (ch === '-' && sql[i + 1] === '-' && (dbType !== DBType.MySQL || /\s/.test(sql[i + 2] ?? ''))) {
      while (i < n && sql[i] !== '\n') i++;
      continue;
    }
    if (dbType === DBType.MySQL && ch === '#') {
      while (i < n && sql[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && sql[i + 1] === '*') {
      const close = sql.indexOf('*/', i + 2);
      if (close === -1 && strict) return { markers, error: 'Unclosed SQL block comment.' };
      i = close === -1 ? n : close + 2;
      continue;
    }

    if (dbType === DBType.Oracle && (ch === 'q' || ch === 'Q') && sql[i + 1] === "'" && i + 2 < n
      && (i === 0 || !/[A-Za-z0-9_$#]/.test(sql[i - 1]))) {
      const opening = sql[i + 2];
      const closing = ({ '[': ']', '{': '}', '(': ')', '<': '>' } as Record<string, string>)[opening] ?? opening;
      const end = sql.indexOf(`${closing}'`, i + 3);
      if (end === -1 && strict) return { markers, error: 'Unclosed Oracle quoted literal.' };
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ((dbType === DBType.MySQL || dbType === DBType.SQLite) && ch === '`')) {
      const quoted = skipQuoted(sql, i, ch, dbType === DBType.MySQL && ch === "'");
      if (!quoted.closed && strict) {
        return { markers, error: 'Unclosed SQL literal or identifier.' };
      }
      i = quoted.end;
      continue;
    }
    if ((dbType === DBType.SQLServer || dbType === DBType.SQLite) && ch === '[') {
      const quoted = skipQuoted(sql, i, ']');
      if (!quoted.closed && strict) {
        return { markers, error: 'Unclosed SQL identifier.' };
      }
      i = quoted.end;
      continue;
    }

    if (dbType === DBType.Postgres && ch === '$') {
      const delimiter = /^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/.exec(sql.slice(i))?.[0];
      if (delimiter) {
        const close = sql.indexOf(delimiter, i + delimiter.length);
        if (close === -1 && strict) return { markers, error: 'Unclosed dollar-quoted SQL literal.' };
        i = close === -1 ? n : close + delimiter.length;
        continue;
      }
    }

    if (dbType === DBType.SQLite && ch === '?') {
      const numbered = /^\?\d+/.exec(sql.slice(i));
      if (numbered) {
        markers.push({ marker: numbered[0], offset: i });
        i += numbered[0].length;
        continue;
      }
    }
    if (dbType === DBType.SQLite && (ch === ':' || ch === '@' || ch === '$')) {
      const named = /^[:@$](?:[A-Za-z_][A-Za-z0-9_]*|\d+)/.exec(sql.slice(i));
      if (named) {
        markers.push({ marker: named[0], offset: i });
        i += named[0].length;
        continue;
      }
    }
    if ((markerSyntax === 'question' || dbType === DBType.MySQL || dbType === DBType.Aws || dbType === DBType.SQLite) && ch === '?') {
      markers.push({ marker: '?', offset: i });
      i++;
      continue;
    }
    if (markerSyntax === 'question') {
      i++;
      continue;
    }
    if (dbType === DBType.Postgres && ch === '$') {
      const match = /^\$\d+/.exec(sql.slice(i));
      if (match) {
        markers.push({ marker: match[0], offset: i });
        i += match[0].length;
        continue;
      }
    }
    if (dbType === DBType.Oracle && ch === ':') {
      if (sql[i + 1] === '=') {
        i += 2;
        continue;
      }
      const match = /^:([A-Za-z_][A-Za-z0-9_$#]*|\d+)/.exec(sql.slice(i));
      if (match) {
        markers.push({ marker: match[0], offset: i });
        i += match[0].length;
        continue;
      }
    }
    if (dbType === DBType.SQLServer && ch === '@') {
      if (sql[i + 1] === '@') {
        i += 2;
        while (i < n && /[A-Za-z0-9_]/.test(sql[i])) i++;
        continue;
      }
      const match = /^@(\d+|[A-Za-z_][A-Za-z0-9_]*)/.exec(sql.slice(i));
      if (match) {
        markers.push({ marker: match[0], offset: i });
        i += match[0].length;
        continue;
      }
    }
    i++;
  }
  return { markers };
}

function skipQuoted(sql: string, start: number, close: string, backslashEscapes = false): {
  end: number;
  closed: boolean;
} {
  let i = start + 1;
  while (i < sql.length) {
    if (backslashEscapes && sql[i] === '\\') {
      i += 2;
      continue;
    }
    if (sql[i] === close) {
      if (sql[i + 1] === close) {
        i += 2;
        continue;
      }
      return { end: i + 1, closed: true };
    }
    i++;
  }
  return { end: sql.length, closed: false };
}
