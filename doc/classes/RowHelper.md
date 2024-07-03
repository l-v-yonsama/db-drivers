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

[src/resource/ResultSetDataBuilder.ts:164](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L164)

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

[src/resource/ResultSetDataBuilder.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L170)

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

[src/resource/ResultSetDataBuilder.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L152)

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

[src/resource/ResultSetDataBuilder.ts:136](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L136)

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

[src/resource/ResultSetDataBuilder.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L122)

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

[src/resource/ResultSetDataBuilder.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L224)

___

### getRuleEngineValues

▸ `Static` **getRuleEngineValues**(`row`, `keys`): `Record`<`string`, `any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | [`RdhRow`](../modules.md#rdhrow) |
| `keys` | [`RdhKey`](../modules.md#rdhkey)[] |

#### Returns

`Record`<`string`, `any`\>

#### Defined in

[src/resource/ResultSetDataBuilder.ts:94](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L94)

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

[src/resource/ResultSetDataBuilder.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L210)

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

[src/resource/ResultSetDataBuilder.ts:199](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L199)

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

[src/resource/ResultSetDataBuilder.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L214)

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

[src/resource/ResultSetDataBuilder.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/06a0bd6/src/resource/ResultSetDataBuilder.ts#L111)
