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

/* ============================
   classify
============================ */

export type LogEventType =
  | 'NORMAL'
  | 'SQL_START'
  | 'SQL_PARAMS'
  | 'SQL_RESULT'
  | 'SQL_SINGLE';

export type LogTransformRule = {
  pattern: RegExp;
  replace: string;
};

export type LogClassifierRule = {
  type: LogEventType;
  field?: 'message' | 'logger';
  pattern: RegExp;

  transform?: LogTransformRule[];
};

export type ClassifiedEvent = LogEvent & {
  eventType: LogEventType;
  transformed?: string;
};

/* ============================
   extractor state machine
============================ */

export type ExtractorStepAction =
  | 'captureSql'
  | 'captureParams'
  | 'captureField';

export type ExtractorStep = {
  type: LogEventType;
  action?: ExtractorStepAction;

  /** captureField 用 */
  field?: keyof SqlLogEvent;

  optional?: boolean;
};

export type ExtractorConfig = {
  name: string;
  start: LogEventType;
  steps: ExtractorStep[];
};

/* ============================
   main config
============================ */

export type LogParseConfig = {
  split: LogEventSplitConfig;
  classify: LogClassifierRule[];
  extractors: ExtractorConfig[];
  logExample: string;
  debug?: boolean;
};

/* ============================
   SQL result
============================ */

export type SqlLogEvent = {
  lineNo: number;
  timestamp?: string;
  rawSql: string;
  rawParams?: string;
  normalizedSql: string;
  result?: string;
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

export type LogFormatDetectionResult = {
  presetName?: string;
  confidence: number;
  scores: Record<string, number>;
};