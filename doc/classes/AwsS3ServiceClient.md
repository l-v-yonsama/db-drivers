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

- [awsDriver](AwsS3ServiceClient.md#awsdriver)
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
- [getServiceName](AwsS3ServiceClient.md#getservicename)
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

• **new AwsS3ServiceClient**(`conRes`, `config`, `awsDriver`): [`AwsS3ServiceClient`](AwsS3ServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |
| `awsDriver` | [`AwsDriver`](AwsDriver.md) |

#### Returns

[`AwsS3ServiceClient`](AwsS3ServiceClient.md)

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L51)

## Properties

### awsDriver

• `Protected` **awsDriver**: [`AwsDriver`](AwsDriver.md)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[awsDriver](AwsServiceClient.md#awsdriver)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L14)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L13)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L8)

___

### s3Client

• **s3Client**: `S3Client`

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L49)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:461](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L461)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L20)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L59)

___

### createBucket

▸ **createBucket**(`«destructured»`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:369](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L369)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L62)

___

### getHeadObject

▸ **getHeadObject**(`«destructured»`): `Promise`\<`HeadObjectCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |
| › `key` | `string` |

#### Returns

`Promise`\<`HeadObjectCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:355](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L355)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:317](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L317)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:465](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L465)

___

### getSignedUrl

▸ **getSignedUrl**(`«destructured»`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |
| › `expireMinutes` | `number` |
| › `key` | `string` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:77](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L77)

___

### getValueByKey

▸ **getValueByKey**(`«destructured»`): `Promise`\<`GetObjectCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |
| › `key` | `string` |

#### Returns

`Promise`\<`GetObjectCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:384](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L384)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L58)

___

### listObjects

▸ **listObjects**(`«destructured»`): `Promise`\<[`DbKey`](DbKey.md)\<[`S3KeyParams`](../modules.md#s3keyparams)\>[]\>

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

`Promise`\<[`DbKey`](DbKey.md)\<[`S3KeyParams`](../modules.md#s3keyparams)\>[]\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L98)

___

### putObject

▸ **putObject**(`«destructured»`): `Promise`\<`void`\>

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

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:401](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L401)

___

### removeAllObjects

▸ **removeAllObjects**(`«destructured»`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:430](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L430)

___

### removeBucket

▸ **removeBucket**(`«destructured»`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bucket` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:425](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L425)

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

[src/drivers/aws/AwsS3ServiceClient.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L218)

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

[src/drivers/aws/AwsServiceClient.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsServiceClient.ts#L39)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/drivers/aws/AwsS3ServiceClient.ts#L71)
