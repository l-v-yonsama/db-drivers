import XRegExp from 'xregexp';

import { createLogEventPattern } from '../pattern/logEventPattern';
import { classifyEvent } from '../classify/classifyEvent';

import {
  LogEvent,
  LogEventSplitConfig,
  LogClassifierRule,
  LogFormatDetectionResult,
  LogEventType,
  LogParseConfig,
} from '../../../types';
import { LogParser } from '../LogParser';

/* ======================================================
   split preset detection
====================================================== */

export function detectLogSplitPreset(
  logText: string,
  presets: Record<string, { split: LogEventSplitConfig }>,
): LogFormatDetectionResult {
  const lines = logText.split(/\r?\n|\r/).slice(0, 200);

  const scores: Record<string, number> = {};
  let bestScore = 0;

  for (const [name, preset] of Object.entries(presets)) {
    const startPattern = createLogEventPattern({
      fields: preset.split.fields,
      onlyStartMarker: true,
    });

    const fullPattern = createLogEventPattern({
      fields: preset.split.fields,
      onlyStartMarker: false,
    });

    let startMatches = 0;
    let fullMatches = 0;

    for (const line of lines) {
      if (XRegExp.test(line, startPattern)) {
        startMatches++;
      }

      if (XRegExp.test(line, fullPattern)) {
        fullMatches++;
      }
    }

    const startRatio = startMatches / lines.length;
    const fullRatio = fullMatches / lines.length;

    const score =
      startMatches * 5 + fullMatches * 1 + startRatio * 10 + fullRatio * 2;

    scores[name] = score;

    if (score > bestScore) {
      bestScore = score;
    }
  }

  /**
   * 同率トップを取得
   */
  const presetNames = Object.entries(scores)
    .filter(([, score]) => score === bestScore)
    .map(([name]) => name);

  /**
   * confidence
   */
  const scoreValues = Object.values(scores).sort((a, b) => b - a);

  const best = scoreValues[0] ?? 0;
  const second = scoreValues[1] ?? 0;

  const confidence = best === 0 ? 0 : best / (best + second);

  return {
    presetNames,
    confidence,
    scores,
  };
}

/* ======================================================
   SQL parse preset detection
====================================================== */

export async function detectSqlParsePresetByText(
  logText: string,
  config: LogParseConfig,
  presets: Record<string, { classify: readonly LogClassifierRule[] }>,
): Promise<LogFormatDetectionResult | null> {
  const parser = new LogParser(config);
  const result = await parser.parse({
    logText,
    stage: 'split',
  });
  if (result.ok) {
    return detectSqlParsePreset(result.logEvents, presets);
  }
  return null;
}

export function detectSqlParsePreset(
  logEvents: LogEvent[],
  presets: Record<string, { classify: readonly LogClassifierRule[] }>,
): LogFormatDetectionResult {
  const scores: Record<string, number> = {};

  let bestScore = 0;

  const sample = logEvents.slice(0, 300);

  const weight = {
    DATA_SOURCE: 0,
    CONN_AUTOCOMMIT: 0,
    CONN_TRANSACTIONAL: 0,
    TX_BEGIN: 1,
    TX_COMMIT: 1,
    TX_ROLLBACK: 1,
    TX_METHOD_ENTER: 1,
    TX_METHOD_EXIT: 0,
    SQL_START: 5,
    SQL_PARAMS: 2,
    SQL_COLUMNS: 1,
    SQL_ROW: 1,
    SQL_RESULT: 1,
    SQL_SINGLE: 5,
    SQL_ERROR: 2,
    SQL_ERROR_DETAIL: 1,
    FW_ERROR: 2,
    DDL: 4,
    ERROR: 0,
    NORMAL: 0,
  } satisfies Record<LogEventType, number>;

  for (const [name, preset] of Object.entries(presets)) {
    let score = 0;

    try {
      for (const event of sample) {
        const classified = classifyEvent(event, preset.classify);

        const w = weight[classified.eventType] ?? 0;

        score += w;
      }
    } catch (_) {
      // do nothing.
    }

    scores[name] = score;

    if (score > bestScore) {
      bestScore = score;
    }
  }

  const presetNames = Object.entries(scores)
    .filter(([, score]) => score === bestScore)
    .map(([name]) => name);

  const scoreValues = Object.values(scores).sort((a, b) => b - a);

  const best = scoreValues[0] ?? 0;
  const second = scoreValues[1] ?? 0;

  const confidence = best === 0 ? 0 : best / (best + second);

  return {
    presetNames,
    confidence,
    scores,
  };
}
/* ======================================================
   helper message formatter
====================================================== */

export function formatLogDetectionMessage(
  result: LogFormatDetectionResult,
): string {
  if (result.presetNames.length === 0) {
    return 'Log format not detected';
  }

  const percent = Math.round(result.confidence * 100);

  if (result.confidence >= 0.6) {
    return `Detected: ${result.presetNames} (${percent}% confidence)`;
  }

  if (result.confidence >= 0.35) {
    return `Likely: ${result.presetNames} (${percent}%)`;
  }

  return `Uncertain: ${result.presetNames} (${percent}%)`;
}
