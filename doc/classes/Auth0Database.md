[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / Auth0Database

# Class: Auth0Database

## Hierarchy

- [`DbResource`](DbResource.md)\<[`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md)\>

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

• **new Auth0Database**(`name`): [`Auth0Database`](Auth0Database.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`Auth0Database`](Auth0Database.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:398](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L398)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L151)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L150)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L147)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:394](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L394)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L153)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L152)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L149)

___

### numOfOrganizations

• **numOfOrganizations**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:396](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L396)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:395](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L395)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L148)

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

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L168)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L177)

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

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L189)

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

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L181)

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

[src/resource/DbResource.ts:402](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L402)

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

[src/resource/DbResource.ts:418](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L418)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:434](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L434)

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

[src/resource/DbResource.ts:426](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L426)

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

[src/resource/DbResource.ts:410](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L410)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L173)

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

[src/resource/DbResource.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L232)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/a4df02a29dfc3391c0db0aa0d239850a43e02502/src/resource/DbResource.ts#L229)
