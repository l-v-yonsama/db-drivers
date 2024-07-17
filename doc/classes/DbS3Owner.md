[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbS3Owner

# Class: DbS3Owner

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)\<{}\>

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

• **new DbS3Owner**(`ownerId`, `name`): [`DbS3Owner`](DbS3Owner.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ownerId` | `string` |
| `name` | `string` |

#### Returns

[`DbS3Owner`](DbS3Owner.md)

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:952](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L952)

## Properties

### attr

• `Readonly` **attr**: `Object`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:840](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L840)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:151](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L151)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:150](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L150)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L147)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:153](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L153)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:152](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L152)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:149](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L149)

___

### ownerId

• `Readonly` **ownerId**: `string`

#### Defined in

[src/resource/DbResource.ts:952](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L952)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:148](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L148)

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

[src/resource/DbResource.ts:168](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L168)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:177](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L177)

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

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L189)

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

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L181)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Overrides

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:956](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L956)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:173](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L173)

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

[src/resource/DbResource.ts:845](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L845)

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

[src/resource/DbResource.ts:232](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L232)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:229](https://github.com/l-v-yonsama/db-drivers/blob/723fdbe88a66c6f584f5a2e138c253c84e795b4b/src/resource/DbResource.ts#L229)
