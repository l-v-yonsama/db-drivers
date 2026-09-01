import {
  DBType,
  RdbDashboardTarget,
  RDSBaseDriver,
  SQLITE_DASHBOARD_CONTEXT_SQL,
  SQLITE_DASHBOARD_DATABASE_LIST_SQL,
  SQLITE_DASHBOARD_FOREIGN_KEYS_SQL,
  SQLiteRdbDashboardProvider,
  SQLiteDriver,
  sqliteDashboardPragmaSql,
  validateResolvedRdbDashboard,
} from '../../../src';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const target: RdbDashboardTarget = {
  resourceKey: 'runtime-sqlite',
  databaseName: '/tmp/dashboard.sqlite',
  dbType: DBType.SQLite,
};

function rdh(rows: Array<Record<string, unknown>>) {
  return { rows: rows.map((values) => ({ values })) } as any;
}

function providerDriver(requestSql: jest.Mock): RDSBaseDriver {
  return {
    requestSql,
    getConnectionRes: () => ({ database: '' }),
  } as unknown as RDSBaseDriver;
}

function valueForPragma(sql: string, dataVersion: number): unknown {
  if (/page_count/i.test(sql)) return 12;
  if (/page_size/i.test(sql)) return 4096;
  if (/freelist_count/i.test(sql)) return 2;
  if (/journal_mode/i.test(sql)) return 'wal';
  if (/synchronous/i.test(sql)) return 1;
  if (/auto_vacuum/i.test(sql)) return 2;
  if (/data_version/i.test(sql)) return dataVersion;
  throw new Error(`Unexpected PRAGMA: ${sql}`);
}

function sqliteRequest(initialDataVersion = 4) {
  let dataVersion = initialDataVersion;
  const request = jest.fn(async ({ sql }: { sql: string }) => {
    if (sql === SQLITE_DASHBOARD_CONTEXT_SQL) {
      return rdh([{ server_version: '3.46.0', observed_at: '2026-08-30 00:00:00' }]);
    }
    if (sql === SQLITE_DASHBOARD_DATABASE_LIST_SQL) {
      return rdh([
        { seq: 0, name: 'main', file: '' },
        { seq: 2, name: 'analytics', file: '' },
      ]);
    }
    if (sql === SQLITE_DASHBOARD_FOREIGN_KEYS_SQL) return rdh([{ foreign_keys: 1 }]);
    const value = valueForPragma(sql, dataVersion);
    const key = sql.match(/\.([a-z_]+)$/i)?.[1] ?? 'value';
    return rdh([{ [key]: value }]);
  });
  return {
    request,
    setDataVersion(value: number) {
      dataVersion = value;
    },
  };
}

describe('SQLiteRdbDashboardProvider', () => {
  it('uses only non-destructive snapshot queries', () => {
    const sql = [
      SQLITE_DASHBOARD_CONTEXT_SQL,
      SQLITE_DASHBOARD_DATABASE_LIST_SQL,
      SQLITE_DASHBOARD_FOREIGN_KEYS_SQL,
      ...(['page_count', 'page_size', 'freelist_count', 'journal_mode', 'synchronous', 'auto_vacuum', 'data_version'] as const)
        .map((pragma) => sqliteDashboardPragmaSql('main', pragma)),
    ].join('\n');

    expect(sql).not.toMatch(/wal_checkpoint|quick_check|integrity_check|\bVACUUM\b/i);
    expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REINDEX)\b/i);
  });

  it('resolves a snapshot-only dashboard without workload tabs', async () => {
    const fixture = sqliteRequest();
    const provider = new SQLiteRdbDashboardProvider(providerDriver(fixture.request));
    const capabilities = await provider.checkCapabilities(target);
    const dashboard = await provider.resolveDashboard(target, {});

    expect(capabilities.result?.variant).toBe('sqlite-memory');
    expect(capabilities.result?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sectionId: 'storage', status: 'available' }),
        expect.objectContaining({ sectionId: 'change-marker', status: 'available' }),
        expect.objectContaining({ sectionId: 'wal-state', status: 'unavailable' }),
      ]),
    );
    expect(dashboard.result?.tabs.map((tab) => tab.id)).toEqual([
      'overview',
      'storage-configuration',
    ]);
    expect(dashboard.result?.tabs.every((tab) => tab.timeMode === 'snapshot')).toBe(true);
    expect(validateResolvedRdbDashboard(dashboard.result!, provider.providerId)).toBeUndefined();
  });

  it('collects main and attached page/config snapshots and detects data_version changes', async () => {
    const fixture = sqliteRequest(4);
    const provider = new SQLiteRdbDashboardProvider(providerDriver(fixture.request));
    await provider.checkCapabilities(target);
    const metricIds = [
      'attached_database_count', 'page_count', 'page_size', 'database_size_bytes',
      'free_pages', 'reusable_bytes', 'data_version', 'external_change_detected',
      'foreign_keys_enabled', 'journal_mode', 'synchronous_mode', 'auto_vacuum_mode',
      'wal_file_bytes',
    ];
    const collect = (sequence: number) => provider.collectSample({
      target,
      sampleSessionId: 'sample',
      definitionVersion: 1,
      sequence,
      selection: {},
      metricIds,
    });

    const first = await collect(0);
    fixture.setDataVersion(5);
    const second = await collect(1);

    expect(first.result?.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: 'attached_database_count', value: 2 }),
      expect.objectContaining({ metricId: 'database_size_bytes', value: 49_152, dimensions: { database: 'main' } }),
      expect.objectContaining({ metricId: 'reusable_bytes', value: 8_192, dimensions: { database: 'analytics' } }),
      expect.objectContaining({ metricId: 'journal_mode', value: 1, dimensions: { database: 'main', mode: 'wal' } }),
      expect.objectContaining({ metricId: 'synchronous_mode', value: 1, dimensions: { database: 'main', mode: 'normal' } }),
      expect.objectContaining({ metricId: 'auto_vacuum_mode', value: 1, dimensions: { database: 'main', mode: 'incremental' } }),
      expect.objectContaining({ metricId: 'external_change_detected', value: 0, dimensions: { database: 'main' } }),
    ]));
    expect(second.result?.observations).toEqual(expect.arrayContaining([
      expect.objectContaining({ metricId: 'data_version', value: 5, dimensions: { database: 'main' } }),
      expect.objectContaining({ metricId: 'external_change_detected', value: 1, dimensions: { database: 'main' } }),
    ]));
  });

  it('quotes attached database identifiers instead of interpolating raw PRAGMA text', () => {
    expect(sqliteDashboardPragmaSql('odd"name', 'page_count')).toBe(
      'PRAGMA "odd""name".page_count',
    );
  });

  it('opens a real file read-only and leaves the database and WAL sidecar unchanged', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlite-dashboard-'));
    const database = path.join(directory, 'sample.db');
    const walFile = `${database}-wal`;
    try {
      const writer = new SQLiteDriver({
        name: 'sqlite-dashboard-writer',
        dbType: DBType.SQLite,
        database,
      });
      expect(await writer.connect()).toBe('');
      await writer.requestSql({ sql: 'CREATE TABLE sample(id INTEGER PRIMARY KEY, value TEXT)' });
      await writer.requestSql({ sql: "INSERT INTO sample(value) VALUES ('unchanged')" });
      await writer.disconnect();
      fs.writeFileSync(walFile, Buffer.from('sidecar-must-not-be-checkpointed'));
      const databaseBefore = fs.readFileSync(database);
      const walBefore = fs.readFileSync(walFile);

      const observer = new SQLiteDriver({
        name: 'sqlite-dashboard-observer',
        dbType: DBType.SQLite,
        database,
        readOnly: true,
      });
      expect(await observer.connect()).toBe('');
      const realTarget = { ...target, databaseName: database, resourceKey: 'real-file' };
      const capabilities = await observer.checkRdbDashboardAvailability(realTarget);
      const dashboard = await observer.resolveRdbDashboard(realTarget, {});
      const sample = await observer.collectRdbDashboardSample({
        target: realTarget,
        sampleSessionId: 'real-sample',
        definitionVersion: dashboard.result!.definitionVersion,
        sequence: 0,
        selection: {},
        metricIds: dashboard.result!.metrics.map((metric) => metric.id),
      });
      await observer.disconnect();

      expect(capabilities.ok).toBe(true);
      expect(dashboard.result?.variant).toBe('sqlite-file');
      expect(sample.result?.observations).toEqual(expect.arrayContaining([
        expect.objectContaining({ metricId: 'database_size_bytes', status: 'ok' }),
        expect.objectContaining({
          metricId: 'journal_mode',
          value: 1,
          dimensions: { database: 'main', mode: 'delete' },
        }),
      ]));
      expect(sample.result?.observations.find((item) => item.metricId === 'wal_file_bytes')).toEqual(
        expect.objectContaining({ value: walBefore.length }),
      );
      expect(fs.readFileSync(database)).toEqual(databaseBefore);
      expect(fs.readFileSync(walFile)).toEqual(walBefore);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
