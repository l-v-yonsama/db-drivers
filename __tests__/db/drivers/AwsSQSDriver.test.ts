import {
  DbConnection,
  AwsRegion,
  AwsSQSDriver,
  DBDriverResolver,
  ConnectionSetting,
  DBType,
  DbDatabase,
  DbSQSQueue,
  DbKey,
  SQSMessageParams,
} from '../../../src';
import {
  CreateQueueCommand,
  DeleteQueueCommand,
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.apNortheast1,
};

describe('AwsSQSDriver', () => {
  let driverResolver: DBDriverResolver;
  let sqsClient: SQSClient;
  let driver: AwsSQSDriver;
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
      dbType: DBType.AwsSQS,
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsSQSDriver>(setting);

    try {
      await sqsClient.send(new DeleteQueueCommand({ QueueUrl: queueUrl1 }));
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
    const con = new DbConnection({
      url: 'http://localhost:4646',
      user: 'xxxx',
      password: 'xxxx',
    });
    const testDriver = new AwsSQSDriver(con);
    expect(await testDriver.connect()).toContain('ECONNREFUSED');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsSQSDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: DbDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas({});
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0] as DbDatabase;
      expect(testDbRes.getName()).toBe('SQS');
    });

    it('should have DbSQSQueue resource', async () => {
      const queue = testDbRes.getChildByName(
        '/000000000000/queueName1.fifo',
      ) as DbSQSQueue;
      expect(queue.getName()).toBe('/000000000000/queueName1.fifo');
      expect(queue.attributes?.FifoQueue).toBe('true');
      expect(queue.attributes?.ContentBasedDeduplication).toBe('true');
    });
  });

  describe('asyncScan', () => {
    it('should return values', async () => {
      const { ok, message, result } = await driver.flow<
        DbKey<SQSMessageParams>[]
      >(async (): Promise<DbKey<SQSMessageParams>[]> => {
        return await driver.scan({
          target: queueUrl1,
          limit: 1000,
        });
      });

      expect(ok).toBe(true);
      expect(message).toBe('');

      for (let i = 0; i < 5; i++) {
        const { name, params } = result[i];
        expect(name).toEqual(expect.any(String));
        expect(params.receiptHandle).toEqual(expect.any(String));
        expect(params.md5OfBody).toEqual(expect.any(String));
        expect(params.body).toBe(`Hello world:${i}`);
      }
    });
  });
});
