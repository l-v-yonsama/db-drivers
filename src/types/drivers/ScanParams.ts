interface ScanParamsBase {
  /** Maximum number of rows/items to return. */
  limit: number;
}

export type RedisScanParams = ScanParamsBase & {
  kind: 'redis';
  /** Target Redis DB index (e.g. 0). */
  dbIndex: number;
  /** `SCAN MATCH` glob pattern applied to key names (e.g. "session:*"). */
  keyGlob?: string;
  /** When set, also fetch the value of each matched key. */
  fetchValue?: {
    limitSize: number;
  };
};

export type MemcacheScanParams = ScanParamsBase & {
  kind: 'memcache';
  /**
   * 'exact': `key` is the literal key name and at most one item is returned.
   * 'partial': `key` is matched as a substring against key names.
   */
  matchType: 'exact' | 'partial';
  key: string;
};

export type MqttScanParams = ScanParamsBase & {
  kind: 'mqtt';
  /**
   * 'exact': `topicFilter` must equal a subscription filter exactly (same as `getAll(topic)`).
   * 'partial' (default): `topicFilter` is matched against subscription filters via MQTT
   * wildcard matching or substring inclusion.
   */
  matchType?: 'exact' | 'partial';
  /** Subscription topic filter. Empty/omitted scans across all subscribed topics. */
  topicFilter?: string;
  /** Substring match against the payload text. */
  payloadContains?: string;
  /** Epoch seconds range applied to each message's timestamp. */
  startTime?: number;
  endTime?: number;
  /** Only honored when exactly one topic filter matched (see MqttDriver#scan). */
  jsonExpansion?: boolean;
  /** When set, payloads larger than limitSize (bytes) are omitted from the result. */
  fetchValue?: {
    limitSize: number;
  };
};

export type AwsS3ScanParams = ScanParamsBase & {
  kind: 'aws-s3';
  bucketName: string;
  /** Object key prefix. */
  keyPrefix?: string;
  /** Epoch seconds range applied to each object's LastModified. */
  lastModifiedAfter?: number;
  lastModifiedBefore?: number;
  /** When set, only fetch the body of objects at or below limitSize (bytes). */
  fetchValue?: {
    limitSize: number;
  };
};

export type AwsSQSScanParams = ScanParamsBase & {
  kind: 'aws-sqs';
  queueUrl: string;
  /** Substring match against the message body or messageId. */
  bodyOrMessageIdContains?: string;
};

export type AwsCloudWatchLogGroupScanParams = ScanParamsBase & {
  kind: 'aws-cloudwatch-loggroup';
  logGroupName: string;
  /** CloudWatch Logs Insights query string. */
  insightsQuery?: string;
  /** Epoch seconds range for the query. */
  startTime?: number;
  endTime?: number;
};

export type AwsCloudWatchLogStreamScanParams = ScanParamsBase & {
  kind: 'aws-cloudwatch-logstream';
  logGroupName: string;
  logStreamName: string;
  /** Epoch seconds, start of the range only (there is no end bound). */
  startTime?: number;
};

export type KeycloakScanParams = ScanParamsBase & {
  kind: 'keycloak';
  resourceType: 'IamRealm' | 'IamUser' | 'IamGroup' | 'IamRole' | 'IamSession';
  /** Realm name. Used by IamUser/IamGroup/IamRole/IamSession, ignored by IamRealm. */
  realmName?: string;
  /** Client id to scope results to. Only used by IamSession. */
  parentId?: string;
  /** Free-text search, passed through to Keycloak's own search param. Unused by IamRealm/IamSession. */
  searchQuery?: string;
  /** Expand the nested `attributes` object into individual columns. Only used by IamUser. */
  jsonExpansion?: boolean;
};

export type Auth0ScanParams = ScanParamsBase & {
  kind: 'auth0';
  resourceType: 'IamClient' | 'IamUser' | 'IamRole' | 'IamOrganization';
  /** Organization id to scope results to its members. Only used by IamUser. */
  parentId?: string;
  /** Free-text search, passed through to the Auth0 Management API. */
  searchQuery?: string;
  /** Expand nested metadata objects into individual columns. Used by IamUser/IamOrganization. */
  jsonExpansion?: boolean;
};

/**
 * Input for `Scannable#scan()`. One variant per driver/resource kind — see the `kind`
 * discriminant. Each driver implements `Scannable<TheirScanParams>` and only accepts its
 * own variant; fields are named for what they actually mean for that driver instead of a
 * shared generic `target`/`keyword`/`matchType` bag.
 */
export type ScanParams =
  | RedisScanParams
  | MemcacheScanParams
  | MqttScanParams
  | AwsS3ScanParams
  | AwsSQSScanParams
  | AwsCloudWatchLogGroupScanParams
  | AwsCloudWatchLogStreamScanParams
  | KeycloakScanParams
  | Auth0ScanParams;
