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
- [getDbDatabases](SQLiteDriver.md#getdbdatabases)
- [getFirstDbDatabase](SQLiteDriver.md#getfirstdbdatabase)
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
- [test](SQLiteDriver.md#test)
- [useDatabase](SQLiteDriver.md#usedatabase)

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

[src/drivers/SQLiteDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L37)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L49)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/SQLiteDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L41)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/SQLiteDriver.ts:436](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L436)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/SQLiteDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L45)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L156)

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

[src/drivers/RDSBaseDriver.ts:275](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L275)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/SQLiteDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L60)

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

[src/drivers/RDSBaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L56)

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

[src/drivers/RDSBaseDriver.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L124)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L181)

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

[src/drivers/RDSBaseDriver.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L175)

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

[src/drivers/SQLiteDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L28)

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

[src/drivers/RDSBaseDriver.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L139)

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

[src/drivers/SQLiteDriver.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L187)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L98)

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

[src/drivers/RDSBaseDriver.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L288)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabases](RDSBaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/SQLiteDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L227)

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

[src/drivers/SQLiteDriver.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L214)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:270](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L270)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/SQLiteDriver.ts:424](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L424)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L78)

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

[src/drivers/SQLiteDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L219)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/SQLiteDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L82)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/SQLiteDriver.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L223)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/SQLiteDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L207)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/SQLiteDriver.ts:428](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L428)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:420](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L420)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:432](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L432)

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

[src/drivers/SQLiteDriver.ts:77](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L77)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L82)

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

[src/drivers/RDSBaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L86)

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

[src/drivers/SQLiteDriver.ts:99](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L99)

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

[src/drivers/RDSBaseDriver.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L235)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/SQLiteDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L49)

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

[src/drivers/SQLiteDriver.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L58)

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

[src/drivers/RDSBaseDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/RDSBaseDriver.ts#L38)

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

[src/drivers/SQLiteDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/SQLiteDriver.ts#L53)
