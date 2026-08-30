import * as fs from 'fs';
import { RDSBaseDriver } from '../../../../RDSBaseDriver';
import { GeneralResult } from '../../../../../types/drivers/GeneralResult';
import {
  RdbDashboardCallOptions,
  RdbDashboardCapabilities,
  RdbDashboardSelection,
  RdbDashboardTarget,
  RdbRawObservation,
  RdbRawSampleBatch,
  RdbSampleDiagnostic,
  RdbSampleRequest,
  ResolvedRdbDashboard,
} from '../../../../../types/drivers/rdbDashboard';
import { RdbDashboardProvider } from '../../RdbDashboardProvider';
import {
  resolveSqliteDashboard,
  SQLITE_RDB_DASHBOARD_PROVIDER_ID,
  sqliteFileScope,
} from './sqliteDashboardCatalog';
import {
  SQLITE_DASHBOARD_CONTEXT_SQL,
  SQLITE_DASHBOARD_DATABASE_LIST_SQL,
  SQLITE_DASHBOARD_FOREIGN_KEYS_SQL,
  sqliteDashboardPragmaSql,
} from './sqliteDashboardQueries';

type Row = Record<string, unknown>;
type AttachedDatabase = { name: string; file: string };

function ok<T>(result: T): GeneralResult<T> {
  return { ok: true, message: '', result };
}

function rowValue(row: Row | undefined, ...names: string[]): unknown {
  if (!row) return undefined;
  const entries = Object.entries(row);
  for (const name of names) {
    const found = entries.find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (found) return found[1];
  }
  return undefined;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pragmaMode(value: unknown, names: readonly string[]): string {
  if (typeof value === 'string' && value.trim()) return value.toLowerCase();
  const index = numberOrNull(value);
  return index !== null && names[index] ? names[index] : 'unknown';
}

export class SQLiteRdbDashboardProvider implements RdbDashboardProvider {
  readonly providerId = SQLITE_RDB_DASHBOARD_PROVIDER_ID;
  private capabilitiesByResourceKey = new Map<string, RdbDashboardCapabilities>();
  private databasesByResourceKey = new Map<string, AttachedDatabase[]>();
  private previousDataVersionByResourceKey = new Map<string, Map<string, number>>();

  constructor(private readonly driver: RDSBaseDriver) {}

  async checkCapabilities(
    target: RdbDashboardTarget,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbDashboardCapabilities>> {
    try {
      const context = await this.driver.requestSql({
        sql: SQLITE_DASHBOARD_CONTEXT_SQL,
        conditions: { rawQueries: true },
        meta: { type: 'select' },
      });
      const list = await this.readDatabaseList();
      if (!list.some((item) => item.name === 'main')) {
        return { ok: false, message: 'SQLite did not expose the main database to the observer connection.' };
      }

      const sectionStatus = await this.probeSections(list);
      const serverVersion = String(rowValue(context.rows[0]?.values as Row, 'server_version') ?? 'unknown');
      const main = list.find((item) => item.name === 'main');
      const inMemory = !main?.file || target.databaseName === ':memory:';
      const scope = sqliteFileScope(target.databaseName);
      const capabilities: RdbDashboardCapabilities = {
        providerId: this.providerId,
        variant: inMemory ? 'sqlite-memory' : 'sqlite-file',
        serverVersion,
        observerIdentity: 'sqlite-observer-connection',
        sections: [
          { sectionId: 'attached-databases', status: 'available', scope },
          { sectionId: 'storage', status: sectionStatus.storage ? 'available' : 'unavailable', scope, ...(!sectionStatus.storage ? { reasonCode: 'pragma-unavailable', message: 'SQLite page allocation PRAGMAs are unavailable.' } : {}) },
          { sectionId: 'configuration', status: sectionStatus.configuration ? 'available' : 'partial', scope, ...(!sectionStatus.configuration ? { reasonCode: 'pragma-partial', message: 'Some SQLite configuration PRAGMAs are unavailable.' } : {}) },
          { sectionId: 'change-marker', status: sectionStatus.dataVersion ? 'available' : 'unavailable', scope: { kind: 'observer-connection', label: 'SQLite observer connection' }, ...(!sectionStatus.dataVersion ? { reasonCode: 'pragma-unavailable', message: 'PRAGMA data_version is unavailable.' } : {}) },
          { sectionId: 'wal-state', status: inMemory ? 'unavailable' : 'available', scope, ...(inMemory ? { reasonCode: 'in-memory-database', message: 'An in-memory database has no WAL file.' } : {}) },
        ],
      };
      this.capabilitiesByResourceKey.set(target.resourceKey, capabilities);
      this.databasesByResourceKey.set(target.resourceKey, list);
      return ok(capabilities);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[SQLiteRdbDashboardProvider:checkCapabilities]', error);
      return { ok: false, message: 'SQLite dashboard capabilities could not be checked.' };
    }
  }

  async resolveDashboard(
    target: RdbDashboardTarget,
    _selection: RdbDashboardSelection,
    options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<ResolvedRdbDashboard>> {
    let capabilities = this.capabilitiesByResourceKey.get(target.resourceKey);
    if (!capabilities) {
      const result = await this.checkCapabilities(target, options);
      if (!result.ok || !result.result) return { ok: false, message: result.message };
      capabilities = result.result;
    }
    return ok(resolveSqliteDashboard(target, capabilities));
  }

  async collectSample(
    request: RdbSampleRequest,
    _options?: RdbDashboardCallOptions,
  ): Promise<GeneralResult<RdbRawSampleBatch>> {
    const collectionStartedAt = new Date().toISOString();
    const observedAt = collectionStartedAt;
    const requested = new Set(request.metricIds);
    const observations: RdbRawObservation[] = [];
    const diagnostics: RdbSampleDiagnostic[] = [];
    let databases = this.databasesByResourceKey.get(request.target.resourceKey);
    if (!databases) {
      try {
        databases = await this.readDatabaseList();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[SQLiteRdbDashboardProvider:databaseListSample]', error);
        return { ok: false, message: 'SQLite attached databases could not be collected.' };
      }
    }

    if (requested.has('attached_database_count')) {
      observations.push({ metricId: 'attached_database_count', observedAt, value: databases.length, status: 'ok' });
    }
    if (requested.has('foreign_keys_enabled')) {
      try {
        const value = await this.readPragma(SQLITE_DASHBOARD_FOREIGN_KEYS_SQL, 'foreign_keys');
        observations.push({ metricId: 'foreign_keys_enabled', observedAt, value: numberOrNull(value), status: 'ok' });
      } catch (error) {
        this.sectionFailure(error, requested, diagnostics, observations, observedAt, 'configuration', ['foreign_keys_enabled']);
      }
    }

    const previousVersions = this.previousDataVersionByResourceKey.get(request.target.resourceKey) ?? new Map<string, number>();
    const currentVersions = new Map<string, number>();
    for (const database of databases) {
      try {
        await this.collectDatabase(requested, database, observedAt, previousVersions, currentVersions, observations);
      } catch (error) {
        this.sectionFailure(
          error,
          requested,
          diagnostics,
          observations,
          observedAt,
          'storage',
          ['page_count', 'page_size', 'database_size_bytes', 'free_pages', 'reusable_bytes', 'data_version', 'external_change_detected', 'journal_mode', 'synchronous_mode', 'auto_vacuum_mode', 'wal_file_bytes'],
          { database: database.name },
        );
      }
    }
    this.previousDataVersionByResourceKey.set(request.target.resourceKey, currentVersions);

    return ok({
      sampleSessionId: request.sampleSessionId,
      definitionVersion: request.definitionVersion,
      sequence: request.sequence,
      collectionStartedAt,
      collectionEndedAt: new Date().toISOString(),
      epochs: [],
      observations,
      diagnostics,
    });
  }

  private async readDatabaseList(): Promise<AttachedDatabase[]> {
    const result = await this.driver.requestSql({
      sql: SQLITE_DASHBOARD_DATABASE_LIST_SQL,
      conditions: { rawQueries: true },
      meta: { type: 'pragma' },
    });
    const connectionDatabase = this.driver.getConnectionRes().database;
    return result.rows.map((item) => {
      const name = String(rowValue(item.values as Row, 'name') ?? '');
      const reportedFile = String(rowValue(item.values as Row, 'file') ?? '');
      // sql.js exposes a virtual-filesystem path for main. The connection
      // setting is the authoritative host path used for the non-destructive
      // WAL sidecar stat.
      const file =
        name === 'main' && connectionDatabase && connectionDatabase !== ':memory:'
          ? connectionDatabase
          : reportedFile;
      return { name, file };
    }).filter((item) => item.name.length > 0);
  }

  private async readPragma(sql: string, preferredName: string): Promise<unknown> {
    const result = await this.driver.requestSql({
      sql,
      conditions: { rawQueries: true },
      meta: { type: 'pragma' },
    });
    const row = result.rows[0]?.values as Row | undefined;
    return rowValue(row, preferredName) ?? (row ? Object.values(row)[0] : undefined);
  }

  private async probeSections(databases: AttachedDatabase[]): Promise<{ storage: boolean; configuration: boolean; dataVersion: boolean }> {
    const main = databases.find((item) => item.name === 'main') ?? databases[0];
    if (!main) return { storage: false, configuration: false, dataVersion: false };
    const available = async (pragma: Parameters<typeof sqliteDashboardPragmaSql>[1]): Promise<boolean> => {
      try {
        await this.readPragma(sqliteDashboardPragmaSql(main.name, pragma), pragma);
        return true;
      } catch {
        return false;
      }
    };
    return {
      storage: (await available('page_count')) && (await available('page_size')) && (await available('freelist_count')),
      configuration: (await available('journal_mode')) && (await available('synchronous')) && (await available('auto_vacuum')),
      dataVersion: await available('data_version'),
    };
  }

  private async collectDatabase(
    requested: Set<string>,
    database: AttachedDatabase,
    observedAt: string,
    previousVersions: Map<string, number>,
    currentVersions: Map<string, number>,
    observations: RdbRawObservation[],
  ): Promise<void> {
    const dimension: Readonly<Record<string, string>> = { database: database.name };
    const read = (pragma: Parameters<typeof sqliteDashboardPragmaSql>[1]): Promise<unknown> =>
      this.readPragma(sqliteDashboardPragmaSql(database.name, pragma), pragma);
    const pageCount = numberOrNull(await read('page_count'));
    const pageSize = numberOrNull(await read('page_size'));
    const freePages = numberOrNull(await read('freelist_count'));
    const dataVersion = numberOrNull(await read('data_version'));
    const journalMode = pragmaMode(await read('journal_mode'), []);
    const synchronousMode = pragmaMode(await read('synchronous'), ['off', 'normal', 'full', 'extra']);
    const autoVacuumMode = pragmaMode(await read('auto_vacuum'), ['none', 'full', 'incremental']);
    const add = (
      metricId: string,
      value: number | null,
      dimensions: Readonly<Record<string, string>> = dimension,
      status: RdbRawObservation['status'] = 'ok',
    ): void => {
      if (requested.has(metricId)) observations.push({ metricId, observedAt, value, dimensions, status });
    };
    add('page_count', pageCount);
    add('page_size', pageSize);
    add('database_size_bytes', pageCount === null || pageSize === null ? null : pageCount * pageSize);
    add('free_pages', freePages);
    add('reusable_bytes', freePages === null || pageSize === null ? null : freePages * pageSize);
    add('data_version', dataVersion);
    if (dataVersion !== null) {
      const previous = previousVersions.get(database.name);
      add('external_change_detected', previous === undefined ? 0 : Number(previous !== dataVersion));
      currentVersions.set(database.name, dataVersion);
    } else {
      add('external_change_detected', null, dimension, 'unavailable');
    }
    add('journal_mode', 1, { ...dimension, mode: journalMode });
    add('synchronous_mode', 1, { ...dimension, mode: synchronousMode });
    add('auto_vacuum_mode', 1, { ...dimension, mode: autoVacuumMode });
    if (requested.has('wal_file_bytes')) {
      if (!database.file) {
        add('wal_file_bytes', null, dimension, 'unavailable');
      } else {
        let walBytes = 0;
        try {
          walBytes = fs.statSync(`${database.file}-wal`).size;
        } catch (error) {
          if (!((error as NodeJS.ErrnoException).code === 'ENOENT')) throw error;
        }
        add('wal_file_bytes', walBytes);
      }
    }
  }

  private sectionFailure(
    error: unknown,
    requested: Set<string>,
    diagnostics: RdbSampleDiagnostic[],
    observations: RdbRawObservation[],
    observedAt: string,
    sectionId: string,
    metricIds: string[],
    dimensions?: Readonly<Record<string, string>>,
  ): void {
    // eslint-disable-next-line no-console
    console.error(`[SQLiteRdbDashboardProvider:${sectionId}]`, error);
    diagnostics.push({
      sectionId,
      severity: 'warning',
      code: `${sectionId}-failed`,
      message: `SQLite ${sectionId} snapshot could not be collected.`,
    });
    for (const metricId of metricIds) {
      if (requested.has(metricId)) {
        observations.push({ metricId, observedAt, value: null, dimensions, status: 'failed' });
      }
    }
  }
}
