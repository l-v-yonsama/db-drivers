import { AwsServiceType } from './AwsServiceType';
import { SupplyCredentialType } from './AwsSupplyCredentialType';
import { DBType } from './DBType';

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
  iamSolution?: IamSolutionSetting;
  /**
   * The timezone used to store local dates.
   */
  timezone?: string;
};
