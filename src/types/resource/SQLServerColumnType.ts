import { EnumValues } from 'enum-values';
import { ResultColumn } from '../drivers';
import {
  BigInt as msBigInt,
  Bit,
  Date as msDate,
  DateTime,
  DateTime2,
  DateTimeOffset,
  Decimal,
  Float,
  ISqlType,
  Int,
  Money,
  NVarChar,
  Numeric,
  Real,
  SmallDateTime,
  SmallInt,
  SmallMoney,
  Text,
  Time,
  TinyInt,
  UniqueIdentifier,
  VarChar,
  Binary,
  VarBinary,
  Image,
  Xml,
  Char,
  NChar,
  NText,
  TVP,
  UDT,
  Geography,
  Geometry,
  Variant,
} from 'mssql';

export enum SQLServerColumnType {
  VARCHAR,
  NVARCHAR,
  TEXT,
  INT,
  BIGINT,
  TINYINT,
  SMALLINT,
  BIT,
  FLOAT,
  NUMERIC,
  DECIMAL,
  REAL,
  DATE,
  DATETIME,
  DATETIME2,
  TIMESTAMP,
  DATETIMEOFFSET,
  SMALLDATETIME,
  TIME,
  UNIQUEIDENTIFIER,
  SMALLMONEY,
  MONEY,
  BINARY,
  VARBINARY,
  IMAGE,
  XML,
  CHAR,
  NCHAR,
  NTEXT,
  TVP,
  UDT,
  GEOGRAPHY,
  GEOMETRY,
  VARIANT,
  UNKNOWN,
}

export namespace SQLServerColumnType {
  export function parseByFieldInfo(fieldInfo: ResultColumn): number {
    if (fieldInfo === undefined || fieldInfo === null) {
      return SQLServerColumnType.UNKNOWN;
    }

    let colTypeWrapper: ISqlType;
    if (fieldInfo.type && typeof fieldInfo.type === 'function') {
      colTypeWrapper = fieldInfo.type();
    } else {
      colTypeWrapper = fieldInfo.type as ISqlType;
    }

    // console.log(fieldInfo.name, 'colTypeWrapper=', colTypeWrapper);
    // console.log('colTypeWrapper typeof =', typeof colTypeWrapper);
    // console.log('colTypeWrapper isArray =', Array.isArray(colTypeWrapper));

    switch (colTypeWrapper.type) {
      case VarChar:
        return SQLServerColumnType.VARCHAR;
      case NVarChar:
        return SQLServerColumnType.NVARCHAR;
      case Text:
        return SQLServerColumnType.TEXT;
      case Int:
        return SQLServerColumnType.INT;
      case msBigInt:
        return SQLServerColumnType.BIGINT;
      case TinyInt:
        return SQLServerColumnType.TINYINT;
      case SmallInt:
        return SQLServerColumnType.SMALLINT;
      case Bit:
        return SQLServerColumnType.BIT;
      case Float:
        return SQLServerColumnType.FLOAT;
      case Numeric:
        return SQLServerColumnType.NUMERIC;
      case Decimal:
        return SQLServerColumnType.DECIMAL;
      case Real:
        return SQLServerColumnType.REAL;
      case msDate:
        return SQLServerColumnType.DATE;
      case DateTime:
        return SQLServerColumnType.DATETIME;
      case DateTime2:
        return SQLServerColumnType.DATETIME2;
      case DateTimeOffset:
        return SQLServerColumnType.DATETIMEOFFSET;
      case SmallDateTime:
        return SQLServerColumnType.SMALLDATETIME;
      case Time:
        return SQLServerColumnType.TIME;
      case UniqueIdentifier:
        return SQLServerColumnType.UNIQUEIDENTIFIER;
      case SmallMoney:
        return SQLServerColumnType.SMALLMONEY;
      case Money:
        return SQLServerColumnType.MONEY;
      case Binary:
        return SQLServerColumnType.BINARY;
      case VarBinary:
        return SQLServerColumnType.VARBINARY;
      case Image:
        return SQLServerColumnType.IMAGE;
      case Xml:
        return SQLServerColumnType.XML;
      case Char:
        return SQLServerColumnType.CHAR;
      case NChar:
        return SQLServerColumnType.NCHAR;
      case NText:
        return SQLServerColumnType.NTEXT;
      case TVP:
        return SQLServerColumnType.TVP;
      case UDT:
        return SQLServerColumnType.UDT;
      case Geography:
        return SQLServerColumnType.GEOGRAPHY;
      case Geometry:
        return SQLServerColumnType.GEOMETRY;
      case Variant:
        return SQLServerColumnType.VARIANT;
    }
    console.error(`can't parse from `, fieldInfo);
    return SQLServerColumnType.UNKNOWN;
  }

  export function parse(s: number | string | undefined): SQLServerColumnType {
    if (s === undefined || s === null) {
      return SQLServerColumnType.UNKNOWN;
    }
    if (typeof s === 'number') {
      if (EnumValues.getNameFromValue(SQLServerColumnType, s) === null) {
        return SQLServerColumnType.UNKNOWN;
      }
      return s;
    }
    s = s.toUpperCase();

    // if ('TIMESTAMP' === s) {
    //   return SQLServerColumnType.DATETIME;
    // }

    const e = EnumValues.getNamesAndValues(SQLServerColumnType).find(
      (a) => a.name === s,
    );
    if (e) {
      return e.value as SQLServerColumnType;
    }
    console.error(`can't parse from `, s, typeof s);
    return SQLServerColumnType.UNKNOWN;
  }
}
