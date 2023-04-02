export type ScanParams<T = any> = {
  /**
   * Specify target(Bucket, DB index or Queue url)
   * Redis: DB index
   * AWS S3: Bucket name
   * AWS SQS: Queue url
   */
  target: string;
  limit: number;
  withValue?: boolean;
  keyword?: string;
  meta?: T;
};
