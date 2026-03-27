import { ResultSetData } from '@l-v-yonsama/rdh';
import { SqlLanguage } from 'sql-formatter';

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

export const BUILT_IN_PATTERNS = [
  'ISO8601_STRICT',
  'ISO8601_LENIENT',
  'JUL_TIMESTAMP',
  'SLASH_TIMESTAMP',
  'EPOCH_TIMESTAMP',
  'INT',
  'NUMBER',
  'LEVEL',
  'LOGGER',
  'WORD',
  'DATA',
  'GREEDY_DATA',
  'GREEDY_MULTILINE',
] as const;

export type BuiltInPattern = (typeof BUILT_IN_PATTERNS)[number];

export function isBuiltInPattern(value: string): value is BuiltInPattern {
  return (BUILT_IN_PATTERNS as readonly string[]).includes(value);
}

export type LogFieldPatternDefinition = {
  type: BuiltInPattern;
  label: string;
  pattern: string;
  description: string;
  example?: string;
};

/**
 * Common properties shared by all field types.
 */
type LogEventFieldBase = {
  /**
   * Optional enclosure characters around the field.
   */
  enclosure?: LogEventFieldEnclosure;

  /**
   * Indicates that this field marks the start of a log event.
   */
  eventStartMarker: boolean;
};

/**
 * Field parsed using a custom regular expression.
 */
type LogEventFieldRegex = LogEventFieldBase & {
  name: string;
  type: 'regex';
  pattern: string;
};

/**
 * Field representing a fixed literal string.
 */
type LogEventFieldLiteral = LogEventFieldBase & {
  type: 'literal';
  pattern: string;
};

/**
 * Field representing a line break in multiline logs.
 */
type LogEventFieldLineBreakLiteral = LogEventFieldBase & {
  type: 'line-break-literal';
};

/**
 * Field parsed using a built-in pattern.
 */
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

/**
 * Defines a single field in a log event.
 * Each field can be a regex, literal text, builtin pattern, or line-break marker.
 */
export type LogEventField =
  | LogEventFieldRegex
  | LogEventFieldLiteral
  | LogEventFieldLineBreakLiteral
  | LogEventFieldBuiltin;

/**
 * Defines how a log line should be split into structured fields.
 */
export type LogEventSplitConfig = {
  /**
   * Ordered list of field definitions used to parse a log line.
   */
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

  // ERRORS
  | 'ERROR'
  | 'FW_ERROR'
  | 'SQL_ERROR'
  | 'SQL_ERROR_DETAIL';

export type LogTransformRule = {
  pattern: string;
  replace: string;
  flags?: {
    dotAll?: boolean;
    multiline?: boolean;
  };
};

export type LogContextRule = {
  contextName: string;
  eventFieldName?: string;
  pattern: string;
  replace: string;
};

/**
 * Rule used to classify a log event into a semantic event type.
 */
export type LogClassifierRule = {
  /**
   * Target event type when the rule matches.
   */
  type: LogEventType;

  /**
   * Optional log event field to apply the rule to.
   */
  field?: string;

  /**
   * Regular expression used to detect the event.
   */
  pattern: string;

  /**
   * Optional transformation rule applied to the matched message.
   */
  transforms?: readonly LogTransformRule[];

  /**
   * Optional context extraction rules.
   */
  context?: readonly LogContextRule[];

  /**
   * Expands message to include following lines.
   */
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
  | 'captureErrorDetail'
  | 'captureField';

/**
 * Single step in the SQL extraction state machine.
 */
export type ExtractorStep = {
  /**
   * Event type that triggers this step.
   */
  type: LogEventType;

  /**
   * Action performed when the step is triggered.
   */
  action?: ExtractorStepAction;

  /**
   * Target field where extracted value will be stored.
   */
  field?: keyof SqlExecutionEvent;

  /**
   * Whether this step is optional.
   */
  optional?: boolean;
};

/**
 * Known SQL framework names used by built-in extractors.
 * Custom names are also allowed.
 */
export type FrameworkName =
  | 'Hibernate'
  | 'MyBatis'
  | 'S2Jdbc'
  | 'Doma'
  | 'SpringJdbc';

/**
 * SQL extractor definition using a simple state machine.
 */
export type ExtractorConfig = {
  /**
   * Unique name of the extractor.
   */
  name: string;

  /**
   * Event type that starts SQL extraction.
   */
  start: LogEventType;

  /**
   * Sequence of steps used to collect SQL fragments.
   */
  steps: readonly ExtractorStep[];

  /**
   * Optional framework name associated with the extractor.
   * Known frameworks will appear in IDE completion.
   */
  framework?: FrameworkName;
};

// SQL Execution Builder

export type SqlFragmentType =
  | 'SQL'
  | 'PARAMS'
  | 'COLUMNS'
  | 'ROW'
  | 'RESULT'
  | 'FW_ERROR'
  | 'SQL_ERROR'
  | 'SQL_ERROR_DETAIL'
  | 'SQL_SINGLE';

export type SqlFragment = {
  lineNo: number;
  messageSeq: number;
  timestamp?: string;
  thread?: string;
  framework?: FrameworkName;
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
  framework?: FrameworkName;
  sql?: string;
  params?: string[];
  result?: string;
  formattedSql?: string;
  type?: string;
  schema?: string;
  table?: string;
  daoClass?: string;
  daoMethod?: string;
  error?: string;
  errorDetail?: string;
};

export type SqlExecutionBuilderState = 'idle' | 'collecting';

export type SqlExecutionBuilder = {
  state: SqlExecutionBuilderState;
  current?: SqlExecutionEvent;
};

/* ============================
   main config
============================ */

/**
 * Root configuration for the log parser.
 * Defines how logs are split into events, classified, and converted into SQL executions.
 */
export type LogParseConfig = {
  /**
   * Configuration used to split raw log text into structured log events.
   */
  split: LogEventSplitConfig;

  /**
   * Rules used to classify log events into semantic event types.
   */
  classify: readonly LogClassifierRule[];

  /**
   * SQL extraction state machines used to build SQL execution events.
   */
  extractors: readonly ExtractorConfig[];
};

export type LogParseStage = 'split' | 'classify' | 'extract' | 'sqlExecution';

export type LogParseParams = {
  logText: string;
  stage?: LogParseStage;
  linesToParse?: number;
  language?: SqlLanguage;
  withSqlFragments?: boolean;
};

/* ============================
   SQL result
============================ */
export type LogParseInputSummary = {
  logEventSplitPattern: string;
  extractionSummary: string;
  classificationSummary: string;
};
/**
 * ログ解析結果の集計情報
 */
export type LogParseOutputSummary = {
  /**
   * eventTypeごとの件数
   * 例: { NORMAL: 100, SQL: 50, ERROR: 3 }
   */
  eventTypeCounts: Record<string, number>;

  /**
   * SQL実行タイプごとの件数
   * 例: { SELECT: 30, INSERT: 10, ERROR: 2 }
   */
  sqlExecutionTypeCounts: Record<string, number>;

  /**
   * 総ログイベント数
   */
  totalEvents: number;

  /**
   * SQL実行数
   */
  totalSqlExecutions: number;
};
export type ExtractedSqlResult = {
  ok: boolean;
  error?: string;
  stage: LogParseStage;
  logEvents: ClassifiedEvent[];
  sqlFragments?: SqlFragment[];
  sqlExecutions: SqlExecutionEvent[];
  inputSummary: LogParseInputSummary;
  /**
   * 集計情報（追加）
   */
  outputSummary: LogParseOutputSummary;
  /**
   * エラー率（%）
   */
  errorRate?: number;
  elapsedTimeMilli: {
    split: number;
    classification?: number;
    sqlExecutions?: number;
    total: number;
  };
};

export type ExtractedSqlRdhResult = {
  logEvents: ResultSetData;
  sqlEvents?: ResultSetData;
};

export type LogFormatDetectionResult = {
  presetNames: string[];
  confidence: number;
  scores: Record<string, number>;
};
