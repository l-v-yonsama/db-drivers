@l-v-yonsama/multi-platform-database-drivers / [Exports](modules.md)

# Prepare

```sh
cd ./docker

docker-compose -f unit-test.yml build

docker-compose -f unit-test.yml up -d
```

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
