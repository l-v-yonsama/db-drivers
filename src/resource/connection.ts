import {
  AwsSetting,
  ConnectionEnvironment,
  ConnectionSetting,
  DBType,
  FirebaseSetting,
  IamSolutionSetting,
  MqttSetting,
  ResourceFilter,
  ResourceType,
  SQLServerSetting,
  SshSetting,
  SslSetting,
  TransactionIsolationLevel,
} from '../types';
import { DbResource } from './base';
import type { DbDatabase } from './types';

export class DbConnection
  extends DbResource<DbDatabase>
  implements ConnectionSetting
{
  public dbType: DBType;
  public name: string;
  public environment?: ConnectionEnvironment;
  public url?: string;
  public host?: string;
  public port?: number;
  public user?: string;
  public password?: string;
  public database?: string;
  public databaseVersion?: number;
  public ds?: string;
  public isConnected: boolean;
  public apiVersion?: string;
  public ssh?: SshSetting;
  public ssl?: SslSetting;
  public awsSetting?: AwsSetting;
  public iamSolution?: IamSolutionSetting;
  public mqttSetting?: MqttSetting;
  public firebase?: FirebaseSetting;
  public sqlServer?: SQLServerSetting;
  public timezone?: string;
  public readOnly?: boolean;
  public transactionIsolationLevel?: TransactionIsolationLevel;
  public connectTimeoutMs?: number;
  public queryTimeoutMs?: number;
  public lockWaitTimeoutMs?: number;
  public resourceFilter?: ResourceFilter;

  constructor(prop: any) {
    super(ResourceType.Connection, prop.name);
    this.dbType = prop.dbType;
    this.comment = prop.comment;
    this.environment = prop.environment;
    this.host = prop.host;
    this.port = prop.port;
    this.user = prop.user;
    this.password = prop.password;
    this.database = prop.database;
    this.databaseVersion = prop.databaseVersion;
    this.ds = prop.ds;
    this.url = prop.url;
    this.apiVersion = prop.apiVersion;
    this.ssh = prop.ssh;
    this.ssl = prop.ssl;
    this.awsSetting = prop.awsSetting;
    this.iamSolution = prop.iamSolution;
    this.mqttSetting = prop.mqttSetting;
    this.firebase = prop.firebase;
    this.sqlServer = prop.sqlServer;
    this.timezone = prop.timezone;
    this.readOnly = prop.readOnly;
    this.transactionIsolationLevel = prop.transactionIsolationLevel;
    this.connectTimeoutMs = prop.connectTimeoutMs;
    this.queryTimeoutMs = prop.queryTimeoutMs;
    this.lockWaitTimeoutMs = prop.lockWaitTimeoutMs;
    this.resourceFilter = prop.resourceFilter;
    this.isConnected = false;
    this.isInProgress = false;
  }

  public hasUrl(): boolean {
    if (this.url && this.url.length > 0) {
      return true;
    }
    return false;
  }

  public hasSshSetting(): boolean {
    if (this.ssh && this.ssh.use === true) {
      return true;
    }
    return false;
  }
}
