[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RDSBaseDriver

# Class: RDSBaseDriver

## Hierarchy

- [`BaseSQLSupportDriver`](BaseSQLSupportDriver.md)\<[`RdsDatabase`](RdsDatabase.md)\>

  ↳ **`RDSBaseDriver`**

  ↳↳ [`MySQLDriver`](MySQLDriver.md)

  ↳↳ [`PostgresDriver`](PostgresDriver.md)

  ↳↳ [`SQLiteDriver`](SQLiteDriver.md)

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
- [getDbDatabases](RDSBaseDriver.md#getdbdatabases)
- [getFirstDbDatabase](RDSBaseDriver.md#getfirstdbdatabase)
- [getInfomationSchemas](RDSBaseDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](RDSBaseDriver.md#getinfomationschemassub)
- [getLocks](RDSBaseDriver.md#getlocks)
- [getMajorVersion](RDSBaseDriver.md#getmajorversion)
- [getName](RDSBaseDriver.md#getname)
- [getPositionalCharacter](RDSBaseDriver.md#getpositionalcharacter)
- [getRdsDatabase](RDSBaseDriver.md#getrdsdatabase)
- [getSessions](RDSBaseDriver.md#getsessions)
- [getSqlLang](RDSBaseDriver.md#getsqllang)
- [getTestSqlStatement](RDSBaseDriver.md#gettestsqlstatement)
- [getTransactionIsolationLevel](RDSBaseDriver.md#gettransactionisolationlevel)
- [getVersion](RDSBaseDriver.md#getversion)
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
- [test](RDSBaseDriver.md#test)
- [useDatabase](RDSBaseDriver.md#usedatabase)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[constructor](BaseSQLSupportDriver.md#constructor)

#### Defined in

[src/drivers/RDSBaseDriver.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L22)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[conRes](BaseSQLSupportDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isConnected](BaseSQLSupportDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[sshLocalPort](BaseSQLSupportDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[sshServer](BaseSQLSupportDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L49)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L251)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[closeSub](BaseSQLSupportDriver.md#closesub)

#### Defined in

[src/drivers/BaseDriver.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L206)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L252)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[connect](BaseSQLSupportDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L156)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[connectSub](BaseSQLSupportDriver.md#connectsub)

#### Defined in

[src/drivers/RDSBaseDriver.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L263)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:255](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L255)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[count](BaseSQLSupportDriver.md#count)

#### Defined in

[src/drivers/RDSBaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L50)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[countSql](BaseSQLSupportDriver.md#countsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L112)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[createDBError](BaseSQLSupportDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[disconnect](BaseSQLSupportDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L181)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[explainAnalyzeSql](BaseSQLSupportDriver.md#explainanalyzesql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:163](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L163)

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

[src/drivers/RDSBaseDriver.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L190)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[explainSql](BaseSQLSupportDriver.md#explainsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:127](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L127)

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

[src/drivers/RDSBaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L156)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[flow](BaseSQLSupportDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L98)

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

[src/drivers/RDSBaseDriver.ts:276](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L276)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getConnectionRes](BaseSQLSupportDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getDbDatabases](BaseSQLSupportDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getFirstDbDatabase](BaseSQLSupportDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getInfomationSchemas](BaseSQLSupportDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getInfomationSchemasSub](BaseSQLSupportDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/BaseDriver.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L220)

___

### getLocks

▸ **getLocks**(`dbName`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbName` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L160)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:258](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L258)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getName](BaseSQLSupportDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getPositionalCharacter](BaseSQLSupportDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:15](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseSQLSupportDriver.ts#L15)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Defined in

[src/drivers/RDSBaseDriver.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L66)

___

### getSessions

▸ **getSessions**(`dbName`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dbName` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L161)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getSqlLang](BaseSQLSupportDriver.md#getsqllang)

#### Defined in

[src/drivers/RDSBaseDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L28)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/RDSBaseDriver.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L26)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:257](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L257)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:256](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L256)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[initBaseStatus](BaseSQLSupportDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isLimitAsTop](BaseSQLSupportDriver.md#islimitastop)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:19](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseSQLSupportDriver.ts#L19)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isNeedsSsh](BaseSQLSupportDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isPositionedParameterAvailable](BaseSQLSupportDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseSQLSupportDriver.ts#L13)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isQuery](BaseSQLSupportDriver.md#isquery)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isSchemaSpecificationSvailable](BaseSQLSupportDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L62)

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

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[kill](BaseSQLSupportDriver.md#kill)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseSQLSupportDriver.ts#L38)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[parseSchemaAndTableHints](BaseSQLSupportDriver.md#parseschemaandtablehints)

#### Defined in

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/BaseDriver.ts#L82)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[requestSql](BaseSQLSupportDriver.md#requestsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L74)

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

[src/drivers/RDSBaseDriver.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L123)

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

[src/drivers/RDSBaseDriver.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L223)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:253](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L253)

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

[src/drivers/RDSBaseDriver.ts:254](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L254)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[test](BaseSQLSupportDriver.md#test)

#### Defined in

[src/drivers/RDSBaseDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L32)

___

### useDatabase

▸ **useDatabase**(`database`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `database` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/2a503c7574fe14c7cb9042d2290354c0970699f9/src/drivers/RDSBaseDriver.ts#L60)
