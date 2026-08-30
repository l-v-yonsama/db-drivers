import { CompareKey, equalsIgnoreCase, toDate } from '@l-v-yonsama/rdh';
import { format } from 'bytes';
import {
  AwsCfnStackAttributes,
  AwsDynamoTableAttributes,
  AwsSecretAttributes,
  AwsServiceType,
  AwsSESIdentityAttributes,
  AwsSQSAttributes,
  AwsSsmParameterAttributes,
  ResourceType,
} from '../types';
import { DbResource } from './base';
import type { AllSubDbResource, ITableComparable } from './types';

export class AwsDatabase extends DbResource<
  | DbS3Bucket
  | DbSQSQueue
  | DbLogGroup
  | DbS3Owner
  | DbDynamoTable
  | DbSESIdentity
  | DbSsmParameter
  | DbSecretsManagerSecret
  | DbCfnStack
  | DbResourceGroup
> {
  constructor(name: string, public readonly serviceType: AwsServiceType) {
    super(ResourceType.AwsDatabase, name);
    if (serviceType === AwsServiceType.SES) {
      this.capabilities = {
        dashboards: [
          {
            dashboardId: 'aws-cloudwatch-metrics',
            providerId: 'aws.ses.account-region',
          },
        ],
      };
    } else if (serviceType === AwsServiceType.SQS) {
      this.capabilities = {
        dashboards: [
          {
            dashboardId: 'aws-cloudwatch-metrics-overview',
            providerId: 'aws.sqs.overview',
          },
        ],
      };
    } else if (serviceType === AwsServiceType.DynamoDB) {
      this.capabilities = {
        dashboards: [
          {
            dashboardId: 'aws-cloudwatch-metrics-overview',
            providerId: 'aws.dynamodb.overview',
          },
        ],
      };
    } else if (serviceType === AwsServiceType.S3) {
      this.capabilities = {
        dashboards: [
          {
            dashboardId: 'aws-cloudwatch-metrics-overview',
            providerId: 'aws.s3.overview',
          },
        ],
      };
    }
  }
}

export class AwsDbResource<
  T = any,
  U extends AllSubDbResource = any,
> extends DbResource<U> {
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

export class DbDynamoTable
  extends AwsDbResource<AwsDynamoTableAttributes, DbDynamoTableColumn>
  implements ITableComparable
{
  constructor(name: string, attr: AwsDynamoTableAttributes) {
    super(ResourceType.DynamoTable, name, attr);
    this.capabilities = {
      dashboards: [
        {
          dashboardId: 'aws-cloudwatch-metrics',
          providerId: 'aws.dynamodb.table',
        },
      ],
    };
    this.setPropertyFormat({
      dates: ['CreationDateTime'],
      bytes: ['TableSizeBytes'],
    });
  }

  getProperties(): { [key: string]: any } {
    const props: { [key: string]: any } = {
      ...super.getProperties(),
      lsi: this.attr.lsi.length,
      gsi: this.attr.gsi.length,
    };
    if (this.attr.ttl) {
      props.ttl = `${this.attr.ttl.AttributeName} (${this.attr.ttl.TimeToLiveStatus})`;
    }
    if (this.attr.lsi) {
      this.attr.lsi.forEach((it, idx) => {
        props[`lsi${idx + 1}_${it.IndexName}`] = it.KeySchema.map(
          (ks) => `${ks.AttributeName}(${ks.KeyType})`,
        ).join(', ');
      });
    }
    if (this.attr.gsi) {
      this.attr.gsi.forEach((it, idx) => {
        props[`gsi${idx + 1}_${it.IndexName}`] = it.KeySchema.map(
          (ks) => `${ks.AttributeName}(${ks.KeyType})`,
        ).join(', ');
      });
    }
    return props;
  }

  getPrimaryColumnNames(): string[] {
    return (
      this.children.filter((it) => it.pk || it.sk).map((it) => it.name) ?? []
    );
  }

  getPkAndSkByIndex(indexName?: string): { pk?: string; sk?: string } {
    if (!indexName) {
      return {
        pk: this.children.find((it) => it.pk)?.name,
        sk: this.children.find((it) => it.sk)?.name,
      };
    }
    let index = this.attr.lsi.find((it) => it.IndexName === indexName);
    if (index === undefined) {
      index = this.attr.gsi.find((it) => it.IndexName === indexName);
    }
    if (index) {
      return {
        pk: index.KeySchema.find((it) => it.KeyType === 'HASH')?.AttributeName,
        sk: index.KeySchema.find((it) => it.KeyType === 'RANGE')?.AttributeName,
      };
    }
    return {
      pk: undefined,
      sk: undefined,
    };
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

    return ret;
  }
}

export class DbDynamoTableColumn extends DbResource {
  public readonly attrType: string;
  public readonly pk: boolean;
  public readonly sk: boolean;

  constructor(name: string, attrType: string, pk: boolean, sk: boolean) {
    super(ResourceType.DynamoColumn, name);
    this.attrType = attrType;
    this.pk = pk;
    this.sk = sk;
  }

  toString(): string {
    return `[${super.toString()}]: Pk[${this.pk}]]`;
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      'attribute type': this.attrType,
      'partial key': this.pk,
      'sort key': this.sk,
    };
  }
}

export class DbS3Bucket extends AwsDbResource<{
  CreationDate?: Date;
  region?: string;
}> {
  constructor(name?: string, CreationDate?: Date, region?: string) {
    super(ResourceType.Bucket, name === undefined ? '' : name, {
      CreationDate,
      region,
    });
    this.capabilities = {
      dashboards: [
        {
          dashboardId: 'aws-cloudwatch-metrics',
          providerId: 'aws.s3.bucket',
        },
      ],
    };
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
    this.capabilities = {
      dashboards: [
        {
          dashboardId: 'aws-cloudwatch-metrics',
          providerId: 'aws.sqs.queue',
          variant: attr.FifoQueue ? 'fifo' : 'standard',
        },
      ],
    };
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
    this.capabilities = {
      dashboards: [
        {
          dashboardId: 'aws-cloudwatch-metrics',
          providerId: 'aws.logs.log-group',
        },
      ],
    };
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

export class DbS3Owner extends AwsDbResource<Record<string, never>> {
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

export class DbSESIdentity extends AwsDbResource<AwsSESIdentityAttributes> {
  constructor(name: string, attr: AwsSESIdentityAttributes) {
    super(ResourceType.Identity, name, attr);
  }

  getProperties(): { [key: string]: any } {
    return {
      ...super.getProperties(),
      identityType: this.attr.identityType,
      verificationStatus: this.attr.verificationStatus,
    };
  }
}

export class DbSsmParameter extends AwsDbResource<AwsSsmParameterAttributes> {
  constructor(name: string, attr: AwsSsmParameterAttributes) {
    super(ResourceType.SsmParameter, name, attr);
    this.setPropertyFormat({ dates: ['lastModifiedDate'] });
  }
}

export class DbSecretsManagerSecret extends AwsDbResource<AwsSecretAttributes> {
  constructor(name: string, attr: AwsSecretAttributes) {
    super(ResourceType.SecretsManagerSecret, name, attr);
    this.setPropertyFormat({ dates: ['lastChangedDate', 'lastAccessedDate'] });
  }
}

export class DbCfnStack extends AwsDbResource<AwsCfnStackAttributes> {
  constructor(name: string, attr: AwsCfnStackAttributes) {
    super(ResourceType.CfnStack, name, attr);
    this.setPropertyFormat({ dates: ['creationTime'] });
  }
}

export class DbResourceGroup extends DbResource {
  constructor(name: string) {
    super(ResourceType.Group, name);
  }
}
