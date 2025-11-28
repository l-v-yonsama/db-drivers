[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / BaseSQLSupportDriver

# Class: BaseSQLSupportDriver\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<`T`\>

  ↳ **`BaseSQLSupportDriver`**

  ↳↳ [`AwsDriver`](AwsDriver.md)

  ↳↳ [`RDSBaseDriver`](RDSBaseDriver.md)

## Table of contents

### Constructors

- [constructor](BaseSQLSupportDriver.md#constructor)

### Properties

- [conRes](BaseSQLSupportDriver.md#conres)
- [isConnected](BaseSQLSupportDriver.md#isconnected)
- [sshLocalPort](BaseSQLSupportDriver.md#sshlocalport)
- [sshServer](BaseSQLSupportDriver.md#sshserver)

### Methods

- [closeSub](BaseSQLSupportDriver.md#closesub)
- [connect](BaseSQLSupportDriver.md#connect)
- [connectSub](BaseSQLSupportDriver.md#connectsub)
- [count](BaseSQLSupportDriver.md#count)
- [countSql](BaseSQLSupportDriver.md#countsql)
- [createDBError](BaseSQLSupportDriver.md#createdberror)
- [disconnect](BaseSQLSupportDriver.md#disconnect)
- [explainAnalyzeSql](BaseSQLSupportDriver.md#explainanalyzesql)
- [explainSql](BaseSQLSupportDriver.md#explainsql)
- [flow](BaseSQLSupportDriver.md#flow)
- [getConnectionRes](BaseSQLSupportDriver.md#getconnectionres)
- [getDbDatabases](BaseSQLSupportDriver.md#getdbdatabases)
- [getFirstDbDatabase](BaseSQLSupportDriver.md#getfirstdbdatabase)
- [getIdQuoteCharacter](BaseSQLSupportDriver.md#getidquotecharacter)
- [getInfomationSchemas](BaseSQLSupportDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](BaseSQLSupportDriver.md#getinfomationschemassub)
- [getName](BaseSQLSupportDriver.md#getname)
- [getPositionalCharacter](BaseSQLSupportDriver.md#getpositionalcharacter)
- [getSqlLang](BaseSQLSupportDriver.md#getsqllang)
- [initBaseStatus](BaseSQLSupportDriver.md#initbasestatus)
- [isLimitAsTop](BaseSQLSupportDriver.md#islimitastop)
- [isNeedsSsh](BaseSQLSupportDriver.md#isneedsssh)
- [isPositionedParameterAvailable](BaseSQLSupportDriver.md#ispositionedparameteravailable)
- [isQuery](BaseSQLSupportDriver.md#isquery)
- [isSchemaSpecificationSvailable](BaseSQLSupportDriver.md#isschemaspecificationsvailable)
- [kill](BaseSQLSupportDriver.md#kill)
- [parseSchemaAndTableHints](BaseSQLSupportDriver.md#parseschemaandtablehints)
- [requestSql](BaseSQLSupportDriver.md#requestsql)
- [test](BaseSQLSupportDriver.md#test)

## Constructors

### constructor

• **new BaseSQLSupportDriver**\<`T`\>(`conRes`): [`BaseSQLSupportDriver`](BaseSQLSupportDriver.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`BaseSQLSupportDriver`](BaseSQLSupportDriver.md)\<`T`\>

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L10)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L49)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/BaseDriver.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L206)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/BaseDriver.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L205)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:30](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L30)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L32)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

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

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:28](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L28)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L26)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L98)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L226)

___

### getIdQuoteCharacter

▸ **getIdQuoteCharacter**(): [`QuoteChar`](../modules.md#quotechar)

#### Returns

[`QuoteChar`](../modules.md#quotechar)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:34](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L34)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/BaseDriver.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L220)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:16](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L16)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L22)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L20)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L14)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L18)

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

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L41)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L82)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/BaseSQLSupportDriver.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseSQLSupportDriver.ts#L24)

___

### test

▸ **test**(`with_connect`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `with_connect` | `boolean` |

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[test](BaseDriver.md#test)

#### Defined in

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/drivers/BaseDriver.ts#L230)
