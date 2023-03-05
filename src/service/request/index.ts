/* eslint-disable @typescript-eslint/no-empty-interface */
import { ConnectionSetting, SchemaAndTableHints } from '../../db';

export interface GeneralDBRequest<U = any> {
  /** Connection毎のユニークなID */
  connectionId?: string;
  // label?: string;
  // sql?: string;
  // needs_column_resolve?: boolean;
  options?: U;
}

export interface RequestInConnectedState<U = any> {
  /** Connection毎のユニークなID */
  connectionId: string;
  options?: U;
}

export interface AddConnectionSettingRequest {
  setting: ConnectionSetting;
}

export interface RemoveConnectionSettingRequest {
  connectionName: string;
}

export interface TestConnectionSettingRequest {
  setting: ConnectionSetting;
}

export interface ConnectRequest {
  connectionName: string;
}

export interface ViewDataRequest
  extends RequestInConnectedState<{
    autoConnection?: boolean;
    schemaName?: string;
    tableName: string;
    columns?: string[];
  }> {}

export interface ListProposalsRequest extends RequestInConnectedState {
  keyword?: string;
}

export interface ExecuteSqlRequest
  extends GeneralDBRequest<{
    needsColumnResolve?: boolean;
    autoConnection?: boolean;
    maxRows?: number;
    sql: string;
  }> {
  connectionId: string;
}

export interface CountTablesRequest
  extends GeneralDBRequest<{
    tables: SchemaAndTableHints;
  }> {
  connectionId: string;
}

export interface BatchInsertFromArrayRequest
  extends GeneralDBRequest<{
    autoConnection?: boolean;
    schemaName?: string;
    tableName: string;
    columns?: string[];
    dataList: any[];
  }> {
  connectionId: string;
}

export enum GeneralDBCommandType {
  CountTables = 'CountTables',
  ViewData = 'ViewData',
  ListProposals = 'ListProposals',
  GetInfomationSchemas = 'GetInfomationSchemas',
  ExecuteSql = 'ExecuteSql',
  AddConnectionSetting = 'AddConnectionSetting',
  RemoveConnectionSetting = 'RemoveConnectionSetting',
  TestConnectionSetting = 'TestConnectionSetting',
  Connect = 'Connect',
  Disconnect = 'Disconnect',
  DisconnectAll = 'DisconnectAll',
  BatchInsertFromArray = 'BatchInsertFromArray',
}
