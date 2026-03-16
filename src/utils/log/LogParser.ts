import { parseQuery } from '../../helpers';

import {
  ClassifiedEvent,
  ExtractedSqlResult,
  LogEvent,
  LogParseConfig,
  LogParseParams,
  SqlExecutionBuilder,
  SqlExecutionEvent,
  SqlFragment,
} from '../../types';

import { splitLogEvents } from './split/splitLogEvents';
import { createLogEventPattern } from './pattern/logEventPattern';
import { classifyEvent, expandLogEvent } from './classify/classifyEvent';
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

    const stage = params.stage ?? 'sqlExecution';

    const logEvents: ClassifiedEvent[] = [];
    const sqlExecutions: SqlExecutionEvent[] = [];

    const result: ExtractedSqlResult = {
      ok: false,
      stage,
      logEvents,
      sqlExecutions,
    };

    try {
      if (debug) {
        console.debug('logText', logText);
        // console.debug('logText.length', logText.length);
      }

      const logEventLines = splitLogEvents(logText, this.config.split, debug);

      if (debug) {
        console.debug(
          'logEventLines',
          JSON.stringify(logEventLines.slice(0, 5)),
        );
      }

      const expandMessageRules = this.config.classify.filter(
        (it) => it.expandMessage === true,
      );
      for (const logEventLine of logEventLines) {
        const logEvent = this.parseSqlLogEvent(logEventLine.text, logEventLine.lineNo);
        if (debug) {
          console.debug('parsed sqlLogEvent', JSON.stringify(logEvent));
        }
        if (!logEvent) {
          continue;
        }

        if (stage === 'split') {
          logEvents.push({ ...logEvent, eventType: 'NORMAL' });
        } else {
          const expanedLogEvents = expandLogEvent(logEvent, expandMessageRules);
          for (const expanedLogEvent of expanedLogEvents) {
            logEvents.push(
              classifyEvent(expanedLogEvent, this.config.classify, debug),
            );
          }
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

      const fragments: SqlFragment[] = runExtractors(
        logEvents,
        this.config.extractors,
      );

      if (debug) {
        result.sqlFragments = fragments;
        console.debug('sqlFragments', JSON.stringify(fragments.slice(0, 5)));
      }

      if (stage === 'extract') {
        result.ok = true;
        return result;
      }

      const builders = new Map<string, SqlExecutionBuilder>();

      const getBuilder = (thread?: string): SqlExecutionBuilder => {
        const key = thread?.trim() || '__default__';
        let builder = builders.get(key);
        if (!builder) {
          builder = { state: 'idle' };
          builders.set(key, builder);
        }

        return builder;
      };

      for (const fragment of fragments) {
        const builder = getBuilder(fragment.thread);

        if (debug) {
          console.debug('fragment', JSON.stringify(fragment));
          console.debug('builder.before', JSON.stringify(builder));
        }

        // SQL_SINGLE (S2Jdbc etc) -------------

        if (fragment.type === 'SQL_SINGLE') {
          const rawSql = fragment.value;
          const cleaned = removeSqlComments(rawSql);

          try {
            const { ast, names } = parseQuery(rawSql);

            sqlExecutions.push({
              startLine: calcLine(fragment),
              endLine: calcLine(fragment),
              timestamp: fragment.timestamp,
              thread: fragment.thread,
              sql: rawSql,
              normalizedSql: cleaned,
              schema: names?.schemaName,
              table: names?.tableName,
              index: names?.indexName,
              type: ast ? ast.type : 'UNKNOWN',
              daoClass: fragment.daoClass,
              daoMethod: fragment.daoMethod,
            } as any);
          } catch (e) {
            sqlExecutions.push({
              startLine: calcLine(fragment),
              endLine: calcLine(fragment),
              timestamp: fragment.timestamp,
              thread: fragment.thread,
              sql: rawSql,
              normalizedSql: cleaned,
              type: 'UNKNOWN',
              daoClass: fragment.daoClass,
              daoMethod: fragment.daoMethod,
              error: `SQL parse error. ${(e as Error).message}`,
            } as any);
          }

          continue;
        }

        // SQL start ---------------------------
        if (fragment.type === 'SQL') {
          /**
           * Protection against unfinished SQL.
           *
           * Example broken log sequence:
           *
           *   SQL_START   select ...
           *   SQL_PARAMS
           *   SQL_START   update ...   ← previous SQL never finished
           *
           * In this case we discard the unfinished SQL and start a new one.
           * This prevents SQL fragments from being merged incorrectly.
           */
          if (builder.state === 'collecting' && builder.current) {
            builder.state = 'idle';
            builder.current = undefined;
          }

          builder.state = 'collecting';

          builder.current = {
            startLine: calcLine(fragment),
            endLine: calcLine(fragment),
            timestamp: fragment.timestamp,
            thread: fragment.thread,
            sql: fragment.value,
            daoClass: fragment.daoClass,
            daoMethod: fragment.daoMethod,
          };

          continue;
        }

        if (builder.state !== 'collecting' || !builder.current) {
          continue;
        }

        builder.current.endLine = calcLine(fragment);

        if (fragment.type === 'PARAMS') {
          builder.current.params = fragment.value;
        }

        if (fragment.type === 'RESULT') {
          builder.current.result = fragment.value;
        }

        if (fragment.type === 'ERROR') {
          builder.current.error = fragment.value;
        }

        if (fragment.type === 'RESULT' || fragment.type === 'ERROR') {
          const rawSql = builder.current.sql ?? '';
          const cleaned = removeSqlComments(rawSql);

          try {
            const { ast, names } = parseQuery(rawSql);

            sqlExecutions.push({
              ...builder.current,
              normalizedSql: cleaned,
              schema: names?.schemaName,
              table: names?.tableName,
              index: names?.indexName,
              type: ast ? ast.type : 'UNKNOWN',
            } as any);
          } catch (e) {
            sqlExecutions.push({
              ...builder.current,
              normalizedSql: cleaned,
              type: 'UNKNOWN',
              error: `SQL parse error. ${(e as Error).message}`,
            } as any);
          }

          builder.state = 'idle';
          builder.current = undefined;
        }
      }

      if (debug) {
        console.debug(
          'sqlExecutions',
          JSON.stringify(sqlExecutions.slice(0, 5)),
        );
      }

      result.ok = true;
      return result;
    } catch (error) {
      console.error(error);
      result.error = (error as Error).message;
      return result;
    }
  }

  private parseSqlLogEvent(event: string, lineNo: number): LogEvent | null {
    const match = XRegExp.exec(event, this.fieldSplitPattern);
    console.debug(
      'at parseSqlLogEvent, this.fieldSplitPattern=',
      this.fieldSplitPattern,
    );

    if (!match) {
      return null;
    }

    const data: Partial<LogEvent> = { lineNo, messageSeq: 1 };

    const FIX = ['timestamp', 'thread', 'level', 'logger', 'message'];

    for (const field of this.config.split.fields) {
      if (
        field.type === 'literal' ||
        field.type === 'line-break-literal' ||
        field.name === 'lineNo'
      ) {
        continue;
      }
      const value = match.groups?.[field.name];

      if (FIX.includes(field.name)) {
        (data as any)[field.name] = value;
      } else {
        if (!data.fields) {
          data.fields = {};
        }

        data.fields[field.name] = value;
      }
    }

    return data as LogEvent;
  }
}

const calcLine = (fragment: SqlFragment): number => {
  return fragment.lineNo + fragment.messageSeq - 1;
};
