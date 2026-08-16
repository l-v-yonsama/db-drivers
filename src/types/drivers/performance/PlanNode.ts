// Common, vendor-neutral execution plan model.
//
// Vendor Providers normalize their EXPLAIN/SHOWPLAN output into this shape so
// that plan-table mapping, decision rules and AI prompts do not need to know
// vendor-specific plan formats. See
// misc/design/performance-tuning-workflow.ja.md §7 for the rationale and the
// deterministic checks this model is designed to support.
export type PlanNode = {
  id: string;
  parentId?: string;
  depth: number;
  operation: string;
  relation?: {
    schemaName?: string;
    tableName?: string;
    alias?: string;
  };
  indexName?: string;
  joinType?: string;
  predicates?: string[];
  estimated?: {
    startupCost?: number;
    totalCost?: number;
    rows?: number;
    width?: number;
  };
  actual?: {
    startupMs?: number;
    totalMs?: number;
    rows?: number;
    loops?: number;
  };
  buffers?: {
    hit?: number;
    read?: number;
    dirtied?: number;
    written?: number;
  };
  temp?: {
    read?: number;
    written?: number;
  };
  warnings?: string[];
  children: PlanNode[];
};
