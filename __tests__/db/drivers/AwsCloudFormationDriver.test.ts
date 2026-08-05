import {
  CloudFormationClient,
  CreateStackCommand,
  DeleteStackCommand,
  ListStacksCommand,
  waitUntilStackCreateComplete,
} from '@aws-sdk/client-cloudformation';
import {
  AwsDatabase,
  AwsDriver,
  AwsRegion,
  AwsServiceType,
  ConnectionSetting,
  DBDriverResolver,
  DbCfnStack,
  DBType,
  SupplyCredentialType,
} from '../../../src';

const connectOption = {
  url: 'http://localhost:6005',
  user: 'test', // aws:accessKeyId
  password: 'test', // aws:secretAccessKey
  region: AwsRegion.apNortheast1,
};

// A minimal fixture: two SQS queues, the second acting as a DLQ for the
// first, wired together with a real Fn::GetAtt so both L2a (plain resource
// listing via getInfomationSchemas()/DescribeStackResources) and L2b
// (dependency extraction via getResourcesWithDependencies()/GetTemplate) have
// something real to assert against from the same stack. EC2/VPC-flavored
// resources aren't used here since this LocalStack instance's SERVICES list
// (docker/unit-test.yml) doesn't include `ec2` - see cfn.test.ts for the
// VPC/IntegratedArchitecture-mode coverage, which runs entirely offline
// against the recovered __tests__/data/cfn/ fixtures instead.
const stackName = 'db-drivers-test-order-stack';
const template = {
  Resources: {
    OrderQueueDLQ: {
      Type: 'AWS::SQS::Queue',
      Properties: {
        QueueName: 'db-drivers-test-order-queue-dlq',
      },
    },
    OrderQueue: {
      Type: 'AWS::SQS::Queue',
      Properties: {
        QueueName: 'db-drivers-test-order-queue',
        RedrivePolicy: {
          deadLetterTargetArn: { 'Fn::GetAtt': ['OrderQueueDLQ', 'Arn'] },
          maxReceiveCount: 3,
        },
      },
    },
  },
};

describe('AwsCloudFormationDriver', () => {
  let driverResolver: DBDriverResolver;
  let cfnClient: CloudFormationClient;
  let driver: AwsDriver;

  beforeAll(async () => {
    cfnClient = new CloudFormationClient({
      region: connectOption.region,
      endpoint: connectOption.url, // localstack.
      credentials: {
        accessKeyId: connectOption.user,
        secretAccessKey: connectOption.password,
      },
    });
    driverResolver = DBDriverResolver.getInstance();
    const setting: ConnectionSetting = {
      name: 'localCloudFormation',
      dbType: DBType.Aws,
      awsSetting: {
        supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
        services: [AwsServiceType.CloudFormation],
        region: connectOption.region,
      },
      ...connectOption,
    };
    driver = driverResolver.createDriver<AwsDriver>(setting);

    try {
      const { StackSummaries } = await cfnClient.send(
        new ListStacksCommand({}),
      );
      const existing = (StackSummaries ?? []).find(
        (it) => it.StackName === stackName && it.StackStatus !== 'DELETE_COMPLETE',
      );
      if (existing) {
        await cfnClient.send(new DeleteStackCommand({ StackName: stackName }));
      }
    } catch (_) {
      console.error(_);
    }

    await cfnClient.send(
      new CreateStackCommand({
        StackName: stackName,
        TemplateBody: JSON.stringify(template),
      }),
    );
    await waitUntilStackCreateComplete(
      { client: cfnClient, maxWaitTime: 60 },
      { StackName: stackName },
    );
  }, 60000);

  afterAll(async () => {
    // Deliberately not deleting the stack here - same convention as the other
    // AWS driver tests (SQS/SES/SSM/...): beforeAll deletes-then-recreates for
    // a clean run, but afterAll leaves the resource in place so it's still
    // visible against LocalStack for manual UI verification (e.g. the F5
    // debug launch's localAws connection).
    cfnClient.destroy();
    await driver.disconnect();
  });

  it('connect', async () => {
    expect(await driver.connect()).toBe('');
  });

  describe('getName', () => {
    it('should return constructor name', () => {
      expect(driver.getName()).toBe('AwsDriver');
    });
  });

  describe('asyncGetResouces', () => {
    let testDbRes: AwsDatabase;

    it('should return Database resource', async () => {
      const dbRootRes = await driver.getInfomationSchemas();
      expect(dbRootRes).toHaveLength(1);
      testDbRes = dbRootRes[0];
      expect(testDbRes.name).toBe('CloudFormation');
    });

    it('should have a DbCfnStack resource with status CREATE_COMPLETE', () => {
      const stack = testDbRes.children.find(
        (it) => it.name === stackName,
      ) as DbCfnStack;
      expect(stack).toBeDefined();
      expect(stack.attr.stackStatus).toBe('CREATE_COMPLETE');
    });

    it('lists both queues as plain resource entries (getInfomationSchemas() never populates dependsOn)', () => {
      const stack = testDbRes.children.find(
        (it) => it.name === stackName,
      ) as DbCfnStack;
      const resources = stack.attr.resources;
      expect(resources).toHaveLength(2);

      const orderQueue = resources.find((it) => it.logicalId === 'OrderQueue');
      expect(orderQueue).toBeDefined();
      expect(orderQueue.resourceType).toBe('AWS::SQS::Queue');
      expect(orderQueue.physicalId).toContain(
        'db-drivers-test-order-queue',
      );
      expect(orderQueue.dependsOn).toBeUndefined();

      const dlq = resources.find((it) => it.logicalId === 'OrderQueueDLQ');
      expect(dlq).toBeDefined();
      expect(dlq.resourceType).toBe('AWS::SQS::Queue');
    });
  });

  describe('getTemplate', () => {
    it('fetches the template body and leaves it as-is when already in the requested format', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.cloudFormationClient.getTemplate({
          stackName,
          convertTo: 'json',
        });
      });

      expect(ok).toBe(true);
      const parsed = JSON.parse(result);
      expect(Object.keys(parsed.Resources)).toEqual(
        expect.arrayContaining(['OrderQueue', 'OrderQueueDLQ']),
      );
    });

    it('converts to YAML on request', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.cloudFormationClient.getTemplate({
          stackName,
          convertTo: 'yaml',
        });
      });

      expect(ok).toBe(true);
      expect(result).toContain('OrderQueue:');
      expect(() => JSON.parse(result)).toThrow();
    });
  });

  describe('getResourcesWithDependencies (L2b)', () => {
    it('enriches OrderQueue with a GetAtt dependency on OrderQueueDLQ, resolved from the real template', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.cloudFormationClient.getResourcesWithDependencies(
          stackName,
        );
      });

      expect(ok).toBe(true);
      const orderQueue = result.find((it) => it.logicalId === 'OrderQueue');
      expect(orderQueue.dependsOn).toEqual([
        { logicalId: 'OrderQueueDLQ', via: 'GetAtt' },
      ]);

      // The DLQ itself depends on nothing - dependsOn stays undefined rather
      // than an empty array, same convention as the plain listing.
      const dlq = result.find((it) => it.logicalId === 'OrderQueueDLQ');
      expect(dlq.dependsOn).toBeUndefined();
    });
  });

  describe('scan', () => {
    it('returns the stack as a row, matching the ListStacks summary fields', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.cloudFormationClient.scan({
          kind: 'aws-cloudformation',
          limit: 10,
        });
      });

      expect(ok).toBe(true);
      const row = result.rows.find((it) => it.values['StackName'] === stackName);
      expect(row).toBeDefined();
      expect(row.values['StackStatus']).toBe('CREATE_COMPLETE');
    });

    it('filters by nameContains', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.cloudFormationClient.scan({
          kind: 'aws-cloudformation',
          nameContains: 'no-such-stack',
          limit: 10,
        });
      });

      expect(ok).toBe(true);
      expect(result.rows).toHaveLength(0);
    });

    it('filters by statusFilter', async () => {
      const { ok, result } = await driver.flow(async () => {
        return await driver.cloudFormationClient.scan({
          kind: 'aws-cloudformation',
          statusFilter: 'failed',
          limit: 10,
        });
      });

      expect(ok).toBe(true);
      expect(
        result.rows.some((it) => it.values['StackName'] === stackName),
      ).toBe(false);
    });
  });

  describe('describeAccountLimits', () => {
    // Best-effort: this LocalStack edition doesn't implement
    // DescribeAccountLimits at all (confirmed: it 500s with "...is not
    // currently supported by LocalStack"), so this only checks that when the
    // call *does* succeed, StackLimit is a sane positive number - never
    // asserting a specific value, which would just be whatever backend's
    // current default. A failure that isn't this known LocalStack gap still
    // fails the test.
    it('either returns a sane StackLimit, or fails with LocalStack\'s known "not supported" error', async () => {
      let stackLimit: number | undefined;
      let unsupportedErrorMessage: string | undefined;
      try {
        const result = await driver.cloudFormationClient.describeAccountLimits();
        stackLimit = result.StackLimit;
      } catch (e) {
        unsupportedErrorMessage = e.message;
      }

      const isAcceptable =
        unsupportedErrorMessage !== undefined
          ? unsupportedErrorMessage.includes('not currently supported by LocalStack')
          : stackLimit === undefined || stackLimit > 0;
      expect(isAcceptable).toBe(true);
    });
  });
});
