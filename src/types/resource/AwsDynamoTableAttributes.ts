export declare const TableStatusType: {
  readonly ACTIVE: 'ACTIVE';
  readonly ARCHIVED: 'ARCHIVED';
  readonly ARCHIVING: 'ARCHIVING';
  readonly CREATING: 'CREATING';
  readonly DELETING: 'DELETING';
  readonly INACCESSIBLE_ENCRYPTION_CREDENTIALS: 'INACCESSIBLE_ENCRYPTION_CREDENTIALS';
  readonly REPLICATION_NOT_AUTHORIZED: 'REPLICATION_NOT_AUTHORIZED';
  readonly UPDATING: 'UPDATING';
};

export type TimeToLiveStatusTypes =
  | 'ENABLING'
  | 'DISABLING'
  | 'ENABLED'
  | 'DISABLED';

export type TTLDesc = {
  TimeToLiveStatus: TimeToLiveStatusTypes;
  AttributeName?: string;
};

export type TableStatusType =
  (typeof TableStatusType)[keyof typeof TableStatusType];

export type AwsDynamoTableAttributes = {
  CreationDateTime?: Date;
  /** The current state of the table */
  TableStatus?: TableStatusType;
  /** <p>The maximum number of strongly consistent reads consumed per second before DynamoDB returns a <code>ThrottlingException</code>. */
  ReadCapacityUnits?: number;
  WriteCapacityUnits?: number;

  TableSizeBytes?: number;
  /** The number of items in the specified table. */
  ItemCount?: number;
  /** The Amazon Resource Name (ARN) that uniquely identifies the table. */
  TableArn?: string;

  /** PROVISIONED or PAY_PER_REQUEST, from DescribeTable's BillingModeSummary. */
  BillingMode?: 'PROVISIONED' | 'PAY_PER_REQUEST';
  /** Only present for an on-demand table that has an explicit max request-unit cap set. */
  OnDemandMaxReadRequestUnits?: number;
  OnDemandMaxWriteRequestUnits?: number;

  lsi: LSI[];

  gsi: GSI[];

  ttl?: TTLDesc;

  [key: string]: any;
};

export type IndexProjection = {
  ProjectionType?: 'ALL' | 'KEYS_ONLY' | 'INCLUDE';
  /** Only meaningful (and only ever populated) when ProjectionType is INCLUDE. */
  NonKeyAttributes?: string[];
};

export type LSI = {
  IndexName?: string;
  KeySchema?: KeySchemaElement[];
  IndexSizeBytes?: number;
  ItemCount?: number;
  IndexArn?: string;
  Projection?: IndexProjection;
};

export type GSI = {
  IndexName?: string;
  KeySchema?: KeySchemaElement[];
  IndexStatus?: 'ACTIVE' | 'CREATING' | 'DELETING' | 'UPDATING';
  IndexSizeBytes?: number;
  ItemCount?: number;
  IndexArn?: string;
  Projection?: IndexProjection;
  /** GSI only - an LSI always shares the base table's throughput. */
  ReadCapacityUnits?: number;
  WriteCapacityUnits?: number;
  OnDemandMaxReadRequestUnits?: number;
  OnDemandMaxWriteRequestUnits?: number;
};

export type KeySchemaElement = {
  AttributeName: string | undefined;
  KeyType: 'HASH' | 'RANGE' | undefined;
};

export declare const ScalarAttributeType: {
  readonly B: 'B';
  readonly N: 'N';
  readonly S: 'S';
};

export type ScalarAttributeType =
  (typeof ScalarAttributeType)[keyof typeof ScalarAttributeType];
