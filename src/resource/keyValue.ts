import { MqttQoS, RedisKeyType, ResourceType } from '../types';
import { DbResource } from './base';

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

export class MemcacheDatabase extends DbResource<DbKey> {
  public servers: string;
  public hot: number;
  public warm: number;
  public cold: number;
  constructor(name: string) {
    super(ResourceType.MemcacheDatabase, name);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      servers: this.servers,
      hot: this.hot,
      warm: this.warm,
      cold: this.cold,
    };
  }
}

export class MqttDatabase extends DbResource<DbSubscription> {
  constructor(name: string) {
    super(ResourceType.MqttDatabase, name);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      // 'number of keys': this.numOfKeys,
    };
  }
}

export class DbSubscription extends DbResource {
  public isSubscribed = false;
  public readonly nl?: boolean;
  public readonly rap?: boolean;
  public readonly rh?: number;
  constructor(
    name: string,
    public readonly qos: MqttQoS,
    options?: {
      nl?: boolean;
      rap?: boolean;
      rh?: number;
    },
  ) {
    super(ResourceType.Subscription, name);
    this.comment = '';
    if (options) {
      this.nl = options.nl;
      this.rap = options.rap;
      this.rh = options.rh;
    }
  }

  getProperties(): { [key: string]: any } {
    const prop = {
      ...super.getProperties(),
      isSubscribed: this.isSubscribed,
      QoS: this.qos,
    };
    if (this.nl !== undefined) {
      prop['No Local'] = this.nl;
    }
    if (this.rap !== undefined) {
      prop['Retain As Published'] = this.rap;
    }
    if (this.rh !== undefined) {
      prop['Retain Handling'] = this.rh;
    }
    return prop;
  }
}

export class DbKey<
  T extends
    | RedisKeyParams
    | MemcacheKeyParams
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

export type MemcacheKeyParams = {
  slabId: number;
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
  /** <p>Specifies whether the object retrieved was (true) or was not (false) a Delete Marker. */
  deleteMarker?: boolean;
  versionId?: string;
  cacheControl?: string;
  contentDisposition?: string;
  contentEncoding?: string;
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
