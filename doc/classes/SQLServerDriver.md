[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / SQLServerDriver

# Class: SQLServerDriver

## Hierarchy

- [`RDSBaseDriver`](RDSBaseDriver.md)

  ↳ **`SQLServerDriver`**

## Table of contents

### Constructors

- [constructor](SQLServerDriver.md#constructor)

### Properties

- [conRes](SQLServerDriver.md#conres)
- [isConnected](SQLServerDriver.md#isconnected)
- [sshLocalPort](SQLServerDriver.md#sshlocalport)
- [sshServer](SQLServerDriver.md#sshserver)

### Methods

- [begin](SQLServerDriver.md#begin)
- [closeSub](SQLServerDriver.md#closesub)
- [commit](SQLServerDriver.md#commit)
- [connect](SQLServerDriver.md#connect)
- [connectSub](SQLServerDriver.md#connectsub)
- [connectWithTest](SQLServerDriver.md#connectwithtest)
- [count](SQLServerDriver.md#count)
- [countSql](SQLServerDriver.md#countsql)
- [createDBError](SQLServerDriver.md#createdberror)
- [disconnect](SQLServerDriver.md#disconnect)
- [explainAnalyzeSql](SQLServerDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](SQLServerDriver.md#explainanalyzesqlsub)
- [explainSql](SQLServerDriver.md#explainsql)
- [explainSqlSub](SQLServerDriver.md#explainsqlsub)
- [fieldInfo2Key](SQLServerDriver.md#fieldinfo2key)
- [flow](SQLServerDriver.md#flow)
- [flowTransaction](SQLServerDriver.md#flowtransaction)
- [getConnectionRes](SQLServerDriver.md#getconnectionres)
- [getCurrentSchema](SQLServerDriver.md#getcurrentschema)
- [getDbDatabase](SQLServerDriver.md#getdbdatabase)
- [getInfomationSchemas](SQLServerDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](SQLServerDriver.md#getinfomationschemassub)
- [getLockWaitTimeout](SQLServerDriver.md#getlockwaittimeout)
- [getLocks](SQLServerDriver.md#getlocks)
- [getMajorVersion](SQLServerDriver.md#getmajorversion)
- [getName](SQLServerDriver.md#getname)
- [getPositionalCharacter](SQLServerDriver.md#getpositionalcharacter)
- [getRdsDatabase](SQLServerDriver.md#getrdsdatabase)
- [getSchemas](SQLServerDriver.md#getschemas)
- [getSessions](SQLServerDriver.md#getsessions)
- [getTables](SQLServerDriver.md#gettables)
- [getTestSqlStatement](SQLServerDriver.md#gettestsqlstatement)
- [getTransactionIsolationLevel](SQLServerDriver.md#gettransactionisolationlevel)
- [getVersion](SQLServerDriver.md#getversion)
- [initBaseStatus](SQLServerDriver.md#initbasestatus)
- [isLimitAsTop](SQLServerDriver.md#islimitastop)
- [isNeedsSsh](SQLServerDriver.md#isneedsssh)
- [isPositionedParameterAvailable](SQLServerDriver.md#ispositionedparameteravailable)
- [isQuery](SQLServerDriver.md#isquery)
- [isSchemaSpecificationSvailable](SQLServerDriver.md#isschemaspecificationsvailable)
- [kill](SQLServerDriver.md#kill)
- [parseSchemaAndTableHints](SQLServerDriver.md#parseschemaandtablehints)
- [requestSql](SQLServerDriver.md#requestsql)
- [requestSqlSub](SQLServerDriver.md#requestsqlsub)
- [resetDefaultSchema](SQLServerDriver.md#resetdefaultschema)
- [rollback](SQLServerDriver.md#rollback)
- [setAutoCommit](SQLServerDriver.md#setautocommit)
- [setColumns](SQLServerDriver.md#setcolumns)
- [setForinKeys](SQLServerDriver.md#setforinkeys)
- [setUniqueKeys](SQLServerDriver.md#setuniquekeys)
- [test](SQLServerDriver.md#test)

## Constructors

### constructor

• **new SQLServerDriver**(`conRes`): [`SQLServerDriver`](SQLServerDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`SQLServerDriver`](SQLServerDriver.md)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[constructor](RDSBaseDriver.md#constructor)

#### Defined in

[src/drivers/SQLServerDriver.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L111)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L43)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L45)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/SQLServerDriver.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L115)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/SQLServerDriver.ts:773](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L773)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/SQLServerDriver.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L144)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L152)

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

[src/drivers/RDSBaseDriver.ts:258](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L258)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/SQLServerDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L226)

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

[src/drivers/RDSBaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L56)

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

[src/drivers/RDSBaseDriver.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L118)

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

[src/drivers/BaseDriver.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L224)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L177)

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

[src/drivers/RDSBaseDriver.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L162)

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

[src/drivers/SQLServerDriver.ts:410](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L410)

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

[src/drivers/RDSBaseDriver.ts:131](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L131)

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

[src/drivers/SQLServerDriver.ts:382](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L382)

___

### fieldInfo2Key

▸ **fieldInfo2Key**(`fieldInfo`, `useTableColumnType`, `table?`): `RdhKey`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldInfo` | [`ResultColumn`](../modules.md#resultcolumn) |
| `useTableColumnType` | `boolean` |
| `table?` | [`DbTable`](DbTable.md) |

#### Returns

`RdhKey`

#### Defined in

[src/drivers/SQLServerDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L197)

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

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L94)

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

[src/drivers/RDSBaseDriver.ts:271](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L271)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L56)

___

### getCurrentSchema

▸ **getCurrentSchema**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/SQLServerDriver.ts:505](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L505)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabase](RDSBaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L218)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L203)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/SQLServerDriver.ts:475](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L475)

___

### getLockWaitTimeout

▸ **getLockWaitTimeout**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/SQLServerDriver.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L169)

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

[src/drivers/SQLServerDriver.ts:423](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L423)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:253](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L253)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L53)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/SQLServerDriver.ts:765](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L765)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:76](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L76)

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

[src/drivers/SQLServerDriver.ts:511](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L511)

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

[src/drivers/SQLServerDriver.ts:444](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L444)

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

[src/drivers/SQLServerDriver.ts:530](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L530)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/SQLServerDriver.ts:311](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L311)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/SQLServerDriver.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L180)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/SQLServerDriver.ts:417](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L417)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L60)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/SQLServerDriver.ts:769](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L769)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L64)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/SQLServerDriver.ts:761](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L761)

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

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L67)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:70](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L70)

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

[src/drivers/SQLServerDriver.ts:254](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L254)

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

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/BaseDriver.ts#L78)

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

[src/drivers/RDSBaseDriver.ts:84](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L84)

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

[src/drivers/SQLServerDriver.ts:315](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L315)

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

[src/drivers/RDSBaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L218)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/SQLServerDriver.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L154)

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

[src/drivers/SQLServerDriver.ts:165](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L165)

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

[src/drivers/SQLServerDriver.ts:566](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L566)

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

[src/drivers/SQLServerDriver.ts:693](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L693)

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

[src/drivers/SQLServerDriver.ts:650](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/SQLServerDriver.ts#L650)

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

[src/drivers/RDSBaseDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/RDSBaseDriver.ts#L38)
