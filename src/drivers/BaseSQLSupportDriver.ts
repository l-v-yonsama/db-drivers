import { ResultSetData } from '@l-v-yonsama/rdh';
import { ConnectionSetting, QueryParams, SQLLang } from '../types';
import { DbDatabase, SchemaAndTableName } from '../resource';
import { BaseDriver } from './BaseDriver';

export abstract class BaseSQLSupportDriver<
  T extends DbDatabase = DbDatabase,
> extends BaseDriver<T> {
  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  abstract isPositionedParameterAvailable(): boolean;

  abstract getPositionalCharacter(): string | undefined;

  abstract isSchemaSpecificationSvailable(): boolean;

  abstract isLimitAsTop(): boolean;

  abstract getSqlLang(): SQLLang;

  abstract requestSql(params: QueryParams): Promise<ResultSetData>;

  abstract explainSql(params: QueryParams): Promise<ResultSetData>;

  abstract explainAnalyzeSql(params: QueryParams): Promise<ResultSetData>;

  abstract count(params: SchemaAndTableName): Promise<number | undefined>;

  abstract countSql(params: QueryParams): Promise<number | undefined>;

  /**
   * Terminate (kill) a specific session.
   * If sesssionOrPid is not specified, cancel the running request.
   * @param sesssionOrPid
   */
  abstract kill(sesssionOrPid?: number): Promise<string>;
}
