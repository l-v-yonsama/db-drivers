import {
  LOG_EVENT_SPLIT_PRESETS,
  LogParseConfig,
  LogParser,
  SQL_LOG_PARSE_PRESETS,
} from '../../src';

const createConfig = (): LogParseConfig => ({
  split: LOG_EVENT_SPLIT_PRESETS.Simple.split,
  classify: SQL_LOG_PARSE_PRESETS.MyBatis.classify,
  extractors: SQL_LOG_PARSE_PRESETS.MyBatis.extractors,
});
const validLog = (message = 'Application started'): string =>
  `2026-03-12 10:11:22 INFO com.example.Service - ${message}`;
const invalidLog = '2026-03-12 10:11:23 missing required fields';
const noUnmatchedEvents = {
  unmatchedEventCount: 0,
  unmatchedEventStartLines: [],
};

describe('LogParser field extraction diagnostics', () => {
  it.each(['split', 'classify', 'extract', 'sqlExecution'] as const)(
    'reports the skipped block without changing successful events at stage %s',
    (stage) => {
      const result = new LogParser(createConfig()).parse({
        stage,
        logText: [
          validLog('First event'),
          '    continuation of first event',
          invalidLog,
          '    continuation of unmatched event',
          validLog('Last event'),
        ].join('\n'),
      });
      expect(result.ok).toBe(true);
      expect(result.logEvents.map((event) => event.lineNo)).toEqual([1, 5]);
      expect(result.logEvents[0].message).toContain(
        'continuation of first event',
      );
      expect(result).toMatchObject({
        diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [3] },
      });
    },
  );

  it('keeps successful SQL extraction when a different event is skipped', () => {
    const result = new LogParser(createConfig()).parse({
      logText: [
        invalidLog,
        validLog('==>  Preparing: select id from orders'),
        validLog('<==      Total: 1'),
      ].join('\n'),
    });
    expect(result.ok).toBe(true);
    expect(result.sqlExecutions).toHaveLength(1);
    expect(result.sqlExecutions[0].sql).toContain('select id from orders');
    expect(result).toMatchObject({
      diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [1] },
    });
  });

  it('does not treat normal non-SQL events as extraction failures', () => {
    const result = new LogParser(createConfig()).parse({ logText: validLog() });
    expect(result.ok).toBe(true);
    expect(result.sqlExecutions).toHaveLength(0);
    expect(result.logEvents).toHaveLength(1);
    expect(result).toMatchObject({ diagnostics: noUnmatchedEvents });
  });

  it.each(['', '\n', ' \t\r\n  '])(
    'does not report empty or whitespace-only input as an unmatched event: %j',
    (logText) => {
      const result = new LogParser(createConfig()).parse({ logText });
      expect(result.ok).toBe(true);
      expect(result.logEvents).toHaveLength(0);
      expect(result).toMatchObject({ diagnostics: noUnmatchedEvents });
    },
  );

  it('uses line 1 for an unmatched preamble before the first start marker', () => {
    const result = new LogParser(createConfig()).parse({
      logText: ['File header', 'Additional header', validLog()].join('\n'),
    });
    expect(result.logEvents[0].lineNo).toBe(3);
    expect(result).toMatchObject({
      diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [1] },
    });
  });

  it('reports a whole unmatched block even if no start marker matches', () => {
    const result = new LogParser(createConfig()).parse({
      logText: 'Unrecognized format\nAnother line',
    });
    expect(result.ok).toBe(true);
    expect(result.logEvents).toHaveLength(0);
    expect(result).toMatchObject({
      diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [1] },
    });
  });

  it.each(['\n', '\r\n', '\r'])(
    'keeps original line numbers for newline convention %j and a limited range',
    (newline) => {
      const logText = [validLog(), invalidLog, validLog(), invalidLog].join(
        newline,
      );
      const parser = new LogParser(createConfig());
      expect(parser.parse({ logText, linesToParse: 1 })).toMatchObject({
        diagnostics: noUnmatchedEvents,
      });
      expect(parser.parse({ logText, linesToParse: 3 })).toMatchObject({
        diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [2] },
      });
      expect(parser.parse({ logText, linesToParse: -1 })).toMatchObject({
        diagnostics: {
          unmatchedEventCount: 2,
          unmatchedEventStartLines: [2, 4],
        },
      });
    },
  );

  it.each([20, 25])(
    'counts all %i unmatched events but retains at most 20 positions',
    (count) => {
      const result = new LogParser(createConfig()).parse({
        logText: Array(count).fill(invalidLog).join('\n'),
      });
      expect(result).toMatchObject({
        diagnostics: {
          unmatchedEventCount: count,
          unmatchedEventStartLines: Array.from(
            { length: 20 },
            (_, index) => index + 1,
          ),
        },
      });
    },
  );

  it('counts unmatched blocks before message expansion, not expanded events', () => {
    const config = createConfig();
    config.classify = [{ type: 'NORMAL', pattern: '.*', expandMessage: true }];
    const result = new LogParser(config).parse({
      stage: 'split',
      logText: [validLog('first\nsecond'), invalidLog].join('\n'),
    });
    expect(result.logEvents).toHaveLength(2);
    expect(result).toMatchObject({
      diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [3] },
    });
  });

  it('does not retain diagnostics from a previous parse call', () => {
    const parser = new LogParser(createConfig());
    expect(parser.parse({ logText: invalidLog })).toMatchObject({
      diagnostics: { unmatchedEventCount: 1 },
    });
    expect(parser.parse({ logText: validLog() })).toMatchObject({
      diagnostics: noUnmatchedEvents,
    });
  });

  it('ignores a whitespace-only preamble while preserving later start lines', () => {
    const result = new LogParser(createConfig()).parse({
      logText: [' ', '\t', validLog(), invalidLog].join('\n'),
    });
    expect(result.logEvents[0].lineNo).toBe(3);
    expect(result).toMatchObject({
      diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [4] },
    });
  });

  it('retains partial diagnostics when a later stage fails', () => {
    const config = createConfig();
    config.classify = [
      { type: 'NORMAL', field: 'missing', pattern: '.*', expandMessage: true },
    ];
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    try {
      const result = new LogParser(config).parse({
        stage: 'split',
        logText: [invalidLog, validLog()].join('\n'),
      });
      expect(result).toMatchObject({
        ok: false,
        error: expect.stringContaining('missing'),
        diagnostics: { unmatchedEventCount: 1, unmatchedEventStartLines: [1] },
      });
    } finally {
      consoleError.mockRestore();
    }
  });
});
