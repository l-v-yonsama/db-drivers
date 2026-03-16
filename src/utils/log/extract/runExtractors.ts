import {
  ClassifiedEvent,
  ExtractorConfig,
  LogParseConfig,
  SqlFragment,
} from '../../../types';

/**
 * classifyEvent 済みログイベントから SQL 関連フラグメントを抽出する。
 *
 * 想定入力（典型的な MyBatis ログ）:
 *
 *   SQL_START   ==> Preparing: select * from users where id = ?
 *   SQL_PARAMS  ==> Parameters: 1(Integer)
 *   SQL_RESULT  <== Total: 1
 *
 * ただし実際のログでは以下のような「ノイズ」が入ることがある。
 *
 *   SQL_START
 *   SQL_PARAMS
 *   NORMAL      ← SQLとは関係ないログ
 *   NORMAL
 *   SQL_RESULT
 *
 * 本処理ではそのようなノイズが入っても
 * SQLの抽出状態を壊さないように設計している。
 */
export function runExtractors(
  events: ClassifiedEvent[],
  extractors: readonly ExtractorConfig[],
): SqlFragment[] {
  const results: SqlFragment[] = [];

  /**
   * extractorごとに独立した state machine を持つ。
   *
   * stepIndex = -1
   *   → SQL収集中ではない（待機状態）
   *
   * stepIndex >= 0
   *   → SQL収集中（stepsの何番目かを待っている）
   */
  const states = extractors.map(() => ({
    stepIndex: -1,
    buffer: [] as SqlFragment[],
  }));

  let daoClass:string|undefined = undefined;
  let daoMethod:string|undefined = undefined;
  for (const event of events) {
    if (event.eventContext && event.eventContext['daoClass'] && event.eventContext['daoMethod']) {
      daoClass = event.eventContext['daoClass'];
      daoMethod = event.eventContext['daoMethod'];
    }

    extractors.forEach((extractor, i) => {
      const state = states[i];
      let idx = state.stepIndex;

      /**
       * SQL収集開始検出
       *
       * まだ何も収集していない状態（idx === -1）で
       * startイベントが来たら SQL収集を開始する。
       *
       * 例:
       *
       *   SQL_START
       */
      if (idx === -1) {
        if (event.eventType !== extractor.start) {
          return;
        }

        idx = 0;
        state.buffer = [];
      }

      /**
       * ★重要な耐障害処理 (robustness fix)
       *
       * SQL収集中に、再び SQL_START が来た場合の対処。
       *
       * これは通常ありえないが、以下のようなログ崩れが
       * 実際のログでは発生することがある。
       *
       * 例:
       *
       *   SQL_START
       *   SQL_PARAMS
       *   NORMAL
       *   SQL_START   ← 本来 RESULT が来るはず
       *
       * この場合、
       * 「前のSQLは途中で壊れた」と判断し
       * buffer を破棄して新しいSQLとして開始する。
       */
      if (idx !== -1 && event.eventType === extractor.start) {
        state.buffer = [];
        idx = 0;
      }

      /**
       * step machine
       *
       * extractor.steps の順序に従ってイベントを処理する。
       */
      while (idx !== -1 && idx < extractor.steps.length) {
        const step = extractor.steps[idx];

        if (event.eventType === step.type) {
          const value = event.transformed ?? event.message;

          /**
           * SQL本体取得
           *
           * 例:
           *   ==> Preparing: insert into users(name) values(?)
           */
          if (step.action === 'captureSql') {
            state.buffer.push({
              lineNo: event.lineNo,
              messageSeq: event.messageSeq,
              timestamp: event.timestamp,
              thread: event.thread,
              type: step.type === 'SQL_SINGLE' ? 'SQL_SINGLE' : 'SQL',
              value,
              daoClass,
              daoMethod
            });
          }

          /**
           * SQLパラメータ取得
           *
           * 例:
           *   ==> Parameters: 9(Integer)
           *
           * SQL順序を維持するため buffer に保存する。
           */
          if (step.action === 'captureParams') {
            state.buffer.push({
              lineNo: event.lineNo,
              messageSeq: event.messageSeq,
              timestamp: event.timestamp,
              thread: event.thread,
              type: 'PARAMS',
              value,
              daoClass,
              daoMethod
            });
          }

          if (step.action === 'captureColumns') {
            state.buffer.push({
              lineNo: event.lineNo,
              messageSeq: event.messageSeq,
              timestamp: event.timestamp,
              thread: event.thread,
              type: 'COLUMNS',
              value,
              daoClass,
              daoMethod
            });
          }

          if (step.action === 'captureRow') {
            state.buffer.push({
              lineNo: event.lineNo,
              messageSeq: event.messageSeq,
              timestamp: event.timestamp,
              thread: event.thread,
              type: 'ROW',
              value,
              daoClass,
              daoMethod
            });
          }

          /**
           * SQL結果取得
           *
           * 例:
           *   <== Updates: 1
           *   <== Total: 1
           */
          if (step.action === 'captureResult') {
            state.buffer.push({
              lineNo: event.lineNo,
              messageSeq: event.messageSeq,
              timestamp: event.timestamp,
              thread: event.thread,
              type: 'RESULT',
              value,
              daoClass,
              daoMethod
            });
          }

          if (step.action === 'captureError') {
            state.buffer.push({
              lineNo: event.lineNo,
              messageSeq: event.messageSeq,
              timestamp: event.timestamp,
              thread: event.thread,
              type: 'ERROR',
              value,
              daoClass,
              daoMethod
            });
          }

          idx++;

          /**
           * stepsをすべて処理したら SQL抽出完了
           *
           * bufferの内容を results に追加する
           */
          if (idx >= extractor.steps.length) {
            results.push(...state.buffer);
            state.buffer = [];
            idx = -1;
          }

          break;
        }

        /**
         * optional step の場合
         * 次のstepへスキップ
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
   * fragmentをログ順に並べる
   *
   * 第一キー: lineNo
   * 第二キー: messageSeq
   */
  return results.sort((a, b) => {
    if (a.lineNo !== b.lineNo) {
      return a.lineNo - b.lineNo;
    }
    return (a.messageSeq ?? 0) - (b.messageSeq ?? 0);
  });
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
