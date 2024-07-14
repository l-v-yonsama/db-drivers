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

• **new AwsS3ServiceClient**(`conRes`, `config`): [`AwsS3ServiceClient`](AwsS3ServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Returns

[`AwsS3ServiceClient`](AwsS3ServiceClient.md)

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L45)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsServiceClient.ts#L8)

___

### s3Client

• **s3Client**: `S3Client`

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L43)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:434](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L434)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L49)

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

[src/drivers/aws/AwsS3ServiceClient.ts:353](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L353)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsServiceClient.ts#L59)

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

[src/drivers/aws/AwsS3ServiceClient.ts:339](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L339)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:307](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L307)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:438](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L438)

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

[src/drivers/aws/AwsS3ServiceClient.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L67)

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

[src/drivers/aws/AwsS3ServiceClient.ts:357](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L357)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsServiceClient.ts#L55)

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

[src/drivers/aws/AwsS3ServiceClient.ts:88](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L88)

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

[src/drivers/aws/AwsS3ServiceClient.ts:374](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L374)

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

[src/drivers/aws/AwsS3ServiceClient.ts:403](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L403)

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

[src/drivers/aws/AwsS3ServiceClient.ts:398](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L398)

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

[src/drivers/aws/AwsS3ServiceClient.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L208)

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

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsS3ServiceClient.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/5477f1117668fd2bd16a5f134944299a9bc475af/src/drivers/aws/AwsS3ServiceClient.ts#L61)
