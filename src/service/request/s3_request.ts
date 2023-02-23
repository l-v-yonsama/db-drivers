export interface S3Request {
  connection_id: string;
  command: S3CommandType;
  Bucket: string;
  key?: string;
  options?: any;
}

export enum S3CommandType {
  PutObject = "PutObject",
  Search = "Search",
  AbortSearch = "AbortSearch",
  listObject = "listObject",
  getObject = "getObject"
}
