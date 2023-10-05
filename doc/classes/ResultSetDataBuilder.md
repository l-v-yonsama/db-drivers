[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / ResultSetDataBuilder

# Class: ResultSetDataBuilder

## Table of contents

### Constructors

- [constructor](ResultSetDataBuilder.md#constructor)

### Properties

- [rs](ResultSetDataBuilder.md#rs)

### Methods

- [addRow](ResultSetDataBuilder.md#addrow)
- [assign](ResultSetDataBuilder.md#assign)
- [assignFromDictionary](ResultSetDataBuilder.md#assignfromdictionary)
- [build](ResultSetDataBuilder.md#build)
- [clearRows](ResultSetDataBuilder.md#clearrows)
- [describe](ResultSetDataBuilder.md#describe)
- [drop](ResultSetDataBuilder.md#drop)
- [fillnull](ResultSetDataBuilder.md#fillnull)
- [hasAnyAnnotation](ResultSetDataBuilder.md#hasanyannotation)
- [hasKey](ResultSetDataBuilder.md#haskey)
- [keynames](ResultSetDataBuilder.md#keynames)
- [nextXYBatch](ResultSetDataBuilder.md#nextxybatch)
- [resetKeyTypeByRows](ResultSetDataBuilder.md#resetkeytypebyrows)
- [sampleCorrelation](ResultSetDataBuilder.md#samplecorrelation)
- [sampleXKeysGroupByClass](ResultSetDataBuilder.md#samplexkeysgroupbyclass)
- [setSqlStatement](ResultSetDataBuilder.md#setsqlstatement)
- [setSummary](ResultSetDataBuilder.md#setsummary)
- [splitRows](ResultSetDataBuilder.md#splitrows)
- [toCsv](ResultSetDataBuilder.md#tocsv)
- [toMarkdown](ResultSetDataBuilder.md#tomarkdown)
- [toMatrixArray](ResultSetDataBuilder.md#tomatrixarray)
- [toString](ResultSetDataBuilder.md#tostring)
- [toVector](ResultSetDataBuilder.md#tovector)
- [updateKeyAlign](ResultSetDataBuilder.md#updatekeyalign)
- [updateKeyComment](ResultSetDataBuilder.md#updatekeycomment)
- [updateKeyName](ResultSetDataBuilder.md#updatekeyname)
- [updateKeyWidth](ResultSetDataBuilder.md#updatekeywidth)
- [updateMeta](ResultSetDataBuilder.md#updatemeta)
- [createEmpty](ResultSetDataBuilder.md#createempty)
- [from](ResultSetDataBuilder.md#from)

## Constructors

### constructor

• **new ResultSetDataBuilder**(`keys`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `keys` | (`string` \| [`RdhKey`](../modules.md#rdhkey))[] |

#### Defined in

[src/resource/ResultSetDataBuilder.ts:261](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L261)

## Properties

### rs

• `Readonly` **rs**: [`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:259](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L259)

## Methods

### addRow

▸ **addRow**(`recordData`, `default_meta?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `recordData` | `any` |
| `default_meta?` | `any` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1221](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1221)

___

### assign

▸ **assign**(`key`, `list`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `list` | `any` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:642](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L642)

___

### assignFromDictionary

▸ **assignFromDictionary**(`new_key`, `existing_key`, `dictionary`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `new_key` | `string` |
| `existing_key` | `string` |
| `dictionary` | `string`[] |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:684](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L684)

___

### build

▸ **build**(): [`ResultSetData`](../modules.md#resultsetdata)

#### Returns

[`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:270](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L270)

___

### clearRows

▸ **clearRows**(): `void`

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1234](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1234)

___

### describe

▸ **describe**(): [`ResultSetData`](../modules.md#resultsetdata)

#### Returns

[`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:449](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L449)

___

### drop

▸ **drop**(`key`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:632](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L632)

___

### fillnull

▸ **fillnull**(`how`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `how` | ``"mean"`` \| ``"median"`` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1246](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1246)

___

### hasAnyAnnotation

▸ **hasAnyAnnotation**(`types`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `types` | [`AnnotationType`](../modules.md#annotationtype)[] |

#### Returns

`boolean`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1242](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1242)

___

### hasKey

▸ **hasKey**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`boolean`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:628](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L628)

___

### keynames

▸ **keynames**(`is_only_numeric_like?`): `string`[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `is_only_numeric_like` | `boolean` | `false` |

#### Returns

`string`[]

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1296](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1296)

___

### nextXYBatch

▸ **nextXYBatch**(`batch_size`, `xKeys`, `yKey`): [`any`[][], `any`[]]

#### Parameters

| Name | Type |
| :------ | :------ |
| `batch_size` | `number` |
| `xKeys` | `string`[] |
| `yKey` | `string` |

#### Returns

[`any`[][], `any`[]]

#### Defined in

[src/resource/ResultSetDataBuilder.ts:595](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L595)

___

### resetKeyTypeByRows

▸ **resetKeyTypeByRows**(): `void`

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1274](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1274)

___

### sampleCorrelation

▸ **sampleCorrelation**(`key_x`, `key_y`): `number`

The correlation is a measure of how correlated two datasets are, between -1 and 1

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key_x` | `string` | first input |
| `key_y` | `string` | first input |

#### Returns

`number`

sample correlation

#### Defined in

[src/resource/ResultSetDataBuilder.ts:443](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L443)

___

### sampleXKeysGroupByClass

▸ **sampleXKeysGroupByClass**(`numExamplesPerClass`, `xKeys`, `clazzKey`, `shuffle?`): [`SampleGroupByClass`](../modules.md#samplegroupbyclass)

Sample a data from each class of this resutlsets.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `numExamplesPerClass` | `number` | `undefined` | Number of examples per class. |
| `xKeys` | `string`[] | `undefined` | - |
| `clazzKey` | `string` | `undefined` | - |
| `shuffle` | `boolean` | `false` | - |

#### Returns

[`SampleGroupByClass`](../modules.md#samplegroupbyclass)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:542](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L542)

___

### setSqlStatement

▸ **setSqlStatement**(`sqlStatement`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sqlStatement` | `string` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1238](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1238)

___

### setSummary

▸ **setSummary**(`«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `affectedRows?` | `number` |
| › `changedRows?` | `number` |
| › `elapsedTimeMilli` | `number` |
| › `insertId?` | `number` |
| › `selectedRows?` | `number` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1305](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1305)

___

### splitRows

▸ **splitRows**(`test_percentage`, `with_shuffle?`): [[`ResultSetData`](../modules.md#resultsetdata), [`ResultSetData`](../modules.md#resultsetdata)]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `test_percentage` | `number` | `undefined` |
| `with_shuffle` | `boolean` | `false` |

#### Returns

[[`ResultSetData`](../modules.md#resultsetdata), [`ResultSetData`](../modules.md#resultsetdata)]

#### Defined in

[src/resource/ResultSetDataBuilder.ts:509](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L509)

___

### toCsv

▸ **toCsv**(`params?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`ToStringParam`](../modules.md#tostringparam) & { `delimiter?`: `string`  } |

#### Returns

`string`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:744](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L744)

___

### toMarkdown

▸ **toMarkdown**(`params?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`ToStringParam`](../modules.md#tostringparam) |

#### Returns

`string`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:896](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L896)

___

### toMatrixArray

▸ **toMatrixArray**(`key_names?`): `any`[][]

#### Parameters

| Name | Type |
| :------ | :------ |
| `key_names?` | `string`[] |

#### Returns

`any`[][]

#### Defined in

[src/resource/ResultSetDataBuilder.ts:726](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L726)

___

### toString

▸ **toString**(`params?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`ToStringParam`](../modules.md#tostringparam) |

#### Returns

`string`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1076](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L1076)

___

### toVector

▸ **toVector**(`key_name`, `is_only_number?`): `any`[]

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `key_name` | `string` | `undefined` |
| `is_only_number` | `boolean` | `false` |

#### Returns

`any`[]

#### Defined in

[src/resource/ResultSetDataBuilder.ts:711](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L711)

___

### updateKeyAlign

▸ **updateKeyAlign**(`keyName`, `align`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `keyName` | `string` |
| `align` | ``"left"`` \| ``"center"`` \| ``"right"`` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:306](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L306)

___

### updateKeyComment

▸ **updateKeyComment**(`keyName`, `comment`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `keyName` | `string` |
| `comment` | `string` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:274](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L274)

___

### updateKeyName

▸ **updateKeyName**(`keyName`, `newKeyName`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `keyName` | `string` |
| `newKeyName` | `string` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:281](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L281)

___

### updateKeyWidth

▸ **updateKeyWidth**(`keyName`, `width`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `keyName` | `string` |
| `width` | `number` |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:299](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L299)

___

### updateMeta

▸ **updateMeta**(`params`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`RdhMeta`](../modules.md#rdhmeta) |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:313](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L313)

___

### createEmpty

▸ `Static` **createEmpty**(): [`ResultSetData`](../modules.md#resultsetdata)

#### Returns

[`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:319](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L319)

___

### from

▸ `Static` **from**(`list`, `options?`): [`ResultSetDataBuilder`](ResultSetDataBuilder.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `any` |
| `options?` | `Object` |
| `options.keyNames?` | `string`[] |

#### Returns

[`ResultSetDataBuilder`](ResultSetDataBuilder.md)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:332](https://github.com/l-v-yonsama/db-drivers/blob/d6195e8/src/resource/ResultSetDataBuilder.ts#L332)
