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

[src/resource/DbResource.ts:425](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L425)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L170)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L169)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L166)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:421](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L421)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L172)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L171)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L168)

___

### numOfOrganizations

• **numOfOrganizations**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:423](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L423)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:422](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L422)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L167)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L187)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L196)

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

[src/resource/DbResource.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L208)

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

[src/resource/DbResource.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L200)

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

[src/resource/DbResource.ts:429](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L429)

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

[src/resource/DbResource.ts:445](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L445)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:461](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L461)

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

[src/resource/DbResource.ts:453](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L453)

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

[src/resource/DbResource.ts:437](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L437)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L192)

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

[src/resource/DbResource.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L251)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/6bdf622920b8402dd42c3d040e02d96caf1d1195/src/resource/DbResource.ts#L248)
