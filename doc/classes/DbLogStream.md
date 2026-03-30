[@l-v-yonsama/multi-platform-database-drivers](../README.md) / [Exports](../modules.md) / DbLogStream

# Class: DbLogStream

## Hierarchy

- [`AwsDbResource`](AwsDbResource.md)\<\{ `creationTime`: `Date` ; `firstEventTimestamp`: `Date` ; `lastEventTimestamp`: `Date` ; `lastIngestionTime`: `Date`  }\>

  ↳ **`DbLogStream`**

## Table of contents

### Constructors

- [constructor](DbLogStream.md#constructor)

### Properties

- [attr](DbLogStream.md#attr)
- [children](DbLogStream.md#children)
- [comment](DbLogStream.md#comment)
- [id](DbLogStream.md#id)
- [isInProgress](DbLogStream.md#isinprogress)
- [meta](DbLogStream.md#meta)
- [name](DbLogStream.md#name)
- [resourceType](DbLogStream.md#resourcetype)

### Methods

- [addChild](DbLogStream.md#addchild)
- [clearChildren](DbLogStream.md#clearchildren)
- [findChildren](DbLogStream.md#findchildren)
- [getChildByName](DbLogStream.md#getchildbyname)
- [getProperties](DbLogStream.md#getproperties)
- [hasChildren](DbLogStream.md#haschildren)
- [setPropertyFormat](DbLogStream.md#setpropertyformat)
- [toJsonStringify](DbLogStream.md#tojsonstringify)
- [toString](DbLogStream.md#tostring)

## Constructors

### constructor

• **new DbLogStream**(`name`, `attr`): [`DbLogStream`](DbLogStream.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `attr` | `Object` |
| `attr.creationTime` | `Date` |
| `attr.firstEventTimestamp` | `Date` |
| `attr.lastEventTimestamp` | `Date` |
| `attr.lastIngestionTime` | `Date` |

#### Returns

[`DbLogStream`](DbLogStream.md)

#### Overrides

[AwsDbResource](AwsDbResource.md).[constructor](AwsDbResource.md#constructor)

#### Defined in

[src/resource/DbResource.ts:1203](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L1203)

## Properties

### attr

• `Readonly` **attr**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `creationTime` | `Date` |
| `firstEventTimestamp` | `Date` |
| `lastEventTimestamp` | `Date` |
| `lastIngestionTime` | `Date` |

#### Inherited from

[AwsDbResource](AwsDbResource.md).[attr](AwsDbResource.md#attr)

#### Defined in

[src/resource/DbResource.ts:938](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L938)

___

### children

• `Readonly` **children**: `any`[]

#### Inherited from

[AwsDbResource](AwsDbResource.md).[children](AwsDbResource.md#children)

#### Defined in

[src/resource/DbResource.ts:188](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L188)

___

### comment

• `Optional` **comment**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[comment](AwsDbResource.md#comment)

#### Defined in

[src/resource/DbResource.ts:187](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L187)

___

### id

• `Readonly` **id**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[id](AwsDbResource.md#id)

#### Defined in

[src/resource/DbResource.ts:184](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L184)

___

### isInProgress

• `Optional` **isInProgress**: `boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[isInProgress](AwsDbResource.md#isinprogress)

#### Defined in

[src/resource/DbResource.ts:190](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L190)

___

### meta

• **meta**: `Object`

#### Index signature

▪ [key: `string`]: `any`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[meta](AwsDbResource.md#meta)

#### Defined in

[src/resource/DbResource.ts:189](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L189)

___

### name

• `Readonly` **name**: `string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[name](AwsDbResource.md#name)

#### Defined in

[src/resource/DbResource.ts:186](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L186)

___

### resourceType

• `Readonly` **resourceType**: [`ResourceType`](../modules.md#resourcetype)

#### Inherited from

[AwsDbResource](AwsDbResource.md).[resourceType](AwsDbResource.md#resourcetype)

#### Defined in

[src/resource/DbResource.ts:185](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L185)

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

[src/resource/DbResource.ts:205](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L205)

___

### clearChildren

▸ **clearChildren**(): `void`

#### Returns

`void`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[clearChildren](AwsDbResource.md#clearchildren)

#### Defined in

[src/resource/DbResource.ts:214](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L214)

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

[src/resource/DbResource.ts:226](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L226)

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

[src/resource/DbResource.ts:218](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L218)

___

### getProperties

▸ **getProperties**(): `Object`

#### Returns

`Object`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[getProperties](AwsDbResource.md#getproperties)

#### Defined in

[src/resource/DbResource.ts:954](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L954)

___

### hasChildren

▸ **hasChildren**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[hasChildren](AwsDbResource.md#haschildren)

#### Defined in

[src/resource/DbResource.ts:210](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L210)

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

[src/resource/DbResource.ts:943](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L943)

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

[src/resource/DbResource.ts:269](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L269)

___

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[AwsDbResource](AwsDbResource.md).[toString](AwsDbResource.md#tostring)

#### Defined in

[src/resource/DbResource.ts:266](https://github.com/l-v-yonsama/db-drivers/blob/f445f518f13c04cf0cb1d41eb943c6c0820623d9/src/resource/DbResource.ts#L266)
