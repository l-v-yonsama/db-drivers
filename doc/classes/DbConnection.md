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

[src/resource/DbResource.ts:294](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L294)

## Properties

### apiVersion

• `Optional` **apiVersion**: `string`

#### Implementation of

ConnectionSetting.apiVersion

#### Defined in

[src/resource/DbResource.ts:281](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L281)

___

### awsSetting

• `Optional` **awsSetting**: [`AwsSetting`](../modules.md#awssetting)

#### Implementation of

ConnectionSetting.awsSetting

#### Defined in

[src/resource/DbResource.ts:284](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L284)

___

### children

• `Readonly` **children**: [`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L171)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L170)

___

### database

• `Optional` **database**: `string`

#### Implementation of

ConnectionSetting.database

#### Defined in

[src/resource/DbResource.ts:277](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L277)

___

### databaseVersion

• `Optional` **databaseVersion**: `number`

#### Implementation of

ConnectionSetting.databaseVersion

#### Defined in

[src/resource/DbResource.ts:278](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L278)

___

### dbType

• **dbType**: [`DBType`](../modules.md#dbtype)

#### Implementation of

ConnectionSetting.dbType

#### Defined in

[src/resource/DbResource.ts:270](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L270)

___

### ds

• `Optional` **ds**: `string`

#### Implementation of

ConnectionSetting.ds

#### Defined in

[src/resource/DbResource.ts:279](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L279)

___

### firebase

• `Optional` **firebase**: [`FirebaseSetting`](../modules.md#firebasesetting)

#### Implementation of

ConnectionSetting.firebase

#### Defined in

[src/resource/DbResource.ts:286](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L286)

___

### host

• `Optional` **host**: `string`

#### Implementation of

ConnectionSetting.host

#### Defined in

[src/resource/DbResource.ts:273](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L273)

___

### iamSolution

• `Optional` **iamSolution**: [`IamSolutionSetting`](../modules.md#iamsolutionsetting)

#### Implementation of

ConnectionSetting.iamSolution

#### Defined in

[src/resource/DbResource.ts:285](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L285)

___

### id

• `Readonly` **id**: `string`

#### Implementation of

ConnectionSetting.id

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L167)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/resource/DbResource.ts:280](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L280)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L173)

___

### lockWaitTimeoutMs

• `Optional` **lockWaitTimeoutMs**: `number`

#### Implementation of

ConnectionSetting.lockWaitTimeoutMs

#### Defined in

[src/resource/DbResource.ts:291](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L291)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L172)

___

### name

• **name**: `string`

#### Implementation of

ConnectionSetting.name

#### Overrides

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:271](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L271)

___

### password

• `Optional` **password**: `string`

#### Implementation of

ConnectionSetting.password

#### Defined in

[src/resource/DbResource.ts:276](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L276)

___

### port

• `Optional` **port**: `number`

#### Implementation of

ConnectionSetting.port

#### Defined in

[src/resource/DbResource.ts:274](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L274)

___

### queryTimeoutMs

• `Optional` **queryTimeoutMs**: `number`

#### Implementation of

ConnectionSetting.queryTimeoutMs

#### Defined in

[src/resource/DbResource.ts:290](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L290)

___

### resourceFilter

• `Optional` **resourceFilter**: [`ResourceFilter`](../modules.md#resourcefilter)

#### Implementation of

ConnectionSetting.resourceFilter

#### Defined in

[src/resource/DbResource.ts:292](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L292)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L168)

___

### sqlServer

• `Optional` **sqlServer**: [`SQLServerSetting`](../modules.md#sqlserversetting)

#### Implementation of

ConnectionSetting.sqlServer

#### Defined in

[src/resource/DbResource.ts:287](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L287)

___

### ssh

• `Optional` **ssh**: [`SshSetting`](../modules.md#sshsetting)

#### Implementation of

ConnectionSetting.ssh

#### Defined in

[src/resource/DbResource.ts:282](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L282)

___

### ssl

• `Optional` **ssl**: [`SslSetting`](../modules.md#sslsetting)

#### Implementation of

ConnectionSetting.ssl

#### Defined in

[src/resource/DbResource.ts:283](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L283)

___

### timezone

• `Optional` **timezone**: `string`

#### Implementation of

ConnectionSetting.timezone

#### Defined in

[src/resource/DbResource.ts:288](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L288)

___

### transactionIsolationLevel

• `Optional` **transactionIsolationLevel**: [`TransactionIsolationLevel`](../modules.md#transactionisolationlevel)

#### Implementation of

ConnectionSetting.transactionIsolationLevel

#### Defined in

[src/resource/DbResource.ts:289](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L289)

___

### url

• `Optional` **url**: `string`

#### Implementation of

ConnectionSetting.url

#### Defined in

[src/resource/DbResource.ts:272](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L272)

___

### user

• `Optional` **user**: `string`

#### Implementation of

ConnectionSetting.user

#### Defined in

[src/resource/DbResource.ts:275](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L275)

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

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L188)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L197)

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

[src/resource/DbResource.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L209)

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

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L201)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L181)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L193)

___

### hasSshSetting

▸ **hasSshSetting**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:328](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L328)

___

### hasUrl

▸ **hasUrl**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:321](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L321)

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

[src/resource/DbResource.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L252)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L249)
