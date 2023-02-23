import { GeneralColumnType } from './types/GeneralColumnType';
import { ResourceType } from './types/ResourceType';
import { DBType } from './types/DBType';
import { RedisKeyType } from './types/RedisKeyType';
import dayjs from 'dayjs';
import ShortUniqueId from 'short-unique-id';
import { ODBCVendorType } from './types/ODBCVendorType';

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
  protected resouce_type: ResourceType;
  public name: string;
  public comment?: string;
  protected children: Array<DbResource>;
  public expanded = false;

  public static createEmpty(): DbResource {
    const r = new DbResource(ResourceType.Database, '');
    return r;
  }

  constructor(resouce_type: ResourceType, name: string) {
    this.resouce_type = resouce_type;
    this.name = name;
    this.children = [];
  }

  getName(): string {
    return this.name;
  }

  getResouceType(): ResourceType {
    return this.resouce_type;
  }

  getChildren(): DbResource[] {
    return this.children;
  }

  getParent(): DbResource | undefined {
    return this.parent;
  }

  addChild(res: DbResource) {
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

  clearChildren() {
    this.children.splice(0, this.children.length);
  }

  getChildByName(name: string, options?: any): DbResource | undefined {
    name = name.toUpperCase();
    if (options && options.quote_ident === true) {
      name = unwrapQuote(name);
      return this.children.find(
        (a) => unwrapQuote(a.getName()).toUpperCase() === name,
      );
    } else {
      return this.children.find((a) => a.getName().toUpperCase() === name);
    }
  }
  toString() {
    return `[${this.resouce_type}]:${this.name}`;
  }
}

export interface SshSetting {
  use: boolean;
  auth_method: string;
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
  auth_method: string;
  projectid?: string;
  private_key?: string;
  client_email?: string;
  serviceAccountCredentialsPath?: string;
}

export interface ConnectionSetting {
  db_type: DBType;
  odbc_vendor_type?: ODBCVendorType;
  name?: string;
  url?: string;
  host?: string;
  port?: number;
  enviroment?: string;
  user?: string;
  password?: string;
  database?: string;
  database_version?: number;
  ds?: string;
  region?: string;
  isConnected?: boolean;
  is_in_progress?: boolean;
  apiVersion?: string;
  ssh?: SshSetting;
  firebase?: FirebaseSetting;
}

export class DbConnection extends DbResource implements ConnectionSetting {
  public property: Map<string, object>;
  public db_type = DBType.Unknown;
  public odbc_vendor_type = ODBCVendorType.Oracle;
  public host = '';
  public port = 0;
  public user = '';
  public password = '';
  public database = '';
  public database_version = 1;
  public enviroment = '';
  public ds = '';
  public url = '';
  public isConnected = false;
  public is_in_progress = false;
  public apiVersion?: string;
  public region?: string;
  public ssh?: SshSetting;
  public firebase?: FirebaseSetting;

  constructor(prop: any) {
    super(ResourceType.Connection, prop.name);
    this.id = prop.id;
    this.db_type = DBType.parse(prop['db_type']);
    this.odbc_vendor_type = prop.odbc_vendor_type;
    this.property = new Map<string, object>();
    this.host = prop.host;
    this.port = prop.port;
    this.user = prop.user;
    this.password = prop.password;
    this.enviroment = prop.enviroment;
    this.database = prop.database;
    this.database_version = prop.database_version;
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

  isInProgress(): boolean {
    return this.is_in_progress;
  }
  static deserialize(json: any): DbConnection {
    const con = new DbConnection(json);
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        if (con.db_type === DBType.Redis) {
          con.addChild(RedisDatabase.deserialize(con, childJson));
        } else {
          con.addChild(DbDatabase.deserialize(con, childJson));
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
  static deserialize(con: DbConnection, json: any): DbDatabase {
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
        switch (childJson.resouce_type) {
          case ResourceType.Schema:
            own.addChild(DbSchema.deserialize(con, own, childJson));
            break;
          case ResourceType.Bucket:
            own.addChild(DbS3Bucket.deserialize(con, own, childJson));
            break;
          case ResourceType.Owner:
            own.addChild(DbS3Owner.deserialize(con, own, childJson));
            break;
          default:
            throw new Error(
              `DbDatabase#deserialize Undefined resource type:${childJson.resouce_type}`,
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
  public avg_ttl: number;

  constructor(name: string, keys: number, expires: number, avg_ttl: number) {
    super(name);
    this.keys = keys;
    this.expires = expires;
    this.avg_ttl = avg_ttl;
  }

  public getDBIndex(): number {
    return parseInt(this.name, 10);
  }
  static deserialize(con: DbConnection, json: any): RedisDatabase {
    const own = new RedisDatabase(
      json.name,
      json.keys,
      json.expires,
      json.avg_ttl,
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
  constructor(name: string) {
    super(ResourceType.Schema, name);
  }
  static deserialize(con: DbConnection, db: DbDatabase, json: any): DbSchema {
    const own = new DbSchema(json.name);
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        own.addChild(DbTable.deserialize(con, db, own, childJson));
      });
    }
    return own;
  }
}

export class DbTable extends DbResource {
  public table_type: any;
  public is_in_progress = false;
  constructor(name: string, table_type: any, comment = '') {
    super(ResourceType.Table, name);
    this.table_type = table_type;
    this.comment = comment || '';
  }

  toString() {
    return `[${super.toString()}]: Type[${this.table_type}]`;
  }
  static deserialize(
    con: DbConnection,
    db: DbDatabase,
    schema: DbSchema,
    json: any,
  ): DbTable {
    const own = new DbTable(json.name, json.table_type, json.comment);
    if (json.children && json.children.length > 0) {
      json.children.forEach((childJson: any) => {
        own.addChild(DbColumn.deserialize(con, db, schema, own, childJson));
      });
    }
    return own;
  }
}

export class DbKey extends DbResource {
  public type = RedisKeyType.UNKNOWN;
  public ttl = -1;
  public ttl_confirmation_datetime: number | undefined;
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
  toString() {
    if (this.ttl < 0) {
      return `${super.toString()} TYPE[${this.type}]`;
    }
    return `${super.toString()} TYPE[${this.type}] TTL[${this.ttl}]`;
  }

  static deserialize(json: any): DbKey {
    const own = new DbKey(json.name, json.type, json.ttl);
    own.ttl_confirmation_datetime = json.ttl_confirmation_datetime;
    if (own.ttl > 0 && own.ttl_confirmation_datetime) {
      const sub = Math.round(
        (Date.now() - own.ttl_confirmation_datetime) / 1000,
      );
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
  public readonly col_type: GeneralColumnType;
  public readonly nullable: boolean;
  public readonly key: string | undefined;
  public readonly default: any;
  public readonly extra: any;
  constructor(
    name: string,
    col_type = GeneralColumnType.UNKNOWN,
    params: any,
    comment = '',
  ) {
    super(ResourceType.Column, name);
    if (comment === null) {
      comment = '';
    }
    this.col_type = col_type;
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
    con: DbConnection,
    db: DbDatabase,
    schema: DbSchema,
    table: DbTable,
    json: any,
  ): DbColumn {
    const own = new DbColumn(
      json.name,
      json.col_type,
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
    return '' + this.col_type;
  }
  toString() {
    return `[${super.toString()}]: GType[${this.getGeneralType()}] Nullable[${
      this.nullable
    }] Key[${this.key}]`;
  }
}

export class DbS3Bucket extends DbResource {
  public created?: Date;
  public is_in_progress = false;
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
  static deserialize(con: DbConnection, db: DbDatabase, json: any): DbS3Bucket {
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
  static deserialize(con: DbConnection, db: DbDatabase, json: any): DbS3Owner {
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
  public is_in_progress = false;
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
  toString() {
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
