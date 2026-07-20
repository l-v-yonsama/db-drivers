[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsCloudwatchServiceClient

# Class: AwsCloudwatchServiceClient

## Hierarchy

- [`AwsServiceClient`](AwsServiceClient.md)

  ↳ **`AwsCloudwatchServiceClient`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)\<`CloudWatchScanParams`\>

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
- [kill](AwsCloudwatchServiceClient.md#kill)
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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L53)

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

### logClient

• **logClient**: `CloudWatchLogsClient`

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L49)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:432](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L432)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L61)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:339](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L339)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L94)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:379](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L379)

___

### getQueries

▸ **getQueries**(): `Promise`\<`QueryDefinition`[]\>

#### Returns

`Promise`\<`QueryDefinition`[]\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:409](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L409)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:438](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L438)

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

### kill

▸ **kill**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L78)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L133)

___

### scan

▸ **scan**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `CloudWatchScanParams` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L169)

___

### scanLogGroup

▸ **scanLogGroup**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`AwsCloudWatchLogGroupScanParams`](../modules.md#awscloudwatchloggroupscanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L177)

___

### scanLogStream

▸ **scanLogStream**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`AwsCloudWatchLogStreamScanParams`](../modules.md#awscloudwatchlogstreamscanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/aws/AwsCloudwatchServiceClient.ts:282](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L282)

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

[src/drivers/aws/AwsCloudwatchServiceClient.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/aws/AwsCloudwatchServiceClient.ts#L68)
