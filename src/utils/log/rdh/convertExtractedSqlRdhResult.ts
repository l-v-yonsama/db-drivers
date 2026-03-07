import {
  createRdhKey,
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import {
  CreateLogEventPatternParams,
  ExtractedSqlRdhResult,
  ExtractedSqlResult,
  LogEvent,
  LogEventPartBrace,
  OPTIONAL_LOG_EVENT_KEYS,
  SqlLogEvent,
} from '../../../types';
import XRegExp from 'xregexp';
import { LOG_FIELD_PATTERNS } from '../../constant';
import { getArroundEndBrace } from '../pattern/logEventPattern';

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
