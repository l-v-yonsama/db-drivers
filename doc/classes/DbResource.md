[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbResource

# Class: DbResource<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](DbResource.md) = [`AllSubDbResource`](../modules.md#allsubdbresource) |

## Hierarchy

- **`DbResource`**

  ↳ [`DbConnection`](DbConnection.md)

  ↳ [`RdsDatabase`](RdsDatabase.md)

  ↳ [`AwsDatabase`](AwsDatabase.md)

  ↳ [`RedisDatabase`](RedisDatabase.md)

  ↳ [`KeycloakDatabase`](KeycloakDatabase.md)

  ↳ [`Auth0Database`](Auth0Database.md)

  ↳ [`IamRealm`](IamRealm.md)

  ↳ [`IamClient`](IamClient.md)

  ↳ [`IamUser`](IamUser.md)

  ↳ [`IamGroup`](IamGroup.md)

  ↳ [`IamOrganization`](IamOrganization.md)

  ↳ [`IamRole`](IamRole.md)

  ↳ [`DbSchema`](DbSchema.md)

  ↳ [`DbTable`](DbTable.md)

  ↳ [`DbKey`](DbKey.md)

  ↳ [`DbColumn`](DbColumn.md)

  ↳ [`AwsDbResource`](AwsDbResource.md)

## Table of contents

### Constructors

- [constructor](DbResource.md#constructor)

### Properties

- [children](DbResource.md#children)
- [comment](DbResource.md#comment)
- [id](DbResource.md#id)
- [isInProgress](DbResource.md#isinprogress)
- [meta](DbResource.md#meta)
- [name](DbResource.md#name)
- [resourceType](DbResource.md#resourcetype)

### Methods

- [addChild](DbResource.md#addchild)
- [clearChildren](DbResource.md#clearchildren)
- [findChildren](DbResource.md#findchildren)
- [getChildByName](DbResource.md#getchildbyname)
- [getProperties](DbResource.md#getproperties)
- [hasChildren](DbResource.md#haschildren)
- [toJsonStringify](DbResource.md#tojsonstringify)
- [toString](DbResource.md#tostring)

## Constructors

### constructor

• **new DbResource**<`T`\>(`resourceType`, `name`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](DbResource.md)<[`AllSubDbResource`](../modules.md#allsubdbresource), `T`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceType` | [`ResourceType`](../modules.md#resourcetype-1) |
| `name` | `string` |

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L151)

## Properties

### children

• `Readonly` **children**: `T`[]

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L147)

___

### comment

• `Optional` **comment**: `string`

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L146)

___

### id

• `Readonly` **id**: `string`

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L143)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L149)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L148)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/resource/DbResource.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L145)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Defined in

[src/resource/DbResource.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L144)

## Methods

### addChild

▸ **addChild**(`res`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `T` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L164)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L173)

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

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L185)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L177)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Defined in

[src/resource/DbResource.ts:157](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L157)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L169)

___

### toJsonStringify

▸ **toJsonStringify**(`space?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `space` | `number` | `0` |

#### Returns

`string`

#### Defined in

[src/resource/DbResource.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L228)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[src/resource/DbResource.ts:225](https://github.com/l-v-yonsama/db-drivers/blob/ffedad0/src/resource/DbResource.ts#L225)
