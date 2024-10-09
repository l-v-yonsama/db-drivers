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
  QueryParams,
  ResourceType,
  SQLLang,
  SupplyCredentialType,
} from '../types';
import { AwsCloudwatchServiceClient } from './aws/AwsCloudwatchServiceClient';
import { AwsS3ServiceClient } from './aws/AwsS3ServiceClient';
import { AwsServiceClient } from './aws/AwsServiceClient';
import { AwsSESServiceClient } from './aws/AwsSESServiceClient';
import { AwsSQSServiceClient } from './aws/AwsSQSServiceClient';
import { AwsDynamoServiceClient } from './aws/AwsDynamoServiceClient';
import { ResultSetData } from '@l-v-yonsama/rdh';
import { BaseSQLSupportDriver } from './BaseSQLSupportDriver';

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
    ]) {
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

  isLimitAsTop(): boolean {
    return false;
  }

  isSchemaSpecificationSvailable(): boolean {
    return false;
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
      return this.dynamoClient.kill();
    }
    throw new Error('Not supported.');
  }

  async count(params: SchemaAndTableName): Promise<number | undefined> {
    if (this.dynamoClient) {
      return await this.dynamoClient.count(params.table);
    }
    throw new Error('Not supported.');
  }
}
