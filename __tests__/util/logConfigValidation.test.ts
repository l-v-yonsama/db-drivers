import {
  LOG_EVENT_SPLIT_PRESETS,
  LogParseConfig,
  SQL_LOG_PARSE_PRESETS,
  validateConfig,
} from '../../src';

const createConfig = (): LogParseConfig => ({
  split: LOG_EVENT_SPLIT_PRESETS.Simple.split,
  classify: SQL_LOG_PARSE_PRESETS.MyBatis.classify,
  extractors: SQL_LOG_PARSE_PRESETS.MyBatis.extractors,
});

describe('validateConfig available stages', () => {
  it('does not advertise a stage for an invalid config structure', () => {
    expect(validateConfig({})).toEqual({
      ok: false,
      errorMessage: 'Invalid config structure.',
    });
  });

  it.each([undefined, 'sqlExecution', 'extract'] as const)(
    'does not advertise SQL execution when split validation fails (stage: %s)',
    (stage) => {
      const config = { ...createConfig(), split: { fields: [] } };
      expect(validateConfig(config, stage)).toEqual({
        ok: false,
        availableStage: undefined,
        errorMessage: 'At least one field definition is required.',
      });
    },
  );

  it('keeps split available when classification is incomplete', () => {
    const config = { ...createConfig(), classify: [] };
    expect(validateConfig(config)).toMatchObject({
      ok: false,
      availableStage: 'split',
    });
    expect(validateConfig(config, 'split')).toMatchObject({ ok: true });
    expect(validateConfig(config, 'classify')).toMatchObject({
      ok: false,
      availableStage: 'split',
    });
  });

  it('does not advertise a stage when a configured field has an invalid regex', () => {
    const config = createConfig();
    config.split = {
      fields: [
        {
          name: 'message',
          type: 'regex',
          pattern: '(',
          eventStartMarker: true,
        },
      ],
    };
    expect(validateConfig(config)).toMatchObject({
      ok: false,
      availableStage: undefined,
    });
    expect(validateConfig(config, 'split').ok).toBe(false);
  });

  it('keeps classification available when extraction is incomplete', () => {
    const config = { ...createConfig(), extractors: [] };
    expect(validateConfig(config)).toMatchObject({
      ok: false,
      availableStage: 'classify',
    });
    expect(validateConfig(config, 'classify')).toMatchObject({ ok: true });
    expect(validateConfig(config, 'extract')).toMatchObject({
      ok: false,
      availableStage: 'classify',
    });
  });

  it.each(['split', 'classify', 'sqlExecution'] as const)(
    'accepts a complete config at stage %s',
    (stage) => {
      expect(validateConfig(createConfig(), stage)).toEqual({
        ok: true,
        availableStage: stage,
        errorMessage: '',
      });
    },
  );

  it('accepts extraction and the default stage for a complete config', () => {
    for (const stage of [undefined, 'extract'] as const) {
      expect(validateConfig(createConfig(), stage)).toEqual({
        ok: true,
        availableStage: 'sqlExecution',
        errorMessage: '',
      });
    }
  });
});
