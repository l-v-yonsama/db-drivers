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

- [awsDriver](AwsSQSServiceClient.md#awsdriver)
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

• **new AwsSQSServiceClient**(`conRes`, `config`, `awsDriver`): [`AwsSQSServiceClient`](AwsSQSServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |
| `awsDriver` | [`AwsDriver`](AwsDriver.md) |

#### Returns

[`AwsSQSServiceClient`](AwsSQSServiceClient.md)

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L49)

## Properties

### awsDriver

• `Protected` **awsDriver**: [`AwsDriver`](AwsDriver.md)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[awsDriver](AwsServiceClient.md#awsdriver)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L14)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L13)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L8)

___

### sqsClient

• **sqsClient**: `SQSClient`

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L47)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:239](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L239)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L20)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L57)

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

[src/drivers/aws/AwsSQSServiceClient.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L206)

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

[src/drivers/aws/AwsSQSServiceClient.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L227)

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

[src/drivers/aws/AwsSQSServiceClient.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L219)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L62)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:136](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L136)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:243](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L243)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L58)

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

[src/drivers/aws/AwsSQSServiceClient.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L223)

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

[src/drivers/aws/AwsSQSServiceClient.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L68)

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

[src/drivers/aws/AwsSQSServiceClient.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L89)

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

[src/drivers/aws/AwsSQSServiceClient.ts:132](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L132)

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

[src/drivers/aws/AwsServiceClient.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsServiceClient.ts#L39)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/b37d902f22184a4ab36e6d48ee1b1991de8127d4/src/drivers/aws/AwsSQSServiceClient.ts#L62)
