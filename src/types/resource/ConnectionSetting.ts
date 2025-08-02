import { AwsServiceType } from './AwsServiceType';
import { SupplyCredentialType } from './AwsSupplyCredentialType';
import { DBType } from './DBType';
import { SQLServerAuthenticationType } from './SQLServerAuthenticationType';

export type ResourceFilterDetail = {
  type: 'prefix' | 'suffix' | 'include' | 'regex';
  value: string;
};

export type ResourceFilter = {
  schema?: ResourceFilterDetail;
  table?: ResourceFilterDetail;
  bucket?: ResourceFilterDetail;
  group?: ResourceFilterDetail;
};

export type SshSetting = {
  use: boolean;
  authMethod: string;
  username: string;
  password?: string;
  host: string;
  port: number;
  privateKeyPath?: string;
  privateKey?: string;
  passphrase?: string;
  dstPort: number;
  dstHost: string;
};

// sslmode=no-verify or disabled only.
export type SslSetting = {
  use: boolean;
};

export type AwsSetting = {
  supplyCredentialType: SupplyCredentialType;
  /**
   * The configuration profile to use.
   */
  profile?: string;
  region?: string;
  services: AwsServiceType[];
  s3ForcePathStyle?: boolean;
};

export type IamSolutionSetting = {
  grantType: 'client_credentials' | 'password' | 'refresh_token';
  clientId: string;
  clientSecret?: string;
  retrieveClientResOnConnection?: boolean;
  retrieveGroupOrOrgResOnConnection?: boolean;
};

export type FirebaseSetting = {
  authMethod: string;
  projectid?: string;
  privateKey?: string;
  clientEmail?: string;
  serviceAccountCredentialsPath?: string;
};

export type MqttQoS = 0 | 1 | 2;

export type MqttSubscriptionSetting = {
  name: string;
  /**
   * QoS
   * Default:0
   */
  qos: MqttQoS;
  /**
   * No Local
   * Default:false
   */
  nl?: boolean;
  /**
   * Retain As Published
   * Default:false
   */
  rap?: boolean;
  /**
   * Retain Handling
   * Default:0
   */
  rh?: number;
};
export type MqttSetting = {
  rejectUnauthorized?: boolean;
  protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss';
  clientId?: string;
  subscriptionList?: MqttSubscriptionSetting[];
  key?: string;
  cert?: string;
  ca?: string;
  /**
   * 3:v3.1, 4:v3.1.1, 5:v5.0
   * Default:4
   */
  protocolVersion?: 4 | 5 | 3;
  /** Default:true, set to false to receive QoS 1 and 2 messages while offline */
  clean?: boolean;
};

export type SQLServerSetting = {
  encrypt?: boolean;
  /**
   * 信頼関係を検証するために証明書チェーンを順に調べる処理をバイパスしない（MS SQL Serverのサーバ証明書を必ず信頼する）
   * この引数はMS SQL Serverへの接続に暗号化が有効化されている
   * （接続URLにencrypt=falseが未指定、またはMS SQL Server側に強制的に暗号化を構成している）場合にのみ使用されます。
   */
  trustServerCertificate?: boolean;
  authenticationType?: SQLServerAuthenticationType;
  onlyDefaultSchema?: boolean;
  clientId?: string;
  tenantId?: string;
  /**
   * The created `client secret` for this registered Azure application
   */
  clientSecret?: string;
  token?: string;
  connectString?: string;
  // for ntlm
  domain?: string;
};

export type TransactionIsolationLevel =
  /**
   * READ UNCOMMITTED
   * コミットされていない変更を他のトランザクションから参照できる設定
   * ダーティリード、ファジーリード、ファントムリードが全て発生
   */
  | 'READ UNCOMMITTED'
  /**
   * READ COMMITTED
   * コミットされた変更を他のトランザクションから参照できる設定
   * Oracle、PostgreSQL、SQL Serverでのデフォルトのトランザクション分離レベル
   * ファジーリード、ファントムリードが発生
   */
  | 'READ COMMITTED'
  /**
   * REPEATABLE READ
   * コミットされた追加・削除を他のトランザクションから参照できる設定
   * MySQLのデフォルトのトランザクション分離レベル
   * ファントムリードが発生
   * MySQL(InnoDB)はREPEATABLE READでもファントムリードが発生しない
   */
  | 'REPEATABLE READ'
  /**
   * SERIALIZABLE
   * 強制的にトランザクションを順序付けて処理する一番高いトランザクション分離レベル
   */
  | 'SERIALIZABLE'
  /**
   * Only SQL-SERVER
   */
  | 'UNSPECIFIED'
  /**
   * Only SQL-SERVER
   */
  | 'SNAPSHOT';

export type ConnectionSetting = {
  id?: string;
  dbType: DBType;
  name: string;
  url?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  databaseVersion?: number;
  ds?: string;
  apiVersion?: string;
  ssh?: SshSetting;
  ssl?: SslSetting;
  awsSetting?: AwsSetting;
  firebase?: FirebaseSetting;
  sqlServer?: SQLServerSetting;
  iamSolution?: IamSolutionSetting;
  mqttSetting?: MqttSetting;
  /**
   * The timezone used to store local dates.
   */
  timezone?: string;
  transactionIsolationLevel?: TransactionIsolationLevel;
  connectTimeoutMs?: number;
  queryTimeoutMs?: number;
  lockWaitTimeoutMs?: number;
  resourceFilter?: ResourceFilter;
};
