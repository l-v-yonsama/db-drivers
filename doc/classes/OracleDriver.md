[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / OracleDriver

# Class: OracleDriver

## Hierarchy

- [`RDSBaseDriver`](RDSBaseDriver.md)

  ↳ **`OracleDriver`**

## Table of contents

### Constructors

- [constructor](OracleDriver.md#constructor)

### Properties

- [conRes](OracleDriver.md#conres)
- [isConnected](OracleDriver.md#isconnected)
- [sshLocalPort](OracleDriver.md#sshlocalport)
- [sshServer](OracleDriver.md#sshserver)

### Methods

- [begin](OracleDriver.md#begin)
- [closeSub](OracleDriver.md#closesub)
- [commit](OracleDriver.md#commit)
- [connect](OracleDriver.md#connect)
- [connectSub](OracleDriver.md#connectsub)
- [connectWithTest](OracleDriver.md#connectwithtest)
- [count](OracleDriver.md#count)
- [countSql](OracleDriver.md#countsql)
- [createDBError](OracleDriver.md#createdberror)
- [disconnect](OracleDriver.md#disconnect)
- [explainAnalyzeSql](OracleDriver.md#explainanalyzesql)
- [explainAnalyzeSqlSub](OracleDriver.md#explainanalyzesqlsub)
- [explainSql](OracleDriver.md#explainsql)
- [explainSqlSub](OracleDriver.md#explainsqlsub)
- [fieldInfo2Key](OracleDriver.md#fieldinfo2key)
- [filterSchemas](OracleDriver.md#filterschemas)
- [filterTables](OracleDriver.md#filtertables)
- [flow](OracleDriver.md#flow)
- [flowTransaction](OracleDriver.md#flowtransaction)
- [getConnectionRes](OracleDriver.md#getconnectionres)
- [getCurrentSchema](OracleDriver.md#getcurrentschema)
- [getDbDatabases](OracleDriver.md#getdbdatabases)
- [getFirstDbDatabase](OracleDriver.md#getfirstdbdatabase)
- [getIdQuoteCharacter](OracleDriver.md#getidquotecharacter)
- [getInfomationSchemas](OracleDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](OracleDriver.md#getinfomationschemassub)
- [getLimitClauseStyle](OracleDriver.md#getlimitclausestyle)
- [getLocks](OracleDriver.md#getlocks)
- [getMajorVersion](OracleDriver.md#getmajorversion)
- [getName](OracleDriver.md#getname)
- [getPositionalCharacter](OracleDriver.md#getpositionalcharacter)
- [getRdsDatabase](OracleDriver.md#getrdsdatabase)
- [getSchemas](OracleDriver.md#getschemas)
- [getSessions](OracleDriver.md#getsessions)
- [getSqlLang](OracleDriver.md#getsqllang)
- [getTableDDL](OracleDriver.md#gettableddl)
- [getTables](OracleDriver.md#gettables)
- [getTestSqlStatement](OracleDriver.md#gettestsqlstatement)
- [getTransactionIsolationLevel](OracleDriver.md#gettransactionisolationlevel)
- [getVersion](OracleDriver.md#getversion)
- [initBaseStatus](OracleDriver.md#initbasestatus)
- [isNeedsSsh](OracleDriver.md#isneedsssh)
- [isPositionedParameterAvailable](OracleDriver.md#ispositionedparameteravailable)
- [isQuery](OracleDriver.md#isquery)
- [isSchemaSpecificationSvailable](OracleDriver.md#isschemaspecificationsvailable)
- [kill](OracleDriver.md#kill)
- [parseSchemaAndTableHints](OracleDriver.md#parseschemaandtablehints)
- [quoteIdentifier](OracleDriver.md#quoteidentifier)
- [requestSql](OracleDriver.md#requestsql)
- [requestSqlSub](OracleDriver.md#requestsqlsub)
- [resetDefaultSchema](OracleDriver.md#resetdefaultschema)
- [rollback](OracleDriver.md#rollback)
- [setAutoCommit](OracleDriver.md#setautocommit)
- [setColumns](OracleDriver.md#setcolumns)
- [setForinKeys](OracleDriver.md#setforinkeys)
- [setUniqueKeys](OracleDriver.md#setuniquekeys)
- [supportsShowCreate](OracleDriver.md#supportsshowcreate)
- [test](OracleDriver.md#test)
- [useDatabase](OracleDriver.md#usedatabase)
- [viewRows](OracleDriver.md#viewrows)

## Constructors

### constructor

• **new OracleDriver**(`conRes`): [`OracleDriver`](OracleDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`OracleDriver`](OracleDriver.md)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[constructor](RDSBaseDriver.md#constructor)

#### Defined in

[src/drivers/OracleDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L37)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[conRes](RDSBaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L52)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isConnected](RDSBaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L51)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshLocalPort](RDSBaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L54)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[sshServer](RDSBaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L53)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[begin](RDSBaseDriver.md#begin)

#### Defined in

[src/drivers/OracleDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L41)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[closeSub](RDSBaseDriver.md#closesub)

#### Defined in

[src/drivers/OracleDriver.ts:664](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L664)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[commit](RDSBaseDriver.md#commit)

#### Defined in

[src/drivers/OracleDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L61)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[connect](RDSBaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L160)

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

[src/drivers/RDSBaseDriver.ts:334](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L334)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[connectWithTest](RDSBaseDriver.md#connectwithtest)

#### Defined in

[src/drivers/OracleDriver.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L125)

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

[src/drivers/RDSBaseDriver.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L62)

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

[src/drivers/RDSBaseDriver.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L143)

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

[src/drivers/BaseDriver.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L236)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[disconnect](RDSBaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L185)

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

[src/drivers/RDSBaseDriver.ts:194](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L194)

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

[src/drivers/OracleDriver.ts:276](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L276)

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

[src/drivers/RDSBaseDriver.ts:158](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L158)

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

[src/drivers/OracleDriver.ts:247](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L247)

___

### fieldInfo2Key

▸ **fieldInfo2Key**(`fieldInfo`, `useTableColumnType`, `table?`): `RdhKey`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldInfo` | `Metadata`\<`any`\> |
| `useTableColumnType` | `boolean` |
| `table?` | [`DbTable`](DbTable.md) |

#### Returns

`RdhKey`

#### Defined in

[src/drivers/OracleDriver.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L83)

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

[src/drivers/RDSBaseDriver.ts:254](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L254)

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

[src/drivers/RDSBaseDriver.ts:264](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L264)

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

[src/drivers/BaseDriver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L102)

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

[src/drivers/RDSBaseDriver.ts:347](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L347)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getConnectionRes](RDSBaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L64)

___

### getCurrentSchema

▸ **getCurrentSchema**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/OracleDriver.ts:292](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L292)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getDbDatabases](RDSBaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L226)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L230)

___

### getIdQuoteCharacter

▸ **getIdQuoteCharacter**(): [`QuoteChar`](../modules.md#quotechar)

#### Returns

[`QuoteChar`](../modules.md#quotechar)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getIdQuoteCharacter](RDSBaseDriver.md#getidquotecharacter)

#### Defined in

[src/drivers/OracleDriver.ts:627](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L627)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L211)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/OracleDriver.ts:347](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L347)

___

### getLimitClauseStyle

▸ **getLimitClauseStyle**(): [`LimitClauseStyle`](../modules.md#limitclausestyle)

#### Returns

[`LimitClauseStyle`](../modules.md#limitclausestyle)

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getLimitClauseStyle](RDSBaseDriver.md#getlimitclausestyle)

#### Defined in

[src/drivers/OracleDriver.ts:623](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L623)

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

[src/drivers/OracleDriver.ts:300](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L300)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getMajorVersion](RDSBaseDriver.md#getmajorversion)

#### Defined in

[src/drivers/RDSBaseDriver.ts:329](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L329)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getName](RDSBaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L61)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/OracleDriver.ts:619](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L619)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)

#### Defined in

[src/drivers/RDSBaseDriver.ts:96](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L96)

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

[src/drivers/OracleDriver.ts:377](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L377)

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

[src/drivers/OracleDriver.ts:324](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L324)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[getSqlLang](RDSBaseDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L40)

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

[src/drivers/OracleDriver.ts:635](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L635)

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

[src/drivers/OracleDriver.ts:397](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L397)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)

#### Defined in

[src/drivers/OracleDriver.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L200)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)

#### Defined in

[src/drivers/OracleDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L79)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[getVersion](RDSBaseDriver.md#getversion)

#### Defined in

[src/drivers/OracleDriver.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L288)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[initBaseStatus](RDSBaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L68)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isNeedsSsh](RDSBaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L72)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[isPositionedParameterAvailable](RDSBaseDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/OracleDriver.ts:615](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L615)

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

[src/drivers/BaseDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L75)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[RDSBaseDriver](RDSBaseDriver.md).[isSchemaSpecificationSvailable](RDSBaseDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:92](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L92)

___

### kill

▸ **kill**(`sesssionOrPid?`): `Promise`\<`string`\>

Terminate (kill) a specific session.
If sesssionOrPid is not specified, cancel the running request.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sesssionOrPid?` | `number` | the target session's SID (the SERIAL# needed to actually kill it is looked up here, since Oracle requires the pair) |

#### Returns

`Promise`\<`string`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[kill](RDSBaseDriver.md#kill)

#### Defined in

[src/drivers/OracleDriver.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L155)

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

[src/drivers/BaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/BaseDriver.ts#L86)

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

[src/drivers/RDSBaseDriver.ts:306](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L306)

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

[src/drivers/RDSBaseDriver.ts:104](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L104)

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

[src/drivers/OracleDriver.ts:204](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L204)

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

[src/drivers/RDSBaseDriver.ts:274](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L274)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[rollback](RDSBaseDriver.md#rollback)

#### Defined in

[src/drivers/OracleDriver.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L66)

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

[src/drivers/OracleDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L72)

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

[src/drivers/OracleDriver.ts:429](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L429)

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

[src/drivers/OracleDriver.ts:548](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L548)

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

[src/drivers/OracleDriver.ts:506](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L506)

___

### supportsShowCreate

▸ **supportsShowCreate**(): `boolean`

#### Returns

`boolean`

#### Overrides

[RDSBaseDriver](RDSBaseDriver.md).[supportsShowCreate](RDSBaseDriver.md#supportsshowcreate)

#### Defined in

[src/drivers/OracleDriver.ts:631](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L631)

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

[src/drivers/RDSBaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L44)

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

[src/drivers/OracleDriver.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/OracleDriver.ts#L117)

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

[src/drivers/RDSBaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/dfc4211e073b59e6d665a359343a183870df8032/src/drivers/RDSBaseDriver.ts#L74)
