import XRegExp from 'xregexp';
import { LogEventSplitConfig, SpligLogText } from '../../../types';
import { createLogEventPattern } from '../pattern/logEventPattern';

export function splitLogEvents(
  logText: string,
  config: LogEventSplitConfig,
  debug = false,
): SpligLogText[] {
  const startPattern = createLogEventPattern({
    fields: config.fields,
    onlyStartMarker: true,
  });
  if (debug) {
    console.debug('startPattern=', startPattern);
  }
  const lines = logText.split(/\r?\n|\r/);

  const events: SpligLogText[] = [];
  let lineNo = 0;
  let current: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isStart = XRegExp.test(line, startPattern);
    if (debug) {
      console.debug('line=', JSON.stringify(line), 'isStart=', isStart);
    }
    // const isContinuation = line.startsWith(' ') || line.startsWith('\t');

    if (isStart) {
      // if (isStart && !isContinuation) {
      if (current.length > 0) {
        events.push({ lineNo, text: current.join('\n') });
      }

      lineNo = i + 1;
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    events.push({ lineNo, text: current.join('\n') });
  }

  return events;
}
