export const SQLITE_DASHBOARD_CONTEXT_SQL = `
SELECT sqlite_version() AS server_version,
       CURRENT_TIMESTAMP AS observed_at`;

export const SQLITE_DASHBOARD_DATABASE_LIST_SQL = 'PRAGMA database_list';

/**
 * SQLite PRAGMA schema names cannot be bound as values. The names passed here
 * come exclusively from PRAGMA database_list and are quoted as identifiers.
 */
export function sqliteDashboardPragmaSql(
  databaseName: string,
  pragma:
    | 'page_count'
    | 'page_size'
    | 'freelist_count'
    | 'journal_mode'
    | 'synchronous'
    | 'auto_vacuum'
    | 'data_version',
): string {
  const schema = `"${databaseName.replace(/"/g, '""')}"`;
  return `PRAGMA ${schema}.${pragma}`;
}

export const SQLITE_DASHBOARD_FOREIGN_KEYS_SQL = 'PRAGMA foreign_keys';
