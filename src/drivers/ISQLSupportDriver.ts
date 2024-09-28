import { ResultSetData } from '@l-v-yonsama/rdh';
import { QueryParams } from '../types';
import { SchemaAndTableName } from '../resource';
import { RDSBaseDriver } from './RDSBaseDriver';
import { AwsDriver } from './AwsDriver';

export interface ISQLSupportDriver {
  isPositionedParameterAvailable(): boolean;

  getPositionalCharacter(): string | undefined;

  isSchemaSpecificationSvailable(): boolean;

  isLimitAsTop(): boolean;

  requestSql(params: QueryParams): Promise<ResultSetData>;

  explainSql(params: QueryParams): Promise<ResultSetData>;

  explainAnalyzeSql(params: QueryParams): Promise<ResultSetData>;

  count(params: SchemaAndTableName): Promise<number | undefined>;

  countSql(params: QueryParams): Promise<number | undefined>;

  kill(sesssionOrPid?: number): Promise<string>;
}

export function isISQLSupportDriver(
  value: unknown,
): value is ISQLSupportDriver {
  if (!value) {
    return false;
  }
  if (value instanceof RDSBaseDriver || value instanceof AwsDriver) {
    return true;
  }
  return false;
}
