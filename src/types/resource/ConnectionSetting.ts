import { AwsServiceType } from './AwsServiceType';
import { SupplyCredentialType } from './AwsSupplyCredentialType';
import { DBType } from './DBType';
import { SQLServerAuthenticationType } from './SQLServerAuthenticationType';

export const ConnectionEnvironment = {
  Local: 'local',
  Development: 'development',
  Test: 'test',
  Staging: 'staging',
  Production: 'production',
} as const;

export type ConnectionEnvironment =
  (typeof ConnectionEnvironment)[keyof typeof ConnectionEnvironment];

export const ConnectionEnvironmentValues = Object.values(ConnectionEnvironment);

export type ResourceFilterDetail = {
  type: 'prefix' | 'suffix' | 'include' | 'regex';
  value: string;
};

export type ResourceFilter = {
  resourceName?: ResourceFilterDetail;
  schema?: ResourceFilterDetail;
  table?: ResourceFilterDetail;
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
  /** The configuration profile to use. */
  profile?: string;
  region?: string;
  services: AwsServiceType[];
  s3ForcePathStyle?: boolean;
  /** Session token for temporary credentials (e.g. AWS SSO, AssumeRole). */
  sessionToken?: string;
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
  qos: MqttQoS;
  nl?: boolean;
  rap?: boolean;
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
  protocolVersion?: 4 | 5 | 3;
  /** Default:true, set to false to receive QoS 1 and 2 messages while offline */
  clean?: boolean;
};

export type SQLServerSetting = {
  encrypt?: boolean;
  /** 信頼関係を検証するために証明書チェーンを順に調べる処理をバイパスしない（MS SQL Serverのサーバ証明書を必ず信頼する） この引数はMS SQL Serverへの接続に暗号化が有効化されている （接続URLにencrypt=falseが未指定、またはMS SQL Server側に強制的に暗号化を構成している）場合にのみ使用されます。 */
  trustServerCertificate?: boolean;
  authenticationType?: SQLServerAuthenticationType;
  onlyDefaultSchema?: boolean;
  clientId?: string;
  tenantId?: string;
  clientSecret?: string;
  /** Pre-acquired Entra ID access token, used when authenticationType is `azure-active-directory-access-token` (e.g. obtained via an interactive browser sign-in flow outside of this driver). */
  token?: string;
  connectString?: string;
  // for ntlm
  domain?: string;
};

export const OracleConnectionType = {
  structured: 'structured',
  useConnectString: 'Use Connect String', // mirrors SQLServerAuthenticationType.useConnectString
} as const;

export type OracleConnectionType =
  (typeof OracleConnectionType)[keyof typeof OracleConnectionType];

export type OracleSetting = {
  /** Default: 'structured' — host/port/database (Service Name) are used to build an Easy Connect string. */
  connectionType?: OracleConnectionType;
  connectString?: string;
};

export type TransactionIsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE'
  | 'UNSPECIFIED'
  | 'SNAPSHOT';

export type ConnectionSetting = {
  id?: string;
  dbType: DBType;
  name: string;
  /** Free-text note describing the purpose of this connection. */
  comment?: string;
  /** The environment/stage this connection points to (e.g. to distinguish local/development/production connections that otherwise look alike). */
  environment?: ConnectionEnvironment;
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
  oracle?: OracleSetting;
  iamSolution?: IamSolutionSetting;
  mqttSetting?: MqttSetting;
  /** The timezone used to store local dates. */
  timezone?: string;
  /** Ask the driver to open/keep this connection read-only. */
  readOnly?: boolean;
  transactionIsolationLevel?: TransactionIsolationLevel;
  connectTimeoutMs?: number;
  queryTimeoutMs?: number;
  lockWaitTimeoutMs?: number;
  resourceFilter?: ResourceFilter;
};
