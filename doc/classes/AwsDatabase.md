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

[src/resource/DbResource.ts:387](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L387)

## Properties

### children

• `Readonly` **children**: ([`DbDynamoTable`](DbDynamoTable.md) \| [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L180)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L182)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L181)

___

### serviceType

• `Readonly` **serviceType**: [`AwsServiceType`](../modules.md#awsservicetype)

#### Defined in

[src/resource/DbResource.ts:387](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L387)

## Methods

### addChild

▸ **addChild**(`res`): [`DbDynamoTable`](DbDynamoTable.md) \| [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`DbDynamoTable`](DbDynamoTable.md) \| [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md) |

#### Returns

[`DbDynamoTable`](DbDynamoTable.md) \| [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L222)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`DbDynamoTable`](DbDynamoTable.md) \| [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`DbDynamoTable`](DbDynamoTable.md) \| [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md)

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:194](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L194)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L206)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/6dca636a0c886e9c8a8ebcfb0637367700d5c904/src/resource/DbResource.ts#L262)
