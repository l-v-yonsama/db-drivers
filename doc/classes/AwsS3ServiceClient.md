[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsS3ServiceClient

# Class: AwsS3ServiceClient

## Hierarchy

- [`AwsServiceClient`](AwsServiceClient.md)

  ↳ **`AwsS3ServiceClient`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](AwsS3ServiceClient.md#constructor)

### Properties

- [conRes](AwsS3ServiceClient.md#conres)
- [config](AwsS3ServiceClient.md#config)
- [isConnected](AwsS3ServiceClient.md#isconnected)
- [s3Client](AwsS3ServiceClient.md#s3client)

### Methods

- [closeSub](AwsS3ServiceClient.md#closesub)
- [connect](AwsS3ServiceClient.md#connect)
- [connectSub](AwsS3ServiceClient.md#connectsub)
- [createBucket](AwsS3ServiceClient.md#createbucket)
- [disconnect](AwsS3ServiceClient.md#disconnect)
- [getHeadObject](AwsS3ServiceClient.md#getheadobject)
- [getInfomationSchemas](AwsS3ServiceClient.md#getinfomationschemas)
- [getSignedUrl](AwsS3ServiceClient.md#getsignedurl)
- [getValueByKey](AwsS3ServiceClient.md#getvaluebykey)
- [initBaseStatus](AwsS3ServiceClient.md#initbasestatus)
- [listObjects](AwsS3ServiceClient.md#listobjects)
- [putObject](AwsS3ServiceClient.md#putobject)
- [removeAllObjects](AwsS3ServiceClient.md#removeallobjects)
- [removeBucket](AwsS3ServiceClient.md#removebucket)
- [scan](AwsS3ServiceClient.md#scan)
- [test](AwsS3ServiceClient.md#test)
- [testSub](AwsS3ServiceClient.md#testsub)

## Constructors

### constructor

• **new AwsS3ServiceClient**(`conRes`, `config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L47)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsServiceClient.ts#L8)

___

### s3Client

• **s3Client**: `S3Client`

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L45)

## Methods

### closeSub

▸ `Protected` **closeSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:437](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L437)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L51)

___

### createBucket

▸ **createBucket**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:356](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L356)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsServiceClient.ts#L58)

___

### getHeadObject

▸ **getHeadObject**(`«destructured»`): `Promise`<`HeadObjectCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |
| › `key` | `string` |

#### Returns

`Promise`<`HeadObjectCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:342](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L342)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:310](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L310)

___

### getSignedUrl

▸ **getSignedUrl**(`«destructured»`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |
| › `expireMinutes` | `number` |
| › `key` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L69)

___

### getValueByKey

▸ **getValueByKey**(`«destructured»`): `Promise`<`GetObjectCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |
| › `key` | `string` |

#### Returns

`Promise`<`GetObjectCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:360](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L360)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsServiceClient.ts#L54)

___

### listObjects

▸ **listObjects**(`«destructured»`): `Promise`<[`DbKey`](DbKey.md)<[`S3KeyParams`](../modules.md#s3keyparams)\>[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |
| › `endTime?` | `number` |
| › `limit` | `number` |
| › `prefix` | `string` |
| › `startTime?` | `number` |
| › `withHeader` | `boolean` |
| › `withValue?` | `Object` |
| › `withValue.limitSize` | `number` |

#### Returns

`Promise`<[`DbKey`](DbKey.md)<[`S3KeyParams`](../modules.md#s3keyparams)\>[]\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:90](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L90)

___

### putObject

▸ **putObject**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `body` | `StreamingBlobPayloadInputTypes` |
| › `bucket` | `string` |
| › `contentLength?` | `number` |
| › `contentType?` | `string` |
| › `key` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:377](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L377)

___

### removeAllObjects

▸ **removeAllObjects**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:406](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L406)

___

### removeBucket

▸ **removeBucket**(`«destructured»`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:401](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L401)

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

[src/drivers/aws/AwsS3ServiceClient.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L210)

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

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ `Protected` **testSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/b0e09fd/src/drivers/aws/AwsS3ServiceClient.ts#L63)
