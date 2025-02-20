[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbDynamoTable

# Class: DbDynamoTable

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)\<[`AwsDynamoTableAttributes`](../modules.md#awsdynamotableattributes), [`DbDynamoTableColumn`](DbDynamoTableColumn.md)\>

  ↳ **`DbDynamoTable`**

## Implements

- [`ITableComparable`](../interfaces/ITableComparable.md)

## Table of contents

### Constructors

- [constructor](DbDynamoTable.md#constructor)

### Properties

- [attr](DbDynamoTable.md#attr)
- [children](DbDynamoTable.md#children)
- [comment](DbDynamoTable.md#comment)
- [id](DbDynamoTable.md#id)
- [isInProgress](DbDynamoTable.md#isinprogress)
- [meta](DbDynamoTable.md#meta)
- [name](DbDynamoTable.md#name)
- [resourceType](DbDynamoTable.md#resourcetype)

### Methods

- [addChild](DbDynamoTable.md#addchild)
- [clearChildren](DbDynamoTable.md#clearchildren)
- [findChildren](DbDynamoTable.md#findchildren)
- [getChildByName](DbDynamoTable.md#getchildbyname)
- [getCompareKeys](DbDynamoTable.md#getcomparekeys)
- [getPkAndSkByIndex](DbDynamoTable.md#getpkandskbyindex)
- [getPrimaryColumnNames](DbDynamoTable.md#getprimarycolumnnames)
- [getProperties](DbDynamoTable.md#getproperties)
- [hasChildren](DbDynamoTable.md#haschildren)
- [setPropertyFormat](DbDynamoTable.md#setpropertyformat)
- [toJsonStringify](DbDynamoTable.md#tojsonstringify)
- [toString](DbDynamoTable.md#tostring)

## Constructors

### constructor

• **new DbDynamoTable**(`name`, `attr`): [`DbDynamoTable`](DbDynamoTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `attr` | [`AwsDynamoTableAttributes`](../modules.md#awsdynamotableattributes) |

#### Returns

[`DbDynamoTable`](DbDynamoTable.md)

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:914](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L914)

## Properties

### attr

• `Readonly` **attr**: [`AwsDynamoTableAttributes`](../modules.md#awsdynamotableattributes)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:877](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L877)

___

### children

• `Readonly` **children**: [`DbDynamoTableColumn`](DbDynamoTableColumn.md)[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L171)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L170)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L167)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L173)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L172)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L169)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L168)

## Methods

### addChild

▸ **addChild**(`res`): [`DbDynamoTableColumn`](DbDynamoTableColumn.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbDynamoTableColumn`](DbDynamoTableColumn.md) |

#### Returns

[`DbDynamoTableColumn`](DbDynamoTableColumn.md)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[addChild](AwsDbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L188)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L197)

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

[AwsDbResource](AwsDbResource.md).[findChildren](AwsDbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L209)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbDynamoTableColumn`](DbDynamoTableColumn.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbDynamoTableColumn`](DbDynamoTableColumn.md)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getChildByName](AwsDbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L201)

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

[src/resource/DbResource.ts:977](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L977)

___

### getPkAndSkByIndex

▸ **getPkAndSkByIndex**(`indexName?`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `indexName?` | `string` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `pk?` | `string` |
| `sk?` | `string` |

#### Defined in

[src/resource/DbResource.ts:954](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L954)

___

### getPrimaryColumnNames

▸ **getPrimaryColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:948](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L948)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:922](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L922)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L193)

___

### setPropertyFormat

▸ **setPropertyFormat**(`«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bytes?` | `string`[] |
| › `dates?` | `string`[] |

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[setPropertyFormat](AwsDbResource.md#setpropertyformat)

#### Defined in

[src/resource/DbResource.ts:882](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L882)

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

[AwsDbResource](AwsDbResource.md).[toJsonStringify](AwsDbResource.md#tojsonstringify)

#### Defined in

[src/resource/DbResource.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L252)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L249)
