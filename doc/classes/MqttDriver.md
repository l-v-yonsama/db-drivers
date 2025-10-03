[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / MqttDriver

# Class: MqttDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`MqttDatabase`](MqttDatabase.md)\>

  ↳ **`MqttDriver`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)

## Table of contents

### Constructors

- [constructor](MqttDriver.md#constructor)

### Properties

- [client](MqttDriver.md#client)
- [clientId](MqttDriver.md#clientid)
- [conRes](MqttDriver.md#conres)
- [isConnected](MqttDriver.md#isconnected)
- [sshLocalPort](MqttDriver.md#sshlocalport)
- [sshServer](MqttDriver.md#sshserver)
- [subscribedTopicMap](MqttDriver.md#subscribedtopicmap)

### Methods

- [clearPayload](MqttDriver.md#clearpayload)
- [closeSub](MqttDriver.md#closesub)
- [connect](MqttDriver.md#connect)
- [connectSub](MqttDriver.md#connectsub)
- [createDBError](MqttDriver.md#createdberror)
- [disconnect](MqttDriver.md#disconnect)
- [flow](MqttDriver.md#flow)
- [getAll](MqttDriver.md#getall)
- [getByRdh](MqttDriver.md#getbyrdh)
- [getClientId](MqttDriver.md#getclientid)
- [getConnectionRes](MqttDriver.md#getconnectionres)
- [getDbDatabases](MqttDriver.md#getdbdatabases)
- [getFirstDbDatabase](MqttDriver.md#getfirstdbdatabase)
- [getInfomationSchemas](MqttDriver.md#getinfomationschemas)
- [getInfomationSchemasSub](MqttDriver.md#getinfomationschemassub)
- [getName](MqttDriver.md#getname)
- [getTopicSummary](MqttDriver.md#gettopicsummary)
- [initBaseStatus](MqttDriver.md#initbasestatus)
- [isNeedsSsh](MqttDriver.md#isneedsssh)
- [isQuery](MqttDriver.md#isquery)
- [isSubscribed](MqttDriver.md#issubscribed)
- [parseSchemaAndTableHints](MqttDriver.md#parseschemaandtablehints)
- [publish](MqttDriver.md#publish)
- [requestSqlSub](MqttDriver.md#requestsqlsub)
- [scan](MqttDriver.md#scan)
- [subscribe](MqttDriver.md#subscribe)
- [subscribes](MqttDriver.md#subscribes)
- [test](MqttDriver.md#test)
- [unsubscribe](MqttDriver.md#unsubscribe)
- [unsubscribes](MqttDriver.md#unsubscribes)

## Constructors

### constructor

• **new MqttDriver**(`conRes`): [`MqttDriver`](MqttDriver.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |

#### Returns

[`MqttDriver`](MqttDriver.md)

#### Overrides

[BaseDriver](BaseDriver.md).[constructor](BaseDriver.md#constructor)

#### Defined in

[src/drivers/MqttDriver.ts:65](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L65)

## Properties

### client

• **client**: `default`

#### Defined in

[src/drivers/MqttDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L61)

___

### clientId

• **clientId**: `string`

#### Defined in

[src/drivers/MqttDriver.ts:63](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L63)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:48](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L48)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L47)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:50](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L50)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:49](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L49)

___

### subscribedTopicMap

• **subscribedTopicMap**: `Map`\<`string`, [`TopicStatusAndPayloads`](../modules.md#topicstatusandpayloads)\>

#### Defined in

[src/drivers/MqttDriver.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L62)

## Methods

### clearPayload

▸ **clearPayload**(`topic`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `topic` | `string` |

#### Returns

`void`

#### Defined in

[src/drivers/MqttDriver.ts:370](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L370)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/MqttDriver.ts:404](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L404)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:156](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L156)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/MqttDriver.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L73)

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

[src/drivers/BaseDriver.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L232)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L181)

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

[src/drivers/BaseDriver.ts:98](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L98)

___

### getAll

▸ **getAll**(`topic`): [`TopicPayloadMessage`](../modules.md#topicpayloadmessage)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `topic` | `string` |

#### Returns

[`TopicPayloadMessage`](../modules.md#topicpayloadmessage)[]

#### Defined in

[src/drivers/MqttDriver.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L234)

___

### getByRdh

▸ **getByRdh**(`topic`, `options?`): `ResultSetData`

#### Parameters

| Name | Type |
| :------ | :------ |
| `topic` | `string` |
| `options?` | `Object` |
| `options.jsonExpansion?` | `boolean` |

#### Returns

`ResultSetData`

#### Defined in

[src/drivers/MqttDriver.ts:246](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L246)

___

### getClientId

▸ **getClientId**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/MqttDriver.ts:69](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L69)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:60](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L60)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L222)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L226)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Returns

`Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L207)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Returns

`Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/MqttDriver.ts:380](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L380)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L57)

___

### getTopicSummary

▸ **getTopicSummary**(): `Record`\<`string`, \{ `isSubscribed`: `boolean` ; `lastTimestamp`: `number` ; `numOfPayloads`: `number`  }\>

Returns an object with the length of each value array in PAYLOADS by key.

#### Returns

`Record`\<`string`, \{ `isSubscribed`: `boolean` ; `lastTimestamp`: `number` ; `numOfPayloads`: `number`  }\>

An object with the same keys and the length of each array as value.

#### Defined in

[src/drivers/MqttDriver.ts:348](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L348)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L64)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L68)

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

[src/drivers/BaseDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L71)

___

### isSubscribed

▸ **isSubscribed**(`topic`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `topic` | `string` |

#### Returns

`boolean`

#### Defined in

[src/drivers/MqttDriver.ts:366](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L366)

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

[src/drivers/BaseDriver.ts:82](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/BaseDriver.ts#L82)

___

### publish

▸ **publish**(`topic`, `message`, `opts?`): `Promise`\<`Packet`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `topic` | `string` |
| `message` | `string` \| `Buffer` |
| `opts?` | `Object` |
| `opts.dup?` | `boolean` |
| `opts.qos?` | [`MqttQoS`](../modules.md#mqttqos) |
| `opts.retain?` | `boolean` |

#### Returns

`Promise`\<`Packet`\>

#### Defined in

[src/drivers/MqttDriver.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L189)

___

### requestSqlSub

▸ **requestSqlSub**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/MqttDriver.ts:238](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L238)

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

[src/drivers/MqttDriver.ts:374](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L374)

___

### subscribe

▸ **subscribe**(`params`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`MqttSubscriptionSetting`](../modules.md#mqttsubscriptionsetting) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/MqttDriver.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L197)

___

### subscribes

▸ **subscribes**(`list`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | [`MqttSubscriptionSetting`](../modules.md#mqttsubscriptionsetting)[] |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/MqttDriver.ts:217](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L217)

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

[src/drivers/MqttDriver.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L170)

___

### unsubscribe

▸ **unsubscribe**(`topic`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `topic` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/MqttDriver.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L208)

___

### unsubscribes

▸ **unsubscribes**(`topics`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `topics` | `string`[] |

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/drivers/MqttDriver.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/drivers/MqttDriver.ts#L223)
