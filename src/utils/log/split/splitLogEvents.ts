import XRegExp from 'xregexp';
import { LogEventSplitConfig, SpligLogText } from '../../../types';
import { createLogEventPattern } from '../pattern/logEventPattern';

export function splitLogEvents(
  logText: string,
  config: LogEventSplitConfig,
  linesToParse?: number,
  withComparisonInfo = false,
): SpligLogText[] {
  const startPattern = createLogEventPattern({
    fields: config.fields,
    onlyStartMarker: true,
  });

  const lines = logText.split(/\r?\n|\r/);

  const events: SpligLogText[] = [];
  let lineNo = 0;
  let current: string[] = [];
  let processedLines = 0;

  const addEvent = (endLine: number): void => {
    if (current.length === 0) return;
    const startLine = Math.max(1, lineNo);
    events.push({
      lineNo,
      text: current.join('\n'),
      ...(withComparisonInfo
        ? { sourceStartLine: startLine, sourceEndLine: Math.max(startLine, endLine) }
        : {}),
    });
  };

  for (let i = 0; i < lines.length; i++) {
    if (linesToParse && linesToParse > 0 && i >= linesToParse) {
      break;
    }
    const line = lines[i];
    processedLines = i + 1;
    const isStart = XRegExp.test(line, startPattern);

    if (isStart) {
      if (current.length > 0) {
        addEvent(i);
      }

      lineNo = i + 1;
      current = [line];
      continue;
    }

    current.push(line);
  }

  const trailingEmptyLine = /(?:\r\n|\r|\n)$/.test(logText) && processedLines === lines.length;
  addEvent(processedLines - Number(trailingEmptyLine));

  return events;
}
