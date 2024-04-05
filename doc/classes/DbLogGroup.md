[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbLogGroup

# Class: DbLogGroup

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)<{ `creationTime?`: `number` ; `kmsKeyId?`: `string` ; `retentionInDays?`: `number` ; `storedBytes?`: `number`  }\>

  ↳ **`DbLogGroup`**

## Table of contents

### Constructors

- [constructor](DbLogGroup.md#constructor)

### Properties

- [attr](DbLogGroup.md#attr)
- [children](DbLogGroup.md#children)
- [comment](DbLogGroup.md#comment)
- [id](DbLogGroup.md#id)
- [isInProgress](DbLogGroup.md#isinprogress)
- [meta](DbLogGroup.md#meta)
- [name](DbLogGroup.md#name)
- [resourceType](DbLogGroup.md#resourcetype)

### Methods

- [addChild](DbLogGroup.md#addchild)
- [clearChildren](DbLogGroup.md#clearchildren)
- [findChildren](DbLogGroup.md#findchildren)
- [getChildByName](DbLogGroup.md#getchildbyname)
- [getProperties](DbLogGroup.md#getproperties)
- [hasChildren](DbLogGroup.md#haschildren)
- [setPropertyFormat](DbLogGroup.md#setpropertyformat)
- [toJsonStringify](DbLogGroup.md#tojsonstringify)
- [toString](DbLogGroup.md#tostring)

## Constructors

### constructor

• **new DbLogGroup**(`name`, `attr`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `attr` | `Object` |
| `attr.creationTime?` | `number` |
| `attr.kmsKeyId?` | `string` |
| `attr.retentionInDays?` | `number` |
| `attr.storedBytes?` | `number` |

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:863](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L863)

## Properties

### attr

• `Readonly` **attr**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `creationTime?` | `number` |
| `kmsKeyId?` | `string` |
| `retentionInDays?` | `number` |
| `storedBytes?` | `number` |

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:793](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L793)

___

### children

• `Readonly` **children**: [`AllSubDbResource`](../modules.md#allsubdbresource)[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:117](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L117)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:116](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L116)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:113](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L113)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:119](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L119)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:118](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L118)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:115](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L115)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype-1)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:114](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L114)

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

[src/resource/DbResource.ts:134](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L134)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:143](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L143)

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

[src/resource/DbResource.ts:155](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L155)

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

[src/resource/DbResource.ts:147](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L147)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:809](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L809)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:139](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L139)

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

[src/resource/DbResource.ts:798](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L798)

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

[src/resource/DbResource.ts:192](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L192)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/a093526/src/resource/DbResource.ts#L189)
