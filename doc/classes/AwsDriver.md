[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsDriver

# Class: AwsDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`AwsDatabase`](AwsDatabase.md)\>

  ↳ **`AwsDriver`**

## Table of contents

### Constructors

- [constructor](AwsDriver.md#constructor)

### Properties

- [cloudwatchClient](AwsDriver.md#cloudwatchclient)
- [conRes](AwsDriver.md#conres)
- [isConnected](AwsDriver.md#isconnected)
- [s3Client](AwsDriver.md#s3client)
- [sesClient](AwsDriver.md#sesclient)
- [sqsClient](AwsDriver.md#sqsclient)
- [sshLocalPort](AwsDriver.md#sshlocalport)
- [sshServer](AwsDriver.md#sshserver)

### Methods

- [closeSub](AwsDriver.md#closesub)
- [connect](AwsDriver.md#connect)
- [connectSub](AwsDriver.md#connectsub)
- [createClientConfig](AwsDriver.md#createclientconfig)
- [createDBError](AwsDriver.md#createdberror)
- [disconnect](AwsDriver.md#disconnect)
- [flow](AwsDriver.md#flow)
- [getClientByResourceType](AwsDriver.md#getclientbyresourcetype)
- [getClientByServiceType](AwsDriver.md#getclientbyservicetype)
- [getConnectionRes](AwsDriver.md#getconnectionres)
- [getDbDatabase](AwsDriver.md#getdbdatabase)
- [getInfomationSchemas](AwsDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](AwsDriver.md#getinfomationschemassub)
- [getName](AwsDriver.md#getname)
- [initBaseStatus](AwsDriver.md#initbasestatus)
- [isNeedsSsh](AwsDriver.md#isneedsssh)
- [isQuery](AwsDriver.md#isquery)
- [parseSchemaAndTableHints](AwsDriver.md#parseschemaandtablehints)
- [test](AwsDriver.md#test)

## Constructors

### constructor

• **new AwsDriver**(`conRes`): [`AwsDriver`](AwsDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`AwsDriver`](AwsDriver.md)

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/AwsDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L37)

## Properties

### cloudwatchClient

• **cloudwatchClient**: [`AwsCloudwatchServiceClient`](AwsCloudwatchServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:34](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L34)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:44](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L44)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L43)

___

### s3Client

• **s3Client**: [`AwsS3ServiceClient`](AwsS3ServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:35](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L35)

___

### sesClient

• **sesClient**: [`AwsSESServiceClient`](AwsSESServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L32)

___

### sqsClient

• **sqsClient**: [`AwsSQSServiceClient`](AwsSQSServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:33](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L33)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L46)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L45)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/AwsDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L218)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L152)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/AwsDriver.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L115)

___

### createClientConfig

▸ **createClientConfig**(): [`ClientConfigType`](../modules.md#clientconfigtype)

#### Returns

[`ClientConfigType`](../modules.md#clientconfigtype)

#### Defined in

[src/drivers/AwsDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L41)

___

### createDBError

▸ **createDBError**(`message`, `sourceError`): [`DBError`](DBError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `sourceError` | `any` |

#### Returns

[`DBError`](DBError.md)

#### Inherited from

[BaseDriver](BaseDriver.md).[createDBError](BaseDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L218)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L171)

___

### flow

▸ **flow**\<`T`\>(`f`): `Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `f` | (`driver`: `this`) => `Promise`\<`T`\> |

#### Returns

`Promise`\<[`GeneralResult`](GeneralResult.md)\<`T`\>\>

#### Inherited from

[BaseDriver](BaseDriver.md).[flow](BaseDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L94)

___

### getClientByResourceType

▸ **getClientByResourceType**\<`T`\>(`resourceType`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`AwsServiceClient`](AwsServiceClient.md)\<`T`\> = [`AwsServiceClient`](AwsServiceClient.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceType` | [`ResourceType`](../modules.md#resourcetype) |

#### Returns

`T`

#### Defined in

[src/drivers/AwsDriver.ts:77](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L77)

___

### getClientByServiceType

▸ **getClientByServiceType**\<`T`\>(`serviceType`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`AwsServiceClient`](AwsServiceClient.md)\<`T`\> = [`AwsServiceClient`](AwsServiceClient.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceType` | [`AwsServiceType`](../modules.md#awsservicetype) |

#### Returns

`T`

#### Defined in

[src/drivers/AwsDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L56)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L56)

___

### getDbDatabase

▸ **getDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabase](BaseDriver.md#getdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L212)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L197)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/AwsDriver.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L164)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L53)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L60)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L64)

___

### isQuery

▸ **isQuery**(`sql`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isQuery](BaseDriver.md#isquery)

#### Defined in

[src/drivers/BaseDriver.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L67)

___

### parseSchemaAndTableHints

▸ **parseSchemaAndTableHints**(`sql`): [`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `sql` | `string` |

#### Returns

[`SchemaAndTableHints`](../interfaces/SchemaAndTableHints.md)

#### Inherited from

[BaseDriver](BaseDriver.md).[parseSchemaAndTableHints](BaseDriver.md#parseschemaandtablehints)

#### Defined in

[src/drivers/BaseDriver.ts:78](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/BaseDriver.ts#L78)

___

### test

▸ **test**(`with_connect?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[test](BaseDriver.md#test)

#### Defined in

[src/drivers/AwsDriver.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/drivers/AwsDriver.ts#L183)
