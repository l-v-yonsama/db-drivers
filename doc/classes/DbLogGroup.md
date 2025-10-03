[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbLogGroup

# Class: DbLogGroup

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)\<\{ `creationTime?`: `number` ; `kmsKeyId?`: `string` ; `retentionInDays?`: `number` ; `storedBytes?`: `number`  }\>

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

• **new DbLogGroup**(`name`, `attr`): [`DbLogGroup`](DbLogGroup.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `attr` | `Object` |
| `attr.creationTime?` | `number` |
| `attr.kmsKeyId?` | `string` |
| `attr.retentionInDays?` | `number` |
| `attr.storedBytes?` | `number` |

#### Returns

[`DbLogGroup`](DbLogGroup.md)

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:1152](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L1152)

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

[src/resource/DbResource.ts:907](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L907)

___

### children

• `Readonly` **children**: `any`[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L184)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:183](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L183)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:180](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L180)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L186)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L185)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:182](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L182)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:181](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L181)

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

[src/resource/DbResource.ts:201](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L201)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:222](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L222)

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

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L214)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:923](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L923)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:206](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L206)

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

[src/resource/DbResource.ts:912](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L912)

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

[src/resource/DbResource.ts:265](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L265)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:262](https://github.com/l-v-yonsama/db-drivers/blob/78aaa63fec87f6b68799ea3a54430c6c4b24c0ad/src/resource/DbResource.ts#L262)
