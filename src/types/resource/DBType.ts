export const DBType = {
  MySQL: 'MySQL',
  Postgres: 'Postgres',
  Redis: 'Redis',
  Keycloak: 'Keycloak',
  Aws: 'Aws',
} as const;

export type DBType = (typeof DBType)[keyof typeof DBType];

export const DBTypeValues = Object.values(DBType);
