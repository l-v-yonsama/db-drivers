import { ExtractorConfig, LogClassifierRule } from '../../../types';

export const SQL_LOG_PARSE_PRESETS = {
  Hibernate: {
    classify: [
      // connection
      {
        type: 'DATA_SOURCE',
        patternType: 'regex',
        pattern: '^Fetching JDBC Connection from DataSource',
      },
      // transaction lifecycle (Spring)
      {
        type: 'TX_BEGIN',
        patternType: 'regex',
        pattern: '^Creating new transaction with name ',
      },
      {
        type: 'TX_COMMIT',
        patternType: 'regex',
        pattern: '^Initiating transaction commit',
      },
      {
        type: 'TX_ROLLBACK',
        patternType: 'regex',
        pattern: '^Initiating transaction rollback',
      },
      // optional
      {
        type: 'TX_METHOD_ENTER',
        patternType: 'regex',
        pattern: '^Getting transaction for ',
      },
      {
        type: 'TX_METHOD_EXIT',
        patternType: 'regex',
        pattern: '^Completing transaction for ',
      },
      {
        type: 'SQL_START',
        field: 'logger',
        patternType: 'regex',
        pattern: '^org\\.hibernate\\.SQL$',
      },
      {
        type: 'SQL_PARAMS',
        field: 'logger',
        patternType: 'regex',
        pattern: '^org\\.hibernate\\.orm\\.jdbc\\.bind$',
        transform: {
          pattern: '^binding parameter (.*)',
          replace: '$1',
        },
      },
    ],

    extractors: [
      {
        name: 'hibernate',
        framework: 'hibernate',
        start: 'SQL_START',

        steps: [
          { type: 'SQL_START', action: 'captureSql' },
          { type: 'SQL_PARAMS', action: 'captureParams', optional: true },
        ],
      },
    ],
  },

  MyBatis: {
    classify: [
      // connection / datasource
      {
        type: 'CONN_AUTOCOMMIT',
        patternType: 'regex',
        pattern: 'will not be managed by Spring',
      },
      {
        type: 'CONN_TRANSACTIONAL',
        patternType: 'regex',
        pattern: 'Registering transaction synchronization for SqlSession',
      },
      {
        type: 'DATA_SOURCE',
        patternType: 'regex',
        pattern: '^Fetching JDBC Connection from DataSource',
        expandMessage: true,
      },
      // transaction lifecycle
      {
        type: 'TX_BEGIN',
        patternType: 'regex',
        pattern: '^Creating new transaction with name ',
      },
      {
        type: 'TX_COMMIT',
        patternType: 'regex',
        pattern: '^Initiating transaction commit',
      },
      {
        type: 'TX_ROLLBACK',
        patternType: 'regex',
        pattern: '^Initiating transaction rollback',
      },
      // optional
      {
        type: 'TX_METHOD_ENTER',
        patternType: 'regex',
        pattern: '^Getting transaction for ',
        expandMessage: true,
      },
      {
        type: 'TX_METHOD_EXIT',
        patternType: 'regex',
        pattern: '^Completing transaction for ',
      },
      // SQL
      {
        type: 'SQL_START',
        patternType: 'regex',
        pattern: '^==>\\s+Preparing:',
        transform: {
          pattern: '^==>\\s+Preparing:\\s*',
          replace: '',
        },
        context: [
          {
            contextName: 'daoClass',
            eventFieldName: 'logger',
            pattern: '^(.+)\\.([^.]+)$',
            replace: '$1',
          },
          {
            contextName: 'daoMethod',
            eventFieldName: 'logger',
            pattern: '^(.+)\\.([^.]+)$',
            replace: '$2',
          },
        ],
      },
      {
        type: 'SQL_PARAMS',
        patternType: 'regex',
        pattern: '^==>\\s+Parameters:',
        transform: {
          pattern: '^==>\\s+Parameters:\\s*',
          replace: '',
        },
      },
      {
        type: 'SQL_COLUMNS',
        patternType: 'regex',
        pattern: '^<==\\s+Columns:',
        transform: {
          pattern: '^<==\\s+Columns:',
          replace: '',
        },
      },
      {
        type: 'SQL_ROW',
        patternType: 'regex',
        pattern: '^<==\\s+Row:',
        transform: {
          pattern: '^<==\\s+Row:',
          replace: '',
        },
      },
      {
        type: 'SQL_RESULT',
        patternType: 'regex',
        pattern: '^<==\\s+(Total|Updates):',
        transform: {
          pattern: '^<==\\s+(?:Total|Updates):\\s*',
          replace: '',
        },
      },
    ],

    extractors: [
      {
        name: 'mybatis',
        framework: 'mybatis',
        start: 'SQL_START',

        steps: [
          { type: 'SQL_START', action: 'captureSql' },
          { type: 'SQL_PARAMS', action: 'captureParams', optional: true },
          { type: 'SQL_COLUMNS', action: 'captureColumns', optional: true },
          { type: 'SQL_ROW', action: 'captureRow', optional: true },
          { type: 'SQL_RESULT', action: 'captureResult', optional: true },
        ],
      },
    ],
  },

  S2Jdbc: {
    classify: [
      {
        type: 'SQL_SINGLE',
        field: 'logger',
        patternType: 'regex',
        pattern:
          '^query\\.(Auto|SqlFile)(Batch)?(Select|Insert|Update|Delete)Impl$',
      },
    ],

    extractors: [
      {
        name: 's2jdbc',
        framework: 's2jdbc',
        start: 'SQL_SINGLE',
        steps: [{ type: 'SQL_SINGLE', action: 'captureSql' }],
      },
    ],
  },

  Doma: {
    classify: [
      // connection

      // DAO lifecycle
      {
        type: 'TX_METHOD_ENTER',
        patternType: 'regex',
        pattern: '^\\[DOMA2220\\] ENTER',
        context: [
          {
            contextName: 'daoClass',
            pattern: '^.*CLASS=([^\\s]+).*',
            replace: '$1',
          },
          {
            contextName: 'daoMethod',
            pattern: '^.*METHOD=([^\\s]+).*',
            replace: '$1',
          },
        ],
      },
      {
        type: 'TX_METHOD_EXIT',
        patternType: 'regex',
        pattern: '^\\[DOMA2221\\] EXIT',
      },

      // SQL start
      {
        type: 'SQL_SINGLE',
        patternType: 'regex',
        pattern: '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?',
        transform: {
          pattern: '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?',
          replace: '',
        },
      },
    ],

    extractors: [
      {
        name: 'doma',
        framework: 'doma',
        start: 'SQL_SINGLE',
        steps: [{ type: 'SQL_SINGLE', action: 'captureSql' }],
      },
    ],
  },

  SpringJdbc: {
    classify: [
      {
        type: 'SQL_SINGLE',
        patternType: 'regex',
        pattern: 'Executing prepared SQL statement',
        transform: {
          pattern: '^.*\\[(.*)\\]$',
          replace: '$1',
        },
      },
    ],

    extractors: [
      {
        name: 'spring-jdbc',
        framework: 'spring-jdbc',
        start: 'SQL_SINGLE',
        steps: [{ type: 'SQL_SINGLE', action: 'captureSql' }],
      },
    ],
  },
} as const satisfies Record<
  string,
  {
    classify: readonly LogClassifierRule[];
    extractors: readonly ExtractorConfig[];
  }
>;

export type SqlLogParsePresetName = keyof typeof SQL_LOG_PARSE_PRESETS;
