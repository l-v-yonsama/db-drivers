import { EnumValues } from 'enum-values';

export enum PostgresColumnType {
  BIGINT = 20,
  BIT = 1560,
  VARBIT = 1562,
  BOOLEAN = 16,
  BOX = 603,
  BYTEA = 17,
  CHAR = 1042,
  VARCHAR = 1043,
  CIDR = 650,
  CIRCLE = 718,
  DATE = 1082,
  DOUBLE_PRECISION = 701,
  INET = 869,
  INTEGER = 23,
  JSON = 114,
  JSONB = 3802,
  LINE = 628,
  LSEG = 601,
  MACADDR = 829,
  MONEY = 790,
  NUMERIC = 1700,
  PATH = 602,
  PG_LSN = 3220,
  POINT = 600,
  POLYGON = 604,
  REAL = 700,
  SMALLINT = 21,
  // SERIAL = 23, dosen't use. INTEGER
  TEXT = 25,
  TIME = 1083,
  TIME_WITH_TIME_ZONE = 1266,
  TIMESTAMP = 1114,
  TIMESTAMP_WITH_TIME_ZONE = 1184,
  TSQUERY = 3615,
  TSVECTOR = 3614,
  TXID_SNAPSHOT = 2970,
  UUID = 2950,
  XML = 142,
  NAME,
  ARRAY,
  XID,
  INTERVAL,
  OID,
  REGTYPE,
  REGPROC,
  PG_NODE_TREE,
  PG_NDISTINCT,
  PG_DEPENDENCIES,
  UNKNOWN = -1,
}
export namespace PostgresColumnType {
  export function parse(s: number | string | undefined) {
    if (s === undefined || s === null) {
      return PostgresColumnType.UNKNOWN;
    }
    if (typeof s === 'number') {
      if (EnumValues.getNameFromValue(PostgresColumnType, s) === null) {
        return PostgresColumnType.UNKNOWN;
      }
      return s;
    }
    s = s.toUpperCase().replace(/"/g, '');
    if ('CHAR' === s || 'CHARACTER' === s) {
      return PostgresColumnType.CHAR;
    } else if ('CHARACTER VARYING' === s) {
      return PostgresColumnType.VARCHAR;
    } else if ('DOUBLE PRECISION' === s) {
      return PostgresColumnType.DOUBLE_PRECISION;
    } else if ('ANYARRAY' === s) {
      return PostgresColumnType.ARRAY;
    } else if ('TIMESTAMP WITH TIME ZONE' === s) {
      return PostgresColumnType.TIMESTAMP_WITH_TIME_ZONE;
    } else if ('TIMESTAMP WITHOUT TIME ZONE' === s) {
      return PostgresColumnType.TIMESTAMP;
    } else if ('TIME WITH TIME ZONE' === s) {
      return PostgresColumnType.TIME_WITH_TIME_ZONE;
    } else if ('ABSTIME' === s || 'TIME WITHOUT TIME ZONE' === s) {
      return PostgresColumnType.TIME;
    } else if ('BIT VARYING' === s) {
      return PostgresColumnType.VARBIT;
    }
    const e = EnumValues.getNamesAndValues(PostgresColumnType).find(
      (a) => a.name === s,
    );
    if (e) {
      return e.value;
    }
    // console.error(`can't parse from `, s, typeof s);
    return PostgresColumnType.UNKNOWN;
  }
}
