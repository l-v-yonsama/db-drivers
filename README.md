# Prepare

```sh
cd ./docker

docker compose -f unit-test.yml build

docker compose -f unit-test.yml up -d

cd ..
```

Test accounts (provisioned by `__tests__/setup/*.ts` on each test run):

| Vendor | Host:Port | Database | User | Password | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| MySQL | 127.0.0.1:6001 | test-db | testuser | testpass | app user |
| MySQL | 127.0.0.1:6001 | (all) | testadmin | testpass | ALL PRIVILEGES, for session kill |
| PostgreSQL | 127.0.0.1:6002 | testdb | testuser | testpass | already superuser (POSTGRES_USER) |
| PostgreSQL | 127.0.0.1:6002 | (all) | testadmin | testpass | SUPERUSER, kept separate from testuser |
| Oracle | 127.0.0.1:6012/FREEPDB1 | - | testuser | testpass | APP_USER |
| Oracle | 127.0.0.1:6012/FREEPDB1 | (all) | testadmin | testpass | DBA role, for session kill |
| SQL Server | 127.0.0.1:6433 | testdb | testuser | Pass123zxcv! | db_owner on testdb |
| SQL Server | 127.0.0.1:6433 | (all) | testadmin | Pass123zxcv! | sysadmin role, for session kill |

```sh
yarn add @l-v-yonsama/multi-platform-database-drivers
OR
npm i @l-v-yonsama/multi-platform-database-drivers
```

```js
import {
  DBDriverResolver,
  RDSBaseDriver,
  ResultSetDataBuilder,
  ConnectionSetting,
  DBType,
} from "@l-v-yonsama/multi-platform-database-drivers";

const connectOption: ConnectionSetting = {
  host: '127.0.0.1',
  port: 6001,
  user: 'testuser',
  password: 'testpass',
  database: 'testdb',
  dbType: DBType.MySQL,
  name: 'mysql',
};

(async (): Promise<void> => {
  const { ok, message, result } =
    await DBDriverResolver.getInstance().workflow<RDSBaseDriver>(
      connectOption,
      async (driver) => {
        const dbs = await driver.getInfomationSchemas();
        const table = dbs[0].getSchema({ isDefault: true }).children[0];
        return await driver.requestSql({
          sql: 'SELECT * FROM ' + table.name,
        });
      },
    );

  console.log('ok', ok);
  console.log('message', message);
  console.log(result);

  console.log(
    ResultSetDataBuilder.from(result).toMarkdown({
      withType: true,
      withComment: true,
    }),
  );
})();

```

```sh
ok true
message
{
  created: 2023-07-29T00:03:17.230Z,
  keys: [
    {
      name: 'DEPTNO',
      type: 14,
      comment: '部門番号',
      width: undefined,
      required: true
    },
    {
      name: 'DNAME',
      type: 4,
      comment: '部門名',
      width: undefined,
      required: false
    },
    {
      name: 'LOC',
      type: 4,
      comment: 'ロケーション',
      width: undefined,
      required: false
    }
  ],
  rows: [
    { meta: {}, values: [Object] },
    { meta: {}, values: [Object] },
    { meta: {}, values: [Object] },
    { meta: {}, values: [Object] }
  ],
  meta: {
    connectionName: 'mysql',
    comment: '部門',
    tableName: 'DEPT',
    compareKeys: [ [Object] ],
    type: 'select',
    editable: undefined
  },
  sqlStatement: 'SELECT * FROM DEPT',
  queryConditions: undefined
}
```

```sh
| DEPTNO | DNAME | LOC |
| :---: | :---: | :---: |
| 部門番号 | 部門名 | ロケーション |
| INTEGER | VARCHAR | VARCHAR |
| 10 | ACCOUNTING | NEW YORK |
| 20 | RESEARCH | DALLAS |
| 30 | SALES | CHICAGO |
| 40 | OPERATIONS | BOSTON |


```

## Project Structure

This package exposes one driver per database/service behind a shared interface. High-level layout:

```
src/
├── index.ts      # public entry point (re-exports everything below)
├── drivers/      # one <Engine>Driver.ts per DB/service
│   │             #   BaseDriver → BaseSQLSupportDriver → RDSBaseDriver
│   │             #   (MySQL/Postgres/SQLite/SQLServer/Oracle extend RDSBaseDriver;
│   │             #    Auth0/Keycloak/Memcache/Mqtt/Redis/Aws extend BaseDriver directly)
│   ├── aws/        # AWS service clients (S3/SQS/SES/Dynamo/CloudWatch) used by AwsDriver
│   └── memcache/    # helper used internally by MemcacheDriver
├── resource/     # DB metadata model: DbDatabase/DbSchema/DbTable/DbColumn hierarchy
├── helpers/      # SQL parsing/formatting (SQLHelper), rule engine, autocomplete proposals
│   └── prompts/    # per-dbType "schema definitions for LLM prompt" builders
├── types/        # types/interfaces/enums only, mirrors drivers/resource/helpers/utils
├── utils/        # standalone utilities + the SQL/application log-parsing pipeline (utils/log/)
└── examples/     # per-driver usage scripts (gitignored, not published to npm)
```

Every directory has its own `index.ts` that re-exports its contents (`export * from './X'`), so `src/index.ts` is the single public API surface shipped to consumers (`built/src/index.js`).

`__tests__/` loosely mirrors this layout (`db/drivers/`, `helpers/`, `helpers/prompts/`, `resource/`, `util/`), plus test-only `data/` (fixtures) and `setup/` (docker test-account bootstrap) folders.

Other top-level folders:

- `docker/` — Docker Compose config for the local test databases used by `__tests__/setup/*.ts` (see "Prepare" above)
- `schema/` — JSON Schema generated from the `LogParseConfig` type (`npm run build:schema`, via `typescript-json-schema`); consumed by the db-notebook VS Code extension as the JSON Validator schema for `*.log-parser.config.json` files

### Release

for local test

```sh
npm pack
```

publish

```sh
npm publish

npm notice Publishing to https://registry.npmjs.org/
This operation requires a one-time password.
Enter OTP: xxxxxx<ENTER>
```
