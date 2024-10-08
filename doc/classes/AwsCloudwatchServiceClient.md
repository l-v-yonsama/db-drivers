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

- [awsDriver](AwsCloudwatchServiceClient.md#awsdriver)
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

• **new AwsCloudwatchServiceClient**(`conRes`, `config`, `awsDriver`): [`AwsCloudwatchServiceClient`](AwsCloudwatchServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |
| `awsDriver` | [`AwsDriver`](AwsDriver.md) |

#### Returns

[`AwsCloudwatchServiceClient`](AwsCloudwatchServiceClient.md)

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L44)

## Properties

### awsDriver

• `Protected` **awsDriver**: [`AwsDriver`](AwsDriver.md)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[awsDriver](AwsServiceClient.md#awsdriver)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L14)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L13)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L8)

___

### logClient

• **logClient**: `CloudWatchLogsClient`

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L42)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:318](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L318)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L20)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L52)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L62)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:240](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L240)

___

### getLogEvents

▸ **getLogEvents**(`params`): `Promise`\<`OutputLogEvent`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.limit?` | `number` |
| `params.logGroupName` | `string` |
| `params.logStreamName` | `string` |
| `params.startTime?` | `number` |

#### Returns

`Promise`\<`OutputLogEvent`[]\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L67)

___

### getLogStreams

▸ **getLogStreams**(`«destructured»`): `Promise`\<`LogStream`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `logGroupName` | `string` |

#### Returns

`Promise`\<`LogStream`[]\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L269)

___

### getQueries

▸ **getQueries**(): `Promise`\<`QueryDefinition`[]\>

#### Returns

`Promise`\<`QueryDefinition`[]\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:299](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L299)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:322](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L322)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L58)

___

### query

▸ **query**(`params`): `Promise`\<`GetQueryResultsCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `StartQueryCommandInput` |

#### Returns

`Promise`\<`GetQueryResultsCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L102)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:132](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L132)

___

### scanLogGroup

▸ **scanLogGroup**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L141)

___

### scanLogStream

▸ **scanLogStream**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:202](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L202)

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

[src/drivers/aws/AwsServiceClient.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsServiceClient.ts#L39)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/aws/AwsCloudwatchServiceClient.ts#L57)
