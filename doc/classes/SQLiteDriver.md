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
- [getMajorVersion](SQLiteDriver.md#getmajorversion)
- [getName](SQLiteDriver.md#getname)
- [getPositionalCharacter](SQLiteDriver.md#getpositionalcharacter)
- [getRdsDatabase](SQLiteDriver.md#getrdsdatabase)
- [getSessions](SQLiteDriver.md#getsessions)
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

[src/drivers/SQLiteDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L37)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L43)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L45)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/SQLiteDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L41)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/SQLiteDriver.ts:432](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L432)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/SQLiteDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L45)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L152)

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

[src/drivers/RDSBaseDriver.ts:268](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L268)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/SQLiteDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L56)

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

[src/drivers/RDSBaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L52)

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

[src/drivers/RDSBaseDriver.ts:106](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L106)

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

[src/drivers/BaseDriver.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L224)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L177)

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

[src/drivers/RDSBaseDriver.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L141)

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

[src/drivers/SQLiteDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L28)

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

[src/drivers/RDSBaseDriver.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L119)

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

[src/drivers/SQLiteDriver.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L183)

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

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L94)

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

[src/drivers/RDSBaseDriver.ts:281](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L281)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L56)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabase](RDSBaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L218)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L203)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/SQLiteDriver.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L223)

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

[src/drivers/SQLiteDriver.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L210)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L263)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L53)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/SQLiteDriver.ts:420](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L420)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L72)

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

[src/drivers/SQLiteDriver.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L215)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/SQLiteDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L78)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/SQLiteDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L219)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/SQLiteDriver.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L203)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L60)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/SQLiteDriver.ts:424](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L424)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L64)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:416](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L416)

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

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L67)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:428](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L428)

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

[src/drivers/SQLiteDriver.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L73)

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

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/BaseDriver.ts#L78)

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

[src/drivers/RDSBaseDriver.ts:80](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L80)

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

[src/drivers/SQLiteDriver.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L95)

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

[src/drivers/RDSBaseDriver.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L228)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/SQLiteDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L49)

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

[src/drivers/SQLiteDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/SQLiteDriver.ts#L54)

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

[src/drivers/RDSBaseDriver.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L189)

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

[src/drivers/RDSBaseDriver.ts:34](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/drivers/RDSBaseDriver.ts#L34)
