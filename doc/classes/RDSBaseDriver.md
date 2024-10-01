[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RDSBaseDriver

# Class: RDSBaseDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`RdsDatabase`](RdsDatabase.md)\>

  ↳ **`RDSBaseDriver`**

  ↳↳ [`MySQLDriver`](MySQLDriver.md)

  ↳↳ [`PostgresDriver`](PostgresDriver.md)

  ↳↳ [`SQLiteDriver`](SQLiteDriver.md)

  ↳↳ [`SQLServerDriver`](SQLServerDriver.md)

## Implements

- [`ISQLSupportDriver`](../interfaces/ISQLSupportDriver.md)

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

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/RDSBaseDriver.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L25)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L49)

## Methods

### begin

▸ **begin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L263)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/BaseDriver.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L206)

___

### commit

▸ **commit**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:264](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L264)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L156)

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

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/RDSBaseDriver.ts:275](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L275)

___

### connectWithTest

▸ **connectWithTest**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:267](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L267)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[count](../interfaces/ISQLSupportDriver.md#count)

#### Defined in

[src/drivers/RDSBaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L56)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[countSql](../interfaces/ISQLSupportDriver.md#countsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L124)

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

[BaseDriver](BaseDriver.md).[createDBError](BaseDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L181)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[explainAnalyzeSql](../interfaces/ISQLSupportDriver.md#explainanalyzesql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L175)

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

[src/drivers/RDSBaseDriver.ts:202](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L202)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[explainSql](../interfaces/ISQLSupportDriver.md#explainsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L139)

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

[src/drivers/RDSBaseDriver.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L168)

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

[BaseDriver](BaseDriver.md).[flow](BaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L98)

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

[src/drivers/RDSBaseDriver.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L288)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Returns

`Promise`\<[`RdsDatabase`](RdsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/BaseDriver.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L220)

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

[src/drivers/RDSBaseDriver.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L172)

___

### getMajorVersion

▸ **getMajorVersion**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:270](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L270)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[getPositionalCharacter](../interfaces/ISQLSupportDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/RDSBaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L68)

___

### getRdsDatabase

▸ **getRdsDatabase**(): [`RdsDatabase`](RdsDatabase.md)

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Defined in

[src/drivers/RDSBaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L78)

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

[src/drivers/RDSBaseDriver.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L173)

___

### getTestSqlStatement

▸ **getTestSqlStatement**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/RDSBaseDriver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L29)

___

### getTransactionIsolationLevel

▸ **getTransactionIsolationLevel**(): `Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Returns

`Promise`\<[`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L269)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:268](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L268)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[isLimitAsTop](../interfaces/ISQLSupportDriver.md#islimitastop)

#### Defined in

[src/drivers/RDSBaseDriver.ts:76](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L76)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[isPositionedParameterAvailable](../interfaces/ISQLSupportDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:66](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L66)

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

[BaseDriver](BaseDriver.md).[isQuery](BaseDriver.md#isquery)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[isSchemaSpecificationSvailable](../interfaces/ISQLSupportDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/RDSBaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L72)

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

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[kill](../interfaces/ISQLSupportDriver.md#kill)

#### Defined in

[src/drivers/RDSBaseDriver.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L36)

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

[BaseDriver](BaseDriver.md).[parseSchemaAndTableHints](BaseDriver.md#parseschemaandtablehints)

#### Defined in

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/BaseDriver.ts#L82)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[requestSql](../interfaces/ISQLSupportDriver.md#requestsql)

#### Defined in

[src/drivers/RDSBaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L86)

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

[src/drivers/RDSBaseDriver.ts:135](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L135)

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

[src/drivers/RDSBaseDriver.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L235)

___

### rollback

▸ **rollback**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RDSBaseDriver.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L265)

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

[src/drivers/RDSBaseDriver.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L266)

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

[BaseDriver](BaseDriver.md).[test](BaseDriver.md#test)

#### Defined in

[src/drivers/RDSBaseDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L38)

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

[src/drivers/RDSBaseDriver.ts:70](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/RDSBaseDriver.ts#L70)
