[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsDatabase

# Class: AwsDatabase

## Hierarchy

- [`DbResource`](DbResource.md)<[`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)\>

  ↳ **`AwsDatabase`**

## Table of contents

### Constructors

- [constructor](AwsDatabase.md#constructor)

### Properties

- [children](AwsDatabase.md#children)
- [comment](AwsDatabase.md#comment)
- [id](AwsDatabase.md#id)
- [isInProgress](AwsDatabase.md#isinprogress)
- [meta](AwsDatabase.md#meta)
- [name](AwsDatabase.md#name)
- [resourceType](AwsDatabase.md#resourcetype)
- [serviceType](AwsDatabase.md#servicetype)

### Methods

- [addChild](AwsDatabase.md#addchild)
- [clearChildren](AwsDatabase.md#clearchildren)
- [findChildren](AwsDatabase.md#findchildren)
- [getChildByName](AwsDatabase.md#getchildbyname)
- [getProperties](AwsDatabase.md#getproperties)
- [hasChildren](AwsDatabase.md#haschildren)
- [toJsonStringify](AwsDatabase.md#tojsonstringify)
- [toString](AwsDatabase.md#tostring)

## Constructors

### constructor

• **new AwsDatabase**(`name`, `serviceType`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `serviceType` | [`AwsServiceType`](../modules.md#awsservicetype-1) |

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:300](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L300)

## Properties

### children

• `Readonly` **children**: ([`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:123](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L123)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:122](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L122)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L119)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:125](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L125)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:124](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L124)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:121](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L121)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:120](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L120)

___

### serviceType

• `Readonly` **serviceType**: [`AwsServiceType`](../modules.md#awsservicetype-1)

#### Defined in

[src/resource/DbResource.ts:300](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L300)

## Methods

### addChild

▸ **addChild**(`res`): [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) |

#### Returns

[`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:140](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L140)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L149)

___

### findChildren

▸ **findChildren**<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)<[`AllSubDbResource`](../modules.md#allsubdbresource), `U`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `keyword?` | `string` \| `RegExp` |
| › `recursively?` | `boolean` |
| › `resourceType` | [`ResourceType`](../modules.md#resourcetype-1) |

#### Returns

`U`[]

#### Inherited from

[DbResource](DbResource.md).[findChildren](DbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:161](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L161)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L153)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:133](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L133)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L145)

___

### toJsonStringify

▸ **toJsonStringify**(`space?`): `string`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `space` | `number` | `0` |

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toJsonStringify](DbResource.md#tojsonstringify)

#### Defined in

[src/resource/DbResource.ts:198](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L198)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:195](https://github.com/l-v-yonsama/db-drivers/blob/622eff5/src/resource/DbResource.ts#L195)
