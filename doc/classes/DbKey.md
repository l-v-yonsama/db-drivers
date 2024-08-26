[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbKey

# Class: DbKey\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RedisKeyParams`](../modules.md#rediskeyparams) \| [`S3KeyParams`](../modules.md#s3keyparams) \| [`SQSMessageParams`](../modules.md#sqsmessageparams) \| [`LogMessageParams`](../modules.md#logmessageparams) = `any` |

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`DbKey`**

## Table of contents

### Constructors

- [constructor](DbKey.md#constructor)

### Properties

- [children](DbKey.md#children)
- [comment](DbKey.md#comment)
- [id](DbKey.md#id)
- [isInProgress](DbKey.md#isinprogress)
- [meta](DbKey.md#meta)
- [name](DbKey.md#name)
- [params](DbKey.md#params)
- [resourceType](DbKey.md#resourcetype)

### Methods

- [addChild](DbKey.md#addchild)
- [clearChildren](DbKey.md#clearchildren)
- [findChildren](DbKey.md#findchildren)
- [getChildByName](DbKey.md#getchildbyname)
- [getProperties](DbKey.md#getproperties)
- [hasChildren](DbKey.md#haschildren)
- [toJsonStringify](DbKey.md#tojsonstringify)
- [toString](DbKey.md#tostring)

## Constructors

### constructor

• **new DbKey**\<`T`\>(`name`, `params`): [`DbKey`](DbKey.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RedisKeyParams`](../modules.md#rediskeyparams) \| [`S3KeyParams`](../modules.md#s3keyparams) \| [`SQSMessageParams`](../modules.md#sqsmessageparams) \| [`LogMessageParams`](../modules.md#logmessageparams) = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `params` | `T` |

#### Returns

[`DbKey`](DbKey.md)\<`T`\>

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:719](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L719)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L151)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L150)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L147)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L153)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L152)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L149)

___

### params

• `Readonly` **params**: `T`

#### Defined in

[src/resource/DbResource.ts:717](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L717)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L148)

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

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L168)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L177)

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

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L189)

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

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L181)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:724](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L724)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L173)

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

[src/resource/DbResource.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L232)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/8a6ac8fc7b670ba9ab4cc0cf2f458615d3a44507/src/resource/DbResource.ts#L229)
