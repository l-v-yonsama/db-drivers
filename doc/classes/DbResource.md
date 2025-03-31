[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbResource

# Class: DbResource\<T\>

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

  ↳ [`DbDynamoTableColumn`](DbDynamoTableColumn.md)

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

• **new DbResource**\<`T`\>(`resourceType`, `name`): [`DbResource`](DbResource.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](DbResource.md)\<[`AllSubDbResource`](../modules.md#allsubdbresource), `T`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceType` | [`ResourceType`](../modules.md#resourcetype) |
| `name` | `string` |

#### Returns

[`DbResource`](DbResource.md)\<`T`\>

#### Defined in

[src/resource/DbResource.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L175)

## Properties

### children

• `Readonly` **children**: `T`[]

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L171)

___

### comment

• `Optional` **comment**: `string`

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L170)

___

### id

• `Readonly` **id**: `string`

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L167)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L173)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L172)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L169)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L168)

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

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L188)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Defined in

[src/resource/DbResource.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L197)

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

#### Defined in

[src/resource/DbResource.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L209)

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

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L201)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L181)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L193)

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

[src/resource/DbResource.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L252)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[src/resource/DbResource.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L249)
