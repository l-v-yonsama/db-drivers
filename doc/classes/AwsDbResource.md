[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / AwsDbResource

# Class: AwsDbResource\<T, U\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |
| `U` | extends [`AllSubDbResource`](../modules.md#allsubdbresource) = `any` |

## Hierarchy

- [`DbResource`](DbResource.md)\<`U`\>

  ↳ **`AwsDbResource`**

  ↳↳ [`DbDynamoTable`](DbDynamoTable.md)

  ↳↳ [`DbS3Bucket`](DbS3Bucket.md)

  ↳↳ [`DbSQSQueue`](DbSQSQueue.md)

  ↳↳ [`DbLogGroup`](DbLogGroup.md)

  ↳↳ [`DbLogStream`](DbLogStream.md)

  ↳↳ [`DbS3Owner`](DbS3Owner.md)

## Table of contents

### Constructors

- [constructor](AwsDbResource.md#constructor)

### Properties

- [attr](AwsDbResource.md#attr)
- [children](AwsDbResource.md#children)
- [comment](AwsDbResource.md#comment)
- [id](AwsDbResource.md#id)
- [isInProgress](AwsDbResource.md#isinprogress)
- [meta](AwsDbResource.md#meta)
- [name](AwsDbResource.md#name)
- [resourceType](AwsDbResource.md#resourcetype)

### Methods

- [addChild](AwsDbResource.md#addchild)
- [clearChildren](AwsDbResource.md#clearchildren)
- [findChildren](AwsDbResource.md#findchildren)
- [getChildByName](AwsDbResource.md#getchildbyname)
- [getProperties](AwsDbResource.md#getproperties)
- [hasChildren](AwsDbResource.md#haschildren)
- [setPropertyFormat](AwsDbResource.md#setpropertyformat)
- [toJsonStringify](AwsDbResource.md#tojsonstringify)
- [toString](AwsDbResource.md#tostring)

## Constructors

### constructor

• **new AwsDbResource**\<`T`, `U`\>(`resourceType`, `name`, `attr`): [`AwsDbResource`](AwsDbResource.md)\<`T`, `U`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |
| `U` | extends [`AllSubDbResource`](../modules.md#allsubdbresource) = `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `resourceType` | [`ResourceType`](../modules.md#resourcetype) |
| `name` | `string` |
| `attr` | `T` |

#### Returns

[`AwsDbResource`](AwsDbResource.md)\<`T`, `U`\>

#### Overrides

[DbResource](DbResource.md).[constructor](DbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:904](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L904)

## Properties

### attr

• `Readonly` **attr**: `T`

#### Defined in

[src/resource/DbResource.ts:907](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L907)

___

### children

• `Readonly` **children**: `U`[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L180)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L182)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L181)

## Methods

### addChild

▸ **addChild**(`res`): `U`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `U` |

#### Returns

`U`

#### Inherited from

[DbResource](DbResource.md).[addChild](DbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L222)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `U`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`U`

#### Inherited from

[DbResource](DbResource.md).[getChildByName](DbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:923](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L923)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L206)

___

### setPropertyFormat

▸ **setPropertyFormat**(`«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `bytes?` | `string`[] |
| › `dates?` | `string`[] |

#### Returns

`void`

#### Defined in

[src/resource/DbResource.ts:912](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L912)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/2409a3e34edaf2eb90d98c7dbd3322519301b090/src/resource/DbResource.ts#L262)
