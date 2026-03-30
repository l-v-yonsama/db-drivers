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

[src/resource/DbResource.ts:721](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L721)

## Properties

### children

• `Readonly` **children**: [`DbColumn`](DbColumn.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L188)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L187)

___

### foreignKeys

• `Optional` **foreignKeys**: [`ForeignKeyConstraint`](../modules.md#foreignkeyconstraint) = `{}`

#### Defined in

[src/resource/DbResource.ts:718](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L718)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L184)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L190)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L186)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L185)

___

### tableType

• **tableType**: `any`

#### Defined in

[src/resource/DbResource.ts:717](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L717)

___

### uniqueKeys

• `Optional` **uniqueKeys**: [`UniqueKeyConstraint`](../modules.md#uniquekeyconstraint)[]

#### Defined in

[src/resource/DbResource.ts:719](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L719)

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

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L214)

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

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L226)

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

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L218)

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

[src/resource/DbResource.ts:728](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L728)

___

### getPrimaryColumnNames

▸ **getPrimaryColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:776](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L776)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:790](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L790)

___

### getUniqColumnNames

▸ **getUniqColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:782](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L782)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:786](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L786)
