/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { BaseDriver } from './BaseDriver';
import { DbConnection, DbDatabase } from '../resource';
import {
  AwsCredentialIdentityProvider,
  AwsCredentialIdentity,
} from '@aws-sdk/types';

import { fromEnv, fromIni } from '@aws-sdk/credential-providers';

import { SupplyCredentialType } from '../types/AwsSupplyCredentialType';
import { AwsSQSServiceClient } from './aws/AwsSQSServiceClient';
import { AwsCloudwatchServiceClient } from './aws/AwsCloudwatchServiceClient';
import { AwsS3ServiceClient } from './aws/AwsS3ServiceClient';
import { AwsServiceType } from '../types/AwsServiceType';

export interface Destroyable {
  /**
   * Destroy underlying resources, like sockets. It's usually not necessary to do this.
   * However in Node.js, it's best to explicitly shut down the client's agent when it is no longer needed.
   * Otherwise, sockets might stay open for quite a long time before the server terminates them.
   */
  destroy(): void;
}

export type ClientConfigType = {
  region?: string;
  endpoint?: string;
  credentials: AwsCredentialIdentityProvider | AwsCredentialIdentity;
};

export class AwsDriver extends BaseDriver {
  public sqsClient: AwsSQSServiceClient;
  public cloudwatchClient: AwsCloudwatchServiceClient;
  public s3Client: AwsS3ServiceClient;

  constructor(conRes: DbConnection) {
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
    const cw = new AwsCloudwatchServiceClient(this.conRes, config);
    const sqs = new AwsSQSServiceClient(this.conRes, config);
    const s3 = new AwsS3ServiceClient(this.conRes, config);
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
    if (services.includes(AwsServiceType.S3)) {
      message = await s3.connect();
      if (message) {
        messageList.push(message);
        this.s3Client = null;
      } else {
        this.s3Client = s3;
      }
    }
    return messageList.join(',');
  }

  async getInfomationSchemas(): Promise<DbDatabase[]> {
    const list = [];
    for (const client of [
      this.s3Client,
      this.sqsClient,
      this.cloudwatchClient,
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
      const client = new AwsCloudwatchServiceClient(this.conRes, config);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.SQS)) {
      const client = new AwsSQSServiceClient(this.conRes, config);
      const message = await client.test(with_connect);
      if (message) {
        messageList.push(message);
      }
    }
    if (services.includes(AwsServiceType.S3)) {
      const client = new AwsS3ServiceClient(this.conRes, config);
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
      this.sqsClient,
      this.cloudwatchClient,
      this.s3Client,
    ]) {
      const message = await client.disconnect();
      if (message) {
        messageList.push(message);
      }
    }
    return messageList.join(',');
  }
}
