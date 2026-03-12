import {
  LogEventSplitConfig,
  LogFieldPatternDefinition,
  LogParseConfig,
} from '../types';

/* ======================================================
   Timestamp patterns
====================================================== */

// 日付（YYYY-MM-DD）
const ISO_DATE = '\\d{4}-\\d{2}-\\d{2}';

// 時刻（HH:mm[:ss][.fraction]）
const ISO_TIME = '\\d{2}:\\d{2}' + '(:\\d{2})?' + '(\\.\\d+)?';

// タイムゾーン（Z or +09:00 or +0900）
const ISO_TZ = '(Z|[+-]\\d{2}:?\\d{2})?';

// 日付＋時刻
const ISO_DATE_TIME = ISO_DATE + '[T ]' + ISO_TIME + ISO_TZ;

// 時刻のみ
const ISO_TIME_ONLY = ISO_TIME;

const S2_TIMESTAMP = '\\d{4}/\\d{2}/\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\s+\\d{4}';

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
    pattern: `(${LOG_LEVELS.join('|')})\\s*`,
    description:
      'Common log levels such as trace, debug, info, warn, error, fatal.',
    example: 'INFO',
  },

  ISO8601_TIMESTAMP: {
    type: 'ISO8601_TIMESTAMP',
    label: 'ISO8601 timestamp',
    pattern: '(' + ISO_DATE_TIME + '|' + ISO_TIME_ONLY + ')',
    description: 'Timestamp in ISO8601 format (date and time).',
    example: '2025-01-01 10:11:22.333',
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
      pattern: 'ISO8601_TIMESTAMP',
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

const DEFAULT_MYBATIS_LOG_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'ISO8601_TIMESTAMP',
      eventStartMarker: true,
    },
    {
      name: 'thread',
      type: 'builtin',
      pattern: 'DATA',
      eventStartMarker: false,
      enclosure: '[]',
    },
    {
      name: 'level',
      type: 'builtin',
      pattern: 'LEVEL',
      eventStartMarker: false,
    },
    {
      name: 'logger',
      type: 'builtin',
      pattern: 'DATA',
      eventStartMarker: false,
    },
    {
      name: 'literal_1',
      type: 'literal',
      pattern: '-',
      eventStartMarker: false,
    },
    {
      name: 'message',
      type: 'builtin',
      pattern: 'GREEDY_MULTILINE',
      eventStartMarker: false,
    },
  ],
};

const DEFAULT_S2JDBC_LOG_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'regex',
      pattern: S2_TIMESTAMP,
      eventStartMarker: true,
      enclosure: '[]',
    },
    {
      name: 'level',
      type: 'builtin',
      pattern: 'LEVEL',
      eventStartMarker: false,
      enclosure: '[]',
    },
    {
      name: 'thread',
      type: 'builtin',
      pattern: 'DATA',
      eventStartMarker: false,
      enclosure: '[]',
    },
    {
      name: 'logNo',
      type: 'builtin',
      pattern: 'INT',
      eventStartMarker: false,
      enclosure: '[]',
    },
    {
      name: 'logger',
      type: 'builtin',
      pattern: 'LOGGER',
      eventStartMarker: false,
    },
    {
      name: 'literal_1',
      type: 'literal',
      pattern: '-',
      eventStartMarker: false,
    },
    {
      name: 'message',
      type: 'builtin',
      pattern: 'GREEDY_MULTILINE',
      eventStartMarker: false,
    },
  ],
};

/* ======================================================
   PRESETS
====================================================== */

export const LOG_PARSE_CONFIG_PRESETS = {
  /* ======================================================
     MyBatis
  ====================================================== */

  MyBatis: {
    split: DEFAULT_MYBATIS_LOG_SPLIT_CONFIG,

    classify: [
      {
        type: 'SQL_START',
        patternType: 'regex',
        pattern: '^==>\\s+Preparing:',
        transform: [
          {
            patternType: 'regex',
            pattern: '^==>\\s+Preparing:\\s*',
            replace: '',
          },
        ],
      },
      {
        type: 'SQL_PARAMS',
        patternType: 'regex',
        pattern: '^==>\\s+Parameters:',
        transform: [
          {
            patternType: 'regex',
            pattern: '^==>\\s+Parameters:\\s*',
            replace: '',
          },
        ],
      },
      {
        type: 'SQL_RESULT',
        patternType: 'regex',
        pattern: '^<==\\s+(Total|Updates):',
        transform: [
          {
            patternType: 'regex',
            pattern: '^<==\\s+(?:Total|Updates):\\s*',
            replace: '',
          },
        ],
      },
    ],

    extractors: [
      {
        name: 'mybatis',

        start: 'SQL_START',

        steps: [
          {
            type: 'SQL_START',
            action: 'captureSql',
          },
          {
            type: 'SQL_PARAMS',
            action: 'captureParams',
            optional: true,
          },
          {
            type: 'SQL_RESULT',
            action: 'captureField',
            field: 'result',
          },
        ],
      },
    ],

    logExample: `10:11:22.333 [http-nio-8080-exec-1] DEBUG test.EmpMapper.updateXxx - ==>  Preparing: UPDATE EMP SET NAME = ?, DEPT_NO = ? WHERE ID = ?
10:11:22.444 [http-nio-8080-exec-1] DEBUG test.EmpMapper.updateXxx - ==> Parameters: YAMADA(String), 200((Integer), 1((Integer)
10:11:22.555 [http-nio-8080-exec-1] DEBUG test.EmpMapper.updateXxx - <==  Updates: 1`,
  },

  /* ======================================================
     Seasar2 S2JDBC
  ====================================================== */

  S2Jdbc: {
    split: DEFAULT_S2JDBC_LOG_SPLIT_CONFIG,

    classify: [
      {
        type: 'SQL_SINGLE',
        field: 'logger',
        patternType: 'regex',
        pattern:
          '^query\\.(Auto|SqlFile)(Batch)?(Select|Insert|Update|Delete)Impl$',
      },
    ],

    extractors: [
      {
        name: 's2jdbc',

        start: 'SQL_SINGLE',

        steps: [
          {
            type: 'SQL_SINGLE',
            action: 'captureSql',
          },
        ],
      },
    ],

    logExample: `[1999/01/01 14:52:34 0502] [DEBUG] [ajp-nio-0.0.0.0-8009-exec-1] [30] jta.LogTestActionImpl - Begin LogTestAction.tx=[fid=00, gid=00/186hId=]
[1999/01/01 14:52:34 0503] [DEBUG] [ajp-nio-0.0.0.0-8009-exec-1] [30] query.SqlFileUpdateImpl - UPDATE EMP
SET
  NAME = 'YAMADA', 
  DEPT_NO = 200
WHERE ID = 1
[1999/01/01 14:52:35 0111] [DEBUG] [ajp-nio-0.0.0.0-8009-exec-1] [30] jta.LogTestActionImpl - End LogTestAction.tx=[fid=00, gid=00/186hId=]`,
  },
} as const satisfies Record<string, LogParseConfig & { logExample: string }>;

export type LogParsePresetName = keyof typeof LOG_PARSE_CONFIG_PRESETS;

export const SIMPLE_LOG_PARSE_CONFIG: LogParseConfig = {
  split: DEFAULT_SIMPLE_LOG_SPLIT_CONFIG,
  classify: [],
  extractors: [],
};
