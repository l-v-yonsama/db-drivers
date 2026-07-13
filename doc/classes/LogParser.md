[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / LogParser

# Class: LogParser

## Table of contents

### Constructors

- [constructor](LogParser.md#constructor)

### Methods

- [parse](LogParser.md#parse)

## Constructors

### constructor

• **new LogParser**(`config`): [`LogParser`](LogParser.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`LogParseConfig`](../modules.md#logparseconfig) |

#### Returns

[`LogParser`](LogParser.md)

#### Defined in

[src/utils/log/LogParser.ts:26](https://github.com/l-v-yonsama/db-drivers/blob/ffda0244cff7b512a8eb977d2491e0e1e433c911/src/utils/log/LogParser.ts#L26)

## Methods

### parse

▸ **parse**(`params`): [`ExtractedSqlResult`](../modules.md#extractedsqlresult)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`LogParseParams`](../modules.md#logparseparams) |

#### Returns

[`ExtractedSqlResult`](../modules.md#extractedsqlresult)

#### Defined in

[src/utils/log/LogParser.ts:32](https://github.com/l-v-yonsama/db-drivers/blob/ffda0244cff7b512a8eb977d2491e0e1e433c911/src/utils/log/LogParser.ts#L32)
