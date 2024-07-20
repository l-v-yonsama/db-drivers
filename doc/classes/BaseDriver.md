[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / BaseDriver

# Class: BaseDriver\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

## Hierarchy

- **`BaseDriver`**

  ↳ [`Auth0Driver`](Auth0Driver.md)

  ↳ [`AwsDriver`](AwsDriver.md)

  ↳ [`KeycloakDriver`](KeycloakDriver.md)

  ↳ [`RDSBaseDriver`](RDSBaseDriver.md)

  ↳ [`RedisDriver`](RedisDriver.md)

## Table of contents

### Constructors

- [constructor](BaseDriver.md#constructor)

### Properties

- [conRes](BaseDriver.md#conres)
- [isConnected](BaseDriver.md#isconnected)
- [sshLocalPort](BaseDriver.md#sshlocalport)
- [sshServer](BaseDriver.md#sshserver)

### Methods

- [closeSub](BaseDriver.md#closesub)
- [connect](BaseDriver.md#connect)
- [connectSub](BaseDriver.md#connectsub)
- [createDBError](BaseDriver.md#createdberror)
- [disconnect](BaseDriver.md#disconnect)
- [flow](BaseDriver.md#flow)
- [getConnectionRes](BaseDriver.md#getconnectionres)
- [getDbDatabase](BaseDriver.md#getdbdatabase)
- [getInfomationSchemas](BaseDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)
- [getName](BaseDriver.md#getname)
- [initBaseStatus](BaseDriver.md#initbasestatus)
- [isNeedsSsh](BaseDriver.md#isneedsssh)
- [isQuery](BaseDriver.md#isquery)
- [parseSchemaAndTableHints](BaseDriver.md#parseschemaandtablehints)
- [test](BaseDriver.md#test)

## Constructors

### constructor

• **new BaseDriver**\<`T`\>(`conRes`): [`BaseDriver`](BaseDriver.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`BaseDriver`](BaseDriver.md)\<`T`\>

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L48)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L43)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L45)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L196)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L152)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:195](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L195)

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

#### Defined in

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L218)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L171)

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

#### Defined in

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L94)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L56)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L197)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L210)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L53)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L60)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L64)

___

### isQuery

▸ **isQuery**(`sql`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L67)

___

### parseSchemaAndTableHints

▸ **parseSchemaAndTableHints**(`sql`): [`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

[`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Defined in

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L78)

___

### test

▸ **test**(`with_connect`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `with_connect` | `boolean` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:216](https://github.com/l-v-yonsama/db-drivers/blob/1594b8dd5f3e735b03ceeb918b048e752aefa3e4/src/drivers/BaseDriver.ts#L216)
