[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / IamGroup

# Class: IamGroup

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`IamGroup`**

## Table of contents

### Constructors

- [constructor](IamGroup.md#constructor)

### Properties

- [children](IamGroup.md#children)
- [comment](IamGroup.md#comment)
- [id](IamGroup.md#id)
- [isInProgress](IamGroup.md#isinprogress)
- [meta](IamGroup.md#meta)
- [name](IamGroup.md#name)
- [resourceType](IamGroup.md#resourcetype)

### Methods

- [addChild](IamGroup.md#addchild)
- [clearChildren](IamGroup.md#clearchildren)
- [findChildren](IamGroup.md#findchildren)
- [getChildByName](IamGroup.md#getchildbyname)
- [getProperties](IamGroup.md#getproperties)
- [hasChildren](IamGroup.md#haschildren)
- [toJsonStringify](IamGroup.md#tojsonstringify)
- [toString](IamGroup.md#tostring)

## Constructors

### constructor

• **new IamGroup**(`name`): [`IamGroup`](IamGroup.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`IamGroup`](IamGroup.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:564](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L564)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L151)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L150)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L147)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L153)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L152)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L149)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L148)

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

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L168)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L177)

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

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L189)

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

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L181)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L161)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L173)

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

[src/resource/DbResource.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L232)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/5e07a2a8db210268220a8900c4a67f54efd9527c/src/resource/DbResource.ts#L229)
