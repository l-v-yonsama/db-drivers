[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbKey

# Class: DbKey<T\>

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

• **new DbKey**<`T`\>(`name`, `params`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`RedisKeyParams`](../modules.md#rediskeyparams) \| [`S3KeyParams`](../modules.md#s3keyparams) \| [`SQSMessageParams`](../modules.md#sqsmessageparams) \| [`LogMessageParams`](../modules.md#logmessageparams) = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `params` | `T` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:682](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L682)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L124)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L123)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L120)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L126)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L125)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L122)

___

### params

• `Readonly` **params**: `T`

#### Defined in

[src/resource/DbResource.ts:680](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L680)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L121)

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

[src/resource/DbResource.ts:141](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L141)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L150)

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

[src/resource/DbResource.ts:162](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L162)

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

[src/resource/DbResource.ts:154](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L154)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:687](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L687)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L146)

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

[src/resource/DbResource.ts:199](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L199)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/c3ce384/src/resource/DbResource.ts#L196)
