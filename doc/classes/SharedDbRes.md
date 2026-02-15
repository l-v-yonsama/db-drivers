[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / SharedDbRes

# Class: SharedDbRes

## Table of contents

### Constructors

- [constructor](SharedDbRes.md#constructor)

### Properties

- [instance](SharedDbRes.md#instance)

### Methods

- [get](SharedDbRes.md#get)
- [getFirst](SharedDbRes.md#getfirst)
- [remove](SharedDbRes.md#remove)
- [set](SharedDbRes.md#set)
- [getInstance](SharedDbRes.md#getinstance)

## Constructors

### constructor

• **new SharedDbRes**(): [`SharedDbRes`](SharedDbRes.md)

#### Returns

[`SharedDbRes`](SharedDbRes.md)

## Properties

### instance

▪ `Static` **instance**: [`SharedDbRes`](SharedDbRes.md)

#### Defined in

[src/drivers/BaseDriver.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L22)

## Methods

### get

▸ **get**(`conName`): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `conName` | `string` |

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Defined in

[src/drivers/BaseDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L33)

___

### getFirst

▸ **getFirst**(`conName`): [`DbDatabase`](../modules.md#dbdatabase)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conName` | `string` |

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L37)

___

### remove

▸ **remove**(`conName`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `conName` | `string` |

#### Returns

`void`

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L45)

___

### set

▸ **set**(`conName`, `res`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `conName` | `string` |
| `res` | [`DbDatabase`](../modules.md#dbdatabase)[] |

#### Returns

`void`

#### Defined in

[src/drivers/BaseDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L41)

___

### getInstance

▸ **getInstance**(): [`SharedDbRes`](SharedDbRes.md)

#### Returns

[`SharedDbRes`](SharedDbRes.md)

#### Defined in

[src/drivers/BaseDriver.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/b68a68006895170bff21f072c074618fef160291/src/drivers/BaseDriver.ts#L25)
