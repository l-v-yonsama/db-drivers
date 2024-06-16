[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbColumn

# Class: DbColumn

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`DbColumn`**

## Table of contents

### Constructors

- [constructor](DbColumn.md#constructor)

### Properties

- [children](DbColumn.md#children)
- [colType](DbColumn.md#coltype)
- [comment](DbColumn.md#comment)
- [default](DbColumn.md#default)
- [extra](DbColumn.md#extra)
- [id](DbColumn.md#id)
- [isInProgress](DbColumn.md#isinprogress)
- [meta](DbColumn.md#meta)
- [name](DbColumn.md#name)
- [nullable](DbColumn.md#nullable)
- [primaryKey](DbColumn.md#primarykey)
- [resourceType](DbColumn.md#resourcetype)
- [uniqKey](DbColumn.md#uniqkey)

### Methods

- [addChild](DbColumn.md#addchild)
- [clearChildren](DbColumn.md#clearchildren)
- [findChildren](DbColumn.md#findchildren)
- [getChildByName](DbColumn.md#getchildbyname)
- [getProperties](DbColumn.md#getproperties)
- [hasChildren](DbColumn.md#haschildren)
- [toJsonStringify](DbColumn.md#tojsonstringify)
- [toString](DbColumn.md#tostring)

## Constructors

### constructor

• **new DbColumn**(`name`, `colType`, `params`, `comment?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `colType` | [`GeneralColumnType`](../modules.md#generalcolumntype-1) |
| `params` | `any` |
| `comment?` | `string` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:793](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L793)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L147)

___

### colType

• `Readonly` **colType**: [`GeneralColumnType`](../modules.md#generalcolumntype-1)

#### Defined in

[src/resource/DbResource.ts:787](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L787)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L146)

___

### default

• `Readonly` **default**: `any`

#### Defined in

[src/resource/DbResource.ts:791](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L791)

___

### extra

• `Readonly` **extra**: `any`

#### Defined in

[src/resource/DbResource.ts:792](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L792)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L143)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L149)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L148)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L145)

___

### nullable

• `Readonly` **nullable**: `boolean`

#### Defined in

[src/resource/DbResource.ts:788](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L788)

___

### primaryKey

• `Readonly` **primaryKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:789](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L789)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L144)

___

### uniqKey

• `Readonly` **uniqKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:790](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L790)

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

[src/resource/DbResource.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L164)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L173)

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

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L185)

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

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L177)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:817](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L817)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L169)

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

[src/resource/DbResource.ts:228](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L228)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:813](https://github.com/l-v-yonsama/db-drivers/blob/292a08a/src/resource/DbResource.ts#L813)
