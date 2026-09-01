/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
} from '@aws-sdk/types';
import { AwsDatabase, SchemaAndTableName } from '../resource';

import { fromEnv, fromIni } from '@aws-sdk/credential-providers';

import {
  AwsServiceType,
  ConnectionSetting,
  LimitClauseStyle,
  MetricEndpoint,
  QueryParams,
  ResourceType,
  SQLLang,
  SupplyCredentialType,
} from '../types';
import { AwsCloudFormationServiceClient } from './aws/AwsCloudFormationServiceClient';
import { AwsCloudwatchServiceClient } from './aws/AwsCloudwatchServiceClient';
import { AwsS3ServiceClient } from './aws/AwsS3ServiceClient';
import { AwsServiceClient } from './aws/AwsServiceClient';
import { AwsSESServiceClient } from './aws/AwsSESServiceClient';
import { AwsSQSServiceClient } from './aws/AwsSQSServiceClient';
import { AwsDynamoServiceClient } from './aws/AwsDynamoServiceClient';
import { AwsSsmServiceClient } from './aws/AwsSsmServiceClient';
import { AwsSecretsManagerServiceClient } from './aws/AwsSecretsManagerServiceClient';
import { ResultSetData } from '@l-v-yonsama/rdh';
import { BaseSQLSupportDriver } from './BaseSQLSupportDriver';
import { QuoteChar } from '../helpers';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { S3Client } from '@aws-sdk/client-s3';
import { GeneralResult } from '../types/drivers/GeneralResult';
import { PerformanceTuningCallOptions } from '../types/drivers/performance/PerformanceTuningContext';
import {
  DynamoDbPerformanceTuningAvailabilityParams,
  DynamoDbPerformanceTuningCapabilities,
} from '../types/drivers/performance/DynamoDbPerformanceTuningCapabilities';
import {
  DynamoDbPerformanceTuningCallOptions,
  DynamoDbPerformanceTuningContext,
  DynamoDbPerformanceTuningContextParams,
} from '../types/drivers/performance/DynamoDbPerformanceTuningContext';
import { DynamoDbCloudWatchMetricsCollector } from './providers/performance/dynamoDbCloudWatchMetrics';
import {
  DynamoDbMonitoringMode,
  DynamoDbPerformanceTuningDriverAccess,
  DynamoDbPerformanceTuningProvider,
} from './providers/performance/DynamoDbPerformanceTuningProvider';
import {
  CloudWatchMetricsCollector,
  CloudWatchMetricsAvailability,
  CloudWatchMetricPanelsResult,
  CollectCloudWatchMetricPanelsInput,
  CloudWatchMetricsTransport,
  CloudWatchLogsMetricServiceAdapter,
  collectAcrossMetricEndpoints,
  DynamoDbOverviewMetricServiceAdapter,
  DynamoDbMetricServiceAdapter,
  MetricServiceAdapterRegistry,
  S3MetricServiceAdapter,
  S3OverviewMetricServiceAdapter,
  SesMetricServiceAdapter,
  SqsOverviewMetricServiceAdapter,
  SqsMetricServiceAdapter,
} from './providers/metrics';

export type ClientConfigType = {
  region?: string;
  profile?: string;
  endpoint?: string;
  credentials: AwsCredentialIdentityProvider | AwsCredentialIdentity;
};

export class AwsDriver extends BaseSQLSupportDriver<AwsDatabase> {
  public sesClient: AwsSESServiceClient;
  public sqsClient: AwsSQSServiceClient;
  public cloudwatchClient: AwsCloudwatchServiceClient;
  public s3Client: AwsS3ServiceClient;
  public dynamoClient: AwsDynamoServiceClient;
  public ssmClient: AwsSsmServiceClient;
  public secretsManagerClient: AwsSecretsManagerServiceClient;
  public cloudFormationClient: AwsCloudFormationServiceClient;

  // Lazily reuse the tuning provider without changing normal AWS service initialization.
  private dynamoDbPerformanceTuningProvider:
    | DynamoDbPerformanceTuningProvider
    | undefined;
  private readonly cloudWatchMetricsCollectors = new Map<
    string,
    {
      client: CloudWatchClient;
      collector: CloudWatchMetricsCollector;
      availability: CloudWatchMetricsAvailability;
    }
  >();
  private readonly s3MetricControlClients = new Map<string, S3Client>();
  private readonly metricServiceAdapterRegistry: MetricServiceAdapterRegistry;
  private effectiveRegion: string | undefined;
  private effectiveRegionPromise: Promise<string | undefined> | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
    this.metricServiceAdapterRegistry = new MetricServiceAdapterRegistry([
      new SqsMetricServiceAdapter(),
      new SqsOverviewMetricServiceAdapter(),
      new DynamoDbMetricServiceAdapter(),
      new DynamoDbOverviewMetricServiceAdapter(),
      new CloudWatchLogsMetricServiceAdapter(),
      new S3MetricServiceAdapter({
        getS3Client: (endpoint): S3Client =>
          this.getS3MetricsControlClient(endpoint),
        getAvailability: (endpoint): CloudWatchMetricsAvailability =>
          this.getCloudWatchMetricsAvailability(endpoint),
      }),
      new S3OverviewMetricServiceAdapter({
        getAvailability: (endpoint): CloudWatchMetricsAvailability =>
          this.getCloudWatchMetricsAvailability(endpoint),
      }),
      new SesMetricServiceAdapter({
        getAvailability: (endpoint): CloudWatchMetricsAvailability =>
          this.getCloudWatchMetricsAvailability(endpoint),
      }),
    ]);
  }

  protected createClientConfig(): ClientConfigType {
    const { url, awsSetting } = this.conRes;

    const config: ClientConfigType = {
      credentials: this.createAwsCredential(),
    };
    if (awsSetting?.region) {
      config.region = awsSetting.region;
    }
    if (
      awsSetting?.supplyCredentialType ===
        SupplyCredentialType.sharedCredentialsFile &&
      awsSetting.profile
    ) {
      // Keep the SDK's region/config resolution on the same named profile as the explicitly selected credential provider.
      config.profile = awsSetting.profile;
    }
    if (url) {
      config.endpoint = url;
    }
    return config;
  }

  /** Returns the base region selected by the AWS SDK after applying the connection's explicit region, named profile, environment, and shared config provider chain. */
  async getEffectiveRegion(): Promise<string | undefined> {
    if (this.effectiveRegion) {
      return this.effectiveRegion;
    }
    if (!this.effectiveRegionPromise) {
      this.effectiveRegionPromise = this.resolveEffectiveRegion();
    }
    return this.effectiveRegionPromise;
  }

  private async resolveEffectiveRegion(): Promise<string | undefined> {
    const client = new CloudWatchClient(this.createClientConfig());
    try {
      const region = await client.config.region();
      this.effectiveRegion = region || undefined;
      return this.effectiveRegion;
    } catch (_) {
      return undefined;
    } finally {
      client.destroy();
    }
  }

  getSqlLang(): SQLLang {
    return 'partiql';
  }

  getClientByServiceType<T extends AwsServiceClient = AwsServiceClient>(
    serviceType: AwsServiceType,
  ): T | undefined {
    let client: AwsServiceClient = undefined;
    switch (serviceType) {
      case 'Cloudwatch':
        client = this.cloudwatchClient;
        break;
      case 'S3':
        client = this.s3Client;
        break;
      case 'SES':
        client = this.sesClient;
        break;
      case 'SQS':
        client = this.sqsClient;
        break;
      case 'DynamoDB':
        client = this.dynamoClient;
        break;
      case 'SSM':
        client = this.ssmClient;
        break;
      case 'SecretsManager':
        client = this.secretsManagerClient;
        break;
      case 'CloudFormation':
        client = this.cloudFormationClient;
        break;
    }
    return client as T;
  }

  getClientByResourceType<T extends AwsServiceClient = AwsServiceClient>(
    resourceType: ResourceType,
  ): T | undefined {
    let client: AwsServiceClient = undefined;
    switch (resourceType) {
      case 'LogGroup':
      case 'LogStream':
        client = this.cloudwatchClient;
        break;
      case 'Bucket':
      case 'Owner':
        client = this.s3Client;
        break;
      case 'Queue':
        client = this.sqsClient;
        break;
      case 'DynamoTable':
        client = this.dynamoClient;
        break;
      case 'SsmParameter':
        client = this.ssmClient;
        break;
      case 'SecretsManagerSecret':
        client = this.secretsManagerClient;
        break;
      case 'CfnStack':
        client = this.cloudFormationClient;
        break;
    }
    return client as T;
  }

  /** Dashboard adapters are registered independently from selected AWS services. */
  getMetricServiceAdapterRegistry(): MetricServiceAdapterRegistry {
    return this.metricServiceAdapterRegistry;
  }

  /** Lazily creates a CloudWatch metrics collector for the resolved endpoint. */
  getCloudWatchMetricsCollector(
    endpoint: MetricEndpoint,
  ): CloudWatchMetricsCollector {
    return this.getCloudWatchMetricsResources(endpoint).collector;
  }

  getCloudWatchMetricsAvailability(
    endpoint: MetricEndpoint,
  ): CloudWatchMetricsAvailability {
    return this.getCloudWatchMetricsResources(endpoint).availability;
  }

  collectCloudWatchMetricPanels(
    defaultEndpoint: MetricEndpoint,
    input: CollectCloudWatchMetricPanelsInput,
  ): Promise<CloudWatchMetricPanelsResult> {
    return collectAcrossMetricEndpoints(
      (endpoint) => this.getCloudWatchMetricsCollector(endpoint),
      defaultEndpoint,
      input,
    );
  }

  private getCloudWatchMetricsResources(endpoint: MetricEndpoint): {
    client: CloudWatchClient;
    collector: CloudWatchMetricsCollector;
    availability: CloudWatchMetricsAvailability;
  } {
    const cacheKey = JSON.stringify([
      endpoint.scope,
      endpoint.region,
      endpoint.endpoint ?? '',
    ]);
    const cached = this.cloudWatchMetricsCollectors.get(cacheKey);
    if (cached) {
      return cached;
    }

    const client = new CloudWatchClient({
      ...this.createClientConfig(),
      region: endpoint.region,
      ...(endpoint.endpoint ? { endpoint: endpoint.endpoint } : {}),
    });
    const collector = new CloudWatchMetricsCollector(
      new CloudWatchMetricsTransport(client),
    );
    const availability = new CloudWatchMetricsAvailability(client);
    const resources = { client, collector, availability };
    this.cloudWatchMetricsCollectors.set(cacheKey, resources);
    return resources;
  }

  private getS3MetricsControlClient(endpoint: MetricEndpoint): S3Client {
    const cacheKey = JSON.stringify([endpoint.region, endpoint.endpoint ?? '']);
    const cached = this.s3MetricControlClients.get(cacheKey);
    if (cached) return cached;
    const client = new S3Client({
      ...this.createClientConfig(),
      region: endpoint.region,
      ...(endpoint.endpoint ? { endpoint: endpoint.endpoint } : {}),
      ...(this.conRes.awsSetting?.s3ForcePathStyle
        ? { forcePathStyle: true }
        : {}),
    });
    this.s3MetricControlClients.set(cacheKey, client);
    return client;
  }

  private createAwsCredential():
    | AwsCredentialIdentityProvider
    | AwsCredentialIdentity {
    const { awsSetting, user, password } = this.conRes;
    if (awsSetting && awsSetting.supplyCredentialType) {
      switch (awsSetting.supplyCredentialType) {
        case SupplyCredentialType.sharedCredentialsFile:
          return fromIni({ profile: awsSetting.profile });
        case SupplyCredentialType.environmentVariables:
          return fromEnv();
      }
    }
    return {
      accessKeyId: user,
      secretAccessKey: password,
      ...(awsSetting?.sessionToken
        ? { sessionToken: awsSetting.sessionToken }
        : {}),
    };
  }

  async connectSub(): Promise<string> {
    const messageList = [];
    const config = this.createClientConfig();
    await this.getEffectiveRegion();
    const cw = new AwsCloudwatchServiceClient(this.conRes, config, this);
    const sqs = new AwsSQSServiceClient(this.conRes, config, this);
    const s3 = new AwsS3ServiceClient(this.conRes, config, this);
    const ses = new AwsSESServiceClient(this.conRes, config, this);
    const dynamo = new AwsDynamoServiceClient(this.conRes, config, this);
    const ssm = new AwsSsmServiceClient(this.conRes, config, this);
    const secretsManager = new AwsSecretsManagerServiceClient(
      this.conRes,
      config,
      this,
    );
    const cloudFormation = new AwsCloudFormationServiceClient(
      this.conRes,
      config,
      this,
    );
    const { services } = this.conRes.awsSetting;

    let message = '';
    if (services.includes(AwsServiceType.Cloudwatch)) {
      message = await cw.connect();
      if (message) {
        messageList.push(message);
        this.cloudwatchClient = null;
      } else {
        this.cloudwatchClient = cw;
      }
    }
    if (services.includes(AwsServiceType.SQS)) {
      message = await sqs.connect();
      if (message) {
        messageList.push(message);
        this.sqsClient = null;
      } else {
        this.sqsClient = sqs;
      }
    }
    if (services.includes(AwsServiceType.SES)) {
      message = await ses.connect();
      if (message) {
        messageList.push(message);
        this.sesClient = null;
      } else {
        this.sesClient = ses;
      }
    }
    if (services.includes(AwsServiceType.S3)) {
      message = await s3.connect();
      if (message) {
        messageList.push(message);
        this.s3Client = null;
      } else {
        this.s3Client = s3;
      }
    }
    if (services.includes(AwsServiceType.DynamoDB)) {
      message = await dynamo.connect();
      if (message) {
        messageList.push(message);
        this.dynamoClient = null;
      } else {
        this.dynamoClient = dynamo;
      }
    }
    if (services.includes(AwsServiceType.SSM)) {
      message = await ssm.connect();
      if (message) {
        messageList.push(message);
        this.ssmClient = null;
      } else {
        this.ssmClient = ssm;
      }
    }
    if (services.includes(AwsServiceType.SecretsManager)) {
      message = await secretsManager.connect();
      if (message) {
        messageList.push(message);
        this.secretsManagerClient = null;
      } else {
        this.secretsManagerClient = secretsManager;
      }
    }
    if (services.includes(AwsServiceType.CloudFormation)) {
      message = await cloudFormation.connect();
      if (message) {
        messageList.push(message);
        this.cloudFormationClient = null;
      } else {
        this.cloudFormationClient = cloudFormation;
      }
    }

    // SSOセッション切れエラーが含まれているかチェック
    const ssoExpired = messageList.some(
      (msg) =>
        typeof msg === 'string' &&
        (msg.includes(
          'The SSO session associated with this profile has expired',
        ) ||
          msg.includes('SSO session has expired') ||
          msg.includes('To refresh this SSO session')),
    );
    if (ssoExpired) {
      if (this.conRes.awsSetting?.profile) {
        messageList.unshift(
          `Your AWS SSO session has expired. Please run:\naws sso login --profile ${this.conRes.awsSetting.profile}\nand then try to reconnect.`,
        );
      } else {
        messageList.unshift(
          `Your AWS SSO session has expired. Please run:\naws sso login --profile <YOUR PROFILE>\nand then try to reconnect.`,
        );
      }
    }

    return messageList.join(',');
  }

  async getInfomationSchemasSub(): Promise<AwsDatabase[]> {
    const list = [];
    for (const client of [
      this.s3Client,
      this.sesClient,
      this.sqsClient,
      this.cloudwatchClient,
      this.dynamoClient,
      this.ssmClient,
      this.secretsManagerClient,
      this.cloudFormationClient,
    ]) {
      if (!client) {
        continue;
      }
      const db = await client.getInfomationSchemas();
      if (db) {
        list.push(db);
      }
    }
    return list;
  }

  async test(with_connect = false): Promise<string> {
    const messageList = [];
    const config = this.createClientConfig();
    const { services } = this.conRes.awsSetting;
    if (services.includes(AwsServiceType.Cloudwatch)) {
      const client = new AwsCloudwatchServiceClient(this.conRes, config, this);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.SES)) {
      const client = new AwsSESServiceClient(this.conRes, config, this);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.SQS)) {
      const client = new AwsSQSServiceClient(this.conRes, config, this);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.S3)) {
      const client = new AwsS3ServiceClient(this.conRes, config, this);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.DynamoDB)) {
      const client = new AwsDynamoServiceClient(this.conRes, config, this);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.SSM)) {
      const client = new AwsSsmServiceClient(this.conRes, config, this);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.SecretsManager)) {
      const client = new AwsSecretsManagerServiceClient(
        this.conRes,
        config,
        this,
      );
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.CloudFormation)) {
      const client = new AwsCloudFormationServiceClient(
        this.conRes,
        config,
        this,
      );
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }

    return messageList.join(',');
  }

  async closeSub(): Promise<string> {
    const messageList = [];
    for (const client of [
      this.sesClient,
      this.sqsClient,
      this.cloudwatchClient,
      this.s3Client,
      this.dynamoClient,
      this.ssmClient,
      this.secretsManagerClient,
      this.cloudFormationClient,
    ]) {
      if (!client) {
        continue;
      }
      const message = await client.disconnect();
      if (message) {
        messageList.push(message);
      }
    }
    for (const entry of this.cloudWatchMetricsCollectors.values()) {
      entry.client.destroy();
    }
    this.cloudWatchMetricsCollectors.clear();
    for (const client of this.s3MetricControlClients.values()) {
      client.destroy();
    }
    this.s3MetricControlClients.clear();
    return messageList.join(',');
  }

  isPositionedParameterAvailable(): boolean {
    return false;
  }

  getPositionalCharacter(): string | undefined {
    return undefined;
  }

  getLimitClauseStyle(): LimitClauseStyle {
    return 'trailing';
  }

  isSchemaSpecificationSvailable(): boolean {
    return false;
  }

  getIdQuoteCharacter(): QuoteChar | undefined {
    return undefined;
  }

  async requestSql(params: QueryParams): Promise<ResultSetData> {
    if (this.dynamoClient) {
      return this.dynamoClient.requestPartiql(params);
    }
    throw new Error('Not supported.');
  }

  async explainSql(params: QueryParams): Promise<ResultSetData> {
    throw new Error('Not supported.');
  }

  async explainAnalyzeSql(params: QueryParams): Promise<ResultSetData> {
    throw new Error('Not supported.');
  }

  async countSql(params: QueryParams): Promise<number | undefined> {
    throw new Error('Not supported.');
  }

  async kill(sesssionOrPid?: number): Promise<string> {
    if (this.dynamoClient) {
      const message = await this.dynamoClient.kill();
      if (message) {
        return message;
      }
    }
    if (this.cloudwatchClient) {
      return await this.cloudwatchClient.kill();
    }
    return '';
  }

  async count(params: SchemaAndTableName): Promise<number | undefined> {
    if (this.dynamoClient) {
      return await this.dynamoClient.count(params.table);
    }
    throw new Error('Not supported.');
  }

  // Capability support comes from connection settings because callers check before connecting.
  supportsGetDynamoDbPerformanceTuningContext(): boolean {
    return !!this.conRes.awsSetting?.services?.includes(
      AwsServiceType.DynamoDB,
    );
  }

  async checkDynamoDbPerformanceTuningContextAvailability(
    params: DynamoDbPerformanceTuningAvailabilityParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: PerformanceTuningCallOptions,
  ): Promise<GeneralResult<DynamoDbPerformanceTuningCapabilities>> {
    if (!this.dynamoClient) {
      return {
        ok: false,
        message: 'This connection does not have DynamoDB configured.',
      };
    }
    return this.getDynamoDbPerformanceTuningProvider().checkCapabilities(
      params,
    );
  }

  async getDynamoDbPerformanceTuningContext(
    params: DynamoDbPerformanceTuningContextParams,
    options?: DynamoDbPerformanceTuningCallOptions,
  ): Promise<GeneralResult<DynamoDbPerformanceTuningContext>> {
    if (!this.dynamoClient) {
      return {
        ok: false,
        message: 'This connection does not have DynamoDB configured.',
      };
    }
    return this.getDynamoDbPerformanceTuningProvider().collect(params, options);
  }

  // CloudWatch evidence is created lazily only for supported AWS connections.
  private getDynamoDbPerformanceTuningProvider(): DynamoDbPerformanceTuningProvider {
    if (!this.dynamoDbPerformanceTuningProvider) {
      const cloudWatchSelected = !!this.conRes.awsSetting?.services?.includes(
        AwsServiceType.Cloudwatch,
      );
      const monitoringMode: DynamoDbMonitoringMode = !cloudWatchSelected
        ? 'cloudWatchNotSelected'
        : this.conRes.url
        ? 'customEndpoint'
        : 'enabled';
      const cloudWatchCollector =
        monitoringMode === 'enabled'
          ? new DynamoDbCloudWatchMetricsCollector(
              new CloudWatchClient(this.createClientConfig()),
            )
          : undefined;
      const access = new AwsDriverDynamoDbPerformanceTuningAccess(
        this.dynamoClient,
        cloudWatchCollector,
        this.effectiveRegion ?? this.conRes.awsSetting?.region,
        this.conRes.url ? 'custom' : 'aws',
        monitoringMode,
      );
      this.dynamoDbPerformanceTuningProvider =
        new DynamoDbPerformanceTuningProvider(access);
    }
    return this.dynamoDbPerformanceTuningProvider;
  }
}

// Keeps the performance provider dependent on its narrow driver-access contract.
class AwsDriverDynamoDbPerformanceTuningAccess
  implements DynamoDbPerformanceTuningDriverAccess
{
  constructor(
    private readonly dynamoClient: AwsDynamoServiceClient,
    private readonly cloudWatchCollector:
      | DynamoDbCloudWatchMetricsCollector
      | undefined,
    public readonly region: string | undefined,
    public readonly endpointKind: 'aws' | 'custom',
    public readonly monitoringMode: DynamoDbMonitoringMode,
  ) {}

  describeTable(
    tableName: string,
  ): ReturnType<AwsDynamoServiceClient['describeTable']> {
    return this.dynamoClient.describeTable(tableName);
  }

  describeTimeToLive(
    tableName: string,
  ): ReturnType<AwsDynamoServiceClient['describeTimeToLive']> {
    return this.dynamoClient.describeTimeToLive(tableName);
  }

  describeContributorInsights(
    tableName: string,
    indexName?: string,
  ): ReturnType<AwsDynamoServiceClient['describeContributorInsights']> {
    return this.dynamoClient.describeContributorInsights(tableName, indexName);
  }

  collectCloudWatchMetrics(
    input: Parameters<DynamoDbCloudWatchMetricsCollector['collect']>[0],
  ): ReturnType<DynamoDbCloudWatchMetricsCollector['collect']> {
    return this.cloudWatchCollector
      ? this.cloudWatchCollector.collect(input)
      : Promise.resolve({
          ok: false as const,
          message: 'CloudWatch monitoring is not enabled for this connection.',
        });
  }

  observeNativeQueryRead(params: {
    input: unknown;
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): ReturnType<AwsDynamoServiceClient['observeNativeQueryRead']> {
    return this.dynamoClient.observeNativeQueryRead(
      params as Parameters<AwsDynamoServiceClient['observeNativeQueryRead']>[0],
    );
  }

  observePartiqlRead(params: {
    statement: string;
    parameters?: unknown[];
    maxEvaluatedItems?: number;
    timeoutMs?: number;
    signal?: AbortSignal;
  }): ReturnType<AwsDynamoServiceClient['observePartiqlRead']> {
    return this.dynamoClient.observePartiqlRead(params);
  }

  observeNativeQueryReadComplete(
    params: Parameters<
      AwsDynamoServiceClient['observeNativeQueryReadComplete']
    >[0],
  ): ReturnType<AwsDynamoServiceClient['observeNativeQueryReadComplete']> {
    return this.dynamoClient.observeNativeQueryReadComplete(params);
  }

  observePartiqlReadComplete(
    params: Parameters<AwsDynamoServiceClient['observePartiqlReadComplete']>[0],
  ): ReturnType<AwsDynamoServiceClient['observePartiqlReadComplete']> {
    return this.dynamoClient.observePartiqlReadComplete(params);
  }
}
