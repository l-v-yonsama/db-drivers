import { ExtractorConfig, LogClassifierRule } from '../../../types';

export const SQL_LOG_PARSE_PRESETS = {
  Hibernate: {
    classify: [
      // connection
      {
        type: 'DATA_SOURCE',
        pattern: '^Fetching JDBC Connection from DataSource',
      },
      // transaction lifecycle (Spring)
      {
        type: 'TX_BEGIN',
        pattern: '^Creating new transaction with name ',
      },
      {
        type: 'TX_COMMIT',
        pattern: '^Initiating transaction commit',
      },
      {
        type: 'TX_ROLLBACK',
        pattern: '^Initiating transaction rollback',
      },
      // optional
      {
        type: 'TX_METHOD_ENTER',
        pattern: '^Getting transaction for ',
      },
      {
        type: 'TX_METHOD_EXIT',
        pattern: '^Completing transaction for ',
      },
      {
        type: 'SQL_START',
        field: 'logger',
        pattern: '^org\\.hibernate\\.SQL$',
      },
      {
        type: 'SQL_PARAMS',
        field: 'logger',
        pattern: '^org\\.hibernate\\.orm\\.jdbc\\.bind$',
        transforms: [
          {
            pattern: '^binding parameter (.*)',
            replace: '$1',
          },
        ],
      },
      {
        type: 'SQL_ERROR',
        pattern: '^SQL Error: \\w+, SQLState: \\w+',
      },
      {
        type: 'SQL_ERROR_DETAIL',
        field: 'logger',
        pattern: '.+SqlExceptionHelper$',
      },
      {
        type: 'FW_ERROR',
        pattern:
          '(ConstraintViolationException|EntityExistsException|PersistentObjectException)',
      },
    ],

    extractors: [
      {
        name: 'hibernate',
        framework: 'Hibernate',
        start: 'SQL_START',

        steps: [
          { type: 'SQL_START', action: 'captureSql' },
          { type: 'SQL_PARAMS', action: 'captureParams', optional: true },
        ],
      },
      {
        name: 'hibernate-sql-error',
        framework: 'Hibernate',
        start: 'SQL_ERROR',
        steps: [
          { type: 'SQL_ERROR', action: 'captureError' },
          {
            type: 'SQL_ERROR_DETAIL',
            action: 'captureErrorDetail',
            optional: true,
          },
        ],
      },
      {
        name: 'hibernate-orm-error',
        framework: 'Hibernate',
        start: 'FW_ERROR',
        steps: [{ type: 'FW_ERROR', action: 'captureError' }],
      },
    ],
  },

  MyBatis: {
    classify: [
      // connection / datasource
      {
        type: 'CONN_AUTOCOMMIT',
        pattern: 'will not be managed by Spring',
      },
      {
        type: 'CONN_TRANSACTIONAL',
        pattern: 'Registering transaction synchronization for SqlSession',
      },
      {
        type: 'DATA_SOURCE',
        pattern: '^Fetching JDBC Connection from DataSource',
        expandMessage: true,
      },
      // transaction lifecycle
      {
        type: 'TX_BEGIN',
        pattern: '^Creating new transaction with name ',
      },
      {
        type: 'TX_COMMIT',
        pattern: '^Initiating transaction commit',
      },
      {
        type: 'TX_ROLLBACK',
        pattern: '^Initiating transaction rollback',
      },
      // optional
      {
        type: 'TX_METHOD_ENTER',
        pattern: '^Getting transaction for ',
        expandMessage: true,
      },
      {
        type: 'TX_METHOD_EXIT',
        pattern: '^Completing transaction for ',
      },
      // SQL
      {
        type: 'SQL_START',
        pattern: '^==>\\s+Preparing:',
        transforms: [
          {
            pattern: '^==>\\s+Preparing:\\s*',
            replace: '',
          },
        ],
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
        pattern: '^==>\\s+Parameters:',
        transforms: [
          {
            pattern: '^==>\\s+Parameters:\\s*',
            replace: '',
          },
        ],
      },
      {
        type: 'SQL_COLUMNS',
        pattern: '^<==\\s+Columns:',
        transforms: [
          {
            pattern: '^<==\\s+Columns:',
            replace: '',
          },
        ],
      },
      {
        type: 'SQL_ROW',
        pattern: '^<==\\s+Row:',
        transforms: [
          {
            pattern: '^<==\\s+Row:',
            replace: '',
          },
        ],
      },
      {
        type: 'SQL_RESULT',
        pattern: '^<==\\s+(Total|Updates):',
        transforms: [
          {
            pattern: '^<==\\s+(?:Total|Updates):\\s*',
            replace: '',
          },
        ],
      },
      {
        type: 'SQL_ERROR',
        field: 'logger',
        pattern: '.+SQLErrorCodeSQLExceptionTranslator$',
      },
    ],

    extractors: [
      {
        name: 'mybatis',
        framework: 'MyBatis',
        start: 'SQL_START',

        steps: [
          { type: 'SQL_START', action: 'captureSql' },
          { type: 'SQL_PARAMS', action: 'captureParams', optional: true },
          { type: 'SQL_COLUMNS', action: 'captureColumns', optional: true },
          { type: 'SQL_ROW', action: 'captureRow', optional: true },
          { type: 'SQL_RESULT', action: 'captureResult', optional: true },
        ],
      },
      {
        name: 'mybatis-sql-error',
        framework: 'MyBatis',
        start: 'SQL_ERROR',
        steps: [{ type: 'SQL_ERROR', action: 'captureError' }],
      },
    ],
  },

  S2Jdbc: {
    classify: [
      {
        type: 'SQL_SINGLE',
        field: 'logger',
        pattern:
          '^query\\.(Auto|SqlFile)(Batch)?(Select|Insert|Update|Delete)Impl$',
      },
      {
        type: 'ERROR',
        field: 'level',
        pattern: '^ERROR$',
        expandMessage: true,
      },
    ],

    extractors: [
      {
        name: 's2jdbc',
        framework: 'S2Jdbc',
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
        pattern: '^\\[DOMA2221\\] EXIT',
      },

      // SQL start
      {
        type: 'SQL_SINGLE',
        pattern: '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?',
        transforms: [
          {
            pattern: '^\\[DOMA2076\\] SQL LOG( : PATH=\\[[^\\]]+\\],)?',
            replace: '',
          },
        ],
      },
      {
        type: 'SQL_ERROR',
        pattern: '^\\[DOMA2222\\] THROW .+EXCEPTION=.+',
        transforms: [
          {
            pattern: '^\\[DOMA2222\\] THROW .+EXCEPTION=(.+)',
            replace: '$1',
          },
        ],
      },
      {
        type: 'SQL_ERROR_DETAIL',
        pattern: 'The( detailed)? cause is as follows:',
        transforms: [
          {
            pattern: '[\\s\\S]+The( detailed)? cause is as follows: (.+)',
            replace: '$2',
          },
        ],
      },
    ],

    extractors: [
      {
        name: 'doma',
        framework: 'Doma',
        start: 'SQL_SINGLE',
        steps: [{ type: 'SQL_SINGLE', action: 'captureSql' }],
      },
      {
        name: 'doma-error',
        framework: 'Doma',
        start: 'SQL_ERROR',
        steps: [
          { type: 'SQL_ERROR', action: 'captureError' },
          {
            type: 'SQL_ERROR_DETAIL',
            action: 'captureErrorDetail',
            optional: true,
          },
        ],
      },
    ],
  },

  SpringJdbc: {
    classify: [
      // connection
      // transaction lifecycle (Spring)
      {
        type: 'TX_BEGIN',
        pattern: '^Creating new transaction with name ',
      },
      {
        type: 'TX_COMMIT',
        pattern: '^Initiating transaction commit',
      },
      {
        type: 'TX_ROLLBACK',
        pattern: '^Initiating transaction rollback',
      },
      // optional
      {
        type: 'TX_METHOD_ENTER',
        pattern: '^Getting transaction for ',
      },
      {
        type: 'TX_METHOD_EXIT',
        pattern: '^Completing transaction for ',
      },
      {
        type: 'SQL_START',
        pattern: 'Executing prepared SQL statement',
        transforms: [
          {
            pattern: '^.*\\[(.*)\\]$',
            replace: '$1',
          },
        ],
      },
      {
        type: 'SQL_PARAMS',
        pattern: '^Setting SQL statement parameter value:',
        transforms: [
          {
            pattern: '^Setting SQL statement parameter value: (.*)',
            replace: '$1',
          },
        ],
      },
      {
        type: 'SQL_ERROR',
        pattern: 'org.springframework.(jdbc|dao).[a-zA-Z0-9]+Exception: ',
      },
    ],

    extractors: [
      {
        name: 'spring-jdbc',
        framework: 'SpringJdbc',
        start: 'SQL_START',
        steps: [
          { type: 'SQL_START', action: 'captureSql' },
          { type: 'SQL_PARAMS', action: 'captureParams', optional: true },
        ],
      },
      {
        name: 'spring-jdbc-error',
        framework: 'SpringJdbc',
        start: 'SQL_ERROR',
        steps: [{ type: 'SQL_ERROR', action: 'captureError' }],
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
