import { ClassifiedEvent, ExtractorConfig, SqlFragment } from '../../../types';

/**
 * Extract SQL related fragments from classified log events.
 *
 * Robust against noisy logs and broken sequences.
 */
export function runExtractors(
  events: ClassifiedEvent[],
  extractors: readonly ExtractorConfig[],
): SqlFragment[] {
  const results: SqlFragment[] = [];

  const states = extractors.map(() => ({
    stepIndex: -1,
    buffer: [] as SqlFragment[],
  }));

  let daoClass: string | undefined;
  let daoMethod: string | undefined;

  for (const event of events) {
    /**
     * DAO context capture
     */
    if (event.eventContext?.daoClass) {
      daoClass = event.eventContext.daoClass;
    }

    if (event.eventContext?.daoMethod) {
      daoMethod = event.eventContext.daoMethod;
    }

    extractors.forEach((extractor, i) => {
      const state = states[i];
      let idx = state.stepIndex;

      /**
       * START detection
       */
      if (idx === -1) {
        if (event.eventType !== extractor.start) {
          return;
        }

        idx = 0;
        state.buffer = [];
      } else if (event.eventType === extractor.start) {
        /**
         * START while collecting
         *
         * Example (Hibernate DDL):
         *
         *   SQL_START drop table
         *   SQL_START create table
         *
         * Previous SQL must be flushed.
         */
        if (state.buffer.length > 0) {
          results.push(...state.buffer);
        }

        state.buffer = [];
        idx = 0;
      }

      /**
       * Step machine
       */
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
            daoClass,
            daoMethod,
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

          /**
           * Steps finished
           */
          if (idx >= extractor.steps.length) {
            results.push(...state.buffer);
            state.buffer = [];
            idx = -1;
          }

          break;
        }

        /**
         * optional step
         */
        if (step.optional) {
          idx++;
          continue;
        }

        break;
      }

      state.stepIndex = idx;
    });
  }

  /**
   * EOF flush
   *
   * Handles cases like:
   *
   *   SQL_START
   *   SQL_PARAMS
   *   (log end)
   */
  states.forEach((state) => {
    if (state.buffer.length > 0) {
      results.push(...state.buffer);
    }
  });

  /**
   * sort fragments
   */
  return results.sort((a, b) => {
    if (a.lineNo !== b.lineNo) {
      return a.lineNo - b.lineNo;
    }

    return (a.messageSeq ?? 0) - (b.messageSeq ?? 0);
  });
}
