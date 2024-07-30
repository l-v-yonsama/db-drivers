[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RDSBaseDriver

# Class: RDSBaseDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`RdsDatabase`](RdsDatabase.md)\>

  ↳ **`RDSBaseDriver`**

  ↳↳ [`MySQLDriver`](MySQLDriver.md)

  ↳↳ [`PostgresDriver`](PostgresDriver.md)

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
- [flow](RDSBaseDriver.md#flow)
- [flowTransaction](RDSBaseDriver.md#flowtransaction)
- [getConnectionRes](RDSBaseDriver.md#getconnectionres)
- [getDbDatabase](RDSBaseDriver.md#getdbdatabase)
- [getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)
- [getName](RDSBaseDriver.md#getname)
- [getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)
- [getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)
- [getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)
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
- [setRdhMetaAndStatement](RDSBaseDriver.md#setrdhmetaandstatement)
- [test](RDSBaseDriver.md#test)

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

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/RDSBaseDriver.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L20)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L43)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L45)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:247](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L247)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/BaseDriver.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L196)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L248)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L152)

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

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/RDSBaseDriver.ts:253](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L253)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L251)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L46)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L100)

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

[BaseDriver](BaseDriver.md).[createDBError](BaseDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L218)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L171)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:132](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L132)

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

[src/drivers/RDSBaseDriver.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L147)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L113)

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

[src/drivers/RDSBaseDriver.ts:128](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L128)

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

[BaseDriver](BaseDriver.md).[flow](BaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L94)

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

[src/drivers/RDSBaseDriver.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L266)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L56)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabase](BaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L197)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/BaseDriver.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L210)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L53)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/RDSBaseDriver.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L58)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Defined in

[src/drivers/RDSBaseDriver.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L66)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/RDSBaseDriver.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L24)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L60)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/RDSBaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L64)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L64)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/RDSBaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L56)

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

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L67)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/RDSBaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L60)

___

### kill

▸ **kill**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L26)

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

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/BaseDriver.ts#L78)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L74)

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

[src/drivers/RDSBaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L109)

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

[src/drivers/RDSBaseDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L219)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L249)

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

[src/drivers/RDSBaseDriver.ts:250](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L250)

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

#### Defined in

[src/drivers/RDSBaseDriver.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L180)

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

[BaseDriver](BaseDriver.md).[test](BaseDriver.md#test)

#### Defined in

[src/drivers/RDSBaseDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/drivers/RDSBaseDriver.ts#L28)
