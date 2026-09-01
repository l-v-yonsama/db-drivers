import { GeneralColumnType } from '@l-v-yonsama/rdh';


/** Where a bind placeholder's marker occurs in the original SQL text. */
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
