import {
  ClassifiedEvent,
  ExtractedSqlResult,
  LogEvent,
  LogParseConfig,
  LogParseParams,
  SqlFragment,
} from '../../types';

import { splitLogEvents } from './split/splitLogEvents';
import {
  createLogEventPattern,
  createLogEventPatternText,
} from './pattern/logEventPattern';
import { classifyEvent, expandLogEvent } from './classify/classifyEvent';
import { runExtractors } from './extract/runExtractors';

import XRegExp from 'xregexp';
import { buildSqlExecutions } from './buildSqlExecutions';
import { validateConfig } from './validator';
import { summarizeClassifyRules, summarizeExtractors } from './logSummary';

export class LogParser {
  private fieldSplitPattern: RegExp;

  constructor(private config: LogParseConfig) {
    this.fieldSplitPattern = createLogEventPattern({
      fields: config.split.fields,
    });
  }

  parse(params: LogParseParams): ExtractedSqlResult {
    const { config } = this;
    const { logText, withSqlFragments, linesToParse, language } = params;

    const stage = params.stage ?? 'sqlExecution';
    const r = validateConfig(this.config, stage);
    if (!r.ok) {
      if (r.errorMessage) {
        throw new Error(`Invalid LogParser config. ${r.errorMessage}`);
      }
      throw new Error(`Invalid LogParser config.`);
    }

    const logEvents: ClassifiedEvent[] = [];
    let sqlFragments: SqlFragment[] | undefined;

    const result: ExtractedSqlResult = {
      ok: false,
      stage,
      logEvents,
      sqlFragments,
      sqlExecutions: [],
      inputSummary: {
        logEventSplitPattern: createLogEventPatternText({
          ...config.split,
          onlyStartMarker: true,
          targetForHuman: true,
        }),
        logEventFieldsPattern: createLogEventPatternText({
          ...config.split,
          targetForHuman: true,
        }),
        classificationSummary: summarizeClassifyRules(config.classify),
        extractionSummary: summarizeExtractors(config.extractors),
      },
      outputSummary: {
        eventTypeCounts: {},
        sqlExecutionTypeCounts: {},
        totalSqlExecutions: 0,
        totalEvents: 0,
      },
      elapsedTimeMilli: {
        split: 0,
        total: 0,
      },
    };

    const startTime = new Date().getTime();
    try {
      const logEventLines = splitLogEvents(
        logText,
        this.config.split,
        linesToParse,
      );
      const beforeClassificationTime = new Date().getTime();
      result.elapsedTimeMilli.split = beforeClassificationTime - startTime;
      const expandMessageRules = this.config.classify.filter(
        (it) => it.expandMessage === true,
      );

      for (const logEventLine of logEventLines) {
        const logEvent = this.parseSqlLogEvent(
          logEventLine.text,
          logEventLine.lineNo,
        );

        if (!logEvent) continue;

        const expanedLogEvents = expandLogEvent(logEvent, expandMessageRules);
        for (const expanedLogEvent of expanedLogEvents) {
          if (stage === 'split') {
            logEvents.push({ ...expanedLogEvent, eventType: 'NORMAL' });
          } else {
            logEvents.push(
              classifyEvent(expanedLogEvent, this.config.classify),
            );
          }
        }
      }
      result.outputSummary.eventTypeCounts = countBy(
        logEvents.map((e) => e.eventType),
      );
      result.outputSummary.totalEvents = result.logEvents.length;
      const afterClassificationTime = new Date().getTime();
      if (stage !== 'split') {
        result.elapsedTimeMilli.classification =
          afterClassificationTime - beforeClassificationTime;
      }

      if (stage === 'split' || stage === 'classify') {
        result.ok = true;
        result.elapsedTimeMilli.total = new Date().getTime() - startTime;
        return result;
      }

      const fragments: SqlFragment[] = runExtractors(
        logEvents,
        this.config.extractors,
      );
      if (withSqlFragments) {
        result.sqlFragments = fragments;
      }

      if (stage === 'extract') {
        result.ok = true;
        result.elapsedTimeMilli.total = new Date().getTime() - startTime;
        return result;
      }

      result.sqlExecutions = buildSqlExecutions({ fragments, language });
      if (result.sqlExecutions) {
        const list = result.sqlExecutions;
        if (
          list.length === 0 ||
          list[0].type === undefined ||
          list[0].type === ''
        ) {
          result.errorRate = 0;
        } else {
          const total = list.length;
          const errors = list.filter(
            (it) => (it.type ?? '').toLowerCase() === 'error',
          ).length;
          result.errorRate = (errors / total) * 100;
        }
        result.outputSummary.totalSqlExecutions = result.sqlExecutions.length;
      }
      result.elapsedTimeMilli.sqlExecutions =
        new Date().getTime() - afterClassificationTime;
      result.outputSummary.sqlExecutionTypeCounts = countBy(
        result.sqlExecutions.map((e) => e.type),
      );
      result.elapsedTimeMilli.total = new Date().getTime() - startTime;

      result.ok = true;
      return result;
    } catch (error) {
      result.elapsedTimeMilli.total = new Date().getTime() - startTime;
      console.error(error);
      result.error = (error as Error).message;
      return result;
    }
  }

  private parseSqlLogEvent(event: string, lineNo: number): LogEvent | null {
    const match = XRegExp.exec(event, this.fieldSplitPattern);

    if (!match) return null;

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
        if (!data.fields) data.fields = {};
        data.fields[field.name] = value;
      }
    }

    return data as LogEvent;
  }
}
function countBy<T extends string | undefined>(
  list: T[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const v of list) {
    const key = v ?? 'UNKNOWN';
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}
