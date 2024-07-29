[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RedisDriver

# Class: RedisDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`RedisDatabase`](RedisDatabase.md)\>

  ↳ **`RedisDriver`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](RedisDriver.md#constructor)

### Properties

- [client](RedisDriver.md#client)
- [conRes](RedisDriver.md#conres)
- [isConnected](RedisDriver.md#isconnected)
- [sshLocalPort](RedisDriver.md#sshlocalport)
- [sshServer](RedisDriver.md#sshserver)

### Methods

- [closeSub](RedisDriver.md#closesub)
- [connect](RedisDriver.md#connect)
- [connectSub](RedisDriver.md#connectsub)
- [createDBError](RedisDriver.md#createdberror)
- [delete](RedisDriver.md#delete)
- [disconnect](RedisDriver.md#disconnect)
- [flow](RedisDriver.md#flow)
- [flushAll](RedisDriver.md#flushall)
- [flushDb](RedisDriver.md#flushdb)
- [getConnectionRes](RedisDriver.md#getconnectionres)
- [getDbDatabase](RedisDriver.md#getdbdatabase)
- [getInfomationSchemas](RedisDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](RedisDriver.md#getinfomationschemassub)
- [getName](RedisDriver.md#getname)
- [getValueByKey](RedisDriver.md#getvaluebykey)
- [initBaseStatus](RedisDriver.md#initbasestatus)
- [isNeedsSsh](RedisDriver.md#isneedsssh)
- [isQuery](RedisDriver.md#isquery)
- [parseSchemaAndTableHints](RedisDriver.md#parseschemaandtablehints)
- [scan](RedisDriver.md#scan)
- [scanStream](RedisDriver.md#scanstream)
- [test](RedisDriver.md#test)

## Constructors

### constructor

• **new RedisDriver**(`conRes`): [`RedisDriver`](RedisDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`RedisDriver`](RedisDriver.md)

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/RedisDriver.ts:21](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L21)

## Properties

### client

• **client**: `Redis`

#### Defined in

[src/drivers/RedisDriver.ts:19](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L19)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L43)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L45)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/RedisDriver.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L235)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L152)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/RedisDriver.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L25)

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

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L218)

___

### delete

▸ **delete**(`key`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RedisDriver.ts:91](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L91)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L171)

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

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L94)

___

### flushAll

▸ **flushAll**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RedisDriver.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L83)

___

### flushDb

▸ **flushDb**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/RedisDriver.ts:87](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L87)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L56)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabase](BaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`RedisDatabase`](RedisDatabase.md)[]\>

#### Returns

`Promise`\<[`RedisDatabase`](RedisDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L197)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`RedisDatabase`](RedisDatabase.md)[]\>

#### Returns

`Promise`\<[`RedisDatabase`](RedisDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/RedisDriver.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L210)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L53)

___

### getValueByKey

▸ **getValueByKey**(`client`, `key`, `type`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `client` | `Redis` |
| `key` | `string` |
| `type` | [`RedisKeyType`](../modules.md#rediskeytype) |

#### Returns

`Promise`\<`any`\>

#### Defined in

[src/drivers/RedisDriver.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L189)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L60)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L64)

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

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L67)

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

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/BaseDriver.ts#L78)

___

### scan

▸ **scan**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/RedisDriver.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L139)

___

### scanStream

▸ **scanStream**(`params`): `Promise`\<[`DbKey`](DbKey.md)\<[`RedisKeyParams`](../modules.md#rediskeyparams)\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`\<[`DbKey`](DbKey.md)\<[`RedisKeyParams`](../modules.md#rediskeyparams)\>[]\>

#### Defined in

[src/drivers/RedisDriver.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L95)

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

[src/drivers/RedisDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/65cc6ed2f5b4ab39bdd13b785cb7d5f6ac854526/src/drivers/RedisDriver.ts#L64)
