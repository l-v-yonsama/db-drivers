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

[src/drivers/aws/AwsSESServiceClient.ts:25](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L25)

## Properties

### conRes

• `Protected` **conRes**: [`ConnectionSetting`](../modules.md#connectionsetting)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[conRes](AwsServiceClient.md#conres)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:9](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsServiceClient.ts#L9)

___

### config

• `Protected` **config**: [`ClientConfigType`](../modules.md#clientconfigtype)

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[config](AwsServiceClient.md#config)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:11](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsServiceClient.ts#L11)

___

### isConnected

• **isConnected**: `boolean`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[isConnected](AwsServiceClient.md#isconnected)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:8](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsServiceClient.ts#L8)

___

### sesClient

• **sesClient**: `SESClient`

#### Defined in

[src/drivers/aws/AwsSESServiceClient.ts:23](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L23)

## Methods

### closeSub

▸ `Protected` **closeSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[closeSub](AwsServiceClient.md#closesub)

#### Defined in

[src/drivers/aws/AwsSESServiceClient.ts:96](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L96)

___

### connect

▸ **connect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[connect](AwsServiceClient.md#connect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:17](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsServiceClient.ts#L17)

___

### connectSub

▸ `Protected` **connectSub**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[connectSub](AwsServiceClient.md#connectsub)

#### Defined in

[src/drivers/aws/AwsSESServiceClient.ts:29](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L29)

___

### disconnect

▸ **disconnect**(): `Promise`<`string`\>

#### Returns

`Promise`<`string`\>

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[disconnect](AwsServiceClient.md#disconnect)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:58](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsServiceClient.ts#L58)

___

### getInfomationSchemas

▸ **getInfomationSchemas**(): `Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Returns

`Promise`<[`AwsDatabase`](AwsDatabase.md)\>

#### Defined in

[src/drivers/aws/AwsSESServiceClient.ts:85](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L85)

___

### getSendQuota

▸ **getSendQuota**(): `Promise`<`GetSendQuotaCommandOutput`\>

#### Returns

`Promise`<`GetSendQuotaCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsSESServiceClient.ts:77](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L77)

___

### getSendStatistics

▸ **getSendStatistics**(): `Promise`<`GetSendStatisticsCommandOutput`\>

#### Returns

`Promise`<`GetSendStatisticsCommandOutput`\>

#### Defined in

[src/drivers/aws/AwsSESServiceClient.ts:81](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L81)

___

### initBaseStatus

▸ **initBaseStatus**(): `void`

#### Returns

`void`

#### Inherited from

[AwsServiceClient](AwsServiceClient.md).[initBaseStatus](AwsServiceClient.md#initbasestatus)

#### Defined in

[src/drivers/aws/AwsServiceClient.ts:54](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsServiceClient.ts#L54)

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

[src/drivers/aws/AwsSESServiceClient.ts:40](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L40)

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

[src/drivers/aws/AwsServiceClient.ts:36](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsServiceClient.ts#L36)

___

### testSub

▸ `Protected` **testSub**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Overrides

[AwsServiceClient](AwsServiceClient.md).[testSub](AwsServiceClient.md#testsub)

#### Defined in

[src/drivers/aws/AwsSESServiceClient.ts:34](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L34)

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

[src/drivers/aws/AwsSESServiceClient.ts:67](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L67)

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

[src/drivers/aws/AwsSESServiceClient.ts:57](https://github.com/l-v-yonsama/db-drivers/blob/d4478ef/src/drivers/aws/AwsSESServiceClient.ts#L57)
