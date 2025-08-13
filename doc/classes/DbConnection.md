[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbConnection

# Class: DbConnection

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbDatabase`](../modules.md#dbdatabase)\>

  ↳ **`DbConnection`**

## Implements

- [`ConnectionSetting`](../modules.md#connectionsetting)

## Table of contents

### Constructors

- [constructor](DbConnection.md#constructor)

### Properties

- [apiVersion](DbConnection.md#apiversion)
- [awsSetting](DbConnection.md#awssetting)
- [children](DbConnection.md#children)
- [comment](DbConnection.md#comment)
- [connectTimeoutMs](DbConnection.md#connecttimeoutms)
- [database](DbConnection.md#database)
- [databaseVersion](DbConnection.md#databaseversion)
- [dbType](DbConnection.md#dbtype)
- [ds](DbConnection.md#ds)
- [firebase](DbConnection.md#firebase)
- [host](DbConnection.md#host)
- [iamSolution](DbConnection.md#iamsolution)
- [id](DbConnection.md#id)
- [isConnected](DbConnection.md#isconnected)
- [isInProgress](DbConnection.md#isinprogress)
- [lockWaitTimeoutMs](DbConnection.md#lockwaittimeoutms)
- [meta](DbConnection.md#meta)
- [mqttSetting](DbConnection.md#mqttsetting)
- [name](DbConnection.md#name)
- [password](DbConnection.md#password)
- [port](DbConnection.md#port)
- [queryTimeoutMs](DbConnection.md#querytimeoutms)
- [resourceFilter](DbConnection.md#resourcefilter)
- [resourceType](DbConnection.md#resourcetype)
- [sqlServer](DbConnection.md#sqlserver)
- [ssh](DbConnection.md#ssh)
- [ssl](DbConnection.md#ssl)
- [timezone](DbConnection.md#timezone)
- [transactionIsolationLevel](DbConnection.md#transactionisolationlevel)
- [url](DbConnection.md#url)
- [user](DbConnection.md#user)

### Methods

- [addChild](DbConnection.md#addchild)
- [clearChildren](DbConnection.md#clearchildren)
- [findChildren](DbConnection.md#findchildren)
- [getChildByName](DbConnection.md#getchildbyname)
- [getProperties](DbConnection.md#getproperties)
- [hasChildren](DbConnection.md#haschildren)
- [hasSshSetting](DbConnection.md#hassshsetting)
- [hasUrl](DbConnection.md#hasurl)
- [toJsonStringify](DbConnection.md#tojsonstringify)
- [toString](DbConnection.md#tostring)

## Constructors

### constructor

• **new DbConnection**(`prop`): [`DbConnection`](DbConnection.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `prop` | `any` |

#### Returns

[`DbConnection`](DbConnection.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:309](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L309)

## Properties

### apiVersion

• `Optional` **apiVersion**: `string`

#### Implementation of

ConnectionSetting.apiVersion

#### Defined in

[src/resource/DbResource.ts:294](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L294)

___

### awsSetting

• `Optional` **awsSetting**: [`AwsSetting`](../modules.md#awssetting)

#### Implementation of

ConnectionSetting.awsSetting

#### Defined in

[src/resource/DbResource.ts:297](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L297)

___

### children

• `Readonly` **children**: [`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L183)

___

### connectTimeoutMs

• `Optional` **connectTimeoutMs**: `number`

#### Implementation of

ConnectionSetting.connectTimeoutMs

#### Defined in

[src/resource/DbResource.ts:304](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L304)

___

### database

• `Optional` **database**: `string`

#### Implementation of

ConnectionSetting.database

#### Defined in

[src/resource/DbResource.ts:290](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L290)

___

### databaseVersion

• `Optional` **databaseVersion**: `number`

#### Implementation of

ConnectionSetting.databaseVersion

#### Defined in

[src/resource/DbResource.ts:291](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L291)

___

### dbType

• **dbType**: [`DBType`](../modules.md#dbtype)

#### Implementation of

ConnectionSetting.dbType

#### Defined in

[src/resource/DbResource.ts:283](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L283)

___

### ds

• `Optional` **ds**: `string`

#### Implementation of

ConnectionSetting.ds

#### Defined in

[src/resource/DbResource.ts:292](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L292)

___

### firebase

• `Optional` **firebase**: [`FirebaseSetting`](../modules.md#firebasesetting)

#### Implementation of

ConnectionSetting.firebase

#### Defined in

[src/resource/DbResource.ts:300](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L300)

___

### host

• `Optional` **host**: `string`

#### Implementation of

ConnectionSetting.host

#### Defined in

[src/resource/DbResource.ts:286](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L286)

___

### iamSolution

• `Optional` **iamSolution**: [`IamSolutionSetting`](../modules.md#iamsolutionsetting)

#### Implementation of

ConnectionSetting.iamSolution

#### Defined in

[src/resource/DbResource.ts:298](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L298)

___

### id

• `Readonly` **id**: `string`

#### Implementation of

ConnectionSetting.id

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L180)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/resource/DbResource.ts:293](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L293)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L186)

___

### lockWaitTimeoutMs

• `Optional` **lockWaitTimeoutMs**: `number`

#### Implementation of

ConnectionSetting.lockWaitTimeoutMs

#### Defined in

[src/resource/DbResource.ts:306](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L306)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L185)

___

### mqttSetting

• `Optional` **mqttSetting**: [`MqttSetting`](../modules.md#mqttsetting)

#### Implementation of

ConnectionSetting.mqttSetting

#### Defined in

[src/resource/DbResource.ts:299](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L299)

___

### name

• **name**: `string`

#### Implementation of

ConnectionSetting.name

#### Overrides

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:284](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L284)

___

### password

• `Optional` **password**: `string`

#### Implementation of

ConnectionSetting.password

#### Defined in

[src/resource/DbResource.ts:289](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L289)

___

### port

• `Optional` **port**: `number`

#### Implementation of

ConnectionSetting.port

#### Defined in

[src/resource/DbResource.ts:287](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L287)

___

### queryTimeoutMs

• `Optional` **queryTimeoutMs**: `number`

#### Implementation of

ConnectionSetting.queryTimeoutMs

#### Defined in

[src/resource/DbResource.ts:305](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L305)

___

### resourceFilter

• `Optional` **resourceFilter**: [`ResourceFilter`](../modules.md#resourcefilter)

#### Implementation of

ConnectionSetting.resourceFilter

#### Defined in

[src/resource/DbResource.ts:307](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L307)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L181)

___

### sqlServer

• `Optional` **sqlServer**: [`SQLServerSetting`](../modules.md#sqlserversetting)

#### Implementation of

ConnectionSetting.sqlServer

#### Defined in

[src/resource/DbResource.ts:301](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L301)

___

### ssh

• `Optional` **ssh**: [`SshSetting`](../modules.md#sshsetting)

#### Implementation of

ConnectionSetting.ssh

#### Defined in

[src/resource/DbResource.ts:295](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L295)

___

### ssl

• `Optional` **ssl**: [`SslSetting`](../modules.md#sslsetting)

#### Implementation of

ConnectionSetting.ssl

#### Defined in

[src/resource/DbResource.ts:296](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L296)

___

### timezone

• `Optional` **timezone**: `string`

#### Implementation of

ConnectionSetting.timezone

#### Defined in

[src/resource/DbResource.ts:302](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L302)

___

### transactionIsolationLevel

• `Optional` **transactionIsolationLevel**: [`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)

#### Implementation of

ConnectionSetting.transactionIsolationLevel

#### Defined in

[src/resource/DbResource.ts:303](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L303)

___

### url

• `Optional` **url**: `string`

#### Implementation of

ConnectionSetting.url

#### Defined in

[src/resource/DbResource.ts:285](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L285)

___

### user

• `Optional` **user**: `string`

#### Implementation of

ConnectionSetting.user

#### Defined in

[src/resource/DbResource.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L288)

## Methods

### addChild

▸ **addChild**(`res`): [`DbDatabase`](../modules.md#dbdatabase)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbDatabase`](../modules.md#dbdatabase) |

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L210)

___

### findChildren

▸ **findChildren**\<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)\<[`AllSubDbResource`](../modules.md#allsubdbresource), `U`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `keyword?` | `string` \| `RegExp` |
| › `recursively?` | `boolean` |
| › `resourceType` | [`ResourceType`](../modules.md#resourcetype) |

#### Returns

`U`[]

#### Inherited from

[DbResource](DbResource.md).[findChildren](DbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L222)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbDatabase`](../modules.md#dbdatabase)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbDatabase`](../modules.md#dbdatabase)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:194](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L194)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L206)

___

### hasSshSetting

▸ **hasSshSetting**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:345](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L345)

___

### hasUrl

▸ **hasUrl**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:338](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L338)

___

### toJsonStringify

▸ **toJsonStringify**(`space?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `space` | `number` | `0` |

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toJsonStringify](DbResource.md#tojsonstringify)

#### Defined in

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L262)
