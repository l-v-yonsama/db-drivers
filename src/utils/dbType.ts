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

/**
 * Whether `ConnectionSetting.readOnly` is actively enforced by the engine
 * for this DBType (true), vs. only a best-effort request the server may
 * ignore (false).
 *
 * MySQL / Postgres / SQLite actively reject write/DDL statements once
 * `readOnly` is applied. SQL Server only sets `ApplicationIntent=ReadOnly`,
 * an Always-On Availability-Group read-only-routing hint; on a standalone
 * instance (or a primary without read-only routing configured) it is a
 * no-op, so callers must not treat it as a write-blocking guarantee there.
 * Oracle is deliberately excluded too: its closest equivalent (`SET
 * TRANSACTION READ ONLY`) is transaction-scoped, but ad-hoc queries run
 * with autocommit outside of `flowTransaction()`, so it would only cover
 * the first statement after connect and then silently stop applying —
 * worse than an honest no-op, so callers must not rely on it here either.
 */
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
