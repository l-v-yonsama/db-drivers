/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandOutput,
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
  DbKey,
  DbS3Bucket,
  DbS3Owner,
  ResultSetDataBuilder,
  S3KeyParams,
  createRdhKey,
} from '../../resource';
import {
  AwsServiceType,
  ConnectionSetting,
  FileAnnotation,
  GeneralColumnType,
  RdhRowMeta,
  ResultSetData,
  ScanParams,
} from '../../types';
import { AwsServiceClient } from './AwsServiceClient';
import { ClientConfigType } from '../AwsDriver';
import { Scannable } from '../BaseDriver';
import { plural } from 'pluralize';
import { parseContentType, prettyFileSize } from '../../utils';

export class AwsS3ServiceClient extends AwsServiceClient implements Scannable {
  s3Client: S3Client;

  constructor(conRes: ConnectionSetting, config: ClientConfigType) {
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

  async getSignedUrl({
    bucket,
    key,
    expireMinutes,
  }: {
    bucket: string;
    key: string;
    expireMinutes: number;
  }): Promise<string> {
    const expiresIn = 60 * expireMinutes;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    // await the signed URL and return it
    return await getSignedUrl(this.s3Client as any, command as any, {
      expiresIn,
    });
  }

  async listObjects({
    bucket,
    prefix,
    limit,
    startTime,
    endTime,
    withHeader,
    withValue,
  }: {
    bucket: string;
    prefix: string;
    limit: number;
    startTime?: number;
    endTime?: number;
    withHeader: boolean;
    withValue?: {
      limitSize: number;
    };
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

        for (const item of response.Contents) {
          if (startTime && item.LastModified.valueOf() < startTime) {
            continue;
          }
          if (endTime && item.LastModified.valueOf() > endTime) {
            continue;
          }
          const key = new DbKey<S3KeyParams>(item.Key, {
            etag: item.ETag?.replace(/"/g, ''),
            size: item.Size,
            storageClass: item.StorageClass,
            lastModified: item.LastModified,
          });
          list.push(key);
        }

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

    await Promise.all(
      list
        .filter((it) => it.params.size > 0)
        .map(async (it) => {
          const url = await this.getSignedUrl({
            bucket,
            key: it.name, // name as S3 Key
            expireMinutes: 30,
          });
          it.params.downloadUrl = url;
        }),
    );

    if (withHeader) {
      const promises = list.map(async (it) => {
        const header = await this.getHeadObject({
          bucket,
          key: it.name, // name as S3 Key
        });
        it.params.deleteMarker = header.DeleteMarker;
        it.params.versionId = header.VersionId;
        it.params.cacheControl = header.CacheControl;
        it.params.contentDisposition = header.ContentDisposition;
        it.params.contentEncoding = header.ContentEncoding;
        it.params.contentType = header.ContentType;
      });
      await Promise.all(promises);
    }
    if (withValue) {
      const promises = list
        .filter((it) => it.params.size <= withValue.limitSize)
        .map(async (it) => {
          const res = await this.getValueByKey({
            bucket,
            key: it.name,
          });
          if (
            parseContentType({
              fileName: it.name,
              contentType: it.params.contentType,
            }).isTextValue
          ) {
            it.params.stringValue = await res.Body?.transformToString();
            it.params.encodedBase64 = false;
          } else {
            it.params.stringValue = await res.Body?.transformToString('base64');
            it.params.encodedBase64 = true;
          }
        });
      await Promise.all(promises);
    }
    return list;
  }

  async scan(params: ScanParams): Promise<ResultSetData> {
    const { target, limit, keyword, startTime, endTime, withValue } = params;
    const list = await this.listObjects({
      bucket: target,
      prefix: keyword,
      limit,
      startTime,
      endTime,
      withHeader: true,
      withValue,
    });
    const rdb = new ResultSetDataBuilder([
      createRdhKey({ name: 'key', type: GeneralColumnType.TEXT, width: 200 }),
      createRdhKey({ name: 'size', type: GeneralColumnType.TEXT, width: 60 }),
      createRdhKey({ name: 'etag', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'storageClass', type: GeneralColumnType.TEXT }),
      createRdhKey({
        name: 'lastModified',
        type: GeneralColumnType.TIMESTAMP,
      }),
      createRdhKey({ name: 'contentType', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'contentEncoding', type: GeneralColumnType.TEXT }),
      createRdhKey({
        name: 'contentDisposition',
        type: GeneralColumnType.TEXT,
      }),
      createRdhKey({ name: 'cacheControl', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'versionId', type: GeneralColumnType.TEXT }),
      createRdhKey({ name: 'deleteMarker', type: GeneralColumnType.BOOLEAN }),
      createRdhKey({
        name: 'value',
        type: GeneralColumnType.UNKNOWN,
        width: 210,
      }),
    ]);
    list.forEach((dbKey) => {
      const value = dbKey.params?.stringValue;
      let rowMeta: RdhRowMeta | undefined = undefined;
      if (dbKey.params.size > 0) {
        const contentTypeInfo = parseContentType({
          fileName: dbKey.name,
          contentType: dbKey.params.contentType,
        });
        const fileAnnonation: FileAnnotation = {
          type: 'Fil',
          values: {
            name: dbKey.name,
            size: dbKey.params.size,
            lastModified: dbKey.params.lastModified,
            contentTypeInfo,
            encoding: dbKey.params.contentEncoding,
            downloadUrl: dbKey.params.downloadUrl,
          },
        };
        rowMeta = {
          value: [fileAnnonation],
        };
      }

      rdb.addRow(
        {
          ...dbKey.params,
          key: dbKey.name,
          size: prettyFileSize(dbKey.params.size),
          value,
        },
        rowMeta,
      );
    });
    return rdb.build();
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

  async getInfomationSchemas(): Promise<AwsDatabase> {
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

  async getHeadObject({
    bucket,
    key,
  }: {
    bucket: string;
    key: string;
  }): Promise<HeadObjectCommandOutput> {
    const inParams = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await this.s3Client.send(inParams);
  }

  async createBucket({ bucket }: { bucket: string }): Promise<void> {
    await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
  }

  async getValueByKey({
    bucket,
    key,
  }: {
    bucket: string;
    key: string;
  }): Promise<GetObjectCommandOutput> {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return data;
  }

  async putObject({
    bucket,
    key,
    body,
    contentType,
    contentLength,
  }: {
    bucket: string;
    key: string;
    body: PutObjectCommandInput['Body'];
    contentType?: PutObjectCommandInput['ContentType'];
    contentLength?: PutObjectCommandInput['ContentLength'];
  }): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ContentLength: contentLength,
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
