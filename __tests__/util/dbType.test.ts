import { DBType, isReadOnlyEnforcementReliable } from '../../src';

describe('isReadOnlyEnforcementReliable', () => {
  it.each([DBType.MySQL, DBType.Postgres, DBType.SQLite])(
    '%s should be true',
    (dbType) => {
      expect(isReadOnlyEnforcementReliable(dbType)).toBe(true);
    },
  );

  it.each([DBType.SQLServer, DBType.Redis, DBType.Aws])(
    '%s should be false',
    (dbType) => {
      expect(isReadOnlyEnforcementReliable(dbType)).toBe(false);
    },
  );
});
