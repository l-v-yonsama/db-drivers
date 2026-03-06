import { LogEventSplitConfig, LogParseConfig } from '../types';

// 日付（YYYY-MM-DD）
const ISO_DATE = '\\d{4}-\\d{2}-\\d{2}';

// 時刻（HH:mm[:ss][.fraction]）
const ISO_TIME = '\\d{2}:\\d{2}' + '(:\\d{2})?' + '(\\.\\d+)?';

// タイムゾーン（Z or +09:00 or +0900）
const ISO_TZ = '(Z|[+-]\\d{2}:?\\d{2})?';

// 日付＋時刻（T or space区切り）
const ISO_DATE_TIME = ISO_DATE + '[T ]' + ISO_TIME + ISO_TZ;

// 時刻のみ
const ISO_TIME_ONLY = ISO_TIME;

const S2_TIMESTAMP = '\\d{4}/\\d{2}/\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\s+\\d{4}';

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

export const LOG_FIELD_PATTERNS = {
  LEVEL: `(${LOG_LEVELS.join('|')})`,
  ISO8601: '(' + ISO_DATE_TIME + '|' + ISO_TIME_ONLY + ')',
  GENERAL_LOGGER: '[a-zA-Z0-9_.$:/-]+',
  WORD: `\\b\\w+\\b`,
  INT: `[+-]?\\d+`,
  NUMBER: `[+-]?\\d+(\\.\\d+)?`,
  GREEDY_MULTILINE: `[\\s\\S]*`,
} satisfies Record<string, string>;

const DEFAULT_MYBATIS_LOG_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'built-in',
      pattern: 'ISO8601_TIMESTAMP',
      eventStartMarker: true,
    },
    {
      name: 'thread',
      type: 'built-in',
      pattern: 'DATA',
      eventStartMarker: false,
      arround: '[',
    },
    {
      name: 'level',
      type: 'built-in',
      pattern: 'LEVEL',
      eventStartMarker: false,
    },
    {
      name: 'logger',
      type: 'built-in',
      pattern: 'DATA',
      eventStartMarker: false,
    },
    {
      name: 'delimiter_1',
      type: 'delimiter',
      pattern: '-',
      eventStartMarker: false,
    },
    {
      name: 'message',
      type: 'built-in',
      pattern: 'GREEDY_MULTILINE',
      eventStartMarker: false,
    },
  ],
};

const DEFAULT_S2JDBC_LOG_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'custom',
      pattern: S2_TIMESTAMP,
      eventStartMarker: true,
      arround: '[',
    },
    {
      name: 'level',
      type: 'built-in',
      pattern: 'LEVEL',
      eventStartMarker: false,
      arround: '[',
    },
    {
      name: 'thread',
      type: 'built-in',
      pattern: 'DATA',
      eventStartMarker: false,
      arround: '[',
    },
    {
      name: 'logNo',
      type: 'built-in',
      pattern: 'INT',
      eventStartMarker: false,
      arround: '[',
    },
    {
      name: 'logger',
      type: 'built-in',
      pattern: 'LOGGER',
      eventStartMarker: false,
    },
    {
      name: 'delimiter_1',
      type: 'delimiter',
      pattern: '-',
      eventStartMarker: false,
    },
    {
      name: 'message',
      type: 'built-in',
      pattern: 'GREEDY_MULTILINE',
      eventStartMarker: false,
    },
  ],
};

export const LOG_PARSE_CONFIG_PRESETS = {
  MyBatis: {
    split: DEFAULT_MYBATIS_LOG_SPLIT_CONFIG,
    extractSql: {
      pattern: 'messagePrefix',
      startSqlPattern: /^==>\s+Preparing:/,
      parametersPattern: /^==> Parameters:/,
      totalPattern: /^<==\s+(Total|Updates):\s+(\d+)/,
      endSqlPattern: /^<==\s+.+/,
    },
    logExample: `10:11:22.333 [http-nio-8080-exec-1] DEBUG test.EmpMapper.updateXxx - ==>  Preparing: UPDATE EMP SET NAME = ?, DEPT_NO = ? WHERE ID = ?
10:11:22.444 [http-nio-8080-exec-1] DEBUG test.EmpMapper.updateXxx - ==> Parameters: YAMADA(String), 200((Integer), 1((Integer)
10:11:22.555 [http-nio-8080-exec-1] DEBUG test.EmpMapper.updateXxx - <==  Updates: 1`,
  },
  S2Jdbc: {
    split: DEFAULT_S2JDBC_LOG_SPLIT_CONFIG,
    extractSql: {
      pattern: 'logger',
      loggerPattern: /^query\.(Auto|SqlFile)(Batch)?(Select|Insert|Update|Delete)Impl$/,
    },
    logExample: `[1999/01/01 14:52:34 0502] [DEBUG] [ajp-nio-0.0.0.0-8009-exec-1] [30] jta.LogTestActionImpl - Begin LogTestAction.tx=[fid=00, gid=00/186hId=]
[1999/01/01 14:52:34 0503] [DEBUG] [ajp-nio-0.0.0.0-8009-exec-1] [30] query.SqlFileUpdateImpl - UPDATE EMP
SET
  NAME = 'YAMADA', 
  DEPT_NO = 200
WHERE ID = 1
[1999/01/01 14:52:35 0111] [DEBUG] [ajp-nio-0.0.0.0-8009-exec-1] [30] jta.LogTestActionImpl - End LogTestAction.tx=[fid=00, gid=00/186hId=]`,
  },
} satisfies Record<string, LogParseConfig>;
