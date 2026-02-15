[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / MemcacheDriver

# Class: MemcacheDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`MemcacheDatabase`](MemcacheDatabase.md)\>

  ↳ **`MemcacheDriver`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)
- [`Commandable`](../interfaces/Commandable.md)

## Table of contents

### Constructors

- [constructor](MemcacheDriver.md#constructor)

### Properties

- [conRes](MemcacheDriver.md#conres)
- [isConnected](MemcacheDriver.md#isconnected)
- [sshLocalPort](MemcacheDriver.md#sshlocalport)
- [sshServer](MemcacheDriver.md#sshserver)

### Methods

- [closeSub](MemcacheDriver.md#closesub)
- [connect](MemcacheDriver.md#connect)
- [connectSub](MemcacheDriver.md#connectsub)
- [createDBError](MemcacheDriver.md#createdberror)
- [disconnect](MemcacheDriver.md#disconnect)
- [executeCommand](MemcacheDriver.md#executecommand)
- [flow](MemcacheDriver.md#flow)
- [get](MemcacheDriver.md#get)
- [getByRdh](MemcacheDriver.md#getbyrdh)
- [getConnectionRes](MemcacheDriver.md#getconnectionres)
- [getDbDatabases](MemcacheDriver.md#getdbdatabases)
- [getFirstDbDatabase](MemcacheDriver.md#getfirstdbdatabase)
- [getInfomationSchemas](MemcacheDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](MemcacheDriver.md#getinfomationschemassub)
- [getName](MemcacheDriver.md#getname)
- [getVersion](MemcacheDriver.md#getversion)
- [initBaseStatus](MemcacheDriver.md#initbasestatus)
- [isNeedsSsh](MemcacheDriver.md#isneedsssh)
- [isQuery](MemcacheDriver.md#isquery)
- [listKeyWithValues](MemcacheDriver.md#listkeywithvalues)
- [parseSchemaAndTableHints](MemcacheDriver.md#parseschemaandtablehints)
- [scan](MemcacheDriver.md#scan)
- [set](MemcacheDriver.md#set)
- [test](MemcacheDriver.md#test)

## Constructors

### constructor

• **new MemcacheDriver**(`conRes`): [`MemcacheDriver`](MemcacheDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`MemcacheDriver`](MemcacheDriver.md)

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/MemcacheDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L42)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L52)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L51)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L54)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L53)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/MemcacheDriver.ts:368](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L368)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L160)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/MemcacheDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L46)

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

[src/drivers/BaseDriver.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L236)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L185)

___

### executeCommand

▸ **executeCommand**(`command`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `command` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[Commandable](../interfaces/Commandable.md).[executeCommand](../interfaces/Commandable.md#executecommand)

#### Defined in

[src/drivers/MemcacheDriver.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L262)

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

[src/drivers/BaseDriver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L102)

___

### get

▸ **get**(`key`): `Promise`\<[`MemcachedValue`](../modules.md#memcachedvalue)\>

キーを指定して 1 件取得

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`\<[`MemcachedValue`](../modules.md#memcachedvalue)\>

#### Defined in

[src/drivers/MemcacheDriver.ts:321](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L321)

___

### getByRdh

▸ **getByRdh**(`key`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/MemcacheDriver.ts:140](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L140)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L64)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L226)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L230)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`MemcacheDatabase`](MemcacheDatabase.md)[]\>

#### Returns

`Promise`\<[`MemcacheDatabase`](MemcacheDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L211)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`MemcacheDatabase`](MemcacheDatabase.md)[]\>

#### Returns

`Promise`\<[`MemcacheDatabase`](MemcacheDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/MemcacheDriver.ts:335](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L335)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L61)

___

### getVersion

▸ **getVersion**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/MemcacheDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L79)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L68)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L72)

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

[src/drivers/BaseDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L75)

___

### listKeyWithValues

▸ **listKeyWithValues**(`options?`): `Promise`\<[`DbKey`](DbKey.md)\<[`MemcacheKeyParams`](../modules.md#memcachekeyparams)\>[]\>

全キーを取得（memcached の items + cachedump を使用）

#### Parameters

| Name | Type |
| :------ | :------ |
| `options?` | [`ListOption`](../modules.md#listoption) |

#### Returns

`Promise`\<[`DbKey`](DbKey.md)\<[`MemcacheKeyParams`](../modules.md#memcachekeyparams)\>[]\>

#### Defined in

[src/drivers/MemcacheDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L85)

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

[src/drivers/BaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L86)

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

[src/drivers/MemcacheDriver.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L148)

___

### set

▸ **set**(`key`, `value`, `options?`): `Promise`\<`boolean`\>

キーと値を指定して保存

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `string` \| `Buffer` |
| `options?` | `Object` |
| `options.lifetime?` | `number` |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[src/drivers/MemcacheDriver.ts:326](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L326)

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

[src/drivers/MemcacheDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/MemcacheDriver.ts#L61)
