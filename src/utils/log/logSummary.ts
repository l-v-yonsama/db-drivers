import {
  LogClassifierRule,
  LogEventType,
  ExtractorConfig,
  LogParseConfig,
} from '../../types';

/**
 * Human-readable descriptions for event types
 */
export const EVENT_TYPE_DESCRIPTIONS: Record<LogEventType, string> = {
  DATA_SOURCE: 'Data source connection',
  CONN_AUTOCOMMIT: 'Auto-commit connection',
  CONN_TRANSACTIONAL: 'Transactional connection',

  TX_BEGIN: 'Transaction started',
  TX_COMMIT: 'Transaction committed',
  TX_ROLLBACK: 'Transaction rolled back',

  TX_METHOD_ENTER: 'Enter transactional method',
  TX_METHOD_EXIT: 'Exit transactional method',

  SQL_START: 'SQL execution started',
  SQL_PARAMS: 'Bind parameters',
  SQL_COLUMNS: 'Result columns',
  SQL_ROW: 'Result row',
  SQL_RESULT: 'Execution result',
  SQL_SINGLE: 'Single SQL execution',
  SQL_ERROR: 'SQL error',
  SQL_ERROR_DETAIL: 'Error detail log',
  FW_ERROR: 'ORM error',

  DDL: 'DDL execution',
  NORMAL: 'Normal log',
  ERROR: 'Error log',
};

export function summarizeClassifyRules(
  rules: readonly LogClassifierRule[],
): string {
  return rules
    .map((r, i) => {
      const base = EVENT_TYPE_DESCRIPTIONS[r.type] ?? r.type;

      const fieldInfo =
        r.field && r.field !== 'message' ? ` (field: ${r.field})` : '';

      const options = [
        r.transforms ? 'transforms' : null,
        r.context ? 'context' : null,
        r.expandMessage ? 'expand' : null,
      ]
        .filter(Boolean)
        .join(', ');

      const optionInfo = options ? ` [${options}]` : '';

      return `${i + 1}. ${base}${fieldInfo}${optionInfo}`;
    })
    .join('\n');
}

export function summarizeExtractors(
  extractors: readonly ExtractorConfig[],
): string {
  return extractors
    .map((ex, i) => {
      const header = `${i + 1}. ${ex.name} (${ex.framework ?? 'custom'})`;

      const steps = ex.steps
        .map((s) => {
          const base = EVENT_TYPE_DESCRIPTIONS[s.type] ?? s.type;

          const optional = s.optional ? ' (optional)' : '';

          const action =
            s.action === 'captureField' && s.field
              ? ` → ${s.action}(${s.field})`
              : s.action
              ? ` → ${s.action}`
              : '';

          return `  - ${base}${optional}${action}`;
        })
        .join('\n');

      return `${header}\n${steps}`;
    })
    .join('\n');
}

/**
 * Debug summary for UI
 */
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

export function summarizeClassifyRulesOneLine(
  rules: readonly LogClassifierRule[],
  maxLen = 120,
): string {
  const text = rules.map((r) => `${r.type}:${r.pattern}`).join(', ');
  return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
}
