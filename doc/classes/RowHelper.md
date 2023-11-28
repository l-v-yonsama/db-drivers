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

[src/resource/ResultSetDataBuilder.ts:157](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L157)

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

[src/resource/ResultSetDataBuilder.ts:163](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L163)

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

[src/resource/ResultSetDataBuilder.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L145)

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

[src/resource/ResultSetDataBuilder.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L129)

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

[src/resource/ResultSetDataBuilder.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L115)

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

[src/resource/ResultSetDataBuilder.ts:217](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L217)

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

[src/resource/ResultSetDataBuilder.ts:84](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L84)

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

[src/resource/ResultSetDataBuilder.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L203)

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

[src/resource/ResultSetDataBuilder.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L192)

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

[src/resource/ResultSetDataBuilder.ts:207](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L207)

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

[src/resource/ResultSetDataBuilder.ts:104](https://github.com/l-v-yonsama/db-drivers/blob/6a1707e/src/resource/ResultSetDataBuilder.ts#L104)
