import { DBType } from '../types';

export const isAws = (dbType: DBType): boolean => DBType.Aws === dbType;

export const isRDSType = (dbType: DBType): boolean => {
  switch (dbType) {
    case DBType.MySQL:
    case DBType.Postgres:
      return true;
  }
  return false;
};
