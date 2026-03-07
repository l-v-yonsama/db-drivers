import {
  createRdhKey,
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import XRegExp from 'xregexp';
import { parseQuery } from '../helpers';
import {
  ClassifiedEvent,
  CreateLogEventPatternParams,
  ExtractedSqlRdhResult,
  ExtractedSqlResult,
  ExtractorConfig,
  LogClassifierRule,
  LogEvent,
  LogEventField,
  LogEventPartBrace,
  LogEventSplitConfig,
  LogParseConfig,
  OPTIONAL_LOG_EVENT_KEYS,
  SqlLogEvent,
} from '../types';
import { LOG_FIELD_PATTERNS } from './constant';

/* =====================================================
 split
===================================================== */

function splitLogEvents(
  logText: string,
  config: LogEventSplitConfig,
): string[] {
  const startPattern = createLogEventPattern({
    fields: config.fields,
    onlyStartMarker: true,
  });

  const lines = logText.split(/\r?\n/);

  const events: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isStart = XRegExp.test(line, startPattern);

    /* continuation 判定 */
    const isContinuation = line.startsWith(' ') || line.startsWith('\t');

    if (isStart && !isContinuation) {
      if (current.length > 0) {
        events.push(current.join('\n'));
      }

      current = [line];
      continue;
    }

    /* 継続行 */
    current.push(line);
  }

  if (current.length > 0) {
    events.push(current.join('\n'));
  }

  return events;
}

/* =====================================================
 classify
===================================================== */

function classifyEvent(
  event: LogEvent,
  rules: LogClassifierRule[],
): ClassifiedEvent {
  for (const r of rules) {
    const value = r.field === 'logger' ? event.logger : event.message;

    if (value && r.pattern.test(value)) {
      let transformed: string | undefined;

      if (r.transform?.length) {
        transformed = value;

        for (const t of r.transform) {
          transformed = transformed.replace(t.pattern, t.replace);
        }

        transformed = transformed.trim();
      }

      return {
        ...event,
        eventType: r.type,
        transformed,
      };
    }
  }

  return {
    ...event,
    eventType: 'NORMAL',
  };
}
/* =====================================================
 extractor state machine
===================================================== */

const DEBUG_RUN_EXTRACTOR = true;

function runExtractors(
  events: ClassifiedEvent[],
  extractors: ExtractorConfig[],
): Partial<SqlLogEvent>[] {
  const results: Partial<SqlLogEvent>[] = [];

  if (DEBUG_RUN_EXTRACTOR) {
    console.debug('runExtractors, num of extractors:', extractors.length);
    console.debug(events);
  }

  for (const extractor of extractors) {
    if (DEBUG_RUN_EXTRACTOR) {
      console.debug('extractor.name:', extractor.name);
    }

    let stepIndex = -1;
    let buffer: Partial<SqlLogEvent> = {};

    for (const event of events) {
      if (DEBUG_RUN_EXTRACTOR) {
        console.debug(
          `event line=${event.lineNo}, type=${event.eventType}, stepIndex=${stepIndex}`,
        );
      }

      /* ==============================
         START detection
      ============================== */

      if (stepIndex === -1) {
        if (event.eventType !== extractor.start) {
          continue;
        }

        stepIndex = 0;

        buffer = {
          lineNo: event.lineNo,
          timestamp: event.timestamp,
        };

        if (DEBUG_RUN_EXTRACTOR) {
          console.debug('START detected', JSON.stringify(event));
        }
      }

      /* ==============================
         step machine
      ============================== */

      let consumed = false;

      while (stepIndex !== -1 && stepIndex < extractor.steps.length) {
        const step = extractor.steps[stepIndex];

        if (DEBUG_RUN_EXTRACTOR) {
          console.debug('current step', stepIndex, step);
        }

        /* step match */

        if (event.eventType === step.type) {
          if (DEBUG_RUN_EXTRACTOR) {
            console.debug('step matched', step.type);
          }

          /* capture SQL */

          if (step.action === 'captureSql') {
            buffer.rawSql = event.transformed ?? event.message;

            if (DEBUG_RUN_EXTRACTOR) {
              console.debug('captureSql', buffer.rawSql);
            }
          }

          /* capture params */
          if (step.action === 'captureParams') {
            const rawParams = event.transformed ?? event.message;
            if (rawParams !== '') {
              buffer.rawParams = rawParams;
            }

            if (DEBUG_RUN_EXTRACTOR) {
              console.debug('captureParams', buffer.rawParams);
            }
          }

          /* captureField */
          if (step.action === 'captureField' && step.field) {
            (buffer as any)[step.field] = event.transformed ?? event.message;

            if (DEBUG_RUN_EXTRACTOR) {
              console.debug('captureField', step.field, buffer[step.field]);
            }
          }

          stepIndex++;

          /* SQL completed */

          if (stepIndex >= extractor.steps.length) {
            if (DEBUG_RUN_EXTRACTOR) {
              console.debug('SQL event completed', buffer);
            }

            results.push(buffer);

            buffer = {};
            stepIndex = -1;
          }

          consumed = true;
          break;
        }

        /* optional step */

        if (step.optional) {
          if (DEBUG_RUN_EXTRACTOR) {
            console.debug('optional step skipped', step.type);
          }

          stepIndex++;
          continue;
        }

        /* mismatch */

        if (DEBUG_RUN_EXTRACTOR) {
          console.debug(
            'event mismatch',
            event.eventType,
            'expected',
            step.type,
          );
        }

        break;
      }

      if (consumed) {
        continue;
      }
    }

    /* flush incomplete SQL */

    if (stepIndex !== -1 && buffer.rawSql) {
      if (DEBUG_RUN_EXTRACTOR) {
        console.debug('flush unfinished SQL', buffer);
      }

      results.push(buffer);
    }
  }

  if (DEBUG_RUN_EXTRACTOR) {
    console.debug('runExtractors result size:', results.length);
  }

  return results;
}

/* =====================================================
 main
===================================================== */

export async function extractSqlFromLogText(
  logText: string,
  config: LogParseConfig,
): Promise<ExtractedSqlResult> {
  const logEvents: LogEvent[] = [];
  const sqlEvents: SqlLogEvent[] = [];

  const result: ExtractedSqlResult = {
    ok: false,
    logEvents,
    sqlEvents,
  };

  try {
    const logEventLines = splitLogEvents(logText, config.split);

    const fieldSplitPattern = createLogEventPattern({
      fields: config.split.fields,
    });

    const classifiedEvents: ClassifiedEvent[] = [];

    for (let i = 0; i < logEventLines.length; i++) {
      const logEvent = parseSqlLogEvent(
        logEventLines[i],
        i + 1,
        fieldSplitPattern,
        config.split.fields,
      );

      if (!logEvent) continue;

      logEvents.push(logEvent);
      classifiedEvents.push(classifyEvent(logEvent, config.classify));
    }

    const partialSql = runExtractors(classifiedEvents, config.extractors);

    for (const sqlLogEvent of partialSql) {
      const rawSql = sqlLogEvent.rawSql ?? '';
      const cleaned = removeSqlComments(rawSql);

      try {
        const { ast, names } = parseQuery(rawSql);

        sqlEvents.push({
          ...(sqlLogEvent as SqlLogEvent),
          normalizedSql: cleaned,
          schema: names?.schemaName,
          table: names?.tableName,
          index: names?.indexName,
          type: ast ? ast.type : 'UNKNOWN',
        });
      } catch (e) {
        sqlEvents.push({
          ...(sqlLogEvent as SqlLogEvent),
          normalizedSql: cleaned,
          type: 'UNKNOWN',
          errorMessage: `SQL parse error. ${(e as Error).message}`,
        });
      }
    }

    result.ok = true;

    return result;
  } catch (error) {
    result.error = (error as Error).message;

    return result;
  }
}

/* ===============================
 * formatting
 * =============================== */

function removeSqlComments(sql: string): string {
  return (
    sql
      // ブロックコメントは安全に除去
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 行頭コメントのみ除去（← ここが重要）
      .replace(/^\s*--.*$/gm, '')
      .trim()
  );
}

function getArroundEndBrace(arround: LogEventPartBrace): string {
  return arround === '(' ? ')' : ']';
}

export function sqlLogEventToRdh(events: SqlLogEvent[]): ResultSetData {
  const logResultKeys: RdhKey[] = [
    createRdhKey({
      name: 'lineNo',
      type: GeneralColumnType.INTEGER,
      width: 80,
    }),
    createRdhKey({
      name: 'timestamp',
      type: GeneralColumnType.TEXT,
      width: 100,
    }),
    createRdhKey({
      name: 'thread',
      type: GeneralColumnType.TEXT,
      width: 100,
    }),
    createRdhKey({
      name: 'level',
      type: GeneralColumnType.ENUM,
      width: 100,
    }),
    createRdhKey({
      name: 'logger',
      type: GeneralColumnType.TEXT,
      width: 150,
    }),
    createRdhKey({
      name: 'message',
      type: GeneralColumnType.TEXT,
      width: 500,
    }),
  ];
  const builder = new ResultSetDataBuilder(logResultKeys);
  for (const event of events) {
    builder.addRow(event);
  }
  return builder.build();
}

export function createLogEventPattern(
  params: CreateLogEventPatternParams,
): RegExp {
  const patternText = createLogEventPatternText(params);
  return XRegExp(patternText, 'i');
}

export function createLogEventPatternText(
  params: CreateLogEventPatternParams,
): string {
  const { fields, onlyStartMarker, targetForHuman } = params;
  const summary = fields
    .filter((it) => (onlyStartMarker ? it.eventStartMarker === true : true))
    .map((it) => {
      let text = '';

      if (it.type === 'custom' || it.type === 'delimiter') {
        text = it.pattern;
      } else {
        if (targetForHuman) {
          text = `{${it.pattern}}`;
        } else {
          switch (it.pattern) {
            case 'LEVEL':
              text = LOG_FIELD_PATTERNS.LEVEL;
              break;
            case 'WORD':
              text = LOG_FIELD_PATTERNS.WORD;
              break;
            case 'INT':
              text = LOG_FIELD_PATTERNS.INT;
              break;
            case 'NUMBER':
              text = LOG_FIELD_PATTERNS.NUMBER;
              break;
            case 'DATA':
            case 'GREEDY_DATA':
              if (it.arround) {
                text = '[^\\' + getArroundEndBrace(it.arround) + ']*';
              } else {
                text = '.*';
              }
              if (it.pattern === 'DATA') {
                text += '?';
              }
              break;
            case 'GREEDY_MULTILINE':
              text = LOG_FIELD_PATTERNS.GREEDY_MULTILINE;
              break;
            case 'ISO8601_TIMESTAMP':
              text = LOG_FIELD_PATTERNS.ISO8601_TIMESTAMP;
              break;
            case 'LOGGER':
              text = LOG_FIELD_PATTERNS.GENERAL_LOGGER;
              break;
          }
        }
      }

      if (!onlyStartMarker) {
        text = `(?<${it.name}>${text})`;
      }
      if (it.arround) {
        if (it.arround === '(') {
          text = `\\(${text}\\)`;
        } else if (it.arround === '[') {
          text = `\\[${text}\\]`;
        }
      }
      return text;
    })
    .join(targetForHuman ? ' △ ' : '\\s+');

  return '^' + summary;
}

function createRdhTextKey(name: string, width?: number): RdhKey {
  return createRdhKey({ name, type: GeneralColumnType.TEXT, width });
}

function createRdhEnumKey(name: string, width?: number): RdhKey {
  return createRdhKey({ name, type: GeneralColumnType.ENUM, width });
}

function createRdhIntKey(name: string, width?: number): RdhKey {
  return createRdhKey({ name, type: GeneralColumnType.INTEGER, width });
}

export function convertExtractedSqlRdhResult(
  extractedSqlResult: ExtractedSqlResult,
): ExtractedSqlRdhResult {
  const logEventRdb = createLogResultBuilder(extractedSqlResult.logEvents);
  const sqlEventRdb = createSqlResultBuilder(extractedSqlResult.sqlEvents);

  return {
    logEvents: logEventRdb.build(),
    sqlEvents: sqlEventRdb.build(),
  };
}

function createLogResultBuilder(logEvents: LogEvent[]): ResultSetDataBuilder {
  if (logEvents.length === 0) {
    return ResultSetDataBuilder.createEmpty();
  }
  const firstEvent = logEvents[0];
  const logResultKeys: RdhKey[] = [];
  logResultKeys.push(createRdhIntKey('lineNo', 80));
  // const existsOptionalLogEventKeys: string[] = [];
  OPTIONAL_LOG_EVENT_KEYS.forEach((key) => {
    if (firstEvent[key]) {
      // existsOptionalLogEventKeys.push(key);
      if (key === 'level') {
        logResultKeys.push(createRdhEnumKey(key, 80));
      } else {
        logResultKeys.push(createRdhTextKey(key));
      }
    }
  });
  logResultKeys.push(createRdhTextKey('message', 200));
  const existsFieldKeys: string[] = [];
  if (firstEvent.fields) {
    Object.keys(firstEvent.fields).forEach((key) => {
      existsFieldKeys.push(key);
      logResultKeys.push(createRdhTextKey(key));
    });
  }

  const rdb = new ResultSetDataBuilder(logResultKeys);

  logEvents.forEach((it) => {
    const { fields, ...others } = it;
    const data: any = {
      ...others,
    };
    existsFieldKeys.forEach((key) => {
      data[key] = fields[key];
    });
    rdb.addRow(data);
  });

  return rdb;
}

function createSqlResultBuilder(
  sqlEvents: SqlLogEvent[],
): ResultSetDataBuilder {
  const sqlResultKeys: RdhKey[] = [];
  sqlResultKeys.push(createRdhIntKey('lineNo', 80));
  sqlResultKeys.push(createRdhTextKey('timestamp', 100));
  sqlResultKeys.push(createRdhTextKey('rawSql', 200));
  sqlResultKeys.push(createRdhTextKey('rawParams'));
  sqlResultKeys.push(createRdhTextKey('normalizedSql'));
  sqlResultKeys.push(createRdhIntKey('result'));
  sqlResultKeys.push(createRdhEnumKey('type', 80));
  sqlResultKeys.push(createRdhTextKey('schema'));
  sqlResultKeys.push(createRdhTextKey('table'));
  sqlResultKeys.push(createRdhTextKey('errorMessage'));

  const rdb = new ResultSetDataBuilder(sqlResultKeys);

  sqlEvents.forEach((it) => {
    const { index, ...others } = it;
    rdb.addRow({
      ...others,
    });
  });

  return rdb;
}

/**
 * イベントを構造化
 */
function parseSqlLogEvent(
  event: string,
  lineNo: number,
  fieldSplitPattern: RegExp,
  eventFields: LogEventField[],
): LogEvent | null {
  const match = XRegExp.exec(event, fieldSplitPattern);
  if (!match) {
    return null;
  }

  const data: Partial<LogEvent> = { lineNo };

  const FIX = ['timestamp', 'thread', 'level', 'logger', 'message'];
  eventFields
    .filter((it) => it.type !== 'delimiter' && it.name !== 'lineNo')
    .forEach((it) => {
      if (FIX.includes(it.name)) {
        data[it.name] = match.groups?.[it.name];
      } else {
        if (!data.fields) {
          data.fields = {};
        }
        data.fields[it.name] = match.groups?.[it.name];
      }
    });

  return data as LogEvent;
}
