import { RedisKeyType } from '../../db';

export interface RedisRequest {
  connectionId: string;
  index: number;
  command: RedisCommandType;
  key?: string;
  type?: RedisKeyType;
  options?: any;
}

export enum RedisCommandType {
  Dbsize = 'dbsize',
  Flushall = 'Flushall',
  Flushdb = 'Flushdb',
  GetValue = 'GetValue',
  Info = 'info',
  Scan = 'Scan',
  SetValue = 'SetValue',
}
