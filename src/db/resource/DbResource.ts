import {
  DBType,
  ResourceType,
  RedisKeyType,
  GeneralColumnType,
  ODBCVendorType,
} from './types';
import dayjs from 'dayjs';
import ShortUniqueId from 'short-unique-id';

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
  protected parent: DbResource | undefined;
  protected resouceType: ResourceType;
  public name: string;
  public comment?: string;
  protected children: Array<DbResource>;
  public expanded = false;

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

  getChildren(): DbResource[] {
    return this.children;
  }

  getParent(): DbResource {
    return this.parent;
  }

  addChild(res: DbResource): DbResource {
    this.children.push(res);
    res.parent = this;
    return res;
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
    name: string,
    options?: { unwrapQuote?: boolean; resouceType?: ResourceType },
  ): DbResource {
    let searchChildren = this.children;
    if (options && options.resouceType) {
      searchChildren = this.children.filter(
        (it) => it.resouceType === options.resouceType,
      );
    }

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
  toString(): string {
    return `[${this.resouceType}]:${this.name}`;
  }
  toJsonStringify(space = 0): string {
    return JSON.stringify(
      this,
      (k, v) => {
        if (['parent', 'expanded', 'disabled'].includes(k)) {
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
  public odbcVendorType = ODBCVendorType.Oracle;
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
    this.odbcVendorType = prop.odbcVendorType;
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
  constructor(name: string, tableType: any, comment = '') {
    super(ResourceType.Table, name);
    this.tableType = tableType;
    this.comment = comment || '';
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

export class DbKey extends DbResource {
  public type = RedisKeyType.UNKNOWN;
  public ttl = -1;
  public ttlConfirmationDatetime: number | undefined;
  public ttl_remain: number | undefined;
  public val: any;

  constructor(name: string, type = RedisKeyType.UNKNOWN, ttl = -1) {
    super(ResourceType.Key, name);
    this.type = type;
    this.ttl = ttl;
    if (ttl > 0) {
      this.ttl_remain = this.ttl;
    }
  }
  toString(): string {
    if (this.ttl < 0) {
      return `${super.toString()} TYPE[${this.type}]`;
    }
    return `${super.toString()} TYPE[${this.type}] TTL[${this.ttl}]`;
  }

  static deserialize(json: any): DbKey {
    const own = new DbKey(json.name, json.type, json.ttl);
    own.ttlConfirmationDatetime = json.ttlConfirmationDatetime;
    if (own.ttl > 0 && own.ttlConfirmationDatetime) {
      const sub = Math.round((Date.now() - own.ttlConfirmationDatetime) / 1000);
      const r = own.ttl - sub;
      if (r > 0) {
        own.ttl_remain = own.ttl;
      } else {
        own.ttl_remain = undefined;
      }
    }
    own.val = json.val;
    return own;
  }
}

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
    comment = '',
  ) {
    super(ResourceType.Column, name);
    if (comment === null) {
      comment = '';
    }
    this.colType = colType;
    if (typeof comment !== 'string') {
      console.trace('error comment type', typeof comment, ' comment=', comment);
    }
    this.comment = comment || '';
    if (params) {
      this.nullable = params.nullable || false;
      this.key = params.key || '';
      this.default = params.default;
      this.extra = params.extra;
    } else {
      this.nullable = true;
      this.key = '';
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

  getGeneralType(): string {
    // if (
    //   this.colType.match(/.*(year|month|yearmonth|date|datetime|timestamp).*/i)
    // ) {
    //   return "date";
    // } else if (this.colType.match(/.*(time).*/i)) {
    //   return "time";
    // } else if (
    //   this.colType.match(/.*(int|float|double|number|numeric|decimal).*/i)
    // ) {
    //   return "number";
    // } else if (this.colType.match(/.*(char|string|text).*/i)) {
    //   return "string";
    // } else if (this.colType.match(/.*(enum).*/i)) {
    //   return "enum";
    // } else if (this.colType.match(/.*(set).*/i)) {
    //   return "set";
    // } else {
    //   return "undefined";
    // }
    return '' + this.colType;
  }
  toString(): string {
    return `[${super.toString()}]: GType[${this.getGeneralType()}] Nullable[${
      this.nullable
    }] Key[${this.key}]`;
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
  public getDir(key: string): DbS3Key | undefined {
    if (key.length === 0) {
      return undefined;
    }
    if (key.endsWith('/')) {
      key = key.substring(0, key.length - 1);
    }
    if (key.startsWith('/')) {
      key = key.substring(1, key.length);
    }
    const dirNames = key.split('/');
    let searchRes = <DbResource>this;
    for (let i = 0; i < dirNames.length; i++) {
      const dir = dirNames[i];
      const r = searchRes.getChildByName(dir + '/');
      if (r === undefined) {
        return undefined;
      }
      searchRes = r;
    }
    return <DbS3Key>searchRes;
  }
  static deserialize(db: DbDatabase, json: any): DbS3Bucket {
    const own = new DbS3Bucket(json.name);
    own.created = json.created;
    if (json.refreshed) {
      own.refreshed = dayjs(json.refreshed).toDate();
    }
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        own.addChild(DbS3Key.deserialize(childJson));
      });
    }
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

export interface S3KeySearchResult {
  prefix?: string;
  list: Array<DbS3Key>;
  ContinuationToken: string;
  error_message?: string;
}

export class DbS3Key extends DbResource {
  public output_file_path?: string;
  public is_dir = false;
  public isInProgress = false;
  public refreshed?: Date;
  public updated?: Date;
  public etag?: string;
  public size?: number;
  public storage_class?: string;
  public base64?: string;

  constructor(name: string, is_dir = false) {
    super(ResourceType.Key, name);
    this.is_dir = is_dir;
  }
  toString(): string {
    return `${super.toString()}`;
  }

  static deserialize(json: any): DbS3Key {
    const own = new DbS3Key(json.name);
    own.is_dir = json.is_dir;
    if (json.updated) {
      own.updated = dayjs(json.updated).toDate();
    }
    if (json.refreshed) {
      own.refreshed = dayjs(json.refreshed).toDate();
    }
    own.etag = json.etag;
    own.size = json.size;
    own.storage_class = json.storage_class;
    own.output_file_path = json.output_file_path;
    own.base64 = json.base64;
    return own;
  }
}
