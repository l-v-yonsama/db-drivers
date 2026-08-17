import { GeneralColumnType } from '@l-v-yonsama/rdh';

// See misc/design/performance-tuning-query-statistics-parameter-input-plan.ja.md
// (db-notebook repo) §5.1/§6 for the full rationale. In short: when a
// Statement Statistics row's SQL still has bind placeholders in it,
// estimateBindParameters() gives the UI a best-effort starting point for a
// Bind Parameters input table - never a guaranteed-correct one. Callers are
// expected to let the user add/remove rows to correct Scanner mistakes.

/**
 * Where a bind placeholder's marker occurs in the original SQL text.
 * Independent of `EstimatedBindParameter.position` (the bind order): a
 * placeholder that's textually second can still be bind #1 (e.g. PostgreSQL
 * `$1` appearing after `$2` in the SQL text).
 */
export type EstimatedBindParameterLocation = {
  /** 1-based line number in the original SQL text. */
  line: number;
  /** 1-based column (character position) within that line. */
  column: number;
};

export type EstimatedBindParameter = {
  /** 1-based estimated bind order, i.e. the index into `plan.binds`. */
  position: number;
  /** The marker text as found in the SQL, e.g. `?`, `$1`, `:B1`, `@name`. */
  marker: string;
  /** Where this marker's first occurrence sits in the original SQL text. */
  location: EstimatedBindParameterLocation;
  /** `schema.table.column` or `table.column`, when uniquely resolved. */
  estimatedColumn?: string;
  /** `DbColumn.colType` of `estimatedColumn`, or UNKNOWN when unresolved. */
  estimatedType: GeneralColumnType;
};
