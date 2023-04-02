/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CreateQueueCommand,
  DeleteQueueCommand,
  GetQueueAttributesCommand,
  ListQueuesCommand,
  ReceiveMessageCommand,
  SQSClient,
  SQSClientConfig,
} from '@aws-sdk/client-sqs';
import * as url from 'url';
import { BaseDriver, RequestSqlOptions } from './BaseDriver';
import {
  DbConnection,
  DbDatabase,
  DbKey,
  DbSQSQueue,
  RdhKey,
  ResultSetDataHolder,
  SQSMessageParams,
  SchemaAndTableHints,
  TableRows,
} from '../resource';
import { AwsRegion, GeneralColumnType, ScanParams } from '../types';

export class AwsSQSDriver extends BaseDriver {
  countTables(tables: SchemaAndTableHints, options: any): Promise<TableRows[]> {
    throw new Error('Method not implemented.');
  }
  sqsClient: SQSClient;
  finder: any;
  config: SQSClientConfig;

  constructor(conRes: DbConnection) {
    super(conRes);
  }

  async connectSub(): Promise<string> {
    this.config = {};
    this.config.region = AwsRegion.usWest1;

    if (this.conRes.region) {
      this.config.region = this.conRes.region;
    }

    this.config.credentials = {
      accessKeyId: this.conRes.user,
      secretAccessKey: this.conRes.password,
    };

    if (this.conRes.url) {
      this.config.endpoint = this.conRes.url;
    }

    this.sqsClient = new SQSClient(this.config);

    return this.test(false);
  }

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    if (with_connect) {
      errorReason = await this.connect();
    }
    if (this.sqsClient) {
      try {
        const a = await this.sqsClient.send(
          new ListQueuesCommand({ MaxResults: 1 }),
        );
      } catch (e) {
        // console.error(e);
        errorReason = e.message;
      }
    }

    if (with_connect) {
      await this.disconnect();
    }

    return errorReason;
  }

  abortSearch(): void {
    if (this.finder) {
      this.finder.abort();
    }
  }

  async scan(params: ScanParams): Promise<DbKey<SQSMessageParams>[]> {
    const { target, limit, keyword } = params;

    const result = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: target,
        MaxNumberOfMessages: limit,
      }),
    );

    let messages = result.Messages;
    if (keyword) {
      messages = messages.filter(
        (it) => it.Body.includes(keyword) || it.MessageId.includes(keyword),
      );
    }
    return messages.map((it) => {
      const params: SQSMessageParams = {
        body: it.Body,
        receiptHandle: it.ReceiptHandle,
        md5OfBody: it.MD5OfBody,
      };
      return new DbKey(it.MessageId, params);
    });
  }

  async getInfomationSchemas(options: {
    progress_callback?: Function | undefined;
    params?: any;
  }): Promise<Array<DbDatabase>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<DbDatabase>();
    const dbDatabase = new DbDatabase('SQS');
    dbResources.push(dbDatabase);

    try {
      let NextToken: string | undefined = undefined;
      do {
        const queues = await this.sqsClient.send(
          new ListQueuesCommand({ MaxResults: 1000, NextToken }),
        );
        if (queues.QueueUrls) {
          for (const queueUrl of queues.QueueUrls) {
            const name = url.parse(queueUrl).pathname;
            const attr = await this.sqsClient.send(
              new GetQueueAttributesCommand({
                QueueUrl: queueUrl,
                AttributeNames: ['All'],
              }),
            );
            const attributes = attr?.Attributes;
            const dbQueue = new DbSQSQueue(name, queueUrl, attributes);
            dbDatabase.addChild(dbQueue);
          }
        }
        NextToken = queues.NextToken;
      } while (NextToken);
      dbDatabase.comment = `${dbDatabase.getChildren().length} queues`;
    } catch (e) {
      console.error(e);
      // reject(e);
    }
    return dbResources;
  }
  async requestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder> {
    return new ResultSetDataHolder([]);
  }

  async createQueue({ name }: { name: string }): Promise<void> {
    await this.sqsClient.send(new CreateQueueCommand({ QueueName: name }));
  }

  // async getValueByKey({
  //   bucket,
  //   key,
  // }: {
  //   bucket: string;
  //   key: string;
  // }): Promise<any> {
  //   // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
  //   const data = await this.sqsClient.send(
  //     new GetObjectCommand({
  //       Bucket: bucket,
  //       Key: key,
  //     }),
  //   );
  //   return data.Body.transformToString();
  // }

  // async putObject({
  //   bucket,
  //   key,
  //   body,
  // }: {
  //   bucket: string;
  //   key: string;
  //   body: PutObjectCommandInput['Body'];
  // }): Promise<void> {
  //   await this.sqsClient.send(
  //     new PutObjectCommand({
  //       Bucket: bucket,
  //       Key: key,
  //       Body: body,
  //     }),
  //   );
  // }

  async removeQueue({ url }: { url: string }): Promise<void> {
    // await this.removeAllObjects({ bucket });
    await this.sqsClient.send(new DeleteQueueCommand({ QueueUrl: url }));
  }

  // async removeAllObjects({ bucket }: { bucket: string }): Promise<void> {
  //   let truncated = true;
  //   let pageMarker;
  //   const bucketParams: any = { Bucket: bucket };

  //   while (truncated) {
  //     const response = await this.sqsClient.send(
  //       new ListObjectsCommand(bucketParams),
  //     );
  //     // return response; //For unit tests
  //     for (let i = 0; i < response.Contents.length; i++) {
  //       const item = response.Contents[i];
  //       const delR = await this.sqsClient.send(
  //         new DeleteObjectCommand({
  //           Bucket: bucket,
  //           Key: item.Key,
  //         }),
  //       );
  //     }
  //     // Log the key of every item in the response to standard output.
  //     truncated = response.IsTruncated;
  //     // If truncated is true, assign the key of the last element in the response to the pageMarker variable.
  //     if (truncated) {
  //       pageMarker = response.Contents.slice(-1)[0].Key;
  //       // Assign the pageMarker value to bucketParams so that the next iteration starts from the new pageMarker.
  //       bucketParams.Marker = pageMarker;
  //     }
  //     // At end of the list, response.truncated is false, and the function exits the while loop.
  //   }
  // }

  async closeSub(): Promise<string> {
    if (this.sqsClient) {
      this.sqsClient.destroy();
    }
    return '';
  }
}
