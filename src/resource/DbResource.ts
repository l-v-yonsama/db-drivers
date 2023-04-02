import dayjs from 'dayjs';
import ShortUniqueId from 'short-unique-id';
import {
  DBType,
  GeneralColumnType,
  RedisKeyType,
  ResourceType,
} from '../types';

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
  public transientMeta: { [key: string]: any };

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
  region?: string;
  isConnected?: boolean;
  isInProgress?: boolean;
  apiVersion?: string;
  ssh?: SshSetting;
  firebase?: FirebaseSetting;
}

export class DbConnection extends DbResource implements ConnectionSetting {
  public property: Map<string, object>;
  public dbType = undefined;
  public host = '';
  public port = 0;
  public user = '';
  public password = '';
  public database = '';
  public databaseVersion = 1;
  public enviroment = '';
  public ds = '';
  public url = '';
  public isConnected = false;
  public isInProgress = false;
  public apiVersion?: string;
  public region?: string;
  public ssh?: SshSetting;
  public firebase?: FirebaseSetting;

  constructor(prop: any) {
    super(ResourceType.Connection, prop.name);
    this.id = prop.id;
    this.dbType = prop.dbType;
    this.property = new Map<string, object>();
    this.host = prop.host;
    this.port = prop.port;
    this.user = prop.user;
    this.password = prop.password;
    this.enviroment = prop.enviroment;
    this.database = prop.database;
    this.databaseVersion = prop.databaseVersion;
    this.ds = prop.ds;
    this.url = prop.url;
    this.apiVersion = prop.apiVersion;
    this.region = prop.region;
    this.ssh = prop.ssh;
    this.firebase = prop.firebase;
    if (prop.property) {
      for (const k in prop.property) {
        this.property.set(k, prop.property[k]);
      }
    }
  }

  static deserialize(json: any): DbConnection {
    const con = new DbConnection(json);
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        if (con.dbType === DBType.Redis) {
          con.addChild(RedisDatabase.deserialize(childJson));
        } else {
          con.addChild(DbDatabase.deserialize(childJson));
        }
      });
    }
    con.isConnected = json.isConnected;
    return con;
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

  static deserialize(json: any): DbDatabase {
    const own = new DbDatabase(json.name);
    if (json.comment) {
      own.comment = json.comment;
    }
    if (json.version) {
      own.version = json.version;
    }
    if (json.disabled) {
      own.disabled = json.disabled;
    }
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        // console.log('childJson=', childJson)
        switch (childJson.resouceType) {
          case ResourceType.Schema:
            own.addChild(DbSchema.deserialize(own, childJson));
            break;
          case ResourceType.Bucket:
            own.addChild(DbS3Bucket.deserialize(own, childJson));
            break;
          case ResourceType.Owner:
            own.addChild(DbS3Owner.deserialize(own, childJson));
            break;
          default:
            throw new Error(
              `DbDatabase#deserialize Undefined resource type:${childJson.resouceType}`,
            );
        }
      });
    }
    return own;
  }
}

export class RedisDatabase extends DbDatabase {
  public keys: number;
  public expires: number;
  public avgTtl: number;

  constructor(name: string, keys: number, expires: number, avgTtl: number) {
    super(name);
    this.keys = keys;
    this.expires = expires;
    this.avgTtl = avgTtl;
  }

  public getDBIndex(): number {
    return parseInt(this.name, 10);
  }
  static deserialize(json: any): RedisDatabase {
    const own = new RedisDatabase(
      json.name,
      json.keys,
      json.expires,
      json.avgTtl,
    );
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        own.addChild(DbKey.deserialize(childJson));
      });
    }
    return own;
  }
}

export class DbSchema extends DbResource {
  public isDefault = false;
  constructor(name: string) {
    super(ResourceType.Schema, name);
  }
  static deserialize(db: DbDatabase, json: any): DbSchema {
    const own = new DbSchema(json.name);
    own.isDefault = json.isDefault;
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        own.addChild(DbTable.deserialize(db, own, childJson));
      });
    }
    return own;
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

  static deserialize(db: DbDatabase, schema: DbSchema, json: any): DbTable {
    const own = new DbTable(json.name, json.tableType, json.comment);
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        own.addChild(DbColumn.deserialize(db, schema, own, childJson));
      });
    }
    return own;
  }
}

export class DbKey<
  T extends RedisKeyParams | S3KeyParams | SQSMessageParams = any,
> extends DbResource {
  public readonly params: T;

  constructor(name: string, params: T) {
    super(ResourceType.Key, name);
    this.params = params;
  }

  static deserialize(json: any): DbKey {
    const own = new DbKey(json.name, json.params);
    return own;
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

  static deserialize(
    db: DbDatabase,
    schema: DbSchema,
    table: DbTable,
    json: any,
  ): DbColumn {
    const own = new DbColumn(
      json.name,
      json.colType,
      json.params,
      json.comment,
    );
    return own;
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

  static deserialize(db: DbDatabase, json: any): DbS3Bucket {
    const own = new DbS3Bucket(json.name);
    own.created = json.created;
    if (json.refreshed) {
      own.refreshed = dayjs(json.refreshed).toDate();
    }
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        own.addChild(DbKey.deserialize(childJson));
      });
    }
    return own;
  }
}

export class DbSQSQueue extends DbResource {
  public readonly url: string;
  public readonly attributes?: Record<string, string>;

  constructor(name: string, url: string, attributes?: Record<string, string>) {
    super(ResourceType.Queue, name);
    this.url = url;
    this.attributes = attributes;
  }

  static deserialize(db: DbDatabase, json: any): DbSQSQueue {
    const own = new DbSQSQueue(json.name, json.url, json.attributes);
    return own;
  }
}

export class DbS3Owner extends DbResource {
  constructor(id: string, name?: string) {
    super(ResourceType.Owner, name === undefined ? '' : name);
    this.id = id;
  }
  static deserialize(db: DbDatabase, json: any): DbS3Owner {
    const own = new DbS3Owner(json.name);
    own.id = json.id;
    return own;
  }
}
