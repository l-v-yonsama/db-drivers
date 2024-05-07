[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / MySQLDriver

# Class: MySQLDriver

## Hierarchy

- [`RDSBaseDriver`](RDSBaseDriver.md)

  ↳ **`MySQLDriver`**

## Table of contents

### Constructors

- [constructor](MySQLDriver.md#constructor)

### Properties

- [conRes](MySQLDriver.md#conres)
- [isConnected](MySQLDriver.md#isconnected)
- [sshLocalPort](MySQLDriver.md#sshlocalport)
- [sshServer](MySQLDriver.md#sshserver)

### Methods

- [begin](MySQLDriver.md#begin)
- [closeSub](MySQLDriver.md#closesub)
- [commit](MySQLDriver.md#commit)
- [connect](MySQLDriver.md#connect)
- [connectSub](MySQLDriver.md#connectsub)
- [connectToSshServer](MySQLDriver.md#connecttosshserver)
- [connectWithTest](MySQLDriver.md#connectwithtest)
- [count](MySQLDriver.md#count)
- [countSql](MySQLDriver.md#countsql)
- [createDBError](MySQLDriver.md#createdberror)
- [disconnect](MySQLDriver.md#disconnect)
- [explainAnalyzeSql](MySQLDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](MySQLDriver.md#explainanalyzesqlsub)
- [explainSql](MySQLDriver.md#explainsql)
- [explainSqlSub](MySQLDriver.md#explainsqlsub)
- [fieldInfo2Key](MySQLDriver.md#fieldinfo2key)
- [flow](MySQLDriver.md#flow)
- [flowTransaction](MySQLDriver.md#flowtransaction)
- [getConnectionRes](MySQLDriver.md#getconnectionres)
- [getDbDatabase](MySQLDriver.md#getdbdatabase)
- [getInfomationSchemas](MySQLDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](MySQLDriver.md#getinfomationschemassub)
- [getName](MySQLDriver.md#getname)
- [getRdsDatabase](MySQLDriver.md#getrdsdatabase)
- [getSchemas](MySQLDriver.md#getschemas)
- [getTables](MySQLDriver.md#gettables)
- [getTestSqlStatement](MySQLDriver.md#gettestsqlstatement)
- [initBaseStatus](MySQLDriver.md#initbasestatus)
- [isNeedsSsh](MySQLDriver.md#isneedsssh)
- [isPositionedParameterAvailable](MySQLDriver.md#ispositionedparameteravailable)
- [isQuery](MySQLDriver.md#isquery)
- [kill](MySQLDriver.md#kill)
- [parseSchemaAndTableHints](MySQLDriver.md#parseschemaandtablehints)
- [requestSql](MySQLDriver.md#requestsql)
- [requestSqlSub](MySQLDriver.md#requestsqlsub)
- [resetDefaultSchema](MySQLDriver.md#resetdefaultschema)
- [rollback](MySQLDriver.md#rollback)
- [setAutoCommit](MySQLDriver.md#setautocommit)
- [setColumns](MySQLDriver.md#setcolumns)
- [setForinKeys](MySQLDriver.md#setforinkeys)
- [setRdhMetaAndStatement](MySQLDriver.md#setrdhmetaandstatement)
- [setUniqueKeys](MySQLDriver.md#setuniquekeys)
- [test](MySQLDriver.md#test)

## Constructors

### constructor

• **new MySQLDriver**(`conRes`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[constructor](RDSBaseDriver.md#constructor)

#### Defined in

[src/drivers/MySQLDriver.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L26)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L52)

## Methods

### begin

▸ **begin**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/MySQLDriver.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L30)

___

### closeSub

▸ **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/MySQLDriver.ts:473](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L473)

___

### commit

▸ **commit**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/MySQLDriver.ts:34](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L34)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:159](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L159)

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

[src/drivers/RDSBaseDriver.ts:231](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L231)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connectToSshServer](RDSBaseDriver.md#connecttosshserver)

#### Defined in

[src/drivers/BaseDriver.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L133)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/MySQLDriver.ts:80](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L80)

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

[src/drivers/RDSBaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L47)

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

[src/drivers/RDSBaseDriver.ts:81](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L81)

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

[src/drivers/BaseDriver.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L225)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:178](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L178)

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

[src/drivers/RDSBaseDriver.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L113)

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

[src/drivers/MySQLDriver.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L236)

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

[src/drivers/RDSBaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L94)

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

[src/drivers/MySQLDriver.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L208)

___

### fieldInfo2Key

▸ **fieldInfo2Key**(`fieldInfo`, `useTableColumnType`, `table?`): [`RdhKey`](../modules.md#rdhkey)

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldInfo` | `FieldPacket` |
| `useTableColumnType` | `boolean` |
| `table?` | [`DbTable`](DbTable.md) |

#### Returns

[`RdhKey`](../modules.md#rdhkey)

#### Defined in

[src/drivers/MySQLDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L51)

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
| `f` | (`driver`: [`MySQLDriver`](MySQLDriver.md)) => `Promise`<`T`\> |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[flow](RDSBaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:101](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L101)

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
| `f` | (`driver`: [`MySQLDriver`](MySQLDriver.md)) => `Promise`<`T`\> |
| `options?` | `Object` |
| `options.transactionControlType` | [`TransactionControlType`](../modules.md#transactioncontroltype) |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[flowTransaction](RDSBaseDriver.md#flowtransaction)

#### Defined in

[src/drivers/RDSBaseDriver.ts:244](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L244)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabase](RDSBaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L219)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:204](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L204)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/MySQLDriver.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L251)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L60)

___

### getRdsDatabase

▸ `Protected` **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L59)

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

[src/drivers/MySQLDriver.ts:274](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L274)

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

[src/drivers/MySQLDriver.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L288)

___

### getTestSqlStatement

▸ `Protected` **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/MySQLDriver.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L119)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L71)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/MySQLDriver.ts:469](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L469)

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

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L74)

___

### kill

▸ **kill**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[kill](RDSBaseDriver.md#kill)

#### Defined in

[src/drivers/MySQLDriver.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L100)

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

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L85)

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

[src/drivers/RDSBaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L67)

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

[src/drivers/MySQLDriver.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L123)

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

[src/drivers/RDSBaseDriver.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L200)

___

### rollback

▸ **rollback**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/MySQLDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L38)

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

[src/drivers/MySQLDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L42)

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

[src/drivers/MySQLDriver.ts:309](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L309)

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

[src/drivers/MySQLDriver.ts:403](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L403)

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

[src/drivers/RDSBaseDriver.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L161)

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

[src/drivers/MySQLDriver.ts:351](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/MySQLDriver.ts#L351)

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

[src/drivers/RDSBaseDriver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/RDSBaseDriver.ts#L29)
