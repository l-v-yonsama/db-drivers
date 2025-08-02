[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbTable

# Class: DbTable

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbColumn`](DbColumn.md)\>

  ↳ **`DbTable`**

## Implements

- [`ITableComparable`](../interfaces/ITableComparable.md)

## Table of contents

### Constructors

- [constructor](DbTable.md#constructor)

### Properties

- [children](DbTable.md#children)
- [comment](DbTable.md#comment)
- [foreignKeys](DbTable.md#foreignkeys)
- [id](DbTable.md#id)
- [isInProgress](DbTable.md#isinprogress)
- [meta](DbTable.md#meta)
- [name](DbTable.md#name)
- [resourceType](DbTable.md#resourcetype)
- [tableType](DbTable.md#tabletype)
- [uniqueKeys](DbTable.md#uniquekeys)

### Methods

- [addChild](DbTable.md#addchild)
- [clearChildren](DbTable.md#clearchildren)
- [findChildren](DbTable.md#findchildren)
- [getChildByName](DbTable.md#getchildbyname)
- [getCompareKeys](DbTable.md#getcomparekeys)
- [getPrimaryColumnNames](DbTable.md#getprimarycolumnnames)
- [getProperties](DbTable.md#getproperties)
- [getUniqColumnNames](DbTable.md#getuniqcolumnnames)
- [hasChildren](DbTable.md#haschildren)
- [toJsonStringify](DbTable.md#tojsonstringify)
- [toString](DbTable.md#tostring)

## Constructors

### constructor

• **new DbTable**(`name`, `tableType`, `comment?`): [`DbTable`](DbTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `tableType` | `any` |
| `comment?` | `string` |

#### Returns

[`DbTable`](DbTable.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:697](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L697)

## Properties

### children

• `Readonly` **children**: [`DbColumn`](DbColumn.md)[]

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

### foreignKeys

• `Optional` **foreignKeys**: [`ForeignKeyConstraint`](../modules.md#foreignkeyconstraint) = `{}`

#### Defined in

[src/resource/DbResource.ts:694](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L694)

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

### tableType

• **tableType**: `any`

#### Defined in

[src/resource/DbResource.ts:693](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L693)

___

### uniqueKeys

• `Optional` **uniqueKeys**: [`UniqueKeyConstraint`](../modules.md#uniquekeyconstraint)[]

#### Defined in

[src/resource/DbResource.ts:695](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L695)

## Methods

### addChild

▸ **addChild**(`res`): [`DbColumn`](DbColumn.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbColumn`](DbColumn.md) |

#### Returns

[`DbColumn`](DbColumn.md)

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

▸ **getChildByName**(`name`, `insensitive?`): [`DbColumn`](DbColumn.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbColumn`](DbColumn.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L214)

___

### getCompareKeys

▸ **getCompareKeys**(`availableColumnNames?`): `CompareKey`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `availableColumnNames?` | `string`[] |

#### Returns

`CompareKey`[]

#### Implementation of

[ITableComparable](../interfaces/ITableComparable.md).[getCompareKeys](../interfaces/ITableComparable.md#getcomparekeys)

#### Defined in

[src/resource/DbResource.ts:704](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L704)

___

### getPrimaryColumnNames

▸ **getPrimaryColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:752](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L752)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:766](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L766)

___

### getUniqColumnNames

▸ **getUniqColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:758](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L758)

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

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:762](https://github.com/l-v-yonsama/db-drivers/blob/3a1f947567650084d0221d011fc1037d83089c8e/src/resource/DbResource.ts#L762)
