[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsServiceClient

# Class: AwsServiceClient

## Hierarchy

- **`AwsServiceClient`**

  ↳ [`AwsCloudwatchServiceClient`](AwsCloudwatchServiceClient.md)

  ↳ [`AwsS3ServiceClient`](AwsS3ServiceClient.md)

  ↳ [`AwsSESServiceClient`](AwsSESServiceClient.md)

  ↳ [`AwsSQSServiceClient`](AwsSQSServiceClient.md)

## Table of contents

### Constructors

- [constructor](AwsServiceClient.md#constructor)

### Properties

- [conRes](AwsServiceClient.md#conres)
- [config](AwsServiceClient.md#config)
- [isConnected](AwsServiceClient.md#isconnected)

### Methods

- [closeSub](AwsServiceClient.md#closesub)
- [connect](AwsServiceClient.md#connect)
- [connectSub](AwsServiceClient.md#connectsub)
- [disconnect](AwsServiceClient.md#disconnect)
- [initBaseStatus](AwsServiceClient.md#initbasestatus)
- [test](AwsServiceClient.md#test)
- [testSub](AwsServiceClient.md#testsub)

## Constructors

### constructor

• **new AwsServiceClient**(`conRes`, `config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L11)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L8)

## Methods

### closeSub

▸ `Protected` `Abstract` **closeSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:84](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L84)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ `Protected` `Abstract` **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L82)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L58)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L54)

___

### test

▸ **test**(`with_connect?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ `Protected` `Abstract` **testSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/48746db/src/drivers/aws/AwsServiceClient.ts#L83)