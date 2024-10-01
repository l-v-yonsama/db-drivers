import { QueryConditions, RdhMeta } from '@l-v-yonsama/rdh';

export type QueryParams = {
  sql: string;
  conditions?: QueryConditions;
  meta?: RdhMeta;
  prepare?: {
    useDatabaseName?: string;
  };
};
