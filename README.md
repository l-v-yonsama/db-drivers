# Prepare

```sh
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
  ConnectionSetting,
  DBAccessService,
  DBType,
  DbDatabase,
  SQLService,
} from "@l-v-yonsama/multi-platform-database-drivers";

const setting: ConnectionSetting = {
  host: "127.0.0.1",
  port: 6001,
  user: "testuser",
  password: "testpass",
  database: "testdb",
  dbType: DBType.MySQL,
  name: "local-mysql",
};

(async () => {
  await DBAccessService.addConnectionSetting({ setting });
  const res = await DBAccessService.connect({
    connectionName: setting.name,
  });

  if (!res.ok) {
    console.error(res.message);
    return;
  }
  const { connectionId } = res.result;
  const resInfo = await DBAccessService.getInfomationSchemas({
    connectionId,
  });
  if (!resInfo.ok) {
    console.error(resInfo.message);
    return;
  }
  if (!resInfo.result) {
    console.error("No database.");
    return;
  }
  const dbRes = resInfo.result[0] as DbDatabase;
  const defaultSchema = dbRes.getSchema({ isDefault: true });

  console.log("------ Information schema ------");
  console.log(defaultSchema.toJsonStringify(2));

  const sql = `SELECT n0,f1,f2,d1,dummy1 FROM testtable WHERE n2=2 AND s2='s2' `;
  const resValidation = SQLService.validate(sql, defaultSchema);
  console.log("------ SQL validation result ------");
  console.log(resValidation);
  await DBAccessService.disconnectAll();
})();
```

```sh
------ Information schema ------
{
    "id":"vQTDHe6X",
    "resouceType":2,
    "name":"testdb",
    "children":[
        {
            "id":"p6nEAlxc",
            "resouceType":3,
            "name":"testtable",
            "children":[
                {"id":"WMLrwKRe","resouceType":4,"name":"ID","children":[],"colType":14,"comment":"","nullable":false,"key":"PRI","default":null,"extra":"auto_increment"},
                {"id":"1TvQOMlg","resouceType":4,"name":"n0","children":[],"colType":0,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"Jx3ensD1","resouceType":4,"name":"n1","children":[],"colType":11,"comment":"MAX 127","nullable":true,"key":"","default":null,"extra":""},
                {"id":"dMpSYRPb","resouceType":4,"name":"n2","children":[],"colType":12,"comment":"MAX 32767","nullable":true,"key":"","default":null,"extra":""},
                {"id":"00NOGCMG","resouceType":4,"name":"n3","children":[],"colType":13,"comment":"MAX 8388607","nullable":true,"key":"","default":null,"extra":""},
                {"id":"faVOIMni","resouceType":4,"name":"n4","children":[],"colType":15,"comment":"MAX 9223372036854775807","nullable":true,"key":"","default":null,"extra":""},
                {"id":"8qyyVS5L","resouceType":4,"name":"f1","children":[],"colType":16,"comment":"","nullable":true,"key":"","default":null,"extra":""},{"id":"b7j1n1wS","resouceType":4,"name":"f2","children":[],"colType":20,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"hQjnzYH6","resouceType":4,"name":"f3","children":[],"colType":22,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"21BOjbB1","resouceType":4,"name":"d1","children":[],"colType":36,"comment":"“Zero” Value 0000-00-00","nullable":true,"key":"","default":null,"extra":""},
                {"id":"YofUrn8X","resouceType":4,"name":"d2","children":[],"colType":34,"comment":"“Zero” Value 00:00:00","nullable":true,"key":"","default":null,"extra":""},
                {"id":"JHmT8ALr","resouceType":4,"name":"d3","children":[],"colType":37,"comment":"“Zero” Value 0000-00-00 00:00:00","nullable":true,"key":"","default":null,"extra":""},
                {"id":"wMqGccPW","resouceType":4,"name":"d4","children":[],"colType":37,"comment":"“Zero” Value 0000-00-00 00:00:00","nullable":true,"key":"","default":null,"extra":""},
                {"id":"qQW5i5Vn","resouceType":4,"name":"d5","children":[],"colType":39,"comment":"“Zero” Value 0000","nullable":true,"key":"","default":null,"extra":""},
                {"id":"TJ0zRqZL","resouceType":4,"name":"s1","children":[],"colType":3,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"ixbuC6Qz","resouceType":4,"name":"s2","children":[],"colType":4,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"Eu6rOC53","resouceType":4,"name":"s3a","children":[],"colType":5,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"uzL3dNQO","resouceType":4,"name":"s3b","children":[],"colType":7,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"8EJDWj7a","resouceType":4,"name":"s3c","children":[],"colType":6,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"1R1HKCT4","resouceType":4,"name":"s3d","children":[],"colType":8,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"bgoRaWrE","resouceType":4,"name":"s4","children":[],"colType":40,"comment":"A list of a,b or c","nullable":true,"key":"","default":null,"extra":""},
                {"id":"ZaOslFEV","resouceType":4,"name":"s5","children":[],"colType":50,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"2XoOWXad","resouceType":4,"name":"s6","children":[],"colType":-1,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"aitMMHvy","resouceType":4,"name":"s7","children":[],"colType":51,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"Lz62H4A3","resouceType":4,"name":"s8","children":[],"colType":41,"comment":"","nullable":true,"key":"","default":null,"extra":""},
                {"id":"XJPve9jl","resouceType":4,"name":"g1","children":[],"colType":-1,"comment":"","nullable":false,"key":"","default":null,"extra":""},
                {"id":"n0hND90M","resouceType":4,"name":"j1","children":[],"colType":25,"comment":"JSON data type","nullable":true,"key":"","default":null,"extra":""}
            ],
            "isInProgress":false,
            "tableType":"TABLE",
            "comment":"table with various data types"
        }
    ],
    "isDefault":true
}
------ SQL validation result ------
{
  ok: false,
  message: '',
  result: [ { type: 'select', table: '', column: 'dummy1' } ]
}
```
