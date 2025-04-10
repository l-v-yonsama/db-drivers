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

[src/drivers/BaseDriver.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/775e6e4a024f37b351a31ffc9245bc432e33fe0e/src/drivers/BaseDriver.ts#L18)

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

[src/drivers/BaseDriver.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/775e6e4a024f37b351a31ffc9245bc432e33fe0e/src/drivers/BaseDriver.ts#L29)

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

[src/drivers/BaseDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/775e6e4a024f37b351a31ffc9245bc432e33fe0e/src/drivers/BaseDriver.ts#L33)

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

[src/drivers/BaseDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/775e6e4a024f37b351a31ffc9245bc432e33fe0e/src/drivers/BaseDriver.ts#L41)

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

[src/drivers/BaseDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/775e6e4a024f37b351a31ffc9245bc432e33fe0e/src/drivers/BaseDriver.ts#L37)

___

### getInstance

▸ **getInstance**(): [`SharedDbRes`](SharedDbRes.md)

#### Returns

[`SharedDbRes`](SharedDbRes.md)

#### Defined in

[src/drivers/BaseDriver.ts:21](https://github.com/l-v-yonsama/db-drivers/blob/775e6e4a024f37b351a31ffc9245bc432e33fe0e/src/drivers/BaseDriver.ts#L21)
