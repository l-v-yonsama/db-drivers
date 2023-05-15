import { RdhMeta } from '../resource';
import { QueryConditions } from './QueryConditions';

export type QueryParams = {
  sql: string;
  conditions?: QueryConditions;
  meta?: RdhMeta;
};
