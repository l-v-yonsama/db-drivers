export interface S3Request {
  connectionId: string;
  command: S3CommandType;
  Bucket: string;
  key?: string;
  options?: any;
}

export enum S3CommandType {
  PutObject = 'PutObject',
  Search = 'Search',
  AbortSearch = 'AbortSearch',
  listObject = 'listObject',
  getObject = 'getObject',
}
