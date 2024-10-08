[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / ISQLSupportDriver

# Interface: ISQLSupportDriver

## Implemented by

- [`AwsDriver`](../classes/AwsDriver.md)
- [`RDSBaseDriver`](../classes/RDSBaseDriver.md)

## Table of contents

### Methods

- [count](ISQLSupportDriver.md#count)
- [countSql](ISQLSupportDriver.md#countsql)
- [explainAnalyzeSql](ISQLSupportDriver.md#explainanalyzesql)
- [explainSql](ISQLSupportDriver.md#explainsql)
- [getPositionalCharacter](ISQLSupportDriver.md#getpositionalcharacter)
- [isLimitAsTop](ISQLSupportDriver.md#islimitastop)
- [isPositionedParameterAvailable](ISQLSupportDriver.md#ispositionedparameteravailable)
- [isSchemaSpecificationSvailable](ISQLSupportDriver.md#isschemaspecificationsvailable)
- [kill](ISQLSupportDriver.md#kill)
- [requestSql](ISQLSupportDriver.md#requestsql)

## Methods

### count

▸ **count**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`SchemaAndTableName`](SchemaAndTableName.md) |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/ISQLSupportDriver.ts:22](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L22)

___

### countSql

▸ **countSql**(`params`): `Promise`\<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`number`\>

#### Defined in

[src/drivers/ISQLSupportDriver.ts:24](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L24)

___

### explainAnalyzeSql

▸ **explainAnalyzeSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/ISQLSupportDriver.ts:20](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L20)

___

### explainSql

▸ **explainSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/ISQLSupportDriver.ts:18](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L18)

___

### getPositionalCharacter

▸ **getPositionalCharacter**(): `string`

#### Returns

`string`

#### Defined in

[src/drivers/ISQLSupportDriver.ts:10](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L10)

___

### isLimitAsTop

▸ **isLimitAsTop**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/ISQLSupportDriver.ts:14](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L14)

___

### isPositionedParameterAvailable

▸ **isPositionedParameterAvailable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/ISQLSupportDriver.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L8)

___

### isSchemaSpecificationSvailable

▸ **isSchemaSpecificationSvailable**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/drivers/ISQLSupportDriver.ts:12](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L12)

___

### kill

▸ **kill**(`sesssionOrPid?`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `sesssionOrPid?` | `number` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[src/drivers/ISQLSupportDriver.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L26)

___

### requestSql

▸ **requestSql**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`QueryParams`](../modules.md#queryparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/ISQLSupportDriver.ts:16](https://github.com/l-v-yonsama/db-drivers/blob/c496f2d46dad4f01baa17daa9b83005c004e64ca/src/drivers/ISQLSupportDriver.ts#L16)
