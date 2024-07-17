[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DBDriverResolver

# Class: DBDriverResolver

## Table of contents

### Methods

- [closeAll](DBDriverResolver.md#closeall)
- [createDriver](DBDriverResolver.md#createdriver)
- [createRDSDriver](DBDriverResolver.md#createrdsdriver)
- [flowTransaction](DBDriverResolver.md#flowtransaction)
- [getDriverById](DBDriverResolver.md#getdriverbyid)
- [removeDriver](DBDriverResolver.md#removedriver)
- [workflow](DBDriverResolver.md#workflow)
- [getInstance](DBDriverResolver.md#getinstance)

## Methods

### closeAll

▸ **closeAll**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/DBDriverResolver.ts:130](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L130)

___

### createDriver

▸ **createDriver**\<`T`\>(`setting`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`BaseDriver`](BaseDriver.md)\<[`DbDatabase`](../modules.md#dbdatabase), `T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

`T`

#### Defined in

[src/drivers/DBDriverResolver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L54)

___

### createRDSDriver

▸ **createRDSDriver**\<`T`\>(`setting`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RDSBaseDriver`](RDSBaseDriver.md)\<`T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

`T`

#### Defined in

[src/drivers/DBDriverResolver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L47)

___

### flowTransaction

▸ **flowTransaction**\<`T`, `U`\>(`setting`, `f`, `options?`): `Promise`\<[`GeneralResult`](GeneralResult.md)\<`U`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RDSBaseDriver`](RDSBaseDriver.md)\<`T`\> |
| `U` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `f` | (`driver`: `T`) => `Promise`\<`U`\> |
| `options?` | `Object` |
| `options.transactionControlType` | [`TransactionControlType`](../modules.md#transactioncontroltype) |

#### Returns

`Promise`\<[`GeneralResult`](GeneralResult.md)\<`U`\>\>

#### Defined in

[src/drivers/DBDriverResolver.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L113)

___

### getDriverById

▸ **getDriverById**(`connectionId`): [`BaseDriver`](BaseDriver.md)\<[`DbDatabase`](../modules.md#dbdatabase)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `connectionId` | `string` |

#### Returns

[`BaseDriver`](BaseDriver.md)\<[`DbDatabase`](../modules.md#dbdatabase)\>

#### Defined in

[src/drivers/DBDriverResolver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L38)

___

### removeDriver

▸ **removeDriver**(`driver`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `driver` | [`BaseDriver`](BaseDriver.md)\<[`DbDatabase`](../modules.md#dbdatabase)\> |

#### Returns

`void`

#### Defined in

[src/drivers/DBDriverResolver.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L126)

___

### workflow

▸ **workflow**\<`T`, `U`\>(`setting`, `f`): `Promise`\<[`GeneralResult`](GeneralResult.md)\<`U`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`BaseDriver`](BaseDriver.md)\<[`DbDatabase`](../modules.md#dbdatabase), `T`\> |
| `U` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `f` | (`driver`: `T`) => `Promise`\<`U`\> |

#### Returns

`Promise`\<[`GeneralResult`](GeneralResult.md)\<`U`\>\>

#### Defined in

[src/drivers/DBDriverResolver.ts:103](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L103)

___

### getInstance

▸ **getInstance**(): [`DBDriverResolver`](DBDriverResolver.md)

#### Returns

[`DBDriverResolver`](DBDriverResolver.md)

#### Defined in

[src/drivers/DBDriverResolver.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/DBDriverResolver.ts#L26)
