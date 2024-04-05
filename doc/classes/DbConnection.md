[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbConnection

# Class: DbConnection

## Hierarchy

- [`DbResource`](DbResource.md)<[`DbDatabase`](../modules.md#dbdatabase)\>

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
- [meta](DbConnection.md#meta)
- [name](DbConnection.md#name)
- [password](DbConnection.md#password)
- [port](DbConnection.md#port)
- [resourceType](DbConnection.md#resourcetype)
- [ssh](DbConnection.md#ssh)
- [ssl](DbConnection.md#ssl)
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

• **new DbConnection**(`prop`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `prop` | `any` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L228)

## Properties

### apiVersion

• `Optional` **apiVersion**: `string`

#### Implementation of

ConnectionSetting.apiVersion

#### Defined in

[src/resource/DbResource.ts:221](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L221)

___

### awsSetting

• `Optional` **awsSetting**: [`AwsSetting`](../modules.md#awssetting)

#### Implementation of

ConnectionSetting.awsSetting

#### Defined in

[src/resource/DbResource.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L224)

___

### children

• `Readonly` **children**: [`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L117)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:116](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L116)

___

### database

• `Optional` **database**: `string`

#### Implementation of

ConnectionSetting.database

#### Defined in

[src/resource/DbResource.ts:217](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L217)

___

### databaseVersion

• `Optional` **databaseVersion**: `number`

#### Implementation of

ConnectionSetting.databaseVersion

#### Defined in

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L218)

___

### dbType

• **dbType**: `any` = `undefined`

#### Implementation of

ConnectionSetting.dbType

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L210)

___

### ds

• `Optional` **ds**: `string`

#### Implementation of

ConnectionSetting.ds

#### Defined in

[src/resource/DbResource.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L219)

___

### firebase

• `Optional` **firebase**: [`FirebaseSetting`](../modules.md#firebasesetting)

#### Implementation of

ConnectionSetting.firebase

#### Defined in

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L226)

___

### host

• `Optional` **host**: `string`

#### Implementation of

ConnectionSetting.host

#### Defined in

[src/resource/DbResource.ts:213](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L213)

___

### iamSolution

• `Optional` **iamSolution**: [`IamSolutionSetting`](../modules.md#iamsolutionsetting)

#### Implementation of

ConnectionSetting.iamSolution

#### Defined in

[src/resource/DbResource.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L225)

___

### id

• `Readonly` **id**: `string`

#### Implementation of

ConnectionSetting.id

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L113)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/resource/DbResource.ts:220](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L220)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L119)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L118)

___

### name

• **name**: `string`

#### Implementation of

ConnectionSetting.name

#### Overrides

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L211)

___

### password

• `Optional` **password**: `string`

#### Implementation of

ConnectionSetting.password

#### Defined in

[src/resource/DbResource.ts:216](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L216)

___

### port

• `Optional` **port**: `number`

#### Implementation of

ConnectionSetting.port

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L214)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L114)

___

### ssh

• `Optional` **ssh**: [`SshSetting`](../modules.md#sshsetting)

#### Implementation of

ConnectionSetting.ssh

#### Defined in

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L222)

___

### ssl

• `Optional` **ssl**: [`SslSetting`](../modules.md#sslsetting)

#### Implementation of

ConnectionSetting.ssl

#### Defined in

[src/resource/DbResource.ts:223](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L223)

___

### url

• `Optional` **url**: `string`

#### Implementation of

ConnectionSetting.url

#### Defined in

[src/resource/DbResource.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L212)

___

### user

• `Optional` **user**: `string`

#### Implementation of

ConnectionSetting.user

#### Defined in

[src/resource/DbResource.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L215)

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

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L134)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L143)

___

### findChildren

▸ **findChildren**<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)<[`AllSubDbResource`](../modules.md#allsubdbresource), `U`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `keyword?` | `string` \| `RegExp` |
| › `recursively?` | `boolean` |
| › `resourceType` | [`ResourceType`](../modules.md#resourcetype-1) |

#### Returns

`U`[]

#### Inherited from

[DbResource](DbResource.md).[findChildren](DbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L155)

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

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L147)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:127](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L127)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L139)

___

### hasSshSetting

▸ **hasSshSetting**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:256](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L256)

___

### hasUrl

▸ **hasUrl**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L249)

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

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L192)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L189)
