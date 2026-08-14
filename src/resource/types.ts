import type { CompareKey } from '@l-v-yonsama/rdh';
import type {
  AwsDatabase,
  DbCfnStack,
  DbDynamoTable,
  DbDynamoTableColumn,
  DbLogGroup,
  DbLogStream,
  DbResourceGroup,
  DbS3Bucket,
  DbS3Owner,
  DbSecretsManagerSecret,
  DbSESIdentity,
  DbSQSQueue,
  DbSsmParameter,
} from './aws';
import type {
  Auth0Database,
  IamClient,
  IamGroup,
  IamOrganization,
  IamRealm,
  IamRole,
  IamUser,
  KeycloakDatabase,
} from './iam';
import type {
  DbKey,
  DbSubscription,
  MemcacheDatabase,
  MqttDatabase,
  RedisDatabase,
} from './keyValue';
import type { DbColumn, DbSchema, DbTable, RdsDatabase } from './rdb';

export interface SchemaAndTableName {
  schema?: string;
  table: string;
}

export interface SchemaAndTableHints {
  list: SchemaAndTableName[];
}

export type DbDatabase =
  | RdsDatabase
  | AwsDatabase
  | RedisDatabase
  | MemcacheDatabase
  | Auth0Database
  | KeycloakDatabase
  | MqttDatabase;

export type AllSubDbResource =
  | DbDatabase
  | DbSchema
  | DbTable
  | DbKey
  | DbColumn
  | DbS3Bucket
  | DbSQSQueue
  | DbLogGroup
  | DbLogStream
  | DbS3Owner
  | DbDynamoTable
  | DbDynamoTableColumn
  | DbSESIdentity
  | DbSsmParameter
  | DbSecretsManagerSecret
  | DbCfnStack
  | DbResourceGroup
  | DbSubscription
  // IAM
  | IamRealm
  | IamClient
  | IamOrganization
  | IamUser
  | IamGroup
  | IamRole;

export type IamResourceType = 'users' | 'groups' | 'roles';

export interface ITableComparable {
  getCompareKeys(availableColumnNames?: string[]): CompareKey[];
}
