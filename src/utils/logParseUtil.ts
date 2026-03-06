import XRegExp from 'xregexp';
import {
  ExtractedSqlResult,
  LogEvent,
  SqlLogEvent,
  LogParseConfig,
  LogEventSplitConfig,
  LogEventField,
  LogEventPartBrace,
  ExtractedSqlRdhResult,
  OPTIONAL_LOG_EVENT_KEYS,
  CreateLogEventPatternParams,
} from '../types';
import {
  createRdhKey,
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import { parseQuery } from '../helpers';
import { LOG_FIELD_PATTERNS } from './constant';

/**
 * ISO8601開始行でイベント分割
 */
function splitLogEvents(
  logText: string,
  config: LogEventSplitConfig,
): string[] {
  const logStartPattern = createLogEventPattern({
    fields: config.fields,
    onlyStartMarker: true,
  });

  const lines = logText.split(/\r?\n/);
  const events: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (XRegExp.test(line, logStartPattern)) {
      if (current.length > 0) {
        events.push(current.join('\n'));
      }
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    events.push(current.join('\n'));
  }

  return events;
}

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

  const flushExtractedSql = (sqlLogEvent: Partial<SqlLogEvent>): void => {
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
      const errorMessage = `SQL parse error. ${e.message}`;

      sqlEvents.push({
        ...(sqlLogEvent as SqlLogEvent),
        normalizedSql: cleaned,
        type: 'UNKNOWN',
        errorMessage,
      });
    }
  };

  try {
    const logEventLines = splitLogEvents(logText, config.split);
    if (logEventLines.length === 0) {
      result.error = 'ログからイベントが抽出できませんでした。';
      return result;
    }

    let sqlLogEvent: Partial<SqlLogEvent> | null = null;
    const { pattern } = config.extractSql;
    const fieldSplitPattern = createLogEventPattern({
      fields: config.split.fields,
    });
    for (let i = 0; i < logEventLines.length; i++) {
      const lineNo = i + 1; // 1-based line number
      const logEvent = parseSqlLogEvent(
        logEventLines[i],
        lineNo,
        fieldSplitPattern,
        config.split.fields,
      );
      console.log(
        `LineNo[${lineNo}] message[${
          logEventLines[i]
        }] logEvent exists?[${!!logEvent}]`,
      );
      if (logEvent) {
        const line = logEvent.message;
        const trimmed = line.trimEnd();
        logEvents.push(logEvent);

        if (pattern === 'logger') {
          const { loggerPattern } = config.extractSql;
          console.log(
            'Checking logger pattern at line ' +
              logEvent.lineNo +
              ': ' +
              logEvent.logger,
          );
          if (loggerPattern.test(logEvent.logger ?? '')) {
            // ロガーパターンにマッチした場合のSQL抽出ロジックをここに実装
            console.log(
              'Logger pattern matched at line ' +
                logEvent.lineNo +
                ': ' +
                logEvent.logger,
              logEvent.message,
            );
            flushExtractedSql({
              lineNo: logEvent.lineNo,
              timestamp: logEvent.timestamp,
              rawSql: logEvent.message,
            });
            // SQL抽出処理を実装
          }
        } else if (pattern === 'messagePrefix') {
          // ex: MyBatis
          const {
            startSqlPattern,
            parametersPattern: bindParamsPattern,
            totalPattern,
            endSqlPattern,
          } = config.extractSql;
          // SQL抽出ロジックをここに実装
          if (startSqlPattern.test(trimmed)) {
            // inParameters = false;
            // parametersBuff.splice(0, parametersBuff.length);
            console.log('SQL start detected at line ' + logEvent.lineNo);
            if (sqlLogEvent) {
              flushExtractedSql(sqlLogEvent);
            }
            sqlLogEvent = {
              lineNo: logEvent.lineNo,
              timestamp: logEvent.timestamp,
              rawSql: trimmed.replace(startSqlPattern, '').trim(),
            };
            // SQL抽出処理を実装
          }
          if (!sqlLogEvent) {
            continue;
          }
          if (bindParamsPattern?.test(trimmed)) {
            // inParameters = true;
            const rawParams = trimmed.replace(bindParamsPattern, '').trim();
            sqlLogEvent.rawParams = rawParams ? rawParams : undefined;
          } else if (totalPattern?.test(trimmed)) {
            console.log('Total detected at line ' + logEvent.lineNo);
            sqlLogEvent.total = parseInt(
              trimmed.match(totalPattern)?.[2] ?? '0',
              10,
            );
          }
          // if(inParameters){
          //   const rawParams = trimmed.replace(bindParamsPattern, '').trim();
          //   parametersBuff.push(rawParams);
          // }
          if (endSqlPattern?.test(trimmed)) {
            // SQL抽出完了処理を実装
            flushExtractedSql(sqlLogEvent);
            console.log('SQL end detected at line ' + logEvent.lineNo);
            sqlLogEvent = null;
          }
        }
      }
    }
    if (sqlLogEvent) {
      // ログの最後までSQL抽出が完了しなかった場合の処理を実装
      flushExtractedSql(sqlLogEvent);
    }

    result.ok = true;
    return result;
  } catch (error) {
    console.error('Error during SQL extraction:', error);

    result.error = (error as Error).message;
    return result;
  }
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
          text = it.pattern;
        } else {
          switch (it.pattern) {
            case 'LEVEL':
              if (it.arround) {
                text = LOG_FIELD_PATTERNS.LEVEL + '\\s*';
              } else {
                text = LOG_FIELD_PATTERNS.LEVEL;
              }
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
              text = LOG_FIELD_PATTERNS.ISO8601;
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
  sqlResultKeys.push(createRdhIntKey('total'));
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
