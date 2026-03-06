import { ResultSetData } from '@l-v-yonsama/rdh';

export type LogEvent = {
  lineNo: number;
  timestamp?: string;
  thread?: string;
  level?: string;
  logger?: string;
  message: string;
  fields?: Record<string, string>;
};

export const OPTIONAL_LOG_EVENT_KEYS = [
  'timestamp',
  'thread',
  'level',
  'logger',
] as const;

export type LogEventPartBrace = '(' | '[';

type BuiltInPattern =
  | 'ISO8601_TIMESTAMP'
  | 'INT'
  | 'NUMBER'
  | 'LEVEL'
  | 'LOGGER'
  | 'WORD'
  | 'DATA'
  | 'GREEDY_DATA'
  | 'GREEDY_MULTILINE';

type LogEventFieldBase = {
  name: string;
  arround?: LogEventPartBrace;
  eventStartMarker: boolean;
};

type LogEventFieldCustom = LogEventFieldBase & {
  type: 'custom';
  pattern: string;
};

type LogEventFieldDelimiter = LogEventFieldBase & {
  type: 'delimiter';
  pattern: string;
};

type LogEventFieldBuiltIn = LogEventFieldBase & {
  type: 'built-in';
  pattern: BuiltInPattern;
};

export type CreateLogEventPatternParams = {
  fields: LogEventField[];
  onlyStartMarker?: boolean;
  targetForHuman?: boolean;
};

export type LogEventField =
  | LogEventFieldCustom
  | LogEventFieldDelimiter
  | LogEventFieldBuiltIn;

export type LogEventSplitConfig = {
  fields: LogEventField[];
};

export type ExtractSqlConfig =
  | {
      pattern: 'logger';
      loggerPattern: RegExp;
    }
  | {
      pattern: 'messagePrefix';
      startSqlPattern: RegExp;
      parametersPattern?: RegExp;
      totalPattern?: RegExp;
      endSqlPattern?: RegExp;
    };

export type LogParseConfig = {
  split: LogEventSplitConfig;
  extractSql: ExtractSqlConfig;
  logExample: string;
};

export type SqlLogEvent = {
  lineNo: number;
  timestamp?: string;
  rawSql: string;
  rawParams?: string;
  normalizedSql: string;
  total?: number;
  type: string;
  schema?: string;
  table?: string;
  index?: string;
  errorMessage?: string;
};

export type ExtractedSqlResult = {
  ok: boolean;
  error?: string;
  logEvents: LogEvent[];
  sqlEvents: SqlLogEvent[];
};

export type ExtractedSqlRdhResult = {
  logEvents: ResultSetData;
  sqlEvents: ResultSetData;
};
