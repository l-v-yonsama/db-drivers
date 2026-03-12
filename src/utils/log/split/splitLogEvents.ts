import XRegExp from 'xregexp';
import { LogEventSplitConfig } from '../../../types';
import { createLogEventPattern } from '../pattern/logEventPattern';

export function splitLogEvents(
  logText: string,
  config: LogEventSplitConfig,
): string[] {
  const startPattern = createLogEventPattern({
    fields: config.fields,
    onlyStartMarker: true,
  });

  const lines = logText.split(/\r?\n|\r/);

  const events: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isStart = XRegExp.test(line, startPattern);
    const isContinuation = line.startsWith(' ') || line.startsWith('\t');

    if (isStart && !isContinuation) {
      if (current.length > 0) {
        events.push(current.join('\n'));
      }

      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    events.push(current.join('\n'));
  }

  return events;
}
