export const DBType = {
  MySQL: 'MySQL',
  Postgres: 'Postgres',
  SQLServer: 'SQLServer',
  SQLite: 'SQLite',
  Redis: 'Redis',
  Keycloak: 'Keycloak',
  Auth0: 'Auth0',
  Aws: 'Aws',
  Mqtt: 'Mqtt',
} as const;

export type DBType = (typeof DBType)[keyof typeof DBType];

export const DBTypeValues = Object.values(DBType);
