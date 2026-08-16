import { ResultSetData } from '@l-v-yonsama/rdh';
import {
  ConnectionSetting,
  DBType,
  MySQLDriver,
  normalizeStatementStatisticsParams,
  OracleDriver,
  PostgresDriver,
  SQLServerDriver,
  SQLiteDriver,
  StatementStatisticsSortKey,
} from '../../../src';

const connectionSetting = (
  dbType: ConnectionSetting['dbType'],
): ConnectionSetting => ({
  dbType,
  name: `${dbType}-statistics-test`,
  database: 'testdb',
});

const rdhWithValues = (values: Record<string, unknown>): ResultSetData =>
  ({ rows: [{ values }] }) as ResultSetData;

describe('statement statistics', () => {
  it('normalizes limit, threshold and default sort safely', () => {
    expect(
      normalizeStatementStatisticsParams({
        databaseName: 'testdb',
        limit: 5000,
        minimumAverageElapsedTimeMs: -1,
      }),
    ).toEqual({
      databaseName: 'testdb',
      sortBy: StatementStatisticsSortKey.TotalElapsedTime,
      limit: 1000,
      minimumAverageElapsedTimeMs: 0,
    });
  });

  it('reports static support for server RDS drivers only', () => {
    expect(
      new PostgresDriver(
        connectionSetting(DBType.Postgres),
      ).supportsGetStatementStatistics(),
    ).toBe(true);
    expect(
      new MySQLDriver(
        connectionSetting(DBType.MySQL),
      ).supportsGetStatementStatistics(),
    ).toBe(true);
    expect(
      new SQLServerDriver(
        connectionSetting(DBType.SQLServer),
      ).supportsGetStatementStatistics(),
    ).toBe(true);
    expect(
      new OracleDriver(
        connectionSetting(DBType.Oracle),
      ).supportsGetStatementStatistics(),
    ).toBe(true);
    expect(
      new SQLiteDriver(
        connectionSetting(DBType.SQLite),
      ).supportsGetStatementStatistics(),
    ).toBe(false);
  });

  it('returns unsupported without a message for SQLite and throws on direct retrieval', async () => {
    const driver = new SQLiteDriver(connectionSetting(DBType.SQLite));

    await expect(
      driver.checkStatementStatisticsAvailability('testdb'),
    ).resolves.toEqual({ ok: false, message: '' });
    await expect(
      driver.getStatementStatistics({ databaseName: 'testdb' }),
    ).rejects.toThrow('SQLite does not support statement statistics');
  });

  it('probes pg_stat_statements and returns remediation instead of throwing', async () => {
    const driver = new PostgresDriver(connectionSetting(DBType.Postgres));
    const requestSql = jest.spyOn(driver, 'requestSql');
    requestSql.mockResolvedValueOnce(rdhWithValues({}));

    await expect(
      driver.checkStatementStatisticsAvailability('testdb'),
    ).resolves.toEqual({ ok: true, message: '' });

    requestSql.mockRejectedValueOnce(new Error('permission denied'));
    const unavailable = await driver.checkStatementStatisticsAvailability(
      'testdb',
    );
    expect(unavailable.ok).toBe(false);
    expect(unavailable.message).toContain('pg_stat_statements');
    expect(unavailable.message).toContain('permission denied');
  });

  it('checks Performance Schema and probes the digest table for MySQL', async () => {
    const driver = new MySQLDriver(connectionSetting(DBType.MySQL));
    const requestSql = jest.spyOn(driver, 'requestSql');
    requestSql.mockResolvedValueOnce(
      rdhWithValues({
        performance_schema_enabled: 1,
      }),
    );
    requestSql.mockResolvedValueOnce(rdhWithValues({}));

    await expect(
      driver.checkStatementStatisticsAvailability('testdb'),
    ).resolves.toEqual({ ok: true, message: '' });

    requestSql.mockResolvedValueOnce(
      rdhWithValues({
        performance_schema_enabled: 1,
      }),
    );
    requestSql.mockRejectedValueOnce(new Error('permission denied'));
    const unavailable = await driver.checkStatementStatisticsAvailability(
      'testdb',
    );
    expect(unavailable.ok).toBe(false);
    expect(unavailable.message).toContain('statements_digest');
    expect(unavailable.message).toContain('permission denied');
  });

  it('checks Query Store state for SQL Server', async () => {
    const driver = new SQLServerDriver(
      connectionSetting(DBType.SQLServer),
    );
    jest.spyOn(driver, 'useDatabase').mockResolvedValue();
    const requestSql = jest.spyOn(driver, 'requestSql');
    requestSql.mockResolvedValueOnce(
      rdhWithValues({ actual_state_desc: 'READ_WRITE' }),
    );

    await expect(
      driver.checkStatementStatisticsAvailability('testdb'),
    ).resolves.toEqual({ ok: true, message: '' });

    requestSql.mockResolvedValueOnce(
      rdhWithValues({ actual_state_desc: 'OFF' }),
    );
    const unavailable = await driver.checkStatementStatisticsAvailability(
      'testdb',
    );
    expect(unavailable.ok).toBe(false);
    expect(unavailable.message).toContain('Enable Query Store');
  });

  it('probes V$SQLSTATS and returns Oracle privilege remediation', async () => {
    const driver = new OracleDriver(connectionSetting(DBType.Oracle));
    const requestSql = jest.spyOn(driver, 'requestSql');
    requestSql.mockRejectedValueOnce(new Error('ORA-00942'));

    const unavailable = await driver.checkStatementStatisticsAvailability(
      'testdb',
    );
    expect(unavailable.ok).toBe(false);
    expect(unavailable.message).toContain('V$SQLSTATS');
    expect(unavailable.message).toContain('ORA-00942');
  });
});
