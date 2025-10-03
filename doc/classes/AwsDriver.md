[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsDriver

# Class: AwsDriver

## Hierarchy

- [`BaseSQLSupportDriver`](BaseSQLSupportDriver.md)\<[`AwsDatabase`](AwsDatabase.md)\>

  ↳ **`AwsDriver`**

## Table of contents

### Constructors

- [constructor](AwsDriver.md#constructor)

### Properties

- [cloudwatchClient](AwsDriver.md#cloudwatchclient)
- [conRes](AwsDriver.md#conres)
- [dynamoClient](AwsDriver.md#dynamoclient)
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
- [count](AwsDriver.md#count)
- [countSql](AwsDriver.md#countsql)
- [createClientConfig](AwsDriver.md#createclientconfig)
- [createDBError](AwsDriver.md#createdberror)
- [disconnect](AwsDriver.md#disconnect)
- [explainAnalyzeSql](AwsDriver.md#explainanalyzesql)
- [explainSql](AwsDriver.md#explainsql)
- [flow](AwsDriver.md#flow)
- [getClientByResourceType](AwsDriver.md#getclientbyresourcetype)
- [getClientByServiceType](AwsDriver.md#getclientbyservicetype)
- [getConnectionRes](AwsDriver.md#getconnectionres)
- [getDbDatabases](AwsDriver.md#getdbdatabases)
- [getFirstDbDatabase](AwsDriver.md#getfirstdbdatabase)
- [getInfomationSchemas](AwsDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](AwsDriver.md#getinfomationschemassub)
- [getName](AwsDriver.md#getname)
- [getPositionalCharacter](AwsDriver.md#getpositionalcharacter)
- [getSqlLang](AwsDriver.md#getsqllang)
- [initBaseStatus](AwsDriver.md#initbasestatus)
- [isLimitAsTop](AwsDriver.md#islimitastop)
- [isNeedsSsh](AwsDriver.md#isneedsssh)
- [isPositionedParameterAvailable](AwsDriver.md#ispositionedparameteravailable)
- [isQuery](AwsDriver.md#isquery)
- [isSchemaSpecificationSvailable](AwsDriver.md#isschemaspecificationsvailable)
- [kill](AwsDriver.md#kill)
- [parseSchemaAndTableHints](AwsDriver.md#parseschemaandtablehints)
- [requestSql](AwsDriver.md#requestsql)
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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[constructor](BaseSQLSupportDriver.md#constructor)

#### Defined in

[src/drivers/AwsDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L42)

## Properties

### cloudwatchClient

• **cloudwatchClient**: [`AwsCloudwatchServiceClient`](AwsCloudwatchServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:38](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L38)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[conRes](BaseSQLSupportDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L48)

___

### dynamoClient

• **dynamoClient**: [`AwsDynamoServiceClient`](AwsDynamoServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L40)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isConnected](BaseSQLSupportDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L47)

___

### s3Client

• **s3Client**: [`AwsS3ServiceClient`](AwsS3ServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L39)

___

### sesClient

• **sesClient**: [`AwsSESServiceClient`](AwsSESServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L36)

___

### sqsClient

• **sqsClient**: [`AwsSQSServiceClient`](AwsSQSServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:37](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L37)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[sshLocalPort](BaseSQLSupportDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[sshServer](BaseSQLSupportDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L49)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[closeSub](BaseSQLSupportDriver.md#closesub)

#### Defined in

[src/drivers/AwsDriver.ts:275](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L275)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[connect](BaseSQLSupportDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[connectSub](BaseSQLSupportDriver.md#connectsub)

#### Defined in

[src/drivers/AwsDriver.ts:130](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L130)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[count](BaseSQLSupportDriver.md#count)

#### Defined in

[src/drivers/AwsDriver.ts:340](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L340)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[countSql](BaseSQLSupportDriver.md#countsql)

#### Defined in

[src/drivers/AwsDriver.ts:323](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L323)

___

### createClientConfig

▸ **createClientConfig**(): [`ClientConfigType`](../modules.md#clientconfigtype)

#### Returns

[`ClientConfigType`](../modules.md#clientconfigtype)

#### Defined in

[src/drivers/AwsDriver.ts:46](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L46)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[createDBError](BaseSQLSupportDriver.md#createdberror)

#### Defined in

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[disconnect](BaseSQLSupportDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L181)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[explainAnalyzeSql](BaseSQLSupportDriver.md#explainanalyzesql)

#### Defined in

[src/drivers/AwsDriver.ts:319](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L319)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[explainSql](BaseSQLSupportDriver.md#explainsql)

#### Defined in

[src/drivers/AwsDriver.ts:315](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L315)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[flow](BaseSQLSupportDriver.md#flow)

#### Defined in

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L98)

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

[src/drivers/AwsDriver.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L89)

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

[src/drivers/AwsDriver.ts:65](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L65)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getConnectionRes](BaseSQLSupportDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getDbDatabases](BaseSQLSupportDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getFirstDbDatabase](BaseSQLSupportDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getInfomationSchemas](BaseSQLSupportDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getInfomationSchemasSub](BaseSQLSupportDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/AwsDriver.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L212)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getName](BaseSQLSupportDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getPositionalCharacter](BaseSQLSupportDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/AwsDriver.ts:296](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L296)

___

### getSqlLang

▸ **getSqlLang**(): [`SQLLang`](../modules.md#sqllang)

#### Returns

[`SQLLang`](../modules.md#sqllang)

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[getSqlLang](BaseSQLSupportDriver.md#getsqllang)

#### Defined in

[src/drivers/AwsDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L61)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[initBaseStatus](BaseSQLSupportDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isLimitAsTop](BaseSQLSupportDriver.md#islimitastop)

#### Defined in

[src/drivers/AwsDriver.ts:300](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L300)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isNeedsSsh](BaseSQLSupportDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isPositionedParameterAvailable](BaseSQLSupportDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/AwsDriver.ts:292](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L292)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isQuery](BaseSQLSupportDriver.md#isquery)

#### Defined in

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[isSchemaSpecificationSvailable](BaseSQLSupportDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/AwsDriver.ts:304](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L304)

___

### kill

▸ **kill**(`sesssionOrPid?`): `Promise`\<`string`\>

Terminate (kill) a specific session.
If sesssionOrPid is not specified, cancel the running request.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sesssionOrPid?` | `number` |

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[kill](BaseSQLSupportDriver.md#kill)

#### Defined in

[src/drivers/AwsDriver.ts:327](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L327)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[parseSchemaAndTableHints](BaseSQLSupportDriver.md#parseschemaandtablehints)

#### Defined in

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/BaseDriver.ts#L82)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Overrides

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[requestSql](BaseSQLSupportDriver.md#requestsql)

#### Defined in

[src/drivers/AwsDriver.ts:308](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L308)

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

[BaseSQLSupportDriver](BaseSQLSupportDriver.md).[test](BaseSQLSupportDriver.md#test)

#### Defined in

[src/drivers/AwsDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/drivers/AwsDriver.ts#L232)
