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
  SqlExecutionEvent,
} from '../../../types';

/* ======================================================
   helper
====================================================== */

function createRdhTextKey(name: string, width?: number): RdhKey {
  return createRdhKey({ name, type: GeneralColumnType.TEXT, width });
}

function createRdhEnumKey(name: string, width?: number): RdhKey {
  return createRdhKey({ name, type: GeneralColumnType.ENUM, width });
}

function createRdhIntKey(name: string, width?: number): RdhKey {
  return createRdhKey({ name, type: GeneralColumnType.INTEGER, width });
}

/* ======================================================
   main
====================================================== */

export function convertExtractedSqlRdhResult(
  params: ExtractedSqlResult,
): ExtractedSqlRdhResult {
  const logEventRdb = createLogResultBuilder(params.logEvents, params.stage);

  const sqlEventRdb = createSqlResultBuilder(params.sqlExecutions);

  return {
    logEvents: logEventRdb.build(),
    sqlEvents: sqlEventRdb.build(),
  };
}

/* ======================================================
   LOG EVENTS
====================================================== */

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
      data[key] = fields?.[key];
    });

    rdb.addRow(data);
  });

  return rdb;
}

/* ======================================================
   SQL EXECUTION EVENTS
====================================================== */

function createSqlResultBuilder(
  sqlExecutions: SqlExecutionEvent[],
): ResultSetDataBuilder {
  const sqlResultKeys: RdhKey[] = [];

  sqlResultKeys.push(createRdhIntKey('startLine', 80));
  sqlResultKeys.push(createRdhIntKey('endLine', 80));

  sqlResultKeys.push(createRdhTextKey('timestamp', 120));
  sqlResultKeys.push(createRdhTextKey('thread', 120));
  sqlResultKeys.push(createRdhTextKey('framework', 120));

  sqlResultKeys.push(createRdhTextKey('sql', 400));
  sqlResultKeys.push(createRdhTextKey('params', 200));
  sqlResultKeys.push(createRdhTextKey('result', 100));

  sqlResultKeys.push(createRdhTextKey('normalizedSql', 400));

  sqlResultKeys.push(createRdhTextKey('schema', 150));
  sqlResultKeys.push(createRdhTextKey('table', 150));
  sqlResultKeys.push(createRdhTextKey('index', 150));

  sqlResultKeys.push(createRdhTextKey('type', 80));

  sqlResultKeys.push(createRdhTextKey('error', 300));

  const rdb = new ResultSetDataBuilder(sqlResultKeys);

  sqlExecutions.forEach((it) => {
    rdb.addRow({
      ...it,
    });
  });

  return rdb;
}
