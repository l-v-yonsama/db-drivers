import {
  AwsCloudFormationServiceClient,
  AwsCloudwatchServiceClient,
  AwsDriver,
  AwsDynamoServiceClient,
  AwsS3ServiceClient,
  AwsSecretsManagerServiceClient,
  AwsSESServiceClient,
  AwsSQSServiceClient,
  AwsSsmServiceClient,
  AwsServiceType,
  ClientConfigType,
  ConnectionSetting,
  DbS3Bucket,
  DBType,
  SupplyCredentialType,
} from '../../../src';

const config: ClientConfigType = {
  region: 'ap-northeast-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
};
const awsDriver = null as unknown as AwsDriver;

const createSetting = (
  service: (typeof AwsServiceType)[keyof typeof AwsServiceType],
): ConnectionSetting => ({
  name: `test-${service}`,
  dbType: DBType.Aws,
  awsSetting: {
    supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
    services: [service],
  },
  resourceFilter: {
    resourceName: { type: 'prefix', value: 'keep-' },
  },
});

describe('generic AWS resource filter', () => {
  it('filters DynamoDB tables before fetching their details', async () => {
    const client = new AwsDynamoServiceClient(
      createSetting(AwsServiceType.DynamoDB),
      config,
      awsDriver,
    );
    jest
      .spyOn(client, 'listTableNames')
      .mockResolvedValue(['keep-table', 'drop-table']);
    const send = jest
      .fn()
      .mockResolvedValueOnce({ Table: { TableName: 'keep-table' } });
    client.client = { send } as any;

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual(['keep-table']);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('filters S3 buckets and reports the filtered count', async () => {
    const client = new AwsS3ServiceClient(
      createSetting(AwsServiceType.S3),
      config,
      awsDriver,
    );
    const send = jest
      .fn()
      .mockResolvedValueOnce({
        Buckets: [
          { Name: 'keep-bucket', BucketRegion: 'us-west-2' },
          { Name: 'drop-bucket', BucketRegion: 'ap-northeast-1' },
        ],
        ContinuationToken: 'next-page',
      })
      .mockResolvedValueOnce({
        Buckets: [{ Name: 'keep-later', BucketRegion: 'eu-west-1' }],
      });
    client.s3Client = {
      send,
    } as any;

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual([
      'keep-bucket',
      'keep-later',
    ]);
    expect((db.children[0] as DbS3Bucket).attr).toMatchObject({
      region: 'us-west-2',
    });
    expect((db.children[1] as DbS3Bucket).attr).toMatchObject({
      region: 'eu-west-1',
    });
    expect(db.comment).toBe('2 buckets');
    expect(send.mock.calls[1][0].input.ContinuationToken).toBe('next-page');
  });

  it('filters CloudWatch log groups', async () => {
    const client = new AwsCloudwatchServiceClient(
      createSetting(AwsServiceType.Cloudwatch),
      config,
      awsDriver,
    );
    client.logClient = {
      send: jest.fn().mockResolvedValue({
        logGroups: [
          { logGroupName: 'keep-group' },
          { logGroupName: 'drop-group' },
        ],
      }),
    } as any;

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual(['keep-group']);
  });

  it('filters SQS queues before fetching their attributes', async () => {
    const client = new AwsSQSServiceClient(
      createSetting(AwsServiceType.SQS),
      config,
      awsDriver,
    );
    const send = jest.fn(async (command: any) => {
      if (command.constructor.name === 'ListQueuesCommand') {
        return {
          QueueUrls: [
            'https://sqs.example/123/keep-queue',
            'https://sqs.example/123/drop-queue',
          ],
        };
      }
      return { Attributes: {} };
    });
    client.sqsClient = { send } as any;

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual(['keep-queue']);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('filters SES identities before fetching verification attributes', async () => {
    const client = new AwsSESServiceClient(
      createSetting(AwsServiceType.SES),
      config,
      awsDriver,
    );
    jest.spyOn(client, 'getSendQuota').mockResolvedValue({} as any);
    jest
      .spyOn(client, 'listIdentities')
      .mockResolvedValueOnce(['keep-email@example.com', 'drop@example.com'])
      .mockResolvedValueOnce(['keep-domain.example', 'drop.example']);
    const send = jest.fn().mockResolvedValue({ VerificationAttributes: {} });
    client.sesClient = { send } as any;

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual([
      'keep-email@example.com',
      'keep-domain.example',
    ]);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('filters SSM parameters', async () => {
    const client = new AwsSsmServiceClient(
      createSetting(AwsServiceType.SSM),
      config,
      awsDriver,
    );
    (client as any).listParameters = jest.fn().mockResolvedValue([
      { Name: 'keep-parameter', Type: 'String' },
      { Name: 'drop-parameter', Type: 'String' },
    ]);

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual(['keep-parameter']);
  });

  it('filters Secrets Manager secrets', async () => {
    const client = new AwsSecretsManagerServiceClient(
      createSetting(AwsServiceType.SecretsManager),
      config,
      awsDriver,
    );
    (client as any).listSecrets = jest
      .fn()
      .mockResolvedValue([{ Name: 'keep-secret' }, { Name: 'drop-secret' }]);

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual(['keep-secret']);
  });

  it('filters CloudFormation stacks before describing their resources', async () => {
    const client = new AwsCloudFormationServiceClient(
      createSetting(AwsServiceType.CloudFormation),
      config,
      awsDriver,
    );
    (client as any).listStacks = jest
      .fn()
      .mockResolvedValue([
        { StackName: 'keep-stack' },
        { StackName: 'drop-stack' },
      ]);
    const describeStackResources = jest.fn().mockResolvedValue([]);
    (client as any).describeStackResources = describeStackResources;

    const db = await client.getInfomationSchemas();

    expect(db.children.map((it) => it.name)).toEqual(['keep-stack']);
    expect(describeStackResources).toHaveBeenCalledTimes(1);
    expect(describeStackResources).toHaveBeenCalledWith('keep-stack');
  });
});
