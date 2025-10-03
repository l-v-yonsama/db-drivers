[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RDSBaseDriver

# Class: RDSBaseDriver

## Hierarchy

- [`BaseSQLSupportDriver`](BaseSQLSupportDriver.md)\<[`RdsDatabase`](RdsDatabase.md)\>

  ↳ **`RDSBaseDriver`**

  ↳↳ [`MySQLDriver`](MySQLDriver.md)

  ↳↳ [`PostgresDriver`](PostgresDriver.md)

  ↳↳ [`SQLiteDriver`](SQLiteDriver.md)

  ↳↳ [`SQLServerDriver`](SQLServerDriver.md)

## Table of contents

### Constructors

- [constructor](RDSBaseDriver.md#constructor)

### Properties

- [conRes](RDSBaseDriver.md#conres)
- [isConnected](RDSBaseDriver.md#isconnected)
- [sshLocalPort](RDSBaseDriver.md#sshlocalport)
- [sshServer](RDSBaseDriver.md#sshserver)

### Methods

- [begin](RDSBaseDriver.md#begin)
- [closeSub](RDSBaseDriver.md#closesub)
- [commit](RDSBaseDriver.md#commit)
- [connect](RDSBaseDriver.md#connect)
- [connectSub](RDSBaseDriver.md#connectsub)
- [connectWithTest](RDSBaseDriver.md#connectwithtest)
- [count](RDSBaseDriver.md#count)
- [countSql](RDSBaseDriver.md#countsql)
- [createDBError](RDSBaseDriver.md#createdberror)
- [disconnect](RDSBaseDriver.md#disconnect)
- [explainAnalyzeSql](RDSBaseDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](RDSBaseDriver.md#explainanalyzesqlsub)
- [explainSql](RDSBaseDriver.md#explainsql)
- [explainSqlSub](RDSBaseDriver.md#explainsqlsub)
- [filterSchemas](RDSBaseDriver.md#filterschemas)
- [filterTables](RDSBaseDriver.md#filtertables)
- [flow](RDSBaseDriver.md#flow)
- [flowTransaction](RDSBaseDriver.md#flowtransaction)
- [getConnectionRes](RDSBaseDriver.md#getconnectionres)
- [getDbDatabases](RDSBaseDriver.md#getdbdatabases)
- [getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)
- [getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)
- [getLocks](RDSBaseDriver.md#getlocks)
- [getMajorVersion](RDSBaseDriver.md#getmajorversion)
- [getName](RDSBaseDriver.md#getname)
- [getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)
- [getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)
- [getSessions](RDSBaseDriver.md#getsessions)
- [getSqlLang](RDSBaseDriver.md#getsqllang)
- [getTableDDL](RDSBaseDriver.md#gettableddl)
- [getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)
- [getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)
- [getVersion](RDSBaseDriver.md#getversion)
- [initBaseStatus](RDSBaseDriver.md#initbasestatus)
- [isLimitAsTop](RDSBaseDriver.md#islimitastop)
- [isNeedsSsh](RDSBaseDriver.md#isneedsssh)
- [isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)
- [isQuery](RDSBaseDriver.md#isquery)
- [isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)
- [kill](RDSBaseDriver.md#kill)
- [parseSchemaAndTableHints](RDSBaseDriver.md#parseschemaandtablehints)
- [requestSql](RDSBaseDriver.md#requestsql)
- [requestSqlSub](RDSBaseDriver.md#requestsqlsub)
- [resetDefaultSchema](RDSBaseDriver.md#resetdefaultschema)
- [rollback](RDSBaseDriver.md#rollback)
- [setAutoCommit](RDSBaseDriver.md#setautocommit)
- [supportsShowCreate](RDSBaseDriver.md#supportsshowcreate)
- [test](RDSBaseDriver.md#test)
- [useDatabase](RDSBaseDriver.md#usedatabase)

## Constructors

### constructor

• **new RDSBaseDriver**(`conRes`): [`RDSBaseDriver`](RDSBaseDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`RDSBaseDriver`](RDSBaseDriver.md)

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[constructor](BaseSQLSupportDriver.md#constructor)

#### Defined in

[src/drivers/RDSBaseDriver.ts:27](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L27)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[conRes](BaseSQLSupportDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isConnected](BaseSQLSupportDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[sshLocalPort](BaseSQLSupportDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[sshServer](BaseSQLSupportDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L49)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:291](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L291)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[closeSub](BaseSQLSupportDriver.md#closesub)

#### Defined in

[src/drivers/BaseDriver.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L206)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:292](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L292)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[connect](BaseSQLSupportDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(`autoCommit?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `autoCommit` | `boolean` | `true` |

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[connectSub](BaseSQLSupportDriver.md#connectsub)

#### Defined in

[src/drivers/RDSBaseDriver.ts:303](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L303)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:295](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L295)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[count](BaseSQLSupportDriver.md#count)

#### Defined in

[src/drivers/RDSBaseDriver.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L55)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[countSql](BaseSQLSupportDriver.md#countsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L118)

___

### createDBError

▸ **createDBError**(`message`, `sourceError`): [`DBError`](DBError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `sourceError` | `any` |

#### Returns

[`DBError`](DBError.md)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[createDBError](BaseSQLSupportDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[disconnect](BaseSQLSupportDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L181)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[explainAnalyzeSql](BaseSQLSupportDriver.md#explainanalyzesql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L169)

___

### explainAnalyzeSqlSub

▸ **explainAnalyzeSqlSub**(`params`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & \{ `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L196)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[explainSql](BaseSQLSupportDriver.md#explainsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L133)

___

### explainSqlSub

▸ **explainSqlSub**(`params`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & \{ `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L162)

___

### filterSchemas

▸ **filterSchemas**(`schemas`): [`DbSchema`](DbSchema.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemas` | [`DbSchema`](DbSchema.md)[] |

#### Returns

[`DbSchema`](DbSchema.md)[]

#### Defined in

[src/drivers/RDSBaseDriver.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L229)

___

### filterTables

▸ **filterTables**(`tables`): [`DbTable`](DbTable.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `tables` | [`DbTable`](DbTable.md)[] |

#### Returns

[`DbTable`](DbTable.md)[]

#### Defined in

[src/drivers/RDSBaseDriver.ts:239](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L239)

___

### flow

▸ **flow**\<`T`\>(`f`): `Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: `this`) => `Promise`\<`T`\> |

#### Returns

`Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[flow](BaseSQLSupportDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L98)

___

### flowTransaction

▸ **flowTransaction**\<`T`\>(`f`, `options?`): `Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: `this`) => `Promise`\<`T`\> |
| `options?` | `Object` |
| `options.transactionControlType` | [`TransactionControlType`](../modules.md#transactioncontroltype) |

#### Returns

`Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:316](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L316)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getConnectionRes](BaseSQLSupportDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getDbDatabases](BaseSQLSupportDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getFirstDbDatabase](BaseSQLSupportDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getInfomationSchemas](BaseSQLSupportDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getInfomationSchemasSub](BaseSQLSupportDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/BaseDriver.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L220)

___

### getLocks

▸ **getLocks**(`dbName`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbName` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L166)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:298](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L298)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getName](BaseSQLSupportDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getPositionalCharacter](BaseSQLSupportDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseSQLSupportDriver.ts#L15)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Defined in

[src/drivers/RDSBaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L71)

___

### getSessions

▸ **getSessions**(`dbName`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbName` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L167)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getSqlLang](BaseSQLSupportDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L33)

___

### getTableDDL

▸ **getTableDDL**(`«destructured»`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `schemaName?` | `string` |
| › `tableName` | `string` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:281](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L281)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/RDSBaseDriver.ts:31](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L31)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:297](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L297)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:296](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L296)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[initBaseStatus](BaseSQLSupportDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isLimitAsTop](BaseSQLSupportDriver.md#islimitastop)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:19](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseSQLSupportDriver.ts#L19)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isNeedsSsh](BaseSQLSupportDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isPositionedParameterAvailable](BaseSQLSupportDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseSQLSupportDriver.ts#L13)

___

### isQuery

▸ **isQuery**(`sql`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isQuery](BaseSQLSupportDriver.md#isquery)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isSchemaSpecificationSvailable](BaseSQLSupportDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L67)

___

### kill

▸ **kill**(`sesssionOrPid?`): `Promise`\<`string`\>

Terminate (kill) a specific session.
If sesssionOrPid is not specified, cancel the running request.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sesssionOrPid?` | `number` |

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[kill](BaseSQLSupportDriver.md#kill)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseSQLSupportDriver.ts#L38)

___

### parseSchemaAndTableHints

▸ **parseSchemaAndTableHints**(`sql`): [`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

[`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[parseSchemaAndTableHints](BaseSQLSupportDriver.md#parseschemaandtablehints)

#### Defined in

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L82)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[requestSql](BaseSQLSupportDriver.md#requestsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L79)

___

### requestSqlSub

▸ **requestSqlSub**(`params`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & \{ `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L129)

___

### resetDefaultSchema

▸ **resetDefaultSchema**(`database`, `hint?`): `void`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `database` | [`RdsDatabase`](RdsDatabase.md) | `undefined` |
| `hint` | `string` | `''` |

#### Returns

`void`

#### Defined in

[src/drivers/RDSBaseDriver.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L249)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:293](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L293)

___

### setAutoCommit

▸ **setAutoCommit**(`value`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:294](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L294)

___

### supportsShowCreate

▸ **supportsShowCreate**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/RDSBaseDriver.ts:277](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L277)

___

### test

▸ **test**(`with_connect?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[test](BaseSQLSupportDriver.md#test)

#### Defined in

[src/drivers/RDSBaseDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L37)

___

### useDatabase

▸ **useDatabase**(`database`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `database` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:65](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/RDSBaseDriver.ts#L65)
