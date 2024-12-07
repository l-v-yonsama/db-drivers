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

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L52)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L49)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L206)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L205)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L181)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L98)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L220)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L57)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L64)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L68)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L71)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L82)

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

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/62ab446334a28c22e801b7fc6c92525995d168ef/src/drivers/BaseDriver.ts#L230)
