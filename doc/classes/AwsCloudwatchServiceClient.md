[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsCloudwatchServiceClient

# Class: AwsCloudwatchServiceClient

## Hierarchy

- [`AwsServiceClient`](AwsServiceClient.md)

  ↳ **`AwsCloudwatchServiceClient`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](AwsCloudwatchServiceClient.md#constructor)

### Properties

- [conRes](AwsCloudwatchServiceClient.md#conres)
- [config](AwsCloudwatchServiceClient.md#config)
- [isConnected](AwsCloudwatchServiceClient.md#isconnected)
- [logClient](AwsCloudwatchServiceClient.md#logclient)

### Methods

- [closeSub](AwsCloudwatchServiceClient.md#closesub)
- [connect](AwsCloudwatchServiceClient.md#connect)
- [connectSub](AwsCloudwatchServiceClient.md#connectsub)
- [disconnect](AwsCloudwatchServiceClient.md#disconnect)
- [getInfomationSchemas](AwsCloudwatchServiceClient.md#getinfomationschemas)
- [getLogEvents](AwsCloudwatchServiceClient.md#getlogevents)
- [getLogStreams](AwsCloudwatchServiceClient.md#getlogstreams)
- [getQueries](AwsCloudwatchServiceClient.md#getqueries)
- [getServiceName](AwsCloudwatchServiceClient.md#getservicename)
- [initBaseStatus](AwsCloudwatchServiceClient.md#initbasestatus)
- [query](AwsCloudwatchServiceClient.md#query)
- [scan](AwsCloudwatchServiceClient.md#scan)
- [scanLogGroup](AwsCloudwatchServiceClient.md#scanloggroup)
- [scanLogStream](AwsCloudwatchServiceClient.md#scanlogstream)
- [test](AwsCloudwatchServiceClient.md#test)
- [testSub](AwsCloudwatchServiceClient.md#testsub)

## Constructors

### constructor

• **new AwsCloudwatchServiceClient**(`conRes`, `config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L44)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsServiceClient.ts#L8)

___

### logClient

• **logClient**: `CloudWatchLogsClient`

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L42)

## Methods

### closeSub

▸ `Protected` **closeSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:312](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L312)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L48)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsServiceClient.ts#L59)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L234)

___

### getLogEvents

▸ **getLogEvents**(`params`): `Promise`<`OutputLogEvent`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.limit?` | `number` |
| `params.logGroupName` | `string` |
| `params.logStreamName` | `string` |
| `params.startTime?` | `number` |

#### Returns

`Promise`<`OutputLogEvent`[]\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L63)

___

### getLogStreams

▸ **getLogStreams**(`«destructured»`): `Promise`<`LogStream`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `logGroupName` | `string` |

#### Returns

`Promise`<`LogStream`[]\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L263)

___

### getQueries

▸ **getQueries**(): `Promise`<`QueryDefinition`[]\>

#### Returns

`Promise`<`QueryDefinition`[]\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:293](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L293)

___

### getServiceName

▸ `Protected` **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:316](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L316)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsServiceClient.ts#L55)

___

### query

▸ **query**(`params`): `Promise`<`GetQueryResultsCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `StartQueryCommandInput` |

#### Returns

`Promise`<`GetQueryResultsCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L98)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:128](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L128)

___

### scanLogGroup

▸ **scanLogGroup**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:137](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L137)

___

### scanLogStream

▸ **scanLogStream**(`params`): `Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`<[`ResultSetData`](../modules.md#resultsetdata)\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L196)

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

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ `Protected` **testSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/eb4b8bc/src/drivers/aws/AwsCloudwatchServiceClient.ts#L53)
