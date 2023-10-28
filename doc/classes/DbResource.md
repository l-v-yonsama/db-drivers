[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbResource

# Class: DbResource<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](DbResource.md) = [`AllSubDbResource`](../modules.md#allsubdbresource) |

## Hierarchy

- **`DbResource`**

  ↳ [`DbConnection`](DbConnection.md)

  ↳ [`RdsDatabase`](RdsDatabase.md)

  ↳ [`AwsDatabase`](AwsDatabase.md)

  ↳ [`RedisDatabase`](RedisDatabase.md)

  ↳ [`DbSchema`](DbSchema.md)

  ↳ [`DbTable`](DbTable.md)

  ↳ [`DbKey`](DbKey.md)

  ↳ [`DbColumn`](DbColumn.md)

  ↳ [`AwsDbResource`](AwsDbResource.md)

## Table of contents

### Constructors

- [constructor](DbResource.md#constructor)

### Properties

- [children](DbResource.md#children)
- [comment](DbResource.md#comment)
- [id](DbResource.md#id)
- [isInProgress](DbResource.md#isinprogress)
- [meta](DbResource.md#meta)
- [name](DbResource.md#name)
- [resourceType](DbResource.md#resourcetype)

### Methods

- [addChild](DbResource.md#addchild)
- [clearChildren](DbResource.md#clearchildren)
- [findChildren](DbResource.md#findchildren)
- [getChildByName](DbResource.md#getchildbyname)
- [getProperties](DbResource.md#getproperties)
- [hasChildren](DbResource.md#haschildren)
- [toJsonStringify](DbResource.md#tojsonstringify)
- [toString](DbResource.md#tostring)

## Constructors

### constructor

• **new DbResource**<`T`\>(`resourceType`, `name`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`DbResource`](DbResource.md)<[`AllSubDbResource`](../modules.md#allsubdbresource), `T`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceType` | [`ResourceType`](../modules.md#resourcetype-1) |
| `name` | `string` |

#### Defined in

[src/resource/DbResource.ts:116](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L116)

## Properties

### children

• `Readonly` **children**: `T`[]

#### Defined in

[src/resource/DbResource.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L112)

___

### comment

• `Optional` **comment**: `string`

#### Defined in

[src/resource/DbResource.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L111)

___

### id

• `Readonly` **id**: `string`

#### Defined in

[src/resource/DbResource.ts:108](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L108)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L114)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L113)

___

### name

• `Readonly` **name**: `string`

#### Defined in

[src/resource/DbResource.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L110)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Defined in

[src/resource/DbResource.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L109)

## Methods

### addChild

▸ **addChild**(`res`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `T` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L129)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Defined in

[src/resource/DbResource.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L138)

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

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L150)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `T`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`T`

#### Defined in

[src/resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L142)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L122)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L134)

___

### toJsonStringify

▸ **toJsonStringify**(`space?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `space` | `number` | `0` |

#### Returns

`string`

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L187)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/DbResource.ts#L184)
