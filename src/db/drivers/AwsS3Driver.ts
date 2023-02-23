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
import S3 from 'aws-sdk/clients/s3';
import * as path from 'path';
import * as fs from 'fs';
import * as FileUtil from '../../util/file_util';
import { DBType } from '../resource/types/DBType';
import { createClient } from 's3-client';
import { DateModifiedType } from '../../types/DateModifiedType';
import { FileKindType } from '../../types/FileKindType';

const LOG_PREFIX = '[AwsS3Driver.ts]';

export default class AwsS3Driver extends BaseDriver {
  s3: S3 | undefined;
  super_client: any;
  finder: any;
  config: S3.ClientConfiguration | undefined;

  constructor(conRes: DbConnection) {
    super(conRes);
  }

  async asyncConnectSub(): Promise<string> {
    this.config = {};
    this.config!.apiVersion = '2006-03-01';
    this.config!.region = 'us-west-1';
    if (this.conRes.apiVersion) {
      this.config!.apiVersion = this.conRes.apiVersion;
    }
    if (this.conRes.region) {
      this.config!.region = this.conRes.region;
    }
    this.config!.accessKeyId = this.conRes.user;
    this.config!.secretAccessKey = this.conRes.password;

    if (this.conRes.db_type === DBType.Minio) {
      (<any>this.config).endpoint = this.conRes.url;
      (<any>this.config).s3ForcePathStyle = 'true';
      this.config!.signatureVersion = 'v4';
    }
    this.s3 = new S3(this.config);
    // extra.
    const options = {
      maxAsyncS3: 20, // this is the default
      s3RetryCount: 3, // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Client: this.s3,
    };
    this.super_client = createClient(options);

    return this.asyncTest(false);
  }

  async asyncTest(with_connect = false): Promise<string> {
    let errorReason = '';
    return new Promise<string>(async (resolve, reject) => {
      try {
        if (with_connect) {
          errorReason = await this.asyncConnect();
        }
        if (this.s3) {
          this.s3.listBuckets((err, buckets) => {
            if (err) {
              errorReason = err.message;
            } else {
              // if (buckets.Buckets) {
              //   log.info('num of buckets =', buckets.Buckets.length)
              // } else {
              //   log.info('Buckets nothing.')
              // }
            }
            resolve(errorReason);
          });
        } else {
          if (with_connect) {
            await this.asyncClose();
          }
          resolve(errorReason);
        }
      } catch (e) {
        errorReason = e.message;
        if (with_connect) {
          await this.asyncClose();
        }
        resolve(errorReason);
      }
    });
  }

  getSignedUrl(bucket: string, key: string, expire_minutes: number) {
    const signedUrlExpireSeconds = 60 * expire_minutes;
    const url = this.s3!.getSignedUrl('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: signedUrlExpireSeconds,
    });
    return url;
  }

  async asyncCountTables(
    tables: SchemaAndTableHints,
    options: any,
  ): Promise<TableRows[]> {
    return new Array<TableRows>();
  }

  asyncAbortSearch() {
    if (this.finder) {
      this.finder.abort();
    }
  }

  async asyncSearch(
    bucket: string,
    prefix = '',
    options: {
      date_modified_type?: DateModifiedType;
      file_kind_type?: FileKindType;
      name?: string;
      progress_callback?: Function;
    },
  ): Promise<S3KeySearchResult> {
    const ret: S3KeySearchResult = {
      prefix,
      list: new Array<DbS3Key>(),
      ContinuationToken: '',
    };
    return new Promise<S3KeySearchResult>(async (resolve) => {
      try {
        this.finder = this.super_client.listObjects({
          recursive: true,
          s3Params: {
            Bucket: bucket,
            Delimiter: '',
            Prefix: prefix,
          },
        });
        this.finder.on('data', async function (data: any) {
          if (data.Contents) {
            for (let i = 0; i < data.Contents.length; i++) {
              const content = data.Contents[i];
              // {
              //   Key: 'HLS/tutorial/1M/abc.m3u8',
              //   LastModified: 2018-03-06T04:01:11.000Z,
              //   ETag: '"9bcb47a6acdf633f72e113f442c7ba44"',
              //   Size: 188,
              //   StorageClass: 'STANDARD'
              // }
              const k = content.Key;
              if (k) {
                let valid = true;
                if (valid && options.name) {
                  valid = ('' + k).indexOf(options.name) >= 0;
                }
                if (valid && options.date_modified_type) {
                  valid = DateModifiedType.isValid(
                    options.date_modified_type,
                    content.LastModified,
                  );
                }
                if (valid && options.file_kind_type) {
                  valid = FileKindType.isValid(options.file_kind_type, k + '');
                }
                if (valid) {
                  const key = new DbS3Key(k);
                  key.updated = content.LastModified;
                  // console.log('content.LastModified=', content.LastModified, content.LastModified.getTime());
                  key.etag = content.ETag;
                  key.size = content.Size;
                  key.storage_class = content.StorageClass;
                  // output_file_path
                  const fResult = await FileUtil.asyncGetKeyFile(bucket, k);
                  if (fResult.ok) {
                    key.output_file_path = fResult.result;
                    if (
                      options.file_kind_type === FileKindType.Image &&
                      key.size &&
                      key.size < 100 * 1024
                    ) {
                      key.base64 = <string>(
                        await FileUtil.asyncReadFile(fResult.result, 'base64')
                      );
                    }
                  }
                  ret.list.push(key);
                }
              }
            }
          }
        });
        this.finder.on('progress', () => {
          if (options.progress_callback) {
            options.progress_callback(
              this.finder.objectsFound,
              this.finder.progressAmount,
              this.finder.dirsFound,
              ret.list.length,
            );
          }
        });
        this.finder.on('end', function () {
          ret.list.sort((a, b) => b.updated!.getTime() - a.updated!.getTime());
          setTimeout(() => resolve(ret), 500);
        });
      } catch (e) {
        ret.error_message = e.message;
        resolve(ret);
      }
    });
  }

  async asyncGetKeys(
    bucket: string,
    count: number,
    config: { prefix?: string; token?: string; scan_pattern?: string },
  ): Promise<S3KeySearchResult> {
    const opts: S3.ListObjectsV2Request = {
      Bucket: bucket,
      MaxKeys: count,
      Delimiter: '/',
      Prefix: '',
    };
    if (config) {
      if (config.prefix && config.prefix !== '/') {
        opts.Prefix = config.prefix;
      }
      if (config.scan_pattern) {
        opts.Prefix += config.scan_pattern;
      }
      if (config.token) {
        opts.ContinuationToken = config.token;
      }
    }
    const ret: S3KeySearchResult = {
      prefix: config.prefix,
      list: new Array<DbS3Key>(),
      ContinuationToken: '',
    };
    try {
      await this.listAllKeys(opts, count, ret);
    } catch (e) {
      ret.error_message = e.message;
    }
    return ret;
  }

  async asyncS3ListObjectsV2(
    opts: S3.ListObjectsV2Request,
  ): Promise<S3.Types.ListObjectsV2Output> {
    return new Promise<S3.Types.ListObjectsV2Output>(
      async (resolve, reject) => {
        this.s3!.listObjectsV2(opts, (err, data) => {
          resolve(data);
        });
      },
    );
  }

  async listAllKeys(
    opts: S3.ListObjectsV2Request,
    count: number,
    result: S3KeySearchResult,
  ) {
    try {
      const data = await this.asyncS3ListObjectsV2(opts);
      console.info(LOG_PREFIX, 'data=', data);
      if (data.CommonPrefixes) {
        data.CommonPrefixes!.forEach((p: any) => {
          let prefix = p.Prefix;
          // if (opts.Prefix) {
          //   prefix = prefix.substring(opts.Prefix.length);
          // }
          const idx = prefix.lastIndexOf('/', prefix.length - 2);
          if (idx > 0) {
            prefix = prefix.substring(idx + 1);
          }

          const dir = new DbS3Key(prefix, true);
          console.log(LOG_PREFIX, 'L306 push', dir);
          result.list.push(dir);
        });
      }
      if (data.Contents) {
        for (let i = 0; i < data.Contents.length; i++) {
          const content = data.Contents[i];
          // {
          //   Key: 'HLS/tutorial/1M/abc.m3u8',
          //   LastModified: 2018-03-06T04:01:11.000Z,
          //   ETag: '"9bcb47a6acdf633f72e113f442c7ba44"',
          //   Size: 188,
          //   StorageClass: 'STANDARD'
          // }
          let k = content.Key!;
          if (opts.Prefix === k && k.endsWith('/')) {
            continue;
          }
          if (k) {
            const idx = k.lastIndexOf('/');
            if (idx > 0 && idx < k.length - 1) {
              k = k.substring(idx + 1);
            }
            const key = new DbS3Key(k);
            key.updated = content.LastModified;
            key.etag = content.ETag;
            key.size = content.Size;
            key.storage_class = content.StorageClass;
            // output_file_path
            const fResult = await FileUtil.asyncGetKeyFile(opts.Bucket, k);
            if (fResult.ok) {
              key.output_file_path = fResult.result;
            }
            console.log(LOG_PREFIX, 'L335 push', key);
            result.list.push(key);
          }
        }
      }
      if (data.IsTruncated) {
        const opts2: S3.ListObjectsV2Request = {
          Bucket: opts.Bucket,
          Delimiter: '/',
          Prefix: opts.Prefix,
          MaxKeys: count - result.list.length,
        };
        if (data.NextContinuationToken) {
          opts2.ContinuationToken = data.NextContinuationToken;
          result.ContinuationToken = data.NextContinuationToken;
        }
        await this.listAllKeys(opts2, count - result.list.length, result);
      }
    } catch (e) {
      console.error('L98', e);
    }
  }

  async getKeyRes(bucket: string, prefix: string) {
    let key = null;
    try {
      const opts: S3.ListObjectsV2Request = {
        Bucket: bucket,
        MaxKeys: 1,
        Delimiter: '/',
        Prefix: prefix,
      };
      const data = await this.asyncS3ListObjectsV2(opts);
      if (data.Contents && data.Contents.length > 0) {
        const content = data.Contents[0];
        let k = content.Key;
        if (k) {
          const idx = k.lastIndexOf('/');
          if (idx > 0 && idx < k.length - 1) {
            k = k.substring(idx + 1);
          }
          key = new DbS3Key(k);
          key.updated = content.LastModified;
          key.etag = content.ETag;
          key.size = content.Size;
          key.storage_class = content.StorageClass;
          // output_file_path
          const fResult = await FileUtil.asyncGetKeyFile(opts.Bucket, k);
          if (fResult.ok) {
            key.output_file_path = fResult.result;
          }
        }
      }
    } catch (e) {
      console.error('L98', e);
    }
    return key;
  }

  async putObject(
    bucket: string,
    key: string,
    file_path: string,
  ): Promise<string | undefined> {
    const params: any = {
      Bucket: bucket,
      Key: key,
    };
    const v = fs.readFileSync(file_path);
    params.Body = v;
    return new Promise<string | undefined>((resolve, reject) => {
      this.s3!.putObject(params, (err, data) => {
        resolve(data.ETag);
      });
    });
  }

  async asyncGetResouces(options: {
    progress_callback?: Function | undefined;
    params?: any;
  }): Promise<Array<DbResource>> {
    if (!this.conRes) {
      return [];
    }
    const dbResources = new Array<DbResource>();
    const dbDatabase = new DbDatabase('S3');
    dbResources.push(dbDatabase);

    return new Promise<Array<DbResource>>(async (resolve, reject) => {
      try {
        this.s3!.listBuckets((err, buckets) => {
          if (err) {
            reject(err);
          } else {
            if (buckets.Buckets) {
              for (const bucket of buckets.Buckets) {
                const dbBucket = new DbS3Bucket(
                  bucket.Name,
                  bucket.CreationDate,
                );
                dbDatabase.addChild(dbBucket);
                // const keyList = await this.asyncGetKeys(dbBucket.getName(), 20);
                // keyList.forEach(key => {
                //   dbBucket.addChild(key);
                // })
                // dbBucket.refreshed = new Date();
              }
            } else {
              // log.info('Buckets nothing.')
            }
            if (buckets.Owner) {
              const dbOwner = new DbS3Owner(
                buckets.Owner.ID!,
                buckets.Owner.DisplayName,
              );
              dbDatabase.addChild(dbOwner);
            } else {
              // log.info('Owner nothing.')
            }
            resolve(dbResources);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  async asyncRequestSql(
    sql: string,
    options?: RequestSqlOptions,
  ): Promise<ResultSetDataHolder> {
    return new ResultSetDataHolder([]);
  }
  async asyncGetSignedUrl(bucket: string, key: string, ex: number) {
    const LOG_PREFIX = `【S3:署名付きURL取得】<Bucket:${bucket}> [Key:${key}]`;
    const signedUrlExpireSeconds = ex;

    const url = this.s3!.getSignedUrl('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: signedUrlExpireSeconds,
    });
    return url;
  }
  async asyncGet(bucket: string, key: string): Promise<string> {
    const LOG_PREFIX = `【S3:取得】<Bucket:${bucket}> [Key:${key}]`;
    const output_dir_path = await FileUtil.asyncCreateKeyFolder(bucket, key);

    return new Promise<string>((resolve, reject) => {
      const params = {
        Bucket: bucket,
        Key: key,
      };
      const output_file_path = path.join(output_dir_path, path.basename(key));
      const file = fs.createWriteStream(output_file_path);
      this.s3!.getObject(params)
        .createReadStream()
        .on('end', () => {
          return resolve(output_file_path);
        })
        .on('error', (error) => {
          return reject(error);
        })
        .pipe(file);
    });
  }

  async asyncCloseSub(): Promise<string> {
    return '';
  }
}
