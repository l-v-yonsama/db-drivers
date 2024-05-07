[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbS3Owner

# Class: DbS3Owner

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)<{}\>

  ↳ **`DbS3Owner`**

## Table of contents

### Constructors

- [constructor](DbS3Owner.md#constructor)

### Properties

- [attr](DbS3Owner.md#attr)
- [children](DbS3Owner.md#children)
- [comment](DbS3Owner.md#comment)
- [id](DbS3Owner.md#id)
- [isInProgress](DbS3Owner.md#isinprogress)
- [meta](DbS3Owner.md#meta)
- [name](DbS3Owner.md#name)
- [ownerId](DbS3Owner.md#ownerid)
- [resourceType](DbS3Owner.md#resourcetype)

### Methods

- [addChild](DbS3Owner.md#addchild)
- [clearChildren](DbS3Owner.md#clearchildren)
- [findChildren](DbS3Owner.md#findchildren)
- [getChildByName](DbS3Owner.md#getchildbyname)
- [getProperties](DbS3Owner.md#getproperties)
- [hasChildren](DbS3Owner.md#haschildren)
- [setPropertyFormat](DbS3Owner.md#setpropertyformat)
- [toJsonStringify](DbS3Owner.md#tojsonstringify)
- [toString](DbS3Owner.md#tostring)

## Constructors

### constructor

• **new DbS3Owner**(`ownerId`, `name`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ownerId` | `string` |
| `name` | `string` |

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:945](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L945)

## Properties

### attr

• `Readonly` **attr**: `Object`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:833](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L833)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:146](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L146)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:145](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L145)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:142](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L142)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L148)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L147)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:144](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L144)

___

### ownerId

• `Readonly` **ownerId**: `string`

#### Defined in

[src/resource/DbResource.ts:945](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L945)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L143)

## Methods

### addChild

▸ **addChild**(`res`): [`AllSubDbResource`](../modules.md#allsubdbresource)

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | [`AllSubDbResource`](../modules.md#allsubdbresource) |

#### Returns

[`AllSubDbResource`](../modules.md#allsubdbresource)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[addChild](AwsDbResource.md#addchild)

#### Defined in

[src/resource/DbResource.ts:163](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L163)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:172](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L172)

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

[AwsDbResource](AwsDbResource.md).[findChildren](AwsDbResource.md#findchildren)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L184)

___

### getChildByName

▸ **getChildByName**(`name`, `insensitive?`): [`AllSubDbResource`](../modules.md#allsubdbresource)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `insensitive?` | `boolean` |

#### Returns

[`AllSubDbResource`](../modules.md#allsubdbresource)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getChildByName](AwsDbResource.md#getchildbyname)

#### Defined in

[src/resource/DbResource.ts:176](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L176)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:949](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L949)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L168)

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

[src/resource/DbResource.ts:838](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L838)

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

[src/resource/DbResource.ts:227](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L227)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:224](https://github.com/l-v-yonsama/db-drivers/blob/dea2517/src/resource/DbResource.ts#L224)
