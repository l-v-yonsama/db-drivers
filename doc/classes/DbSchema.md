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

[src/resource/DbResource.ts:414](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L414)

## Properties

### children

• `Readonly` **children**: [`DbTable`](DbTable.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L123)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L122)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L119)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:413](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L413)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L125)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L124)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L121)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L120)

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

[src/resource/DbResource.ts:140](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L140)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L149)

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

[src/resource/DbResource.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L161)

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

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L153)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L133)

___

### getUniqColumnNameWithComments

▸ **getUniqColumnNameWithComments**(): { `comment?`: `string` ; `name`: `string`  }[]

#### Returns

{ `comment?`: `string` ; `name`: `string`  }[]

#### Defined in

[src/resource/DbResource.ts:418](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L418)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L145)

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

[src/resource/DbResource.ts:198](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L198)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:195](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L195)
