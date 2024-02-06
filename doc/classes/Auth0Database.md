[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / Auth0Database

# Class: Auth0Database

## Hierarchy

- [`DbResource`](DbResource.md)<[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)\>

  ↳ **`Auth0Database`**

## Table of contents

### Constructors

- [constructor](Auth0Database.md#constructor)

### Properties

- [children](Auth0Database.md#children)
- [comment](Auth0Database.md#comment)
- [id](Auth0Database.md#id)
- [isDefault](Auth0Database.md#isdefault)
- [isInProgress](Auth0Database.md#isinprogress)
- [meta](Auth0Database.md#meta)
- [name](Auth0Database.md#name)
- [numOfOrganizations](Auth0Database.md#numoforganizations)
- [numOfUsers](Auth0Database.md#numofusers)
- [resourceType](Auth0Database.md#resourcetype)

### Methods

- [addChild](Auth0Database.md#addchild)
- [clearChildren](Auth0Database.md#clearchildren)
- [findChildren](Auth0Database.md#findchildren)
- [getChildByName](Auth0Database.md#getchildbyname)
- [getClientByName](Auth0Database.md#getclientbyname)
- [getGroupByName](Auth0Database.md#getgroupbyname)
- [getProperties](Auth0Database.md#getproperties)
- [getRoleByName](Auth0Database.md#getrolebyname)
- [getUserByName](Auth0Database.md#getuserbyname)
- [hasChildren](Auth0Database.md#haschildren)
- [toJsonStringify](Auth0Database.md#tojsonstringify)
- [toString](Auth0Database.md#tostring)

## Constructors

### constructor

• **new Auth0Database**(`name`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:361](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L361)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L124)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L123)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L120)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:357](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L357)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L126)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L125)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L122)

___

### numOfOrganizations

• **numOfOrganizations**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:359](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L359)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:358](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L358)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L121)

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

[src/resource/DbResource.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L141)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L150)

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

[src/resource/DbResource.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L162)

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

[src/resource/DbResource.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L154)

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

[src/resource/DbResource.ts:365](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L365)

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

[src/resource/DbResource.ts:381](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L381)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:397](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L397)

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

[src/resource/DbResource.ts:389](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L389)

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

[src/resource/DbResource.ts:373](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L373)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L146)

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

[src/resource/DbResource.ts:199](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L199)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/914d912/src/resource/DbResource.ts#L196)
