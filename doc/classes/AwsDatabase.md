[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsDatabase

# Class: AwsDatabase

## Hierarchy

- [`DbResource`](DbResource.md)\<[`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) \| [`DbDynamoTable`](DbDynamoTable.md)\>

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

• **new AwsDatabase**(`name`, `serviceType`): [`AwsDatabase`](AwsDatabase.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `serviceType` | [`AwsServiceType`](../modules.md#awsservicetype) |

#### Returns

[`AwsDatabase`](AwsDatabase.md)

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:370](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L370)

## Properties

### children

• `Readonly` **children**: ([`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) \| [`DbDynamoTable`](DbDynamoTable.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L173)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L172)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L169)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:175](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L175)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:174](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L174)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L171)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L170)

___

### serviceType

• `Readonly` **serviceType**: [`AwsServiceType`](../modules.md#awsservicetype)

#### Defined in

[src/resource/DbResource.ts:370](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L370)

## Methods

### addChild

▸ **addChild**(`res`): [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) \| [`DbDynamoTable`](DbDynamoTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) \| [`DbDynamoTable`](DbDynamoTable.md) |

#### Returns

[`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) \| [`DbDynamoTable`](DbDynamoTable.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L190)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:199](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L199)

___

### findChildren

▸ **findChildren**\<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)\<[`AllSubDbResource`](../modules.md#allsubdbresource), `U`\> = [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `keyword?` | `string` \| `RegExp` |
| › `recursively?` | `boolean` |
| › `resourceType` | [`ResourceType`](../modules.md#resourcetype) |

#### Returns

`U`[]

#### Inherited from

[DbResource](DbResource.md).[findChildren](DbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:211](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L211)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) \| [`DbDynamoTable`](DbDynamoTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) \| [`DbDynamoTable`](DbDynamoTable.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:203](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L203)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L183)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:195](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L195)

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

[src/resource/DbResource.ts:254](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L254)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/a33574b0381e3eacbae1eadf11ab70ba4b011c93/src/resource/DbResource.ts#L251)
