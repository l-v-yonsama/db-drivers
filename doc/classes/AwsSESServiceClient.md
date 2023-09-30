[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsSESServiceClient

# Class: AwsSESServiceClient

## Hierarchy

- [`AwsServiceClient`](AwsServiceClient.md)

  ↳ **`AwsSESServiceClient`**

## Table of contents

### Constructors

- [constructor](AwsSESServiceClient.md#constructor)

### Properties

- [conRes](AwsSESServiceClient.md#conres)
- [config](AwsSESServiceClient.md#config)
- [isConnected](AwsSESServiceClient.md#isconnected)
- [sesClient](AwsSESServiceClient.md#sesclient)

### Methods

- [closeSub](AwsSESServiceClient.md#closesub)
- [connect](AwsSESServiceClient.md#connect)
- [connectSub](AwsSESServiceClient.md#connectsub)
- [disconnect](AwsSESServiceClient.md#disconnect)
- [getInfomationSchemas](AwsSESServiceClient.md#getinfomationschemas)
- [getSendQuota](AwsSESServiceClient.md#getsendquota)
- [getSendStatistics](AwsSESServiceClient.md#getsendstatistics)
- [initBaseStatus](AwsSESServiceClient.md#initbasestatus)
- [listIdentities](AwsSESServiceClient.md#listidentities)
- [test](AwsSESServiceClient.md#test)
- [testSub](AwsSESServiceClient.md#testsub)
- [verifyDomainIdentity](AwsSESServiceClient.md#verifydomainidentity)
- [verifyEmailAddress](AwsSESServiceClient.md#verifyemailaddress)

## Constructors

### constructor

• **new AwsSESServiceClient**(`conRes`, `config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `conRes` | [`ConnectionSetting`](../modules.md#connectionsetting) |
| `config` | [`ClientConfigType`](../modules.md#clientconfigtype) |

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[constructor](AwsServiceClient.md#constructor)

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:47](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L47)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsServiceClient.ts#L8)

___

### sesClient

• **sesClient**: `SESClient`

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:45](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L45)

## Methods

### closeSub

▸ `Protected` **closeSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L118)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ `Protected` **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:51](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L51)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsServiceClient.ts#L58)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:107](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L107)

___

### getSendQuota

▸ **getSendQuota**(): `Promise`<`GetSendQuotaCommandOutput`\>

#### Returns

`Promise`<`GetSendQuotaCommandOutput`\>

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:99](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L99)

___

### getSendStatistics

▸ **getSendStatistics**(): `Promise`<`GetSendStatisticsCommandOutput`\>

#### Returns

`Promise`<`GetSendStatisticsCommandOutput`\>

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:103](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L103)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[drivers/aws/AwsServiceClient.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsServiceClient.ts#L54)

___

### listIdentities

▸ **listIdentities**(`identityType`): `Promise`<`string`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `identityType` | `IdentityType` |

#### Returns

`Promise`<`string`[]\>

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:62](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L62)

___

### test

▸ **test**(`with_connect?`): `Promise`<`string`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `with_connect` | `boolean` | `false` |

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[test](AwsServiceClient.md#test)

#### Defined in

[drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ `Protected` **testSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:56](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L56)

___

### verifyDomainIdentity

▸ **verifyDomainIdentity**(`domain`): `Promise`<`VerifyDomainIdentityCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `domain` | `string` |

#### Returns

`Promise`<`VerifyDomainIdentityCommandOutput`\>

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:89](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L89)

___

### verifyEmailAddress

▸ **verifyEmailAddress**(`emailAddress`): `Promise`<`VerifyEmailAddressCommandOutput`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `emailAddress` | `string` |

#### Returns

`Promise`<`VerifyEmailAddressCommandOutput`\>

#### Defined in

[drivers/aws/AwsSESServiceClient.ts:79](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/drivers/aws/AwsSESServiceClient.ts#L79)
