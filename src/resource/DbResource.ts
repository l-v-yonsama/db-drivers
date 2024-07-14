import {
  castTo,
  CompareKey,
  displayGeneralColumnType,
  equalsIgnoreCase,
  GeneralColumnType,
  toDate,
} from '@l-v-yonsama/rdh';
import { format } from 'bytes';
import ShortUniqueId from 'short-unique-id';
import {
  AwsServiceType,
  AwsSetting,
  AwsSQSAttributes,
  ConnectionSetting,
  DBType,
  FirebaseSetting,
  ForeignKeyConstraint,
  IamSolutionSetting,
  RedisKeyType,
  ResourceType,
  SQLServerSetting,
  SshSetting,
  SslSetting,
  UniqueKeyConstraint,
} from '../types';

const uid = new ShortUniqueId();

export interface SchemaAndTableName {
  schema?: string;
  table: string;
}

export interface SchemaAndTableHints {
  list: SchemaAndTableName[];
}

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
  }
  if (json.children) {
    const children = json.children.map((child) => fromJson(child));
    (res as any)['children'] = children;
  }
  return res;
}

export type DbDatabase =
  | RdsDatabase
  | AwsDatabase
  | RedisDatabase
  | Auth0Database
  | KeycloakDatabase;

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
  // IAM
  | IamRealm
  | IamClient
  | IamOrganization
  | IamUser
  | IamGroup
  | IamRole;

export type IamResourceType = 'users' | 'groups' | 'roles';
export abstract class DbResource<T extends DbResource = AllSubDbResource> {
  public readonly id = uid.randomUUID(8);
  public readonly resourceType: ResourceType;
  public readonly name: string;
  public comment?: string;
  public readonly children: Array<T>;
  public meta: { [key: string]: any };
  public isInProgress?: boolean;

  constructor(resourceType: ResourceType, name: string) {
    this.resourceType = resourceType;
    this.name = name;
    this.children = [];
  }

  getProperties(): { [key: string]: any } {
    return {
      name: this.name,
      commnet: this.comment,
    };
  }

  addChild(res: T): T {
    this.children.push(res);
    return res;
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  clearChildren(): void {
    this.children.splice(0, this.children.length);
  }

  getChildByName(name: string, insensitive?: boolean): T | undefined {
    if (insensitive === true) {
      const uname = name.toUpperCase();
      return this.children.find((it) => it.name.toUpperCase() == uname);
    }
    return this.children.find((it) => it.name == name);
  }

  findChildren<U extends DbResource = AllSubDbResource>({
    keyword,
    resourceType,
    recursively,
  }: {
    resourceType: ResourceType;
    keyword?: string | RegExp;
    recursively?: boolean;
  }): U[] {
    if (this.children.some((it) => it.resourceType === resourceType)) {
      const children2 = this.children.filter(
        (it) => it.resourceType === resourceType,
      );
      if (keyword == undefined) {
        return (children2 ?? []) as unknown[] as U[];
      }
      if (typeof keyword === 'string') {
        const k = keyword.toUpperCase();
        return (children2.filter((it) => it.name.toUpperCase() == k) ??
          []) as unknown[] as U[];
      }
      return (children2.filter((it) => keyword.test(it.name)) ??
        []) as unknown[] as U[];
    }
    if (recursively === true) {
      const ret: U[] = [];
      this.children.forEach((it) => {
        ret.push(
          ...(it.findChildren({
            keyword,
            resourceType,
            recursively,
          }) as unknown[] as U[]),
        );
      });
      return ret;
    }
    return [];
  }

  toString(): string {
    return `[${this.resourceType}]:${this.name}`;
  }
  toJsonStringify(space = 0): string {
    return JSON.stringify(
      this,
      (k, v) => {
        if (['disabled'].includes(k)) {
          return undefined;
        }
        return v;
      },
      space,
    );
  }
}

export class DbConnection
  extends DbResource<DbDatabase>
  implements ConnectionSetting
{
  public dbType: DBType;
  public name: string;
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
  public firebase?: FirebaseSetting;
  public sqlServer?: SQLServerSetting;

  constructor(prop: any) {
    super(ResourceType.Connection, prop.name);
    this.dbType = prop.dbType;
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
    this.firebase = prop.firebase;
    this.sqlServer = prop.sqlServer;
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

export class RdsDatabase extends DbResource<DbSchema> {
  version?: number;
  constructor(name: string) {
    super(ResourceType.RdsDatabase, name);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      version: this.version,
    };
  }

  public getSchema(option: { name?: string; isDefault?: boolean }): DbSchema {
    const { name, isDefault } = option;
    for (const child of this.children) {
      if (child.resourceType !== ResourceType.Schema) {
        continue;
      }
      const currentSchema = child as DbSchema;
      if (name && name === child.name) {
        return currentSchema;
      }
      if (isDefault && currentSchema.isDefault) {
        return currentSchema;
      }
    }
    return null;
  }
}

export class AwsDatabase extends DbResource<
  DbS3Bucket | DbSQSQueue | DbLogGroup | DbS3Owner
> {
  constructor(name: string, public readonly serviceType: AwsServiceType) {
    super(ResourceType.AwsDatabase, name);
  }
}

export class RedisDatabase extends DbResource<DbKey> {
  constructor(name: string, public numOfKeys: number) {
    super(ResourceType.RedisDatabase, name);
  }

  public getDBIndex(): number {
    return parseInt(this.name, 10);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      'number of keys': this.numOfKeys,
    };
  }
}

export class KeycloakDatabase extends DbResource<IamRealm> {
  constructor(name: string) {
    super(ResourceType.KeycloakDatabase, name);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
    };
  }

  public getRealm(option: { name?: string; isDefault?: boolean }): IamRealm {
    const { name, isDefault } = option;
    for (const child of this.children) {
      if (child.resourceType !== ResourceType.IamRealm) {
        continue;
      }
      const currentRealm = child;
      if (name && name === child.name) {
        return currentRealm;
      }
      if (isDefault && currentRealm.isDefault) {
        return currentRealm;
      }
    }
    return null;
  }
}

export class Auth0Database extends DbResource<
  IamClient | IamUser | IamGroup | IamRole
> {
  public isDefault = false;
  public numOfUsers = 0;
  public numOfOrganizations = 0;

  constructor(name: string) {
    super(ResourceType.Auth0Database, name);
  }

  getClientByName(name: string): IamClient | undefined {
    return this.findChildren<IamClient>({
      keyword: name,
      resourceType: ResourceType.IamClient,
      recursively: false,
    })?.[0];
  }

  getUserByName(name: string): IamUser | undefined {
    return this.findChildren<IamUser>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getGroupByName(name: string): IamGroup | undefined {
    return this.findChildren<IamGroup>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getRoleByName(name: string): IamRole | undefined {
    return this.findChildren<IamRole>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getProperties(): { [key: string]: any } {
    const { id, numOfOrganizations, numOfUsers } = this;
    return {
      id,
      numOfUsers,
      numOfOrganizations,
      ...super.getProperties(),
    };
  }
}

export class IamRealm extends DbResource<
  IamClient | IamUser | IamGroup | IamRole
> {
  public isDefault = false;
  public numOfUsers = 0;
  public numOfGroups = 0;

  constructor(name: string) {
    super(ResourceType.IamRealm, name);
  }

  getClientByName(name: string): IamClient | undefined {
    return this.findChildren<IamClient>({
      keyword: name,
      resourceType: ResourceType.IamClient,
      recursively: false,
    })?.[0];
  }

  getUserByName(name: string): IamUser | undefined {
    return this.findChildren<IamUser>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getGroupByName(name: string): IamGroup | undefined {
    return this.findChildren<IamGroup>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getRoleByName(name: string): IamRole | undefined {
    return this.findChildren<IamRole>({
      keyword: name,
      resourceType: ResourceType.IamUser,
      recursively: false,
    })?.[0];
  }

  getProperties(): { [key: string]: any } {
    const { id, numOfGroups, numOfUsers } = this;
    return {
      id,
      numOfUsers,
      numOfGroups,
      ...super.getProperties(),
    };
  }
}

export class IamClient extends DbResource {
  baseUrl: string;
  /**
   * protocol(client type) For Keycloak
   * openid-connect or saml
   */
  protocol: string;
  clientId: string;
  standardFlowEnabled?: boolean;
  implicitFlowEnabled?: boolean;
  directAccessGrantsEnabled?: boolean;
  numOfUserSessions?: number;
  numOfOfflineSessions?: number;
  /**
   * The type of application this client represents for Auth0.
   */
  appType: string;

  constructor(name: string) {
    super(ResourceType.IamClient, name);
  }

  getProperties(): { [key: string]: any } {
    const {
      id,
      protocol,
      clientId,
      appType,
      standardFlowEnabled,
      implicitFlowEnabled,
      directAccessGrantsEnabled,
      numOfUserSessions,
      numOfOfflineSessions,
    } = this;

    return {
      id,
      protocol,
      clientId,
      appType,
      standardFlowEnabled,
      implicitFlowEnabled,
      directAccessGrantsEnabled,
      numOfUserSessions,
      numOfOfflineSessions,
      ...super.getProperties(),
    };
  }
}
export class IamUser extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamUser, name);
  }

  getProperties(): { [key: string]: any } {
    const { id } = this;

    return {
      id,
      ...super.getProperties(),
    };
  }
}

export class IamGroup extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamGroup, name);
  }
}

export class IamOrganization extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamOrganization, name);
  }
}

export class IamRole extends DbResource {
  constructor(name: string) {
    super(ResourceType.IamRole, name);
  }

  getProperties(): { [key: string]: any } {
    const { id } = this;

    return {
      id,
      ...super.getProperties(),
    };
  }
}

export class DbSchema extends DbResource<DbTable> {
  public isDefault = false;
  constructor(name: string) {
    super(ResourceType.Schema, name);
  }

  getUniqColumnNameWithComments(): { name: string; comment?: string }[] {
    const ret: { name: string; comment?: string }[] = [];
    this.children.forEach((table) => {
      table.children.forEach((column) => {
        const c = ret.find((it) => it.name === column.name);
        if (c) {
          if (c.comment === undefined) {
            c.comment = column.comment;
          }
        } else {
          ret.push({
            name: column.name,
            comment: column.comment,
          });
        }
      });
    });
    return ret.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
  }
}

export class DbTable extends DbResource<DbColumn> {
  public tableType: any;
  public foreignKeys?: ForeignKeyConstraint = {};
  public uniqueKeys?: UniqueKeyConstraint[];

  constructor(name: string, tableType: any, comment?: string) {
    super(ResourceType.Table, name);
    this.tableType = tableType;
    this.comment = comment;
    this.isInProgress = false;
  }

  getCompareKeys(availableColumnNames?: string[]): CompareKey[] {
    const ret: CompareKey[] = [];
    const pks = this.getPrimaryColumnNames();
    if (pks.length) {
      if (availableColumnNames) {
        if (
          pks.every((pk) =>
            availableColumnNames.some((ac) => equalsIgnoreCase(ac, pk)),
          )
        ) {
          ret.push({
            kind: 'primary',
            names: pks.map((pk) =>
              availableColumnNames.find((ac) => equalsIgnoreCase(ac, pk)),
            ),
          });
        }
      } else {
        ret.push({
          kind: 'primary',
          names: pks,
        });
      }
    }
    this.uniqueKeys?.forEach((it) => {
      if (availableColumnNames) {
        if (
          it.columns.every((uk) =>
            availableColumnNames.some((ac) => equalsIgnoreCase(ac, uk)),
          )
        ) {
          ret.push({
            kind: 'uniq',
            names: it.columns.map((uk) =>
              availableColumnNames.find((ac) => equalsIgnoreCase(ac, uk)),
            ),
          });
        }
      } else {
        ret.push({
          kind: 'uniq',
          names: it.columns,
        });
      }
    });
    return ret;
  }

  getPrimaryColumnNames(): string[] {
    return (
      this.children.filter((it) => it.primaryKey).map((it) => it.name) ?? []
    );
  }

  getUniqColumnNames(): string[] {
    return this.children.filter((it) => it.uniqKey).map((it) => it.name) ?? [];
  }

  toString(): string {
    return `[${super.toString()}]: Type[${this.tableType}]`;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      'table type': this.tableType,
    };
  }
}

export class DbKey<
  T extends
    | RedisKeyParams
    | S3KeyParams
    | SQSMessageParams
    | LogMessageParams = any,
> extends DbResource {
  public readonly params: T;

  constructor(name: string, params: T) {
    super(ResourceType.Key, name);
    this.params = params;
  }

  getProperties(): { [key: string]: any } {
    return {
      'id or key': this.id,
      ...super.getProperties(),
      ...this.params,
    };
  }
}

export type RedisKeyParams = {
  type: RedisKeyType;
  ttl: number;
  val?: any;
  base64?: string;
};

export type S3KeyParams = {
  downloadUrl?: string;
  outputFilePath?: string;
  lastModified: Date;
  etag: string;
  size: number;
  storageClass: string;
  stringValue?: string;
  encodedBase64?: boolean;
  /**
   * <p>Specifies whether the object retrieved was (true) or was not (false) a Delete Marker. If
   *          false, this response header does not appear in the response.</p>
   */
  deleteMarker?: boolean;
  /**
   * <p>Version of the object.</p>
   */
  versionId?: string;
  /**
   * <p>Specifies caching behavior along the request/reply chain.</p>
   */
  cacheControl?: string;
  /**
   * <p>Specifies presentational information for the object.</p>
   */
  contentDisposition?: string;
  /**
   * <p>Specifies what content encodings have been applied to the object and thus what decoding
   *          mechanisms must be applied to obtain the media-type referenced by the Content-Type header
   *          field.</p>
   */
  contentEncoding?: string;
  /**
   * <p>A standard MIME type describing the format of the object data.</p>
   */
  contentType?: string;
};

export type SQSMessageParams = {
  body: string;
  receiptHandle: string;
  md5OfBody: string;
  sentTimestamp: Date;
  approximateFirstReceiveTimestamp: Date;
};

export type LogMessageParams = {
  message: string;
};

export class DbColumn extends DbResource {
  public readonly colType: GeneralColumnType;
  public readonly nullable: boolean;
  public readonly primaryKey: boolean;
  public readonly uniqKey: boolean;
  public readonly default: any;
  public readonly extra: any;
  constructor(
    name: string,
    colType: GeneralColumnType,
    params: any,
    comment?: string,
  ) {
    super(ResourceType.Column, name);
    this.colType = colType;
    this.comment = comment;
    if (params) {
      this.nullable = params.nullable || false;
      this.primaryKey = params.key === 'PRI';
      this.uniqKey = params.key === 'UNI' || params.key === 'MUL';
      this.default = params.default;
      this.extra = params.extra;
    } else {
      this.nullable = true;
    }
  }

  toString(): string {
    return `[${super.toString()}]: Nullable[${this.nullable}]]`;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      'column type': displayGeneralColumnType(this.colType),
      nullable: this.nullable,
      primaryKey: this.primaryKey,
      uniqKey: this.uniqKey,
      default: this.default,
    };
  }
}

export class AwsDbResource<T = any> extends DbResource {
  private dateProperties?: string[];
  private byteProperties?: string[];

  constructor(
    resourceType: ResourceType,
    name: string,
    public readonly attr: T,
  ) {
    super(resourceType, name);
  }

  protected setPropertyFormat({
    dates,
    bytes,
  }: {
    dates?: string[];
    bytes?: string[];
  }): void {
    this.dateProperties = dates;
    this.byteProperties = bytes;
  }

  getProperties(): { [key: string]: any } {
    const props = {
      ...super.getProperties(),
      ...this.attr,
    };
    this.dateProperties?.forEach((name) => {
      const v = props[name];
      (props as any)[name] = toDate(v)?.toISOString();
    });
    this.byteProperties?.forEach((name) => {
      const v = props[name];
      (props as any)[name] = format(v);
    });
    return props;
  }
}

export class DbS3Bucket extends AwsDbResource<{
  CreationDate?: Date;
}> {
  constructor(name?: string, CreationDate?: Date) {
    super(ResourceType.Bucket, name === undefined ? '' : name, {
      CreationDate,
    });
    this.setPropertyFormat({ dates: ['CreationDate'] });
  }
}

export class DbSQSQueue extends AwsDbResource<AwsSQSAttributes> {
  constructor(
    name: string,
    public readonly url: string,
    attr: AwsSQSAttributes,
  ) {
    super(ResourceType.Queue, name, attr);
    this.setPropertyFormat({
      dates: ['CreatedTimestamp', 'LastModifiedTimestamp'],
    });
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      url: this.url,
    };
  }
}

export class DbLogGroup extends AwsDbResource<{
  creationTime?: number;
  storedBytes?: number;
  retentionInDays?: number;
  kmsKeyId?: string;
}> {
  constructor(
    name: string,
    attr: {
      creationTime?: number;
      storedBytes?: number;
      retentionInDays?: number;
      kmsKeyId?: string;
    },
  ) {
    super(ResourceType.LogGroup, name, attr);
    this.setPropertyFormat({ dates: ['creationTime'], bytes: ['storedBytes'] });
  }
}

export class DbLogStream extends AwsDbResource<{
  creationTime: Date;
  firstEventTimestamp: Date;
  lastEventTimestamp: Date;
  lastIngestionTime: Date;
}> {
  constructor(
    name: string,
    attr: {
      creationTime: Date;
      firstEventTimestamp: Date;
      lastEventTimestamp: Date;
      lastIngestionTime: Date;
    },
  ) {
    super(ResourceType.LogStream, name, attr);
    this.setPropertyFormat({
      dates: [
        'creationTime',
        'firstEventTimestamp',
        'lastEventTimestamp',
        'lastIngestionTime',
      ],
    });
  }
}

export class DbS3Owner extends AwsDbResource<{}> {
  constructor(public readonly ownerId: string, name: string) {
    super(ResourceType.Owner, name === undefined ? '' : name, {});
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      'Owner id': this.ownerId,
    };
  }
}
