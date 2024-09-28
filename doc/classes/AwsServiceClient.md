[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsServiceClient

# Class: AwsServiceClient

## Hierarchy

- **`AwsServiceClient`**

  ↳ [`AwsCloudwatchServiceClient`](AwsCloudwatchServiceClient.md)

  ↳ [`AwsDynamoServiceClient`](AwsDynamoServiceClient.md)

  ↳ [`AwsS3ServiceClient`](AwsS3ServiceClient.md)

  ↳ [`AwsSESServiceClient`](AwsSESServiceClient.md)

  ↳ [`AwsSQSServiceClient`](AwsSQSServiceClient.md)

## Table of contents

### Constructors

- [constructor](AwsServiceClient.md#constructor)

### Properties

- [awsDriver](AwsServiceClient.md#awsdriver)
- [conRes](AwsServiceClient.md#conres)
- [config](AwsServiceClient.md#config)
- [isConnected](AwsServiceClient.md#isconnected)

### Methods

- [closeSub](AwsServiceClient.md#closesub)
- [connect](AwsServiceClient.md#connect)
- [connectSub](AwsServiceClient.md#connectsub)
- [disconnect](AwsServiceClient.md#disconnect)
- [getServiceName](AwsServiceClient.md#getservicename)
- [initBaseStatus](AwsServiceClient.md#initbasestatus)
- [test](AwsServiceClient.md#test)
- [testSub](AwsServiceClient.md#testsub)

## Constructors

### constructor

• **new AwsServiceClient**(`conRes`, `config`, `awsDriver`): [`AwsServiceClient`](AwsServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |
| `awsDriver` | [`AwsDriver`](AwsDriver.md) |

#### Returns

[`AwsServiceClient`](AwsServiceClient.md)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L11)

## Properties

### awsDriver

• `Protected` **awsDriver**: [`AwsDriver`](AwsDriver.md)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L14)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L13)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L8)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:88](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L88)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L20)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L86)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L62)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L89)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L58)

___

### test

▸ **test**(`with_connect?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L39)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:87](https://github.com/l-v-yonsama/db-drivers/blob/a26ba6ec975410448ea02495f2c33489c2e47d25/src/drivers/aws/AwsServiceClient.ts#L87)
