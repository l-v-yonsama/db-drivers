import {
  LogEventSplitConfig,
  LogFieldPatternDefinition,
  LogParseConfig,
} from '../../../types';

/* ======================================================
   Timestamp patterns
====================================================== */

// 日付（YYYY-MM-DD）
const ISO_DATE = '\\d{4}-\\d{2}-\\d{2}';

// STRICT
// HH:mm[:ss][.fraction]
const ISO_TIME_STRICT = '\\d{2}:\\d{2}' + '(:\\d{2})?' + '(\\.\\d+)?';

// LENIENT
// HH:mm[:ss][.fraction] or [,fraction]
const ISO_TIME_LENIENT = '\\d{2}:\\d{2}' + '(:\\d{2})?' + '([.,]\\d+)?';

// タイムゾーン（Z or +09:00 or +0900）
const ISO_TZ = '(Z|[+-]\\d{2}:?\\d{2})?';

// STRICT
const ISO_DATE_TIME_STRICT = ISO_DATE + '[T ]' + ISO_TIME_STRICT + ISO_TZ;

// LENIENT
const ISO_DATE_TIME_LENIENT = ISO_DATE + '[T ]' + ISO_TIME_LENIENT + ISO_TZ;

// 時刻のみ
const ISO_TIME_ONLY_STRICT = ISO_TIME_STRICT;
const ISO_TIME_ONLY_LENIENT = ISO_TIME_LENIENT;

/* ======================================================
   LOG LEVEL
====================================================== */

const LOG_LEVELS = [
  'trace',
  'debug',
  'info',
  'warn',
  'warning',
  'error',
  'fatal',
  'severe',
];

/* ======================================================
   Built-in field patterns
====================================================== */

export const LOG_FIELD_PATTERNS = {
  LEVEL: {
    type: 'LEVEL',
    label: 'Log level',
    pattern: `(?:${LOG_LEVELS.join('|')})`,
    description:
      'Common log levels such as trace, debug, info, warn, error, fatal.',
    example: 'INFO',
  },
  ISO8601_STRICT: {
    type: 'ISO8601_STRICT',
    label: 'ISO8601 timestamp (strict)',
    pattern: '(?:' + ISO_DATE_TIME_STRICT + '|' + ISO_TIME_ONLY_STRICT + ')',
    description: 'Strict ISO8601 timestamp using "." for milliseconds.',
    example: '2025-01-01 10:11:22.333',
  },
  ISO8601_LENIENT: {
    type: 'ISO8601_LENIENT',
    label: 'ISO8601 timestamp (lenient)',
    pattern: '(?:' + ISO_DATE_TIME_LENIENT + '|' + ISO_TIME_ONLY_LENIENT + ')',
    description:
      'Lenient ISO8601-like timestamp allowing "." or "," for milliseconds.',
    example: '2025-01-01 10:11:22,333',
  },
  JUL_TIMESTAMP: {
    type: 'JUL_TIMESTAMP',
    label: 'Java Util Logging timestamp',
    pattern:
      '[A-Z][a-z]{2}\\s+\\d{1,2},\\s+\\d{4}\\s+\\d{2}:\\d{2}:\\d{2}\\s+(AM|PM)',
    description: 'Timestamp used by java.util.logging SimpleFormatter.',
    example: 'Mar 12, 2026 10:11:22 AM',
  },
  SLASH_TIMESTAMP: {
    type: 'SLASH_TIMESTAMP',
    label: 'Slash separated timestamp (legacy log4j / Seasar style)',
    pattern: '\\d{4}\\/\\d{1,2}\\/\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2}\\s+\\d{3,6}',
    description:
      'Timestamp using slash date and space separated milliseconds. Often seen in legacy log4j layouts and Seasar applications.',
    example: '1999/01/01 14:52:34 0502',
  },
  EPOCH_TIMESTAMP: {
    type: 'EPOCH_TIMESTAMP',
    label: 'Unix epoch timestamp (milliseconds)',
    pattern: '\\d{13}',
    description:
      'Unix epoch timestamp in milliseconds since 1970-01-01 UTC. Common in cloud and structured logs.',
    example: '1710241882000',
  },

  LOGGER: {
    type: 'LOGGER',
    label: 'Logger name',
    pattern: '[a-zA-Z0-9_.$:/-]+',
    description: 'Typical logger or class name.',
    example: 'org.example.service.UserService',
  },

  INT: {
    type: 'INT',
    label: 'Integer',
    pattern: '[+-]?\\d+',
    description: 'Signed integer number.',
    example: '42',
  },

  NUMBER: {
    type: 'NUMBER',
    label: 'Number',
    pattern: '[+-]?\\d+(\\.\\d+)?',
    description: 'Integer or decimal number.',
    example: '3.14',
  },

  WORD: {
    type: 'WORD',
    label: 'Word',
    pattern: '\\b\\w+\\b',
    description: 'Single word consisting of letters, digits or underscore.',
    example: 'Thread-1',
  },

  DATA: {
    type: 'DATA',
    label: 'Data',
    pattern: `[^\\s]+`,
    description: 'Single field (until whitespace)',
    example: '%{Hello}%',
  },
  GREEDY_DATA: {
    type: 'GREEDY_DATA',
    label: 'Greedy data',
    pattern: '.*',
    description: 'Any characters except newline.',
    example: 'Full log message',
  },
  GREEDY_MULTILINE: {
    type: 'GREEDY_MULTILINE',
    label: 'Greedy multiline',
    pattern: '[\\s\\S]*',
    description: 'Matches any characters including line breaks.',
    example: 'Full log message<Line breaks>  next line message',
  },
} satisfies Record<string, LogFieldPatternDefinition>;

/* ======================================================
   Default split configs
====================================================== */
const DEFAULT_SIMPLE_LOG_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'ISO8601_STRICT',
      eventStartMarker: true,
    },
    {
      name: 'message',
      type: 'builtin',
      pattern: 'GREEDY_MULTILINE',
      eventStartMarker: false,
    },
  ],
};

export const SIMPLE_LOG_PARSE_CONFIG: LogParseConfig = {
  split: DEFAULT_SIMPLE_LOG_SPLIT_CONFIG,
  classify: [],
  extractors: [],
};
