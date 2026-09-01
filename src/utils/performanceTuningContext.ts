import { parseQuery } from '../helpers';
import { PerformanceTuningContextParams } from '../types';

// Safe defaults / caps for getPerformanceTuningContext(), mirroring the limit-clamping approach already used by statementStatistics.ts.
export const DEFAULT_MAX_TABLES = 8;
export const MAX_MAX_TABLES = 25;

export const DEFAULT_MAX_COLUMNS_PER_TABLE = 40;
export const MAX_MAX_COLUMNS_PER_TABLE = 200;

export const DEFAULT_MAX_INDEXES_PER_TABLE = 20;
export const MAX_MAX_INDEXES_PER_TABLE = 100;

export const DEFAULT_MAX_PAYLOAD_BYTES = 200_000;
export const MAX_MAX_PAYLOAD_BYTES = 2_000_000;

export const DEFAULT_PLAN_TIMEOUT_MS = 5_000;
export const MAX_PLAN_TIMEOUT_MS = 30_000;

// Runtime whitelists for the string-literal unions in PerformanceTuningContextParams.
export const VALID_PLAN_MODES = ['estimate', 'analyze'] as const;
export const VALID_STATEMENT_SOURCES = [
  'statementStatistics',
  'sqlHistory',
  'editor',
] as const;

export type PerformanceTuningLimits = {
  maxTables: number;
  maxColumnsPerTable: number;
  maxIndexesPerTable: number;
  maxPayloadBytes: number;
};

export type NormalizedPerformanceTuningContextParams = {
  databaseName: string;
  schemaName?: string;

  statement: PerformanceTuningContextParams['statement'];

  plan: {
    mode: 'estimate' | 'analyze';
    binds?: unknown[];
    bindMarkers?: PerformanceTuningContextParams['plan']['bindMarkers'];
    bindMetadata?: PerformanceTuningContextParams['plan']['bindMetadata'];
    allowExecution: boolean;
    timeoutMs: number;
  };

  targetTables?: PerformanceTuningContextParams['targetTables'];
  tableAliasMap?: PerformanceTuningContextParams['tableAliasMap'];

  limits: PerformanceTuningLimits;
};

const clamp = (
  value: number | undefined,
  fallback: number,
  max: number,
  min = 1,
): number => {
  const requested = Number(value);
  if (!Number.isFinite(requested)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.floor(requested)));
};

// Pure defaulting/clamping: this never throws, even for malformed input - callers must run validatePerformanceTuningContextParams() first and act on its errors; this function only fills in safe defaults for what is left.
export function normalizePerformanceTuningContextParams(
  params: PerformanceTuningContextParams | null | undefined,
): NormalizedPerformanceTuningContextParams {
  const safe = params ?? ({} as Partial<PerformanceTuningContextParams>);
  const plan = safe.plan ?? {};
  const limits = safe.limits ?? {};

  return {
    databaseName: safe.databaseName ?? '',
    schemaName: safe.schemaName,
    statement: safe.statement ?? ({ sql: '', source: 'editor' } as const),
    plan: {
      mode: (VALID_PLAN_MODES as readonly string[]).includes(
        plan.mode as string,
      )
        ? (plan.mode as 'estimate' | 'analyze')
        : 'estimate',
      binds: plan.binds,
      bindMarkers: plan.bindMarkers,
      bindMetadata: plan.bindMetadata,
      allowExecution: plan.allowExecution ?? false,
      timeoutMs: clamp(plan.timeoutMs, DEFAULT_PLAN_TIMEOUT_MS, MAX_PLAN_TIMEOUT_MS),
    },
    targetTables: safe.targetTables,
    tableAliasMap: safe.tableAliasMap,
    limits: {
      maxTables: clamp(limits.maxTables, DEFAULT_MAX_TABLES, MAX_MAX_TABLES),
      maxColumnsPerTable: clamp(
        limits.maxColumnsPerTable,
        DEFAULT_MAX_COLUMNS_PER_TABLE,
        MAX_MAX_COLUMNS_PER_TABLE,
      ),
      maxIndexesPerTable: clamp(
        limits.maxIndexesPerTable,
        DEFAULT_MAX_INDEXES_PER_TABLE,
        MAX_MAX_INDEXES_PER_TABLE,
      ),
      maxPayloadBytes: clamp(
        limits.maxPayloadBytes,
        DEFAULT_MAX_PAYLOAD_BYTES,
        MAX_MAX_PAYLOAD_BYTES,
      ),
    },
  };
}

export function isSingleSelectStatement(sql: unknown): boolean {
  if (typeof sql !== 'string') {
    return false;
  }
  const trimmed = sql.trim();
  if (!trimmed) {
    return false;
  }
  // A single trailing `;` is fine; anything else containing `;` is treated as multiple statements even though parseQuery() below only looks at the first one - "SELECT 1; DELETE FROM orders;" must not pass.
  const withoutTrailingSemicolon = trimmed.replace(/;+\s*$/, '');
  if (withoutTrailingSemicolon.includes(';')) {
    return false;
  }
  try {
    const parsed = parseQuery(withoutTrailingSemicolon);
    return parsed?.ast?.type === 'select';
  } catch {
    return false;
  }
}

export function classifyPerformanceTuningStatement(sql: unknown): {
  kind: 'select' | 'insert' | 'update' | 'delete' | 'other';
  analyzeEligibility: { allowed: boolean; reason?: string };
} {
  if (isSingleSelectStatement(sql)) {
    return { kind: 'select', analyzeEligibility: { allowed: true } };
  }
  let kind: 'insert' | 'update' | 'delete' | 'other' = 'other';
  if (typeof sql === 'string' && sql.trim()) {
    try {
      const trimmed = sql.trim().replace(/;+\s*$/, '');
      if (!trimmed.includes(';')) {
        const type = parseQuery(trimmed)?.ast?.type;
        if (type === 'insert' || type === 'update' || type === 'delete') {
          kind = type;
        }
      }
    } catch {
      // Keep the fail-closed 'other' classification.
    }
  }
  return {
    kind,
    analyzeEligibility: {
      allowed: false,
      reason: 'Explain Analyze is limited to a single SELECT statement.',
    },
  };
}

export function validatePerformanceTuningContextParams(
  params: PerformanceTuningContextParams | null | undefined,
): string[] {
  const errors: string[] = [];

  if (params === null || params === undefined || typeof params !== 'object') {
    return ['params is required.'];
  }

  if (!params.databaseName) {
    errors.push('databaseName is required.');
  }

  const statement = params.statement;
  if (!statement || typeof statement !== 'object') {
    errors.push('statement is required.');
  } else {
    if (!statement.sql) {
      errors.push('statement.sql is required.');
    }
    if (
      !(VALID_STATEMENT_SOURCES as readonly string[]).includes(
        statement.source as string,
      )
    ) {
      errors.push(
        `statement.source must be one of: ${VALID_STATEMENT_SOURCES.join(', ')}.`,
      );
    }
  }

  const plan = params.plan;
  if (plan !== undefined && plan !== null && typeof plan === 'object') {
    if (
      plan.mode !== undefined &&
      !(VALID_PLAN_MODES as readonly string[]).includes(plan.mode as string)
    ) {
      errors.push(`plan.mode must be one of: ${VALID_PLAN_MODES.join(', ')}.`);
    }
    if (plan.mode === 'analyze' && plan.allowExecution !== true) {
      errors.push(
        "plan.allowExecution must be explicitly true when plan.mode is 'analyze'.",
      );
    }
    if (
      plan.mode === 'analyze' &&
      statement &&
      typeof statement === 'object' &&
      typeof statement.sql === 'string' &&
      statement.sql &&
      !isSingleSelectStatement(statement.sql)
    ) {
      errors.push(
        "plan.mode 'analyze' is only allowed for a single SELECT statement.",
      );
    }
  }

  return errors;
}
