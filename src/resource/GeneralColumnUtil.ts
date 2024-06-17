import { GeneralColumnType } from '../types';

export function displayGeneralColumnType(
  columnType: GeneralColumnType,
): string {
  return columnType.toUpperCase();
}

export function parseColumnType(
  s: string | null | undefined,
): GeneralColumnType {
  if (s === undefined || s === null) {
    return GeneralColumnType.UNKNOWN;
  }
  s = s.toLowerCase();
  if (['var_string', 'nvarchar'].includes(s)) {
    return GeneralColumnType.VARCHAR;
  } else if (['bpchar'].includes(s)) {
    return GeneralColumnType.CHAR;
  } else if (['ntext'].includes(s)) {
    return GeneralColumnType.TEXT;
  } else if ('tiny' === s) {
    return GeneralColumnType.TINYINT;
  } else if ('datetime' === s || 'timestamp(6)' === s) {
    return GeneralColumnType.TIMESTAMP;
  } else if ('varchar2' === s) {
    return GeneralColumnType.VARCHAR;
  } else if ('number' === s) {
    return GeneralColumnType.NUMERIC;
  } else if ('int' === s) {
    return GeneralColumnType.INTEGER;
  }
  const list = Object.values(GeneralColumnType);
  const m = list.find((it) => it == s);
  if (m) {
    return m;
  }

  console.log('L35 unknown', s);

  return GeneralColumnType.UNKNOWN;
}

export function isNumericLike(type: GeneralColumnType): boolean {
  switch (type) {
    // number
    case GeneralColumnType.TINYINT:
    case GeneralColumnType.SMALLINT:
    case GeneralColumnType.MEDIUMINT:
    case GeneralColumnType.INTEGER:
    case GeneralColumnType.LONG:
    case GeneralColumnType.LONGLONG:
    case GeneralColumnType.BIGINT:
    case GeneralColumnType.SERIAL:
    case GeneralColumnType.MONEY:
    case GeneralColumnType.YEAR:
    case GeneralColumnType.FLOAT:
    case GeneralColumnType.DOUBLE_PRECISION:
    case GeneralColumnType.NUMERIC:
    case GeneralColumnType.DECIMAL:
      return true;
  }
  return false;
}

export function isTextLike(type: GeneralColumnType): boolean {
  switch (type) {
    case GeneralColumnType.CHAR:
    case GeneralColumnType.VARCHAR:
    case GeneralColumnType.TINYTEXT:
    case GeneralColumnType.MEDIUMTEXT:
    case GeneralColumnType.TEXT:
    case GeneralColumnType.LONGTEXT:
      return true;
  }
  return false;
}

/**
 * Tests whether type is BYTEA,BLOB,MEDIUMBLOB,LONGBLOB OR BINARY
 * @param type GeneralColumnType
 * @returns true:BYTEA,BLOB,MEDIUMBLOB,LONGBLOB OR BINARY
 */
export function isBinaryLike(type: GeneralColumnType): boolean {
  switch (type) {
    case GeneralColumnType.BYTEA:
    case GeneralColumnType.BLOB:
    case GeneralColumnType.MEDIUMBLOB:
    case GeneralColumnType.LONGBLOB:
    case GeneralColumnType.TINYBLOB:
    case GeneralColumnType.BINARY:
    case GeneralColumnType.VARBINARY:
      return true;
  }
  return false;
}

export function isGeometryLike(type: GeneralColumnType): boolean {
  switch (type) {
    case GeneralColumnType.GEOMETRY:
    case GeneralColumnType.POINT:
    case GeneralColumnType.POLYGON:
      return true;
  }
  return false;
}

export function isNotSupportDiffType(type: GeneralColumnType): boolean {
  if (isBinaryLike(type) || isGeometryLike(type)) {
    return true;
  }
  if (type === GeneralColumnType.UNKNOWN) {
    return true;
  }
  return false;
}

/**
 * Tests whether type is DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE
 * @param type GeneralColumnType
 * @returns true:DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE
 */
export function isDateTimeOrDate(type: GeneralColumnType): boolean {
  switch (type) {
    case GeneralColumnType.DATE:
    case GeneralColumnType.TIMESTAMP:
    case GeneralColumnType.TIMESTAMP_WITH_TIME_ZONE:
      return true;
  }
  return false;
}

/**
 * Tests whether type is TIME,TIME_WITH_TIME_ZONE,DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE
 * @param type GeneralColumnType
 * @returns true:TIME,TIME_WITH_TIME_ZONE,DATE,TIMESTAMP OR TIMESTAMP_WITH_TIME_ZONE
 */
export function isDateTimeOrDateOrTime(type: GeneralColumnType): boolean {
  switch (type) {
    case GeneralColumnType.TIME:
    case GeneralColumnType.TIME_WITH_TIME_ZONE:
    case GeneralColumnType.DATE:
    case GeneralColumnType.TIMESTAMP:
    case GeneralColumnType.TIMESTAMP_WITH_TIME_ZONE:
      return true;
  }
  return false;
}

export function isTime(type: GeneralColumnType): boolean {
  switch (type) {
    case GeneralColumnType.TIME:
    case GeneralColumnType.TIME_WITH_TIME_ZONE:
      return true;
  }
  return false;
}

export function isUUIDType(type: GeneralColumnType): boolean {
  return type === GeneralColumnType.UUID;
}

/**
 * Tests whether type is JSON or JSONB
 * @param type GeneralColumnType
 * @returns true:JSON or JSONB
 */
export function isJsonLike(type: GeneralColumnType): boolean {
  return GeneralColumnType.JSON === type || GeneralColumnType.JSONB === type;
}
/**
 * Tests whether type is BOOLEAN or BIT
 * @param type GeneralColumnType
 * @returns true:BOOLEAN or BIT
 */
export function isBooleanLike(type: GeneralColumnType): boolean {
  return GeneralColumnType.BOOLEAN === type || GeneralColumnType.BIT === type;
}
export function isEnumOrSet(type: GeneralColumnType): boolean {
  return GeneralColumnType.ENUM === type || GeneralColumnType.SET === type;
}
export function isArray(type: GeneralColumnType): boolean {
  return GeneralColumnType.ARRAY === type;
}

export function parseFaIconType(type: GeneralColumnType): string {
  switch (type) {
    // string
    case GeneralColumnType.CHAR:
    case GeneralColumnType.VARCHAR:
    case GeneralColumnType.TINYTEXT:
    case GeneralColumnType.MEDIUMTEXT:
    case GeneralColumnType.TEXT:
    case GeneralColumnType.LONGTEXT:
    case GeneralColumnType.CLOB:
      return 'fa-font';
    // time
    case GeneralColumnType.TIME:
    case GeneralColumnType.TIME_WITH_TIME_ZONE:
      return 'fa-clock';
    // date
    case GeneralColumnType.DATE:
      return 'fa-calendar';
    // datetime
    case GeneralColumnType.TIMESTAMP:
    case GeneralColumnType.TIMESTAMP_WITH_TIME_ZONE:
      return 'fa-calendar-times';
    // int, long
    case GeneralColumnType.TINYINT:
    case GeneralColumnType.SMALLINT:
    case GeneralColumnType.INTEGER:
    case GeneralColumnType.BIGINT:
    case GeneralColumnType.LONG:
    case GeneralColumnType.LONGLONG:
    case GeneralColumnType.SERIAL:
      return 'fa-sort-numeric-down';
    // float, double, real
    case GeneralColumnType.DECIMAL:
    case GeneralColumnType.FLOAT:
    case GeneralColumnType.DOUBLE_PRECISION:
    case GeneralColumnType.REAL:
      return 'fa-sort-numeric-down';
    // number
    case GeneralColumnType.NUMERIC:
      return 'fa-sort-numeric-down';
    // money
    case GeneralColumnType.MONEY:
      return 'fa-money-bill-alt';
    // bit
    case GeneralColumnType.BIT:
    case GeneralColumnType.VARBIT:
      return 'fa-chess-board';
    // boolean
    case GeneralColumnType.BOOLEAN:
      return 'fa-chess-board';
    // json
    case GeneralColumnType.JSON:
    case GeneralColumnType.JSONB:
      return 'fa-code';
    // binary or blob
    case GeneralColumnType.BINARY:
    case GeneralColumnType.BYTEA:
    case GeneralColumnType.BLOB:
    case GeneralColumnType.MEDIUMBLOB:
    case GeneralColumnType.LONGBLOB:
    case GeneralColumnType.TINYBLOB:
      return 'fa-chess-board';
    // array
    case GeneralColumnType.ARRAY:
      return 'fa-list';
    // object
    case GeneralColumnType.OBJECT:
    case GeneralColumnType.VARIANT:
      return 'fa-folder';
    // etc
    case GeneralColumnType.BOX:
    case GeneralColumnType.CIDR:
    case GeneralColumnType.CIRCLE:
    case GeneralColumnType.INET:
    case GeneralColumnType.LINE:
    case GeneralColumnType.LSEG:
    case GeneralColumnType.MACADDR:
    case GeneralColumnType.PATH:
    case GeneralColumnType.PG_LSN:
    case GeneralColumnType.POINT:
    case GeneralColumnType.POLYGON:
    case GeneralColumnType.TSQUERY:
    case GeneralColumnType.TSVECTOR:
    case GeneralColumnType.TXID_SNAPSHOT:
    case GeneralColumnType.UUID:
    case GeneralColumnType.XML:
    case GeneralColumnType.NAME:
    case GeneralColumnType.XID:
    case GeneralColumnType.INTERVAL:
    case GeneralColumnType.OID:
    case GeneralColumnType.REGTYPE:
    case GeneralColumnType.REGPROC:
    case GeneralColumnType.PG_NODE_TREE:
    case GeneralColumnType.PG_NDISTINCT:
    case GeneralColumnType.PG_DEPENDENCIES:
    case GeneralColumnType.UNKNOWN:
      return 'fa-question-circle';
    // enum, set
    case GeneralColumnType.ENUM:
      return 'fa-list';
    case GeneralColumnType.SET:
      return 'fa-list-ol';
    default:
      return 'fa-question-circle';
  }
}
