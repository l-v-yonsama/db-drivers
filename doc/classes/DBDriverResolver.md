[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DBDriverResolver

# Class: DBDriverResolver

## Table of contents

### Methods

- [closeAll](DBDriverResolver.md#closeall)
- [createDriver](DBDriverResolver.md#createdriver)
- [flowTransaction](DBDriverResolver.md#flowtransaction)
- [getDriverById](DBDriverResolver.md#getdriverbyid)
- [removeDriver](DBDriverResolver.md#removedriver)
- [workflow](DBDriverResolver.md#workflow)
- [getInstance](DBDriverResolver.md#getinstance)

## Methods

### closeAll

▸ **closeAll**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/DBDriverResolver.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/drivers/DBDriverResolver.ts#L117)

___

### createDriver

▸ **createDriver**<`T`\>(`setting`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`BaseDriver`](BaseDriver.md)<[`DbDatabase`](../modules.md#dbdatabase), `T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

`T`

#### Defined in

[src/drivers/DBDriverResolver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/drivers/DBDriverResolver.ts#L45)

___

### flowTransaction

▸ **flowTransaction**<`T`, `U`\>(`setting`, `f`, `options?`): `Promise`<[`GeneralResult`](GeneralResult.md)<`U`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RDSBaseDriver`](RDSBaseDriver.md)<`T`\> |
| `U` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `f` | (`driver`: `T`) => `Promise`<`U`\> |
| `options?` | `Object` |
| `options.transactionControlType` | [`TransactionControlType`](../modules.md#transactioncontroltype) |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`U`\>\>

#### Defined in

[src/drivers/DBDriverResolver.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/drivers/DBDriverResolver.ts#L100)

___

### getDriverById

▸ **getDriverById**(`connectionId`): [`BaseDriver`](BaseDriver.md)<[`DbDatabase`](../modules.md#dbdatabase)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `connectionId` | `string` |

#### Returns

[`BaseDriver`](BaseDriver.md)<[`DbDatabase`](../modules.md#dbdatabase)\>

#### Defined in

[src/drivers/DBDriverResolver.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/drivers/DBDriverResolver.ts#L36)

___

### removeDriver

▸ **removeDriver**(`driver`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `driver` | [`BaseDriver`](BaseDriver.md)<[`DbDatabase`](../modules.md#dbdatabase)\> |

#### Returns

`void`

#### Defined in

[src/drivers/DBDriverResolver.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/drivers/DBDriverResolver.ts#L113)

___

### workflow

▸ **workflow**<`T`, `U`\>(`setting`, `f`): `Promise`<[`GeneralResult`](GeneralResult.md)<`U`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`BaseDriver`](BaseDriver.md)<[`DbDatabase`](../modules.md#dbdatabase), `T`\> |
| `U` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `f` | (`driver`: `T`) => `Promise`<`U`\> |

#### Returns

`Promise`<[`GeneralResult`](GeneralResult.md)<`U`\>\>

#### Defined in

[src/drivers/DBDriverResolver.ts:90](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/drivers/DBDriverResolver.ts#L90)

___

### getInstance

▸ `Static` **getInstance**(): [`DBDriverResolver`](DBDriverResolver.md)

#### Returns

[`DBDriverResolver`](DBDriverResolver.md)

#### Defined in

[src/drivers/DBDriverResolver.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/drivers/DBDriverResolver.ts#L24)
