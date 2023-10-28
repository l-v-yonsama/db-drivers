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

[src/resource/ResultSetDataBuilder.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L146)

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

[src/resource/ResultSetDataBuilder.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L152)

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

[src/resource/ResultSetDataBuilder.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L134)

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

[src/resource/ResultSetDataBuilder.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L118)

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

[src/resource/ResultSetDataBuilder.ts:104](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L104)

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

[src/resource/ResultSetDataBuilder.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L206)

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

[src/resource/ResultSetDataBuilder.ts:73](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L73)

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

[src/resource/ResultSetDataBuilder.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L192)

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

[src/resource/ResultSetDataBuilder.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L181)

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

[src/resource/ResultSetDataBuilder.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L196)

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

[src/resource/ResultSetDataBuilder.ts:93](https://github.com/l-v-yonsama/db-drivers/blob/d4a4262/src/resource/ResultSetDataBuilder.ts#L93)
