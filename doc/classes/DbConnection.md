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
- [id](DbConnection.md#id)
- [isConnected](DbConnection.md#isconnected)
- [isInProgress](DbConnection.md#isinprogress)
- [meta](DbConnection.md#meta)
- [name](DbConnection.md#name)
- [password](DbConnection.md#password)
- [port](DbConnection.md#port)
- [resourceType](DbConnection.md#resourcetype)
- [ssh](DbConnection.md#ssh)
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

[src/resource/DbResource.ts:221](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L221)

## Properties

### apiVersion

• `Optional` **apiVersion**: `string`

#### Implementation of

ConnectionSetting.apiVersion

#### Defined in

[src/resource/DbResource.ts:216](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L216)

___

### awsSetting

• `Optional` **awsSetting**: [`AwsSetting`](../modules.md#awssetting)

#### Implementation of

ConnectionSetting.awsSetting

#### Defined in

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L218)

___

### children

• `Readonly` **children**: [`DbDatabase`](../modules.md#dbdatabase)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L112)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L111)

___

### database

• `Optional` **database**: `string`

#### Implementation of

ConnectionSetting.database

#### Defined in

[src/resource/DbResource.ts:212](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L212)

___

### databaseVersion

• `Optional` **databaseVersion**: `number`

#### Implementation of

ConnectionSetting.databaseVersion

#### Defined in

[src/resource/DbResource.ts:213](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L213)

___

### dbType

• **dbType**: `any` = `undefined`

#### Implementation of

ConnectionSetting.dbType

#### Defined in

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L205)

___

### ds

• `Optional` **ds**: `string`

#### Implementation of

ConnectionSetting.ds

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L214)

___

### firebase

• `Optional` **firebase**: [`FirebaseSetting`](../modules.md#firebasesetting)

#### Implementation of

ConnectionSetting.firebase

#### Defined in

[src/resource/DbResource.ts:219](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L219)

___

### host

• `Optional` **host**: `string`

#### Implementation of

ConnectionSetting.host

#### Defined in

[src/resource/DbResource.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L208)

___

### id

• `Readonly` **id**: `string`

#### Implementation of

ConnectionSetting.id

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:108](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L108)

___

### isConnected

• **isConnected**: `boolean`

#### Defined in

[src/resource/DbResource.ts:215](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L215)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L114)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L113)

___

### name

• **name**: `string`

#### Implementation of

ConnectionSetting.name

#### Overrides

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L206)

___

### password

• `Optional` **password**: `string`

#### Implementation of

ConnectionSetting.password

#### Defined in

[src/resource/DbResource.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L211)

___

### port

• `Optional` **port**: `number`

#### Implementation of

ConnectionSetting.port

#### Defined in

[src/resource/DbResource.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L209)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L109)

___

### ssh

• `Optional` **ssh**: [`SshSetting`](../modules.md#sshsetting)

#### Implementation of

ConnectionSetting.ssh

#### Defined in

[src/resource/DbResource.ts:217](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L217)

___

### url

• `Optional` **url**: `string`

#### Implementation of

ConnectionSetting.url

#### Defined in

[src/resource/DbResource.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L207)

___

### user

• `Optional` **user**: `string`

#### Implementation of

ConnectionSetting.user

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L129)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L138)

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

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L150)

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

[src/resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L142)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L122)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L134)

___

### hasSshSetting

▸ **hasSshSetting**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:247](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L247)

___

### hasUrl

▸ **hasUrl**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:240](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L240)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L187)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/1a3179a/src/resource/DbResource.ts#L184)
