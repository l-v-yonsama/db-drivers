[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / IamRealm

# Class: IamRealm

## Hierarchy

- [`DbResource`](DbResource.md)<[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)\>

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

• **new IamRealm**(`name`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:415](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L415)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L124)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L123)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L120)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:411](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L411)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L126)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L125)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L122)

___

### numOfGroups

• **numOfGroups**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:413](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L413)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:412](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L412)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L121)

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

[src/resource/DbResource.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L141)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L150)

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

[src/resource/DbResource.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L162)

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

[src/resource/DbResource.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L154)

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

[src/resource/DbResource.ts:419](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L419)

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

[src/resource/DbResource.ts:435](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L435)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:451](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L451)

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

[src/resource/DbResource.ts:443](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L443)

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

[src/resource/DbResource.ts:427](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L427)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L146)

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

[src/resource/DbResource.ts:199](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L199)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/a9ac185/src/resource/DbResource.ts#L196)
