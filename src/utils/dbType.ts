import { AwsServiceType, AwsSetting, DBType } from '../types';

export const isAws = (dbType: DBType): boolean => DBType.Aws === dbType;

export const isRDSType = (dbType: DBType): boolean => {
  switch (dbType) {
    case DBType.MySQL:
    case DBType.Postgres:
    case DBType.SQLServer:
    case DBType.SQLite:
    case DBType.Oracle:
      return true;
  }
  return false;
};

/** Whether `ConnectionSetting.readOnly` is actively enforced by the engine for this DBType (true), vs. */
export const isReadOnlyEnforcementReliable = (dbType: DBType): boolean => {
  switch (dbType) {
    case DBType.MySQL:
    case DBType.Postgres:
    case DBType.SQLite:
      return true;
  }
  return false;
};

export const isPartiQLType = (
  dbType: DBType,
  awsSetting?: AwsSetting,
): boolean => {
  if (dbType !== DBType.Aws || awsSetting === undefined) {
    return false;
  }
  return awsSetting.services.includes(AwsServiceType.DynamoDB);
};
