import {
  createRdhKey,
  GeneralColumnType,
  RdhKey,
  ResultSetDataBuilder,
  RowHelper,
} from '@l-v-yonsama/rdh';

import {
  ClassifiedEvent,
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
   LOG EVENTS
====================================================== */

export function createLogResultBuilder(
  logEvents: ClassifiedEvent[],
  stage: LogParseStage,
  options?: {
    elapsedTimeMilli: number;
    logEventSplitPattern: string;
    logEventFieldsPattern: string;
    classificationSummary: string;
  },
): ResultSetDataBuilder {
  if (logEvents.length === 0) {
    return ResultSetDataBuilder.createEmpty();
  }
  const elapsedTimeMilli = options?.elapsedTimeMilli;
  const logEventSplitPattern = options?.logEventSplitPattern;
  const logEventFieldsPattern = options?.logEventFieldsPattern;
  const classificationSummary = options?.classificationSummary;
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
    const row = rdb.rs.rows[rdb.rs.rows.length - 1];
    if (
      eventType === 'ERROR' ||
      eventType === 'FW_ERROR' ||
      eventType === 'SQL_ERROR' ||
      eventType === 'SQL_ERROR_DETAIL'
    ) {
      RowHelper.pushAnnotation(row, 'eventType', { type: 'Err' });
    }
    if (
      others &&
      others.level &&
      others.level &&
      isErrorLikeLevel(others.level)
    ) {
      RowHelper.pushAnnotation(row, 'level', { type: 'Err' });
    }
  });

  if (stageForSplit) {
    updateMetaParams({ rdb, type: 'split', title: 'SPLIT-LOG-EVENT' });
  } else {
    updateMetaParams({ rdb, type: 'classify', title: 'EVENT-CLASSIFICATION' });
  }

  const lines: string[] = [];
  if (logEventSplitPattern) {
    lines.push('-- logEventSplitPattern');
    lines.push(logEventSplitPattern);
    lines.push('\n');
  }
  if (logEventFieldsPattern) {
    lines.push('-- logEventFieldsPattern');
    lines.push(logEventFieldsPattern);
    lines.push('\n');
  }
  if (classificationSummary) {
    lines.push('-- classificationSummary');
    lines.push(classificationSummary);
    lines.push('\n');
  }
  if (lines.length > 0) {
    rdb.setSqlStatement(lines.join('\n'));
  }

  if (elapsedTimeMilli !== undefined) {
    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
    });
  }

  return rdb;
}

function isErrorLikeLevel(level: string): boolean {
  return ['error', 'fatal', 'sever'].includes(level.toLocaleLowerCase());
}

/* ======================================================
   SQL EXECUTION EVENTS
====================================================== */

export function createSqlResultBuilder(
  sqlExecutions: SqlExecutionEvent[],
  options?: {
    elapsedTimeMilli: number;
    extractionSummary: string;
  },
): ResultSetDataBuilder {
  const elapsedTimeMilli = options?.elapsedTimeMilli;
  const extractionSummary = options?.extractionSummary;
  const sqlResultKeys: RdhKey[] = [];

  sqlResultKeys.push(createRdhIntKey('startLine', 80));
  sqlResultKeys.push(createRdhIntKey('endLine', 80));

  sqlResultKeys.push(createRdhTextKey('timestamp', 120));
  sqlResultKeys.push(createRdhTextKey('thread', 120));

  sqlResultKeys.push(createRdhTextKey('daoClass', 100));
  sqlResultKeys.push(createRdhTextKey('daoMethod', 100));

  sqlResultKeys.push(createRdhTextKey('schema', 80));
  sqlResultKeys.push(createRdhTextKey('table', 150));
  sqlResultKeys.push(createRdhTextKey('type', 80));

  sqlResultKeys.push(createRdhTextKey('content', 350));
  sqlResultKeys.push(createRdhTextKey('detail', 400));

  sqlResultKeys.push(createRdhTextKey('params', 200));
  sqlResultKeys.push(createRdhTextKey('result', 100));
  sqlResultKeys.push(createRdhTextKey('framework', 120));

  const rdb = new ResultSetDataBuilder(sqlResultKeys);

  sqlExecutions.forEach((it) => {
    const { sql, formattedSql, error, errorDetail, ...rest } = it;
    if ((rest.type ?? '').toLowerCase() === 'error') {
      rdb.addRow({
        content: error,
        detail: errorDetail,
        ...rest,
      });
      const row = rdb.rs.rows[rdb.rs.rows.length - 1];
      RowHelper.pushAnnotation(row, 'type', { type: 'Err' });
      RowHelper.pushAnnotation(row, 'content', { type: 'Err' });
      RowHelper.pushAnnotation(row, 'detail', { type: 'Err' });
    } else {
      rdb.addRow({
        content: sql,
        detail: formattedSql,
        ...rest,
      });
    }
  });
  updateMetaParams({ rdb, type: 'sqlExecution', title: 'SQL-EXECUTION' });
  if (extractionSummary) {
    const lines: string[] = [];
    lines.push('-- extractionSummary');
    lines.push(extractionSummary);
    rdb.setSqlStatement(lines.join('\n'));
  }
  if (elapsedTimeMilli !== undefined) {
    rdb.setSummary({
      elapsedTimeMilli,
      selectedRows: rdb.rs.rows.length,
    });
  }

  return rdb;
}

type MetaParams = { rdb: ResultSetDataBuilder; title: string; type: string };

function updateMetaParams({ rdb, title, type }: MetaParams): void {
  rdb.updateMeta({
    // connectionName,
    // useDatabase,
    // comment,
    // schemaName,
    tableName: title,
    // compareKeys,
    type,
    // editable: meta?.editable,
  });
}
