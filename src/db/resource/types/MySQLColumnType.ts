import { EnumValues } from 'enum-values';
import { FieldPacket } from 'mysql2';

export enum MySQLColumnType {
  DECIMAL = 0x00, // DECIMAL
  TINYINT = 0x01, // TINYINT, 1 byte
  SMALLINT = 0x02, // SMALLINT, 2 bytes
  INTEGER = 3, // (3) integer
  FLOAT = 0x04, // FLOAT, 4-8 bytes
  REAL = 0x05, // (5) REAL, DOUBLE, 8 bytes
  NULL = 0x06, // NULL (used for prepared statements, I think)
  TIMESTAMP = 0x07, // TIMESTAMP
  BIGINT = 0x08, // BIGINT, 8 bytes
  MEDIUMINT = 0x09, // MEDIUMINT, 3 bytes
  DATE = 0x0a, // DATE
  TIME = 0x0b, // TIME
  DATETIME = 0x0c, // DATETIME
  YEAR = 0x0d, // YEAR, 1 byte (don't ask)
  NEWDATE = 0x0e, // ?
  BIT = 0x10, // BIT, 1-8 byte
  TIMESTAMP2 = 0x11, // TIMESTAMP with fractional seconds
  DATETIME2 = 0x12, // DATETIME with fractional seconds
  TIME2 = 0x13, // TIME with fractional seconds
  JSON = 0xf5, // (245)JSON
  NUMERIC = 0xf6, // (246)DECIMAL
  ENUM = 0xf7, // ENUM
  SET = 0xf8, // SET
  // TINY_BLOB = 0xf9, // TINYBLOB, TINYTEXT
  // MEDIUM_BLOB = 0xfa, // MEDIUMBLOB, MEDIUMTEXT
  // LONG_BLOB = 0xfb, // LONGBLOG, LONGTEXT
  // BLOB = 0xfc, // (252)BLOB, TEXT
  VARCHAR = 0xfd, // (253)VARCHAR, VARBINARY
  POINT = 0xff, // (255)GEOMETRY,
  TINYTEXT = 1001, // (252)BLOB, TINYTEXT(length: 765, flags: 16,)
  TEXT = 1002, // (252)TEXt(length: 196605, flags: 16)
  BLOB = 1012, // (252)BLOB(length: 65535, flags: 144)
  MEDIUMTEXT = 1003, // (252)BLOB, TEXt(length: 50331645,, flags: 16)
  MEDIUMBLOB = 1013, // (252)MEDIUMBLOB(length: 16777215,, flags: 144)
  LONGTEXT = 1004, // (252)BLOB, long TEXT(length: 4294967295,flags: 16)
  LONGBLOB = 1014, // (252)LONGBLOB,(length: 4294967295,flags: 144)
  CHAR = 2001, // (254)CHAR(flags: 20483,)
  BINARY = 2002, // (254)BINARY(flags: 128,)
  UNKNOWN,
}
export namespace MySQLColumnType {
  export function parseByFieldInfo(fieldInfo: FieldPacket): number {
    if (fieldInfo === undefined || fieldInfo === null) {
      return MySQLColumnType.UNKNOWN;
    }
    const numOfType = fieldInfo.type.valueOf();
    const numOfLength = fieldInfo.length || fieldInfo['columnLength'];
    const flags = fieldInfo.flags;
    switch (numOfType) {
      case 252:
        if (flags === 144) {
          if (numOfLength === 4294967295) {
            return MySQLColumnType.LONGBLOB;
          } else if (numOfLength === 16777215) {
            return MySQLColumnType.MEDIUMBLOB;
          } else if (numOfLength === 65535) {
            return MySQLColumnType.BLOB;
          }
          if (numOfLength === 262140) {
            // Default type
            return MySQLColumnType.UNKNOWN;
          }
        } else {
          if (
            numOfLength === 4294967295 ||
            numOfLength === 589815 ||
            numOfLength === 589779
          ) {
            // flags:17, (length: 589815 | 589779) information_schema.COLUMNS.GENERATION_EXPRESSION => longtext
            return MySQLColumnType.LONGTEXT;
          } else if (numOfLength === 50331645) {
            return MySQLColumnType.MEDIUMTEXT;
          } else if (numOfLength === 196605) {
            return MySQLColumnType.TEXT;
          } else if (numOfLength === 765) {
            return MySQLColumnType.TINYTEXT;
          }
        }
        console.error(`L83 can't parse from `, fieldInfo);
        return MySQLColumnType.UNKNOWN;
      case 254:
        if (flags === 128) {
          return MySQLColumnType.BINARY;
        }
        return MySQLColumnType.CHAR;
      default:
        break;
    }
    const e = EnumValues.getNamesAndValues(MySQLColumnType).find(
      (a) => a.value === numOfType,
    );
    if (e) {
      return e.value as number;
    }
    // console.error(`can't parse from `, fieldInfo);
    return MySQLColumnType.UNKNOWN;
  }

  export function parse(s: number | string | undefined) {
    if (s === undefined || s === null) {
      return MySQLColumnType.UNKNOWN;
    }
    if (typeof s === 'number') {
      if (EnumValues.getNameFromValue(MySQLColumnType, s) === null) {
        return MySQLColumnType.UNKNOWN;
      }
      return s;
    }
    s = s.toUpperCase();
    if ('CHAR' === s || 'CHARACTER' === s) {
      return MySQLColumnType.CHAR;
    } else if ('INT' === s) {
      return MySQLColumnType.INTEGER;
    } else if ('POLYGON' === s) {
      return MySQLColumnType.POINT;
    } else if ('DOUBLE' === s) {
      return MySQLColumnType.REAL;
    } else if ('LONGLONG' === s) {
      return MySQLColumnType.BIGINT;
    }
    const e = EnumValues.getNamesAndValues(MySQLColumnType).find(
      (a) => a.name === s,
    );
    if (e) {
      return e.value;
    }
    // console.error(`can't parse from `, s, typeof s);
    return MySQLColumnType.UNKNOWN;
  }
}
