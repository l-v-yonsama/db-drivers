[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DBDriverResolver

# Class: DBDriverResolver

## Table of contents

### Methods

- [closeAll](DBDriverResolver.md#closeall)
- [createDriver](DBDriverResolver.md#createdriver)
- [createRDSDriver](DBDriverResolver.md#createrdsdriver)
- [createSQLSupportDriver](DBDriverResolver.md#createsqlsupportdriver)
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

[src/drivers/DBDriverResolver.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L151)

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

[src/drivers/DBDriverResolver.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L69)

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

[src/drivers/DBDriverResolver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L50)

___

### createSQLSupportDriver

▸ **createSQLSupportDriver**\<`T`\>(`setting`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`BaseSQLSupportDriver`](BaseSQLSupportDriver.md)\<[`DbDatabase`](../modules.md#dbdatabase), `T`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `setting` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

`T`

#### Defined in

[src/drivers/DBDriverResolver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L57)

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

[src/drivers/DBDriverResolver.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L134)

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

[src/drivers/DBDriverResolver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L41)

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

[src/drivers/DBDriverResolver.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L147)

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

[src/drivers/DBDriverResolver.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L124)

___

### getInstance

▸ **getInstance**(): [`DBDriverResolver`](DBDriverResolver.md)

#### Returns

[`DBDriverResolver`](DBDriverResolver.md)

#### Defined in

[src/drivers/DBDriverResolver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/DBDriverResolver.ts#L29)
