[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / BaseDriver

# Class: BaseDriver<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

## Hierarchy

- **`BaseDriver`**

  ↳ [`AwsDriver`](AwsDriver.md)

  ↳ [`RedisDriver`](RedisDriver.md)

  ↳ [`RDSBaseDriver`](RDSBaseDriver.md)

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
- [connectToSshServer](BaseDriver.md#connecttosshserver)
- [createColumnResolver](BaseDriver.md#createcolumnresolver)
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

• **new BaseDriver**<`T`\>(`conRes`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Defined in

[src/drivers/BaseDriver.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L55)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L52)

## Methods

### closeSub

▸ `Abstract` **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L211)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L167)

___

### connectSub

▸ `Abstract` **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L210)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L141)

___

### createColumnResolver

▸ **createColumnResolver**(`sql?`): [`ColumnResolver`](../interfaces/ColumnResolver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql?` | `string` |

#### Returns

[`ColumnResolver`](../interfaces/ColumnResolver.md)

#### Defined in

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L85)

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

[src/drivers/BaseDriver.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L233)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L186)

___

### flow

▸ **flow**<`T`\>(`f`): `Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: [`BaseDriver`](BaseDriver.md)<`T`\>) => `Promise`<`T`\> |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`T`\>\>

#### Defined in

[src/drivers/BaseDriver.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L109)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L227)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<`T`[]\>

#### Returns

`Promise`<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemasSub

▸ `Abstract` **getInfomationSchemasSub**(): `Promise`<`T`[]\>

#### Returns

`Promise`<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L225)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L60)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L71)

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

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L74)

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

[src/drivers/BaseDriver.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L93)

___

### test

▸ `Abstract` **test**(`with_connect`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `with_connect` | `boolean` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:231](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/drivers/BaseDriver.ts#L231)
