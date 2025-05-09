[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / GeneralResult

# Class: GeneralResult\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Constructors

- [constructor](GeneralResult.md#constructor)

### Properties

- [message](GeneralResult.md#message)
- [ok](GeneralResult.md#ok)
- [result](GeneralResult.md#result)

## Constructors

### constructor

• **new GeneralResult**\<`T`\>(`ok?`, `message?`): [`GeneralResult`](GeneralResult.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `ok` | `boolean` | `true` |
| `message` | `string` | `''` |

#### Returns

[`GeneralResult`](GeneralResult.md)\<`T`\>

#### Defined in

[src/types/drivers/GeneralResult.ts:6](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/types/drivers/GeneralResult.ts#L6)

## Properties

### message

• **message**: `string` = `''`

#### Defined in

[src/types/drivers/GeneralResult.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/types/drivers/GeneralResult.ts#L3)

___

### ok

• **ok**: `boolean` = `true`

#### Defined in

[src/types/drivers/GeneralResult.ts:2](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/types/drivers/GeneralResult.ts#L2)

___

### result

• `Optional` **result**: `T`

#### Defined in

[src/types/drivers/GeneralResult.ts:4](https://github.com/l-v-yonsama/db-drivers/blob/5df43d2db7b9c9448c5627604a5ca07089235197/src/types/drivers/GeneralResult.ts#L4)
