[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RdsDatabase

# Class: RdsDatabase

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbSchema`](DbSchema.md)\>

  ↳ **`RdsDatabase`**

## Table of contents

### Constructors

- [constructor](RdsDatabase.md#constructor)

### Properties

- [children](RdsDatabase.md#children)
- [comment](RdsDatabase.md#comment)
- [id](RdsDatabase.md#id)
- [isInProgress](RdsDatabase.md#isinprogress)
- [meta](RdsDatabase.md#meta)
- [name](RdsDatabase.md#name)
- [resourceType](RdsDatabase.md#resourcetype)
- [version](RdsDatabase.md#version)

### Methods

- [addChild](RdsDatabase.md#addchild)
- [clearChildren](RdsDatabase.md#clearchildren)
- [findChildren](RdsDatabase.md#findchildren)
- [getChildByName](RdsDatabase.md#getchildbyname)
- [getProperties](RdsDatabase.md#getproperties)
- [getSchema](RdsDatabase.md#getschema)
- [hasChildren](RdsDatabase.md#haschildren)
- [toJsonStringify](RdsDatabase.md#tojsonstringify)
- [toString](RdsDatabase.md#tostring)

## Constructors

### constructor

• **new RdsDatabase**(`name`): [`RdsDatabase`](RdsDatabase.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

[`RdsDatabase`](RdsDatabase.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:355](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L355)

## Properties

### children

• `Readonly` **children**: [`DbSchema`](DbSchema.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L180)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L182)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L181)

___

### version

• `Optional` **version**: `number`

#### Defined in

[src/resource/DbResource.ts:354](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L354)

## Methods

### addChild

▸ **addChild**(`res`): [`DbSchema`](DbSchema.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbSchema`](DbSchema.md) |

#### Returns

[`DbSchema`](DbSchema.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L222)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbSchema`](DbSchema.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbSchema`](DbSchema.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:359](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L359)

___

### getSchema

▸ **getSchema**(`option`): [`DbSchema`](DbSchema.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | `Object` |
| `option.isDefault?` | `boolean` |
| `option.name?` | `string` |

#### Returns

[`DbSchema`](DbSchema.md)

#### Defined in

[src/resource/DbResource.ts:366](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L366)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L206)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L262)
