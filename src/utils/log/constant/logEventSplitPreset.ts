import { LogEventSplitConfig } from '../../../types';

/* ======================================================
   Simple
   2026-03-12 10:11:22 DEBUG logger - message
====================================================== */

export const DEFAULT_SIMPLE_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'ISO8601_STRICT',
      eventStartMarker: true,
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
   Logback
   %d{HH:mm:ss.SSS} [%thread] %-5level %logger - %msg
====================================================== */

export const DEFAULT_LOGBACK_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'ISO8601_STRICT',
      eventStartMarker: true,
    },
    {
      name: 'thread',
      type: 'builtin',
      pattern: 'DATA',
      enclosure: '[]',
      eventStartMarker: false,
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
      pattern: 'LOGGER',
      eventStartMarker: false,
    },
    {
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
   Log4j
   %d [%t] %-5p %c - %m
====================================================== */

export const DEFAULT_LOG4J_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'ISO8601_LENIENT',
      eventStartMarker: true,
    },
    {
      name: 'thread',
      type: 'builtin',
      pattern: 'DATA',
      enclosure: '[]',
      eventStartMarker: false,
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

export const DEFAULT_LOG4J_MDC_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'SLASH_TIMESTAMP',
      enclosure: '[]',
      eventStartMarker: true,
    },
    {
      name: 'level',
      type: 'builtin',
      pattern: 'LEVEL',
      enclosure: '[]',
      eventStartMarker: false,
    },
    {
      name: 'thread',
      type: 'builtin',
      pattern: 'DATA',
      enclosure: '[]',
      eventStartMarker: false,
    },
    {
      name: 'logNo',
      type: 'builtin',
      pattern: 'INT',
      enclosure: '[]',
      eventStartMarker: false,
    },
    {
      name: 'logger',
      type: 'builtin',
      pattern: 'LOGGER',
      eventStartMarker: false,
    },
    {
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
   Java Util Logging (JUL / Tomcat)
   Mar 12, 2026 10:11:22 AM logger method
   INFO: message
====================================================== */

export const DEFAULT_JUL_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'JUL_TIMESTAMP',
      eventStartMarker: true,
    },
    {
      name: 'logger',
      type: 'builtin',
      pattern: 'LOGGER',
      eventStartMarker: false,
    },
    {
      name: 'method',
      type: 'builtin',
      pattern: 'WORD',
      eventStartMarker: false,
    },
    {
      type: 'line-break-literal',
      eventStartMarker: false,
    },
    {
      name: 'level',
      type: 'builtin',
      pattern: 'LEVEL',
      eventStartMarker: false,
    },
    {
      type: 'literal',
      pattern: ':',
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

export const DEFAULT_SPRING_BOOT_SPLIT_CONFIG: LogEventSplitConfig = {
  fields: [
    {
      name: 'timestamp',
      type: 'builtin',
      pattern: 'ISO8601_STRICT',
      eventStartMarker: true,
    },

    {
      name: 'level',
      type: 'builtin',
      pattern: 'LEVEL',
      eventStartMarker: false,
    },

    /* pid */
    {
      name: 'pid',
      type: 'builtin',
      pattern: 'INT',
      eventStartMarker: false,
    },

    /* --- literal */
    {
      type: 'literal',
      pattern: '---',
      eventStartMarker: false,
    },

    {
      name: 'thread',
      type: 'builtin',
      pattern: 'DATA',
      enclosure: '[]',
      eventStartMarker: false,
    },

    {
      name: 'logger',
      type: 'builtin',
      pattern: 'LOGGER',
      eventStartMarker: false,
    },
    {
      type: 'literal',
      pattern: ':',
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

export const LOG_EVENT_SPLIT_PRESETS = {
  Simple: {
    split: DEFAULT_SIMPLE_SPLIT_CONFIG,
    logExample: `2026-03-12 10:11:22 DEBUG com.example.UserService - Executing query
2026-03-12 10:11:22 INFO com.example.UserService - Query finished
2026-03-12 10:11:23 ERROR com.example.UserService - SQL execution failed`,
  },
  Logback: {
    split: DEFAULT_LOGBACK_SPLIT_CONFIG,
    logExample: `10:11:22.333 [http-nio-8080-exec-1] DEBUG com.example.UserService - Executing query
10:11:22.444 [http-nio-8080-exec-1] INFO  com.example.UserService - Query finished
10:11:22.555 [http-nio-8080-exec-1] ERROR com.example.UserService - SQL execution failed`,
  },
  Log4j: {
    split: DEFAULT_LOG4J_SPLIT_CONFIG,
    logExample: `2026-03-12 10:11:22,333 [http-nio-8080-exec-1] DEBUG com.example.UserService - Executing query
2026-03-12 10:11:22,444 [http-nio-8080-exec-1] INFO  com.example.UserService - Query finished
2026-03-12 10:11:22,555 [http-nio-8080-exec-1] ERROR com.example.UserService - SQL execution failed`,
  },
  Log4jMdc: {
    split: DEFAULT_LOG4J_MDC_SPLIT_CONFIG,
    logExample: `[1999/01/01 14:52:34 0502] [DEBUG] [http-nio-8080-exec-1] [30] com.example.UserService - Executing query
[1999/01/01 14:52:34 0503] [INFO ] [http-nio-8080-exec-1] [30] com.example.UserService - Query finished
[1999/01/01 14:52:34 0510] [ERROR] [http-nio-8080-exec-1] [30] com.example.UserService - SQL execution failed`,
  },
  JavaUtilLogging: {
    split: DEFAULT_JUL_SPLIT_CONFIG,
    logExample: `Mar 12, 2026 10:11:22 AM com.example.UserService execute
INFO: Executing query
Mar 12, 2026 10:11:22 AM com.example.UserService execute
SEVERE: SQL execution failed`,
  },
  SpringBoot: {
    split: DEFAULT_SPRING_BOOT_SPLIT_CONFIG,
    logExample: `2026-03-12 10:11:22.333  INFO 12345 --- [nio-8080-exec-1] c.example.demo.UserService : Executing query
2026-03-12 10:11:22.444 DEBUG 12345 --- [nio-8080-exec-1] c.example.demo.UserService : Binding parameters
2026-03-12 10:11:22.555 ERROR 12345 --- [nio-8080-exec-1] c.example.demo.UserService : SQL execution failed`,
  },
} as const satisfies Record<
  string,
  { split: LogEventSplitConfig; logExample: string }
>;

export type LogEventSplitPresetName = keyof typeof LOG_EVENT_SPLIT_PRESETS;
