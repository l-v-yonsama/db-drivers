[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbDynamoTableColumn

# Class: DbDynamoTableColumn

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`DbDynamoTableColumn`**

## Table of contents

### Constructors

- [constructor](DbDynamoTableColumn.md#constructor)

### Properties

- [attrType](DbDynamoTableColumn.md#attrtype)
- [children](DbDynamoTableColumn.md#children)
- [comment](DbDynamoTableColumn.md#comment)
- [id](DbDynamoTableColumn.md#id)
- [isInProgress](DbDynamoTableColumn.md#isinprogress)
- [meta](DbDynamoTableColumn.md#meta)
- [name](DbDynamoTableColumn.md#name)
- [pk](DbDynamoTableColumn.md#pk)
- [resourceType](DbDynamoTableColumn.md#resourcetype)
- [sk](DbDynamoTableColumn.md#sk)

### Methods

- [addChild](DbDynamoTableColumn.md#addchild)
- [clearChildren](DbDynamoTableColumn.md#clearchildren)
- [findChildren](DbDynamoTableColumn.md#findchildren)
- [getChildByName](DbDynamoTableColumn.md#getchildbyname)
- [getProperties](DbDynamoTableColumn.md#getproperties)
- [hasChildren](DbDynamoTableColumn.md#haschildren)
- [toJsonStringify](DbDynamoTableColumn.md#tojsonstringify)
- [toString](DbDynamoTableColumn.md#tostring)

## Constructors

### constructor

• **new DbDynamoTableColumn**(`name`, `attrType`, `pk`, `sk`): [`DbDynamoTableColumn`](DbDynamoTableColumn.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `attrType` | [`ScalarAttributeType`](../modules.md#scalarattributetype) |
| `pk` | `boolean` |
| `sk` | `boolean` |

#### Returns

[`DbDynamoTableColumn`](DbDynamoTableColumn.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:970](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L970)

## Properties

### attrType

• `Readonly` **attrType**: [`ScalarAttributeType`](../modules.md#scalarattributetype)

#### Defined in

[src/resource/DbResource.ts:966](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L966)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L173)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L172)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L169)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L175)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:174](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L174)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L171)

___

### pk

• `Readonly` **pk**: `boolean`

#### Defined in

[src/resource/DbResource.ts:967](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L967)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L170)

___

### sk

• `Readonly` **sk**: `boolean`

#### Defined in

[src/resource/DbResource.ts:968](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L968)

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

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L190)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:199](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L199)

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

[src/resource/DbResource.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L211)

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

[src/resource/DbResource.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L203)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:986](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L986)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:195](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L195)

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

[src/resource/DbResource.ts:254](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L254)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:982](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L982)
