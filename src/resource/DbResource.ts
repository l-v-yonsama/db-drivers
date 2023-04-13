import ShortUniqueId from 'short-unique-id';
import {
  DBType,
  GeneralColumnType,
  RedisKeyType,
  ResourceType,
} from '../types';
import { AwsSQSAttributes } from '../types/AwsSQSAttributes';
import { SupplyCredentialType } from '../types/AwsSupplyCredentialType';
import { AwsServiceType } from '../types/AwsServiceType';

const uid = new ShortUniqueId();

const unwrapQuote = (n: string): string => {
  if (n && n.startsWith('"') && n.endsWith('"')) {
    return n.substring(1, n.length - 1);
  }
  return n;
};

export interface Proposal {
  s?: string;
  t?: string;
  name: string;
  comment?: string;
  type: ResourceType;
}

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

export class DbResource {
  public id = uid.randomUUID(8);
  protected resouceType: ResourceType;
  public name: string;
  public comment?: string;
  protected children: Array<DbResource>;
  public meta: { [key: string]: any };

  public static createEmpty(): DbResource {
    const r = new DbResource(ResourceType.Database, '');
    return r;
  }

  constructor(resouceType: ResourceType, name: string) {
    this.resouceType = resouceType;
    this.name = name;
    this.children = [];
  }

  getName(): string {
    return this.name;
  }

  getResouceType(): ResourceType {
    return this.resouceType;
  }

  getChildren(options?: { resouceType?: ResourceType }): DbResource[] {
    if (options?.resouceType) {
      return this.children.filter(
        (it) => it.resouceType === options.resouceType,
      );
    }
    return this.children;
  }

  addChild(res: DbResource): DbResource {
    this.children.push(res);
    return res;
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  containsResource(filter: string): boolean {
    if (!filter) {
      return true;
    }
    if (this.name.toUpperCase().indexOf(filter) >= 0) {
      return true;
    }
    if (
      this.comment &&
      ('' || this.comment).toUpperCase().indexOf(filter) >= 0
    ) {
      return true;
    }
    for (const child of this.children) {
      if (child.containsResource(filter)) {
        return true;
      }
    }
    return false;
  }

  clearChildren(): void {
    this.children.splice(0, this.children.length);
  }

  getChildByName(
    name: string | RegExp,
    options?: { unwrapQuote?: boolean; resouceType?: ResourceType },
  ): DbResource {
    let searchChildren = this.children;
    if (options && options.resouceType) {
      searchChildren = this.children.filter(
        (it) => it.resouceType === options.resouceType,
      );
    }

    if (typeof name === 'string') {
      let uname = name.toUpperCase();
      if (options && options.unwrapQuote === true) {
        uname = unwrapQuote(uname);
        return searchChildren.find(
          (a) => unwrapQuote(a.getName()).toUpperCase() === uname,
        );
      } else {
        return searchChildren.find((a) => a.getName().toUpperCase() === uname);
      }
    }
    return searchChildren.find((a) => name.test(a.getName()));
  }
  toString(): string {
    return `[${this.resouceType}]:${this.name}`;
  }
  toJsonStringify(space = 0): string {
    return JSON.stringify(
      this,
      (k, v) => {
        if (['parent', 'disabled'].includes(k)) {
          return undefined;
        }
        return v;
      },
      space,
    );
  }
}

export interface SshSetting {
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
}

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

export interface FirebaseSetting {
  authMethod: string;
  projectid?: string;
  privateKey?: string;
  clientEmail?: string;
  serviceAccountCredentialsPath?: string;
}

export interface ConnectionSetting {
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
  awsSetting?: AwsSetting;
  firebase?: FirebaseSetting;
}

export class DbConnection extends DbResource implements ConnectionSetting {
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
  public isInProgress: boolean;
  public apiVersion?: string;
  public ssh?: SshSetting;
  public awsSetting?: AwsSetting;
  public firebase?: FirebaseSetting;

  constructor(prop: any) {
    super(ResourceType.Connection, prop.name);
    this.id = prop.id;
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

export class DbDatabase extends DbResource {
  public disabled = false;
  version?: number;
  constructor(name: string) {
    super(ResourceType.Database, name);
  }

  public getSchema(option: { name?: string; isDefault?: boolean }): DbSchema {
    const { name, isDefault } = option;
    for (const child of this.children) {
      if (child.getResouceType() !== ResourceType.Schema) {
        continue;
      }
      const currentSchema = child as DbSchema;
      if (name && name === child.getName()) {
        return currentSchema;
      }
      if (isDefault && currentSchema.isDefault) {
        return currentSchema;
      }
    }
    return null;
  }
}

export class RedisDatabase extends DbDatabase {
  /**
   * number of keys in the currently-selected database
   */
  public numOfKeys: number;

  constructor(name: string, numOfKeys: number) {
    super(name);
    this.numOfKeys = numOfKeys;
  }

  public getDBIndex(): number {
    return parseInt(this.name, 10);
  }
}

export class DbSchema extends DbResource {
  public isDefault = false;
  constructor(name: string) {
    super(ResourceType.Schema, name);
  }
}

export class DbTable extends DbResource {
  public tableType: any;
  public isInProgress = false;

  constructor(name: string, tableType: any, comment?: string) {
    super(ResourceType.Table, name);
    this.tableType = tableType;
    this.comment = comment;
  }

  toString(): string {
    return `[${super.toString()}]: Type[${this.tableType}]`;
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
  public readonly key: string | undefined;
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
      this.key = params.key;
      this.default = params.default;
      this.extra = params.extra;
    } else {
      this.nullable = true;
    }
  }

  toString(): string {
    return `[${super.toString()}]: Nullable[${this.nullable}] Key[${this.key}]`;
  }
}

export class DbS3Bucket extends DbResource {
  public created?: Date;
  public isInProgress = false;
  public refreshed?: Date;

  constructor(name?: string, created?: Date) {
    super(ResourceType.Bucket, name === undefined ? '' : name);
    this.created = created;
  }
}

export class DbSQSQueue extends DbResource {
  public readonly url: string;
  public readonly attributes?: AwsSQSAttributes;

  constructor(name: string, url: string, attributes?: AwsSQSAttributes) {
    super(ResourceType.Queue, name);
    this.url = url;
    this.attributes = attributes;
  }
}

export class DbLogGroup extends DbResource {
  public readonly creationTime: Date;
  public readonly storedBytes: number;

  constructor(name: string, creationTime: Date, storedBytes: number) {
    super(ResourceType.LogGroup, name);
    this.creationTime = creationTime;
    this.storedBytes = storedBytes;
  }
}

export class DbS3Owner extends DbResource {
  constructor(id: string, name?: string) {
    super(ResourceType.Owner, name === undefined ? '' : name);
    this.id = id;
  }
}
