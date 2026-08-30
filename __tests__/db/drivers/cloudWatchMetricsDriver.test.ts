import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import {
  AwsDriver,
  ConnectionSetting,
  DBType,
  SupplyCredentialType,
} from '../../../src';

describe('AwsDriver CloudWatch dashboard support', () => {
  const setting: ConnectionSetting = {
    dbType: DBType.Aws,
    name: 'aws',
    user: 'local',
    password: 'local',
    url: 'http://127.0.0.1:4566',
    awsSetting: {
      region: 'ap-northeast-1',
      services: ['SQS'],
      supplyCredentialType: SupplyCredentialType.ExplicitInProperty,
    },
  } as ConnectionSetting;

  it('registers resource adapters without requiring CloudWatch in the selected services', () => {
    const driver = new AwsDriver(setting);

    expect(
      driver.getMetricServiceAdapterRegistry().resolve('aws.sqs.queue'),
    ).toBeDefined();
    expect(
      driver.getMetricServiceAdapterRegistry().resolve('aws.dynamodb.table'),
    ).toBeDefined();
    expect(
      driver.getMetricServiceAdapterRegistry().resolve('aws.logs.log-group'),
    ).toBeDefined();
    expect(
      driver.getMetricServiceAdapterRegistry().resolve('aws.s3.bucket'),
    ).toBeDefined();
    expect(
      driver
        .getMetricServiceAdapterRegistry()
        .resolve('aws.ses.account-region'),
    ).toBeDefined();
  });

  it('caches by resolved endpoint and destroys cached clients on close', async () => {
    const destroy = jest
      .spyOn(CloudWatchClient.prototype, 'destroy')
      .mockImplementation(() => undefined);
    const driver = new AwsDriver(setting);
    const endpoint = {
      region: 'ap-northeast-1',
      endpoint: setting.url,
      scope: 'regional' as const,
    };

    const first = driver.getCloudWatchMetricsCollector(endpoint);
    const second = driver.getCloudWatchMetricsCollector(endpoint);
    const otherRegion = driver.getCloudWatchMetricsCollector({
      ...endpoint,
      region: 'us-east-1',
    });

    expect(second).toBe(first);
    expect(otherRegion).not.toBe(first);
    await driver.closeSub();
    expect(destroy).toHaveBeenCalledTimes(2);
    destroy.mockRestore();
  });
});
