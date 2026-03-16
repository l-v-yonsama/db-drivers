import { ResultSetData } from '@l-v-yonsama/rdh';

export type SpligLogText = {
  lineNo: number;
  text: string;
};

export type LogEvent = {
  lineNo: number;
  timestamp?: string;
  thread?: string;
  level?: string;
  logger?: string;
  message: string;
  messageSeq: number;
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
  | 'ISO8601_STRICT'
  | 'ISO8601_LENIENT'
  | 'JUL_TIMESTAMP'
  | 'SLASH_TIMESTAMP'
  | 'EPOCH_TIMESTAMP'
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
  enclosure?: LogEventFieldEnclosure;
  eventStartMarker: boolean;
};

type LogEventFieldRegex = LogEventFieldBase & {
  name: string;
  type: 'regex';
  pattern: string;
};

type LogEventFieldLiteral = LogEventFieldBase & {
  type: 'literal';
  pattern: string;
};

type LogEventFieldLineBreakLiteral = LogEventFieldBase & {
  type: 'line-break-literal';
};

type LogEventFieldBuiltin = LogEventFieldBase & {
  name: string;
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
  | LogEventFieldLineBreakLiteral
  | LogEventFieldBuiltin;

export type LogEventSplitConfig = {
  fields: LogEventField[];
};

/* ============================
   classify
============================ */

export type LogEventType =
  // connection / datasource
  | 'DATA_SOURCE'
  | 'CONN_AUTOCOMMIT'
  | 'CONN_TRANSACTIONAL'

  // transaction lifecycle
  | 'TX_BEGIN'
  | 'TX_COMMIT'
  | 'TX_ROLLBACK'

  // optional
  | 'TX_METHOD_ENTER'
  | 'TX_METHOD_EXIT'

  // SQL
  | 'SQL_START'
  | 'SQL_PARAMS'
  | 'SQL_COLUMNS'
  | 'SQL_ROW'
  | 'SQL_RESULT'
  | 'SQL_SINGLE'
  | 'DDL'
  | 'NORMAL'
  | 'ERROR';

export type LogTransformRule = {
  pattern: string;
  replace: string;
};

export type LogContextRule = {
  contextName: string;
  eventFieldName?: string;
  pattern: string;
  replace: string;
};

export type LogClassifierRule = {
  type: LogEventType;
  field?: string;
  patternType: 'literal' | 'regex';
  pattern: string;
  transform?: LogTransformRule;
  context?: readonly LogContextRule[];
  expandMessage?: boolean;
};

export type ClassifiedEvent = LogEvent & {
  eventType: LogEventType;
  transformed?: string;
  eventContext?: Record<string, string>;
};

/* ============================
   extractor state machine
============================ */

export type ExtractorStepAction =
  | 'captureSql'
  | 'captureParams'
  | 'captureColumns'
  | 'captureRow'
  | 'captureResult'
  | 'captureError'
  | 'captureField';

export type ExtractorStep = {
  type: LogEventType;
  action?: ExtractorStepAction;
  field?: keyof SqlExecutionEvent;
  optional?: boolean;
};

export type ExtractorConfig = {
  name: string;
  start: LogEventType;
  steps: readonly ExtractorStep[];
  framework?: string;
};

// SQL Execution Builder

export type SqlFragmentType =
  | 'SQL'
  | 'PARAMS'
  | 'COLUMNS'
  | 'ROW'
  | 'RESULT'
  | 'ERROR'
  | 'SQL_SINGLE';

export type SqlFragment = {
  lineNo: number;
  messageSeq: number;
  timestamp?: string;
  thread?: string;
  type: SqlFragmentType;
  value: string;
  daoClass?: string;
  daoMethod?: string;
};

export type SqlExecutionEvent = {
  startLine: number;
  endLine: number;

  timestamp?: string;
  thread?: string;
  framework?: string;
  sql?: string;
  params?: string;
  result?: string;
  normalizedSql?: string;
  type?: string;
  schema?: string;
  table?: string;
  index?: string;

  error?: string;
  daoClass?: string;
  daoMethod?: string;
};

export type SqlExecutionBuilderState = 'idle' | 'collecting';

export type SqlExecutionBuilder = {
  state: SqlExecutionBuilderState;
  current?: SqlExecutionEvent;
};

/* ============================
   main config
============================ */

export type LogParseConfig = {
  split: LogEventSplitConfig;
  classify: readonly LogClassifierRule[];
  extractors: readonly ExtractorConfig[];
};

export type LogParseStage = 'split' | 'classify' | 'extract' | 'sqlExecution';

export type LogParseParams = {
  logText: string;
  stage?: LogParseStage;
  debug?: boolean;
};

/* ============================
   SQL result
============================ */

// export type SqlLogEvent = {
//   lineNo: number;
//   timestamp?: string;
//   rawSql: string;
//   rawParams?: string;
//   normalizedSql: string;
//   result?: string;
//   type: string;
//   schema?: string;
//   table?: string;
//   index?: string;
//   errorMessage?: string;
// };

export type ExtractedSqlResult = {
  ok: boolean;
  error?: string;
  stage: LogParseStage;
  logEvents: ClassifiedEvent[];
  sqlFragments?: SqlFragment[];
  sqlExecutions: SqlExecutionEvent[];
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
