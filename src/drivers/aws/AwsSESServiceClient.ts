/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  GetSendQuotaCommand,
  GetSendQuotaCommandOutput,
  GetSendStatisticsCommand,
  GetSendStatisticsCommandOutput,
  IdentityType,
  ListIdentitiesCommand,
  SESClient,
  VerifyDomainIdentityCommand,
  VerifyDomainIdentityCommandOutput,
  VerifyEmailAddressCommand,
  VerifyEmailAddressCommandOutput,
} from '@aws-sdk/client-ses';
import { AwsDatabase } from '../../resource';
import { AwsServiceType, ConnectionSetting } from '../../types';
import { AwsDriver, ClientConfigType } from '../AwsDriver';
import { AwsServiceClient } from './AwsServiceClient';

export class AwsSESServiceClient extends AwsServiceClient {
  sesClient: SESClient;

  constructor(
    conRes: ConnectionSetting,
    config: ClientConfigType,
    awsDriver: AwsDriver,
  ) {
    super(conRes, config, awsDriver);
  }

  protected async connectSub(): Promise<string> {
    this.sesClient = new SESClient(this.config);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.sesClient) {
      await this.getSendQuota();
    }
  }

  async listIdentities(identityType: IdentityType): Promise<string[]> {
    let NextToken: string | undefined = undefined;
    const list: string[] = [];
    do {
      const res = await this.sesClient.send(
        new ListIdentitiesCommand({
          IdentityType: identityType,
          MaxItems: 1000,
          NextToken,
        }),
      );
      list.push(...res.Identities);
      NextToken = res.NextToken;
    } while (NextToken);

    return list;
  }

  async verifyEmailAddress(
    emailAddress: string,
  ): Promise<VerifyEmailAddressCommandOutput> {
    return await this.sesClient.send(
      new VerifyEmailAddressCommand({
        EmailAddress: emailAddress,
      }),
    );
  }

  async verifyDomainIdentity(
    domain: string,
  ): Promise<VerifyDomainIdentityCommandOutput> {
    return await this.sesClient.send(
      new VerifyDomainIdentityCommand({
        Domain: domain,
      }),
    );
  }

  async getSendQuota(): Promise<GetSendQuotaCommandOutput> {
    return await this.sesClient.send(new GetSendQuotaCommand({}));
  }

  async getSendStatistics(): Promise<GetSendStatisticsCommandOutput> {
    return await this.sesClient.send(new GetSendStatisticsCommand({}));
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new AwsDatabase('SES', AwsServiceType.SES);
    const { Max24HourSend, SentLast24Hours } = await this.getSendQuota();
    dbDatabase.comment = `Max24HourSend:${Max24HourSend}, SentLast24Hours:${SentLast24Hours}`;

    return dbDatabase;
  }

  protected async closeSub(): Promise<void> {
    await this.sesClient.destroy();
  }

  protected getServiceName(): string {
    return 'SES';
  }
}
