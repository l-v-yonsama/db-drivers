import { parseQuery } from '../../helpers';

import {
  ClassifiedEvent,
  ExtractedSqlResult,
  LogEvent,
  LogParseConfig,
  LogParseParams,
  SqlLogEvent,
} from '../../types';

import { splitLogEvents } from './split/splitLogEvents';
import { createLogEventPattern } from './pattern/logEventPattern';
import { classifyEvent } from './classify/classifyEvent';
import { runExtractors } from './extract/runExtractors';
import { removeSqlComments } from './sql/removeSqlComments';
import XRegExp from 'xregexp';

export class LogParser {
  private fieldSplitPattern: RegExp;

  constructor(private config: LogParseConfig) {
    this.fieldSplitPattern = createLogEventPattern({
      fields: config.split.fields,
    });
  }

  parse(params: LogParseParams): ExtractedSqlResult {
    const { logText, debug } = params;
    const stage = params.stage ?? 'extract';
    const logEvents: ClassifiedEvent[] = [];
    const sqlEvents: SqlLogEvent[] = [];

    const result: ExtractedSqlResult = {
      ok: false,
      stage,
      logEvents,
      sqlEvents,
    };

    try {
      if (debug) {
        console.debug('logText.length', logText.length);
      }
      const logEventLines = splitLogEvents(logText, this.config.split);
      if (debug) {
        console.debug(
          'logEventLines',
          JSON.stringify(logEventLines.slice(0, 5)),
        );
      }

      for (let i = 0; i < logEventLines.length; i++) {
        const logEvent = this.parseSqlLogEvent(logEventLines[i], i + 1);

        if (!logEvent) {
          continue;
        }

        if (stage === 'split') {
          logEvents.push({ ...logEvent, eventType: 'NORMAL' });
        } else {
          logEvents.push(classifyEvent(logEvent, this.config.classify));
        }
      }
      if (stage === 'split' || stage === 'classify') {
        result.ok = true;
        return result;
      }

      if (debug) {
        console.debug(
          'classifiedEvents',
          JSON.stringify(logEvents.slice(0, 5)),
        );
      }

      const partialSql = runExtractors(logEvents, this.config.extractors);
      if (debug) {
        console.debug('partialSql', JSON.stringify(partialSql.slice(0, 5)));
      }

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
      if (debug) {
        console.debug('sqlEvents', JSON.stringify(sqlEvents.slice(0, 5)));
      }
      result.ok = true;
      return result;
    } catch (error) {
      result.error = (error as Error).message;
      return result;
    }
  }

  private parseSqlLogEvent(event: string, lineNo: number): LogEvent | null {
    const match = XRegExp.exec(event, this.fieldSplitPattern);

    if (!match) {
      return null;
    }

    const data: Partial<LogEvent> = { lineNo };

    const FIX = ['timestamp', 'thread', 'level', 'logger', 'message'];

    this.config.split.fields
      .filter((it) => it.type !== 'literal' && it.name !== 'lineNo')
      .forEach((it) => {
        const value = match.groups?.[it.name];

        if (FIX.includes(it.name)) {
          (data as any)[it.name] = value;
        } else {
          if (!data.fields) {
            data.fields = {};
          }

          data.fields[it.name] = value;
        }
      });

    return data as LogEvent;
  }
}
