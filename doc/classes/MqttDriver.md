[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / MqttDriver

# Class: MqttDriver

## Hierarchy

- [`BaseDriver`](BaseDriver.md)\<[`MqttDatabase`](MqttDatabase.md)\>

  ↳ **`MqttDriver`**

## Implements

- [`Scannable`](../interfaces/Scannable.md)\<[`MqttScanParams`](../modules.md#mqttscanparams)\>

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

[src/drivers/MqttDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L75)

## Properties

### client

• **client**: `default`

#### Defined in

[src/drivers/MqttDriver.ts:71](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L71)

___

### clientId

• **clientId**: `string`

#### Defined in

[src/drivers/MqttDriver.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L73)

___

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[conRes](BaseDriver.md#conres)

#### Defined in

[src/drivers/BaseDriver.ts:52](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L52)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isConnected](BaseDriver.md#isconnected)

#### Defined in

[src/drivers/BaseDriver.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L51)

___

### sshLocalPort

• `Protected` `Optional` **sshLocalPort**: `number`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshLocalPort](BaseDriver.md#sshlocalport)

#### Defined in

[src/drivers/BaseDriver.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L54)

___

### sshServer

• `Protected` **sshServer**: `any`

#### Inherited from

[BaseDriver](BaseDriver.md).[sshServer](BaseDriver.md#sshserver)

#### Defined in

[src/drivers/BaseDriver.ts:53](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L53)

___

### subscribedTopicMap

• **subscribedTopicMap**: `Map`\<`string`, [`TopicStatusAndPayloads`](../modules.md#topicstatusandpayloads)\>

#### Defined in

[src/drivers/MqttDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L72)

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

[src/drivers/MqttDriver.ts:411](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L411)

___

### closeSub

▸ **closeSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[closeSub](BaseDriver.md#closesub)

#### Defined in

[src/drivers/MqttDriver.ts:493](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L493)

___

### connect

▸ **connect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[connect](BaseDriver.md#connect)

#### Defined in

[src/drivers/BaseDriver.ts:160](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L160)

___

### connectSub

▸ **connectSub**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Overrides

[BaseDriver](BaseDriver.md).[connectSub](BaseDriver.md#connectsub)

#### Defined in

[src/drivers/MqttDriver.ts:83](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L83)

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

[src/drivers/BaseDriver.ts:236](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L236)

___

### disconnect

▸ **disconnect**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Inherited from

[BaseDriver](BaseDriver.md).[disconnect](BaseDriver.md#disconnect)

#### Defined in

[src/drivers/BaseDriver.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L185)

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

[src/drivers/BaseDriver.ts:102](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L102)

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

[src/drivers/MqttDriver.ts:245](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L245)

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

[src/drivers/MqttDriver.ts:257](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L257)

___

### getClientId

▸ **getClientId**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/MqttDriver.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L79)

___

### getConnectionRes

▸ **getConnectionRes**(): [`ConnectionSetting`](../modules.md#connectionsetting)

#### Returns

[`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[BaseDriver](BaseDriver.md).[getConnectionRes](BaseDriver.md#getconnectionres)

#### Defined in

[src/drivers/BaseDriver.ts:64](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L64)

___

### getDbDatabases

▸ **getDbDatabases**(): [`DbDatabase`](../modules.md#dbdatabase)[]

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[BaseDriver](BaseDriver.md).[getDbDatabases](BaseDriver.md#getdbdatabases)

#### Defined in

[src/drivers/BaseDriver.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L226)

___

### getFirstDbDatabase

▸ **getFirstDbDatabase**(): [`DbDatabase`](../modules.md#dbdatabase)

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[BaseDriver](BaseDriver.md).[getFirstDbDatabase](BaseDriver.md#getfirstdbdatabase)

#### Defined in

[src/drivers/BaseDriver.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L230)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Returns

`Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Inherited from

[BaseDriver](BaseDriver.md).[getInfomationSchemas](BaseDriver.md#getinfomationschemas)

#### Defined in

[src/drivers/BaseDriver.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L211)

___

### getInfomationSchemasSub

▸ **getInfomationSchemasSub**(): `Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Returns

`Promise`\<[`MqttDatabase`](MqttDatabase.md)[]\>

#### Overrides

[BaseDriver](BaseDriver.md).[getInfomationSchemasSub](BaseDriver.md#getinfomationschemassub)

#### Defined in

[src/drivers/MqttDriver.ts:469](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L469)

___

### getName

▸ **getName**(): `string`

#### Returns

`string`

#### Inherited from

[BaseDriver](BaseDriver.md).[getName](BaseDriver.md#getname)

#### Defined in

[src/drivers/BaseDriver.ts:61](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L61)

___

### getTopicSummary

▸ **getTopicSummary**(): `Record`\<`string`, \{ `isSubscribed`: `boolean` ; `lastTimestamp`: `number` ; `numOfPayloads`: `number`  }\>

Returns an object with the length of each value array in PAYLOADS by key.

#### Returns

`Record`\<`string`, \{ `isSubscribed`: `boolean` ; `lastTimestamp`: `number` ; `numOfPayloads`: `number`  }\>

An object with the same keys and the length of each array as value.

#### Defined in

[src/drivers/MqttDriver.ts:389](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L389)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[BaseDriver](BaseDriver.md).[initBaseStatus](BaseDriver.md#initbasestatus)

#### Defined in

[src/drivers/BaseDriver.ts:68](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L68)

___

### isNeedsSsh

▸ **isNeedsSsh**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[BaseDriver](BaseDriver.md).[isNeedsSsh](BaseDriver.md#isneedsssh)

#### Defined in

[src/drivers/BaseDriver.ts:72](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L72)

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

[src/drivers/BaseDriver.ts:75](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L75)

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

[src/drivers/MqttDriver.ts:407](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L407)

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

[src/drivers/BaseDriver.ts:86](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L86)

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

[src/drivers/MqttDriver.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L200)

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

[src/drivers/MqttDriver.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L249)

___

### scan

▸ **scan**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`MqttScanParams`](../modules.md#mqttscanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Implementation of

[Scannable](../interfaces/Scannable.md).[scan](../interfaces/Scannable.md#scan)

#### Defined in

[src/drivers/MqttDriver.ts:415](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L415)

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

[src/drivers/MqttDriver.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L208)

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

[src/drivers/MqttDriver.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L228)

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

[src/drivers/MqttDriver.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L181)

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

[src/drivers/MqttDriver.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L219)

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

[src/drivers/MqttDriver.ts:234](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/MqttDriver.ts#L234)
