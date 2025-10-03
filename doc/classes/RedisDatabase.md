[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RedisDatabase

# Class: RedisDatabase

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbKey`](DbKey.md)\>

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

• **new RedisDatabase**(`name`, `numOfKeys`): [`RedisDatabase`](RedisDatabase.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `numOfKeys` | `number` |

#### Returns

[`RedisDatabase`](RedisDatabase.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:393](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L393)

## Properties

### children

• `Readonly` **children**: [`DbKey`](DbKey.md)\<`any`\>[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L180)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L182)

___

### numOfKeys

• **numOfKeys**: `number`

#### Defined in

[src/resource/DbResource.ts:393](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L393)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L181)

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

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L222)

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

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L214)

___

### getDBIndex

▸ **getDBIndex**(): `number`

#### Returns

`number`

#### Defined in

[src/resource/DbResource.ts:397](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L397)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:401](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L401)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L206)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L262)
