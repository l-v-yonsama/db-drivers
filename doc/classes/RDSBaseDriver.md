[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RDSBaseDriver

# Class: RDSBaseDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)<[`RdsDatabase`](RdsDatabase.md)\>

  ↳ **`RDSBaseDriver`**

  ↳↳ [`MySQLDriver`](MySQLDriver.md)

  ↳↳ [`PostgresDriver`](PostgresDriver.md)

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
- [connectToSshServer](RDSBaseDriver.md#connecttosshserver)
- [connectWithTest](RDSBaseDriver.md#connectwithtest)
- [count](RDSBaseDriver.md#count)
- [countSql](RDSBaseDriver.md#countsql)
- [countTables](RDSBaseDriver.md#counttables)
- [createColumnResolver](RDSBaseDriver.md#createcolumnresolver)
- [createDBError](RDSBaseDriver.md#createdberror)
- [disconnect](RDSBaseDriver.md#disconnect)
- [explainAnalyzeSql](RDSBaseDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](RDSBaseDriver.md#explainanalyzesqlsub)
- [explainSql](RDSBaseDriver.md#explainsql)
- [explainSqlSub](RDSBaseDriver.md#explainsqlsub)
- [flow](RDSBaseDriver.md#flow)
- [flowTransaction](RDSBaseDriver.md#flowtransaction)
- [getConnectionRes](RDSBaseDriver.md#getconnectionres)
- [getDbDatabase](RDSBaseDriver.md#getdbdatabase)
- [getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)
- [getName](RDSBaseDriver.md#getname)
- [getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)
- [getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)
- [initBaseStatus](RDSBaseDriver.md#initbasestatus)
- [isNeedsSsh](RDSBaseDriver.md#isneedsssh)
- [isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)
- [isQuery](RDSBaseDriver.md#isquery)
- [kill](RDSBaseDriver.md#kill)
- [parseSchemaAndTableHints](RDSBaseDriver.md#parseschemaandtablehints)
- [requestSql](RDSBaseDriver.md#requestsql)
- [requestSqlSub](RDSBaseDriver.md#requestsqlsub)
- [resetDefaultSchema](RDSBaseDriver.md#resetdefaultschema)
- [rollback](RDSBaseDriver.md#rollback)
- [setAutoCommit](RDSBaseDriver.md#setautocommit)
- [setRdhMetaAndStatement](RDSBaseDriver.md#setrdhmetaandstatement)
- [test](RDSBaseDriver.md#test)

## Constructors

### constructor

• **new RDSBaseDriver**(`conRes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[drivers/RDSBaseDriver.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L24)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L52)

## Methods

### begin

▸ `Abstract` **begin**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[drivers/RDSBaseDriver.ts:231](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L231)

___

### closeSub

▸ `Abstract` **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L211)

___

### commit

▸ `Abstract` **commit**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[drivers/RDSBaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L232)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[drivers/BaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L167)

___

### connectSub

▸ **connectSub**(`autoCommit?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `autoCommit` | `boolean` | `true` |

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[drivers/RDSBaseDriver.ts:237](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L237)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connectToSshServer](BaseDriver.md#connecttosshserver)

#### Defined in

[drivers/BaseDriver.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L141)

___

### connectWithTest

▸ `Abstract` **connectWithTest**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[drivers/RDSBaseDriver.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L235)

___

### count

▸ `Abstract` **count**(`params`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`<`number`\>

#### Defined in

[drivers/RDSBaseDriver.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L55)

___

### countSql

▸ **countSql**(`params`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<`number`\>

#### Defined in

[drivers/RDSBaseDriver.ts:81](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L81)

___

### countTables

▸ `Abstract` **countTables**(`tables`, `options`): `Promise`<[`TableRows`](../interfaces/TableRows.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tables` | [`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md) |
| `options` | `any` |

#### Returns

`Promise`<[`TableRows`](../interfaces/TableRows.md)[]\>

#### Defined in

[drivers/RDSBaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L50)

___

### createColumnResolver

▸ **createColumnResolver**(`sql?`): [`ColumnResolver`](../interfaces/ColumnResolver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql?` | `string` |

#### Returns

[`ColumnResolver`](../interfaces/ColumnResolver.md)

#### Inherited from

[BaseDriver](BaseDriver.md).[createColumnResolver](BaseDriver.md#createcolumnresolver)

#### Defined in

[drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L85)

___

### createDBError

▸ **createDBError**(`message`, `sourceError`): `DBError`

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `sourceError` | `any` |

#### Returns

`DBError`

#### Inherited from

[BaseDriver](BaseDriver.md).[createDBError](BaseDriver.md#createdberror)

#### Defined in

[drivers/BaseDriver.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L233)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[drivers/BaseDriver.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L186)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Defined in

[drivers/RDSBaseDriver.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L113)

___

### explainAnalyzeSqlSub

▸ `Abstract` **explainAnalyzeSqlSub**(`params`): `Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & { `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Defined in

[drivers/RDSBaseDriver.ts:128](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L128)

___

### explainSql

▸ **explainSql**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Defined in

[drivers/RDSBaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L94)

___

### explainSqlSub

▸ `Abstract` **explainSqlSub**(`params`): `Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & { `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Defined in

[drivers/RDSBaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L109)

___

### flow

▸ **flow**<`T`\>(`f`): `Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: [`RDSBaseDriver`](RDSBaseDriver.md)) => `Promise`<`T`\> |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Inherited from

[BaseDriver](BaseDriver.md).[flow](BaseDriver.md#flow)

#### Defined in

[drivers/BaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L109)

___

### flowTransaction

▸ **flowTransaction**<`T`\>(`f`, `options?`): `Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: [`RDSBaseDriver`](RDSBaseDriver.md)) => `Promise`<`T`\> |
| `options?` | `Object` |
| `options.transactionControlType` | [`TransactionControlType`](../modules.md#transactioncontroltype) |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Defined in

[drivers/RDSBaseDriver.ts:250](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L250)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabase](BaseDriver.md#getdbdatabase)

#### Defined in

[drivers/BaseDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L227)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemasSub

▸ `Abstract` **getInfomationSchemasSub**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[drivers/BaseDriver.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L225)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L60)

___

### getRdsDatabase

▸ `Protected` **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Defined in

[drivers/RDSBaseDriver.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L59)

___

### getTestSqlStatement

▸ `Protected` `Abstract` **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Defined in

[drivers/RDSBaseDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L28)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L71)

___

### isPositionedParameterAvailable

▸ `Abstract` **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[drivers/RDSBaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L57)

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

[BaseDriver](BaseDriver.md).[isQuery](BaseDriver.md#isquery)

#### Defined in

[drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L74)

___

### kill

▸ `Abstract` **kill**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[drivers/RDSBaseDriver.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L30)

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

[BaseDriver](BaseDriver.md).[parseSchemaAndTableHints](BaseDriver.md#parseschemaandtablehints)

#### Defined in

[drivers/BaseDriver.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/BaseDriver.ts#L93)

___

### requestSql

▸ **requestSql**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Defined in

[drivers/RDSBaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L67)

___

### requestSqlSub

▸ `Abstract` **requestSqlSub**(`params`): `Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & { `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Defined in

[drivers/RDSBaseDriver.ts:90](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L90)

___

### resetDefaultSchema

▸ **resetDefaultSchema**(`database`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `database` | [`RdsDatabase`](RdsDatabase.md) |

#### Returns

`void`

#### Defined in

[drivers/RDSBaseDriver.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L206)

___

### rollback

▸ `Abstract` **rollback**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[drivers/RDSBaseDriver.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L233)

___

### setAutoCommit

▸ `Abstract` **setAutoCommit**(`value`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Defined in

[drivers/RDSBaseDriver.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L234)

___

### setRdhMetaAndStatement

▸ **setRdhMetaAndStatement**(`params`, `rdb`, `type`, `qst`, `dbTable?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |
| `rdb` | [`ResultSetDataBuilder`](ResultSetDataBuilder.md) |
| `type` | ``"set"`` \| ``"comment"`` \| ``"values"`` \| ``"select"`` \| ``"union"`` \| ``"union all"`` \| ``"with"`` \| ``"with recursive"`` \| ``"create table"`` \| ``"create sequence"`` \| ``"create index"`` \| ``"create extension"`` \| ``"commit"`` \| ``"insert"`` \| ``"update"`` \| ``"show"`` \| ``"prepare"`` \| ``"deallocate"`` \| ``"delete"`` \| ``"rollback"`` \| ``"tablespace"`` \| ``"create view"`` \| ``"create materialized view"`` \| ``"refresh materialized view"`` \| ``"alter table"`` \| ``"alter index"`` \| ``"alter sequence"`` \| ``"set timezone"`` \| ``"create enum"`` \| ``"create composite type"`` \| ``"truncate table"`` \| ``"drop table"`` \| ``"drop sequence"`` \| ``"drop index"`` \| ``"drop type"`` \| ``"drop trigger"`` \| ``"create schema"`` \| ``"raise"`` \| ``"create function"`` \| ``"drop function"`` \| ``"do"`` \| ``"begin"`` \| ``"start transaction"`` |
| `qst` | [`QStatement`](../modules.md#qstatement) |
| `dbTable?` | [`DbTable`](DbTable.md) |

#### Returns

`void`

#### Defined in

[drivers/RDSBaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L167)

___

### test

▸ **test**(`with_connect?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[test](BaseDriver.md#test)

#### Defined in

[drivers/RDSBaseDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/RDSBaseDriver.ts#L32)
