[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / IamUser

# Class: IamUser

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`IamUser`**

## Table of contents

### Constructors

- [constructor](IamUser.md#constructor)

### Properties

- [children](IamUser.md#children)
- [comment](IamUser.md#comment)
- [id](IamUser.md#id)
- [isInProgress](IamUser.md#isinprogress)
- [meta](IamUser.md#meta)
- [name](IamUser.md#name)
- [resourceType](IamUser.md#resourcetype)

### Methods

- [addChild](IamUser.md#addchild)
- [clearChildren](IamUser.md#clearchildren)
- [findChildren](IamUser.md#findchildren)
- [getChildByName](IamUser.md#getchildbyname)
- [getProperties](IamUser.md#getproperties)
- [hasChildren](IamUser.md#haschildren)
- [toJsonStringify](IamUser.md#tojsonstringify)
- [toString](IamUser.md#tostring)

## Constructors

### constructor

• **new IamUser**(`name`): [`IamUser`](IamUser.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamUser`](IamUser.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:558](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L558)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L152)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L151)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L148)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L154)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L153)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L150)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L149)

## Methods

### addChild

▸ **addChild**(`res`): [`AllSubDbResource`](../modules.md#allsubdbresource)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Returns

[`AllSubDbResource`](../modules.md#allsubdbresource)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L169)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:178](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L178)

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

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L190)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`AllSubDbResource`](../modules.md#allsubdbresource)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`AllSubDbResource`](../modules.md#allsubdbresource)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L182)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:562](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L562)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:174](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L174)

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

[src/resource/DbResource.ts:233](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L233)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:230](https://github.com/l-v-yonsama/db-drivers/blob/1053741cda8cc80cfd60d64c697497cdf84c905e/src/resource/DbResource.ts#L230)
