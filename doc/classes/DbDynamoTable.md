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

[src/resource/DbResource.ts:975](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L975)

## Properties

### attr

• `Readonly` **attr**: [`AwsDynamoTableAttributes`](../modules.md#awsdynamotableattributes)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:938](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L938)

___

### children

• `Readonly` **children**: [`DbDynamoTableColumn`](DbDynamoTableColumn.md)[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L188)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L187)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L184)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L190)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L186)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L185)

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

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L214)

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

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L226)

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

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L218)

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

[src/resource/DbResource.ts:1038](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L1038)

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

[src/resource/DbResource.ts:1015](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L1015)

___

### getPrimaryColumnNames

▸ **getPrimaryColumnNames**(): `string`[]

#### Returns

`string`[]

#### Defined in

[src/resource/DbResource.ts:1009](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L1009)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:983](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L983)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:943](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L943)

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

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/cec61c455c481dc5c826ace47074099184632153/src/resource/DbResource.ts#L266)
