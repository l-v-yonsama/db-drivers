import { castTo } from '@l-v-yonsama/rdh';
import { ResourceType } from '../types';
import {
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
import { DbResource } from './base';
import { DbConnection } from './connection';
import {
  Auth0Database,
  IamClient,
  IamGroup,
  IamOrganization,
  IamRealm,
  IamRole,
  IamUser,
  KeycloakDatabase,
} from './iam';
import {
  DbKey,
  DbSubscription,
  MemcacheDatabase,
  MqttDatabase,
  RedisDatabase,
} from './keyValue';
import { DbColumn, DbSchema, DbTable, RdsDatabase } from './rdb';

export function fromJson<T extends DbResource = DbResource>(json: T): T {
  const resourceType: ResourceType = json.resourceType;
  const { name } = json;
  let res;
  switch (resourceType) {
    case ResourceType.Connection:
      res = Object.assign(new DbConnection(name), json);
      break;
    case ResourceType.RdsDatabase:
      res = Object.assign(new RdsDatabase(name), json);
      break;
    case ResourceType.AwsDatabase:
      res = Object.assign(
        new AwsDatabase(name, castTo<AwsDatabase>(json).serviceType),
        json,
      );
      break;
    case ResourceType.RedisDatabase:
      res = Object.assign(
        new RedisDatabase(name, castTo<RedisDatabase>(json).numOfKeys),
        json,
      );
      break;
    case ResourceType.MemcacheDatabase:
      res = Object.assign(new MemcacheDatabase(name), json);
      break;
    case ResourceType.MqttDatabase:
      res = Object.assign(new MqttDatabase(name), json);
      break;
    case ResourceType.Subscription:
      res = Object.assign(
        new DbSubscription(name, castTo<DbSubscription>(json).qos),
        json,
      );
      break;
    case ResourceType.Schema:
      res = Object.assign(new DbSchema(name), json);
      break;
    case ResourceType.Table:
      res = Object.assign(
        new DbTable(name, castTo<DbTable>(json).tableType),
        json,
      );
      break;
    case ResourceType.Column:
      res = Object.assign(
        new DbColumn(name, castTo<DbColumn>(json).colType, null),
        json,
      );
      break;
    case ResourceType.Key:
      res = Object.assign(
        new DbKey(name, (json as unknown as DbKey).params),
        json,
      );
      break;
    case ResourceType.Bucket:
      res = Object.assign(new DbS3Bucket(name), json);
      break;
    case ResourceType.Queue:
      res = Object.assign(
        new DbSQSQueue(
          name,
          castTo<DbSQSQueue>(json).url,
          castTo<DbSQSQueue>(json).attr,
        ),
        json,
      );
      break;
    case ResourceType.Owner:
      res = Object.assign(new DbS3Owner(json.id, name), json);
      break;
    case ResourceType.LogGroup:
      res = Object.assign(
        new DbLogGroup(name, castTo<DbLogGroup>(json).attr),
        json,
      );
      break;
    case ResourceType.LogStream:
      res = Object.assign(
        new DbLogStream(name, castTo<DbLogStream>(json).attr),
        json,
      );
      break;
    case ResourceType.DynamoTable:
      res = Object.assign(
        new DbDynamoTable(name, castTo<DbDynamoTable>(json).attr),
        json,
      );
      break;
    case ResourceType.DynamoColumn:
      {
        const params = castTo<DbDynamoTableColumn>(json);
        res = Object.assign(
          new DbDynamoTableColumn(name, params.attrType, params.pk, params.sk),
          json,
        );
      }
      break;
    case ResourceType.Identity:
      res = Object.assign(
        new DbSESIdentity(name, castTo<DbSESIdentity>(json).attr),
        json,
      );
      break;
    case ResourceType.SsmParameter:
      res = Object.assign(
        new DbSsmParameter(name, castTo<DbSsmParameter>(json).attr),
        json,
      );
      break;
    case ResourceType.SecretsManagerSecret:
      res = Object.assign(
        new DbSecretsManagerSecret(
          name,
          castTo<DbSecretsManagerSecret>(json).attr,
        ),
        json,
      );
      break;
    case ResourceType.CfnStack:
      res = Object.assign(
        new DbCfnStack(name, castTo<DbCfnStack>(json).attr),
        json,
      );
      break;
    case ResourceType.Group:
      res = Object.assign(new DbResourceGroup(name), json);
      break;
    case ResourceType.KeycloakDatabase:
      res = Object.assign(new KeycloakDatabase(name), json);
      break;
    case ResourceType.Auth0Database:
      res = Object.assign(new Auth0Database(name), json);
      break;
    case ResourceType.IamRealm:
      res = Object.assign(new IamRealm(name), json);
      break;
    case ResourceType.IamClient:
      res = Object.assign(new IamClient(name), json);
      break;
    case ResourceType.IamUser:
      res = Object.assign(new IamUser(name), json);
      break;
    case ResourceType.IamGroup:
      res = Object.assign(new IamGroup(name), json);
      break;
    case ResourceType.IamOrganization:
      res = Object.assign(new IamOrganization(name), json);
      break;
    case ResourceType.IamRole:
      res = Object.assign(new IamRole(name), json);
      break;
    case ResourceType.IamSession:
      // IamSession is only a scan-target discriminant for KeycloakScanParams
      // (see ScanParams.ts); no DbResource subtype backs it, so it can never
      // legitimately reach fromJson().
      throw new Error(
        'IamSession is not a DbResource node and cannot be restored via fromJson.',
      );
    default: {
      const _exhaustiveCheck: never = resourceType;
      throw new Error(
        `Unhandled resourceType in fromJson: ${_exhaustiveCheck}`,
      );
    }
  }
  if (json.children) {
    const children = json.children.map((child) => fromJson(child));
    (res as any)['children'] = children;
  }
  return res;
}
