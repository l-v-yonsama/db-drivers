export const DBType = {
  MySQL: 'MySQL',
  Postgres: 'Postgres',
  Redis: 'Redis',
  AwsS3: 'AwsS3',
  Minio: 'Minio',
  AwsSQS: 'AwsSQS',
} as const;

export type DBType = (typeof DBType)[keyof typeof DBType];

export function isAwsOrMinio(s: DBType): boolean {
  if (DBType.AwsS3 == s || DBType.Minio == s) {
    return true;
  }
  return false;
}

export function isRDB(s: DBType): boolean {
  if (DBType.MySQL == s || DBType.Postgres == s) {
    return true;
  }
  return false;
}
