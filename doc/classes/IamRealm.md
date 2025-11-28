[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / IamRealm

# Class: IamRealm

## Hierarchy

- [`DbResource`](DbResource.md)\<[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)\>

  ↳ **`IamRealm`**

## Table of contents

### Constructors

- [constructor](IamRealm.md#constructor)

### Properties

- [children](IamRealm.md#children)
- [comment](IamRealm.md#comment)
- [id](IamRealm.md#id)
- [isDefault](IamRealm.md#isdefault)
- [isInProgress](IamRealm.md#isinprogress)
- [meta](IamRealm.md#meta)
- [name](IamRealm.md#name)
- [numOfGroups](IamRealm.md#numofgroups)
- [numOfUsers](IamRealm.md#numofusers)
- [resourceType](IamRealm.md#resourcetype)

### Methods

- [addChild](IamRealm.md#addchild)
- [clearChildren](IamRealm.md#clearchildren)
- [findChildren](IamRealm.md#findchildren)
- [getChildByName](IamRealm.md#getchildbyname)
- [getClientByName](IamRealm.md#getclientbyname)
- [getGroupByName](IamRealm.md#getgroupbyname)
- [getProperties](IamRealm.md#getproperties)
- [getRoleByName](IamRealm.md#getrolebyname)
- [getUserByName](IamRealm.md#getuserbyname)
- [hasChildren](IamRealm.md#haschildren)
- [toJsonStringify](IamRealm.md#tojsonstringify)
- [toString](IamRealm.md#tostring)

## Constructors

### constructor

• **new IamRealm**(`name`): [`IamRealm`](IamRealm.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamRealm`](IamRealm.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:512](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L512)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L180)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:508](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L508)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L182)

___

### numOfGroups

• **numOfGroups**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:510](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L510)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:509](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L509)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L181)

## Methods

### addChild

▸ **addChild**(`res`): [`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md) |

#### Returns

[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L222)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L214)

___

### getClientByName

▸ **getClientByName**(`name`): [`IamClient`](IamClient.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamClient`](IamClient.md)

#### Defined in

[src/resource/DbResource.ts:516](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L516)

___

### getGroupByName

▸ **getGroupByName**(`name`): [`IamGroup`](IamGroup.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamGroup`](IamGroup.md)

#### Defined in

[src/resource/DbResource.ts:532](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L532)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:548](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L548)

___

### getRoleByName

▸ **getRoleByName**(`name`): [`IamRole`](IamRole.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamRole`](IamRole.md)

#### Defined in

[src/resource/DbResource.ts:540](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L540)

___

### getUserByName

▸ **getUserByName**(`name`): [`IamUser`](IamUser.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamUser`](IamUser.md)

#### Defined in

[src/resource/DbResource.ts:524](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L524)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L206)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L262)
