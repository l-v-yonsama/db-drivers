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

[src/resource/DbResource.ts:874](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L874)

## Properties

### attr

• `Readonly` **attr**: `T`

#### Defined in

[src/resource/DbResource.ts:877](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L877)

___

### children

• `Readonly` **children**: `U`[]

#### Inherited from

[DbResource](DbResource.md).[children](DbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L171)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[DbResource](DbResource.md).[comment](DbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L170)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[DbResource](DbResource.md).[id](DbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L167)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[DbResource](DbResource.md).[isInProgress](DbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L173)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[DbResource](DbResource.md).[meta](DbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L172)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[DbResource](DbResource.md).[name](DbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L169)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[DbResource](DbResource.md).[resourceType](DbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L168)

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

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L188)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[DbResource](DbResource.md).[clearChildren](DbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L197)

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

[src/resource/DbResource.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L209)

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

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L201)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[DbResource](DbResource.md).[getProperties](DbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:893](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L893)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[DbResource](DbResource.md).[hasChildren](DbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L193)

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

[src/resource/DbResource.ts:882](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L882)

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

[src/resource/DbResource.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L252)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[DbResource](DbResource.md).[toString](DbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/c1018cc5c0c7d7cc551a97b3d59595a89cfb2cb9/src/resource/DbResource.ts#L249)
