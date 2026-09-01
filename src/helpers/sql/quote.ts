import {
  GeneralColumnType,
  isBooleanLike,
  isDateTimeOrDate,
  isDateTimeOrDateOrTime,
  isEnumOrSet,
  isJsonLike,
  isNumericLike,
  isTextLike,
  isTime,
  isUUIDType,
  setOf,
  toBoolean,
  toDate,
  toNum,
  toTime,
} from '@l-v-yonsama/rdh';
import dayjs from 'dayjs';
import { SQLLang } from '../../types';

export type QuoteChar = '"' | '`' | "'";

/** Quotes a raw SQL/PartiQL string value, even if it already looks quoted. */
export const quoteStringLiteral = (input: string): string =>
  quoteRaw(input, "'");

/** Quotes a raw SQL/PartiQL identifier, even if it already looks quoted. */
export const quoteIdentifier = (input: string): string => quoteRaw(input, '"');

export const wrapSingleQuote = (input: string): string => wrapQuote(input, "'");

export const wrapDoubleQuote = (input: string): string => wrapQuote(input, '"');

export const wrapBackQuote = (input: string): string => wrapQuote(input, '`');

export const wrapQuote = (input: string, quoteChar: QuoteChar): string => {
  if (input.startsWith(quoteChar) && input.endsWith(quoteChar)) {
    return input; // already wrapped
  }
  return quoteRaw(input, quoteChar);
};

const quoteRaw = (input: string, quoteChar: QuoteChar): string => {
  switch (quoteChar) {
    case '"':
      return `"${input.replace(/"/g, '""')}"`;
    case "'":
      return `'${input.replace(/'/g, "''")}'`;
    case '`':
      return `\`${input.replace(/`/g, '``')}\``;
    default:
      throw new Error('Invalid quote char');
  }
};

// Not part of SQLHelper.ts's original public API, but exported here so ../sql/queryParser.ts can reuse it without duplicating it.
export const unwrapQuote = (s: string): string => {
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.substring(1, s.length - 1);
  }
  if (s.startsWith("'") && s.endsWith("'")) {
    return s.substring(1, s.length - 1);
  }
  return s;
};

export const needsQuoting = (name): boolean => {
  const safePattern = /^[A-Za-z_][A-Za-z0-9_]*$/;
  return !safePattern.test(name);
};

export const createTableNameWithSchema = ({
  schema,
  table,
  idQuoteCharacter,
  sqlLang,
}: {
  schema?: string;
  table: string;
  idQuoteCharacter?: string;
  sqlLang?: SQLLang;
}): string => {
  if (sqlLang === 'partiql') {
    return wrapDoubleQuote(table);
  }
  const convertId = (name: string): string => {
    if (needsQuoting(name)) {
      return idQuoteCharacter === '`'
        ? wrapBackQuote(name)
        : wrapDoubleQuote(name);
    }
    return name;
  };

  if (schema) {
    return `${convertId(schema)}.${convertId(table)}`;
  }
  return convertId(table);
};

// Not part of SQLHelper.ts's original public API, but exported here so ../sql/mutationQuery.ts can reuse it without duplicating it.
export const toBindValue = (
  colType: GeneralColumnType,
  value: string | null,
): any => {
  if (isTextLike(colType)) {
    return value;
  }

  if (value === undefined || value === null || value.length === 0) {
    return null;
  }

  if (colType === GeneralColumnType.STRING_SET) {
    return setOf(
      ...value
        .split(',')
        .map((it) => it.trim())
        .filter((it) => it.length > 0),
    );
  } else if (colType === GeneralColumnType.NUMERIC_SET) {
    return setOf(
      ...value
        .split(',')
        .map((it) => it.trim())
        .filter((it) => it.length > 0)
        .map((it) => toNum(it)),
    );
  }

  if (
    isNumericLike(colType) ||
    isDateTimeOrDateOrTime(colType) ||
    isBooleanLike(colType)
  ) {
    let v;
    if (isNumericLike(colType)) {
      v = toNum(value);
    } else if (isDateTimeOrDate(colType)) {
      v = toDate(value);
    } else if (isTime(colType)) {
      v = toTime(value);
    } else {
      v = toBoolean(value);
    }
    return v === undefined ? null : v;
  }

  return value;
};

// Not part of SQLHelper.ts's original public API, but exported here so ../sql/mutationQuery.ts can reuse it without duplicating it.
export const toEmbeddedStringValue = (
  colType: GeneralColumnType,
  value: string | null,
): string => {
  if (value === undefined || value === null) {
    return 'NULL';
  }

  if (isTextLike(colType) || isEnumOrSet(colType)) {
    return wrapSingleQuote(value);
  }

  if (isJsonLike(colType)) {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return wrapSingleQuote(text);
  }

  if (value.length === 0) {
    return 'NULL';
  }

  if (isUUIDType(colType)) {
    return wrapSingleQuote(value);
  }

  if (colType == GeneralColumnType.BIT) {
    const v = toBoolean(value);
    return `B'${v ? 1 : 0}'`;
  }

  if (isNumericLike(colType)) {
    const v = toNum(value);
    return v === undefined ? 'NULL' : v.toString();
  } else if (isTime(colType)) {
    return value === undefined ? 'NULL' : wrapSingleQuote(value);
  } else if (isDateTimeOrDate(colType)) {
    const v = toDate(value);
    return v === undefined
      ? 'NULL'
      : `'${dayjs(v).format('YYYY-MM-DD HH:mm:ss')}'`;
  }

  return value.toString();
};
