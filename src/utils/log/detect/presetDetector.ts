import XRegExp from 'xregexp';
import { createLogEventPattern } from '../pattern/logEventPattern';
import { LogFormatDetectionResult, LogParseConfig } from '../../../types';

export function detectLogFormatWithConfidence(
  logText: string,
  presets: Record<string, LogParseConfig>,
): LogFormatDetectionResult {
  const lines = logText.split(/\r?\n|\r/).slice(0, 300);

  const scores: Record<string, number> = {};

  let bestScore = 0;
  let bestPreset: string | undefined;

  for (const [name, preset] of Object.entries(presets)) {
    const startPattern = createLogEventPattern({
      fields: preset.split.fields,
      onlyStartMarker: true,
    });

    let startMatches = 0;
    let classifyMatches = 0;

    for (const line of lines) {
      if (XRegExp.test(line, startPattern)) {
        startMatches++;
      }

      for (const rule of preset.classify) {
        if (rule.patternType === 'literal') {
          if (line.indexOf(rule.pattern) >= 0) {
            classifyMatches++;
          }
        } else {
          if (new RegExp(rule.pattern, 'i').test(line)) {
            classifyMatches++;
          }
        }
      }
    }

    const startScore = startMatches * 2;
    const classifyScore = classifyMatches * 5;

    const startRatio = startMatches / lines.length;

    let ratioBonus = 0;

    if (startRatio > 0.1) {
      ratioBonus = 10;
    }

    const score = startScore + classifyScore + ratioBonus;

    scores[name] = score;

    if (score > bestScore) {
      bestScore = score;
      bestPreset = name;
    }
  }

  const confidence =
    bestScore === 0
      ? 0
      : bestScore / Object.values(scores).reduce((a, b) => a + b, 0);

  return {
    presetName: bestPreset,
    confidence,
    scores,
  };
}

export function formatLogDetectionMessage(
  result: LogFormatDetectionResult,
): string {
  if (!result.presetName) {
    return 'Log format not detected';
  }

  const percent = Math.round(result.confidence * 100);

  if (result.confidence > 0.75) {
    return `Log format: ${result.presetName} (${percent}% confidence)`;
  }

  if (result.confidence > 0.4) {
    return `Log format likely: ${result.presetName} (${percent}%)`;
  }

  return `Log format uncertain: ${result.presetName} (${percent}%)`;
}
