[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbS3Bucket

# Class: DbS3Bucket

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)\<\{ `CreationDate?`: `Date`  }\>

  ↳ **`DbS3Bucket`**

## Table of contents

### Constructors

- [constructor](DbS3Bucket.md#constructor)

### Properties

- [attr](DbS3Bucket.md#attr)
- [children](DbS3Bucket.md#children)
- [comment](DbS3Bucket.md#comment)
- [id](DbS3Bucket.md#id)
- [isInProgress](DbS3Bucket.md#isinprogress)
- [meta](DbS3Bucket.md#meta)
- [name](DbS3Bucket.md#name)
- [resourceType](DbS3Bucket.md#resourcetype)

### Methods

- [addChild](DbS3Bucket.md#addchild)
- [clearChildren](DbS3Bucket.md#clearchildren)
- [findChildren](DbS3Bucket.md#findchildren)
- [getChildByName](DbS3Bucket.md#getchildbyname)
- [getProperties](DbS3Bucket.md#getproperties)
- [hasChildren](DbS3Bucket.md#haschildren)
- [setPropertyFormat](DbS3Bucket.md#setpropertyformat)
- [toJsonStringify](DbS3Bucket.md#tojsonstringify)
- [toString](DbS3Bucket.md#tostring)

## Constructors

### constructor

• **new DbS3Bucket**(`name?`, `CreationDate?`): [`DbS3Bucket`](DbS3Bucket.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name?` | `string` |
| `CreationDate?` | `Date` |

#### Returns

[`DbS3Bucket`](DbS3Bucket.md)

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:1034](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L1034)

## Properties

### attr

• `Readonly` **attr**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `CreationDate?` | `Date` |

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:877](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L877)

___

### children

• `Readonly` **children**: `any`[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:171](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L171)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:170](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L170)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:167](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L167)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L173)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L172)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:169](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L169)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L168)

## Methods

### addChild

▸ **addChild**(`res`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `any` |

#### Returns

`any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[addChild](AwsDbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L188)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:197](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L197)

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

[AwsDbResource](AwsDbResource.md).[findChildren](AwsDbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:209](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L209)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getChildByName](AwsDbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L201)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:893](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L893)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:193](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L193)

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

#### Inherited from

[AwsDbResource](AwsDbResource.md).[setPropertyFormat](AwsDbResource.md#setpropertyformat)

#### Defined in

[src/resource/DbResource.ts:882](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L882)

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

[AwsDbResource](AwsDbResource.md).[toJsonStringify](AwsDbResource.md#tojsonstringify)

#### Defined in

[src/resource/DbResource.ts:252](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L252)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:249](https://github.com/l-v-yonsama/db-drivers/blob/9b84bf7085d0b11a9ac0eae102e4b16278d3ffa2/src/resource/DbResource.ts#L249)
