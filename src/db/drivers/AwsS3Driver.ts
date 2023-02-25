/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
import BaseDriver, { RequestSqlOptions } from './BaseDriver';
import {
  DbConnection,
  DbResource,
  DbDatabase,
  DbS3Bucket,
  DbS3Owner,
  DbS3Key,
  S3KeySearchResult,
  TableRows,
  SchemaAndTableHints,
} from '../resource/DbResource';
import ResultSetDataHolder from '../resource/ResultSetDataHolder';
import { DBType } from '../resource/types/DBType';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';

export default class AwsS3Driver extends BaseDriver {
  s3Client: S3Client;
  finder: any;
  config: S3ClientConfig;

  constructor(conRes: DbConnection) {
    super(conRes);
  }

  async connectSub(): Promise<string> {
    this.config = {};
    this.config.region = 'us-west-1';

    if (this.conRes.region) {
      this.config.region = this.conRes.region;
    }

    this.config.credentials = {
      accessKeyId: this.conRes.user,
      secretAccessKey: this.conRes.password,
    };
    if (this.conRes.db_type === DBType.Minio) {
      (<any>this.config).endpoint = this.conRes.url;
      (<any>this.config).s3ForcePathStyle = 'true';
    }
    this.s3Client = new S3Client(this.config);

    return this.test(false);
  }

  async test(with_connect = false): Promise<string> {
    let errorReason = '';
    if (with_connect) {
      errorReason = await this.asyncConnect();
    }
    if (this.s3Client) {
      try {
        const a = await this.s3Client.send(new ListBucketsCommand({}));
      } catch (e) {
        console.error(e);
        errorReason = e.message;
      }
    }

    if (with_connect) {
      await this.asyncClose();
    }

    return errorReason;
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

  async countTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]> {
    return new Array<TableRows>();
  }

  abortSearch(): void {
    if (this.finder) {
      this.finder.abort();
    }
  }

  // async search(
  //   bucket: string,
  //   prefix = '',
  //   options: {
  //     date_modified_type?: DateModifiedType;
  //     file_kind_type?: FileKindType;
  //     name?: string;
  //     progress_callback?: Function;
  //   },
  // ): Promise<S3KeySearchResult> {
  //   const ret: S3KeySearchResult = {
  //     prefix,
  //     list: new Array<DbS3Key>(),
  //     ContinuationToken: '',
  //   };
  //   return new Promise<S3KeySearchResult>(async (resolve) => {
  //     try {
  //       this.finder = this.super_client.listObjects({
  //         recursive: true,
  //         s3Params: {
  //           Bucket: bucket,
  //           Delimiter: '',
  //           Prefix: prefix,
  //         },
  //       });
  //       this.finder.on('data', async function (data: any) {
  //         if (data.Contents) {
  //           for (let i = 0; i < data.Contents.length; i++) {
  //             const content = data.Contents[i];
  //             // {
  //             //   Key: 'HLS/tutorial/1M/abc.m3u8',
  //             //   LastModified: 2018-03-06T04:01:11.000Z,
  //             //   ETag: '"9bcb47a6acdf633f72e113f442c7ba44"',
  //             //   Size: 188,
  //             //   StorageClass: 'STANDARD'
  //             // }
  //             const k = content.Key;
  //             if (k) {
  //               let valid = true;
  //               if (valid && options.name) {
  //                 valid = ('' + k).indexOf(options.name) >= 0;
  //               }
  //               if (valid && options.date_modified_type) {
  //                 valid = DateModifiedType.isValid(
  //                   options.date_modified_type,
  //                   content.LastModified,
  //                 );
  //               }
  //               if (valid && options.file_kind_type) {
  //                 valid = FileKindType.isValid(options.file_kind_type, k + '');
  //               }
  //               if (valid) {
  //                 const key = new DbS3Key(k);
  //                 key.updated = content.LastModified;
  //                 // console.log('content.LastModified=', content.LastModified, content.LastModified.getTime());
  //                 key.etag = content.ETag;
  //                 key.size = content.Size;
  //                 key.storage_class = content.StorageClass;
  //                 // output_file_path
  //                 const fResult = await FileUtil.getKeyFile(bucket, k);
  //                 if (fResult.ok) {
  //                   key.output_file_path = fResult.result;
  //                   if (
  //                     options.file_kind_type === FileKindType.Image &&
  //                     key.size &&
  //                     key.size < 100 * 1024
  //                   ) {
  //                     key.base64 = <string>(
  //                       await FileUtil.readFile(fResult.result, 'base64')
  //                     );
  //                   }
  //                 }
  //                 ret.list.push(key);
  //               }
  //             }
  //           }
  //         }
  //       });
  //       this.finder.on('progress', () => {
  //         if (options.progress_callback) {
  //           options.progress_callback(
  //             this.finder.objectsFound,
  //             this.finder.progressAmount,
  //             this.finder.dirsFound,
  //             ret.list.length,
  //           );
  //         }
  //       });
  //       this.finder.on('end', function () {
  //         ret.list.sort((a, b) => b.updated.getTime() - a.updated.getTime());
  //         setTimeout(() => resolve(ret), 500);
  //       });
  //     } catch (e) {
  //       ret.error_message = e.message;
  //       resolve(ret);
  //     }
  //   });
  // }

  // async agetKeys(
  //   bucket: string,
  //   count: number,
  //   config: { prefix?: string; token?: string; scan_pattern?: string },
  // ): Promise<S3KeySearchResult> {
  //   const opts: S3.ListObjectsV2Request = {
  //     Bucket: bucket,
  //     MaxKeys: count,
  //     Delimiter: '/',
  //     Prefix: '',
  //   };
  //   if (config) {
  //     if (config.prefix && config.prefix !== '/') {
  //       opts.Prefix = config.prefix;
  //     }
  //     if (config.scan_pattern) {
  //       opts.Prefix += config.scan_pattern;
  //     }
  //     if (config.token) {
  //       opts.ContinuationToken = config.token;
  //     }
  //   }
  //   const ret: S3KeySearchResult = {
  //     prefix: config.prefix,
  //     list: new Array<DbS3Key>(),
  //     ContinuationToken: '',
  //   };
  //   try {
  //     await this.listAllKeys(opts, count, ret);
  //   } catch (e) {
  //     ret.error_message = e.message;
  //   }
  //   return ret;
  // }

  // async asyncS3ListObjectsV2(
  //   opts: S3.ListObjectsV2Request,
  // ): Promise<S3.Types.ListObjectsV2Output> {
  //   return new Promise<S3.Types.ListObjectsV2Output>((resolve) => {
  //     this.s3.listObjectsV2(opts, (err, data) => {
  //       resolve(data);
  //     });
  //   });
  // }

  // async listAllKeys(
  //   opts: S3.ListObjectsV2Request,
  //   count: number,
  //   result: S3KeySearchResult,
  // ): Promise<void> {
  //   try {
  //     const data = await this.asyncS3ListObjectsV2(opts);
  //     console.info(LOG_PREFIX, 'data=', data);
  //     if (data.CommonPrefixes) {
  //       data.CommonPrefixes.forEach((p: any) => {
  //         let prefix = p.Prefix;
  //         // if (opts.Prefix) {
  //         //   prefix = prefix.substring(opts.Prefix.length);
  //         // }
  //         const idx = prefix.lastIndexOf('/', prefix.length - 2);
  //         if (idx > 0) {
  //           prefix = prefix.substring(idx + 1);
  //         }

  //         const dir = new DbS3Key(prefix, true);
  //         console.log(LOG_PREFIX, 'L306 push', dir);
  //         result.list.push(dir);
  //       });
  //     }
  //     if (data.Contents) {
  //       for (let i = 0; i < data.Contents.length; i++) {
  //         const content = data.Contents[i];
  //         // {
  //         //   Key: 'HLS/tutorial/1M/abc.m3u8',
  //         //   LastModified: 2018-03-06T04:01:11.000Z,
  //         //   ETag: '"9bcb47a6acdf633f72e113f442c7ba44"',
  //         //   Size: 188,
  //         //   StorageClass: 'STANDARD'
  //         // }
  //         let k = content.Key;
  //         if (opts.Prefix === k && k.endsWith('/')) {
  //           continue;
  //         }
  //         if (k) {
  //           const idx = k.lastIndexOf('/');
  //           if (idx > 0 && idx < k.length - 1) {
  //             k = k.substring(idx + 1);
  //           }
  //           const key = new DbS3Key(k);
  //           key.updated = content.LastModified;
  //           key.etag = content.ETag;
  //           key.size = content.Size;
  //           key.storage_class = content.StorageClass;
  //           // output_file_path
  //           const fResult = await FileUtil.getKeyFile(opts.Bucket, k);
  //           if (fResult.ok) {
  //             key.output_file_path = fResult.result;
  //           }
  //           console.log(LOG_PREFIX, 'L335 push', key);
  //           result.list.push(key);
  //         }
  //       }
  //     }
  //     if (data.IsTruncated) {
  //       const opts2: S3.ListObjectsV2Request = {
  //         Bucket: opts.Bucket,
  //         Delimiter: '/',
  //         Prefix: opts.Prefix,
  //         MaxKeys: count - result.list.length,
  //       };
  //       if (data.NextContinuationToken) {
  //         opts2.ContinuationToken = data.NextContinuationToken;
  //         result.ContinuationToken = data.NextContinuationToken;
  //       }
  //       await this.listAllKeys(opts2, count - result.list.length, result);
  //     }
  //   } catch (e) {
  //     console.error('L98', e);
  //   }
  // }

  // async getKeyRes(bucket: string, prefix: string): Promise<DbS3Key> {
  //   let key = null;
  //   try {
  //     const opts: S3.ListObjectsV2Request = {
  //       Bucket: bucket,
  //       MaxKeys: 1,
  //       Delimiter: '/',
  //       Prefix: prefix,
  //     };
  //     const data = await this.asyncS3ListObjectsV2(opts);
  //     if (data.Contents && data.Contents.length > 0) {
  //       const content = data.Contents[0];
  //       let k = content.Key;
  //       if (k) {
  //         const idx = k.lastIndexOf('/');
  //         if (idx > 0 && idx < k.length - 1) {
  //           k = k.substring(idx + 1);
  //         }
  //         key = new DbS3Key(k);
  //         key.updated = content.LastModified;
  //         key.etag = content.ETag;
  //         key.size = content.Size;
  //         key.storage_class = content.StorageClass;
  //         // output_file_path
  //         const fResult = await FileUtil.getKeyFile(opts.Bucket, k);
  //         if (fResult.ok) {
  //           key.output_file_path = fResult.result;
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     console.error('L98', e);
  //   }
  //   return key;
  // }

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

  async getResouces(options: {
    progress_callback?: Function | undefined;
    params?: any;
  }): Promise<Array<DbResource>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<DbResource>();
    const dbDatabase = new DbDatabase('S3');
    dbResources.push(dbDatabase);

    try {
      const buckets = await this.s3Client.send(new ListBucketsCommand({}));
      if (buckets.Buckets) {
        for (const bucket of buckets.Buckets) {
          const dbBucket = new DbS3Bucket(bucket.Name, bucket.CreationDate);
          dbDatabase.addChild(dbBucket);
        }
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
    return dbResources;
  }
  async requestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder> {
    return new ResultSetDataHolder([]);
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

  async closeSub(): Promise<string> {
    if (this.s3Client) {
      this.s3Client.destroy();
    }
    return '';
  }
}
