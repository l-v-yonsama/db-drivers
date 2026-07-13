import { GeneralColumnType } from '@l-v-yonsama/rdh';
import { DateTime2, DateTimeOffset, ISqlType, SmallDateTime } from 'mssql';
import {
  ConnectionSetting,
  DBType,
  ResultColumn,
  SQLServerColumnType,
  SQLServerDriver,
} from '../../../src';

const connectOption: ConnectionSetting = {
  host: '127.0.0.1',
  port: 6433,
  user: 'testuser',
  password: 'Pass123zxcv!',
  database: 'testdb',
  dbType: DBType.SQLServer,
  name: 'mssql',
  sqlServer: { encrypt: false },
};

const createFieldInfo = (
  name: string,
  typeFactory: () => ISqlType,
): ResultColumn => ({
  index: 0,
  name,
  length: 0,
  type: typeFactory,
  nullable: true,
  caseSensitive: false,
  identity: false,
  readOnly: false,
});

describe('SQLServerColumnType.parse', () => {
  it('resolves datetime-family type names to their own enum members', () => {
    expect(SQLServerColumnType.parse('datetime2')).toBe(
      SQLServerColumnType.DATETIME2,
    );
    expect(SQLServerColumnType.parse('smalldatetime')).toBe(
      SQLServerColumnType.SMALLDATETIME,
    );
    expect(SQLServerColumnType.parse('datetimeoffset')).toBe(
      SQLServerColumnType.DATETIMEOFFSET,
    );
  });
});

describe('SQLServerDriver.fieldInfo2Key', () => {
  const driver = new SQLServerDriver(connectOption);

  it('maps DATETIME2 to GeneralColumnType.TIMESTAMP (not UNKNOWN)', () => {
    const key = driver.fieldInfo2Key(
      createFieldInfo('CreatedAt', () => DateTime2()),
      false,
    );
    expect(key.type).toBe(GeneralColumnType.TIMESTAMP);
  });

  it('maps SMALLDATETIME to GeneralColumnType.TIMESTAMP (not UNKNOWN)', () => {
    const key = driver.fieldInfo2Key(
      createFieldInfo('UpdatedAt', () => SmallDateTime()),
      false,
    );
    expect(key.type).toBe(GeneralColumnType.TIMESTAMP);
  });

  it('maps DATETIMEOFFSET to GeneralColumnType.TIMESTAMP_WITH_TIME_ZONE (not UNKNOWN)', () => {
    const key = driver.fieldInfo2Key(
      createFieldInfo('ExpiresAt', () => DateTimeOffset()),
      false,
    );
    expect(key.type).toBe(GeneralColumnType.TIMESTAMP_WITH_TIME_ZONE);
  });
});
