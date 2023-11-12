/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CreateQueueCommand,
  DeleteMessageCommand,
  DeleteQueueCommand,
  GetQueueAttributesCommand,
  ListQueuesCommand,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageResult,
} from '@aws-sdk/client-sqs';
import * as url from 'url';
import {
  AwsDatabase,
  DbKey,
  DbSQSQueue,
  ResultSetDataBuilder,
  SQSMessageParams,
  createRdhKey,
} from '../../resource';
import {
  AwsSQSAttributes,
  AwsServiceType,
  ConnectionSetting,
  GeneralColumnType,
  ResultSetData,
  ScanParams,
} from '../../types';
import { AwsServiceClient } from './AwsServiceClient';
import { ClientConfigType } from '../AwsDriver';
import { toBoolean, toDate, toNum } from '../../utils';
import { Scannable } from '../BaseDriver';
import { plural } from 'pluralize';

export class AwsSQSServiceClient extends AwsServiceClient implements Scannable {
  sqsClient: SQSClient;

  constructor(conRes: ConnectionSetting, config: ClientConfigType) {
    super(conRes, config);
  }

  protected async connectSub(): Promise<string> {
    this.sqsClient = new SQSClient(this.config);
    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.sqsClient) {
      await this.sqsClient.send(new ListQueuesCommand({ MaxResults: 1 }));
    }
  }

  async receiveMessages(
    params: ReceiveMessageCommandInput,
  ): Promise<DbKey<SQSMessageParams>[]> {
    const { Messages } = await this.sqsClient.send(
      new ReceiveMessageCommand(params),
    );

    return (Messages ?? []).map((it) => {
      const params: SQSMessageParams = {
        body: it.Body,
        receiptHandle: it.ReceiptHandle,
        md5OfBody: it.MD5OfBody,
        sentTimestamp: toDate(toNum(it.Attributes?.SentTimestamp)),
        approximateFirstReceiveTimestamp: toDate(
          toNum(it.Attributes?.ApproximateFirstReceiveTimestamp),
        ),
      };
      return new DbKey(it.MessageId, params);
    });
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { target, limit, keyword } = params;

    let keys = await this.receiveMessages({
      QueueUrl: target,
      MaxNumberOfMessages: limit,
      AttributeNames: ['SentTimestamp', 'ApproximateFirstReceiveTimestamp'],
    });

    if (keyword) {
      keys = keys.filter(
        (it) => it.meta.body.includes(keyword) || it.name.includes(keyword),
      );
    }

    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'messageId', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'body', type: GeneralColumnType.TEXT }),
      createRdhKey({
        name: 'receiptHandle',
        type: GeneralColumnType.TEXT,
      }),
      createRdhKey({
        name: 'sentTimestamp',
        type: GeneralColumnType.TIMESTAMP,
      }),
      createRdhKey({
        name: 'approximateFirstReceiveTimestamp',
        type: GeneralColumnType.TIMESTAMP,
      }),
    ]);
    keys.forEach((dbKey) => {
      rdb.addRow({
        ...dbKey.params,
        messageId: dbKey.name,
      });
    });
    return rdb.build();
  }

  async send(input: SendMessageCommandInput): Promise<SendMessageResult> {
    return await this.sqsClient.send(new SendMessageCommand(input));
  }

  async getInfomationSchemas(): Promise<AwsDatabase> {
    if (!this.conRes) {
      return null;
    }
    const dbDatabase = new AwsDatabase('SQS', AwsServiceType.SQS);

    try {
      let NextToken: string | undefined = undefined;

      do {
        const queues = await this.sqsClient.send(
          new ListQueuesCommand({ MaxResults: 1000, NextToken }),
        );
        if (queues.QueueUrls) {
          for (const queueUrl of queues.QueueUrls) {
            // The following is the queue URL for a queue named MyQueue owned by a user with the AWS account number 123456789012.
            // https://sqs.us-east-2.amazonaws.com/123456789012/MyQueue
            let name = url.parse(queueUrl).pathname;
            const idx = name.lastIndexOf('/');
            if (idx) {
              name = name.substring(idx + 1);
            }
            const attrResult = await this.sqsClient.send(
              new GetQueueAttributesCommand({
                QueueUrl: queueUrl,
                AttributeNames: ['All'],
              }),
            );
            // console.log(attr.Attributes);
            const attr = this.toAttributes(attrResult?.Attributes);

            const dbQueue = new DbSQSQueue(name, queueUrl, attr);
            dbDatabase.addChild(dbQueue);
          }
        }
        NextToken = queues.NextToken;
      } while (NextToken);
      dbDatabase.comment = `${dbDatabase.children.length} ${plural('queue')}`;
    } catch (e) {
      console.error(e);
      // reject(e);
    }
    return dbDatabase;
  }

  private toAttributes(it: Record<string, string>): AwsSQSAttributes {
    if (it == undefined) {
      return {};
    }
    return {
      ...it,
      ApproximateNumberOfMessages: toNum(it.ApproximateNumberOfMessages),
      ApproximateNumberOfMessagesNotVisible: toNum(
        it.ApproximateNumberOfMessagesNotVisible,
      ),
      ApproximateNumberOfMessagesDelayed: toNum(
        it.ApproximateNumberOfMessagesDelayed,
      ),
      DelaySeconds: toNum(it.DelaySeconds),
      MaximumMessageSize: toNum(it.MaximumMessageSize),
      MessageRetentionPeriod: toNum(it.MessageRetentionPeriod),
      ReceiveMessageWaitTimeSeconds: toNum(it.ReceiveMessageWaitTimeSeconds),
      VisibilityTimeout: toNum(it.VisibilityTimeout),
      CreatedTimestamp: toNum(it.CreatedTimestamp),
      LastModifiedTimestamp: toNum(it.LastModifiedTimestamp),
      FifoQueue: toBoolean(it.FifoQueue),
      ContentBasedDeduplication: toBoolean(it.ContentBasedDeduplication),
    };
  }

  async createQueue({
    name,
    attributes,
  }: {
    name: string;
    attributes?: AwsSQSAttributes;
  }): Promise<string> {
    const { QueueUrl } = await this.sqsClient.send(
      new CreateQueueCommand({ QueueName: name, Attributes: attributes }),
    );
    return QueueUrl;
  }

  async deleteQueue({ url }: { url: string }): Promise<void> {
    await this.sqsClient.send(new DeleteQueueCommand({ QueueUrl: url }));
  }

  async purgeQueue({ url }: { url: string }): Promise<void> {
    await this.sqsClient.send(new PurgeQueueCommand({ QueueUrl: url }));
  }

  async deleteMessage({
    url,
    receiptHandle,
  }: {
    url: string;
    receiptHandle: string;
  }): Promise<void> {
    await this.sqsClient.send(
      new DeleteMessageCommand({ QueueUrl: url, ReceiptHandle: receiptHandle }),
    );
  }

  protected async closeSub(): Promise<void> {
    await this.sqsClient.destroy();
  }

  protected getServiceName(): string {
    return 'SQS';
  }
}
