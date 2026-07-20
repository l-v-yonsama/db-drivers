[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / Scannable

# Interface: Scannable\<P\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `P` | extends [`ScanParams`](../modules.md#scanparams) = [`ScanParams`](../modules.md#scanparams) |

## Implemented by

- [`Auth0Driver`](../classes/Auth0Driver.md)
- [`AwsCloudwatchServiceClient`](../classes/AwsCloudwatchServiceClient.md)
- [`AwsS3ServiceClient`](../classes/AwsS3ServiceClient.md)
- [`AwsSQSServiceClient`](../classes/AwsSQSServiceClient.md)
- [`KeycloakDriver`](../classes/KeycloakDriver.md)
- [`MemcacheDriver`](../classes/MemcacheDriver.md)
- [`MqttDriver`](../classes/MqttDriver.md)
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
| `params` | `P` |

#### Returns

`Promise`\<`ResultSetData`\>

#### Defined in

[src/drivers/BaseDriver.ts:7](https://github.com/l-v-yonsama/db-drivers/blob/eb74e2b4919ca09646dd7e3beb42ccfe11dd0070/src/drivers/BaseDriver.ts#L7)
