import { ResourceType } from '../resource';

export type ScanParams = {
  /**
   * Specify target(Bucket, DB index or Queue url)
   * Redis: DB index
   * AWS S3: Bucket name
   * AWS SQS: Queue url
   */
  target: string;
  parentTarget?: string;
  limit: number;
  withValue?: boolean | 'auto';
  keyword?: string;
  startTime?: number;
  endTime?: number;
  targetResourceType?: ResourceType;
};
