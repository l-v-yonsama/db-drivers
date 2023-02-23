export enum DBType {
  ODBC = 50,
  MySQL = 100,
  Postgres = 110,
  Firestore = 150,
  Mongodb = 200,
  Redis = 300,
  AwsS3 = 400,
  Minio = 402,
  IndexedDB = 500,
  Unknown = 9999,
}
export namespace DBType {
  export function parse(s: number): DBType {
    return s;
  }
  export function isAwsOrMinio(s: any): boolean {
    if (DBType.AwsS3 == s || DBType.Minio == s) {
      return true;
    }
    if ('AwsS3' === s || 'Minio' === s) {
      return true;
    }
    return false;
  }
  export function isRDB(s: any): boolean {
    if (DBType.ODBC == s || DBType.MySQL == s || DBType.Postgres == s) {
      return true;
    }
    return false;
  }
  export function currentSupportList(): any[] {
    const r: any[] = [];
    r.push({ value: DBType.ODBC, name: 'ODBC' });
    r.push({ value: DBType.MySQL, name: 'MySQL' });
    r.push({ value: DBType.Postgres, name: 'Postgres' });
    r.push({ value: DBType.Redis, name: 'Redis' });
    r.push({ value: DBType.AwsS3, name: 'AwsS3' });
    r.push({ value: DBType.Minio, name: 'Minio' });
    r.push({ value: DBType.IndexedDB, name: 'IndexedDB' });
    return r;
  }
}
