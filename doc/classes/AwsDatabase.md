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

[src/resource/DbResource.ts:367](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L367)

## Properties

### children

• `Readonly` **children**: ([`DbDynamoTable`](DbDynamoTable.md) \| [`DbS3Bucket`](DbS3Bucket.md) \| [`DbSQSQueue`](DbSQSQueue.md) \| [`DbLogGroup`](DbLogGroup.md) \| [`DbS3Owner`](DbS3Owner.md))[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L170)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L169)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:166](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L166)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L172)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L171)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L168)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L167)

___

### serviceType

• `Readonly` **serviceType**: [`AwsServiceType`](../modules.md#awsservicetype)

#### Defined in

[src/resource/DbResource.ts:367](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L367)

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

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L187)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:196](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L196)

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

[src/resource/DbResource.ts:208](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L208)

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

[src/resource/DbResource.ts:200](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L200)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L180)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L192)

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

[src/resource/DbResource.ts:251](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L251)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:248](https://github.com/l-v-yonsama/db-drivers/blob/4cace6e4381dbc5a94d2a63c97a522b7ef7f0f7a/src/resource/DbResource.ts#L248)
