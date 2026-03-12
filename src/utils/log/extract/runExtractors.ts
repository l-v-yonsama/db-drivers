import {
  ClassifiedEvent,
  ExtractorConfig,
  LogParseConfig,
  SqlLogEvent,
} from '../../../types';

export function runExtractors(
  events: ClassifiedEvent[],
  extractors: readonly ExtractorConfig[],
): Partial<SqlLogEvent>[] {
  const results: Partial<SqlLogEvent>[] = [];

  const states = extractors.map(() => ({
    stepIndex: -1,
    buffer: {} as Partial<SqlLogEvent>,
  }));

  for (const event of events) {
    extractors.forEach((extractor, i) => {
      const state = states[i];
      const { stepIndex, buffer } = state;

      let idx = stepIndex;

      /* START */

      if (idx === -1) {
        if (event.eventType !== extractor.start) {
          return;
        }

        idx = 0;

        state.buffer = {
          lineNo: event.lineNo,
          timestamp: event.timestamp,
        };
      }

      /* step machine */

      while (idx !== -1 && idx < extractor.steps.length) {
        const step = extractor.steps[idx];

        if (event.eventType === step.type) {
          if (step.action === 'captureSql') {
            state.buffer.rawSql = event.transformed ?? event.message;
          }

          if (step.action === 'captureParams') {
            const rawParams = event.transformed ?? event.message;
            if (rawParams !== '') {
              state.buffer.rawParams = rawParams;
            }
          }

          if (step.action === 'captureField' && step.field) {
            const field = step.field as keyof SqlLogEvent;
            (state.buffer as any)[field] = event.transformed ?? event.message;
          }

          idx++;

          if (idx >= extractor.steps.length) {
            results.push(state.buffer);

            state.buffer = {};
            idx = -1;
          }

          break;
        }

        if (step.optional) {
          idx++;
          continue;
        }

        break;
      }

      state.stepIndex = idx;
    });
  }

  return results;
}

export function summarizeExtractorsOneLine(
  extractors: LogParseConfig['extractors'],
  maxLen = 120,
): string {
  const text = extractors
    .map((ex) => {
      const steps = ex.steps
        .map((s) => {
          const optional = s.optional ? '?' : '';

          if (s.action === 'captureField' && s.field) {
            return `${s.type}${optional}→${s.action}(${s.field})`;
          }

          return `${s.type}${optional}→${s.action}`;
        })
        .join(', ');

      return `${ex.name}: ${steps}`;
    })
    .join(' | ');

  return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
}
