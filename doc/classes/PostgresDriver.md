[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / PostgresDriver

# Class: PostgresDriver

## Hierarchy

- [`RDSBaseDriver`](RDSBaseDriver.md)

  ↳ **`PostgresDriver`**

## Table of contents

### Constructors

- [constructor](PostgresDriver.md#constructor)

### Properties

- [conRes](PostgresDriver.md#conres)
- [isConnected](PostgresDriver.md#isconnected)
- [sshLocalPort](PostgresDriver.md#sshlocalport)
- [sshServer](PostgresDriver.md#sshserver)

### Methods

- [asyncGetDatabases](PostgresDriver.md#asyncgetdatabases)
- [begin](PostgresDriver.md#begin)
- [closeSub](PostgresDriver.md#closesub)
- [commit](PostgresDriver.md#commit)
- [connect](PostgresDriver.md#connect)
- [connectSub](PostgresDriver.md#connectsub)
- [connectWithTest](PostgresDriver.md#connectwithtest)
- [count](PostgresDriver.md#count)
- [countSql](PostgresDriver.md#countsql)
- [createDBError](PostgresDriver.md#createdberror)
- [disconnect](PostgresDriver.md#disconnect)
- [explainAnalyzeSql](PostgresDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](PostgresDriver.md#explainanalyzesqlsub)
- [explainSql](PostgresDriver.md#explainsql)
- [explainSqlSub](PostgresDriver.md#explainsqlsub)
- [fieldInfo2Key](PostgresDriver.md#fieldinfo2key)
- [flow](PostgresDriver.md#flow)
- [flowTransaction](PostgresDriver.md#flowtransaction)
- [getConnectionRes](PostgresDriver.md#getconnectionres)
- [getDbDatabases](PostgresDriver.md#getdbdatabases)
- [getFirstDbDatabase](PostgresDriver.md#getfirstdbdatabase)
- [getInfomationSchemas](PostgresDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](PostgresDriver.md#getinfomationschemassub)
- [getLockWaitTimeout](PostgresDriver.md#getlockwaittimeout)
- [getLocks](PostgresDriver.md#getlocks)
- [getMajorVersion](PostgresDriver.md#getmajorversion)
- [getName](PostgresDriver.md#getname)
- [getPositionalCharacter](PostgresDriver.md#getpositionalcharacter)
- [getRdsDatabase](PostgresDriver.md#getrdsdatabase)
- [getSchemas](PostgresDriver.md#getschemas)
- [getSessions](PostgresDriver.md#getsessions)
- [getSqlLang](PostgresDriver.md#getsqllang)
- [getTables](PostgresDriver.md#gettables)
- [getTestSqlStatement](PostgresDriver.md#gettestsqlstatement)
- [getTransactionIsolationLevel](PostgresDriver.md#gettransactionisolationlevel)
- [getVersion](PostgresDriver.md#getversion)
- [initBaseStatus](PostgresDriver.md#initbasestatus)
- [isLimitAsTop](PostgresDriver.md#islimitastop)
- [isNeedsSsh](PostgresDriver.md#isneedsssh)
- [isPositionedParameterAvailable](PostgresDriver.md#ispositionedparameteravailable)
- [isQuery](PostgresDriver.md#isquery)
- [isSchemaSpecificationSvailable](PostgresDriver.md#isschemaspecificationsvailable)
- [kill](PostgresDriver.md#kill)
- [parseSchemaAndTableHints](PostgresDriver.md#parseschemaandtablehints)
- [requestSql](PostgresDriver.md#requestsql)
- [requestSqlSub](PostgresDriver.md#requestsqlsub)
- [resetDefaultSchema](PostgresDriver.md#resetdefaultschema)
- [rollback](PostgresDriver.md#rollback)
- [setAutoCommit](PostgresDriver.md#setautocommit)
- [setColumns](PostgresDriver.md#setcolumns)
- [setForinKeys](PostgresDriver.md#setforinkeys)
- [setUniqueKeys](PostgresDriver.md#setuniquekeys)
- [test](PostgresDriver.md#test)
- [useDatabase](PostgresDriver.md#usedatabase)

## Constructors

### constructor

• **new PostgresDriver**(`conRes`): [`PostgresDriver`](PostgresDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`PostgresDriver`](PostgresDriver.md)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[constructor](RDSBaseDriver.md#constructor)

#### Defined in

[src/drivers/PostgresDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L28)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L49)

## Methods

### asyncGetDatabases

▸ **asyncGetDatabases**(`connectionDatabase`): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `connectionDatabase` | `string` |

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Defined in

[src/drivers/PostgresDriver.ts:359](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L359)

___

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/PostgresDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L32)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/PostgresDriver.ts:653](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L653)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/PostgresDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L43)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L156)

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

[src/drivers/RDSBaseDriver.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L263)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/PostgresDriver.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L138)

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

[src/drivers/RDSBaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L50)

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

[src/drivers/RDSBaseDriver.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L112)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L181)

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

[src/drivers/RDSBaseDriver.ts:163](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L163)

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

[src/drivers/PostgresDriver.ts:271](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L271)

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

[src/drivers/RDSBaseDriver.ts:127](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L127)

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

[src/drivers/PostgresDriver.ts:260](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L260)

___

### fieldInfo2Key

▸ **fieldInfo2Key**(`fieldInfo`, `useTableColumnType`, `table?`): `RdhKey`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldInfo` | `FieldDef` |
| `useTableColumnType` | `boolean` |
| `table?` | [`DbTable`](DbTable.md) |

#### Returns

`RdhKey`

#### Defined in

[src/drivers/PostgresDriver.ts:96](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L96)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L98)

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

[src/drivers/RDSBaseDriver.ts:276](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L276)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabases](RDSBaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/PostgresDriver.ts:335](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L335)

___

### getLockWaitTimeout

▸ **getLockWaitTimeout**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/PostgresDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L57)

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

[src/drivers/PostgresDriver.ts:293](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L293)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:258](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L258)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/PostgresDriver.ts:645](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L645)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L66)

___

### getSchemas

▸ **getSchemas**(`dbDatabase`): `Promise`\<[`DbSchema`](DbSchema.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbDatabase` | [`RdsDatabase`](RdsDatabase.md) |

#### Returns

`Promise`\<[`DbSchema`](DbSchema.md)[]\>

#### Defined in

[src/drivers/PostgresDriver.ts:381](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L381)

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

[src/drivers/PostgresDriver.ts:316](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L316)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getSqlLang](RDSBaseDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L28)

___

### getTables

▸ **getTables**(`dbSchema`): `Promise`\<[`DbTable`](DbTable.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`\<[`DbTable`](DbTable.md)[]\>

#### Defined in

[src/drivers/PostgresDriver.ts:395](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L395)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/PostgresDriver.ts:195](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L195)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/PostgresDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L78)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/PostgresDriver.ts:287](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L287)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/PostgresDriver.ts:649](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L649)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/PostgresDriver.ts:641](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L641)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L62)

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

[src/drivers/PostgresDriver.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L172)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/BaseDriver.ts#L82)

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

[src/drivers/RDSBaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L74)

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

[src/drivers/PostgresDriver.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L200)

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

[src/drivers/RDSBaseDriver.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L223)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/PostgresDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L47)

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

[src/drivers/PostgresDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L51)

___

### setColumns

▸ **setColumns**(`dbSchema`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/PostgresDriver.ts:423](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L423)

___

### setForinKeys

▸ **setForinKeys**(`dbSchema`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/PostgresDriver.ts:570](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L570)

___

### setUniqueKeys

▸ **setUniqueKeys**(`dbSchema`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/PostgresDriver.ts:508](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L508)

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

[src/drivers/RDSBaseDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/RDSBaseDriver.ts#L32)

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

[src/drivers/PostgresDriver.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/003f723271cc76da07f7a1a0c13a54a9eab2ac73/src/drivers/PostgresDriver.ts#L134)
