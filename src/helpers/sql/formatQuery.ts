import { format, FormatOptionsWithLanguage, SqlLanguage } from 'sql-formatter';
import { DBType } from '../../types';

const DEFAULT_FORMAT_OPTIONS: FormatOptionsWithLanguage = {
  language: 'mysql',

  tabWidth: 2,
  useTabs: false,

  keywordCase: 'upper',
  identifierCase: 'preserve',
  dataTypeCase: 'upper',
  functionCase: 'upper',

  indentStyle: 'standard',
  logicalOperatorNewline: 'before',
  expressionWidth: 120,

  linesBetweenQueries: 1,
  denseOperators: false,
  newlineBeforeSemicolon: false,
};

const DBTypeToSqlLanguageMap: Record<DBType, SqlLanguage> = {
  MySQL: 'mysql',
  Postgres: 'postgresql',
  SQLServer: 'transactsql', // tsqlの実体
  SQLite: 'sqlite',
  Oracle: 'plsql',
  // 以下、SQLじゃないのでフォールバック
  Redis: 'mysql',
  Memcache: 'mysql',
  Keycloak: 'mysql',
  Auth0: 'mysql',
  Aws: 'mysql',
  Mqtt: 'mysql',
} as const;

export const getSqlLanguage = (dbType: DBType): SqlLanguage => {
  return DBTypeToSqlLanguageMap[dbType];
};

export const formatQuery = (
  query: string,
  cfg?: Partial<FormatOptionsWithLanguage> & {
    // dbType is used to resolve SQL dialect (language) if not explicitly provided
    dbType?: DBType;
  },
): string => {
  const { dbType, language, ...rest } = cfg ?? {};

  const resolvedLanguage: SqlLanguage | undefined =
    language ?? (dbType ? getSqlLanguage(dbType) : undefined);

  const merged: FormatOptionsWithLanguage = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...rest,
    ...(resolvedLanguage ? { language: resolvedLanguage } : {}),
  };

  return format(query, merged);
};
