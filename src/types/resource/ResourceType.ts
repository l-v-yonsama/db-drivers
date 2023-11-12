export const ResourceType = {
  Connection: 'Connection',
  RdsDatabase: 'RdsDatabase',
  AwsDatabase: 'AwsDatabase',
  RedisDatabase: 'RedisDatabase',

  Schema: 'Schema',
  Table: 'Table',
  Column: 'Column',
  Key: 'Key',
  Bucket: 'Bucket',
  Queue: 'Queue',
  Owner: 'Owner',
  LogGroup: 'LogGroup',
  LogStream: 'LogStream',
  // IAM-KEYCLOAK
  KeycloakDatabase: 'KeycloakDatabase',
  IamRealm: 'IamRealm',
  IamGroup: 'IamGroup',
  // IAM-AUTH0
  Auth0Database: 'Auth0Database',
  IamClient: 'IamClient',
  IamOrganization: 'IamOrganization',
  // IAM-COMMON
  IamUser: 'IamUser',
  IamRole: 'IamRole',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
