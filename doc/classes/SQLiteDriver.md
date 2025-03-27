[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / SQLiteDriver

# Class: SQLiteDriver

## Hierarchy

- [`RDSBaseDriver`](RDSBaseDriver.md)

  ↳ **`SQLiteDriver`**

## Table of contents

### Constructors

- [constructor](SQLiteDriver.md#constructor)

### Properties

- [conRes](SQLiteDriver.md#conres)
- [isConnected](SQLiteDriver.md#isconnected)
- [sshLocalPort](SQLiteDriver.md#sshlocalport)
- [sshServer](SQLiteDriver.md#sshserver)

### Methods

- [begin](SQLiteDriver.md#begin)
- [closeSub](SQLiteDriver.md#closesub)
- [commit](SQLiteDriver.md#commit)
- [connect](SQLiteDriver.md#connect)
- [connectSub](SQLiteDriver.md#connectsub)
- [connectWithTest](SQLiteDriver.md#connectwithtest)
- [count](SQLiteDriver.md#count)
- [countSql](SQLiteDriver.md#countsql)
- [createDBError](SQLiteDriver.md#createdberror)
- [disconnect](SQLiteDriver.md#disconnect)
- [explainAnalyzeSql](SQLiteDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](SQLiteDriver.md#explainanalyzesqlsub)
- [explainSql](SQLiteDriver.md#explainsql)
- [explainSqlSub](SQLiteDriver.md#explainsqlsub)
- [filterSchemas](SQLiteDriver.md#filterschemas)
- [filterTables](SQLiteDriver.md#filtertables)
- [flow](SQLiteDriver.md#flow)
- [flowTransaction](SQLiteDriver.md#flowtransaction)
- [getConnectionRes](SQLiteDriver.md#getconnectionres)
- [getDbDatabases](SQLiteDriver.md#getdbdatabases)
- [getFirstDbDatabase](SQLiteDriver.md#getfirstdbdatabase)
- [getInfomationSchemas](SQLiteDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](SQLiteDriver.md#getinfomationschemassub)
- [getLocks](SQLiteDriver.md#getlocks)
- [getMajorVersion](SQLiteDriver.md#getmajorversion)
- [getName](SQLiteDriver.md#getname)
- [getPositionalCharacter](SQLiteDriver.md#getpositionalcharacter)
- [getRdsDatabase](SQLiteDriver.md#getrdsdatabase)
- [getSessions](SQLiteDriver.md#getsessions)
- [getSqlLang](SQLiteDriver.md#getsqllang)
- [getTestSqlStatement](SQLiteDriver.md#gettestsqlstatement)
- [getTransactionIsolationLevel](SQLiteDriver.md#gettransactionisolationlevel)
- [getVersion](SQLiteDriver.md#getversion)
- [initBaseStatus](SQLiteDriver.md#initbasestatus)
- [isLimitAsTop](SQLiteDriver.md#islimitastop)
- [isNeedsSsh](SQLiteDriver.md#isneedsssh)
- [isPositionedParameterAvailable](SQLiteDriver.md#ispositionedparameteravailable)
- [isQuery](SQLiteDriver.md#isquery)
- [isSchemaSpecificationSvailable](SQLiteDriver.md#isschemaspecificationsvailable)
- [kill](SQLiteDriver.md#kill)
- [parseSchemaAndTableHints](SQLiteDriver.md#parseschemaandtablehints)
- [requestSql](SQLiteDriver.md#requestsql)
- [requestSqlSub](SQLiteDriver.md#requestsqlsub)
- [resetDefaultSchema](SQLiteDriver.md#resetdefaultschema)
- [rollback](SQLiteDriver.md#rollback)
- [setAutoCommit](SQLiteDriver.md#setautocommit)
- [test](SQLiteDriver.md#test)
- [useDatabase](SQLiteDriver.md#usedatabase)

## Constructors

### constructor

• **new SQLiteDriver**(`conRes`): [`SQLiteDriver`](SQLiteDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`SQLiteDriver`](SQLiteDriver.md)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[constructor](RDSBaseDriver.md#constructor)

#### Defined in

[src/drivers/SQLiteDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L38)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L49)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/SQLiteDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L42)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/SQLiteDriver.ts:444](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L444)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/SQLiteDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L46)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(`autoCommit?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `autoCommit` | `boolean` | `true` |

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connectSub](RDSBaseDriver.md#connectsub)

#### Defined in

[src/drivers/RDSBaseDriver.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L288)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/SQLiteDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L61)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[count](RDSBaseDriver.md#count)

#### Defined in

[src/drivers/RDSBaseDriver.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L55)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[countSql](RDSBaseDriver.md#countsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L117)

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

[RDSBaseDriver](RDSBaseDriver.md).[createDBError](RDSBaseDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L181)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[explainAnalyzeSql](RDSBaseDriver.md#explainanalyzesql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L168)

___

### explainAnalyzeSqlSub

▸ **explainAnalyzeSqlSub**(`params`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & \{ `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[explainAnalyzeSqlSub](RDSBaseDriver.md#explainanalyzesqlsub)

#### Defined in

[src/drivers/SQLiteDriver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L29)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[explainSql](RDSBaseDriver.md#explainsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:132](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L132)

___

### explainSqlSub

▸ **explainSqlSub**(`params`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & \{ `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[explainSqlSub](RDSBaseDriver.md#explainsqlsub)

#### Defined in

[src/drivers/SQLiteDriver.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L188)

___

### filterSchemas

▸ **filterSchemas**(`schemas`): [`DbSchema`](DbSchema.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemas` | [`DbSchema`](DbSchema.md)[] |

#### Returns

[`DbSchema`](DbSchema.md)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[filterSchemas](RDSBaseDriver.md#filterschemas)

#### Defined in

[src/drivers/RDSBaseDriver.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L228)

___

### filterTables

▸ **filterTables**(`tables`): [`DbTable`](DbTable.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `tables` | [`DbTable`](DbTable.md)[] |

#### Returns

[`DbTable`](DbTable.md)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[filterTables](RDSBaseDriver.md#filtertables)

#### Defined in

[src/drivers/RDSBaseDriver.ts:238](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L238)

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

[RDSBaseDriver](RDSBaseDriver.md).[flow](RDSBaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L98)

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

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[flowTransaction](RDSBaseDriver.md#flowtransaction)

#### Defined in

[src/drivers/RDSBaseDriver.ts:301](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L301)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabases](RDSBaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/SQLiteDriver.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L228)

___

### getLocks

▸ **getLocks**(`dbName`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbName` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getLocks](RDSBaseDriver.md#getlocks)

#### Defined in

[src/drivers/SQLiteDriver.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L215)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:283](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L283)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/SQLiteDriver.ts:432](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L432)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L71)

___

### getSessions

▸ **getSessions**(`dbName`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbName` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getSessions](RDSBaseDriver.md#getsessions)

#### Defined in

[src/drivers/SQLiteDriver.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L220)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getSqlLang](RDSBaseDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L33)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/SQLiteDriver.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L83)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/SQLiteDriver.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L224)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/SQLiteDriver.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L208)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/SQLiteDriver.ts:436](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L436)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:428](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L428)

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

[RDSBaseDriver](RDSBaseDriver.md).[isQuery](RDSBaseDriver.md#isquery)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:440](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L440)

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

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[kill](RDSBaseDriver.md#kill)

#### Defined in

[src/drivers/SQLiteDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L78)

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

[RDSBaseDriver](RDSBaseDriver.md).[parseSchemaAndTableHints](RDSBaseDriver.md#parseschemaandtablehints)

#### Defined in

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/BaseDriver.ts#L82)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[requestSql](RDSBaseDriver.md#requestsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L79)

___

### requestSqlSub

▸ **requestSqlSub**(`params`): `Promise`\<`ResultSetDataBuilder`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & \{ `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`\<`ResultSetDataBuilder`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[requestSqlSub](RDSBaseDriver.md#requestsqlsub)

#### Defined in

[src/drivers/SQLiteDriver.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L100)

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

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[resetDefaultSchema](RDSBaseDriver.md#resetdefaultschema)

#### Defined in

[src/drivers/RDSBaseDriver.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L248)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/SQLiteDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L50)

___

### setAutoCommit

▸ **setAutoCommit**(`value`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[setAutoCommit](RDSBaseDriver.md#setautocommit)

#### Defined in

[src/drivers/SQLiteDriver.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L59)

___

### test

▸ **test**(`with_connect?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[test](RDSBaseDriver.md#test)

#### Defined in

[src/drivers/RDSBaseDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/RDSBaseDriver.ts#L37)

___

### useDatabase

▸ **useDatabase**(`database`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `database` | `string` |

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[useDatabase](RDSBaseDriver.md#usedatabase)

#### Defined in

[src/drivers/SQLiteDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/drivers/SQLiteDriver.ts#L54)
