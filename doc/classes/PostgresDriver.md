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
- [setRdhMetaAndStatement](PostgresDriver.md#setrdhmetaandstatement)
- [setUniqueKeys](PostgresDriver.md#setuniquekeys)
- [test](PostgresDriver.md#test)

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

[src/drivers/PostgresDriver.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L22)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L43)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L45)

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

[src/drivers/PostgresDriver.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L249)

___

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/PostgresDriver.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L26)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/PostgresDriver.ts:543](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L543)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/PostgresDriver.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L30)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L152)

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

[src/drivers/RDSBaseDriver.ts:253](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L253)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/PostgresDriver.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L89)

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

[src/drivers/RDSBaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L46)

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

[src/drivers/RDSBaseDriver.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L100)

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

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L218)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L171)

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

[src/drivers/RDSBaseDriver.ts:132](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L132)

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

[src/drivers/PostgresDriver.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L209)

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

[src/drivers/RDSBaseDriver.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L113)

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

[src/drivers/PostgresDriver.ts:198](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L198)

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

[src/drivers/PostgresDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L51)

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

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L94)

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

[src/drivers/RDSBaseDriver.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L266)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L56)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabase](RDSBaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L197)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/PostgresDriver.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L225)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L53)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/PostgresDriver.ts:535](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L535)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L66)

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

[src/drivers/PostgresDriver.ts:271](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L271)

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

[src/drivers/PostgresDriver.ts:285](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L285)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/PostgresDriver.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L133)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L60)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/PostgresDriver.ts:539](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L539)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L64)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/PostgresDriver.ts:531](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L531)

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

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L67)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L60)

___

### kill

▸ **kill**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[kill](RDSBaseDriver.md#kill)

#### Defined in

[src/drivers/PostgresDriver.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L115)

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

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/BaseDriver.ts#L78)

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

[src/drivers/RDSBaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L74)

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

[src/drivers/PostgresDriver.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L138)

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

[src/drivers/RDSBaseDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L219)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/PostgresDriver.ts:34](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L34)

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

[src/drivers/PostgresDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L38)

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

[src/drivers/PostgresDriver.ts:313](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L313)

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

[src/drivers/PostgresDriver.ts:460](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L460)

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

[src/drivers/RDSBaseDriver.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L180)

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

[src/drivers/PostgresDriver.ts:398](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/PostgresDriver.ts#L398)

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

[src/drivers/RDSBaseDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/drivers/RDSBaseDriver.ts#L28)
