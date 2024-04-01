[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RedisDatabase

# Class: RedisDatabase

## Hierarchy

- [`DbResource`](DbResource.md)<[`DbKey`](DbKey.md)\>

  ↳ **`RedisDatabase`**

## Table of contents

### Constructors

- [constructor](RedisDatabase.md#constructor)

### Properties

- [children](RedisDatabase.md#children)
- [comment](RedisDatabase.md#comment)
- [id](RedisDatabase.md#id)
- [isInProgress](RedisDatabase.md#isinprogress)
- [meta](RedisDatabase.md#meta)
- [name](RedisDatabase.md#name)
- [numOfKeys](RedisDatabase.md#numofkeys)
- [resourceType](RedisDatabase.md#resourcetype)

### Methods

- [addChild](RedisDatabase.md#addchild)
- [clearChildren](RedisDatabase.md#clearchildren)
- [findChildren](RedisDatabase.md#findchildren)
- [getChildByName](RedisDatabase.md#getchildbyname)
- [getDBIndex](RedisDatabase.md#getdbindex)
- [getProperties](RedisDatabase.md#getproperties)
- [hasChildren](RedisDatabase.md#haschildren)
- [toJsonStringify](RedisDatabase.md#tojsonstringify)
- [toString](RedisDatabase.md#tostring)

## Constructors

### constructor

• **new RedisDatabase**(`name`, `numOfKeys`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `numOfKeys` | `number` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:312](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L312)

## Properties

### children

• `Readonly` **children**: [`DbKey`](DbKey.md)<`any`\>[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L125)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L124)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L121)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:127](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L127)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:126](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L126)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L123)

___

### numOfKeys

• **numOfKeys**: `number`

#### Defined in

[src/resource/DbResource.ts:312](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L312)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L122)

## Methods

### addChild

▸ **addChild**(`res`): [`DbKey`](DbKey.md)<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbKey`](DbKey.md)<`any`\> |

#### Returns

[`DbKey`](DbKey.md)<`any`\>

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L142)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L151)

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

[src/resource/DbResource.ts:163](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L163)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbKey`](DbKey.md)<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbKey`](DbKey.md)<`any`\>

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L155)

___

### getDBIndex

▸ **getDBIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/resource/DbResource.ts:316](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L316)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:320](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L320)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L147)

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

[src/resource/DbResource.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L200)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/b24942f/src/resource/DbResource.ts#L197)
