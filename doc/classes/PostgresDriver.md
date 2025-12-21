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
- [filterSchemas](PostgresDriver.md#filterschemas)
- [filterTables](PostgresDriver.md#filtertables)
- [flow](PostgresDriver.md#flow)
- [flowTransaction](PostgresDriver.md#flowtransaction)
- [getConnectionRes](PostgresDriver.md#getconnectionres)
- [getDbDatabases](PostgresDriver.md#getdbdatabases)
- [getFirstDbDatabase](PostgresDriver.md#getfirstdbdatabase)
- [getIdQuoteCharacter](PostgresDriver.md#getidquotecharacter)
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
- [getTableDDL](PostgresDriver.md#gettableddl)
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
- [quoteIdentifier](PostgresDriver.md#quoteidentifier)
- [requestSql](PostgresDriver.md#requestsql)
- [requestSqlSub](PostgresDriver.md#requestsqlsub)
- [resetDefaultSchema](PostgresDriver.md#resetdefaultschema)
- [rollback](PostgresDriver.md#rollback)
- [setAutoCommit](PostgresDriver.md#setautocommit)
- [setColumns](PostgresDriver.md#setcolumns)
- [setForinKeys](PostgresDriver.md#setforinkeys)
- [setUniqueKeys](PostgresDriver.md#setuniquekeys)
- [supportsShowCreate](PostgresDriver.md#supportsshowcreate)
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

[src/drivers/PostgresDriver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L29)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L52)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L51)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L54)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L53)

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

[src/drivers/PostgresDriver.ts:362](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L362)

___

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/PostgresDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L33)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/PostgresDriver.ts:658](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L658)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/PostgresDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L44)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L160)

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

[src/drivers/RDSBaseDriver.ts:315](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L315)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/PostgresDriver.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L139)

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

[src/drivers/RDSBaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L60)

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

[src/drivers/RDSBaseDriver.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L124)

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

[src/drivers/BaseDriver.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L236)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L185)

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

[src/drivers/RDSBaseDriver.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L175)

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

[src/drivers/PostgresDriver.ts:272](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L272)

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

[src/drivers/RDSBaseDriver.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L139)

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

[src/drivers/PostgresDriver.ts:261](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L261)

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

[src/drivers/PostgresDriver.ts:97](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L97)

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

[src/drivers/RDSBaseDriver.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L235)

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

[src/drivers/RDSBaseDriver.ts:245](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L245)

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

[src/drivers/BaseDriver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L102)

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

[src/drivers/RDSBaseDriver.ts:328](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L328)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L64)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabases](RDSBaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L226)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L230)

___

### getIdQuoteCharacter

▸ **getIdQuoteCharacter**(): [`QuoteChar`](../modules.md#quotechar)

#### Returns

[`QuoteChar`](../modules.md#quotechar)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getIdQuoteCharacter](RDSBaseDriver.md#getidquotecharacter)

#### Defined in

[src/drivers/PostgresDriver.ts:654](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L654)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L211)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/PostgresDriver.ts:336](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L336)

___

### getLockWaitTimeout

▸ **getLockWaitTimeout**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/PostgresDriver.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L58)

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

[src/drivers/PostgresDriver.ts:294](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L294)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:310](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L310)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L61)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/PostgresDriver.ts:646](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L646)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:77](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L77)

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

[src/drivers/PostgresDriver.ts:379](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L379)

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

[src/drivers/PostgresDriver.ts:317](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L317)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getSqlLang](RDSBaseDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L38)

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

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getTableDDL](RDSBaseDriver.md#gettableddl)

#### Defined in

[src/drivers/RDSBaseDriver.ts:293](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L293)

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

[src/drivers/PostgresDriver.ts:393](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L393)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/PostgresDriver.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L196)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/PostgresDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L79)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/PostgresDriver.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L288)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L68)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/PostgresDriver.ts:650](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L650)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L72)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/PostgresDriver.ts:642](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L642)

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

[src/drivers/BaseDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L75)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L73)

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

[src/drivers/PostgresDriver.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L173)

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

[src/drivers/BaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L86)

___

### quoteIdentifier

▸ **quoteIdentifier**(`identifier`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifier` | `string` |

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[quoteIdentifier](RDSBaseDriver.md#quoteidentifier)

#### Defined in

[src/drivers/RDSBaseDriver.ts:287](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L287)

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

[src/drivers/RDSBaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L85)

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

[src/drivers/PostgresDriver.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L201)

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

[src/drivers/RDSBaseDriver.ts:255](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L255)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/PostgresDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L48)

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

[src/drivers/PostgresDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L52)

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

[src/drivers/PostgresDriver.ts:421](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L421)

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

[src/drivers/PostgresDriver.ts:571](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L571)

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

[src/drivers/PostgresDriver.ts:509](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L509)

___

### supportsShowCreate

▸ **supportsShowCreate**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[supportsShowCreate](RDSBaseDriver.md#supportsshowcreate)

#### Defined in

[src/drivers/RDSBaseDriver.ts:283](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L283)

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

[src/drivers/RDSBaseDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/RDSBaseDriver.ts#L42)

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

[src/drivers/PostgresDriver.ts:135](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/PostgresDriver.ts#L135)
