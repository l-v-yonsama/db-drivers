[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbSchema

# Class: DbSchema

## Hierarchy

- [`DbResource`](DbResource.md)<[`DbTable`](DbTable.md)\>

  ↳ **`DbSchema`**

## Table of contents

### Constructors

- [constructor](DbSchema.md#constructor)

### Properties

- [children](DbSchema.md#children)
- [comment](DbSchema.md#comment)
- [id](DbSchema.md#id)
- [isDefault](DbSchema.md#isdefault)
- [isInProgress](DbSchema.md#isinprogress)
- [meta](DbSchema.md#meta)
- [name](DbSchema.md#name)
- [resourceType](DbSchema.md#resourcetype)

### Methods

- [addChild](DbSchema.md#addchild)
- [clearChildren](DbSchema.md#clearchildren)
- [findChildren](DbSchema.md#findchildren)
- [getChildByName](DbSchema.md#getchildbyname)
- [getProperties](DbSchema.md#getproperties)
- [getUniqColumnNameWithComments](DbSchema.md#getuniqcolumnnamewithcomments)
- [hasChildren](DbSchema.md#haschildren)
- [toJsonStringify](DbSchema.md#tojsonstringify)
- [toString](DbSchema.md#tostring)

## Constructors

### constructor

• **new DbSchema**(`name`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:313](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L313)

## Properties

### children

• `Readonly` **children**: [`DbTable`](DbTable.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L112)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L111)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:108](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L108)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:312](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L312)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L114)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L113)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L110)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L109)

## Methods

### addChild

▸ **addChild**(`res`): [`DbTable`](DbTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbTable`](DbTable.md) |

#### Returns

[`DbTable`](DbTable.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L129)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L138)

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

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L150)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbTable`](DbTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbTable`](DbTable.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L142)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L122)

___

### getUniqColumnNameWithComments

▸ **getUniqColumnNameWithComments**(): { `comment?`: `string` ; `name`: `string`  }[]

#### Returns

{ `comment?`: `string` ; `name`: `string`  }[]

#### Defined in

[src/resource/DbResource.ts:317](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L317)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L134)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L187)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L184)
