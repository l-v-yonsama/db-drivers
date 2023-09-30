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

[resource/DbResource.ts:459](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L459)

## Properties

### children

• `Readonly` **children**: `AllSubDbResource`[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[resource/DbResource.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L112)

___

### colType

• `Readonly` **colType**: [`GeneralColumnType`](../modules.md#generalcolumntype-1)

#### Defined in

[resource/DbResource.ts:453](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L453)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[resource/DbResource.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L111)

___

### default

• `Readonly` **default**: `any`

#### Defined in

[resource/DbResource.ts:457](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L457)

___

### extra

• `Readonly` **extra**: `any`

#### Defined in

[resource/DbResource.ts:458](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L458)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[resource/DbResource.ts:108](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L108)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L114)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L113)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[resource/DbResource.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L110)

___

### nullable

• `Readonly` **nullable**: `boolean`

#### Defined in

[resource/DbResource.ts:454](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L454)

___

### primaryKey

• `Readonly` **primaryKey**: `boolean`

#### Defined in

[resource/DbResource.ts:455](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L455)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[resource/DbResource.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L109)

___

### uniqKey

• `Readonly` **uniqKey**: `boolean`

#### Defined in

[resource/DbResource.ts:456](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L456)

## Methods

### addChild

▸ **addChild**(`res`): `AllSubDbResource`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `AllSubDbResource` |

#### Returns

`AllSubDbResource`

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[resource/DbResource.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L129)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[resource/DbResource.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L138)

___

### findChildren

▸ **findChildren**<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)<`AllSubDbResource`, `U`\> = `AllSubDbResource` |

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

[resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L150)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `AllSubDbResource`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`AllSubDbResource`

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L142)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[resource/DbResource.ts:478](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L478)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L134)

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

[resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L187)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[resource/DbResource.ts:474](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L474)
