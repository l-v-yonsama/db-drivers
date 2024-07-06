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
- [connectToSshServer](PostgresDriver.md#connecttosshserver)
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
- [getDbDatabase](PostgresDriver.md#getdbdatabase)
- [getInfomationSchemas](PostgresDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](PostgresDriver.md#getinfomationschemassub)
- [getName](PostgresDriver.md#getname)
- [getPositionalCharacter](PostgresDriver.md#getpositionalcharacter)
- [getRdsDatabase](PostgresDriver.md#getrdsdatabase)
- [getSchemas](PostgresDriver.md#getschemas)
- [getTables](PostgresDriver.md#gettables)
- [getTestSqlStatement](PostgresDriver.md#gettestsqlstatement)
- [initBaseStatus](PostgresDriver.md#initbasestatus)
- [isLimitAsTop](PostgresDriver.md#islimitastop)
- [isNeedsSsh](PostgresDriver.md#isneedsssh)
- [isPositionedParameterAvailable](PostgresDriver.md#ispositionedparameteravailable)
- [isQuery](PostgresDriver.md#isquery)
- [kill](PostgresDriver.md#kill)
- [parseSchemaAndTableHints](PostgresDriver.md#parseschemaandtablehints)
- [requestSql](PostgresDriver.md#requestsql)
- [requestSqlSub](PostgresDriver.md#requestsqlsub)
- [resetDefaultSchema](PostgresDriver.md#resetdefaultschema)
- [rollback](PostgresDriver.md#rollback)
- [setAutoCommit](PostgresDriver.md#setautocommit)
- [setColumns](PostgresDriver.md#setcolumns)
- [setForinKeys](PostgresDriver.md#setforinkeys)
- [setRdhMetaAndStatement](PostgresDriver.md#setrdhmetaandstatement)
- [setUniqueKeys](PostgresDriver.md#setuniquekeys)
- [test](PostgresDriver.md#test)

## Constructors

### constructor

• **new PostgresDriver**(`conRes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[constructor](RDSBaseDriver.md#constructor)

#### Defined in

[src/drivers/PostgresDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L28)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L52)

## Methods

### asyncGetDatabases

▸ **asyncGetDatabases**(`connectionDatabase`): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `connectionDatabase` | `string` |

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Defined in

[src/drivers/PostgresDriver.ts:255](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L255)

___

### begin

▸ **begin**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/PostgresDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L32)

___

### closeSub

▸ **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/PostgresDriver.ts:549](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L549)

___

### commit

▸ **commit**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/PostgresDriver.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L36)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:159](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L159)

___

### connectSub

▸ **connectSub**(`autoCommit?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `autoCommit` | `boolean` | `true` |

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connectSub](RDSBaseDriver.md#connectsub)

#### Defined in

[src/drivers/RDSBaseDriver.ts:238](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L238)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connectToSshServer](RDSBaseDriver.md#connecttosshserver)

#### Defined in

[src/drivers/BaseDriver.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L133)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/PostgresDriver.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L95)

___

### count

▸ **count**(`params`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[count](RDSBaseDriver.md#count)

#### Defined in

[src/drivers/RDSBaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L47)

___

### countSql

▸ **countSql**(`params`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[countSql](RDSBaseDriver.md#countsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L85)

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

[src/drivers/BaseDriver.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L225)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:178](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L178)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[explainAnalyzeSql](RDSBaseDriver.md#explainanalyzesql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L117)

___

### explainAnalyzeSqlSub

▸ **explainAnalyzeSqlSub**(`params`): `Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & { `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[explainAnalyzeSqlSub](RDSBaseDriver.md#explainanalyzesqlsub)

#### Defined in

[src/drivers/PostgresDriver.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L215)

___

### explainSql

▸ **explainSql**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[explainSql](RDSBaseDriver.md#explainsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L98)

___

### explainSqlSub

▸ **explainSqlSub**(`params`): `Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & { `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[explainSqlSub](RDSBaseDriver.md#explainsqlsub)

#### Defined in

[src/drivers/PostgresDriver.ts:204](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L204)

___

### fieldInfo2Key

▸ **fieldInfo2Key**(`fieldInfo`, `useTableColumnType`, `table?`): [`RdhKey`](../modules.md#rdhkey)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldInfo` | `FieldDef` |
| `useTableColumnType` | `boolean` |
| `table?` | [`DbTable`](DbTable.md) |

#### Returns

[`RdhKey`](../modules.md#rdhkey)

#### Defined in

[src/drivers/PostgresDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L57)

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
| `f` | (`driver`: [`PostgresDriver`](PostgresDriver.md)) => `Promise`<`T`\> |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[flow](RDSBaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:101](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L101)

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
| `f` | (`driver`: [`PostgresDriver`](PostgresDriver.md)) => `Promise`<`T`\> |
| `options?` | `Object` |
| `options.transactionControlType` | [`TransactionControlType`](../modules.md#transactioncontroltype) |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[flowTransaction](RDSBaseDriver.md#flowtransaction)

#### Defined in

[src/drivers/RDSBaseDriver.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L251)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabase](RDSBaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L219)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:204](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L204)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/PostgresDriver.ts:231](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L231)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L60)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/PostgresDriver.ts:541](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L541)

___

### getRdsDatabase

▸ `Protected` **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L63)

___

### getSchemas

▸ **getSchemas**(`dbDatabase`): `Promise`<[`DbSchema`](DbSchema.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbDatabase` | [`RdsDatabase`](RdsDatabase.md) |

#### Returns

`Promise`<[`DbSchema`](DbSchema.md)[]\>

#### Defined in

[src/drivers/PostgresDriver.ts:277](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L277)

___

### getTables

▸ **getTables**(`dbSchema`): `Promise`<[`DbTable`](DbTable.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`<[`DbTable`](DbTable.md)[]\>

#### Defined in

[src/drivers/PostgresDriver.ts:291](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L291)

___

### getTestSqlStatement

▸ `Protected` **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/PostgresDriver.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L139)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L67)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/PostgresDriver.ts:545](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L545)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L71)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/PostgresDriver.ts:537](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L537)

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

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L74)

___

### kill

▸ **kill**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[kill](RDSBaseDriver.md#kill)

#### Defined in

[src/drivers/PostgresDriver.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L121)

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

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/BaseDriver.ts#L85)

___

### requestSql

▸ **requestSql**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[requestSql](RDSBaseDriver.md#requestsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L71)

___

### requestSqlSub

▸ **requestSqlSub**(`params`): `Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) & { `dbTable`: [`DbTable`](DbTable.md)  } |

#### Returns

`Promise`<[`ResultSetDataBuilder`](ResultSetDataBuilder.md)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[requestSqlSub](RDSBaseDriver.md#requestsqlsub)

#### Defined in

[src/drivers/PostgresDriver.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L144)

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

[src/drivers/RDSBaseDriver.ts:204](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L204)

___

### rollback

▸ **rollback**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/PostgresDriver.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L40)

___

### setAutoCommit

▸ **setAutoCommit**(`value`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[setAutoCommit](RDSBaseDriver.md#setautocommit)

#### Defined in

[src/drivers/PostgresDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L44)

___

### setColumns

▸ **setColumns**(`dbSchema`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/PostgresDriver.ts:319](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L319)

___

### setForinKeys

▸ **setForinKeys**(`dbSchema`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/PostgresDriver.ts:466](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L466)

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

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[setRdhMetaAndStatement](RDSBaseDriver.md#setrdhmetaandstatement)

#### Defined in

[src/drivers/RDSBaseDriver.ts:165](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L165)

___

### setUniqueKeys

▸ **setUniqueKeys**(`dbSchema`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbSchema` | [`DbSchema`](DbSchema.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/PostgresDriver.ts:404](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/PostgresDriver.ts#L404)

___

### test

▸ **test**(`with_connect?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[test](RDSBaseDriver.md#test)

#### Defined in

[src/drivers/RDSBaseDriver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/RDSBaseDriver.ts#L29)
