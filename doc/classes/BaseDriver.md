[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / BaseDriver

# Class: BaseDriver\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

## Hierarchy

- **`BaseDriver`**

  ↳ [`Auth0Driver`](Auth0Driver.md)

  ↳ [`KeycloakDriver`](KeycloakDriver.md)

  ↳ [`MemcacheDriver`](MemcacheDriver.md)

  ↳ [`MqttDriver`](MqttDriver.md)

  ↳ [`RedisDriver`](RedisDriver.md)

  ↳ [`BaseSQLSupportDriver`](BaseSQLSupportDriver.md)

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
- [getDbDatabases](BaseDriver.md#getdbdatabases)
- [getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)
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

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L56)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L52)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L51)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Defined in

[src/drivers/BaseDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L54)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L53)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L210)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L160)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L209)

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

[src/drivers/BaseDriver.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L236)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L185)

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

[src/drivers/BaseDriver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L102)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L64)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L226)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L230)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L211)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L224)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/BaseDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L61)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L68)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L72)

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

[src/drivers/BaseDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L75)

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

[src/drivers/BaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L86)

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

[src/drivers/BaseDriver.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/83d730c1a10bf80abc1c83bcd44065cf35fa40dc/src/drivers/BaseDriver.ts#L234)
