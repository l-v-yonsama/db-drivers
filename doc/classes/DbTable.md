[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbTable

# Class: DbTable

## Hierarchy

- [`DbResource`](DbResource.md)<[`DbColumn`](DbColumn.md)\>

  ↳ **`DbTable`**

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

• **new DbTable**(`name`, `tableType`, `comment?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `tableType` | `any` |
| `comment?` | `string` |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:354](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L354)

## Properties

### children

• `Readonly` **children**: [`DbColumn`](DbColumn.md)[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L112)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L111)

___

### foreignKeys

• `Optional` **foreignKeys**: [`ForeignKeyConstraint`](../modules.md#foreignkeyconstraint) = `{}`

#### Defined in

[src/resource/DbResource.ts:351](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L351)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:108](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L108)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L114)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L113)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L110)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L109)

___

### tableType

• **tableType**: `any`

#### Defined in

[src/resource/DbResource.ts:350](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L350)

___

### uniqueKeys

• `Optional` **uniqueKeys**: [`UniqueKeyConstraint`](../modules.md#uniquekeyconstraint)[]

#### Defined in

[src/resource/DbResource.ts:352](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L352)

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

[src/resource/DbResource.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L129)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L138)

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

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L150)

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

[src/resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L142)

___

### getCompareKeys

▸ **getCompareKeys**(`availableColumnNames?`): [`CompareKey`](../modules.md#comparekey)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `availableColumnNames?` | `string`[] |

#### Returns

[`CompareKey`](../modules.md#comparekey)[]

#### Defined in

[src/resource/DbResource.ts:361](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L361)

___

### getPrimaryColumnNames

▸ **getPrimaryColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:409](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L409)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:423](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L423)

___

### getUniqColumnNames

▸ **getUniqColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:415](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L415)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L134)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L187)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Overrides

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:419](https://github.com/l-v-yonsama/db-drivers/blob/ab32d53/src/resource/DbResource.ts#L419)
