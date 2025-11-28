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
- [filterSchemas](MySQLDriver.md#filterschemas)
- [filterTables](MySQLDriver.md#filtertables)
- [flow](MySQLDriver.md#flow)
- [flowTransaction](MySQLDriver.md#flowtransaction)
- [getConnectionRes](MySQLDriver.md#getconnectionres)
- [getDbDatabases](MySQLDriver.md#getdbdatabases)
- [getFirstDbDatabase](MySQLDriver.md#getfirstdbdatabase)
- [getIdQuoteCharacter](MySQLDriver.md#getidquotecharacter)
- [getInfomationSchemas](MySQLDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](MySQLDriver.md#getinfomationschemassub)
- [getLockWaitTimeout](MySQLDriver.md#getlockwaittimeout)
- [getLocks](MySQLDriver.md#getlocks)
- [getMajorVersion](MySQLDriver.md#getmajorversion)
- [getName](MySQLDriver.md#getname)
- [getPositionalCharacter](MySQLDriver.md#getpositionalcharacter)
- [getRdsDatabase](MySQLDriver.md#getrdsdatabase)
- [getSchemas](MySQLDriver.md#getschemas)
- [getSessions](MySQLDriver.md#getsessions)
- [getSqlLang](MySQLDriver.md#getsqllang)
- [getTableDDL](MySQLDriver.md#gettableddl)
- [getTables](MySQLDriver.md#gettables)
- [getTestSqlStatement](MySQLDriver.md#gettestsqlstatement)
- [getTransactionIsolationLevel](MySQLDriver.md#gettransactionisolationlevel)
- [getVersion](MySQLDriver.md#getversion)
- [initBaseStatus](MySQLDriver.md#initbasestatus)
- [isLimitAsTop](MySQLDriver.md#islimitastop)
- [isNeedsSsh](MySQLDriver.md#isneedsssh)
- [isPositionedParameterAvailable](MySQLDriver.md#ispositionedparameteravailable)
- [isQuery](MySQLDriver.md#isquery)
- [isSchemaSpecificationSvailable](MySQLDriver.md#isschemaspecificationsvailable)
- [kill](MySQLDriver.md#kill)
- [parseSchemaAndTableHints](MySQLDriver.md#parseschemaandtablehints)
- [quoteIdentifier](MySQLDriver.md#quoteidentifier)
- [requestSql](MySQLDriver.md#requestsql)
- [requestSqlSub](MySQLDriver.md#requestsqlsub)
- [resetDefaultSchema](MySQLDriver.md#resetdefaultschema)
- [rollback](MySQLDriver.md#rollback)
- [setAutoCommit](MySQLDriver.md#setautocommit)
- [setColumns](MySQLDriver.md#setcolumns)
- [setForinKeys](MySQLDriver.md#setforinkeys)
- [setTransactionIsolationLevel](MySQLDriver.md#settransactionisolationlevel)
- [setUniqueKeys](MySQLDriver.md#setuniquekeys)
- [supportsShowCreate](MySQLDriver.md#supportsshowcreate)
- [test](MySQLDriver.md#test)
- [useDatabase](MySQLDriver.md#usedatabase)

## Constructors

### constructor

• **new MySQLDriver**(`conRes`): [`MySQLDriver`](MySQLDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`MySQLDriver`](MySQLDriver.md)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[constructor](RDSBaseDriver.md#constructor)

#### Defined in

[src/drivers/MySQLDriver.ts:27](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L27)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L49)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/MySQLDriver.ts:31](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L31)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/MySQLDriver.ts:672](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L672)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/MySQLDriver.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L35)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L156)

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

[src/drivers/RDSBaseDriver.ts:315](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L315)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/MySQLDriver.ts:130](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L130)

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

[src/drivers/RDSBaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L60)

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

[src/drivers/RDSBaseDriver.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L124)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L181)

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

[src/drivers/RDSBaseDriver.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L175)

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

[src/drivers/MySQLDriver.ts:319](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L319)

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

[src/drivers/RDSBaseDriver.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L139)

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

[src/drivers/MySQLDriver.ts:291](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L291)

___

### fieldInfo2Key

▸ **fieldInfo2Key**(`fieldInfo`, `useTableColumnType`, `table?`): `RdhKey`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldInfo` | `FieldPacket` |
| `useTableColumnType` | `boolean` |
| `table?` | [`DbTable`](DbTable.md) |

#### Returns

`RdhKey`

#### Defined in

[src/drivers/MySQLDriver.ts:97](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L97)

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

[src/drivers/RDSBaseDriver.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L235)

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

[src/drivers/RDSBaseDriver.ts:245](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L245)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L98)

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

[src/drivers/RDSBaseDriver.ts:328](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L328)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabases](RDSBaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L226)

___

### getIdQuoteCharacter

▸ **getIdQuoteCharacter**(): [`QuoteChar`](../modules.md#quotechar)

#### Returns

[`QuoteChar`](../modules.md#quotechar)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getIdQuoteCharacter](RDSBaseDriver.md#getidquotecharacter)

#### Defined in

[src/drivers/MySQLDriver.ts:642](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L642)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/MySQLDriver.ts:410](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L410)

___

### getLockWaitTimeout

▸ **getLockWaitTimeout**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/MySQLDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L52)

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

[src/drivers/MySQLDriver.ts:340](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L340)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:310](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L310)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/MySQLDriver.ts:634](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L634)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:77](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L77)

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

[src/drivers/MySQLDriver.ts:435](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L435)

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

[src/drivers/MySQLDriver.ts:392](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L392)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getSqlLang](RDSBaseDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L38)

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

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTableDDL](RDSBaseDriver.md#gettableddl)

#### Defined in

[src/drivers/MySQLDriver.ts:650](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L650)

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

[src/drivers/MySQLDriver.ts:449](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L449)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/MySQLDriver.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L189)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/MySQLDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L72)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/MySQLDriver.ts:334](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L334)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/MySQLDriver.ts:638](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L638)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/MySQLDriver.ts:630](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L630)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L73)

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

[src/drivers/MySQLDriver.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L166)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L82)

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

[src/drivers/RDSBaseDriver.ts:287](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L287)

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

[src/drivers/RDSBaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L85)

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

[src/drivers/MySQLDriver.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L193)

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

[src/drivers/RDSBaseDriver.ts:255](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L255)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/MySQLDriver.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L39)

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

[src/drivers/MySQLDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L43)

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

[src/drivers/MySQLDriver.ts:470](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L470)

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

[src/drivers/MySQLDriver.ts:564](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L564)

___

### setTransactionIsolationLevel

▸ **setTransactionIsolationLevel**(`value`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | [`TransactionIsolationLevel`](../modules.md#transactionisolationlevel) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/MySQLDriver.ts:91](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L91)

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

[src/drivers/MySQLDriver.ts:512](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L512)

___

### supportsShowCreate

▸ **supportsShowCreate**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[supportsShowCreate](RDSBaseDriver.md#supportsshowcreate)

#### Defined in

[src/drivers/MySQLDriver.ts:646](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L646)

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

[src/drivers/RDSBaseDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/RDSBaseDriver.ts#L42)

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

[src/drivers/MySQLDriver.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/MySQLDriver.ts#L126)
