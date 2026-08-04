export const ResourceType = {
  Connection: 'Connection',
  RdsDatabase: 'RdsDatabase',
  AwsDatabase: 'AwsDatabase',
  RedisDatabase: 'RedisDatabase',
  MemcacheDatabase: 'MemcacheDatabase',
  MqttDatabase: 'MqttDatabase',

  Schema: 'Schema',
  Table: 'Table',
  Column: 'Column',
  Key: 'Key',
  DynamoTable: 'DynamoTable',
  DynamoColumn: 'DynamoColumn',
  Bucket: 'Bucket',
  Queue: 'Queue',
  Owner: 'Owner',
  LogGroup: 'LogGroup',
  LogStream: 'LogStream',
  Subscription: 'Subscription',
  Identity: 'Identity',
  SsmParameter: 'SsmParameter',
  SecretsManagerSecret: 'SecretsManagerSecret',
  // Generic, reusable container node for grouping children under a common
  // heading in the resource tree (e.g. SSM parameters by type, Secrets
  // Manager secrets by rotation status). Not a real AWS/DB resource itself.
  Group: 'Group',
  // IAM-KEYCLOAK
  KeycloakDatabase: 'KeycloakDatabase',
  IamRealm: 'IamRealm',
  IamGroup: 'IamGroup',
  // IAM-AUTH0
  Auth0Database: 'Auth0Database',
  IamOrganization: 'IamOrganization',
  // IAM-COMMON
  IamClient: 'IamClient',
  IamUser: 'IamUser',
  IamRole: 'IamRole',
  IamSession: 'IamSession',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
