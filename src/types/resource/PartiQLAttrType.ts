import { GeneralColumnType } from '@l-v-yonsama/rdh';

export const parseDynamoAttrType = (typeString: string): GeneralColumnType => {
  if (typeString == null || typeString === '') {
    return GeneralColumnType.UNKNOWN;
  }
  if ('S' === typeString) {
    return GeneralColumnType.TEXT;
  } else if ('N' === typeString) {
    return GeneralColumnType.NUMERIC;
  } else if ('B' === typeString) {
    return GeneralColumnType.BINARY;
  } else if (
    'SS' === typeString ||
    'NS' === typeString ||
    'BS' === typeString
  ) {
    return GeneralColumnType.SET;
  } else if ('M' === typeString) {
    return GeneralColumnType.JSON;
  } else if ('L' === typeString) {
    return GeneralColumnType.ARRAY;
  } else if ('NULL' === typeString) {
    return GeneralColumnType.NULL;
  } else if ('BOOL' === typeString) {
    return GeneralColumnType.BOOLEAN;
  }
  return GeneralColumnType.UNKNOWN;
};