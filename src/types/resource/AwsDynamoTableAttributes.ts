export declare const TableStatusType: {
  readonly ACTIVE: 'ACTIVE';
  readonly ARCHIVED: 'ARCHIVED';
  readonly ARCHIVING: 'ARCHIVING';
  readonly CREATING: 'CREATING';
  readonly DELETING: 'DELETING';
  readonly INACCESSIBLE_ENCRYPTION_CREDENTIALS: 'INACCESSIBLE_ENCRYPTION_CREDENTIALS';
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
  /**
   * <p>The maximum number of strongly consistent reads consumed per second before DynamoDB
   *             returns a <code>ThrottlingException</code>. Eventually consistent reads require less
   *             effort than strongly consistent reads, so a setting of 50 <code>ReadCapacityUnits</code>
   *             per second provides 100 eventually consistent <code>ReadCapacityUnits</code> per
   *             second.</p>
   */
  ReadCapacityUnits?: number;
  /**
   * <p>The maximum number of writes consumed per second before DynamoDB returns a
   *                 <code>ThrottlingException</code>.</p>
   */
  WriteCapacityUnits?: number;

  /**
   * The total size of the specified table
   */
  TableSizeBytes?: number;
  /**
   *  The number of items in the specified table.
   */
  ItemCount?: number;
  /**
   *  The Amazon Resource Name (ARN) that uniquely identifies the table.
   */
  TableArn?: string;

  lsi: LSI[];

  gsi: GSI[];

  ttl?: TTLDesc;

  [key: string]: any;
};

export type LSI = {
  IndexName?: string;
  KeySchema?: KeySchemaElement[];
  IndexSizeBytes?: number;
  ItemCount?: number;
  IndexArn?: string;
};

export type GSI = {
  IndexName?: string;
  KeySchema?: KeySchemaElement[];
  IndexStatus?: 'ACTIVE' | 'CREATING' | 'DELETING' | 'UPDATING';
  IndexSizeBytes?: number;
  ItemCount?: number;
  IndexArn?: string;
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
