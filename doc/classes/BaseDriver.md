[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / BaseDriver

# Class: BaseDriver<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbDatabase`](../modules.md#dbdatabase) = [`DbDatabase`](../modules.md#dbdatabase) |

## Hierarchy

- **`BaseDriver`**

  ↳ [`Auth0Driver`](Auth0Driver.md)

  ↳ [`AwsDriver`](AwsDriver.md)

  ↳ [`RedisDriver`](RedisDriver.md)

  ↳ [`KeycloakDriver`](KeycloakDriver.md)

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

[src/drivers/BaseDriver.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L55)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L51)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L50)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L53)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L52)

## Methods

### closeSub

▸ `Abstract` **closeSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L203)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:159](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L159)

___

### connectSub

▸ `Abstract` **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:202](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L202)

___

### connectToSshServer

▸ **connectToSshServer**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L133)

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

[src/drivers/BaseDriver.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L225)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/BaseDriver.ts:178](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L178)

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

[src/drivers/BaseDriver.ts:101](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L101)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/BaseDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L63)

___

### getDbDatabase

▸ `Protected` **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L219)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<`T`[]\>

#### Returns

`Promise`<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:204](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L204)

___

### getInfomationSchemasSub

▸ `Abstract` **getInfomationSchemasSub**(): `Promise`<`T`[]\>

#### Returns

`Promise`<`T`[]\>

#### Defined in

[src/drivers/BaseDriver.ts:217](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L217)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L60)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L67)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L71)

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

[src/drivers/BaseDriver.ts:74](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L74)

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

[src/drivers/BaseDriver.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L85)

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

[src/drivers/BaseDriver.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/drivers/BaseDriver.ts#L223)
