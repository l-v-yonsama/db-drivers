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
- [filterSchemas](SQLiteDriver.md#filterschemas)
- [filterTables](SQLiteDriver.md#filtertables)
- [flow](SQLiteDriver.md#flow)
- [flowTransaction](SQLiteDriver.md#flowtransaction)
- [getConnectionRes](SQLiteDriver.md#getconnectionres)
- [getDbDatabases](SQLiteDriver.md#getdbdatabases)
- [getFirstDbDatabase](SQLiteDriver.md#getfirstdbdatabase)
- [getIdQuoteCharacter](SQLiteDriver.md#getidquotecharacter)
- [getInfomationSchemas](SQLiteDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](SQLiteDriver.md#getinfomationschemassub)
- [getLocks](SQLiteDriver.md#getlocks)
- [getMajorVersion](SQLiteDriver.md#getmajorversion)
- [getName](SQLiteDriver.md#getname)
- [getPositionalCharacter](SQLiteDriver.md#getpositionalcharacter)
- [getRdsDatabase](SQLiteDriver.md#getrdsdatabase)
- [getSessions](SQLiteDriver.md#getsessions)
- [getSqlLang](SQLiteDriver.md#getsqllang)
- [getTableDDL](SQLiteDriver.md#gettableddl)
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
- [quoteIdentifier](SQLiteDriver.md#quoteidentifier)
- [requestSql](SQLiteDriver.md#requestsql)
- [requestSqlSub](SQLiteDriver.md#requestsqlsub)
- [resetDefaultSchema](SQLiteDriver.md#resetdefaultschema)
- [rollback](SQLiteDriver.md#rollback)
- [setAutoCommit](SQLiteDriver.md#setautocommit)
- [supportsShowCreate](SQLiteDriver.md#supportsshowcreate)
- [test](SQLiteDriver.md#test)
- [useDatabase](SQLiteDriver.md#usedatabase)
- [viewRows](SQLiteDriver.md#viewrows)

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

[src/drivers/SQLiteDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L38)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L52)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L51)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L54)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L53)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/SQLiteDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L42)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/SQLiteDriver.ts:481](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L481)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/SQLiteDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L46)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L160)

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

[src/drivers/RDSBaseDriver.ts:333](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L333)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/SQLiteDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L61)

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

[src/drivers/RDSBaseDriver.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L62)

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

[src/drivers/RDSBaseDriver.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L142)

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

[src/drivers/BaseDriver.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L236)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L185)

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

[src/drivers/RDSBaseDriver.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L193)

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

[src/drivers/SQLiteDriver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L29)

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

[src/drivers/RDSBaseDriver.ts:157](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L157)

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

[src/drivers/SQLiteDriver.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L188)

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

[src/drivers/RDSBaseDriver.ts:253](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L253)

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

[src/drivers/RDSBaseDriver.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L263)

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

[src/drivers/BaseDriver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L102)

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

[src/drivers/RDSBaseDriver.ts:346](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L346)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L64)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabases](RDSBaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L226)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L230)

___

### getIdQuoteCharacter

▸ **getIdQuoteCharacter**(): [`QuoteChar`](../modules.md#quotechar)

#### Returns

[`QuoteChar`](../modules.md#quotechar)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getIdQuoteCharacter](RDSBaseDriver.md#getidquotecharacter)

#### Defined in

[src/drivers/SQLiteDriver.ts:444](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L444)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L211)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/SQLiteDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L232)

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

[src/drivers/SQLiteDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L219)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:328](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L328)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L61)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/SQLiteDriver.ts:436](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L436)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L95)

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

[src/drivers/SQLiteDriver.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L224)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getSqlLang](RDSBaseDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L40)

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

[src/drivers/SQLiteDriver.ts:456](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L456)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/SQLiteDriver.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L83)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/SQLiteDriver.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L228)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/SQLiteDriver.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L208)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L68)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isLimitAsTop](RDSBaseDriver.md#islimitastop)

#### Defined in

[src/drivers/SQLiteDriver.ts:440](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L440)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L72)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:432](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L432)

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

[src/drivers/BaseDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L75)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/SQLiteDriver.ts:448](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L448)

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

[src/drivers/SQLiteDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L78)

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

[src/drivers/BaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L86)

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

[src/drivers/RDSBaseDriver.ts:305](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L305)

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

[src/drivers/RDSBaseDriver.ts:103](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L103)

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

[src/drivers/SQLiteDriver.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L100)

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

[src/drivers/RDSBaseDriver.ts:273](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L273)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/SQLiteDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L50)

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

[src/drivers/SQLiteDriver.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L59)

___

### supportsShowCreate

▸ **supportsShowCreate**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[supportsShowCreate](RDSBaseDriver.md#supportsshowcreate)

#### Defined in

[src/drivers/SQLiteDriver.ts:452](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L452)

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

[src/drivers/RDSBaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L44)

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

[src/drivers/SQLiteDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/SQLiteDriver.ts#L54)

___

### viewRows

▸ **viewRows**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ViewRecordsParams`](../modules.md#viewrecordsparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[viewRows](RDSBaseDriver.md#viewrows)

#### Defined in

[src/drivers/RDSBaseDriver.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/RDSBaseDriver.ts#L73)
