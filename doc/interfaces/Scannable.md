[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / Scannable

# Interface: Scannable

## Implemented by

- [`Auth0Driver`](../classes/Auth0Driver.md)
- [`AwsCloudwatchServiceClient`](../classes/AwsCloudwatchServiceClient.md)
- [`AwsS3ServiceClient`](../classes/AwsS3ServiceClient.md)
- [`AwsSQSServiceClient`](../classes/AwsSQSServiceClient.md)
- [`KeycloakDriver`](../classes/KeycloakDriver.md)
- [`RedisDriver`](../classes/RedisDriver.md)

## Table of contents

### Methods

- [scan](Scannable.md#scan)

## Methods

### scan

▸ **scan**(`params`): `Promise`\<`ResultSetData`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | [`ScanParams`](../modules.md#scanparams) |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/BaseDriver.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/drivers/BaseDriver.ts#L7)
