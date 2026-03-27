[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbSchema

# Class: DbSchema

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbTable`](DbTable.md)\>

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

• **new DbSchema**(`name`): [`DbSchema`](DbSchema.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`DbSchema`](DbSchema.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:676](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L676)

## Properties

### children

• `Readonly` **children**: [`DbTable`](DbTable.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L188)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L187)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L184)

___

### isDefault

• **isDefault**: `boolean` = `false`

#### Defined in

[src/resource/DbResource.ts:675](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L675)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L190)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L186)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L185)

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

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L214)

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

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L226)

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

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L218)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:198](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L198)

___

### getUniqColumnNameWithComments

▸ **getUniqColumnNameWithComments**(): \{ `comment?`: `string` ; `name`: `string`  }[]

#### Returns

\{ `comment?`: `string` ; `name`: `string`  }[]

#### Defined in

[src/resource/DbResource.ts:680](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L680)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/745e130454f4820c702a07e194f67bd1a97e43a7/src/resource/DbResource.ts#L266)
