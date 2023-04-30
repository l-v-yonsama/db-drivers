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
} from '@aws-sdk/client-sqs';
import * as url from 'url';
import {
  AwsDatabase,
  DbConnection,
  DbDatabase,
  DbKey,
  DbSQSQueue,
  RdhKey,
  ResultSetDataHolder,
  SQSMessageParams,
} from '../../resource';
import { GeneralColumnType, ScanParams } from '../../types';
import { AwsSQSAttributes } from '../../types/AwsSQSAttributes';
import { AwsServiceClient } from './AwsServiceClient';
import { ClientConfigType } from '../AwsDriver';
import { toBoolean, toDate, toNum } from '../../util';
import { Scannable } from '../BaseDriver';
import { AwsServiceType } from '../../types/AwsServiceType';
import { plural } from 'pluralize';

export class AwsSQSServiceClient extends AwsServiceClient implements Scannable {
  sqsClient: SQSClient;

  constructor(conRes: DbConnection, config: ClientConfigType) {
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

  async scan(params: ScanParams): Promise<ResultSetDataHolder> {
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

    const rdh = new ResultSetDataHolder([
      new RdhKey('messageId', GeneralColumnType.TEXT),
      new RdhKey('body', GeneralColumnType.TEXT),
      new RdhKey('receiptHandle', GeneralColumnType.TEXT),
      new RdhKey('sentTimestamp', GeneralColumnType.TIMESTAMP),
      new RdhKey(
        'approximateFirstReceiveTimestamp',
        GeneralColumnType.TIMESTAMP,
      ),
    ]);
    keys.forEach((dbKey) => {
      rdh.addRow({
        ...dbKey.params,
        messageId: dbKey.getName(),
      });
    });
    return rdh;
  }

  async getInfomationSchemas(): Promise<DbDatabase> {
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
      dbDatabase.comment = `${dbDatabase.getChildren().length} ${plural(
        'queue',
      )}`;
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
}
