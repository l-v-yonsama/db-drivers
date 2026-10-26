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
| MQTT | 127.0.0.1:61883 | - | - | - | anonymous access for unit tests |
| gRPC fixture | 127.0.0.1:65051 | - | - | - | plaintext, no authentication |
| gRPC fixture | localhost:65052 | - | - | rpc-fixture-token | TLS + Bearer; test certificate in `docker/rpc-test/certs/` |

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

## gRPC client

`RPCDriver` loads services and message fields either from server reflection or a local `.proto` file. It supports unary calls, proto3 scalars, enum, message fields, `repeated` fields, and maps.

- `discovery: 'reflection'`: fetch definitions and their imports from the server; neither `protoFilePath` nor `includeDirs` is required. Supports reflection v1 and v1alpha. TLS and Bearer authentication also apply to reflection requests.
- `discovery: 'proto'` (also the default when omitted): load a local `.proto` file, using `includeDirs` when necessary.
- `discovery: 'verify'`: legacy local-proto mode that additionally checks service signatures against server reflection. Existing connections retain this behavior.

Reflection must be enabled and accessible on the server. If unavailable, explicitly choose local proto; the driver reports the error rather than silently falling back to a potentially stale local definition.

The Docker fixture also exposes `StreamingTestService` with server, client, and bidirectional streaming methods. `RPCDriver` shows these methods in the schema but invokes only unary methods; the streaming methods are exercised with a standard gRPC client in the integration test. `fixture.proto` imports `Customer` from `includes/customer.proto` and Google's `Timestamp` and `Duration` types. Its import statement is `import "customer.proto";`, so set `includeDirs` to `docker/rpc-test/includes` when connecting from the host. With this fixture, leaving `includeDirs` empty or pointing it at `docker/rpc-test` fails to resolve `customer.proto`; the setting is optional for proto files whose imports resolve without extra directories.

```ts
import { DBDriverResolver, DBType, RPCDriver } from '@l-v-yonsama/multi-platform-database-drivers';

const driver = DBDriverResolver.getInstance().createDriver<RPCDriver>({
  dbType: DBType.RPC,
  name: 'rpc-fixture',
  host: '127.0.0.1',
  port: 65051,
  rpc: {
    discovery: 'reflection',
    // For local files instead:
    // discovery: 'proto',
    // protoFilePath: 'docker/rpc-test/fixture.proto',
    // includeDirs: ['docker/rpc-test/includes'],
  },
});
const error = await driver.connect();
if (error) throw new Error(error);
try {
  const schema = await driver.getInfomationSchemas();
  const result = await driver.invokeUnary({
    service: 'rpcfixture.v1.CustomerService',
    method: 'CreateCustomer',
    request: { name: 'Hana', email: 'hana@example.test', active: true },
  });
  console.log(result.contents, result.status, result.elapsedMs);
} finally {
  await driver.disconnect();
}
```

`invokeUnary` returns `UnaryResult`: `contents` is the decoded response message, `status` contains the gRPC code, name, and details, and `elapsedMs` is the call duration. Optional `headers` and `trailers` contain text response metadata as string arrays; binary metadata and keys matching common credential names are omitted. Failed calls throw `RpcInvokeError` with `kind`, optional `status`, and a message ending in `statusCode:<code>` for gRPC failures. Local validation errors have no gRPC status code.

For JSON editors, use `invokeUnaryProtoJson({ service, method, requestJson, metadata })`. It parses the JSON text using the Protobuf schema and returns `contents` in ProtoJSON form: field names use their JSON names, 64-bit integers are decimal strings, and `google.protobuf.Timestamp` and `Duration` are strings. Safe 64-bit numeric inputs are accepted; unsafe numeric inputs are rejected before JSON parsing can round them. The existing `invokeUnary` object API remains available for callers that use protobuf field names and message objects.

Set `rpc.showDefaultValues: true` on the connection to include implicit-presence defaults in `invokeUnaryProtoJson` responses (for example `0`, `false`, empty strings, arrays, and maps). It defaults to `false`. This affects only the response JSON; an emitted default does not mean the field was sent or stored. Absent message, `optional`, and `oneof` fields stay absent.

For TLS and token authentication, set `ssl: { use: true }` and `rpc.authentication: { type: 'bearer', token }`. Supply `rpc.caFilePath` when the server certificate uses a custom CA. The fixture is started with `docker compose -f docker/unit-test.yml up -d --build rpc-test`; then run `npm run test:driver:rpc`.

For extensions using local-proto mode, pass an absolute `rpc.protoFilePath` from the target project's filesystem path. Relative `protoFilePath` and `includeDirs` values are resolved against the Node process's current working directory, which may differ from the target project directory.

## Project Structure

This package exposes one driver per database/service behind a shared interface. High-level layout:

```
src/
├── index.ts      # public entry point (re-exports everything below)
├── drivers/      # one <Engine>Driver.ts per DB/service
│   │             #   BaseDriver → BaseSQLSupportDriver → RDSBaseDriver
│   │             #   (MySQL/Postgres/SQLite/SQLServer/Oracle extend RDSBaseDriver;
│   │             #    Auth0/Keycloak/Memcache/Mqtt/Redis/Aws/RPC extend BaseDriver directly)
│   ├── aws/        # AWS service clients (S3/SQS/SES/Dynamo/CloudWatch) used by AwsDriver
│   └── memcache/    # helper used internally by MemcacheDriver
├── resource/     # DB metadata model: DbDatabase/DbSchema/DbTable/DbColumn hierarchy
├── helpers/      # SQL parsing/formatting (SQLHelper), rule engine, autocomplete proposals
│   └── prompts/    # per-dbType "schema definitions for LLM prompt" builders
├── types/        # types/interfaces/enums only, mirrors drivers/resource/helpers/utils
├── utils/        # standalone utilities + the SQL/application log-parsing pipeline (utils/log/)
│   ├── cfn/        # CloudFormation diagram generation (Mermaid + draw.io)
│   ├── er/         # ER diagram generation (Mermaid + draw.io)
│   ├── diagramLayout/ # shared ELK-backed automatic-layout engine used by cfn/ and er/'s
│   │               #   `...Async` draw.io generators
│   └── drawio/     # shared generic draw.io XML building blocks used by cfn/ and er/
└── examples/     # per-driver usage scripts (gitignored, not published to npm)
```

Every directory has its own `index.ts` that re-exports its contents (`export * from './X'`), so `src/index.ts` is the single public API surface shipped to consumers (`built/src/index.js`).

`__tests__/` loosely mirrors this layout (`db/drivers/`, `helpers/`, `helpers/prompts/`, `resource/`, `util/`), plus test-only `data/` (fixtures) and `setup/` (docker test-account bootstrap) folders.

Other top-level folders:

- `docker/` — Docker Compose config for local test databases and the gRPC fixture server (see "Prepare" above)
- `schema/` — JSON Schema generated from the `LogParseConfig` type (`npm run build:schema`, via `typescript-json-schema`); consumed by the db-notebook VS Code extension as the JSON Validator schema for `*.log-parser.config.json` files

### Log parser validation and diagnostics

`validateConfig(config, stage?)` returns `ok`, `errorMessage`, and the highest
available stage. An invalid split configuration has no `availableStage`; invalid
classification keeps `split` available; invalid extraction keeps `classify`
available. To check one operation, pass its stage and inspect `ok` instead of
inferring success from the presence of an available stage.

`LogParser.parse()` returns `diagnostics` alongside the existing events and SQL
results. `LogParseDiagnostics` is exported from the package root:

```ts
const result = new LogParser(config).parse({
  logText,
  stage: 'split',
  linesToParse: 100,
});
const diagnostics = result.diagnostics;
// Example: { unmatchedEventCount: 3, unmatchedEventStartLines: [2, 7, 15] }
```

- `unmatchedEventCount` counts non-whitespace split blocks that did not match the
  field extraction pattern, before classification and message expansion. It is
  not a count of physical lines, unclassified events, or missing SQL statements.
- `unmatchedEventStartLines` contains original 1-based start lines for the first
  20 such blocks. The total count remains accurate when there are more than 20.
  A nonmatching preamble before the first start marker starts at line 1. If no
  start marker matches, the input is one block, not one event per line.
- Only the requested input range is inspected. Whitespace-only unmatched blocks
  are ignored. No raw log text is duplicated in diagnostics.
- Successful events/SQL and `ok` keep their existing meaning: unmatched blocks
  are warnings, not a fatal parse error. No unmatched blocks does not prove that
  the chosen split boundaries or extracted fields are semantically correct.
- The property is optional in `ExtractedSqlResult` for older stored results;
  missing diagnostics means unavailable, not zero unmatched events. The current
  parser includes diagnostics in every returned result. On `ok: false`, counts
  may cover only the portion processed before failure. Configuration validation
  or pattern construction can still throw before a result is returned.

### Diagram generation

Beyond the database drivers above, this package also generates two kinds of diagram (Mermaid and
editable draw.io) from data it already models: CloudFormation architecture/dependency diagrams
from a parsed template, and entity-relationship diagrams from `DbTable`/`DbColumn`/`DbSchema`
metadata. Both draw.io generator families come in a synchronous (fixed-layout) function and an
`Async` (ELK automatic-layout) counterpart with the identical parameter shape - the sync functions
are unaffected and remain the default for any existing caller.

```ts
import {
  generateDiagram,                                // Mermaid, any of the three CFN modes
  generateDrawioApplicationDiagramAsync,           // CFN, ELK automatic layout
  createERDiagramParams, createErDiagram,          // ER, Mermaid
  createDrawioErDiagramAsync,                      // ER, ELK automatic layout
} from '@l-v-yonsama/multi-platform-database-drivers';
```

When ELK layout does not finish within its internal timeout, the `Async` functions fall back to a
simpler grid placement automatically; every node/edge is still included either way.

### Third-party dependencies and licenses

This package itself is MIT-licensed. The automatic-layout diagram generation (`...Async` draw.io
functions, see "Diagram generation" above) additionally depends on:

- [`elkjs`](https://www.npmjs.com/package/elkjs) — `EPL-2.0 OR GPL-3.0-or-later`
- [`web-worker`](https://www.npmjs.com/package/web-worker) — optional; used so ELK layout runs on
  a real `worker_threads` Worker in Node instead of blocking the caller's event loop

Neither is bundled into this package's own published npm tarball (`package.json`'s `files` field
lists only `built/src`/`built/schema`); a consumer installing
`@l-v-yonsama/multi-platform-database-drivers` receives both as ordinary transitive
`dependencies`, each carrying its own license file. This is not legal advice.

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
