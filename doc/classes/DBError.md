[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DBError

# Class: DBError

## Hierarchy

- `Error`

  ↳ **`DBError`**

## Table of contents

### Constructors

- [constructor](DBError.md#constructor)

### Properties

- [code](DBError.md#code)
- [errno](DBError.md#errno)
- [message](DBError.md#message)
- [name](DBError.md#name)
- [sqlMessage](DBError.md#sqlmessage)
- [sqlState](DBError.md#sqlstate)
- [stack](DBError.md#stack)
- [prepareStackTrace](DBError.md#preparestacktrace)
- [stackTraceLimit](DBError.md#stacktracelimit)

### Methods

- [captureStackTrace](DBError.md#capturestacktrace)

## Constructors

### constructor

• **new DBError**(`message`, `code`, `errno`, `sqlMessage`, `sqlState`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `any` |
| `code` | `any` |
| `errno` | `any` |
| `sqlMessage` | `any` |
| `sqlState` | `any` |

#### Overrides

Error.constructor

#### Defined in

[src/drivers/DBError.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/9964f1f/src/drivers/DBError.ts#L7)

## Properties

### code

• **code**: `any`

#### Defined in

[src/drivers/DBError.ts:2](https://github.com/l-v-yonsama/db-drivers/blob/9964f1f/src/drivers/DBError.ts#L2)

___

### errno

• **errno**: `any`

#### Defined in

[src/drivers/DBError.ts:3](https://github.com/l-v-yonsama/db-drivers/blob/9964f1f/src/drivers/DBError.ts#L3)

___

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1053

___

### sqlMessage

• **sqlMessage**: `any`

#### Defined in

[src/drivers/DBError.ts:4](https://github.com/l-v-yonsama/db-drivers/blob/9964f1f/src/drivers/DBError.ts#L4)

___

### sqlState

• **sqlState**: `any`

#### Defined in

[src/drivers/DBError.ts:5](https://github.com/l-v-yonsama/db-drivers/blob/9964f1f/src/drivers/DBError.ts#L5)

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:4
