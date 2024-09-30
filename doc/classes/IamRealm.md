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

[src/resource/DbResource.ts:479](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L479)

## Properties

### children

• `Readonly` **children**: ([`IamClient`](IamClient.md) \| [`IamUser`](IamUser.md) \| [`IamGroup`](IamGroup.md) \| [`IamRole`](IamRole.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L170)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L169)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L166)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:475](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L475)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L172)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L171)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L168)

___

### numOfGroups

• **numOfGroups**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:477](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L477)

___

### numOfUsers

• **numOfUsers**: `number` = `0`

#### Defined in

[src/resource/DbResource.ts:476](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L476)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L167)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L187)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L196)

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

[src/resource/DbResource.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L208)

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

[src/resource/DbResource.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L200)

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

[src/resource/DbResource.ts:483](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L483)

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

[src/resource/DbResource.ts:499](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L499)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:515](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L515)

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

[src/resource/DbResource.ts:507](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L507)

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

[src/resource/DbResource.ts:491](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L491)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L192)

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

[src/resource/DbResource.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L251)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/12be1eff6dc8973f3d9d8d95ddf9b34681d56837/src/resource/DbResource.ts#L248)
