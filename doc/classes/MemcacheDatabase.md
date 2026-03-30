[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / MemcacheDatabase

# Class: MemcacheDatabase

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbKey`](DbKey.md)\>

  ↳ **`MemcacheDatabase`**

## Table of contents

### Constructors

- [constructor](MemcacheDatabase.md#constructor)

### Properties

- [children](MemcacheDatabase.md#children)
- [cold](MemcacheDatabase.md#cold)
- [comment](MemcacheDatabase.md#comment)
- [hot](MemcacheDatabase.md#hot)
- [id](MemcacheDatabase.md#id)
- [isInProgress](MemcacheDatabase.md#isinprogress)
- [meta](MemcacheDatabase.md#meta)
- [name](MemcacheDatabase.md#name)
- [resourceType](MemcacheDatabase.md#resourcetype)
- [servers](MemcacheDatabase.md#servers)
- [warm](MemcacheDatabase.md#warm)

### Methods

- [addChild](MemcacheDatabase.md#addchild)
- [clearChildren](MemcacheDatabase.md#clearchildren)
- [findChildren](MemcacheDatabase.md#findchildren)
- [getChildByName](MemcacheDatabase.md#getchildbyname)
- [getProperties](MemcacheDatabase.md#getproperties)
- [hasChildren](MemcacheDatabase.md#haschildren)
- [toJsonStringify](MemcacheDatabase.md#tojsonstringify)
- [toString](MemcacheDatabase.md#tostring)

## Constructors

### constructor

• **new MemcacheDatabase**(`name`): [`MemcacheDatabase`](MemcacheDatabase.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`MemcacheDatabase`](MemcacheDatabase.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:418](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L418)

## Properties

### children

• `Readonly` **children**: [`DbKey`](DbKey.md)\<`any`\>[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L188)

___

### cold

• **cold**: `number`

#### Defined in

[src/resource/DbResource.ts:417](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L417)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L187)

___

### hot

• **hot**: `number`

#### Defined in

[src/resource/DbResource.ts:415](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L415)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L184)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L190)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L186)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L185)

___

### servers

• **servers**: `string`

#### Defined in

[src/resource/DbResource.ts:414](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L414)

___

### warm

• **warm**: `number`

#### Defined in

[src/resource/DbResource.ts:416](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L416)

## Methods

### addChild

▸ **addChild**(`res`): [`DbKey`](DbKey.md)\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbKey`](DbKey.md)\<`any`\> |

#### Returns

[`DbKey`](DbKey.md)\<`any`\>

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L214)

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

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L226)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbKey`](DbKey.md)\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbKey`](DbKey.md)\<`any`\>

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L218)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:422](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L422)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L266)
