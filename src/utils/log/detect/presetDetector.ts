import XRegExp from 'xregexp';

import { createLogEventPattern } from '../pattern/logEventPattern';
import { classifyEvent } from '../classify/classifyEvent';

import {
  LogEvent,
  LogEventSplitConfig,
  LogClassifierRule,
  LogFormatDetectionResult,
} from '../../../types';

/* ======================================================
   split preset detection
====================================================== */

export function detectLogSplitPreset(
  logText: string,
  presets: Record<string, { split: LogEventSplitConfig }>,
): LogFormatDetectionResult {
  const lines = logText.split(/\r?\n|\r/).slice(0, 200);

  const scores: Record<string, number> = {};

  let bestPreset: string | undefined;
  let bestScore = 0;

  for (const [name, preset] of Object.entries(presets)) {
    const startPattern = createLogEventPattern({
      fields: preset.split.fields,
      onlyStartMarker: true,
    });

    let matches = 0;

    for (const line of lines) {
      if (XRegExp.test(line, startPattern)) {
        matches++;
      }
    }

    const ratio = matches / lines.length;

    const score = matches + ratio * 10;

    scores[name] = score;

    if (score > bestScore) {
      bestScore = score;
      bestPreset = name;
    }
  }

  const scoreValues = Object.values(scores).sort((a, b) => b - a);

  const best = scoreValues[0] ?? 0;
  const second = scoreValues[1] ?? 0;

  const confidence = best === 0 ? 0 : best / (best + second);

  return {
    presetName: bestPreset,
    confidence,
    scores,
  };
}

/* ======================================================
   SQL parse preset detection
====================================================== */

export function detectSqlParsePreset(
  logEvents: LogEvent[],
  presets: Record<string, { classify: readonly LogClassifierRule[] }>,
): LogFormatDetectionResult {
  const scores: Record<string, number> = {};

  let bestPreset: string | undefined;
  let bestScore = 0;

  const sample = logEvents.slice(0, 300);

  for (const [name, preset] of Object.entries(presets)) {
    let matches = 0;

    for (const event of sample) {
      const classified = classifyEvent(event, preset.classify);

      if (classified.eventType !== 'NORMAL') {
        matches++;
      }
    }

    scores[name] = matches;

    if (matches > bestScore) {
      bestScore = matches;
      bestPreset = name;
    }
  }

  const scoreValues = Object.values(scores).sort((a, b) => b - a);

  const best = scoreValues[0] ?? 0;
  const second = scoreValues[1] ?? 0;

  const confidence = best === 0 ? 0 : best / (best + second);

  return {
    presetName: bestPreset,
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
  if (!result.presetName) {
    return 'Log format not detected';
  }

  const percent = Math.round(result.confidence * 100);

  if (result.confidence >= 0.6) {
    return `Detected: ${result.presetName} (${percent}% confidence)`;
  }

  if (result.confidence >= 0.35) {
    return `Likely: ${result.presetName} (${percent}%)`;
  }

  return `Uncertain: ${result.presetName} (${percent}%)`;
}
