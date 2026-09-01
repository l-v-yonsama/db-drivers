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
  children: PlanNode[];
};
