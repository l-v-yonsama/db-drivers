[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbColumn

# Class: DbColumn

## Hierarchy

- [`DbResource`](DbResource.md)

  ↳ **`DbColumn`**

## Table of contents

### Constructors

- [constructor](DbColumn.md#constructor)

### Properties

- [children](DbColumn.md#children)
- [colType](DbColumn.md#coltype)
- [comment](DbColumn.md#comment)
- [default](DbColumn.md#default)
- [extra](DbColumn.md#extra)
- [id](DbColumn.md#id)
- [isInProgress](DbColumn.md#isinprogress)
- [meta](DbColumn.md#meta)
- [name](DbColumn.md#name)
- [nullable](DbColumn.md#nullable)
- [primaryKey](DbColumn.md#primarykey)
- [resourceType](DbColumn.md#resourcetype)
- [uniqKey](DbColumn.md#uniqkey)

### Methods

- [addChild](DbColumn.md#addchild)
- [clearChildren](DbColumn.md#clearchildren)
- [findChildren](DbColumn.md#findchildren)
- [getChildByName](DbColumn.md#getchildbyname)
- [getProperties](DbColumn.md#getproperties)
- [hasChildren](DbColumn.md#haschildren)
- [toJsonStringify](DbColumn.md#tojsonstringify)
- [toString](DbColumn.md#tostring)

## Constructors

### constructor

• **new DbColumn**(`name`, `colType`, `params`, `comment?`): [`DbColumn`](DbColumn.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `colType` | `GeneralColumnType` |
| `params` | `any` |
| `comment?` | `string` |

#### Returns

[`DbColumn`](DbColumn.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:861](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L861)

## Properties

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L184)

___

### colType

• `Readonly` **colType**: `GeneralColumnType`

#### Defined in

[src/resource/DbResource.ts:855](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L855)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L183)

___

### default

• `Readonly` **default**: `any`

#### Defined in

[src/resource/DbResource.ts:859](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L859)

___

### extra

• `Readonly` **extra**: `any`

#### Defined in

[src/resource/DbResource.ts:860](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L860)

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

### nullable

• `Readonly` **nullable**: `boolean`

#### Defined in

[src/resource/DbResource.ts:856](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L856)

___

### primaryKey

• `Readonly` **primaryKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:857](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L857)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L181)

___

### uniqKey

• `Readonly` **uniqKey**: `boolean`

#### Defined in

[src/resource/DbResource.ts:858](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L858)

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

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:885](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L885)

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

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:881](https://github.com/l-v-yonsama/db-drivers/blob/dbf56f0917827861bdd341e3cebf3873008ec11c/src/resource/DbResource.ts#L881)
