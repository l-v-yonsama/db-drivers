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

[src/resource/DbResource.ts:713](https://github.com/l-v-yonsama/db-drivers/blob/32c8a2503691648cab78a1a83d35dd78ed150ba9/src/resource/DbResource.ts#L713)
