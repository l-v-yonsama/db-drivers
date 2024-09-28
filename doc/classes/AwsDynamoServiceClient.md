[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsDynamoServiceClient

# Class: AwsDynamoServiceClient

## Hierarchy

- [`AwsServiceClient`](AwsServiceClient.md)

  ↳ **`AwsDynamoServiceClient`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](AwsDynamoServiceClient.md#constructor)

### Properties

- [awsDatabase](AwsDynamoServiceClient.md#awsdatabase)
- [client](AwsDynamoServiceClient.md#client)
- [conRes](AwsDynamoServiceClient.md#conres)
- [config](AwsDynamoServiceClient.md#config)
- [docClient](AwsDynamoServiceClient.md#docclient)
- [isConnected](AwsDynamoServiceClient.md#isconnected)

### Methods

- [closeSub](AwsDynamoServiceClient.md#closesub)
- [connect](AwsDynamoServiceClient.md#connect)
- [connectSub](AwsDynamoServiceClient.md#connectsub)
- [count](AwsDynamoServiceClient.md#count)
- [createTable](AwsDynamoServiceClient.md#createtable)
- [deleteItem](AwsDynamoServiceClient.md#deleteitem)
- [disconnect](AwsDynamoServiceClient.md#disconnect)
- [executeStatement](AwsDynamoServiceClient.md#executestatement)
- [getInfomationSchemas](AwsDynamoServiceClient.md#getinfomationschemas)
- [getItem](AwsDynamoServiceClient.md#getitem)
- [getServiceName](AwsDynamoServiceClient.md#getservicename)
- [initBaseStatus](AwsDynamoServiceClient.md#initbasestatus)
- [kill](AwsDynamoServiceClient.md#kill)
- [listTableNames](AwsDynamoServiceClient.md#listtablenames)
- [listTables](AwsDynamoServiceClient.md#listtables)
- [putItem](AwsDynamoServiceClient.md#putitem)
- [queryItems](AwsDynamoServiceClient.md#queryitems)
- [requestPartiql](AwsDynamoServiceClient.md#requestpartiql)
- [scan](AwsDynamoServiceClient.md#scan)
- [scanItems](AwsDynamoServiceClient.md#scanitems)
- [test](AwsDynamoServiceClient.md#test)
- [testSub](AwsDynamoServiceClient.md#testsub)
- [updateItem](AwsDynamoServiceClient.md#updateitem)

## Constructors

### constructor

• **new AwsDynamoServiceClient**(`conRes`, `config`): [`AwsDynamoServiceClient`](AwsDynamoServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Returns

[`AwsDynamoServiceClient`](AwsDynamoServiceClient.md)

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L72)

## Properties

### awsDatabase

• **awsDatabase**: [`AwsDatabase`](AwsDatabase.md)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L69)

___

### client

• **client**: `DynamoDBClient`

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L67)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsServiceClient.ts#L11)

___

### docClient

• **docClient**: `DynamoDBDocumentClient`

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L68)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsServiceClient.ts#L8)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:490](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L490)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:76](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L76)

___

### count

▸ **count**(`tableName`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableName` | `string` |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L118)

___

### createTable

▸ **createTable**(`params`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `CreateTableCommandInput` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L248)

___

### deleteItem

▸ **deleteItem**(`params`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `DeleteCommandInput` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:263](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L263)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:59](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsServiceClient.ts#L59)

___

### executeStatement

▸ **executeStatement**(`params`): `Promise`\<\{ `CapacityUnits`: `number` ; `Count`: `number` ; `Items`: `Record`\<`string`, `any`\>[] ; `LastEvaluatedKey`: `Record`\<`string`, `any`\> ; `NextToken?`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `ExecuteStatementCommandInput` |

#### Returns

`Promise`\<\{ `CapacityUnits`: `number` ; `Count`: `number` ; `Items`: `Record`\<`string`, `any`\>[] ; `LastEvaluatedKey`: `Record`\<`string`, `any`\> ; `NextToken?`: `string`  }\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:349](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L349)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L166)

___

### getItem

▸ **getItem**(`params`): `Promise`\<`Record`\<`string`, `AttributeValue`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `GetCommandInput` |

#### Returns

`Promise`\<`Record`\<`string`, `AttributeValue`\>\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:256](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L256)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:496](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L496)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:55](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsServiceClient.ts#L55)

___

### kill

▸ **kill**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:92](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L92)

___

### listTableNames

▸ **listTableNames**(`limit?`): `Promise`\<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `limit?` | `number` |

#### Returns

`Promise`\<`string`[]\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:97](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L97)

___

### listTables

▸ **listTables**(): `Promise`\<[`TableDescWithExtraAttrs`](../modules.md#tabledescwithextraattrs)[]\>

#### Returns

`Promise`\<[`TableDescWithExtraAttrs`](../modules.md#tabledescwithextraattrs)[]\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:127](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L127)

___

### putItem

▸ **putItem**(`params`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `PutCommandInput` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L252)

___

### queryItems

▸ **queryItems**(`params`): `Promise`\<\{ `CapacityUnits`: `number` ; `Count`: `number` ; `Items`: `Record`\<`string`, `any`\>[] ; `LastEvaluatedKey`: `Record`\<`string`, `any`\>  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `QueryCommandInput` |

#### Returns

`Promise`\<\{ `CapacityUnits`: `number` ; `Count`: `number` ; `Items`: `Record`\<`string`, `any`\>[] ; `LastEvaluatedKey`: `Record`\<`string`, `any`\>  }\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:310](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L310)

___

### requestPartiql

▸ **requestPartiql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:394](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L394)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L161)

___

### scanItems

▸ **scanItems**(`params`): `Promise`\<\{ `CapacityUnits`: `number` ; `Count`: `number` ; `Items`: `Record`\<`string`, `any`\>[] ; `LastEvaluatedKey`: `Record`\<`string`, `any`\>  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `ScanCommandInput` |

#### Returns

`Promise`\<\{ `CapacityUnits`: `number` ; `Count`: `number` ; `Items`: `Record`\<`string`, `any`\>[] ; `LastEvaluatedKey`: `Record`\<`string`, `any`\>  }\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:271](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L271)

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

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L86)

___

### updateItem

▸ **updateItem**(`params`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `UpdateCommandInput` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:267](https://github.com/l-v-yonsama/db-drivers/blob/c2ce840d0c502a068b6a6ee92b0784d5bf1156b4/src/drivers/aws/AwsDynamoServiceClient.ts#L267)
