import { DBType, isReadOnlyEnforcementReliable, isRDSType } from '../../src';

describe('isReadOnlyEnforcementReliable', () => {
  it.each([DBType.MySQL, DBType.Postgres, DBType.SQLite])(
    '%s should be true',
    (dbType) => {
      expect(isReadOnlyEnforcementReliable(dbType)).toBe(true);
    },
  );

  it.each([DBType.SQLServer, DBType.Oracle, DBType.Redis, DBType.Aws])(
    '%s should be false',
    (dbType) => {
      expect(isReadOnlyEnforcementReliable(dbType)).toBe(false);
    },
  );
});

describe('isRDSType', () => {
  it.each([
    DBType.MySQL,
    DBType.Postgres,
    DBType.SQLServer,
    DBType.SQLite,
    DBType.Oracle,
  ])('%s should be true', (dbType) => {
    expect(isRDSType(dbType)).toBe(true);
  });

  it.each([DBType.Redis, DBType.Aws, DBType.Mqtt])(
    '%s should be false',
    (dbType) => {
      expect(isRDSType(dbType)).toBe(false);
    },
  );
});
