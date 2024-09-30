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

- [awsDriver](AwsDynamoServiceClient.md#awsdriver)
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

• **new AwsDynamoServiceClient**(`conRes`, `config`, `awsDriver`): [`AwsDynamoServiceClient`](AwsDynamoServiceClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |
| `awsDriver` | [`AwsDriver`](AwsDriver.md) |

#### Returns

[`AwsDynamoServiceClient`](AwsDynamoServiceClient.md)

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L71)

## Properties

### awsDriver

• `Protected` **awsDriver**: [`AwsDriver`](AwsDriver.md)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[awsDriver](AwsServiceClient.md#awsdriver)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L14)

___

### client

• **client**: `DynamoDBClient`

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L67)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:13](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L13)

___

### docClient

• **docClient**: `DynamoDBDocumentClient`

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L68)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L8)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:545](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L545)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L20)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L79)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L121)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L266)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:281](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L281)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L62)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:367](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L367)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L169)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:274](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L274)

___

### getServiceName

▸ **getServiceName**(): `string`

#### Returns

`string`

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[getServiceName](AwsServiceClient.md#getservicename)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:551](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L551)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L58)

___

### kill

▸ **kill**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:95](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L95)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:100](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L100)

___

### listTables

▸ **listTables**(): `Promise`\<[`TableDescWithExtraAttrs`](../modules.md#tabledescwithextraattrs)[]\>

#### Returns

`Promise`\<[`TableDescWithExtraAttrs`](../modules.md#tabledescwithextraattrs)[]\>

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:130](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L130)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:270](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L270)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:328](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L328)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:412](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L412)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L164)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:289](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L289)

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

[src/drivers/aws/AwsServiceClient.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsServiceClient.ts#L39)

___

### testSub

▸ **testSub**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsDynamoServiceClient.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L89)

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

[src/drivers/aws/AwsDynamoServiceClient.ts:285](https://github.com/l-v-yonsama/db-drivers/blob/bcd433a5c4453aa15ded63aa1500ddf16647d682/src/drivers/aws/AwsDynamoServiceClient.ts#L285)
