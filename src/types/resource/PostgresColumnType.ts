import { EnumValues } from 'enum-values';

export enum PostgresColumnType {
  BOOLEAN = 16,
  BYTEA = 17,
  CHAR = 18,
  NAME = 19,
  BIGINT = 20, // int8
  SMALLINT = 21, // int2
  INTEGER = 23, // int4
  TEXT = 25,
  OID = 26,
  TID = 27,
  XID = 28,
  CID = 29,
  JSON = 114,
  XML = 142,
  POINT = 600,
  LSEG = 601,
  PATH = 602,
  BOX = 603,
  POLYGON = 604,
  CIDR = 650,
  LINE = 628,
  REAL = 700, // float4
  DOUBLE_PRECISION = 701, // float8
  CIRCLE = 718,
  MONEY = 790,
  MACADDR = 829,
  INET = 869,
  BPCHAR = 1042,
  VARCHAR = 1043,
  DATE = 1082,
  INTERVAL = 1186,
  TIME = 1083,
  TIME_WITH_TIME_ZONE = 1266,
  TIMESTAMP = 1114,
  TIMESTAMP_WITH_TIME_ZONE = 1184,
  BIT = 1560,
  VARBIT = 1562,
  NUMERIC = 1700,
  // SERIAL = 23, dosen't use. INTEGER
  TXID_SNAPSHOT = 2970,
  UUID = 2950,
  PG_LSN = 3220,
  TSVECTOR = 3614,
  TSQUERY = 3615,
  JSONB = 3802,

  ARRAY,
  REGTYPE,
  REGPROC,
  PG_NODE_TREE,
  PG_NDISTINCT,
  PG_DEPENDENCIES,
  UNKNOWN = -1,
}
export namespace PostgresColumnType {
  export function parse(s: number | string | undefined): PostgresColumnType {
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
      return e.value as PostgresColumnType;
    }
    // console.error(`can't parse from `, s, typeof s);
    return PostgresColumnType.UNKNOWN;
  }
}
