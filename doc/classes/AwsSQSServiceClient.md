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

• **new AwsSQSServiceClient**(`conRes`, `config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L44)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsServiceClient.ts#L8)

___

### sqsClient

• **sqsClient**: `SQSClient`

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L42)

## Methods

### closeSub

▸ `Protected` **closeSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L227)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ `Protected` **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L48)

___

### createQueue

▸ **createQueue**(`«destructured»`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `attributes?` | [`AwsSQSAttributes`](../modules.md#awssqsattributes) |
| › `name` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:194](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L194)

___

### deleteMessage

▸ **deleteMessage**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `receiptHandle` | `string` |
| › `url` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L215)

___

### deleteQueue

▸ **deleteQueue**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `url` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L207)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsServiceClient.ts#L59)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L124)

___

### getServiceName

▸ `Protected` **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:231](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L231)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsServiceClient.ts#L55)

___

### purgeQueue

▸ **purgeQueue**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `url` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L211)

___

### receiveMessages

▸ **receiveMessages**(`params`): `Promise`<[`DbKey`](DbKey.md)<[`SQSMessageParams`](../modules.md#sqsmessageparams)\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `ReceiveMessageCommandInput` |

#### Returns

`Promise`<[`DbKey`](DbKey.md)<[`SQSMessageParams`](../modules.md#sqsmessageparams)\>[]\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L59)

___

### scan

▸ **scan**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:80](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L80)

___

### send

▸ **send**(`input`): `Promise`<`SendMessageResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `SendMessageCommandInput` |

#### Returns

`Promise`<`SendMessageResult`\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L120)

___

### test

▸ **test**(`with_connect?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[test](AwsServiceClient.md#test)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ `Protected` **testSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/6b82ef0/src/drivers/aws/AwsSQSServiceClient.ts#L53)
