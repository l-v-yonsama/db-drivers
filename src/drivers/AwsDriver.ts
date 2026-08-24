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
  DynamoDbPerformanceTuningDriverAccess,
  DynamoDbPerformanceTuningProvider,
} from './providers/performance/DynamoDbPerformanceTuningProvider';

export type ClientConfigType = {
  region?: string;
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

  // Lazily constructed on first DynamoDB performance-tuning call, not part
  // of connectSub()'s AwsServiceType.* gating (see the note on
  // getDynamoDbPerformanceTuningProvider() below) - cached afterward so a
  // Preview reopening the same connection doesn't re-create a
  // CloudWatchClient every call.
  private dynamoDbPerformanceTuningProvider: DynamoDbPerformanceTuningProvider | undefined;

  constructor(conRes: ConnectionSetting) {
    super(conRes);
  }

  protected createClientConfig(): ClientConfigType {
    const { url, awsSetting } = this.conRes;

    const config: ClientConfigType = {
      credentials: this.createAwsCredential(),
    };
    if (awsSetting?.region) {
      config.region = awsSetting.region;
    }
    if (url) {
      config.endpoint = url;
    }
    return config;
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

  // -------------------------------------------------------------------
  // DynamoDB performance tuning (design doc §6.7). A parallel API, not
  // RDSBaseDriver's getPerformanceTuningContext()/
  // checkPerformanceTuningContextAvailability() - AwsDriver is a sibling
  // of RDSBaseDriver under BaseSQLSupportDriver, not a subclass, so this
  // adds nothing to either base class's contract and cannot collide with
  // the RDB-side method names.
  // -------------------------------------------------------------------

  supportsGetDynamoDbPerformanceTuningContext(): boolean {
    return !!this.dynamoClient;
  }

  async checkDynamoDbPerformanceTuningContextAvailability(
    params: DynamoDbPerformanceTuningAvailabilityParams,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: PerformanceTuningCallOptions,
  ): Promise<GeneralResult<DynamoDbPerformanceTuningCapabilities>> {
    if (!this.dynamoClient) {
      return { ok: false, message: 'This connection does not have DynamoDB configured.' };
    }
    return this.getDynamoDbPerformanceTuningProvider().checkCapabilities(params);
  }

  async getDynamoDbPerformanceTuningContext(
    params: DynamoDbPerformanceTuningContextParams,
    options?: DynamoDbPerformanceTuningCallOptions,
  ): Promise<GeneralResult<DynamoDbPerformanceTuningContext>> {
    if (!this.dynamoClient) {
      return { ok: false, message: 'This connection does not have DynamoDB configured.' };
    }
    return this.getDynamoDbPerformanceTuningProvider().collect(params, options);
  }

  // Deliberately not built in connectSub() alongside the other AWS service
  // clients: those are gated on the connection's configured
  // AwsServiceType.* list (which service categories a user chose to browse
  // in the resource tree), but DynamoDB performance tuning must work
  // whenever DynamoDB itself is configured, independent of whether
  // AwsServiceType.Cloudwatch (Logs browsing) was separately selected -
  // that is an unrelated AWS service from the caller's perspective. Built
  // lazily instead, on first use, from the same createClientConfig() every
  // other AWS service client already uses.
  private getDynamoDbPerformanceTuningProvider(): DynamoDbPerformanceTuningProvider {
    if (!this.dynamoDbPerformanceTuningProvider) {
      const config = this.createClientConfig();
      const cloudWatchClient = new CloudWatchClient(config);
      const access = new AwsDriverDynamoDbPerformanceTuningAccess(
        this.dynamoClient,
        new DynamoDbCloudWatchMetricsCollector(cloudWatchClient),
        this.conRes.awsSetting?.region,
        this.conRes.url ? 'custom' : 'aws',
      );
      this.dynamoDbPerformanceTuningProvider = new DynamoDbPerformanceTuningProvider(access);
    }
    return this.dynamoDbPerformanceTuningProvider;
  }
}

// Adapter satisfying DynamoDbPerformanceTuningDriverAccess by delegating to
// AwsDynamoServiceClient's Describe*/observe* methods and a
// DynamoDbCloudWatchMetricsCollector - kept as a small standalone class
// (rather than having AwsDriver itself implement the interface) so the
// Provider's dependency stays exactly as narrow as
// MySQLPerformanceTuningDriverAccess's own rationale calls for.
class AwsDriverDynamoDbPerformanceTuningAccess implements DynamoDbPerformanceTuningDriverAccess {
  constructor(
    private readonly dynamoClient: AwsDynamoServiceClient,
    private readonly cloudWatchCollector: DynamoDbCloudWatchMetricsCollector,
    public readonly region: string | undefined,
    public readonly endpointKind: 'aws' | 'custom',
  ) {}

  describeTable(tableName: string) {
    return this.dynamoClient.describeTable(tableName);
  }

  describeTimeToLive(tableName: string) {
    return this.dynamoClient.describeTimeToLive(tableName);
  }

  describeContributorInsights(tableName: string, indexName?: string) {
    return this.dynamoClient.describeContributorInsights(tableName, indexName);
  }

  collectCloudWatchMetrics(input: Parameters<DynamoDbCloudWatchMetricsCollector['collect']>[0]) {
    return this.cloudWatchCollector.collect(input);
  }

  observeNativeQueryRead(params: { input: unknown; maxEvaluatedItems?: number; timeoutMs?: number; signal?: AbortSignal }) {
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
  }) {
    return this.dynamoClient.observePartiqlRead(params);
  }
}
