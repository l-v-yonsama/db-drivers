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

[resource/DbResource.ts:567](https://github.com/l-v-yonsama/db-drivers/blob/20aaf5c/src/resource/DbResource.ts#L567)

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
