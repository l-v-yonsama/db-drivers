[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / RowHelper

# Class: RowHelper

## Table of contents

### Constructors

- [constructor](RowHelper.md#constructor)

### Methods

- [clearAllAnnotations](RowHelper.md#clearallannotations)
- [clearAnnotationByType](RowHelper.md#clearannotationbytype)
- [filterAnnotationByKeyOf](RowHelper.md#filterannotationbykeyof)
- [filterAnnotationOf](RowHelper.md#filterannotationof)
- [getFirstAnnotationOf](RowHelper.md#getfirstannotationof)
- [getFirstRuleAnnotation](RowHelper.md#getfirstruleannotation)
- [getRuleEngineValues](RowHelper.md#getruleenginevalues)
- [hasAnnotation](RowHelper.md#hasannotation)
- [hasAnyAnnotation](RowHelper.md#hasanyannotation)
- [hasRuleAnnotation](RowHelper.md#hasruleannotation)
- [pushAnnotation](RowHelper.md#pushannotation)

## Constructors

### constructor

• **new RowHelper**()

## Methods

### clearAllAnnotations

▸ `Static` **clearAllAnnotations**(`row`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L167)

___

### clearAnnotationByType

▸ `Static` **clearAnnotationByType**(`row`, `type`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `type` | [`AnnotationType`](../modules.md#annotationtype) |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L173)

___

### filterAnnotationByKeyOf

▸ `Static` **filterAnnotationByKeyOf**<`T`\>(`row`, `key`, `type`): `T`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CellAnnotation`](../modules.md#cellannotation) = [`CellAnnotation`](../modules.md#cellannotation) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `key` | `string` |
| `type` | `T`[``"type"``] |

#### Returns

`T`[]

#### Defined in

[src/resource/ResultSetDataBuilder.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L155)

___

### filterAnnotationOf

▸ `Static` **filterAnnotationOf**<`T`\>(`row`, `type`): `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CellAnnotation`](../modules.md#cellannotation) = [`CellAnnotation`](../modules.md#cellannotation) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `type` | `T`[``"type"``] |

#### Returns

`Object`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L139)

___

### getFirstAnnotationOf

▸ `Static` **getFirstAnnotationOf**<`T`\>(`row`, `key`, `type`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CellAnnotation`](../modules.md#cellannotation) = [`CellAnnotation`](../modules.md#cellannotation) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `key` | `string` |
| `type` | `T`[``"type"``] |

#### Returns

`T`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L125)

___

### getFirstRuleAnnotation

▸ `Static` **getFirstRuleAnnotation**(`row`, `ruleDetail`): [`RuleAnnotation`](../modules.md#ruleannotation)

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `ruleDetail` | [`TableRuleDetail`](../modules.md#tableruledetail) |

#### Returns

[`RuleAnnotation`](../modules.md#ruleannotation)

#### Defined in

[src/resource/ResultSetDataBuilder.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L227)

___

### getRuleEngineValues

▸ `Static` **getRuleEngineValues**(`row`, `keys`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `keys` | [`RdhKey`](../modules.md#rdhkey)[] |

#### Returns

`Object`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L94)

___

### hasAnnotation

▸ `Static` **hasAnnotation**(`row`, `type`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `type` | [`AnnotationType`](../modules.md#annotationtype) |

#### Returns

`boolean`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:213](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L213)

___

### hasAnyAnnotation

▸ `Static` **hasAnyAnnotation**(`row`, `types`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `types` | [`AnnotationType`](../modules.md#annotationtype)[] |

#### Returns

`boolean`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:202](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L202)

___

### hasRuleAnnotation

▸ `Static` **hasRuleAnnotation**(`row`, `ruleDetail`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `ruleDetail` | [`TableRuleDetail`](../modules.md#tableruledetail) |

#### Returns

`boolean`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:217](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L217)

___

### pushAnnotation

▸ `Static` **pushAnnotation**(`row`, `key`, `annotation`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `key` | `string` |
| `annotation` | [`CellAnnotation`](../modules.md#cellannotation) |

#### Returns

`void`

#### Defined in

[src/resource/ResultSetDataBuilder.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/ae1242a/src/resource/ResultSetDataBuilder.ts#L114)
