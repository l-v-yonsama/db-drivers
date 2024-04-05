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
| `colType` | `any` |
| `params` | `any` |
| `comment?` | `string` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:755](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L755)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L117)

___

### colType

• `Readonly` **colType**: [`GeneralColumnType`](../modules.md#generalcolumntype-1)

#### Defined in

[src/resource/DbResource.ts:749](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L749)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:116](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L116)

___

### default

• `Readonly` **default**: `any`

#### Defined in

[src/resource/DbResource.ts:753](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L753)

___

### extra

• `Readonly` **extra**: `any`

#### Defined in

[src/resource/DbResource.ts:754](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L754)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L113)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L119)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L118)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L115)

___

### nullable

• `Readonly` **nullable**: `boolean`

#### Defined in

[src/resource/DbResource.ts:750](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L750)

___

### primaryKey

• `Readonly` **primaryKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:751](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L751)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L114)

___

### uniqKey

• `Readonly` **uniqKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:752](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L752)

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

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L134)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L143)

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

[src/resource/DbResource.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L155)

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

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L147)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:774](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L774)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L139)

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

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L192)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:770](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L770)
