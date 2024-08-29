import { AwsServiceType } from './AwsServiceType';
import { SupplyCredentialType } from './AwsSupplyCredentialType';
import { DBType } from './DBType';
import { SQLServerAuthenticationType } from './SQLServerAuthenticationType';

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
};

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
  /**
   * The timezone used to store local dates.
   */
  timezone?: string;
};
