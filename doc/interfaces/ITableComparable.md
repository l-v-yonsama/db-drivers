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

[src/resource/DbResource.ts:659](https://github.com/l-v-yonsama/db-drivers/blob/589f8dab34222f68a1015fcbec0cee53f0ccb545/src/resource/DbResource.ts#L659)
