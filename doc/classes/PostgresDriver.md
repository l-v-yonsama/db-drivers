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
- [countTables](PostgresDriver.md#counttables)
- [createColumnResolver](PostgresDriver.md#createcolumnresolver)
- [createDBError](PostgresDriver.md#createdberror)
- [disconnect](PostgresDriver.md#disconnect)
- [explainAnalyzeSql](PostgresDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](PostgresDriver.md#explainanalyzesqlsub)
- [explainSql](PostgresDriver.md#explainsql)
- [explainSqlSub](PostgresDriver.md#explainsqlsub)
- [fieldInfo2Key](PostgresDriver.md#fieldinfo2key)
- [flow](PostgresDriver.md#flow)
- [flowTransaction](PostgresDriver.md#flowtransaction)
- [getColumns](PostgresDriver.md#getcolumns)
- [getConnectionRes](PostgresDriver.md#getconnectionres)
- [getDbDatabase](PostgresDriver.md#getdbdatabase)
- [getInfomationSchemas](PostgresDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](PostgresDriver.md#getinfomationschemassub)
- [getName](PostgresDriver.md#getname)
- [getRdsDatabase](PostgresDriver.md#getrdsdatabase)
- [getSchemas](PostgresDriver.md#getschemas)
- [getTables](PostgresDriver.md#gettables)
- [getTestSqlStatement](PostgresDriver.md#gettestsqlstatement)
- [initBaseStatus](PostgresDriver.md#initbasestatus)
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

[src/drivers/PostgresDriver.ts:31](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L31)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L52)

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

[src/drivers/PostgresDriver.ts:307](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L307)

___

### begin

▸ **begin**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/PostgresDriver.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L35)

___

### closeSub

▸ **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/PostgresDriver.ts:590](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L590)

___

### commit

▸ **commit**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/PostgresDriver.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L39)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L167)

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

[src/drivers/RDSBaseDriver.ts:231](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L231)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connectToSshServer](RDSBaseDriver.md#connecttosshserver)

#### Defined in

[src/drivers/BaseDriver.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L141)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/PostgresDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L98)

___

### count

▸ **count**(`params`): `Promise`<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`<`number`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[count](RDSBaseDriver.md#count)

#### Defined in

[src/drivers/PostgresDriver.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L229)

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

[src/drivers/RDSBaseDriver.ts:81](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L81)

___

### countTables

▸ **countTables**(`tables`, `options`): `Promise`<[`TableRows`](../interfaces/TableRows.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tables` | [`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md) |
| `options` | `any` |

#### Returns

`Promise`<[`TableRows`](../interfaces/TableRows.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[countTables](RDSBaseDriver.md#counttables)

#### Defined in

[src/drivers/PostgresDriver.ts:244](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L244)

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

[RDSBaseDriver](RDSBaseDriver.md).[createColumnResolver](RDSBaseDriver.md#createcolumnresolver)

#### Defined in

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L85)

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

[src/drivers/BaseDriver.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L233)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L186)

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

[src/drivers/RDSBaseDriver.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L113)

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

[src/drivers/PostgresDriver.ts:213](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L213)

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

[src/drivers/RDSBaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L94)

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

[src/drivers/PostgresDriver.ts:202](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L202)

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

[src/drivers/PostgresDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L60)

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

[src/drivers/BaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L109)

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

[src/drivers/RDSBaseDriver.ts:244](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L244)

___

### getColumns

▸ **getColumns**(`schemaName`, `dbTable`): `Promise`<[`DbColumn`](DbColumn.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `schemaName` | `string` |
| `dbTable` | [`DbTable`](DbTable.md) |

#### Returns

`Promise`<[`DbColumn`](DbColumn.md)[]\>

#### Defined in

[src/drivers/PostgresDriver.ts:371](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L371)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabase](RDSBaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L227)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/PostgresDriver.ts:278](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L278)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L60)

___

### getRdsDatabase

▸ `Protected` **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L59)

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

[src/drivers/PostgresDriver.ts:329](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L329)

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

[src/drivers/PostgresDriver.ts:343](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L343)

___

### getTestSqlStatement

▸ `Protected` **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/PostgresDriver.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L142)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L71)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/PostgresDriver.ts:586](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L586)

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

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L74)

___

### kill

▸ **kill**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[kill](RDSBaseDriver.md#kill)

#### Defined in

[src/drivers/PostgresDriver.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L124)

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

[src/drivers/BaseDriver.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/BaseDriver.ts#L93)

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

[src/drivers/RDSBaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L67)

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

[src/drivers/PostgresDriver.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L147)

___

### resetDefaultSchema

▸ **resetDefaultSchema**(`database`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `database` | [`RdsDatabase`](RdsDatabase.md) |

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[resetDefaultSchema](RDSBaseDriver.md#resetdefaultschema)

#### Defined in

[src/drivers/RDSBaseDriver.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L200)

___

### rollback

▸ **rollback**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/PostgresDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L43)

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

[src/drivers/PostgresDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L47)

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

[src/drivers/PostgresDriver.ts:515](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L515)

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

[src/drivers/RDSBaseDriver.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L161)

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

[src/drivers/PostgresDriver.ts:453](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/PostgresDriver.ts#L453)

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

[src/drivers/RDSBaseDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/e30c6b3/src/drivers/RDSBaseDriver.ts#L32)
