import {
  createRdhKey,
  GeneralColumnType,
  RdhKey,
  ResultSetData,
  ResultSetDataBuilder,
} from '@l-v-yonsama/rdh';
import {
  ClassifiedEvent,
  ExtractedSqlRdhResult,
  ExtractedSqlResult,
  LogParseStage,
  OPTIONAL_LOG_EVENT_KEYS,
  SqlLogEvent,
} from '../../../types';

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
  params: ExtractedSqlResult,
): ExtractedSqlRdhResult {
  const logEventRdb = createLogResultBuilder(params.logEvents, params.stage);
  const sqlEventRdb = createSqlResultBuilder(params.sqlEvents);

  return {
    logEvents: logEventRdb.build(),
    sqlEvents: sqlEventRdb.build(),
  };
}

function createLogResultBuilder(
  logEvents: ClassifiedEvent[],
  stage: LogParseStage,
): ResultSetDataBuilder {
  if (logEvents.length === 0) {
    return ResultSetDataBuilder.createEmpty();
  }
  const stageForSplit = stage === 'split';
  const firstEvent = logEvents[0];
  const logResultKeys: RdhKey[] = [];
  logResultKeys.push(createRdhIntKey('lineNo', 80));
  if (!stageForSplit) {
    logResultKeys.push(createRdhTextKey('eventType', 100));
  }

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
  if (!stageForSplit) {
    logResultKeys.push(createRdhTextKey('transformed'));
  }
  logResultKeys.push(createRdhTextKey('message', 800));
  const existsFieldKeys: string[] = [];
  if (firstEvent.fields) {
    Object.keys(firstEvent.fields).forEach((key) => {
      existsFieldKeys.push(key);
      logResultKeys.push(createRdhTextKey(key));
    });
  }

  const rdb = new ResultSetDataBuilder(logResultKeys);

  logEvents.forEach((it) => {
    const { fields, eventType, transformed, ...others } = it;
    const data: any = {
      ...others,
    };
    if (!stageForSplit) {
      data.eventType = eventType;
      data.transformed = transformed;
    }
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
  sqlResultKeys.push(createRdhTextKey('rawSql', 300));
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
