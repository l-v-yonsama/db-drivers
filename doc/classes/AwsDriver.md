[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsDriver

# Class: AwsDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`AwsDatabase`](AwsDatabase.md)\>

  ↳ **`AwsDriver`**

## Implements

- [`ISQLSupportDriver`](../interfaces/ISQLSupportDriver.md)

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

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/AwsDriver.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L45)

## Properties

### cloudwatchClient

• **cloudwatchClient**: [`AwsCloudwatchServiceClient`](AwsCloudwatchServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:41](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L41)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L48)

___

### dynamoClient

• **dynamoClient**: [`AwsDynamoServiceClient`](AwsDynamoServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:43](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L43)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L47)

___

### s3Client

• **s3Client**: [`AwsS3ServiceClient`](AwsS3ServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:42](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L42)

___

### sesClient

• **sesClient**: [`AwsSESServiceClient`](AwsSESServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:39](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L39)

___

### sqsClient

• **sqsClient**: [`AwsSQSServiceClient`](AwsSQSServiceClient.md)

#### Defined in

[src/drivers/AwsDriver.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L40)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L49)

## Methods

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/AwsDriver.ts:250](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L250)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/AwsDriver.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L129)

___

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](../interfaces/SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[count](../interfaces/ISQLSupportDriver.md#count)

#### Defined in

[src/drivers/AwsDriver.ts:309](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L309)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[countSql](../interfaces/ISQLSupportDriver.md#countsql)

#### Defined in

[src/drivers/AwsDriver.ts:298](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L298)

___

### createClientConfig

▸ **createClientConfig**(): [`ClientConfigType`](../modules.md#clientconfigtype)

#### Returns

[`ClientConfigType`](../modules.md#clientconfigtype)

#### Defined in

[src/drivers/AwsDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L49)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L181)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[explainAnalyzeSql](../interfaces/ISQLSupportDriver.md#explainanalyzesql)

#### Defined in

[src/drivers/AwsDriver.ts:294](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L294)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[explainSql](../interfaces/ISQLSupportDriver.md#explainsql)

#### Defined in

[src/drivers/AwsDriver.ts:290](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L290)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L98)

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

[src/drivers/AwsDriver.ts:88](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L88)

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

[src/drivers/AwsDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L64)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Returns

`Promise`\<[`AwsDatabase`](AwsDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/AwsDriver.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L188)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L57)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[getPositionalCharacter](../interfaces/ISQLSupportDriver.md#getpositionalcharacter)

#### Defined in

[src/drivers/AwsDriver.ts:271](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L271)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L64)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[isLimitAsTop](../interfaces/ISQLSupportDriver.md#islimitastop)

#### Defined in

[src/drivers/AwsDriver.ts:275](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L275)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L68)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[isPositionedParameterAvailable](../interfaces/ISQLSupportDriver.md#ispositionedparameteravailable)

#### Defined in

[src/drivers/AwsDriver.ts:267](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L267)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L71)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[isSchemaSpecificationSvailable](../interfaces/ISQLSupportDriver.md#isschemaspecificationsvailable)

#### Defined in

[src/drivers/AwsDriver.ts:279](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L279)

___

### kill

▸ **kill**(`sesssionOrPid?`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sesssionOrPid?` | `number` |

#### Returns

`Promise`\<`string`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[kill](../interfaces/ISQLSupportDriver.md#kill)

#### Defined in

[src/drivers/AwsDriver.ts:302](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L302)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/BaseDriver.ts#L82)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[ISQLSupportDriver](../interfaces/ISQLSupportDriver.md).[requestSql](../interfaces/ISQLSupportDriver.md#requestsql)

#### Defined in

[src/drivers/AwsDriver.ts:283](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L283)

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

[src/drivers/AwsDriver.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/7ccaf387da34e0289c38998e35f0b694ec876a36/src/drivers/AwsDriver.ts#L208)
