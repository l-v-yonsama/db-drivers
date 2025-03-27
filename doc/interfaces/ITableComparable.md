[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / ITableComparable

# Interface: ITableComparable

## Implemented by

- [`DbDynamoTable`](../classes/DbDynamoTable.md)
- [`DbTable`](../classes/DbTable.md)

## Table of contents

### Methods

- [getCompareKeys](ITableComparable.md#getcomparekeys)

## Methods

### getCompareKeys

▸ **getCompareKeys**(`availableColumnNames?`): `CompareKey`[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `availableColumnNames?` | `string`[] |

#### Returns

`CompareKey`[]

#### Defined in

[src/resource/DbResource.ts:659](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L659)
