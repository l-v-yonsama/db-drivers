/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsCommand,
  ListObjectsCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import {
  AwsDatabase,
  DbConnection,
  DbDatabase,
  DbKey,
  DbS3Bucket,
  DbS3Owner,
  RdhKey,
  ResultSetDataHolder,
  S3KeyParams,
} from '../../resource';
import { GeneralColumnType, ScanParams } from '../../types';
import { AwsServiceClient } from './AwsServiceClient';
import { ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { AwsServiceType } from '../../types/AwsServiceType';
import { plural } from 'pluralize';

export class AwsS3ServiceClient extends AwsServiceClient implements Scannable {
  s3Client: S3Client;

  constructor(conRes: DbConnection, config: ClientConfigType) {
    super(conRes, config);
  }

  async connectSub(): Promise<string> {
    const config: S3ClientConfig = {
      ...this.config,
    };
    if (this.conRes.awsSetting?.s3ForcePathStyle) {
      (<any>config).s3ForcePathStyle = this.conRes.awsSetting?.s3ForcePathStyle;
    }
    this.s3Client = new S3Client(config);

    return this.test(false);
  }

  protected async testSub(): Promise<void> {
    if (this.s3Client) {
      await this.s3Client.send(new ListBucketsCommand({}));
    }
  }

  // getSignedUrl(bucket: string, key: string, expire_minutes: number): string {
  //   const signedUrlExpireSeconds = 60 * expire_minutes;
  //   const url = this.s3.getSignedUrl('getObject', {
  //     Bucket: bucket,
  //     Key: key,
  //     Expires: signedUrlExpireSeconds,
  //   });
  //   return url;
  // }

  async listObjects({
    bucket,
    prefix,
    limit,
    withValue,
  }: {
    bucket: string;
    prefix: string;
    limit: number;
    withValue: boolean | 'auto';
  }): Promise<DbKey<S3KeyParams>[]> {
    // Declare truncated as a flag that the while loop is based on.
    let truncated = true;
    // Declare a variable to which the key of the last element is assigned to in the response.
    let pageMarker;

    const bucketParams: ListObjectsCommandInput = {
      Bucket: bucket,
      Prefix: prefix,
    };

    const list: DbKey<S3KeyParams>[] = [];
    while (truncated) {
      try {
        bucketParams.MaxKeys = Math.min(1000, limit - list.length);
        const response = await this.s3Client.send(
          new ListObjectsCommand(bucketParams),
        );

        response.Contents?.forEach((item) => {
          const key = new DbKey<S3KeyParams>(item.Key, {
            etag: item.ETag,
            size: item.Size,
            storageClass: item.StorageClass,
            lastModified: item.LastModified,
          });
          list.push(key);
        });

        truncated = response.IsTruncated;

        if (truncated) {
          pageMarker = response.Contents.slice(-1)[0].Key;
          // Assign the pageMarker value to bucketParams so that the next iteration starts from the new pageMarker.
          bucketParams.Marker = pageMarker;
        }
      } catch (err) {
        console.log('Error', err);
        truncated = false;
      }
    }

    if (withValue === true || withValue === 'auto') {
      const promises = list
        .filter(
          (it) =>
            withValue === true ||
            (withValue === 'auto' && it.params.size <= 10_000),
        )
        .map(async (it) => {
          it.params.base64 = await this.getValueByKey({
            bucket,
            key: it.name,
          });
        });
      await Promise.all(promises);
    }
    return list;
  }

  async scan(params: ScanParams): Promise<ResultSetDataHolder> {
    const { target, limit, keyword, withValue } = params;
    const list = await this.listObjects({
      bucket: target,
      prefix: keyword,
      limit,
      withValue,
    });
    const rdh = new ResultSetDataHolder([
      new RdhKey('key', GeneralColumnType.TEXT),
      new RdhKey('size', GeneralColumnType.INTEGER),
      new RdhKey('etag', GeneralColumnType.TEXT),
      new RdhKey('storageClass', GeneralColumnType.TEXT),
      new RdhKey('lastModified', GeneralColumnType.TIMESTAMP),
      new RdhKey('value', GeneralColumnType.UNKNOWN),
    ]);
    list.forEach((dbKey) => {
      rdh.addRow({
        ...dbKey.params,
        key: dbKey.getName(),
        value: dbKey.params?.base64,
      });
    });
    return rdh;
  }

  // async putObject(
  //   bucket: string,
  //   key: string,
  //   file_path: string,
  // ): Promise<string | undefined> {
  //   const params: any = {
  //     Bucket: bucket,
  //     Key: key,
  //   };
  //   const v = fs.readFileSync(file_path);
  //   params.Body = v;
  //   return new Promise<string | undefined>((resolve, reject) => {
  //     this.s3.putObject(params, (err, data) => {
  //       resolve(data.ETag);
  //     });
  //   });
  // }

  async getInfomationSchemas(): Promise<DbDatabase> {
    if (!this.conRes) {
      return null;
    }

    const dbDatabase = new AwsDatabase('S3', AwsServiceType.S3);

    try {
      const buckets = await this.s3Client.send(new ListBucketsCommand({}));
      if (buckets.Buckets) {
        for (const bucket of buckets.Buckets) {
          const dbBucket = new DbS3Bucket(bucket.Name, bucket.CreationDate);
          dbDatabase.addChild(dbBucket);
        }
        dbDatabase.comment = `${buckets.Buckets.length} ${plural('bucket')}`;
      }
      if (buckets.Owner) {
        const dbOwner = new DbS3Owner(
          buckets.Owner.ID,
          buckets.Owner.DisplayName,
        );
        dbDatabase.addChild(dbOwner);
      } else {
        // log.info('Owner nothing.')
      }
    } catch (e) {
      console.error(e);
      // reject(e);
    }
    return dbDatabase;
  }

  // async asyncGetSignedUrl(
  //   bucket: string,
  //   key: string,
  //   ex: number,
  // ): Promise<string> {
  //   const LOG_PREFIX = `【S3:署名付きURL取得】<Bucket:${bucket}> [Key:${key}]`;
  //   const signedUrlExpireSeconds = ex;

  //   const url = this.s3.getSignedUrl('getObject', {
  //     Bucket: bucket,
  //     Key: key,
  //     Expires: signedUrlExpireSeconds,
  //   });
  //   return url;
  // }
  // async asyncGet(bucket: string, key: string): Promise<string> {
  //   const LOG_PREFIX = `【S3:取得】<Bucket:${bucket}> [Key:${key}]`;
  //   const output_dir_path = await FileUtil.createKeyFolder(bucket, key);

  //   return new Promise<string>((resolve, reject) => {
  //     const params = {
  //       Bucket: bucket,
  //       Key: key,
  //     };
  //     const output_file_path = path.join(output_dir_path, path.basename(key));
  //     const file = fs.createWriteStream(output_file_path);
  //     this.s3
  //       .getObject(params)
  //       .createReadStream()
  //       .on('end', () => {
  //         return resolve(output_file_path);
  //       })
  //       .on('error', (error) => {
  //         return reject(error);
  //       })
  //       .pipe(file);
  //   });
  // }

  async createBucket({ bucket }: { bucket: string }): Promise<void> {
    await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
  }

  async getValueByKey({
    bucket,
    key,
  }: {
    bucket: string;
    key: string;
  }): Promise<any> {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return data.Body.transformToString();
  }

  async putObject({
    bucket,
    key,
    body,
  }: {
    bucket: string;
    key: string;
    body: PutObjectCommandInput['Body'];
  }): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
      }),
    );
  }

  async removeBucket({ bucket }: { bucket: string }): Promise<void> {
    await this.removeAllObjects({ bucket });
    await this.s3Client.send(new DeleteBucketCommand({ Bucket: bucket }));
  }

  async removeAllObjects({ bucket }: { bucket: string }): Promise<void> {
    let truncated = true;
    let pageMarker;
    const bucketParams: any = { Bucket: bucket };

    while (truncated) {
      const response = await this.s3Client.send(
        new ListObjectsCommand(bucketParams),
      );
      // return response; //For unit tests
      for (let i = 0; i < response.Contents.length; i++) {
        const item = response.Contents[i];
        const delR = await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: item.Key,
          }),
        );
      }
      // Log the key of every item in the response to standard output.
      truncated = response.IsTruncated;
      // If truncated is true, assign the key of the last element in the response to the pageMarker variable.
      if (truncated) {
        pageMarker = response.Contents.slice(-1)[0].Key;
        // Assign the pageMarker value to bucketParams so that the next iteration starts from the new pageMarker.
        bucketParams.Marker = pageMarker;
      }
      // At end of the list, response.truncated is false, and the function exits the while loop.
    }
  }

  protected async closeSub(): Promise<void> {
    await this.s3Client.destroy();
  }
}
