import { GeneralDBCommandType } from '../request';

export interface GeneralDBResponse<T = any> {
  command: GeneralDBCommandType;
  ok: boolean;
  message: string;
  elapsed_time: number;
  result?: T;
}
