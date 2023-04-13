import {
  AwsRegion,
  AwsDriver,
  DBDriverResolver,
  ConnectionSetting,
  DBType,
  DbDatabase,
  DbSQSQueue,
  ResultSetDataHolder,
} from '../../../src';
import {
  CreateQueueCommand,
  DeleteQueueCommand,
  ListQueuesCommand,
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';
import { AwsServiceType } from '../../../src/types/AwsServiceType';
import { SupplyCredentialType } from '../../../src/types/AwsSupplyCredentialType';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.apNortheast1,
};

describe('AwsSQSDriver', () => {
  let driverResolver: DBDriverResolver;
  let sqsClient: SQSClient;
  let driver: AwsDriver;
  const queueName1 = 'queueName1.fifo';
  const queueUrl1 = 'http://localhost:6005/000000000000/queueName1.fifo';

  beforeAll(async () => {
    sqsClient = new SQSClient({
      region: connectOption.region,
      endpoint: connectOption.url, // localstack.
      credentials: {
        accessKeyId: connectOption.user,
        secretAccessKey: connectOption.password,
      },
    });
    driverResolver = DBDriverResolver.getInstance();
    const setting: ConnectionSetting = {
      name: 'localSQS',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.SQS],
        region: connectOption.region,
      },
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsDriver>(setting);

    try {
      const list = await sqsClient.send(
        new ListQueuesCommand({ MaxResults: 1000 }),
      );
      for (const queueUrl of list.QueueUrls ?? []) {
        await sqsClient.send(new DeleteQueueCommand({ QueueUrl: queueUrl }));
      }
    } catch (_) {
      console.error(_);
    }
    await sqsClient.send(
      new CreateQueueCommand({
        QueueName: queueName1,
        Attributes: {
          FifoQueue: 'true',
          ContentBasedDeduplication: 'true',
        },
      }),
    );

    for (let i = 0; i < 5; i++) {
      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: queueUrl1,
          MessageBody: `Hello world:${i}`,
          MessageGroupId: `GROUP:${i}-${driver.getConnectionRes().id}`,
        }),
      );
    }
  });

  afterAll(async () => {
    sqsClient.destroy();
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  it('failed to connect', async () => {
    const setting: ConnectionSetting = {
      name: 'localSQS',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.SQS],
        region: connectOption.region,
      },
      url: 'http://localhost:4646',
      user: 'xxxx',
      password: 'xxxx',
    };
    const testDriver = DBDriverResolver.getInstance().createDriver(setting);
    expect(await testDriver.connect()).toContain('ECONNREFUSED');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: DbDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0] as DbDatabase;
      expect(testDbRes.getName()).toBe('SQS');
    });

    it('should have DbSQSQueue resource', async () => {
      const queue = testDbRes.getChildByName('queueName1.fifo') as DbSQSQueue;
      expect(queue.getName()).toBe('queueName1.fifo');
      expect(queue.attributes?.FifoQueue).toBe(true);
      expect(queue.attributes?.ContentBasedDeduplication).toBe(true);
    });
  });

  describe('asyncScan', () => {
    it('should return values', async () => {
      const { ok, message, result } = await driver.flow(
        async (): Promise<ResultSetDataHolder> => {
          return await driver.sqsClient.scan({
            target: queueUrl1,
            limit: 1000,
          });
        },
      );

      expect(ok).toBe(true);
      expect(message).toBe('');

      for (let i = 0; i < 5; i++) {
        const row = result.rows[i];
        expect(row.values['messageId']).toEqual(expect.any(String));
        expect(row.values['receiptHandle']).toEqual(expect.any(String));
        expect(row.values['sentTimestamp']).toEqual(expect.any(Date));
        expect(row.values['body']).toBe(`Hello world:${i}`);
      }
    });
  });

  describe('flow', () => {
    it('aaa', async () => {
      const r = await driver.flow(async () => {
        const url1 = await driver.sqsClient.createQueue({
          name: 'standardQueue1',
          attributes: {
            MaximumMessageSize: 1000,
            ReceiveMessageWaitTimeSeconds: 3,
            VisibilityTimeout: 2,
          },
        });
        const url2 = await driver.sqsClient.createQueue({
          name: 'fifoQueue1.fifo',
          attributes: {
            MaximumMessageSize: 500,
            ReceiveMessageWaitTimeSeconds: 2,
            VisibilityTimeout: 1,
            FifoQueue: true,
            ContentBasedDeduplication: true,
          },
        });
        return [url1, url2];
      });
      console.log('list result', JSON.stringify(r.result, null, 2));
      expect(r.ok).toBe(true);
      expect(r.result).toBeDefined();
      const [standardQueueUrl, fifoQueueUrl] = r.result;
      expect(standardQueueUrl).toBeDefined();
      expect(fifoQueueUrl).toBeDefined();
    });
  });
});
