[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / SQLServerColumnType

# Namespace: SQLServerColumnType

## Table of contents

### Functions

- [parse](SQLServerColumnType.md#parse)
- [parseByFieldInfo](SQLServerColumnType.md#parsebyfieldinfo)

## Functions

### parse

▸ **parse**(`s`): [`SQLServerColumnType`](../enums/SQLServerColumnType-1.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `string` \| `number` |

#### Returns

[`SQLServerColumnType`](../enums/SQLServerColumnType-1.md)

#### Defined in

[src/types/resource/SQLServerColumnType.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/types/resource/SQLServerColumnType.ts#L167)

___

### parseByFieldInfo

▸ **parseByFieldInfo**(`fieldInfo`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fieldInfo` | [`ResultColumn`](../modules.md#resultcolumn) |

#### Returns

`number`

#### Defined in

[src/types/resource/SQLServerColumnType.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/5b07754aec5ab1ee49952d553b019dc09014695b/src/types/resource/SQLServerColumnType.ts#L79)
