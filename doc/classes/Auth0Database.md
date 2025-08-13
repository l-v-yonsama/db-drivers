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

[src/resource/DbResource.ts:458](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L458)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

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

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L180)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:454](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L454)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L186)

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

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L182)

___

### numOfOrganizations

• **numOfOrganizations**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:456](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L456)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:455](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L455)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L181)

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

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L214)

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

[src/resource/DbResource.ts:462](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L462)

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

[src/resource/DbResource.ts:478](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L478)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:494](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L494)

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

[src/resource/DbResource.ts:486](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L486)

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

[src/resource/DbResource.ts:470](https://github.com/l-v-yonsama/db-drivers/blob/59a2a6b344fe808011cc186ca2f65b618007cf29/src/resource/DbResource.ts#L470)

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
