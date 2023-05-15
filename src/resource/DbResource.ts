import ShortUniqueId from 'short-unique-id';
import {
  AwsSQSAttributes,
  AwsServiceType,
  AwsSetting,
  CompareKey,
  ConnectionSetting,
  FirebaseSetting,
  GeneralColumnType,
  RedisKeyType,
  ResourceType,
  SshSetting,
  UniqKey,
} from '../types';
import { EnumValues } from 'enum-values';
import { format } from 'bytes';
import { toDate } from '../util';

const uid = new ShortUniqueId();

export interface SchemaAndTableName {
  schema?: string;
  table: string;
}

export interface TableRows extends SchemaAndTableName {
  count: number;
}

export interface SchemaAndTableHints {
  list: SchemaAndTableName[];
}

export interface ColumnResolver {
  hints: SchemaAndTableHints;
}

export function fromJson<T extends DbResource>(json: any): T {
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
      res = Object.assign(new AwsDatabase(name, json.serviceType), json);
      break;
    case ResourceType.RedisDatabase:
      res = Object.assign(new RedisDatabase(name, json.numOfKeys), json);
      break;
    case ResourceType.Schema:
      res = Object.assign(new DbSchema(name), json);
      break;
    case ResourceType.Table:
      res = Object.assign(new DbTable(name, json.tableType), json);
      break;
    case ResourceType.Column:
      res = Object.assign(new DbColumn(name, json.colType, null), json);
      break;
    case ResourceType.Key:
      res = Object.assign(new DbKey(name, json.params), json);
      break;
    case ResourceType.Bucket:
      res = Object.assign(new DbS3Bucket(name), json);
      break;
    case ResourceType.Queue:
      res = Object.assign(new DbSQSQueue(name, json.url, json.attr), json);
      break;
    case ResourceType.Owner:
      res = Object.assign(new DbS3Owner(json.id, name), json);
      break;
    case ResourceType.LogGroup:
      res = Object.assign(new DbLogGroup(name, json.attr), json);
      break;
    case ResourceType.LogStream:
      res = Object.assign(new DbLogStream(name, json.attr), json);
      break;
  }
  if (json.children) {
    const children = json.children.map((child) => fromJson(child));
    res.children = children;
  }
  return res;
}

export type DbDatabase = RdsDatabase | AwsDatabase | RedisDatabase;

type AllSubDbResource =
  | RdsDatabase
  | AwsDatabase
  | RedisDatabase
  | DbSchema
  | DbTable
  | DbKey
  | DbColumn
  | DbS3Bucket
  | DbSQSQueue
  | DbLogGroup
  | DbLogStream
  | DbS3Owner;

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
      const ret = [];
      this.children.forEach((it) => {
        ret.push(...it.findChildren({ keyword, resourceType, recursively }));
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
  public dbType = undefined;
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
  public awsSetting?: AwsSetting;
  public firebase?: FirebaseSetting;

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
    this.awsSetting = prop.awsSetting;
    this.firebase = prop.firebase;
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

export class DbSchema extends DbResource<DbTable> {
  public isDefault = false;
  constructor(name: string) {
    super(ResourceType.Schema, name);
  }
}

export class DbTable extends DbResource<DbColumn> {
  public tableType: any;

  constructor(name: string, tableType: any, comment?: string) {
    super(ResourceType.Table, name);
    this.tableType = tableType;
    this.comment = comment;
    this.isInProgress = false;
  }

  getCompareKeys(): CompareKey[] {
    const ret: CompareKey[] = [];
    const pks = this.getPrimaryColumnNames();
    if (pks.length) {
      ret.push({
        kind: 'primary',
        names: pks,
      });
    }
    ret.push(
      ...this.getUniqColumnNames().map(
        (it) =>
          ({
            kind: 'uniq',
            name: it,
          } as UniqKey),
      ),
    );
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
  outputFilePath?: string;
  lastModified: Date;
  etag: string;
  size: number;
  storageClass: string;
  base64?: string;
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
    colType = GeneralColumnType.UNKNOWN,
    params: any,
    comment?: string,
  ) {
    super(ResourceType.Column, name);
    this.colType = colType;
    this.comment = comment;
    if (params) {
      this.nullable = params.nullable || false;
      this.primaryKey = params.key === 'PRI';
      this.uniqKey = params.key === 'UNI';
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
      'column type': EnumValues.getNameFromValue(
        GeneralColumnType,
        this.colType,
      ),
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
