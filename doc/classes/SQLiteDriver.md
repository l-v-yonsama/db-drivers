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
- [flow](SQLiteDriver.md#flow)
- [flowTransaction](SQLiteDriver.md#flowtransaction)
- [getConnectionRes](SQLiteDriver.md#getconnectionres)
- [getDbDatabase](SQLiteDriver.md#getdbdatabase)
- [getInfomationSchemas](SQLiteDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](SQLiteDriver.md#getinfomationschemassub)
- [getLocks](SQLiteDriver.md#getlocks)
- [getName](SQLiteDriver.md#getname)
- [getPositionalCharacter](SQLiteDriver.md#getpositionalcharacter)
- [getRdsDatabase](SQLiteDriver.md#getrdsdatabase)
- [getSessions](SQLiteDriver.md#getsessions)
- [getTestSqlStatement](SQLiteDriver.md#gettestsqlstatement)
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
- [setRdhMetaAndStatement](SQLiteDriver.md#setrdhmetaandstatement)
- [test](SQLiteDriver.md#test)

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

[src/drivers/SQLiteDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L33)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L43)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L45)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/SQLiteDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L37)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/SQLiteDriver.ts:418](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L418)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/SQLiteDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L41)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L152)

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

[src/drivers/RDSBaseDriver.ts:261](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L261)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/SQLiteDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L52)

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

[src/drivers/RDSBaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L51)

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

[src/drivers/RDSBaseDriver.ts:105](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L105)

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

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L218)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L171)

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

[src/drivers/RDSBaseDriver.ts:140](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L140)

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

[src/drivers/SQLiteDriver.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L24)

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

[src/drivers/RDSBaseDriver.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L118)

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

[src/drivers/SQLiteDriver.ts:179](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L179)

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

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L94)

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

[src/drivers/RDSBaseDriver.ts:274](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L274)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L56)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabase](RDSBaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L197)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/SQLiteDriver.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L209)

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

[src/drivers/SQLiteDriver.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L200)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L53)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/SQLiteDriver.ts:406](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L406)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L71)

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

[src/drivers/SQLiteDriver.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L205)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/SQLiteDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L74)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L60)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/SQLiteDriver.ts:410](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L410)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L64)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:402](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L402)

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

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L67)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:414](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L414)

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

[src/drivers/SQLiteDriver.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L69)

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

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/BaseDriver.ts#L78)

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

[src/drivers/RDSBaseDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L79)

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

[src/drivers/SQLiteDriver.ts:91](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L91)

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

[src/drivers/RDSBaseDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L227)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/SQLiteDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L45)

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

[src/drivers/SQLiteDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/SQLiteDriver.ts#L50)

___

### setRdhMetaAndStatement

▸ **setRdhMetaAndStatement**(`params`, `rdb`, `type`, `qst`, `dbTable?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |
| `rdb` | `ResultSetDataBuilder` |
| `type` | ``"set"`` \| ``"values"`` \| ``"comment"`` \| ``"delete"`` \| ``"select"`` \| ``"union"`` \| ``"union all"`` \| ``"with"`` \| ``"with recursive"`` \| ``"create table"`` \| ``"create sequence"`` \| ``"create index"`` \| ``"create extension"`` \| ``"commit"`` \| ``"insert"`` \| ``"update"`` \| ``"show"`` \| ``"prepare"`` \| ``"deallocate"`` \| ``"rollback"`` \| ``"tablespace"`` \| ``"create view"`` \| ``"create materialized view"`` \| ``"refresh materialized view"`` \| ``"alter table"`` \| ``"alter index"`` \| ``"alter sequence"`` \| ``"set timezone"`` \| ``"set names"`` \| ``"create enum"`` \| ``"create composite type"`` \| ``"truncate table"`` \| ``"drop table"`` \| ``"drop sequence"`` \| ``"drop index"`` \| ``"drop type"`` \| ``"drop trigger"`` \| ``"create schema"`` \| ``"raise"`` \| ``"create function"`` \| ``"drop function"`` \| ``"do"`` \| ``"begin"`` \| ``"start transaction"`` |
| `qst` | [`QStatement`](../modules.md#qstatement) |
| `dbTable?` | [`DbTable`](DbTable.md) |

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[setRdhMetaAndStatement](RDSBaseDriver.md#setrdhmetaandstatement)

#### Defined in

[src/drivers/RDSBaseDriver.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L188)

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

[src/drivers/RDSBaseDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/300edd8c8f29c00543a75fbb6fdfc616ee48b32d/src/drivers/RDSBaseDriver.ts#L33)
