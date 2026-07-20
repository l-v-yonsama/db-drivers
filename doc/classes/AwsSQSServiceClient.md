[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsSQSServiceClient

# Class: AwsSQSServiceClient

## Hierarchy

- [`AwsServiceClient`](AwsServiceClient.md)

  ↳ **`AwsSQSServiceClient`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)\<[`AwsSQSScanParams`](../modules.md#awssqsscanparams)\>

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

[src/drivers/aws/AwsSQSServiceClient.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L52)

## Properties

### awsDriver

• `Protected` **awsDriver**: [`AwsDriver`](AwsDriver.md)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[awsDriver](AwsServiceClient.md#awsdriver)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L14)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L13)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L8)

___

### sqsClient

• **sqsClient**: `SQSClient`

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L50)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:244](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L244)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L20)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L60)

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

[src/drivers/aws/AwsSQSServiceClient.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L211)

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

[src/drivers/aws/AwsSQSServiceClient.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L232)

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

[src/drivers/aws/AwsSQSServiceClient.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L224)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L62)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L141)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L248)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L58)

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

[src/drivers/aws/AwsSQSServiceClient.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L228)

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

[src/drivers/aws/AwsSQSServiceClient.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L71)

___

### scan

▸ **scan**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`AwsSQSScanParams`](../modules.md#awssqsscanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:92](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L92)

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

[src/drivers/aws/AwsSQSServiceClient.ts:137](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L137)

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

[src/drivers/aws/AwsServiceClient.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsServiceClient.ts#L39)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsSQSServiceClient.ts:65](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsSQSServiceClient.ts#L65)
