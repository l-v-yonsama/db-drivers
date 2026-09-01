import { ClassifiedEvent, ExtractorConfig, SqlFragment } from '../../../types';

type ExtractorState = {
  stepIndex: number;
  buffer: SqlFragment[];
};

type DaoContext = {
  daoClass?: string;
  daoMethod?: string;
};

const DEFAULT_THREAD_KEY = '__default__';

function threadKeyOf(event: ClassifiedEvent): string {
  return event.thread?.trim() || DEFAULT_THREAD_KEY;
}

/** Extract SQL related fragments from classified log events. */
export function runExtractors(
  events: ClassifiedEvent[],
  extractors: readonly ExtractorConfig[],
): SqlFragment[] {
  const results: SqlFragment[] = [];

  // Extractor state and DAO context are kept per thread so that interleaved logs from concurrent threads don't flush/overwrite each other's in-progress SQL capture or DAO context.
  const statesByThread = new Map<string, ExtractorState[]>();
  const daoContextByThread = new Map<string, DaoContext>();

  const getStates = (threadKey: string): ExtractorState[] => {
    let states = statesByThread.get(threadKey);
    if (!states) {
      states = extractors.map(() => ({
        stepIndex: -1,
        buffer: [] as SqlFragment[],
      }));
      statesByThread.set(threadKey, states);
    }
    return states;
  };

  const getDaoContext = (threadKey: string): DaoContext => {
    let context = daoContextByThread.get(threadKey);
    if (!context) {
      context = {};
      daoContextByThread.set(threadKey, context);
    }
    return context;
  };

  for (const event of events) {
    const threadKey = threadKeyOf(event);
    const states = getStates(threadKey);
    const daoContext = getDaoContext(threadKey);

    if (event.eventContext?.daoClass) {
      daoContext.daoClass = event.eventContext.daoClass;
    }

    if (event.eventContext?.daoMethod) {
      daoContext.daoMethod = event.eventContext.daoMethod;
    }

    extractors.forEach((extractor, i) => {
      const state = states[i];
      let idx = state.stepIndex;

      if (idx === -1) {
        if (event.eventType !== extractor.start) {
          return;
        }

        idx = 0;
        state.buffer = [];
      } else if (event.eventType === extractor.start) {
        /** START while collecting Example (Hibernate DDL): SQL_START drop table SQL_START create table Previous SQL must be flushed. */
        if (state.buffer.length > 0) {
          results.push(...state.buffer);
        }

        state.buffer = [];
        idx = 0;
      }

      while (idx !== -1 && idx < extractor.steps.length) {
        const step = extractor.steps[idx];

        if (event.eventType === step.type) {
          const value = event.transformed ?? event.message ?? '';
          const baseFragment = {
            lineNo: event.lineNo,
            messageSeq: event.messageSeq,
            timestamp: event.timestamp,
            thread: event.thread,
            framework: extractor.framework,
            value,
            daoClass: daoContext.daoClass,
            daoMethod: daoContext.daoMethod,
          };
          if (step.action === 'captureSql') {
            state.buffer.push({
              ...baseFragment,
              type: step.type === 'SQL_SINGLE' ? 'SQL_SINGLE' : 'SQL',
            });
          }

          if (step.action === 'captureParams') {
            state.buffer.push({
              ...baseFragment,
              type: 'PARAMS',
            });

            // ★★★ PARAMSは複数回出るので step を進めない
            break;
          }

          if (step.action === 'captureColumns') {
            state.buffer.push({
              ...baseFragment,
              type: 'COLUMNS',
            });
          }

          if (step.action === 'captureRow') {
            state.buffer.push({
              ...baseFragment,
              type: 'ROW',
            });
          }

          if (step.action === 'captureResult') {
            state.buffer.push({
              ...baseFragment,
              type: 'RESULT',
            });
          }

          if (step.action === 'captureError') {
            state.buffer.push({
              ...baseFragment,
              type: step.type === 'FW_ERROR' ? 'FW_ERROR' : 'SQL_ERROR',
            });
          }
          if (step.action === 'captureErrorDetail') {
            state.buffer.push({
              ...baseFragment,
              type: 'SQL_ERROR_DETAIL',
            });
          }

          idx++;

          if (idx >= extractor.steps.length) {
            results.push(...state.buffer);
            state.buffer = [];
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

  /** EOF flush Handles cases like: */
  statesByThread.forEach((states) => {
    states.forEach((state) => {
      if (state.buffer.length > 0) {
        results.push(...state.buffer);
      }
    });
  });

  return results.sort((a, b) => {
    if (a.lineNo !== b.lineNo) {
      return a.lineNo - b.lineNo;
    }

    return (a.messageSeq ?? 0) - (b.messageSeq ?? 0);
  });
}
