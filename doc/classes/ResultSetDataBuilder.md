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
- [hasKeyComment](ResultSetDataBuilder.md#haskeycomment)
- [keynames](ResultSetDataBuilder.md#keynames)
- [nextXYBatch](ResultSetDataBuilder.md#nextxybatch)
- [resetKeyTypeByRows](ResultSetDataBuilder.md#resetkeytypebyrows)
- [sampleCorrelation](ResultSetDataBuilder.md#samplecorrelation)
- [sampleXKeysGroupByClass](ResultSetDataBuilder.md#samplexkeysgroupbyclass)
- [setSqlStatement](ResultSetDataBuilder.md#setsqlstatement)
- [setSummary](ResultSetDataBuilder.md#setsummary)
- [splitRows](ResultSetDataBuilder.md#splitrows)
- [toCsv](ResultSetDataBuilder.md#tocsv)
- [toHtml](ResultSetDataBuilder.md#tohtml)
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

[src/resource/ResultSetDataBuilder.ts:280](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L280)

## Properties

### rs

• `Readonly` **rs**: [`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:278](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L278)

## Methods

### addRow

▸ **addRow**(`recordData`, `defaultMeta?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `recordData` | `any` |
| `defaultMeta?` | [`RdhRowMeta`](../modules.md#rdhrowmeta) |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1440](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1440)

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

[src/resource/ResultSetDataBuilder.ts:677](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L677)

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

[src/resource/ResultSetDataBuilder.ts:719](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L719)

___

### build

▸ **build**(): [`ResultSetData`](../modules.md#resultsetdata)

#### Returns

[`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:289](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L289)

___

### clearRows

▸ **clearRows**(): `void`

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1453](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1453)

___

### describe

▸ **describe**(): [`ResultSetData`](../modules.md#resultsetdata)

#### Returns

[`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:478](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L478)

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

[src/resource/ResultSetDataBuilder.ts:667](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L667)

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

[src/resource/ResultSetDataBuilder.ts:1465](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1465)

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

[src/resource/ResultSetDataBuilder.ts:1461](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1461)

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

[src/resource/ResultSetDataBuilder.ts:659](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L659)

___

### hasKeyComment

▸ **hasKeyComment**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:663](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L663)

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

[src/resource/ResultSetDataBuilder.ts:1545](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1545)

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

[src/resource/ResultSetDataBuilder.ts:626](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L626)

___

### resetKeyTypeByRows

▸ **resetKeyTypeByRows**(): `void`

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1493](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1493)

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

[src/resource/ResultSetDataBuilder.ts:472](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L472)

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

[src/resource/ResultSetDataBuilder.ts:573](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L573)

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

[src/resource/ResultSetDataBuilder.ts:1457](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1457)

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

[src/resource/ResultSetDataBuilder.ts:1554](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1554)

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

[src/resource/ResultSetDataBuilder.ts:540](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L540)

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

[src/resource/ResultSetDataBuilder.ts:779](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L779)

___

### toHtml

▸ **toHtml**(`params?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `params?` | [`ToStringParam`](../modules.md#tostringparam) |

#### Returns

`string`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:1111](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1111)

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

[src/resource/ResultSetDataBuilder.ts:931](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L931)

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

[src/resource/ResultSetDataBuilder.ts:761](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L761)

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

[src/resource/ResultSetDataBuilder.ts:1295](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L1295)

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

[src/resource/ResultSetDataBuilder.ts:746](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L746)

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

[src/resource/ResultSetDataBuilder.ts:325](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L325)

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

[src/resource/ResultSetDataBuilder.ts:293](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L293)

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

[src/resource/ResultSetDataBuilder.ts:300](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L300)

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

[src/resource/ResultSetDataBuilder.ts:318](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L318)

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

[src/resource/ResultSetDataBuilder.ts:332](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L332)

___

### createEmpty

▸ `Static` **createEmpty**(): [`ResultSetData`](../modules.md#resultsetdata)

#### Returns

[`ResultSetData`](../modules.md#resultsetdata)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:338](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L338)

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

[src/resource/ResultSetDataBuilder.ts:351](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L351)
