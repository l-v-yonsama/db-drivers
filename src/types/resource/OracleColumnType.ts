import { EnumValues } from 'enum-values';

export enum OracleColumnType {
  VARCHAR2,
  NVARCHAR2,
  CHAR,
  NCHAR,
  NUMBER,
  FLOAT,
  REAL,
  DOUBLE_PRECISION,
  LONG,
  RAW,
  LONG_RAW,
  DATE,
  TIMESTAMP,
  TIMESTAMP_WITH_TIME_ZONE,
  INTERVAL,
  CLOB,
  NCLOB,
  BLOB,
  BFILE,
  ROWID,
  UROWID,
  XML,
  JSON,
  BOOLEAN,
  UNKNOWN = -1,
}

export namespace OracleColumnType {
  export function parse(s: string | undefined): OracleColumnType {
    if (s === undefined || s === null) {
      return OracleColumnType.UNKNOWN;
    }
    s = s.toUpperCase();

    if ('BINARY_FLOAT' === s) {
      return OracleColumnType.REAL;
    } else if ('BINARY_DOUBLE' === s) {
      return OracleColumnType.DOUBLE_PRECISION;
    } else if ('RAW' === s) {
      return OracleColumnType.RAW;
    } else if ('LONG RAW' === s) {
      return OracleColumnType.LONG_RAW;
    } else if (s.startsWith('TIMESTAMP') && s.includes('TIME ZONE')) {
      // covers both "TIMESTAMP(n) WITH TIME ZONE" and "TIMESTAMP(n) WITH LOCAL TIME ZONE"
      return OracleColumnType.TIMESTAMP_WITH_TIME_ZONE;
    } else if (s.startsWith('TIMESTAMP')) {
      return OracleColumnType.TIMESTAMP;
    } else if (s.startsWith('INTERVAL')) {
      // covers "INTERVAL YEAR(n) TO MONTH" and "INTERVAL DAY(n) TO SECOND(n)"
      return OracleColumnType.INTERVAL;
    } else if ('NCLOB' === s) {
      return OracleColumnType.NCLOB;
    } else if ('XMLTYPE' === s) {
      return OracleColumnType.XML;
    }

    const e = EnumValues.getNamesAndValues(OracleColumnType).find(
      (a) => a.name === s,
    );
    if (e) {
      return e.value as OracleColumnType;
    }
    return OracleColumnType.UNKNOWN;
  }
}
