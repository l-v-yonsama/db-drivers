[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbS3Bucket

# Class: DbS3Bucket

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)<{ `CreationDate?`: `Date`  }\>

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

• **new DbS3Bucket**(`name?`, `CreationDate?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name?` | `string` |
| `CreationDate?` | `Date` |

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[resource/DbResource.ts:533](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L533)

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

[resource/DbResource.ts:497](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L497)

___

### children

• `Readonly` **children**: `AllSubDbResource`[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[resource/DbResource.ts:112](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L112)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[resource/DbResource.ts:111](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L111)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[resource/DbResource.ts:108](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L108)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L114)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L113)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[resource/DbResource.ts:110](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L110)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[resource/DbResource.ts:109](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L109)

## Methods

### addChild

▸ **addChild**(`res`): `AllSubDbResource`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `AllSubDbResource` |

#### Returns

`AllSubDbResource`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[addChild](AwsDbResource.md#addchild)

#### Defined in

[resource/DbResource.ts:129](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L129)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[resource/DbResource.ts:138](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L138)

___

### findChildren

▸ **findChildren**<`U`\>(`«destructured»`): `U`[]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `U` | extends [`DbResource`](DbResource.md)<`AllSubDbResource`, `U`\> = `AllSubDbResource` |

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

[AwsDbResource](AwsDbResource.md).[findChildren](AwsDbResource.md#findchildren)

#### Defined in

[resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L150)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): `AllSubDbResource`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

`AllSubDbResource`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getChildByName](AwsDbResource.md#getchildbyname)

#### Defined in

[resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L142)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[resource/DbResource.ts:513](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L513)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L134)

___

### setPropertyFormat

▸ `Protected` **setPropertyFormat**(`«destructured»`): `void`

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

[resource/DbResource.ts:502](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L502)

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

[resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L187)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L184)
