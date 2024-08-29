[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsSQSServiceClient

# Class: AwsSQSServiceClient

## Hierarchy

- [`AwsServiceClient`](AwsServiceClient.md)

  ↳ **`AwsSQSServiceClient`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](AwsSQSServiceClient.md#constructor)

### Properties

- [conRes](AwsSQSServiceClient.md#conres)
- [config](AwsSQSServiceClient.md#config)
- [isConnected](AwsSQSServiceClient.md#isconnected)
- [sqsClient](AwsSQSServiceClient.md#sqsclient)

### Methods

- [closeSub](AwsSQSServiceClient.md#closesub)
- [connect](AwsSQSServiceClient.md#connect)
- [connectSub](AwsSQSServiceClient.md#connectsub)
- [createQueue](AwsSQSServiceClient.md#createqueue)
- [deleteMessage](AwsSQSServiceClient.md#deletemessage)
- [deleteQueue](AwsSQSServiceClient.md#deletequeue)
- [disconnect](AwsSQSServiceClient.md#disconnect)
- [getInfomationSchemas](AwsSQSServiceClient.md#getinfomationschemas)
- [getServiceName](AwsSQSServiceClient.md#getservicename)
- [initBaseStatus](AwsSQSServiceClient.md#initbasestatus)
- [purgeQueue](AwsSQSServiceClient.md#purgequeue)
- [receiveMessages](AwsSQSServiceClient.md#receivemessages)
- [scan](AwsSQSServiceClient.md#scan)
- [send](AwsSQSServiceClient.md#send)
- [test](AwsSQSServiceClient.md#test)
- [testSub](AwsSQSServiceClient.md#testsub)

## Constructors

### constructor

• **new AwsSQSServiceClient**(`conRes`, `config`): [`AwsSQSServiceClient`](AwsSQSServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Returns

[`AwsSQSServiceClient`](AwsSQSServiceClient.md)

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L49)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsServiceClient.ts#L8)

___

### sqsClient

• **sqsClient**: `SQSClient`

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L47)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:235](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L235)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L53)

___

### createQueue

▸ **createQueue**(`«destructured»`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `attributes?` | `Partial`\<`Record`\<`QueueAttributeName`, `string`\>\> |
| › `name` | `string` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:202](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L202)

___

### deleteMessage

▸ **deleteMessage**(`«destructured»`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `receiptHandle` | `string` |
| › `url` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L223)

___

### deleteQueue

▸ **deleteQueue**(`«destructured»`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `url` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L215)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsServiceClient.ts#L59)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:132](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L132)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:239](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L239)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsServiceClient.ts#L55)

___

### purgeQueue

▸ **purgeQueue**(`«destructured»`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `url` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L219)

___

### receiveMessages

▸ **receiveMessages**(`params`): `Promise`\<[`DbKey`](DbKey.md)\<[`SQSMessageParams`](../modules.md#sqsmessageparams)\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `ReceiveMessageCommandInput` |

#### Returns

`Promise`\<[`DbKey`](DbKey.md)\<[`SQSMessageParams`](../modules.md#sqsmessageparams)\>[]\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L64)

___

### scan

▸ **scan**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L85)

___

### send

▸ **send**(`input`): `Promise`\<`SendMessageResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `SendMessageCommandInput` |

#### Returns

`Promise`\<`SendMessageResult`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:128](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L128)

___

### test

▸ **test**(`with_connect?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[test](AwsServiceClient.md#test)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/3a2c4aab8d3d19025cd5b4f073e6081f3839b09a/src/drivers/aws/AwsSQSServiceClient.ts#L58)
