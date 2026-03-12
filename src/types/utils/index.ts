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

export type LogEventFieldEnclosure = '()' | '[]';

export type BuiltInPattern =
  | 'ISO8601_TIMESTAMP'
  | 'INT'
  | 'NUMBER'
  | 'LEVEL'
  | 'LOGGER'
  | 'WORD'
  | 'DATA'
  | 'GREEDY_DATA'
  | 'GREEDY_MULTILINE';

export type LogFieldPatternDefinition = {
  type: BuiltInPattern;
  label: string;
  pattern: string;
  description: string;
  example?: string;
};

type LogEventFieldBase = {
  name: string;
  enclosure?: LogEventFieldEnclosure;
  eventStartMarker: boolean;
};

type LogEventFieldRegex = LogEventFieldBase & {
  type: 'regex';
  pattern: string;
};

type LogEventFieldLiteral = LogEventFieldBase & {
  type: 'literal';
  pattern: string;
};

type LogEventFieldBuiltin = LogEventFieldBase & {
  type: 'builtin';
  pattern: BuiltInPattern;
};

export type CreateLogEventPatternParams = {
  fields: LogEventField[];
  onlyStartMarker?: boolean;
  targetForHuman?: boolean;
};

export type LogEventField =
  | LogEventFieldRegex
  | LogEventFieldLiteral
  | LogEventFieldBuiltin;

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
  patternType: 'literal' | 'regex';
  pattern: string;
  replace: string;
};

export type LogClassifierRule = {
  type: LogEventType;
  field?: string;
  patternType: 'literal' | 'regex';
  pattern: string;
  transform?: readonly LogTransformRule[];
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
  steps: readonly ExtractorStep[];
};

/* ============================
   main config
============================ */

export type LogParseConfig = {
  split: LogEventSplitConfig;
  classify: readonly LogClassifierRule[];
  extractors: readonly ExtractorConfig[];
};

export type LogParseStage = 'split' | 'classify' | 'extract'; // default

export type LogParseParams = {
  logText: string;
  stage?: LogParseStage;
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
  stage: LogParseStage;
  logEvents: ClassifiedEvent[];
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
